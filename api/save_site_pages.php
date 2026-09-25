<?php
// api/save_site_pages.php
// Atomic save and Git sync for site-pages-config.json with safety backups.
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

$pagesJsonPath = __DIR__ . '/../data/site-pages-config.json';
$backupDir = __DIR__ . '/../data/backups';

if (!is_dir($backupDir)) {
    @mkdir($backupDir, 0755, true);
}

$timestamp = date('Ymd_His');

// 1. SAFE BACKUP OF CURRENT CONFIG
if (file_exists($pagesJsonPath)) {
    @copy($pagesJsonPath, $backupDir . "/site_pages_backup_{$timestamp}.json");
}

$incomingPages = null;

if (isset($payload['sitePages']) && is_array($payload['sitePages'])) {
    $incomingPages = $payload['sitePages'];
} elseif (isset($payload['pageData']) && is_array($payload['pageData']) && isset($payload['pageData']['id'])) {
    // Single page update: merge with existing config
    $singlePage = $payload['pageData'];
    $existingConfig = ['sitePages' => []];
    if (file_exists($pagesJsonPath)) {
        $decoded = json_decode(file_get_contents($pagesJsonPath), true);
        if (isset($decoded['sitePages']) && is_array($decoded['sitePages'])) {
            $existingConfig = $decoded;
        }
    }
    $pageIdx = -1;
    foreach ($existingConfig['sitePages'] as $idx => $p) {
        if (isset($p['id']) && $p['id'] === $singlePage['id']) {
            $pageIdx = $idx;
            break;
        }
    }
    if ($pageIdx >= 0) {
        $existingConfig['sitePages'][$pageIdx] = $singlePage;
    } else {
        $existingConfig['sitePages'][] = $singlePage;
    }
    $incomingPages = $existingConfig['sitePages'];
}

if (!$incomingPages) {
    json_resp(400, ['error' => 'Missing sitePages array or valid pageData']);
}

// 2. ATOMIC WRITE VIA TEMPORARY FILE
$newConfig = ['sitePages' => $incomingPages];
$tmpPath = $pagesJsonPath . '.tmp';
$encoded = json_encode($newConfig, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

if (file_put_contents($tmpPath, $encoded) === false) {
    json_resp(500, ['error' => 'Failed to write temporary configuration file']);
}

if (!rename($tmpPath, $pagesJsonPath)) {
    json_resp(500, ['error' => 'Failed to atomically update site-pages-config.json']);
}

// 3. BACKGROUND GIT COMMIT AND PUSH
$commitMsg = "Update site-pages-config.json via PHP API [Timestamp {$timestamp}]";
$gitCmd = sprintf(
    'git -C %s add %s && git -C %s commit -m %s && git -C %s push',
    escapeshellarg(__DIR__ . '/..'),
    escapeshellarg('data/site-pages-config.json'),
    escapeshellarg(__DIR__ . '/..'),
    escapeshellarg('"' . $commitMsg . '"'),
    escapeshellarg(__DIR__ . '/..')
);
@exec($gitCmd, $out, $rc);

json_resp(200, [
    'success' => true,
    'message' => 'Site pages config successfully saved and synchronized via PHP API',
    'timestamp' => $timestamp,
    'totalPages' => count($incomingPages)
]);
