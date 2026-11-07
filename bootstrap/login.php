<?php
require_once __DIR__ . '/../server/session.php';
startApplicationSession();
require_once __DIR__ . '/../server/config.php';

$data = json_decode(file_get_contents('php://input'), true);
$username = is_array($data) && is_string($data['username'] ?? null)
    ? trim($data['username'])
    : '';
$password = is_array($data) && is_string($data['password'] ?? null)
    ? $data['password']
    : '';

if ($username === '' || $password === '') {
    sendJsonResponse(400, [
        'status' => 'error',
        'message' => 'Username and password are required.',
    ]);
}

if (!$pdo instanceof PDO) {
    error_log('Login unavailable: ' . ($errorMessage ?? 'Database connection failed.'));
    sendJsonResponse(503, [
        'status' => 'error',
        'message' => 'Sign-in is temporarily unavailable. Please try again later.',
    ]);
}

try {
    $stmt = $pdo->prepare(
        'SELECT user_id, username, password_hash, account_status
         FROM users
         WHERE username = ?
         LIMIT 1'
    );
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password_hash'])) {
        sendJsonResponse(401, [
            'status' => 'error',
            'message' => 'Invalid username or password.',
        ]);
    }

    if ($user['account_status'] !== 'active') {
        sendJsonResponse(403, [
            'status' => 'error',
            'message' => $user['account_status'] === 'pending_approval'
                ? 'Your account request is awaiting administrator approval.'
                : 'This account is not currently allowed to sign in.',
        ]);
    }

    $roleStmt = $pdo->prepare(
        'SELECT r.role_code
         FROM user_roles AS ur
         JOIN roles AS r ON r.role_id = ur.role_id
         WHERE ur.user_id = ?
         ORDER BY FIELD(r.role_code, "admin", "staff", "resident")'
    );
    $roleStmt->execute([$user['user_id']]);
    $roles = $roleStmt->fetchAll(PDO::FETCH_COLUMN);

    if (!$roles) {
        error_log('Login denied: active account has no assigned role.');
        sendJsonResponse(403, [
            'status' => 'error',
            'message' => 'This account has no assigned portal role. Contact the administrator.',
        ]);
    }

    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $user['user_id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['roles'] = $roles;
    $_SESSION['role'] = $roles[0];

    sendJsonResponse(200, [
        'status' => 'success',
        'message' => 'Sign-in successful.',
        'redirect' => 'dashboard.php',
    ]);
} catch (PDOException $e) {
    error_log('Login query failed: ' . $e->getMessage());
    sendJsonResponse(500, [
        'status' => 'error',
        'message' => 'Sign-in could not be completed. Please try again.',
    ]);
}
