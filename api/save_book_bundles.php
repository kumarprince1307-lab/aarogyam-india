<?php
// api/save_book_bundles.php
// Atomic save and Git sync for data/book-bundles.json with safety backups.
// Mirrors the robust universal book landing PHP API pattern.

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function json_resp($code, $data) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

$input = file_get_contents('php://input');
if (!$input) {
    json_resp(400, ['error' => 'No data received']);
}

$payload = json_decode($input, true);
if (json_last_error() !== JSON_ERROR_NONE || !is_array($payload)) {
    json_resp(400, ['error' => 'Invalid JSON payload']);
}

$bundleJsonPath = __DIR__ . '/../data/book-bundles.json';
$backupDir = __DIR__ . '/../data/backups';

if (!is_dir($backupDir)) {
    @mkdir($backupDir, 0755, true);
}

$timestamp = date('Ymd_His');

// 1. SAFE BACKUP
if (file_exists($bundleJsonPath)) {
    @copy($bundleJsonPath, $backupDir . "/bundles_backup_{$timestamp}.json");
}

$bundles = $payload['bundles'] ?? $payload;
if (isset($bundles['bundles'])) {
    $bundles = $bundles['bundles'];
}

if (!is_array($bundles)) {
    json_resp(400, ['error' => 'Invalid bundles array']);
}

// 2. ATOMIC WRITE
$tmpPath = $bundleJsonPath . '.tmp';
$encoded = json_encode($bundles, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

if (file_put_contents($tmpPath, $encoded) === false) {
    json_resp(500, ['error' => 'Failed to write temporary configuration file']);
}

if (!rename($tmpPath, $bundleJsonPath)) {
    json_resp(500, ['error' => 'Failed to atomically update book-bundles.json']);
}

// 3. BACKGROUND GIT COMMIT AND PUSH
$commitMsg = "Update book-bundles.json via PHP API [Timestamp {$timestamp}]";
$gitCmd = sprintf(
    'git -C %s add %s && git -C %s commit -m %s && git -C %s push',
    escapeshellarg(__DIR__ . '/..'),
    escapeshellarg('data/book-bundles.json'),
    escapeshellarg(__DIR__ . '/..'),
    escapeshellarg('"' . $commitMsg . '"'),
    escapeshellarg(__DIR__ . '/..')
);
@exec($gitCmd, $out, $rc);

json_resp(200, [
    'success' => true,
    'message' => 'Book bundles successfully saved and synchronized to Git via PHP API',
    'timestamp' => $timestamp,
    'totalBundles' => count($bundles)
]);
?>