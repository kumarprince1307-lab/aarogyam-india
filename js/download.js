/* =================================================================
   AAROGYAM INDIA - PREMIUM DOWNLOAD EXPERIENCE (V1 FINAL)
================================================================= */

// --- GLOBAL STATE ---
let state = {
    bookId: null,
    bookData: null,
    userData: null,
    purchaseData: null,
};

document.addEventListener("DOMContentLoaded", async () => {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const downloadCard = document.getElementById('downloadCard');

    try {
        // 1. Get Book ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        state.bookId = urlParams.get("book") || urlParams.get("id");
        if (!state.bookId) throw new Error("Book ID is missing from the URL.");

        // 2. Authenticate user (stricter check)
        const user = await getAuthenticatedUser();
        if (!user) {
            showError("Authentication Required", "Please log in to access your download.");
            return;
        }
        state.userData = user;

        // 3. Fetch all necessary data in parallel
        const [bookData, purchaseData] = await Promise.all([
            fetchBookData(state.bookId),
            fetchPurchaseRecord(user.id, state.bookId),
        ]);

        if (!bookData) throw new Error("Book data could not be found.");
        if (!purchaseData) throw new Error("You have not purchased this book.");

        state.bookData = bookData;
        state.purchaseData = purchaseData;

        // 4. Check if download is enabled for this book
        if (state.bookData.downloadEnabled === false) {
            throw new Error("Download for this book is currently disabled by the administrator.");
        }

        // 5. Populate the UI with all fetched data
        populateUI();

        // 6. Hide loading state and show the main card
        loadingState.style.display = 'none';
        downloadCard.style.display = 'block';

    } catch (err) {
        showError("An Error Occurred", err.message);
    }
});

// --- DATA FETCHING FUNCTIONS ---

async function getAuthenticatedUser() {
    const { data: { session } } = await db.auth.getSession();
    if (!session || !session.user) return null;

    const { data: profile, error } = await db
        .from('profiles')
        .select('id, full_name, mobile')
        .eq('id', session.user.id)
        .single();

    if (error) throw new Error("Failed to fetch user profile.");
    return profile;
}

async function fetchBookData(bookId) {
    const response = await fetch("../data/books.json");
    if (!response.ok) throw new Error("Failed to load book master file.");
    const data = await response.json();
    return data.books.find(book => book.id === bookId);
}

async function fetchPurchaseRecord(userId, bookId) {
    const { data, error } = await db
        .from("purchases")
        .select('*')
        .eq("profile_id", userId)
        .eq("book_id", bookId)
        .single();
    if (error) return null; // It's not an error if no record is found
    return data;
}

// --- UI MANIPULATION ---

function populateUI() {
    // Book Info
    document.getElementById('bookCover').src = state.bookData.cover || '';
    document.getElementById('bookName').textContent = state.bookData.name || 'N/A';
    document.getElementById('bookCategory').textContent = state.bookData.category || 'N/A';

    // Purchase Summary
    document.getElementById('customerName').textContent = state.userData.full_name || 'Valued Customer';
    document.getElementById('customerMobile').textContent = state.userData.mobile || 'N/A';
    document.getElementById('bookId').textContent = state.bookData.id;
    document.getElementById('purchaseDate').textContent = new Date(state.purchaseData.purchase_date).toLocaleDateString('en-GB');

    // Download Status
    const used = state.purchaseData.download_count || 0;
    const max = state.bookData.downloadLimit || 3;
    const remaining = max - used;

    document.getElementById('downloadsUsed').textContent = used;
    document.getElementById('downloadsRemaining').textContent = remaining;
    document.getElementById('downloadsMax').textContent = max;

    const downloadBtn = document.getElementById('downloadBtn');
    const readNowBtn = document.getElementById('readNowBtn');

    if (remaining <= 0) {
        document.getElementById('statusReady').style.display = 'none';
        document.getElementById('statusExhausted').style.display = 'block';
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Limit Reached';
    }

    // Setup button actions
    downloadBtn.onclick = triggerDownload;
    readNowBtn.onclick = () => {
        window.location.href = `reader.html?book=${state.bookId}`;
    };
}

function showError(title, message) {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');

    loadingState.style.display = 'none';
    errorMessage.textContent = `${title}: ${message}`;
    errorState.style.display = 'block';
}

// --- CORE DOWNLOAD LOGIC ---

async function triggerDownload() {
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<div class="spinner-small"></div> Processing...';

    const used = state.purchaseData.download_count || 0;
    const max = state.bookData.downloadLimit || 3;

    if (used >= max) {
        alert("Download limit reached.");
        downloadBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Limit Reached';
        return;
    }

    const newCount = used + 1;

    // Update Supabase first
    const { error } = await db
        .from('purchases')
        .update({ download_count: newCount })
        .eq('id', state.purchaseData.id);

    if (error) {
        alert("Failed to update download count. Please try again.");
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Download PDF';
        return;
    }

    // Update state and UI
    state.purchaseData.download_count = newCount;
    document.getElementById('downloadsUsed').textContent = newCount;
    document.getElementById('downloadsRemaining').textContent = max - newCount;

    // Trigger file download
    const link = document.createElement('a');
    link.href = state.bookData.mainPdf;
    link.download = `${state.bookData.id}-Aarogyam-India.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success popup and re-enable button
    showSuccessPopup();
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Download PDF';

    if (newCount >= max) {
        document.getElementById('statusReady').style.display = 'none';
        document.getElementById('statusExhausted').style.display = 'block';
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Limit Reached';
    }
}

// --- SUCCESS POPUP ---

function showSuccessPopup() {
    const popup = document.getElementById('successPopup');
    document.getElementById('popupBookCover').src = state.bookData.cover;
    document.getElementById('popupBookName').textContent = state.bookData.name;
    document.getElementById('popupCustomerName').textContent = state.userData.full_name;

    popup.style.display = 'flex';

    document.getElementById('popupReadNowBtn').onclick = () => {
        window.location.href = `reader.html?book=${state.bookId}`;
    };

    document.getElementById('popupCloseBtn').onclick = () => {
        popup.style.display = 'none';
    };

    // Close on overlay click
    popup.onclick = (event) => {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    };
}
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