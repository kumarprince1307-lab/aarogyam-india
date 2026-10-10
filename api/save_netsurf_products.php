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

// 2.5 CROSS-SYNC WITH SITE-PAGES-CONFIG.JSON
$sitePagesPath = __DIR__ . '/../data/site-pages-config.json';
if (file_exists($sitePagesPath)) {
    try {
        $spData = json_decode(file_get_contents($sitePagesPath), true);
        if ($spData && isset($spData['sitePages']) && is_array($spData['sitePages'])) {
            $masterMap = [];
            foreach ($products as $mp) {
                if (!empty($mp['id'])) {
                    $masterMap[strtolower($mp['id'])] = $mp;
                }
                if (!empty($mp['name'])) {
                    $masterMap[strtolower(trim($mp['name']))] = $mp;
                }
            }

            $spModified = false;
            foreach ($spData['sitePages'] as &$page) {
                $pid = $page['id'] ?? '';
                $slug = $page['slug'] ?? '';
                
                // Pashu Palan Cattle page sync
                if ($pid === 'page_cattle_care' || $slug === 'pashu-palan') {
                    $cattleProds = [];
                    foreach ($products as $mp) {
                        if (($mp['category'] ?? '') === 'cattle') {
                            $mrp = floatval($mp['mrp'] ?? 0);
                            $disc = floatval($mp['discount_pct'] ?? 0);
                            $price = ($disc > 0) ? round($mrp * (1 - $disc / 100)) : ($mp['discounted_price'] ?? $mrp);
                            $cattleProds[] = [
                                'id' => $mp['id'],
                                'title' => $mp['name'],
                                'name' => $mp['name'],
                                'description' => $mp['description'] ?? '',
                                'image' => $mp['image'] ?? '',
                                'mrp' => $mrp,
                                'price' => $price,
                                'discount_pct' => $disc,
                                'pack_size' => $mp['pack_size'] ?? '',
                                'dose' => $mp['dose'] ?? '',
                                'badge' => $mp['badge'] ?? '🐄 पशु पोषण',
                                'whatsapp_link' => 'https://wa.me/917974422572'
                            ];
                        }
                    }
                    if (!empty($cattleProds)) {
                        $page['products'] = $cattleProds;
                        $spModified = true;
                    }
                }
                // Health Hub page sync
                elseif ($pid === 'page_health' || $slug === 'health') {
                    $healthProds = [];
                    foreach ($products as $mp) {
                        if (($mp['category'] ?? '') === 'health') {
                            $mrp = floatval($mp['mrp'] ?? 0);
                            $disc = floatval($mp['discount_pct'] ?? 0);
                            $price = ($disc > 0) ? round($mrp * (1 - $disc / 100)) : ($mp['discounted_price'] ?? $mrp);
                            $healthProds[] = [
                                'id' => $mp['id'],
                                'title' => $mp['name'],
                                'name' => $mp['name'],
                                'description' => $mp['description'] ?? '',
                                'image' => $mp['image'] ?? '',
                                'mrp' => $mrp,
                                'price' => $price,
                                'discount_pct' => $disc,
                                'pack_size' => $mp['pack_size'] ?? '',
                                'dose' => $mp['dose'] ?? '',
                                'badge' => $mp['badge'] ?? '🌿 स्वास्थ्य नेचुरामोरे',
                                'whatsapp_link' => 'https://wa.me/917974422572'
                            ];
                        }
                    }
                    if (!empty($healthProds)) {
                        $page['products'] = $healthProds;
                        $spModified = true;
                    }
                }
                // Individual health disease & other pages: sync existing products with master
                elseif (isset($page['products']) && is_array($page['products']) && count($page['products']) > 0) {
                    foreach ($page['products'] as &$p) {
                        $pKeyId = !empty($p['id']) ? strtolower($p['id']) : '';
                        $pKeyTitle = !empty($p['title']) ? strtolower(trim($p['title'])) : '';
                        $pKeyName = !empty($p['name']) ? strtolower(trim($p['name'])) : '';
                        $mMatch = null;
                        if ($pKeyId && isset($masterMap[$pKeyId])) $mMatch = $masterMap[$pKeyId];
                        elseif ($pKeyName && isset($masterMap[$pKeyName])) $mMatch = $masterMap[$pKeyName];
                        elseif ($pKeyTitle && isset($masterMap[$pKeyTitle])) $mMatch = $masterMap[$pKeyTitle];

                        if ($mMatch) {
                            $mrp = floatval($mMatch['mrp'] ?? $p['mrp'] ?? 0);
                            $disc = floatval($mMatch['discount_pct'] ?? 0);
                            $price = ($disc > 0) ? round($mrp * (1 - $disc / 100)) : ($mMatch['discounted_price'] ?? $mrp);
                            $p['id'] = $mMatch['id'];
                            $p['title'] = $mMatch['name'];
                            $p['name'] = $mMatch['name'];
                            $p['mrp'] = $mrp;
                            $p['price'] = $price;
                            $p['discount_pct'] = $disc;
                            if (!empty($mMatch['pack_size'])) $p['pack_size'] = $mMatch['pack_size'];
                            if (!empty($mMatch['dose'])) $p['dose'] = $mMatch['dose'];
                            if (!empty($mMatch['badge'])) $p['badge'] = $mMatch['badge'];
                            if (!empty($mMatch['image']) && strpos($mMatch['image'], 'logo.png') === false) $p['image'] = $mMatch['image'];
                            $spModified = true;
                        }
                    }
                }
            }
            unset($page);

            if ($spModified) {
                $spTmpPath = $sitePagesPath . '.tmp';
                $spEncoded = json_encode($spData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
                if (file_put_contents($spTmpPath, $spEncoded) !== false) {
                    rename($spTmpPath, $sitePagesPath);
                }
            }
        }
    } catch (\Exception $e) {}
}

// 3. BACKGROUND GIT COMMIT AND PUSH
$commitMsg = "Update netsurf-products-master.json and sync site-pages-config.json [Timestamp {$timestamp}]";
$gitCmd = sprintf(
    'git -C %s add %s %s && git -C %s commit -m %s && git -C %s push',
    escapeshellarg(__DIR__ . '/..'),
    escapeshellarg('data/netsurf-products-master.json'),
    escapeshellarg('data/site-pages-config.json'),
    escapeshellarg(__DIR__ . '/..'),
    escapeshellarg('"' . $commitMsg . '"'),
    escapeshellarg(__DIR__ . '/..')
);

// Execute non-blocking or standard
@exec($gitCmd . ' 2>&1', $output, $returnCode);

json_resp(200, [
    'success' => true,
    'message' => 'Netsurf Products Master safely saved and site-pages-config.json synced.',
    'total_products' => count($products),
    'timestamp' => $timestamp,
    'gitPushed' => ($returnCode === 0)
]);
