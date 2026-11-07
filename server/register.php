<?php
require_once __DIR__ . '/session.php';
startApplicationSession();
require_once __DIR__ . '/config.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    sendJsonResponse(400, [
        'status' => 'error',
        'message' => 'Please submit a valid account request.',
    ]);
}

$firstName = trim(is_string($data['first_name'] ?? null) ? $data['first_name'] : '');
$lastName = trim(is_string($data['last_name'] ?? null) ? $data['last_name'] : '');
$email = strtolower(trim(is_string($data['email'] ?? null) ? $data['email'] : ''));
$username = trim(is_string($data['username'] ?? null) ? $data['username'] : '');
$password = is_string($data['password'] ?? null) ? $data['password'] : '';

if (
    $firstName === '' || strlen($firstName) > 100
    || $lastName === '' || strlen($lastName) > 100
    || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254
    || !preg_match('/\A[A-Za-z0-9._-]{3,80}\z/', $username)
    || strlen($password) < 12 || strlen($password) > 72
) {
    sendJsonResponse(422, [
        'status' => 'error',
        'message' => 'Check the required fields. Use a valid email, a 3–80 character username, and a password of 12–72 bytes.',
    ]);
}

if (!$pdo instanceof PDO) {
    error_log('Registration unavailable: ' . ($errorMessage ?? 'Database connection failed.'));
    sendJsonResponse(503, [
        'status' => 'error',
        'message' => 'Account requests are temporarily unavailable. Please try again later.',
    ]);
}

try {
    $pdo->beginTransaction();

    $userStmt = $pdo->prepare(
        "INSERT INTO users (username, email, password_hash, account_status)
         VALUES (?, ?, ?, 'pending_approval')"
    );
    $userStmt->execute([
        $username,
        $email,
        password_hash($password, PASSWORD_DEFAULT),
    ]);
    $userId = (int) $pdo->lastInsertId();

    $residentStmt = $pdo->prepare(
        "INSERT INTO residents (
            user_id, resident_code, first_name, last_name, verification_status
         ) VALUES (?, ?, ?, ?, 'pending_review')"
    );
    $residentStmt->execute([
        $userId,
        'R-' . strtoupper(bin2hex(random_bytes(12))),
        $firstName,
        $lastName,
    ]);

    $roleStmt = $pdo->prepare(
        "INSERT INTO user_roles (user_id, role_id)
         SELECT ?, role_id
         FROM roles
         WHERE role_code = 'resident'"
    );
    $roleStmt->execute([$userId]);

    if ($roleStmt->rowCount() !== 1) {
        throw new RuntimeException('The resident role is missing from the database.');
    }

    $pdo->commit();
    sendJsonResponse(201, [
        'status' => 'success',
        'message' => 'Your resident account request was submitted. You can sign in after an administrator approves it.',
    ]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    if ($e->getCode() === '23000') {
        sendJsonResponse(409, [
            'status' => 'error',
            'message' => 'That username or email is already in use.',
        ]);
    }

    error_log('Registration query failed: ' . $e->getMessage());
    sendJsonResponse(500, [
        'status' => 'error',
        'message' => 'Your account request could not be completed. Please try again.',
    ]);
} catch (RuntimeException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('Registration setup failed: ' . $e->getMessage());
    sendJsonResponse(503, [
        'status' => 'error',
        'message' => 'Account requests are not configured. Please contact the administrator.',
    ]);
}
