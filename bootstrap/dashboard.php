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
    <title>Dashboard</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>

<h1>Welcome, <?php echo htmlspecialchars($_SESSION['username']); ?>!</h1>

<div class="sidebar">
    <div class="menu-item" onclick="location.href='dashboard.php'">Dashboard</div>
    <div class="menu-item" onclick="location.href='family.php'">Family Information</div>
    <div class="menu-item" onclick="location.href='resident.php'">Resident Information</div>
    <div class="menu-item" onclick="location.href='official.php'">Barangay Official</div>
    <div class="menu-item" onclick="location.href='info.php'">Barangay Info</div>
    <div class="menu-item" onclick="location.href='certificate.php'">Certificate Information</div>
    <div class="menu-item" onclick="location.href='logout.php'">Logout</div>
</div>

</body>
</html>
