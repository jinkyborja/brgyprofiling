<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: ../index.html");
    exit();
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Family Information</title>
</head>
<body>

<h1>Family Information Page</h1>
<a href="dashboard.php">Back to Dashboard</a>

</body>
</html>
