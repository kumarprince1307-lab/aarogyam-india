<?php
// save-recordings.php – receives JSON payload and overwrites data/webinar-recordings.json on the server
header('Content-Type: application/json');
$input = file_get_contents('php://input');
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'No data received']);
    exit;
}
$data = json_decode($input, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}
$targetPath = __DIR__ . '/data/webinar-recordings.json';
$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if (file_put_contents($targetPath, $json) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to write file']);
    exit;
}
echo json_encode(['status' => 'ok']);
?>
