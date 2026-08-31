<?php
// api/save_book_landing.php
// Handles atomic save and sync of book landing pages and catalog into JSON files with safety backups.

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function json_resp($code, $data) {
    http_response_code($code);
    header('Content-Type: application/json');
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

$pageData = $payload['pageData'] ?? null;
$bookData = $payload['bookData'] ?? null;

if (!$pageData || !isset($pageData['id']) || empty(trim($pageData['id']))) {
    json_resp(400, ['error' => 'Missing pageData or book ID']);
}

$bookId = strtoupper(trim($pageData['id']));

$booksJsonPath = __DIR__ . '/../data/books.json';
$landingJsonPath = __DIR__ . '/../data/universal-book-landing-pages.json';
$backupDir = __DIR__ . '/../data/backups';

if (!is_dir($backupDir)) {
    mkdir($backupDir, 0755, true);
}

$timestamp = date('Ymd_His');

// 1. SAFE BACKUP
if (file_exists($booksJsonPath)) {
    copy($booksJsonPath, $backupDir . "/books_backup_{$timestamp}.json");
}
if (file_exists($landingJsonPath)) {
    copy($landingJsonPath, $backupDir . "/landing_backup_{$timestamp}.json");
}

// 2. READ & UPDATE universal-book-landing-pages.json
$landingData = ['bookLandingPages' => []];
if (file_exists($landingJsonPath)) {
    $decoded = json_decode(file_get_contents($landingJsonPath), true);
    if (isset($decoded['bookLandingPages']) && is_array($decoded['bookLandingPages'])) {
        $landingData = $decoded;
    }
}

$existingLpIdx = -1;
foreach ($landingData['bookLandingPages'] as $idx => $lp) {
    if (isset($lp['id']) && strtoupper(trim($lp['id'])) === $bookId) {
        $existingLpIdx = $idx;
        break;
    }
}

if ($existingLpIdx >= 0) {
    // Modify only this record
    $landingData['bookLandingPages'][$existingLpIdx] = $pageData;
} else {
    // Append or prepend new record
    $landingData['bookLandingPages'][] = $pageData;
}

$tmpLanding = $landingJsonPath . '.tmp';
file_put_contents($tmpLanding, json_encode($landingData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
rename($tmpLanding, $landingJsonPath);

// 3. READ & UPDATE books.json
$booksData = ['books' => []];
if (file_exists($booksJsonPath)) {
    $decoded = json_decode(file_get_contents($booksJsonPath), true);
    if (isset($decoded['books']) && is_array($decoded['books'])) {
        $booksData = $decoded;
    }
}

if ($bookData && is_array($bookData)) {
    $existingBookIdx = -1;
    foreach ($booksData['books'] as $idx => $b) {
        if (isset($b['id']) && strtoupper(trim($b['id'])) === $bookId) {
            $existingBookIdx = $idx;
            break;
        }
    }

    if ($existingBookIdx >= 0) {
        // Protect BK001 and BK002 core integrity if updating them
        if ($bookId === 'BK001' || $bookId === 'BK002') {
            // Merge with existing record to keep all core fields intact
            $booksData['books'][$existingBookIdx] = array_merge($booksData['books'][$existingBookIdx], $bookData);
        } else {
            $booksData['books'][$existingBookIdx] = $bookData;
        }
    } else {
        $booksData['books'][] = $bookData;
    }

    $tmpBooks = $booksJsonPath . '.tmp';
    file_put_contents($tmpBooks, json_encode($booksData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    rename($tmpBooks, $booksJsonPath);
}

// 4. GIT SYNC IF CONFIGURED (Safe background execution)
$commitMsg = "Publish book {$bookId} landing page and catalog update";
$gitCmd = sprintf(
    'git -C %s add %s %s && git -C %s commit -m %s && git -C %s push',
    escapeshellarg(__DIR__ . '/..'),
    escapeshellarg('data/books.json'),
    escapeshellarg('data/universal-book-landing-pages.json'),
    escapeshellarg(__DIR__ . '/..'),
    escapeshellarg('"' . $commitMsg . '"'),
    escapeshellarg(__DIR__ . '/..')
);
@exec($gitCmd, $out, $rc);

json_resp(200, [
    'success' => true,
    'message' => "Book {$bookId} saved successfully to server JSON and catalog",
    'bookId' => $bookId
]);
?>
