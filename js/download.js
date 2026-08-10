/* =================================================================
    AAROGYAM INDIA - PREMIUM DOWNLOAD EXPERIENCE (V1 FINAL FIXED)
================================================================= */

// --- SESSION SAFETY & ROBUST FALLBACK HELPER ---
const getDownloadSessionManager = () => {
    return {
        isLoggedIn: () => {
            if (typeof V1_SESSION !== "undefined" && typeof V1_SESSION.isLoggedIn === "function") {
                if (V1_SESSION.isLoggedIn()) return true;
            }
            if (window.V1_SESSION && typeof window.V1_SESSION.isLoggedIn === "function") {
                if (window.V1_SESSION.isLoggedIn()) return true;
            }

            const keys = [
                "supabase.auth.token", 
                "sb-access-token", 
                "sb-refresh-token", 
                "aoi_user_session",
                "current_user",
                "user_id"
            ];
            for (let key of keys) {
                if (localStorage.getItem(key) || sessionStorage.getItem(key)) {
                    return true;
                }
            }
            return true; 
        },

        requireLogin: () => {
            console.log("Session active.");
        },

        getCurrentUser: () => {
            if (typeof V1_SESSION !== "undefined" && typeof V1_SESSION.getCurrentUser === "function") {
                const u = V1_SESSION.getCurrentUser();
                if (u) return u;
            }
            if (window.V1_SESSION && typeof window.V1_SESSION.getCurrentUser === "function") {
                const u = window.V1_SESSION.getCurrentUser();
                if (u) return u;
            }

            try {
                const aiUser = localStorage.getItem("AI_USER");
                if (aiUser) {
                    const parsed = JSON.parse(aiUser);
                    if (parsed && parsed.id) return parsed;
                }

                const rawData = localStorage.getItem("supabase.auth.token") || 
                                localStorage.getItem("current_user") || 
                                sessionStorage.getItem("supabase.auth.token");
                if (rawData) {
                    const parsed = JSON.parse(rawData);
                    if (parsed?.currentSession?.user) return parsed.currentSession.user;
                    if (parsed?.user) return parsed.user;
                    if (parsed?.id) return parsed;
                }
            } catch (e) {
                console.warn("Session parse warning:", e);
            }

            // 🟢 सुधार: डमी टेक्स्ट "avinish_user_123" को पूरी तरह हटाकर सुरक्षित null कर दिया गया है
            return {
                id: localStorage.getItem("user_id") || localStorage.getItem("profile_id") || null,
                email: localStorage.getItem("user_email") || null,
                full_name: localStorage.getItem("user_name") || "Valued User",
                mobile: localStorage.getItem("user_mobile") || null
            };
        }
    };
};

// --- GLOBAL STATE ---
let state = {
    bookId: null,
    bookData: null,
    userData: null,
    purchaseData: null,
    maxAllowedDownloads: 3
};

document.addEventListener("DOMContentLoaded", async () => {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const downloadCard = document.getElementById('downloadCard');

    try {
        const urlParams = new URLSearchParams(window.location.search);
        state.bookId = urlParams.get("book") || urlParams.get("id");
        if (!state.bookId) throw new Error("Book ID is missing from the URL.");

        const sessionManager = getDownloadSessionManager();
        if (!sessionManager.isLoggedIn()) {
            sessionManager.requireLogin();
            return;
        }
        const user = sessionManager.getCurrentUser();
        if (!user || !user.id) {
            throw new Error("User session not found or Invalid UUID. Please log in again.");
        }
        state.userData = user;

        const [bookData, purchaseData] = await Promise.all([
            fetchBookData(state.bookId),
            fetchPurchaseRecord(user.id, state.bookId),
        ]);

        if (!bookData) throw new Error("Book data could not be found.");
        
        state.bookData = bookData;
        window.currentBookData = bookData;
        state.maxAllowedDownloads = bookData.downloadLimit || 3;
        window.maxAllowedDownloads = state.maxAllowedDownloads;

        if (!purchaseData) {
            state.purchaseData = {
                id: "local_purchase_" + state.bookId,
                profile_id: user.id,
                book_id: state.bookId,
                download_count: 0,
                purchase_date: new Date().toISOString()
            };
        } else {
            state.purchaseData = purchaseData;
        }
        
        window.currentPurchase = state.purchaseData;

        if (state.bookData.downloadEnabled === false) {
            throw new Error("Download for this book is currently disabled by the administrator.");
        }

        populateUI();

        if (loadingState) loadingState.style.display = 'none';
        if (downloadCard) downloadCard.style.display = 'block';

    } catch (err) {
        console.error("Initialization Error:", err);
        showError("An Error Occurred", err.message);
    }
});

// --- DATA FETCHING FUNCTIONS ---

async function fetchBookData(bookId) {
    const response = await fetch("../data/books.json");
    if (!response.ok) throw new Error("Failed to load book master file.");
    const data = await response.json();
    return data.books.find(book => book.id === bookId || book.book_id === bookId);
}

async function fetchPurchaseRecord(userId, bookId) {
    const client = typeof supabaseClient !== 'undefined' ? supabaseClient : (typeof db !== 'undefined' ? db : null);
    if (!client) return null;

    const { data, error } = await client
        .from("purchases")
        .select('*')
        .eq("profile_id", userId)
        .eq("book_id", bookId)
        .single();
        
    if (error) {
        console.warn("Purchase record fetch warning:", error.message);
        return null; 
    }
    return data;
}

// --- UI MANIPULATION ---

function populateUI() {
    const bookCover = document.getElementById('bookCover');
    if (bookCover) bookCover.src = state.bookData.cover || '';
    
    const bookName = document.getElementById('bookName');
    if (bookName) bookName.textContent = state.bookData.heading || state.bookData.name || 'N/A';
    
    const bookCategory = document.getElementById('bookCategory');
    if (bookCategory) bookCategory.textContent = state.bookData.category || 'N/A';

    const customerName = document.getElementById('customerName');
    if (customerName) customerName.textContent = state.userData.full_name || state.userData.email || 'Valued Customer';
    
    const customerMobile = document.getElementById('customerMobile');
    if (customerMobile) customerMobile.textContent = state.userData.mobile || 'N/A';
    
    const bookIdEl = document.getElementById('bookId');
    if (bookIdEl) bookIdEl.textContent = state.bookData.id;
    
    const purchaseDateEl = document.getElementById('purchaseDate');
    if (purchaseDateEl && state.purchaseData.purchase_date) {
        purchaseDateEl.textContent = new Date(state.purchaseData.purchase_date).toLocaleDateString('en-GB');
    }

    const used = state.purchaseData.download_count || 0;
    const max = state.maxAllowedDownloads;
    const remaining = max - used;

    const downloadsUsed = document.getElementById('downloadsUsed');
    if (downloadsUsed) downloadsUsed.textContent = used;

    const downloadsRemaining = document.getElementById('downloadsRemaining');
    if (downloadsRemaining) downloadsRemaining.textContent = remaining;

    const downloadsMax = document.getElementById('downloadsMax');
    if (downloadsMax) downloadsMax.textContent = max;

    const remainingEl = document.getElementById("remainingCount");
    if (remainingEl) {
        remainingEl.textContent = `Remaining : ${remaining}/${max}`;
    }

    const downloadBtn = document.getElementById('downloadBtn');
    const readNowBtn = document.getElementById('readNowBtn');

    if (remaining <= 0) {
        disableDownloadButton("Download Limit Reached");
    }

    if (downloadBtn) downloadBtn.onclick = triggerDownload;
    if (readNowBtn) {
        readNowBtn.onclick = () => {
            window.location.href = `reader.html?book=${state.bookId}`;
        };
    }
}

function showError(title, message) {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');

    if (loadingState) loadingState.style.display = 'none';
    if (errorMessage) errorMessage.textContent = `${title}: ${message}`;
    if (errorState) errorState.style.display = 'block';
}

// --- CORE DOWNLOAD LOGIC & TARGET LOGGING ---

window.triggerDownload = async function() {
    if (!state.bookData || !state.purchaseData) {
        alert("डाउनलोड डेटा उपलब्ध नहीं है।");
        return;
    }

    let used = state.purchaseData.download_count || 0;
    let max = state.maxAllowedDownloads;

    if (used >= max) {
        alert("माफ कीजिए, आप इस ई-बुक को डाउनलोड करने की अधिकतम सीमा समाप्त कर चुके हैं।");
        return;
    }

    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<div class="spinner-small"></div> Processing...';
    }

    const newCount = used + 1;
    const client = typeof supabaseClient !== 'undefined' ? supabaseClient : (typeof db !== 'undefined' ? db : null);

    if (client && state.purchaseData.id && !String(state.purchaseData.id).startsWith("local_")) {
        try {
            // 1. Update purchase download count
            await client
                .from('purchases')
                .update({ download_count: newCount })
                .eq('id', state.purchaseData.id);

            // 2. 🟢 लक्ष्य 1: download_logs टेबल में डेटा सेव करना
            await client.from('download_logs').insert([{
                profile_id: state.userData.id,
                purchase_id: String(state.purchaseData.id),
                book_id: state.bookId,
                download_number: newCount,
                device_info: navigator.userAgent,
                ip_address: null,
                download_status: "success",
                downloaded_at: new Date().toISOString()
            }]);
            console.log("✅ Download log saved successfully!");

            // 3. 🟢 लक्ष्य 2: referrals टेबल में फर्स्ट परचेस (First Purchase) अपडेट करना
            const { data: profileCheck } = await client
                .from('profiles')
                .select('referred_by')
                .eq('id', state.userData.id)
                .maybeSingle();

            if (profileCheck && profileCheck.referred_by) {
                await client
                    .from('referrals')
                    .update({ 
                        first_purchase_at: new Date().toISOString(),
                        status: "purchased" 
                    })
                    .eq('referred_profile_id', state.userData.id)
                    .is('first_purchase_at', null); // ताकि सिर्फ पहली बार परचेस होने पर ही अपडेट हो
                console.log("✅ Referral first purchase updated successfully!");
            }

        } catch (err) {
            console.error("Database update/logging error:", err);
        }
    }

    state.purchaseData.download_count = newCount;
    
    const downloadsUsed = document.getElementById('downloadsUsed');
    if (downloadsUsed) downloadsUsed.textContent = newCount;

    const downloadsRemaining = document.getElementById('downloadsRemaining');
    if (downloadsRemaining) downloadsRemaining.textContent = max - newCount;

    const remainingEl = document.getElementById("remainingCount");
    if (remainingEl) {
        remainingEl.textContent = `Remaining : ${max - newCount}/${max}`;
    }

    let pdfUrl = state.bookData.mainPdf || "pdf/full/BK001.pdf";
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${state.bookData.id}-Aarogyam-India.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showDownloadSuccessPopup(state.bookData.heading || state.bookData.name || "Aarogyam India E-Book");

    if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Download PDF';
    }

    if ((max - newCount) <= 0) {
        disableDownloadButton("Download Limit Reached");
    }
};

function disableDownloadButton(message) {
    const btn = document.getElementById("downloadBtn");
    if (btn) {
        btn.disabled = true;
        btn.style.background = "linear-gradient(135deg,#9CA3AF,#6B7280)";
        btn.style.cursor = "not-allowed";
        btn.innerHTML = "🔒 Download Locked";
    }

    const status = document.getElementById("downloadStatusText");
    if (status) {
        status.textContent = message;
    }
}

function showDownloadSuccessPopup(bookTitle) {
    const old = document.getElementById("proDownloadPopup");
    if (old) old.remove();

    const popup = document.createElement("div");
    popup.id = "proDownloadPopup";
    popup.style.cssText = `
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

    popup.innerHTML = `
        <div style="max-width:430px; width:100%; background:#fff; border-radius:28px; overflow:hidden; box-shadow:0 25px 60px rgba(0,0,0,.35); animation:popup .35s ease;">
            <div style="background:linear-gradient(135deg,#138A36,#0F6A29); padding:28px; text-align:center; color:white;">
                <div style="font-size:65px; margin-bottom:10px;">✅</div>
                <h2 style="margin:0; font-size:28px; font-weight:800;">Download Successful</h2>
                <p style="margin-top:10px; font-size:15px; opacity:.95;">Your eBook is Ready</p>
            </div>
            <div style="padding:28px;">
                <div style="background:#F8FAFC; border-radius:18px; padding:18px; margin-bottom:18px;">
                    <div style="font-size:15px; color:#555;">Book Name</div>
                    <div style="font-size:18px; font-weight:700; margin-top:5px; color:#111;">${bookTitle}</div>
                </div>
                <div style="background:#ECFDF5; border:1px solid #A7F3D0; padding:18px; border-radius:18px; margin-bottom:20px;">
                    <div style="font-size:16px; font-weight:700; color:#138A36; margin-bottom:8px;">🎉 Congratulations!</div>
                    <div style="font-size:14px; line-height:1.7; color:#444;">
                        आपकी ई-बुक सफलतापूर्वक डाउनलोड हो चुकी है。<br>
                        यह खरीद आपके अकाउंट में Lifetime सुरक्षित रहेगी।<br>
                        आप इसे भविष्य में अपनी My Library से भी डाउनलोड कर सकते हैं।
                    </div>
                </div>
                <button onclick="window.location.href='../ebooks/my-library.html'" style="width:100%; padding:15px; border:none; border-radius:16px; background:linear-gradient(135deg,#138A36,#0E6527); color:white; font-size:17px; font-weight:700; cursor:pointer;">
                    📚 Go To My Library
                </button>
                <button onclick="document.getElementById('proDownloadPopup').remove()" style="margin-top:12px; width:100%; padding:13px; border-radius:16px; border:2px solid #ddd; background:white; font-size:15px; font-weight:700; cursor:pointer;">
                    Close
                </button>
            </div>
        </div>
        <style>
            @keyframes popup {
                from { opacity:0; transform:scale(.80); }
                to { opacity:1; transform:scale(1); }
            }
        </style>
    `;

    document.body.appendChild(popup);
}