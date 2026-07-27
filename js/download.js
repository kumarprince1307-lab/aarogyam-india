/* ================================================================= *
   AAROGYAM INDIA - SUPABASE CONNECTED DOWNLOAD SYSTEM JS
   ================================================================ */

let currentBookData = null;
let maxAllowedDownloads = 3;
let currentUserId = null; // Supabase से मिलने वाली यूजर आईडी

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let bookId = urlParams.get("book") || urlParams.get("id") || "BK001";

    try {
        // 1. Supabase से वर्तमान यूजर का पता लगाना
        if (typeof supabaseClient !== 'undefined') {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session && session.user) {
                currentUserId = session.user.id;
            }
        }

        // 2. books.json से डेटा फेच करना
        const response = await fetch("../data/books.json");
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

            // डाउनलोड इनेबल चेक और डेटाबेस से लिमिट चेक करना
            if (currentBookData.downloadEnabled === false) {
                disableDownloadButton("इस ई-बुक का डाउनलोड अभी बंद है।");
            } else {
                await checkDownloadLimitFromDatabase(bookId);
            }
        } else {
            document.getElementById("bookHeading").textContent = "ई-बुक नहीं मिली!";
            document.getElementById("downloadStatusText").textContent = "अमान्य बुक आईडी।";
            disableDownloadButton("डाउनलोड उपलब्ध नहीं");
        }
    } catch (error) {
        console.error("Error loading book data:", error);
        document.getElementById("bookHeading").textContent = "खरीफ फसल मास्टर गाइड 2026";
        document.getElementById("bookIdDisplay").textContent = bookId;
        await checkDownloadLimitFromDatabase(bookId);
    }
});

// Supabase डेटाबेस से डाउनलोड लिमिट चेक करने का फंक्शन
async function checkDownloadLimitFromDatabase(bookId) {
    let currentCount = 0;

    // अगर यूजर लॉगिन है, तो Supabase से डेटाबेस रिकॉर्ड चेक करें
    if (currentUserId && typeof supabaseClient !== 'undefined') {
        try {
            const { data, error } = await supabaseClient
                .from('user_downloads') // सुनिश्चित करें कि आपके Supabase में यह टेबल हो या purchases टेबल का उपयोग करें
                .select('download_count')
                .eq('user_id', currentUserId)
                .eq('book_id', bookId)
                .single();

            if (data) {
                currentCount = data.download_count || 0;
            }
        } catch (err) {
            console.log("Database fetch fallback to LocalStorage");
        }
    }

    // अगर डेटाबेस में नहीं मिला तो लोकल स्टोरेज का बैकअप उपयोग करें
    if (currentCount === 0) {
        let downloadCounts = JSON.parse(localStorage.getItem("AOI_DOWNLOAD_COUNTS") || "{}");
        currentCount = downloadCounts[bookId] || 0;
    }

    let remaining = maxAllowedDownloads - currentCount;
    const remainingEl = document.getElementById("remainingCount");

    if (remainingEl) {
        if (remaining <= 0) {
            remainingEl.textContent = `सीमा समाप्त: 0/${maxAllowedDownloads}`;
            disableDownloadButton("आपने अधिकतम डाउनलोड सीमा पार कर ली है।");
        } else {
            remainingEl.textContent = `शेष डाउनलोड: ${remaining}/${maxAllowedDownloads}`;
        }
    }
}

// डाउनलोड ट्रिगर करने का मुख्य फंक्शन (डेटाबेस अपडेट + फाइल डाउनलोड + पॉपअप)
async function triggerDownload() {
    if (!currentBookData) return;

    let bookId = currentBookData.id;
    let currentCount = 0;

    // पहले वर्तमान काउंट डेटाबेस या लोकल से निकालें
    if (currentUserId && typeof supabaseClient !== 'undefined') {
        try {
            const { data } = await supabaseClient
                .from('user_downloads')
                .select('download_count')
                .eq('user_id', currentUserId)
                .eq('book_id', bookId)
                .single();
            if (data) currentCount = data.download_count || 0;
        } catch (e) {}
    }

    if (currentCount === 0) {
        let downloadCounts = JSON.parse(localStorage.getItem("AOI_DOWNLOAD_COUNTS") || "{}");
        currentCount = downloadCounts[bookId] || 0;
    }

    if (currentCount >= maxAllowedDownloads) {
        alert("माफ कीजिए, आप इस ई-बुक को डाउनलोड करने की अधिकतम सीमा समाप्त कर चुके हैं।");
        return;
    }

    // काउंटर बढ़ाना
    currentCount++;

    // 1. लोकल स्टोरेज में सेव करें
    let downloadCounts = JSON.parse(localStorage.getItem("AOI_DOWNLOAD_COUNTS") || "{}");
    downloadCounts[bookId] = currentCount;
    localStorage.setItem("AOI_DOWNLOAD_COUNTS", JSON.stringify(downloadCounts));

    // 2. Supabase डेटाबेस में सुरक्षित रूप से सेव करें
    if (currentUserId && typeof supabaseClient !== 'undefined') {
        try {
            await supabaseClient
                .from('user_downloads')
                .upsert({ 
                    user_id: currentUserId, 
                    book_id: bookId, 
                    download_count: currentCount,
                    updated_at: new Date()
                }, { onConflict: 'user_id,book_id' });
        } catch (err) {
            console.error("Failed to sync download count to Supabase:", err);
        }
    }

    // UI अपडेट करें
    await checkDownloadLimitFromDatabase(bookId);

    // असली पीडीएफ फाइल डाउनलोड करना
    let pdfUrl = currentBookData.mainPdf || "pdf/full/BK001.pdf";
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${currentBookData.id}-Aarogyam-India.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // प्रोफेशनल सक्सेस पॉपअप दिखाना
    showDownloadSuccessPopup(currentBookData.heading || currentBookData.name || "Aarogyam India E-Book");
}

// डिसेबल बटन फंक्शन
function disableDownloadButton(message) {
    const btn = document.getElementById("downloadBtn");
    if (btn) {
        btn.disabled = true;
        btn.style.background = "#9CA3AF";
    }
    const statusText = document.getElementById("downloadStatusText");
    if (statusText) {
        statusText.textContent = message;
    }
}

// प्रोफेशनल डाउनलोड सक्सेस पॉपअप (हिंदी और इंग्लिश दोनों में)
function showDownloadSuccessPopup(bookTitle) {
    let existingPopup = document.getElementById('proDownloadPopup');
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement('div');
    popup.id = 'proDownloadPopup';
    popup.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:999999;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(6px);padding:20px;";
    
    popup.innerHTML = `
        <div style="background:#ffffff;padding:30px;border-radius:24px;text-align:center;max-width:420px;width:100%;box-shadow:0 15px 35px rgba(0,0,0,0.3);">
            
            <!-- Success Icon -->
            <div style="width:70px;height:70px;background:#E8F5E9;color:#138A36;border-radius:50%;display:flex;justify-content:center;align-items:center;font-size:35px;margin:0 auto 20px auto;box-shadow:0 5px 15px rgba(19,138,54,0.2);">
                📥
            </div>

            <!-- English Heading & Message -->
            <h3 style="color:#138A36;font-size:1.3rem;margin-bottom:8px;font-weight:800;">Download Successful!</h3>
            <p style="font-size:0.9rem;color:#555;line-height:1.4;margin-bottom:15px;">
                Your e-book <b>"${bookTitle}"</b> has been successfully downloaded. You can download this book anytime as it is yours for a lifetime!
            </p>

            <hr style="border:none;border-top:1px dashed #ddd;margin:15px 0;">

            <!-- Hindi Heading & Message -->
            <h4 style="color:#E86A17;font-size:1.1rem;margin-bottom:6px;font-weight:700;">बधाई हो! डाउनलोड सफल रहा</h4>
            <p style="font-size:0.85rem;color:#666;line-height:1.4;margin-bottom:25px;">
                आपकी ई-बुक सफलतापूर्वक डाउनलोड हो चुकी है। यह आपके पास लाइफटाइम (जीवनभर) के लिए सुरक्षित है, आप इसे जब चाहें दोबारा डाउनलोड कर सकते हैं।
            </p>

            <!-- Action Button -->
            <button onclick="document.getElementById('proDownloadPopup').remove(); window.location.href='../ebooks/my-library.html';" style="width:100%;padding:14px;background:linear-gradient(135deg, #138A36, #0e6527);color:#fff;border:none;border-radius:14px;font-weight:700;font-size:1rem;cursor:pointer;box-shadow:0 5px 15px rgba(19,138,54,0.3);">
                वापस लाइब्रेरी जाएं (Back to Library)
            </button>
        </div>
    `;

    document.body.appendChild(popup);
}