<?php
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
// If payload contains a 'recording' object, append it; otherwise replace whole file
if (isset($data['recording'])) {
    $newRec = $data['recording'];
    $existing = [];
    if (file_exists($targetPath)) {
        $existing = json_decode(file_get_contents($targetPath), true) ?? [];
    }
    if (!is_array($existing)) $existing = [];
    $existing[] = $newRec;
    $json = json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    $commitMsg = 'Add webinar recording: ' . ($newRec['title'] ?? 'Untitled');
} else {
    // Full array payload – overwrite
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    $commitMsg = 'Update webinar recordings';
}
if (file_put_contents($targetPath, $json) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to write file']);
    exit;
}
// Git sync – add, commit, push (if Git is configured)
$gitCmd = sprintf(
    'git -C %s add %s && git -C %s commit -m %s && git -C %s push',
    escapeshellarg(__DIR__),
    escapeshellarg('data/webinar-recordings.json'),
    escapeshellarg(__DIR__),
    escapeshellarg('"' . $commitMsg . '"'),
    escapeshellarg(__DIR__)
);
exec($gitCmd, $out, $rc);
if ($rc !== 0) {
    error_log('Git sync failed: ' . implode("\n", $out));
}

echo json_encode(['status' => 'ok']);
?>
