/* ================================================================= *
   AAROGYAM INDIA - UNIVERSAL DOWNLOAD SYSTEM JS
   ================================================================ */

let currentBookData = null;
let maxAllowedDownloads = 3;

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let bookId = urlParams.get("book") || urlParams.get("id") || "BK001";

    try {
        // books.json से डेटा फेच करना
        const response = await fetch("data/books.json"); // यदि पाथ अलग हो तो adjust करें जैसे "../json/books.json" या "../data/books.json"
        const data = await response.json();
        
        currentBookData = data.books.find(b => b.id === bookId);

        if (currentBookData) {
            // UI अपडेट करना
            document.getElementById("bookHeading").textContent = currentBookData.heading || currentBookData.name;
            document.getElementById("bookCategory").textContent = `Category: ${currentBookData.category} (${currentBookData.language})`;
            document.getElementById("bookIdDisplay").textContent = currentBookData.id;
            document.getElementById("fileSizeDisplay").textContent = currentBookData.fileSize || "24.8 MB";
            document.getElementById("accessDisplay").textContent = currentBookData.accessType || "Lifetime";

            maxAllowedDownloads = currentBookData.downloadLimit || 3;

            // डाउनलोड इनेबल चेक
            if (currentBookData.downloadEnabled === false) {
                disableDownloadButton("इस ई-बुक का डाउनलोड अभी बंद है।");
            } else {
                checkDownloadLimit(bookId);
            }
        } else {
            document.getElementById("bookHeading").textContent = "ई-बुक नहीं मिली!";
            document.getElementById("downloadStatusText").textContent = "अमान्य बुक आईडी।";
            disableDownloadButton("डाउनलोड उपलब्ध नहीं");
        }
    } catch (error) {
        console.error("Error loading book data:", error);
        // फॉलबैक वैल्यू
        document.getElementById("bookHeading").textContent = "खरीफ फसल मास्टर गाइड 2026";
        document.getElementById("bookIdDisplay").textContent = bookId;
        checkDownloadLimit(bookId);
    }
});

// डाउनलोड लिमिट चेक करने का फंक्शन
function checkDownloadLimit(bookId) {
    let downloadCounts = JSON.parse(localStorage.getItem("AOI_DOWNLOAD_COUNTS") || "{}");
    let currentCount = downloadCounts[bookId] || 0;
    let remaining = maxAllowedDownloads - currentCount;

    if (remaining <= 0) {
        document.getElementById("remainingCount").textContent = `सीमा समाप्त: 0/${maxAllowedDownloads}`;
        disableDownloadButton("आपने अधिकतम डाउनलोड सीमा पार कर ली है।");
    } else {
        document.getElementById("remainingCount").textContent = `शेष डाउनलोड: ${remaining}/${maxAllowedDownloads}`;
    }
}

// डाउनलोड ट्रिगर करने का मुख्य फंक्शन
function triggerDownload() {
    if (!currentBookData) return;

    let bookId = currentBookData.id;
    let downloadCounts = JSON.parse(localStorage.getItem("AOI_DOWNLOAD_COUNTS") || "{}");
    let currentCount = downloadCounts[bookId] || 0;

    if (currentCount >= maxAllowedDownloads) {
        alert("माफ कीजिए, आप इस ई-बुक को डाउनलोड करने की अधिकतम सीमा समाप्त कर चुके हैं।");
        return;
    }

    // काउंटर बढ़ाना
    currentCount++;
    downloadCounts[bookId] = currentCount;
    localStorage.setItem("AOI_DOWNLOAD_COUNTS", JSON.stringify(downloadCounts));

    // UI अपडेट करें
    checkDownloadLimit(bookId);

    // असली पीडीएफ फाइल डाउनलोड करना
    let pdfUrl = currentBookData.mainPdf || "pdf/full/BK001.pdf";
    
    // ब्राउज़र में फाइल डाउनलोड शुरू करने के लिए अस्थायी लिंक बनाना
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${currentBookData.id}-Aarogyam-India.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // सक्सेस मैसेज
    alert("डाउनलोड शुरू हो गया है!");
}

function disableDownloadButton(message) {
    const btn = document.getElementById("downloadBtn");
    btn.disabled = true;
    btn.style.background = "#9CA3AF";
    document.getElementById("downloadStatusText").textContent = message;
}
