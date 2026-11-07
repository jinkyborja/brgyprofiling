<?php
header("Content-Type: application/json");
session_start();

require_once __DIR__ . '/../server/config.php';

$data = json_decode(file_get_contents("php://input"), true);
$username = is_array($data) ? trim($data['username'] ?? '') : '';
$password = is_array($data) && is_string($data['password'] ?? null) ? $data['password'] : '';

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Username and password are required."
    ]);
    exit();
}

if (!$pdo instanceof PDO) {
    error_log('Login unavailable: ' . ($errorMessage ?? 'Database connection failed.'));
    http_response_code(503);
    echo json_encode([
        "status" => "error",
        "message" => "Sign-in is temporarily unavailable. Please try again later."
    ]);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];

        echo json_encode([
            "status" => "success",
            "message" => "Login successful"
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "message" => "Invalid username or password"
        ]);
    }
} catch (PDOException $e) {
    error_log('Login query failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Sign-in could not be completed. Please try again."
    ]);
}
?>
