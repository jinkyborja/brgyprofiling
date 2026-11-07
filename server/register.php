<?php
header('Content-Type: application/json');

http_response_code(403);
echo json_encode([
    'status' => 'error',
    'message' => 'Public account creation is closed. Please contact the barangay administrator.'
]);
?>
