<?php
$pdo = null;
$errorMessage = null;

$host = getenv('mysql-209807d4-jinkyborja.g.aivencloud.com');
$port = getenv('21576');
$db = getenv('defaultdb');
$user = getenv('avnadmin');
$pass = getenv('password');
$sslCa = getenv('c:\Users\1\Downloads\ca (6).pem');

$requiredSettings = [
    'DB_HOST' => $host,
    'DB_PORT' => $port,
    'DB_NAME' => $db,
    'DB_USER' => $user,
    'DB_PASSWORD' => $pass,
    'DB_SSL_CA' => $sslCa,
];

$missingSettings = [];
foreach ($requiredSettings as $name => $value) {
    if ($value === false || $value === '') {
        $missingSettings[] = $name;
    }
}

if ($missingSettings) {
    $errorMessage = 'Missing database environment settings: ' . implode(', ', $missingSettings);
} elseif (!extension_loaded('pdo_mysql')) {
    $errorMessage = 'The PHP pdo_mysql extension is not enabled.';
} elseif (!is_file($sslCa) || !is_readable($sslCa)) {
    $errorMessage = 'The configured database CA certificate is missing or unreadable.';
} elseif (!defined('PDO::MYSQL_ATTR_SSL_CA') || !defined('PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT')) {
    $errorMessage = 'This PHP pdo_mysql build does not support verified MySQL TLS connections.';
} elseif (!ctype_digit($port) || (int) $port < 1 || (int) $port > 65535) {
    $errorMessage = 'DB_PORT must be a valid TCP port.';
} elseif (strpbrk($host, ";\0\r\n") !== false || strpbrk($db, ";\0\r\n") !== false) {
    $errorMessage = 'DB_HOST and DB_NAME contain invalid connection string characters.';
} else {
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $host,
        (int) $port,
        $db
    );
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_SSL_CA => $sslCa,
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => true,
    ];

    try {
        $pdo = new PDO($dsn, $user, $pass, $options);
        $pdo->exec("SET time_zone = '+00:00'");
    } catch (PDOException $e) {
        error_log('Database connection failed: ' . $e->getMessage());
        $errorMessage = 'Database connection failed. Check the Aiven connection settings and CA certificate.';
        $pdo = null;
    }
}
?>
