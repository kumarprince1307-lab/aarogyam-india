<?php
// api/upload_book_landing.php
// Handles PDF/DOC uploads for book landing pages with safe JSON update and backup.

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$UPLOAD_DIR = __DIR__ . '/../uploads/books';
if (!is_dir($UPLOAD_DIR)) {
    mkdir($UPLOAD_DIR, 0755, true);
}

function json_resp($code, $data) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

$bookId = $_POST['bookId'] ?? '';
$section = $_POST['section'] ?? '';

// Normalize section aliases
if ($section === 'sec_pdf_main') $section = 'main';
if ($section === 'sec_pdf_free') $section = 'free';

if (!$bookId || !in_array($section, ['main', 'free'])) {
    json_resp(400, ['error' => 'Invalid bookId or section. Allowed sections: main, free, sec_pdf_main, sec_pdf_free']);
}
$bookId = strtoupper(trim($bookId));

$fileUrl = '';
if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $tmp = $_FILES['file']['tmp_name'];
    $origName = basename($_FILES['file']['name']);
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    $allowed = ['pdf', 'doc', 'docx'];
    if (!in_array($ext, $allowed)) {
        json_resp(400, ['error' => 'Unsupported file type. Only PDF, DOC, and DOCX are allowed.']);
    }
    if ($_FILES['file']['size'] > 100 * 1024 * 1024) {
        json_resp(400, ['error' => 'File too large (max 100MB)']);
    }
    $timestamp = time();
    $newName = $bookId . '_' . $section . '_' . $timestamp . '.' . $ext;
    $dest = $UPLOAD_DIR . '/' . $newName;
    if (!move_uploaded_file($tmp, $dest)) {
        json_resp(500, ['error' => 'Failed to move uploaded file to server directory']);
    }
    $fileUrl = '/uploads/books/' . $newName;
} elseif (!empty($_POST['url'])) {
    $url = trim($_POST['url']);
    $fileUrl = $url;
} else {
    json_resp(400, ['error' => 'No file or URL provided']);
}

$booksJsonPath = __DIR__ . '/../data/books.json';
$landingJsonPath = __DIR__ . '/../data/universal-book-landing-pages.json';
$backupDir = __DIR__ . '/../data/backups';

if (!is_dir($backupDir)) {
    mkdir($backupDir, 0755, true);
}

$timestamp = date('Ymd_His');
if (file_exists($booksJsonPath)) {
    copy($booksJsonPath, $backupDir . "/books_{$timestamp}.json");
}
if (file_exists($landingJsonPath)) {
    copy($landingJsonPath, $backupDir . "/landing_{$timestamp}.json");
}

// Update books.json if book exists
if (file_exists($booksJsonPath)) {
    $booksData = json_decode(file_get_contents($booksJsonPath), true);
    if (isset($booksData['books']) && is_array($booksData['books'])) {
        $updated = false;
        foreach ($booksData['books'] as &$book) {
            if (isset($book['id']) && strtoupper(trim($book['id'])) === $bookId) {
                if ($section === 'main') {
                    $book['mainPdf'] = $fileUrl;
                    $book['pdf_url'] = $fileUrl;
                } else {
                    $book['freePdf'] = $fileUrl;
                    $book['demoPdf'] = $fileUrl;
                }
                $updated = true;
                break;
            }
        }
        if ($updated) {
            $tempPath = $booksJsonPath . '.tmp';
            file_put_contents($tempPath, json_encode($booksData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
            rename($tempPath, $booksJsonPath);
        }
    }
}

// Update universal-book-landing-pages.json if book exists
if (file_exists($landingJsonPath)) {
    $landingData = json_decode(file_get_contents($landingJsonPath), true);
    if (isset($landingData['bookLandingPages']) && is_array($landingData['bookLandingPages'])) {
        $lpUpdated = false;
        foreach ($landingData['bookLandingPages'] as &$lp) {
            if (isset($lp['id']) && strtoupper(trim($lp['id'])) === $bookId) {
                if ($section === 'main') {
                    $lp['mainPdf'] = $fileUrl;
                    $lp['main_pdf'] = $fileUrl;
                } else {
                    $lp['freePdf'] = $fileUrl;
                    $lp['free_pdf'] = $fileUrl;
                    $lp['demoPdf'] = $fileUrl;
                }
                $lpUpdated = true;
                break;
            }
        }
        if ($lpUpdated) {
            $tmpLp = $landingJsonPath . '.tmp';
            file_put_contents($tmpLp, json_encode($landingData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
            rename($tmpLp, $landingJsonPath);
        }
    }
}

json_resp(200, [
    'success' => true,
    'message' => 'File uploaded and saved successfully',
    'fileUrl' => $fileUrl,
    'bookId' => $bookId,
    'section' => $section
]);
?>
