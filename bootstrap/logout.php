<?php
session_start();
session_unset();
session_destroy();
header("HTTP/1.1 200 OK");
exit();
?>
