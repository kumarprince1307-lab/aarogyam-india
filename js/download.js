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
    const bookId = urlParams.get("book") || urlParams.get("id") || "BK001";
    console.log("Book ID:", bookId);

    try {
        const user = getCurrentUser();
        if (user) {
            window.currentUserId = user.id;
            console.log("Logged In User ID:", user.id);
        } else {
            console.warn("User Not Logged In");
        }

        const response = await fetch("../data/books.json");
        if (!response.ok) {
            throw new Error("books.json Not Found");
        }
        const json = await response.json();
        window.currentBookData = json.books.find(book => book.id === bookId);

        if (!window.currentBookData) {
            document.getElementById("bookHeading").textContent = "Book Not Found";
            disableDownloadButton("Book Not Found");
            return;
        }

        document.getElementById("bookHeading").textContent = window.currentBookData.heading || window.currentBookData.name;
        document.getElementById("bookCategory").textContent = `Category: ${window.currentBookData.category}`;
        document.getElementById("bookIdDisplay").textContent = window.currentBookData.id;
        document.getElementById("fileSizeDisplay").textContent = window.currentBookData.fileSize || "-";
        document.getElementById("accessDisplay").textContent = window.currentBookData.accessType || "Lifetime";
        window.maxAllowedDownloads = window.currentBookData.downloadLimit || 3;

        if (window.currentBookData.downloadEnabled === false) {
            disableDownloadButton("Download Disabled");
            return;
        }

        await checkDownloadLimitFromDatabase(bookId);

    } catch (err) {
        console.error("Initialization Error:", err);
        disableDownloadButton("System Error");
    }
});


// =======================================================
// DOWNLOAD LIMIT CHECK
// =======================================================

async function checkDownloadLimitFromDatabase(bookId) {
    const user = getCurrentUser();
    if (!user) {
        disableDownloadButton("You must be logged in to download.");
        return;
    }

    const purchase = await getPurchaseForDownload(user.id, bookId);
    if (!purchase) {
        disableDownloadButton("Purchase record not found.");
        return;
    }

    const currentCount = purchase.download_count || 0;
    const limit = window.maxAllowedDownloads;
    const remaining = limit - currentCount;

    const remainingEl = document.getElementById("remainingCount");
    if (remainingEl) {
        remainingEl.textContent = `Remaining: ${remaining}/${limit}`;
    }

    if (remaining <= 0) {
        disableDownloadButton("Download limit reached.");
    }
}


// =======================================================
// TRIGGER DOWNLOAD (FILE DOWNLOAD + DB COUNT UPDATE)
// =======================================================

window.triggerDownload = async function() {
    const user = getCurrentUser();
    if (!user) {
        alert("You must be logged in to download.");
        return;
    }

    if (!window.currentBookData) {
        alert("Book data is not available.");
        return;
    }

    const bookId = window.currentBookData.id;
    
    const result = await processDownload(user.id, bookId);

    if (result.success) {
        const remainingEl = document.getElementById("remainingCount");
        if (remainingEl) {
            remainingEl.textContent = `Remaining: ${result.remaining}/${window.maxAllowedDownloads}`;
        }

        if (result.remaining <= 0) {
            disableDownloadButton("Download limit reached");
        }
        
        // Trigger the actual file download
        const pdfUrl = window.currentBookData.mainPdf || `pdf/full/${bookId}.pdf`;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${bookId}-Aarogyam-India.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showDownloadSuccessPopup(window.currentBookData.heading || window.currentBookData.name);

    } else {
        alert(result.message || "An unknown error occurred during download.");
        if(result.message.includes("limit")){
             disableDownloadButton("Download limit reached");
        }
    }
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
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('PWA Service Worker Active'))
      .catch(err => console.log('PWA Error:', err));
  });
}