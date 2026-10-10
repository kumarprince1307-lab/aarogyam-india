<?php
// api/save_netsurf_products.php
// Atomic save and Git sync for netsurf-products-master.json with safety backups.
// Supports multi-device admin synchronization (Mobile & Desktop).

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

$productsJsonPath = __DIR__ . '/../data/netsurf-products-master.json';
$backupDir = __DIR__ . '/../data/backups';

if (!is_dir($backupDir)) {
    @mkdir($backupDir, 0755, true);
}

$timestamp = date('Ymd_His');

// 1. SAFE BACKUP OF CURRENT CONFIG
if (file_exists($productsJsonPath)) {
    @copy($productsJsonPath, $backupDir . "/netsurf_products_backup_{$timestamp}.json");
}

$products = null;
$categories = null;
$catalogSettings = null;

// Support single product save or batch save
if (isset($payload['product']) && is_array($payload['product'])) {
    $singleProd = $payload['product'];
    $curData = file_exists($productsJsonPath) ? json_decode(file_get_contents($productsJsonPath), true) : [];
    $existingProducts = $curData['products'] ?? [];
    $found = false;
    if (!empty($singleProd['id'])) {
        foreach ($existingProducts as $k => $item) {
            if (isset($item['id']) && $item['id'] === $singleProd['id']) {
                $existingProducts[$k] = $singleProd;
                $found = true;
                break;
            }
        }
    }
    if (!$found) {
        array_unshift($existingProducts, $singleProd);
    }
    $products = $existingProducts;
    $categories = $payload['categories'] ?? ($curData['categories'] ?? []);
    $catalogSettings = $payload['catalog_settings'] ?? ($curData['catalog_settings'] ?? null);
} elseif (isset($payload['products']) && is_array($payload['products'])) {
    $products = $payload['products'];
    $categories = $payload['categories'] ?? [];
    $catalogSettings = $payload['catalog_settings'] ?? null;
} elseif (isset($payload['masterPayload']) && is_array($payload['masterPayload'])) {
    $products = $payload['masterPayload']['products'] ?? [];
    $categories = $payload['masterPayload']['categories'] ?? [];
    $catalogSettings = $payload['masterPayload']['catalog_settings'] ?? null;
}

// Fallback to existing catalog_settings if not in incoming payload
if (!$catalogSettings && file_exists($productsJsonPath)) {
    try {
        $cur = json_decode(file_get_contents($productsJsonPath), true);
        if (isset($cur['catalog_settings'])) {
            $catalogSettings = $cur['catalog_settings'];
        }
    } catch (\Exception $e) {}
}

if (!$products) {
    json_resp(400, ['error' => 'Missing products array']);
}

// 2. BUILD MASTER PAYLOAD
$newPayload = [
    'version' => '2026.3',
    'updated_at' => date('c'),
    'total_products' => count($products),
    'categories' => $categories,
    'catalog_settings' => $catalogSettings,
    'products' => $products
];

$tmpPath = $productsJsonPath . '.tmp';
$encoded = json_encode($newPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

if (file_put_contents($tmpPath, $encoded) === false) {
    json_resp(500, ['error' => 'Failed to write temporary configuration file']);
}

if (!rename($tmpPath, $productsJsonPath)) {
    json_resp(500, ['error' => 'Failed to atomically update netsurf-products-master.json']);
}

// 3. BACKGROUND GIT COMMIT AND PUSH
$commitMsg = "Update netsurf-products-master.json via PHP API [Timestamp {$timestamp}]";
$gitCmd = sprintf(
    'git -C %s add %s && git -C %s commit -m %s && git -C %s push',
    escapeshellarg(__DIR__ . '/..'),
    escapeshellarg('data/netsurf-products-master.json'),
    escapeshellarg(__DIR__ . '/..'),
    escapeshellarg('"' . $commitMsg . '"'),
    escapeshellarg(__DIR__ . '/..')
);

// Execute non-blocking or standard
@exec($gitCmd . ' 2>&1', $output, $returnCode);

json_resp(200, [
    'success' => true,
    'message' => 'Netsurf Products Master safely saved to server disk and repository.',
    'total_products' => count($products),
    'timestamp' => $timestamp,
    'gitPushed' => ($returnCode === 0)
]);
