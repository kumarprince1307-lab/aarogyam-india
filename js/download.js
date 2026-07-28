/* =================================================================
   AAROGYAM INDIA - DOWNLOAD SYSTEM V1 (COMPLETE ORIGINAL + FIXED)
================================================================= */

// डुप्लीकेट डिक्लेरेशन एरर से बचने के लिए विंडो स्कोप का उपयोग
if (typeof window.currentBookData === 'undefined') {
    window.currentBookData = null;
    window.maxAllowedDownloads = 3;
    window.currentUserId = null;
    window.currentPurchase = null;
}

document.addEventListener("DOMContentLoaded", async () => {

    console.clear();
    console.log("====================================");
    console.log("AAROGYAM INDIA DOWNLOAD SYSTEM");
    console.log("====================================");

    const urlParams = new URLSearchParams(window.location.search);
    const bookId =
        urlParams.get("book") ||
        urlParams.get("id") ||
        "BK001";

    console.log("Book ID :", bookId);

    try {

        // -----------------------------
        // LOGIN SESSION (WITH SAFE RETRY)
        // -----------------------------
        let attempts = 0;
        while (typeof supabaseClient === "undefined" && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }

        if (typeof supabaseClient !== "undefined") {

            const {
                data: { session },
                error: sessionError
            } = await supabaseClient.auth.getSession();

            if (sessionError) {
                console.error("Session Error:", sessionError);
            }

            if (session?.user) {

                window.currentUserId = session.user.id;

                console.log("Logged User UUID:");
                console.log(window.currentUserId);

            } else {

                console.warn("User Not Logged In");

            }

        } else {

            console.error("supabaseClient Missing");

        }

        // -----------------------------
        // LOAD BOOK JSON
        // -----------------------------

        console.log("Loading books.json...");

        const response = await fetch("../data/books.json");

        if (!response.ok) {
            throw new Error("books.json Not Found");
        }

        const json = await response.json();

        window.currentBookData =
            json.books.find(book => book.id === bookId);

        console.log("Book Data");
        console.log(window.currentBookData);

        if (!window.currentBookData) {

            document.getElementById("bookHeading").textContent =
                "Book Not Found";

            disableDownloadButton("Book Not Found");

            return;
        }

        // -----------------------------
        // UPDATE UI
        // -----------------------------

        document.getElementById("bookHeading").textContent =
            window.currentBookData.heading || window.currentBookData.name;

        document.getElementById("bookCategory").textContent =
            `Category : ${window.currentBookData.category}`;

        document.getElementById("bookIdDisplay").textContent =
            window.currentBookData.id;

        document.getElementById("fileSizeDisplay").textContent =
            window.currentBookData.fileSize || "-";

        document.getElementById("accessDisplay").textContent =
            window.currentBookData.accessType || "Lifetime";

        window.maxAllowedDownloads =
            window.currentBookData.downloadLimit || 3;

        console.log("Maximum Downloads:", window.maxAllowedDownloads);

        if (window.currentBookData.downloadEnabled === false) {

            disableDownloadButton(
                "Download Disabled"
            );

            return;
        }

        await checkDownloadLimitFromDatabase(bookId);

    } catch (err) {

        console.error("Initialization Error");
        console.error(err);

        disableDownloadButton(
            "System Error"
        );

    }

});


// =======================================================
// DOWNLOAD LIMIT CHECK
// =======================================================

async function checkDownloadLimitFromDatabase(bookId) {

    console.log("------------------------------------");
    console.log("Checking Download Limit...");
    console.log("------------------------------------");

    let currentCount = 0;

    try {

        if (!window.currentUserId) {

            console.warn("User Not Logged In");

            // यदि यूजर लॉगिन नहीं है, तो लोकल स्टोरेज से चेक करें ताकि पेज अटके नहीं
            let cache = JSON.parse(localStorage.getItem("AOI_DOWNLOAD_COUNTS") || "{}");
            currentCount = cache[bookId] || 0;
            window.currentPurchase = { id: "local_" + bookId, download_count: currentCount, max_downloads: window.maxAllowedDownloads };

        } else {

            const {
                data,
                error
            } = await supabaseClient
                .from("purchases")
                .select(`
                    id,
                    download_count,
                    max_downloads
                `)
                .eq("profile_id", window.currentUserId)
                .eq("book_id", bookId)
                .single();

            if (error) {

                console.error("Purchase Fetch Error");
                console.error(error);

                // फॉलबैक के लिए लोकल स्टोरेज का उपयोग
                let cache = JSON.parse(localStorage.getItem("AOI_DOWNLOAD_COUNTS") || "{}");
                currentCount = cache[bookId] || 0;
                window.currentPurchase = { id: "local_" + bookId, download_count: currentCount, max_downloads: window.maxAllowedDownloads };

            } else {

                window.currentPurchase = data;

                console.log("Purchase Record");
                console.log(data);

                currentCount =
                    data.download_count || 0;

                window.maxAllowedDownloads =
                    data.max_downloads || 3;

                // Cache
                let cache =
                    JSON.parse(
                        localStorage.getItem("AOI_DOWNLOAD_COUNTS") || "{}"
                    );

                cache[bookId] = currentCount;

                localStorage.setItem(
                    "AOI_DOWNLOAD_COUNTS",
                    JSON.stringify(cache)
                );

            }

        }

        const remaining =
            window.maxAllowedDownloads - currentCount;

        console.log("Current Count :", currentCount);
        console.log("Remaining :", remaining);

        const remainingEl =
            document.getElementById("remainingCount");

        if (remainingEl) {

            remainingEl.textContent =
                `Remaining : ${remaining}/${window.maxAllowedDownloads}`;

        }

        if (remaining <= 0) {

            disableDownloadButton(
                "Download Limit Reached"
            );

        }

    } catch (err) {

        console.error("Download Limit Error");
        console.error(err);

    }

}


// =======================================================
// TRIGGER DOWNLOAD (FILE DOWNLOAD + DB COUNT UPDATE)
// =======================================================

window.triggerDownload = async function() {

    if (!window.currentBookData) {
        alert("डाउनलोड डेटा उपलब्ध नहीं है।");
        return;
    }

    if (!window.currentPurchase) {
        window.currentPurchase = { id: "local_" + window.currentBookData.id, download_count: 0, max_downloads: window.maxAllowedDownloads };
    }

    let bookId = window.currentBookData.id;
    let currentCount = window.currentPurchase.download_count || 0;

    if (currentCount >= window.maxAllowedDownloads) {
        alert("माफ कीजिए, आप इस ई-बुक को डाउनलोड करने की अधिकतम सीमा समाप्त कर चुके हैं।");
        return;
    }

    // काउंटर बढ़ाना
    currentCount++;
    window.currentPurchase.download_count = currentCount;

    // Supabase डेटाबेस में अपडेट करना (यदि ऑनलाइन परचेस आईडी है)
    if (window.currentUserId && typeof supabaseClient !== 'undefined' && window.currentPurchase.id && !window.currentPurchase.id.startsWith("local_")) {
        try {
            const { error } = await supabaseClient
                .from("purchases")
                .update({ download_count: currentCount })
                .eq("id", window.currentPurchase.id);

            if (error) {
                console.error("Failed to update download count in database:", error);
            } else {
                console.log("Download count updated in database successfully.");
            }
        } catch (err) {
            console.error("Database update error:", err);
        }
    }

    // लोकल स्टोरेज कैश अपडेट करना
    let cache = JSON.parse(localStorage.getItem("AOI_DOWNLOAD_COUNTS") || "{}");
    cache[bookId] = currentCount;
    localStorage.setItem("AOI_DOWNLOAD_COUNTS", JSON.stringify(cache));

    // UI और रिमेनिंग काउंट अपडेट करें
    const remaining = window.maxAllowedDownloads - currentCount;
    const remainingEl = document.getElementById("remainingCount");
    if (remainingEl) {
        remainingEl.textContent = `Remaining : ${remaining}/${window.maxAllowedDownloads}`;
    }

    if (remaining <= 0) {
        disableDownloadButton("Download Limit Reached");
    }

    // असली पीडीएफ फाइल डाउनलोड करना
    let pdfUrl = window.currentBookData.mainPdf || "pdf/full/BK001.pdf";
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${window.currentBookData.id}-Aarogyam-India.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // प्रोफेशनल सक्सेस पॉपअप दिखाना
    showDownloadSuccessPopup(window.currentBookData.heading || window.currentBookData.name || "Aarogyam India E-Book");
};


// =======================================================
// DISABLE DOWNLOAD BUTTON
// =======================================================

function disableDownloadButton(message) {

    const btn = document.getElementById("downloadBtn");

    if (btn) {

        btn.disabled = true;

        btn.style.background =
            "linear-gradient(135deg,#9CA3AF,#6B7280)";

        btn.style.cursor = "not-allowed";

        btn.innerHTML = "🔒 Download Locked";

    }

    const status =
        document.getElementById("downloadStatusText");

    if (status) {

        status.textContent = message;

    }

}



// =======================================================
// PREMIUM SUCCESS POPUP
// =======================================================

function showDownloadSuccessPopup(bookTitle){

    const old =
        document.getElementById("proDownloadPopup");

    if(old) old.remove();

    const popup =
        document.createElement("div");

    popup.id="proDownloadPopup";

    popup.style.cssText=`
position:fixed;
left:0;
top:0;
width:100%;
height:100%;
background:rgba(0,0,0,.75);
display:flex;
justify-content:center;
align-items:center;
z-index:999999;
backdrop-filter:blur(8px);
padding:20px;
`;

popup.innerHTML=`

<div style="
max-width:430px;
width:100%;
background:#fff;
border-radius:28px;
overflow:hidden;
box-shadow:0 25px 60px rgba(0,0,0,.35);
animation:popup .35s ease;
">

<div style="
background:linear-gradient(135deg,#138A36,#0F6A29);
padding:28px;
text-align:center;
color:white;
">

<div style="
font-size:65px;
margin-bottom:10px;
">
✅
</div>

<h2 style="
margin:0;
font-size:28px;
font-weight:800;
">
Download Successful
</h2>

<p style="
margin-top:10px;
font-size:15px;
opacity:.95;
">

Your eBook is Ready

</p>

</div>

<div style="padding:28px;">

<div style="
background:#F8FAFC;
border-radius:18px;
padding:18px;
margin-bottom:18px;
">

<div style="font-size:15px;color:#555;">
Book Name
</div>

<div style="
font-size:18px;
font-weight:700;
margin-top:5px;
color:#111;
">

${bookTitle}

</div>

</div>

<div style="
background:#ECFDF5;
border:1px solid #A7F3D0;
padding:18px;
border-radius:18px;
margin-bottom:20px;
">

<div style="
font-size:16px;
font-weight:700;
color:#138A36;
margin-bottom:8px;
">

🎉 Congratulations!

</div>

<div style="
font-size:14px;
line-height:1.7;
color:#444;
">

आपकी ई-बुक सफलतापूर्वक डाउनलोड हो चुकी है।

यह खरीद आपके अकाउंट में Lifetime सुरक्षित रहेगी।

आप इसे भविष्य में अपनी My Library से भी डाउनलोड कर सकते हैं।

</div>

</div>

<button
onclick="window.location.href='../ebooks/my-library.html'"
style="
width:100%;
padding:15px;
border:none;
border-radius:16px;
background:linear-gradient(135deg,#138A36,#0E6527);
color:white;
font-size:17px;
font-weight:700;
cursor:pointer;
">

📚 Go To My Library

</button>

<button
onclick="document.getElementById('proDownloadPopup').remove()"
style="
margin-top:12px;
width:100%;
padding:13px;
border-radius:16px;
border:2px solid #ddd;
background:white;
font-size:15px;
font-weight:700;
cursor:pointer;
">

Close

</button>

</div>

</div>

<style>

@keyframes popup{

from{

opacity:0;
transform:scale(.80);

}

to{

opacity:1;
transform:scale(1);

}

}

</style>

`;

document.body.appendChild(popup);

console.log("Premium Success Popup Displayed");

}