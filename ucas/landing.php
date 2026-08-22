<?php
// Dynamic Server-Side Open Graph Meta Resolver for Facebook & WhatsApp Crawlers
$reqYt = isset($_GET['yt']) ? trim($_GET['yt']) : (isset($_GET['v']) ? trim($_GET['v']) : (isset($_GET['video']) ? trim($_GET['video']) : ''));
$reqTitle = isset($_GET['title']) ? trim($_GET['title']) : '';
$reqThumb = isset($_GET['thumb']) ? trim($_GET['thumb']) : (isset($_GET['img']) ? trim($_GET['img']) : (isset($_GET['thumbnail']) ? trim($_GET['thumbnail']) : ''));
$reqDesc = isset($_GET['desc']) ? trim($_GET['desc']) : (isset($_GET['msg']) ? trim($_GET['msg']) : (isset($_GET['message']) ? trim($_GET['message']) : ''));

// Extract 11-char YouTube ID if present
$ytId = '';
if (!empty($reqYt) && preg_match('/^[a-zA-Z0-9_-]{11}$/', $reqYt)) {
    $ytId = $reqYt;
} elseif (!empty($reqThumb) && preg_match('/(?:img\.youtube\.com|i\.ytimg\.com)\/vi\/([a-zA-Z0-9_-]{11})/i', $reqThumb, $matches)) {
    $ytId = $matches[1];
} elseif (!empty($_SERVER['REQUEST_URI']) && preg_match('/(?:[?&]v=|youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/)|[?&]yt=)([a-zA-Z0-9_-]{11})/i', $_SERVER['REQUEST_URI'], $matches)) {
    $ytId = $matches[1];
}

// Determine dynamic values
if (!empty($ytId)) {
    $finalThumb = "https://i.ytimg.com/vi/{$ytId}/hqdefault.jpg";
} elseif (!empty($reqThumb) && strpos($reqThumb, 'data:') !== 0) {
    $finalThumb = $reqThumb;
} else {
    $finalThumb = "https://aarogyamindia.online/images/logo/logo.png";
}

$finalTitle = !empty($reqTitle) ? htmlspecialchars($reqTitle, ENT_QUOTES, 'UTF-8') : "Aarogyam India — महत्वपूर्ण सूचना एवं जानकारी";
$finalDesc = !empty($reqDesc) ? htmlspecialchars($reqDesc, ENT_QUOTES, 'UTF-8') : "Aarogyam India में आपका स्वागत है। प्रामाणिक जानकारी, समाधान और परामर्श के लिए अभी देखें।";
$finalUrl = "https://" . ($_SERVER['HTTP_HOST'] ?? 'aarogyamindia.online') . ($_SERVER['REQUEST_URI'] ?? '/ucas/landing.php');
?>
<!DOCTYPE html>
<html lang="hi" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title><?php echo $finalTitle; ?> — Aarogyam India</title>

  <!-- Server-Rendered Open Graph Tags for Facebook & WhatsApp Crawlers -->
  <meta property="fb:app_id" content="966242223397117">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Aarogyam India">
  <meta property="og:title" id="og_title" content="<?php echo $finalTitle; ?>">
  <meta property="og:description" id="og_desc" content="<?php echo $finalDesc; ?>">
  <meta property="og:image" id="og_image" content="<?php echo $finalThumb; ?>">
  <meta property="og:image:secure_url" id="og_image_secure" content="<?php echo $finalThumb; ?>">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" id="og_image_alt" content="<?php echo $finalTitle; ?>">
  <meta property="og:url" id="og_url" content="<?php echo $finalUrl; ?>">
  <link rel="image_src" id="link_image_src" href="<?php echo $finalThumb; ?>">

  <!-- Server-Rendered Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@AarogyamIndia">
  <meta name="twitter:title" id="tw_title" content="<?php echo $finalTitle; ?>">
  <meta name="twitter:description" id="tw_desc" content="<?php echo $finalDesc; ?>">
  <meta name="twitter:image" id="tw_image" content="<?php echo $finalThumb; ?>">

  <!-- Fonts & FontAwesome Icons -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

  <style>
    :root {
      --primary: #0B7A3E;
      --primary-dark: #065028;
      --primary-light: #159E52;
      --primary-subtle: #EAF6EE;
      --primary-gradient: linear-gradient(135deg, #0B7A3E 0%, #159E52 100%);
      --secondary: #FF9800;
      --secondary-dark: #E65100;
      --secondary-subtle: #FFF3E0;
      --bg-page: #F3F6F4;
      --bg-card: #FFFFFF;
      --text-main: #0F172A;
      --text-muted: #475569;
      --text-light: #64748B;
      --border: #E2E8F0;
      --border-subtle: #D8E5DC;
      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 22px;
      --radius-full: 9999px;
      --shadow-sm: 0 2px 4px rgba(0,0,0,0.04);
      --shadow-md: 0 8px 24px rgba(11,122,62,0.07);
      --shadow-lg: 0 16px 36px rgba(15,23,42,0.09);
      --shadow-xl: 0 24px 50px rgba(15,23,42,0.14);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg-page);
      background-image: radial-gradient(circle at 50% 0%, #EBF5EE 0%, #F3F6F4 70%);
      color: var(--text-main);
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 12px 24px 12px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: 'Outfit', 'Plus Jakarta Sans', 'Noto Sans Devanagari', sans-serif;
      color: var(--text-main);
      letter-spacing: -0.015em;
    }

    /* Public Website Top Header */
    .pub-site-header {
      width: 100%;
      max-width: 780px;
      padding: 14px 16px;
      margin: 12px auto 8px auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
    }

    .pub-site-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }

    .pub-site-logo {
      height: 36px;
      width: auto;
      object-fit: contain;
    }

    .pub-site-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--primary-dark);
      letter-spacing: -0.3px;
      line-height: 1.1;
    }

    .pub-site-tagline {
      font-size: 0.72rem;
      color: var(--text-light);
      font-weight: 600;
    }

    .pub-verified-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: var(--primary-subtle);
      color: var(--primary-dark);
      border: 1px solid rgba(11,122,62,0.2);
      padding: 5px 11px;
      border-radius: var(--radius-full);
      font-size: 0.76rem;
      font-weight: 700;
      white-space: nowrap;
    }

    /* Main Public Post Container */
    .pub-post-container {
      width: 100%;
      max-width: 780px;
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border);
      overflow: hidden;
      margin-bottom: 24px;
      transition: opacity 0.4s ease, filter 0.4s ease;
    }

    /* Creator Meta Bar */
    .pub-creator-bar {
      padding: 16px 20px 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      border-bottom: 1px solid #F1F5F9;
      background: #FFFFFF;
    }

    .pub-creator-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .pub-creator-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--primary-gradient);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 800;
      box-shadow: 0 4px 10px rgba(11,122,62,0.25);
      border: 2px solid #FFFFFF;
      flex-shrink: 0;
    }

    .pub-creator-name {
      font-size: 1rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.2;
    }

    .pub-creator-sub {
      font-size: 0.76rem;
      color: var(--text-light);
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
    }

    .pub-category-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--primary-subtle);
      color: var(--primary-dark);
      font-weight: 800;
      font-size: 0.8rem;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      border: 1.5px solid rgba(11,122,62,0.2);
    }

    /* Media Wrapper */
    .pub-media-wrapper {
      position: relative;
      width: 100%;
      background: #080D1A;
      min-height: 240px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .pub-media-img {
      width: 100%;
      height: auto;
      max-height: 620px;
      object-fit: contain;
      display: block;
      margin: 0 auto;
      image-rendering: -webkit-optimize-contrast;
    }

    .pub-yt-iframe {
      width: 100%;
      height: 380px;
      border: none;
    }

    @media (max-width: 600px) {
      .pub-yt-iframe {
        height: 240px;
      }
    }

    .pub-yt-thumb-box {
      position: relative;
      width: 100%;
      height: 380px;
      cursor: pointer;
      overflow: hidden;
      background: #000;
    }

    @media (max-width: 600px) {
      .pub-yt-thumb-box {
        height: 240px;
      }
    }

    .pub-yt-thumb-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.94;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }

    .pub-yt-thumb-box:hover img {
      transform: scale(1.03);
      opacity: 1;
    }

    .pub-play-btn {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 2rem;
      box-shadow: 0 8px 25px rgba(255, 0, 0, 0.5);
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      border: 3px solid #FFFFFF;
    }

    .pub-play-btn i {
      margin-left: 4px;
    }

    .pub-yt-thumb-box:hover .pub-play-btn {
      transform: translate(-50%, -50%) scale(1.12);
    }

    .pub-yt-badge {
      position: absolute;
      bottom: 14px;
      right: 14px;
      background: rgba(0,0,0,0.85);
      color: #fff;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      backdrop-filter: blur(6px);
    }

    /* Content Post Body */
    .pub-post-body {
      padding: 24px 22px;
    }

    .pub-post-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.35;
      margin-bottom: 16px;
    }

    @media (max-width: 600px) {
      .pub-post-title {
        font-size: 1.25rem;
      }
    }

    .pub-message-box {
      background: #F8FAFC;
      border: 1px solid var(--border);
      border-left: 4px solid var(--primary);
      border-radius: var(--radius-md);
      padding: 16px 18px;
      font-size: 1.02rem;
      color: var(--text-main);
      line-height: 1.7;
      white-space: pre-line;
      word-break: break-word;
      margin-bottom: 20px;
    }

    /* CTA Section */
    .pub-cta-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 18px;
      padding-top: 18px;
      border-top: 1px solid #F1F5F9;
    }

    .pub-btn-cta {
      width: 100%;
      padding: 14px 20px;
      border-radius: var(--radius-md);
      font-weight: 800;
      font-size: 1.05rem;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.1);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      border: none;
    }

    .pub-btn-cta:active {
      transform: scale(0.97);
    }

    .pub-btn-wa {
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
      color: #FFFFFF;
      box-shadow: 0 6px 18px rgba(37, 211, 102, 0.35);
    }

    .pub-btn-wa:hover {
      box-shadow: 0 8px 24px rgba(37, 211, 102, 0.45);
      transform: translateY(-1.5px);
    }

    /* Social Share Bar */
    .pub-share-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 6px;
    }

    .pub-share-btn {
      flex: 1;
      min-width: 120px;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 700;
      border: 1px solid var(--border);
      background: #FFFFFF;
      color: var(--text-main);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .pub-share-btn:hover {
      background: #F8FAFC;
      border-color: #CBD5E1;
      transform: translateY(-1px);
    }

    .pub-share-btn-fb {
      color: #1877F2;
      border-color: rgba(24,119,242,0.3);
    }

    .pub-share-btn-wa {
      color: #15803D;
      border-color: rgba(37,211,102,0.35);
    }

    /* Survey Gate Modal */
    .pub-gate-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.84);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      transition: opacity 0.4s ease, visibility 0.4s ease;
    }

    .pub-gate-card {
      background: #FFFFFF;
      width: 100%;
      max-width: 440px;
      border-radius: var(--radius-lg);
      padding: 26px 22px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
      border: 1.5px solid rgba(11, 122, 62, 0.2);
      position: relative;
      animation: pubGatePop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes pubGatePop {
      0% { opacity: 0; transform: scale(0.88) translateY(20px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    .pub-gate-brand-head {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 14px;
    }

    .pub-gate-brand-head img {
      height: 28px;
    }

    .pub-gate-brand-head span {
      font-size: 1rem;
      font-weight: 800;
      color: var(--primary-dark);
    }

    .pub-gate-icon-badge {
      width: 58px;
      height: 58px;
      background: var(--primary-subtle);
      color: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      margin: 0 auto 12px;
      box-shadow: 0 0 0 8px rgba(11, 122, 62, 0.12);
      animation: gatePulse 2.4s infinite ease-in-out;
    }

    @keyframes gatePulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); box-shadow: 0 0 0 14px rgba(11, 122, 62, 0.16); }
    }

    .pub-gate-title {
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--text-main);
      text-align: center;
      margin-bottom: 4px;
      line-height: 1.3;
    }

    .pub-gate-subtitle {
      font-size: 0.86rem;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 18px;
      line-height: 1.4;
    }

    .pub-form-group {
      margin-bottom: 12px;
    }

    .pub-label {
      display: block;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    .pub-input, .pub-select {
      width: 100%;
      padding: 11px 13px;
      font-size: 0.95rem;
      border: 1.5px solid #CBD5E1;
      border-radius: var(--radius-sm);
      background: #FAFAFA;
      color: var(--text-main);
      outline: none;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .pub-input:focus, .pub-select:focus {
      border-color: var(--primary);
      background: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(11,122,62,0.15);
    }

    .pub-btn-submit {
      width: 100%;
      padding: 13px;
      background: var(--primary-gradient);
      color: #FFFFFF;
      font-size: 1.05rem;
      font-weight: 800;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(11,122,62,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: transform 0.1s ease, box-shadow 0.2s ease;
      margin-top: 16px;
      font-family: inherit;
      position: relative;
      overflow: hidden;
    }

    .pub-btn-submit:active {
      transform: scale(0.97);
    }

    .pub-gate-success-screen {
      display: none;
      text-align: center;
      padding: 1.5rem 0.5rem;
    }

    .pub-gate-success-icon {
      width: 64px;
      height: 64px;
      background: #DCFCE7;
      color: #15803D;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.2rem;
      margin: 0 auto 12px auto;
      box-shadow: 0 0 0 8px rgba(34, 197, 94, 0.15);
      animation: pubSuccessPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes pubSuccessPop {
      0% { transform: scale(0.5); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    .pub-webinar-unlocked-card {
      background: #FFFFFF;
      border: 2px solid #3B82F6;
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: 0 8px 25px rgba(59,130,246,0.15);
      text-align: center;
      margin-top: 1rem;
    }

    .pub-wa-float-btn {
      position: fixed;
      bottom: 20px;
      right: 18px;
      z-index: 998;
      background: #25D366;
      color: #FFFFFF;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 20px rgba(37, 211, 102, 0.45);
      text-decoration: none;
      font-size: 1.85rem;
      transition: all 0.3s ease;
      border: 2.5px solid #FFFFFF;
    }

    .pub-wa-float-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 8px 25px rgba(37, 211, 102, 0.6);
    }

    .pub-footer {
      width: 100%;
      max-width: 780px;
      text-align: center;
      padding: 18px 12px;
      margin-top: auto;
      border-top: 1px solid var(--border);
      font-size: 0.82rem;
      color: var(--text-light);
    }

    .pub-footer-links {
      margin-top: 6px;
      display: flex;
      justify-content: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .pub-footer-links a {
      color: var(--primary-dark);
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>

  <!-- 1. PUBLIC WEBSITE HEADER -->
  <header class="pub-site-header">
    <a href="https://aarogyamindia.online" class="pub-site-brand">
      <img src="/images/logo/logo.png" alt="Aarogyam India" class="pub-site-logo" onerror="this.style.display='none'">
      <div>
        <div class="pub-site-title">Aarogyam India</div>
        <div class="pub-site-tagline">प्रामाणिक जानकारी एवं समाधान</div>
      </div>
    </a>
    <div class="pub-verified-pill">
      <i class="fa-solid fa-circle-check" style="color:var(--primary);"></i>
      <span>विश्वसनीय जानकारी</span>
    </div>
  </header>

  <!-- 2. FIRST-SCREEN SURVEY GATE -->
  <div class="pub-gate-overlay" id="lp_survey_gate_overlay">
    <div class="pub-gate-card" id="lp_gate_card">
      <div id="lp_gate_form_view">
        <div class="pub-gate-brand-head">
          <img src="/images/logo/logo.png" alt="Aarogyam India" onerror="this.style.display='none'">
          <span>Aarogyam India</span>
        </div>

        <div class="pub-gate-icon-badge" id="lp_gate_icon">
          <i class="fa-solid fa-clipboard-list"></i>
        </div>

        <h2 class="pub-gate-title" id="lp_gate_title">सिर्फ 30 सेकंड का छोटा सर्वे</h2>
        <p class="pub-gate-subtitle" id="lp_gate_subtitle">
          सटीक जानकारी व परामर्श प्राप्त करने के लिए कृपया नीचे अपना नाम व मोबाइल नंबर दर्ज करें:
        </p>

        <form id="lp_gate_survey_form">
          <div class="pub-form-group">
            <label class="pub-label">आपका नाम (Full Name) *</label>
            <input type="text" id="gate_input_name" class="pub-input" placeholder="उदा. रमेश कुमार" required autofocus>
          </div>

          <div class="pub-form-group">
            <label class="pub-label">मोबाइल नंबर (10 अंकों का) *</label>
            <input type="tel" id="gate_input_mobile" class="pub-input" placeholder="उदा. 9827372989" maxlength="10" required>
          </div>

          <div class="pub-form-group" id="gate_group_place">
            <label class="pub-label">स्थान / ग्राम / जिला</label>
            <input type="text" id="gate_input_place" class="pub-input" placeholder="उदा. रामपुर, जिला रीवा">
          </div>

          <div id="gate_dynamic_category_question"></div>

          <button type="submit" class="pub-btn-submit" id="gate_btn_submit">
            <i class="fa-solid fa-wand-magic-sparkles"></i> <span id="gate_btn_text">जानकारी देखें →</span>
          </button>
        </form>

        <div style="font-size:0.72rem;color:var(--text-light);text-align:center;margin-top:12px;">
          🔒 आपकी जानकारी 100% सुरक्षित और गोपनीय रखी जाती है।
        </div>
      </div>

      <div class="pub-gate-success-screen" id="lp_gate_success_view">
        <div class="pub-gate-success-icon">
          <i class="fa-solid fa-check"></i>
        </div>
        <h3 style="font-size:1.3rem;font-weight:800;color:var(--primary-dark);margin-bottom:6px;">✓ जानकारी प्राप्त हो गई!</h3>
        <p style="font-size:0.92rem;color:var(--text-main);margin-bottom:12px;" id="lp_gate_success_msg">
          धन्यवाद! आपकी रुचि सुरक्षित कर ली गई है। आपका पेज खुल रहा है...
        </p>
        <div style="font-size:0.85rem;color:var(--primary);font-weight:700;">
          <i class="fa-solid fa-spinner fa-spin"></i> कृपया 1 सेकंड प्रतीक्षा करें...
        </div>
      </div>
    </div>
  </div>

  <!-- 3. MAIN EDITORIAL CONTENT POST -->
  <main class="pub-post-container" id="lp_main_content">
    <div class="pub-creator-bar">
      <div class="pub-creator-info">
        <div class="pub-creator-avatar" id="lp_creator_avatar">A</div>
        <div>
          <div class="pub-creator-name" id="lp_creator_name">Aarogyam India Community</div>
          <div class="pub-creator-sub">
            <span id="lp_creator_sub_text">द्वारा साझा किया गया</span>
            <span>•</span>
            <span id="lp_post_date">22 अगस्त 2026</span>
          </div>
        </div>
      </div>

      <div class="pub-category-badge" id="lp_category_badge">
        <i class="fa-solid fa-tag"></i> <span>Aarogyam Special</span>
      </div>
    </div>

    <!-- Media Area (Image or YouTube) -->
    <div class="pub-media-wrapper" id="lp_media_holder">
      <div style="color:#fff;padding:3rem 1rem;text-align:center;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size:2.4rem;color:#10B981;"></i>
      </div>
    </div>

    <!-- Post Body -->
    <div class="pub-post-body">
      <h1 class="pub-post-title" id="lp_post_title"><?php echo $finalTitle; ?></h1>

      <div class="pub-message-box" id="lp_message_holder">
        <?php echo $finalDesc; ?>
      </div>

      <!-- Webinar Unlocked Session Details -->
      <div class="pub-webinar-unlocked-card" id="lp_webinar_unlocked_screen" style="display:none;">
        <div style="width:60px;height:60px;background:#DBEAFE;color:#2563EB;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.9rem;margin:0 auto 10px auto;">
          <i class="fa-solid fa-video"></i>
        </div>
        <div style="font-size:0.8rem;font-weight:800;color:#2563EB;text-transform:uppercase;letter-spacing:0.5px;">Webinar Registration Confirmed</div>
        <h3 id="webinar_unlocked_title" style="font-size:1.25rem;font-weight:800;color:var(--text-main);margin:4px 0 8px 0;">लाइव वेबिनार में आपका स्वागत है!</h3>
        
        <div id="webinar_unlocked_datetime_box" style="display:inline-flex;align-items:center;gap:6px;background:#EFF6FF;color:#1E40AF;padding:6px 14px;border-radius:var(--radius-full);font-size:0.85rem;font-weight:700;margin-bottom:14px;">
          <i class="fa-regular fa-calendar-check"></i> <span id="webinar_unlocked_datetime">आज का लाइव वेबिनार सत्र</span>
        </div>

        <p id="webinar_unlocked_msg" style="font-size:0.9rem;color:var(--text-muted);margin-bottom:14px;line-height:1.4;">
          आपकी सीट सुरक्षित कर ली गई है। नीचे दिए गए बटन पर क्लिक करके Zoom मीटिंग में शामिल हों:
        </p>

        <a id="webinar_btn_join_zoom" href="#" target="_blank" class="pub-btn-cta" style="background:linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);color:#fff;font-size:1.08rem;padding:14px;border-radius:var(--radius-md);margin-bottom:14px;box-shadow:0 4px 15px rgba(37,99,235,0.35);">
          <i class="fa-solid fa-video"></i> Join Zoom Meeting Now
        </a>

        <div style="background:#F8FAFC;border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;margin-bottom:14px;text-align:left;">
          <div id="webinar_meeting_id_row" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--border);">
            <div>
              <div style="font-size:0.75rem;color:var(--text-light);font-weight:600;">Meeting ID (मीटिंग आईडी):</div>
              <div id="webinar_unlocked_meeting_id" style="font-size:1.15rem;font-weight:800;color:var(--text-main);letter-spacing:1px;">-</div>
            </div>
            <button type="button" id="btn_copy_meeting_id" class="pub-share-btn" style="flex:none;padding:5px 12px;font-size:0.78rem;">
              <i class="fa-solid fa-copy"></i> Copy ID
            </button>
          </div>

          <div id="webinar_passcode_row" style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:0.75rem;color:var(--text-light);font-weight:600;">Passcode / Password (पासवर्ड):</div>
              <div id="webinar_unlocked_passcode" style="font-size:1.15rem;font-weight:800;color:#15803D;letter-spacing:1px;">-</div>
            </div>
            <button type="button" id="btn_copy_passcode" class="pub-share-btn" style="flex:none;padding:5px 12px;font-size:0.78rem;">
              <i class="fa-solid fa-copy"></i> Copy Pass
            </button>
          </div>
        </div>

        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
          <button type="button" id="btn_copy_full_invite" class="pub-share-btn" style="padding:8px 14px;font-size:0.82rem;">
            <i class="fa-solid fa-clipboard"></i> निमंत्रण कॉपी करें
          </button>
          <button type="button" id="webinar_btn_wa_save" class="pub-share-btn pub-share-btn-wa" style="padding:8px 14px;font-size:0.82rem;">
            <i class="fa-brands fa-whatsapp"></i> WhatsApp पर भेजें
          </button>
        </div>
      </div>

      <!-- Action CTA -->
      <div class="pub-cta-section" id="lp_cta_section">
        <a id="lp_btn_whatsapp_cta" href="#" target="_blank" class="pub-btn-cta pub-btn-wa">
          <i class="fa-brands fa-whatsapp" style="font-size:1.35rem;"></i>
          <span>WhatsApp पर तुरंत संपर्क करें</span>
        </a>

        <div class="pub-share-row">
          <button type="button" id="pub_btn_share_wa" class="pub-share-btn pub-share-btn-wa">
            <i class="fa-brands fa-whatsapp"></i> WhatsApp शेयर
          </button>
          <button type="button" id="pub_btn_share_fb" class="pub-share-btn pub-share-btn-fb">
            <i class="fa-brands fa-facebook"></i> Facebook शेयर
          </button>
          <button type="button" id="pub_btn_share_native" class="pub-share-btn">
            <i class="fa-solid fa-share-nodes"></i> शेयर करें
          </button>
        </div>
      </div>
    </div>
  </main>

  <a id="pub_wa_floating_btn" href="#" target="_blank" class="pub-wa-float-btn">
    <i class="fa-brands fa-whatsapp"></i>
  </a>

  <footer class="pub-footer">
    <div style="font-weight:700;color:var(--text-main);font-size:0.92rem;">Aarogyam India</div>
    <div style="margin-top:2px;">विश्वसनीय जानकारी, सही दिशा</div>
    <div style="margin-top:6px;font-size:0.76rem;">&copy; 2026 Aarogyam India • सर्वाधिकार सुरक्षित</div>
    <div class="pub-footer-links">
      <a href="/index.html">मुख्य वेबसाइट</a>
      <span>•</span>
      <a href="/privacy-policy.html">गोपनीयता नीति</a>
      <span>•</span>
      <a href="/terms.html">नियम एवं शर्तें</a>
      <span>•</span>
      <a href="/contact.html">संपर्क करें</a>
    </div>
  </footer>

  <!-- Supabase CDN & Core Dependencies -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="/session.js"></script>
  <script src="/js/supabase.js"></script>
  <script src="/js/share-engine-core.js"></script>
  <script src="/ucas/js/ucas-db.js?v=2.6"></script>

  <!-- Client-Side Hydration Script -->
  <script>
    (async function () {
      'use strict';

      const urlParams = new URLSearchParams(window.location.search);
      const lpId = urlParams.get('id') || 'LP000001';
      const shareId = urlParams.get('share_id') || '';
      const customTitle = urlParams.get('title');
      const customThumb = urlParams.get('thumb') || urlParams.get('img') || urlParams.get('thumbnail');
      const customYt = urlParams.get('yt') || urlParams.get('v') || urlParams.get('video');
      const customMsg = urlParams.get('desc') || urlParams.get('msg');

      let landingPageData = null;
      let creatorProfileData = null;

      try {
        if (window.UCAS_DB && typeof window.UCAS_DB.getLandingPageById === 'function') {
          const res = await window.UCAS_DB.getLandingPageById(lpId);
          if (res && res.success && res.data) {
            landingPageData = res.data;
          }
        }
      } catch (e) {
        console.warn('DB landing page load notice:', e);
      }

      function extractYoutubeId(url) {
        if (!url) return null;
        const str = String(url).trim();
        if (!str || str.startsWith('data:')) return null;

        if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
          return str;
        }

        const thumbMatch = str.match(/(?:img\.youtube\.com|i\.ytimg\.com)\/vi\/([a-zA-Z0-9_-]{11})/i);
        if (thumbMatch && thumbMatch[1] && thumbMatch[1].length === 11) {
          return thumbMatch[1];
        }

        const patterns = [
          /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/i,
          /[?&]v=([a-zA-Z0-9_-]{11})/i,
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
        ];

        for (const pattern of patterns) {
          const match = str.match(pattern);
          if (match && match[1] && match[1].length === 11) {
            return match[1];
          }
        }
        return null;
      }

      const resolvedYtId = extractYoutubeId(customYt) || extractYoutubeId(landingPageData?.media_url) || extractYoutubeId(landingPageData?.thumbnail_url);
      
      if (!landingPageData) {
        landingPageData = {
          id: lpId,
          share_id: shareId,
          title: customTitle || 'Aarogyam India विशेष जानकारी',
          category: urlParams.get('cat') || 'agriculture',
          content_type: resolvedYtId ? 'youtube' : 'image',
          media_url: resolvedYtId ? `https://www.youtube.com/watch?v=${resolvedYtId}` : (customThumb || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'),
          thumbnail_url: customThumb || (resolvedYtId ? `https://i.ytimg.com/vi/${resolvedYtId}/hqdefault.jpg` : ''),
          message: customMsg || 'नमस्ते! Aarogyam India में आपका स्वागत है। प्रामाणिक जानकारी और समाधान के लिए नीचे दिया गया विवरण अवश्य देखें।'
        };
      } else {
        if (customTitle) landingPageData.title = customTitle;
        if (customMsg) landingPageData.message = customMsg;
        if (resolvedYtId) {
          landingPageData.content_type = 'youtube';
          landingPageData.media_url = `https://www.youtube.com/watch?v=${resolvedYtId}`;
          landingPageData.thumbnail_url = `https://i.ytimg.com/vi/${resolvedYtId}/hqdefault.jpg`;
        } else if (customThumb) {
          landingPageData.content_type = 'image';
          landingPageData.media_url = customThumb;
          landingPageData.thumbnail_url = customThumb;
        }
      }

      const targetProfileId = landingPageData.profile_id || null;
      const targetShareId = shareId || landingPageData.share_id || '';

      try {
        const client = window.UCAS_DB?.getDb();
        if (client) {
          if (targetProfileId) {
            const { data: pData } = await client
              .from('profiles')
              .select('id, full_name, mobile, share_id')
              .eq('id', targetProfileId)
              .maybeSingle();
            if (pData) creatorProfileData = pData;
          }
          if (!creatorProfileData && targetShareId) {
            const { data: pData } = await client
              .from('profiles')
              .select('id, full_name, mobile, share_id')
              .eq('share_id', targetShareId)
              .maybeSingle();
            if (pData) creatorProfileData = pData;
          }
        }
      } catch (profErr) {
        console.warn('Creator profile fetch notice:', profErr);
      }

      const isWebinar = landingPageData.category === 'webinar' || Boolean(landingPageData.webinar_data);

      renderLandingPost(landingPageData, creatorProfileData);
      setupSurveyGate(landingPageData, creatorProfileData);

      function renderLandingPost(lp, creator) {
        if (!lp) return;

        const creatorName = creator?.full_name || 'Aarogyam India Community';
        const avatarInitial = creatorName.trim().charAt(0).toUpperCase() || 'A';
        const nameEl = document.getElementById('lp_creator_name');
        const avatarEl = document.getElementById('lp_creator_avatar');
        const dateEl = document.getElementById('lp_post_date');

        if (nameEl) nameEl.textContent = creatorName;
        if (avatarEl) avatarEl.textContent = avatarInitial;
        if (dateEl) {
          const d = lp.created_at ? new Date(lp.created_at) : new Date();
          dateEl.textContent = d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        const finalTitle = lp.title || 'Aarogyam India विशेष जानकारी';
        document.title = `${finalTitle} — Aarogyam India`;
        const postTitleEl = document.getElementById('lp_post_title');
        if (postTitleEl) postTitleEl.textContent = finalTitle;

        const catBadge = document.getElementById('lp_category_badge');
        if (catBadge) {
          const catNames = {
            agriculture: '🌾 कृषि समाधान',
            healthcare: '❤️ स्वास्थ्य परामर्श',
            insurance: '🛡️ बीमा मार्गदर्शन',
            property: '🏢 प्रॉपर्टी व रियल एस्टेट',
            cattlecare: '🐄 पशुपालन व डेयरी',
            beautycare: '💄 ब्यूटी केयर',
            haircare: '💇 हेयर केयर',
            netsurf: '💼 NetSurf अवसर',
            webinar: '🎥 लाइव वेबिनार',
            motivational: '🔥 प्रेरणादायक',
            other: '📄 विशेष जानकारी'
          };
          catBadge.innerHTML = `<span>${catNames[lp.category] || 'विशेष जानकारी'}</span>`;
        }

        const msgHolder = document.getElementById('lp_message_holder');
        if (msgHolder) {
          if (lp.message && lp.message.trim()) {
            msgHolder.textContent = lp.message;
            msgHolder.style.display = 'block';
          } else {
            msgHolder.style.display = 'none';
          }
        }

        const mediaHolder = document.getElementById('lp_media_holder');
        if (mediaHolder) {
          mediaHolder.innerHTML = '';
          const ytId = extractYoutubeId(lp.media_url) || extractYoutubeId(lp.thumbnail_url);

          if (ytId) {
            const primaryThumb = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
            const altThumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

            const thumbBox = document.createElement('div');
            thumbBox.className = 'pub-yt-thumb-box';
            thumbBox.id = 'lp_yt_click_play';
            thumbBox.title = 'क्लिक करके वीडियो देखें';
            thumbBox.onclick = () => playYoutubeVideo(ytId);

            const ytImg = document.createElement('img');
            ytImg.alt = finalTitle;
            ytImg.src = primaryThumb;
            ytImg.onerror = function () {
              this.onerror = null;
              this.src = altThumb;
            };

            thumbBox.appendChild(ytImg);
            thumbBox.innerHTML += `
              <div class="pub-play-btn"><i class="fa-solid fa-play"></i></div>
              <div class="pub-yt-badge"><i class="fa-brands fa-youtube" style="color:#FF0000;font-size:1.15rem;"></i> YouTube</div>
            `;
            mediaHolder.appendChild(thumbBox);
          } else {
            const rawImg = lp.media_url || lp.thumbnail_url || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80';
            const imgElem = document.createElement('img');
            imgElem.className = 'pub-media-img';
            imgElem.alt = finalTitle;
            imgElem.src = rawImg;
            imgElem.onerror = function () {
              this.onerror = null;
              this.src = 'https://aarogyamindia.online/images/logo/logo.png';
            };
            mediaHolder.appendChild(imgElem);
          }
        }

        let creatorPhone = (creator?.mobile || '').replace(/\D/g, '');
        if (creatorPhone.length === 10) creatorPhone = '91' + creatorPhone;
        else if (creatorPhone.length !== 12) creatorPhone = '917974422572';

        const waText = `नमस्ते ${creatorName !== 'Aarogyam India Community' ? creatorName + ' जी' : 'Aarogyam India'}! मैंने आपका पोस्ट "${finalTitle}" देखा है। मुझे इस बारे में अधिक जानकारी चाहिए।`;
        const waLink = `https://wa.me/${creatorPhone}?text=${encodeURIComponent(waText)}`;

        const waBtn = document.getElementById('lp_btn_whatsapp_cta');
        const floatWaBtn = document.getElementById('pub_wa_floating_btn');
        if (waBtn) waBtn.href = waLink;
        if (floatWaBtn) floatWaBtn.href = waLink;

        const currentUrl = window.location.href;
        const shareWaBtn = document.getElementById('pub_btn_share_wa');
        const shareFbBtn = document.getElementById('pub_btn_share_fb');
        const shareNativeBtn = document.getElementById('pub_btn_share_native');

        const shareMsg = `🌟 *${finalTitle}*\n\n${(lp.message || '').slice(0, 150)}...\n\n👉 पूरी जानकारी यहाँ देखें:\n${currentUrl}`;

        if (shareWaBtn) {
          shareWaBtn.onclick = () => {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg)}`, '_blank');
          };
        }

        if (shareFbBtn) {
          shareFbBtn.onclick = () => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
          };
        }

        if (shareNativeBtn) {
          shareNativeBtn.onclick = async () => {
            if (navigator.share) {
              try {
                await navigator.share({
                  title: finalTitle,
                  text: lp.message ? lp.message.slice(0, 120) : finalTitle,
                  url: currentUrl
                });
              } catch (e) {}
            } else if (navigator.clipboard) {
              await navigator.clipboard.writeText(currentUrl);
              alert('✅ लिंक कॉपी हो गया!');
            }
          };
        }
      }

      window.playYoutubeVideo = function (videoId) {
        const mediaHolder = document.getElementById('lp_media_holder');
        if (mediaHolder && videoId) {
          mediaHolder.innerHTML = `
            <iframe class="pub-yt-iframe" src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          `;
        }
      };

      function setupSurveyGate(lp, creator) {
        const overlay = document.getElementById('lp_survey_gate_overlay');
        const mainContent = document.getElementById('lp_main_content');

        const isPageUnlocked = Boolean(lp?.id && localStorage.getItem(`ucas_unlocked_v1_${lp.id}`) === 'true');
        const isGlobalVisitorUnlocked = localStorage.getItem('ucas_visitor_verified') === 'true';
        const isSessionLoggedIn = Boolean(window.UCAS_SESSION && typeof window.UCAS_SESSION.isLoggedIn === 'function' && window.UCAS_SESSION.isLoggedIn()) || Boolean(localStorage.getItem('ucas_user_id'));
        const isPreviewMode = urlParams.get('preview') === '1' || urlParams.get('unlock') === '1' || urlParams.get('admin') === '1';

        const isUnlocked = isPageUnlocked || isGlobalVisitorUnlocked || isSessionLoggedIn || isPreviewMode;

        if (isUnlocked) {
          if (overlay) overlay.style.display = 'none';
          if (mainContent) {
            mainContent.style.opacity = '1';
            mainContent.style.filter = 'none';
          }
          if (isWebinar) {
            showWebinarDetails(lp);
          }
          return;
        }

        if (overlay) overlay.style.display = 'flex';
        if (mainContent) {
          mainContent.style.opacity = '0.15';
          mainContent.style.filter = 'blur(2px)';
        }

        const gateIcon = document.getElementById('lp_gate_icon');
        const gateTitle = document.getElementById('lp_gate_title');
        const gateSubtitle = document.getElementById('lp_gate_subtitle');
        const gatePlaceGroup = document.getElementById('gate_group_place');
        const gateBtnText = document.getElementById('gate_btn_text');

        if (isWebinar) {
          if (gateIcon) gateIcon.innerHTML = '<i class="fa-solid fa-video" style="color:#2563EB;"></i>';
          if (gateTitle) gateTitle.textContent = 'लाइव वेबिनार में भाग लेने के लिए रजिस्टर करें';
          if (gateSubtitle) gateSubtitle.textContent = 'अपना नाम व मोबाइल नंबर भरें। सबमिट करते ही Zoom Meeting लिंक और पासवर्ड तुरंत अनलॉक हो जाएगा:';
          if (gatePlaceGroup) gatePlaceGroup.style.display = 'none';
          if (gateBtnText) gateBtnText.textContent = '🔓 Get Access (सीट सुरक्षित करें)';
        }

        const form = document.getElementById('lp_gate_survey_form');
        form?.addEventListener('submit', async (e) => {
          e.preventDefault();

          const name = (document.getElementById('gate_input_name')?.value || '').trim();
          let mobile = (document.getElementById('gate_input_mobile')?.value || '').replace(/\D/g, '').trim();
          const place = (document.getElementById('gate_input_place')?.value || '').trim() || 'Online';
          const catAns = document.getElementById('gate_cat_ans')?.value || (isWebinar ? 'Webinar Registration' : 'General Inquiry');

          if (!name) return alert('कृपया अपना पूरा नाम दर्ज करें।');
          if (mobile.length !== 10) return alert('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।');

          const submitBtn = document.getElementById('gate_btn_submit');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> सबमिट हो रहा है...';
          }

          const payload = {
            profile_id: lp.profile_id || creator?.id || null,
            name: name,
            mobile: mobile,
            village: place,
            selected_categories: [lp.category || 'agriculture'],
            category_answers: {
              landing_page_id: lp.id,
              creator_share_id: shareId || lp.share_id || creator?.share_id || '',
              source: isWebinar ? 'webinar_gate' : 'survey_gate',
              status: 'new',
              response: catAns
            }
          };

          try {
            if (window.UCAS_DB && typeof window.UCAS_DB.createSurvey === 'function') {
              await window.UCAS_DB.createSurvey(payload);
            }
          } catch (err) {}

          localStorage.setItem(`ucas_unlocked_v1_${lp.id}`, 'true');
          localStorage.setItem('ucas_visitor_verified', 'true');
          localStorage.setItem('ucas_visitor_name', name);
          localStorage.setItem('ucas_visitor_mobile', mobile);

          const formView = document.getElementById('lp_gate_form_view');
          const successView = document.getElementById('lp_gate_success_view');
          if (formView) formView.style.display = 'none';
          if (successView) successView.style.display = 'block';

          setTimeout(() => {
            if (overlay) overlay.style.display = 'none';
            if (mainContent) {
              mainContent.style.opacity = '1';
              mainContent.style.filter = 'none';
            }
            if (isWebinar) showWebinarDetails(lp);
          }, 800);
        });
      }

      function showWebinarDetails(lp) {
        const wData = lp.webinar_data || {};
        const unlockedScreen = document.getElementById('lp_webinar_unlocked_screen');
        const unTitle = document.getElementById('webinar_unlocked_title');
        const unDt = document.getElementById('webinar_unlocked_datetime');
        const unMsg = document.getElementById('webinar_unlocked_msg');
        const btnJoin = document.getElementById('webinar_btn_join_zoom');
        const meetingIdEl = document.getElementById('webinar_unlocked_meeting_id');
        const passcodeEl = document.getElementById('webinar_unlocked_passcode');

        if (unTitle) unTitle.textContent = lp.title || 'लाइव वेबिनार में आपका स्वागत है!';
        if (unDt) unDt.textContent = wData.datetime || 'आज का लाइव वेबिनार सत्र';
        if (unMsg && wData.success_msg) unMsg.textContent = wData.success_msg;

        const zoomUrl = wData.zoom_link || '#';
        if (btnJoin) btnJoin.href = zoomUrl;

        const mId = wData.meeting_id || '-';
        const mPass = wData.passcode || '-';
        if (meetingIdEl) meetingIdEl.textContent = mId;
        if (passcodeEl) passcodeEl.textContent = mPass;

        if (unlockedScreen) unlockedScreen.style.display = 'block';
      }

    })();
  </script>
</body>
</html>
