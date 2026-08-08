/* ==========================================
   AAROGYAM INDIA
   DEMO-BOOK.JS (Complete & Final - With Smart Referral Engine)
========================================== */

"use strict";

let currentBookData = null;
let previewImages = [];
let currentIndex = 0;
let referrerDisplay = null;

document.addEventListener("DOMContentLoaded", async () => {
    showLoader();
    syncDemoShareContext(); // URL और सेशन से शेयर आईडी रिकवर करना
    await loadBookData();
    initializePage();
    setupEventListeners();
});

/*==================================================
  0. SYNC SHARE CONTEXT & REFERRAL LOOKUP
==================================================*/
function syncDemoShareContext() {
    const params = new URLSearchParams(window.location.search);
    
    const sessionReferralId = (window.V1_SESSION && typeof window.V1_SESSION.getReferralId === 'function') 
        ? window.V1_SESSION.getReferralId() : null;

    const shareTokenFromUrl = params.get('share_token') || params.get('share_id') || params.get('tracking_token');
    const referralMobileParam = params.get('referral_mobile') || params.get('referral');

    const shareContext = {
        source: params.get("source") || params.get("utm_source") || "demo",
        share_channel: params.get("share_channel") || params.get("channel") || params.get("utm_medium") || null,
        share_token: shareTokenFromUrl || sessionReferralId || 'AI000004',
        referral_mobile: referralMobileParam || null,
        asset_url: window.location.href || null
    };

    if (typeof persistShareContext === "function") {
        persistShareContext(shareContext);
    }

    const demoRefInput = document.getElementById("referralMobile");
    if (demoRefInput) {
        if (!demoRefInput.value) {
            demoRefInput.value = shareContext.share_token || shareContext.referral_mobile || 'AI000004';
        }

        if (demoRefInput.value) {
            lookupReferrerName(demoRefInput.value.trim());
        }
    }
}

// स्मार्ट डेटा बाइंडिंग बंडल
window.currentReferrerData = {
    uuid: null,
    name: null,
    mobile: null,
    shareId: null
};

async function lookupReferrerName(identifier) {
    if (!identifier) return;
    
    try {
        const activeDb = window.dbClient || window.supabase;
        if (!activeDb) return;

        let data = null;

        if (/^[6-9]\d{9}$/.test(identifier)) {
            const res = await activeDb
                .from("profiles")
                .select("id, full_name, share_id, mobile")
                .eq("mobile", identifier)
                .maybeSingle();
            data = res.data;
        } 
        
        if (!data) {
            const res = await activeDb
                .from("profiles")
                .select("id, full_name, share_id, mobile")
                .eq("share_id", identifier)
                .maybeSingle();
            data = res.data;
        }

        if (data) {
            window.currentReferrerData = {
                uuid: data.id,
                name: data.full_name || "Aarogyam Member",
                mobile: data.mobile,
                shareId: data.share_id
            };
            showReferrerGreen(`✔ Referred by: ${data.full_name} (${data.mobile || 'No Mobile'})`);
        } else {
            window.currentReferrerData = { uuid: null, name: null, mobile: null, shareId: null };
            showReferrerRed("✖ Invalid Share ID/Mobile");
        }
    } catch (err) {
        console.error("Referrer lookup exception:", err);
    }
}

function showReferrerGreen(text) {
    referrerDisplay = document.getElementById("referrerDisplayName");
    if (referrerDisplay) {
        referrerDisplay.style.color = "#28a745"; 
        referrerDisplay.textContent = text;
    }
}

function showReferrerRed(text) {
    referrerDisplay = document.getElementById("referrerDisplayName");
    if (referrerDisplay) {
        referrerDisplay.style.color = "#dc3545"; 
        referrerDisplay.textContent = text;
    }
}

/*==================================================
  1. LOAD BOOK DATA FROM books.json BASED ON URL ID
==================================================*/
async function loadBookData() {
    try {
        const params = new URLSearchParams(window.location.search);
        const bookId = params.get("id") || "BK001";

        const response = await fetch("../data/books.json");
        const jsonResult = await response.json();
        const booksArray = Array.isArray(jsonResult) ? jsonResult : (jsonResult.books || []);
        
        currentBookData = booksArray.find(item => item.id === bookId || item.book_id === bookId);

        if (!currentBookData) {
            alert("Book Demo Not Found");
            window.location.href = "../ebooks/agriculture.html";
            return;
        }

        document.title = `${currentBookData.name} | Aarogyam India`;
        
        const coverEl = document.getElementById("bookCover");
        if (coverEl) coverEl.src = currentBookData.cover || currentBookData.thumbnail;

        const titleEl = document.getElementById("bookTitle");
        if (titleEl) titleEl.textContent = currentBookData.name;

        const mrpEl = document.getElementById("bookMrp");
        if (mrpEl) mrpEl.textContent = "₹" + currentBookData.mrp;

        const priceEl = document.getElementById("bookPrice");
        if (priceEl) priceEl.textContent = "₹" + currentBookData.offerPrice;

        const barMrp = document.getElementById("barMrp");
        if (barMrp) barMrp.textContent = "₹" + currentBookData.mrp;

        const barOffer = document.getElementById("barOffer");
        if (barOffer) barOffer.textContent = "₹" + currentBookData.offerPrice;

        const sliderContainer = document.querySelector(".slider-container");
        if (sliderContainer && currentBookData.demoImages && Array.isArray(currentBookData.demoImages)) {
            sliderContainer.innerHTML = "";
            currentBookData.demoImages.forEach((imgPath, index) => {
                let imgTag = document.createElement("img");
                imgTag.src = imgPath;
                imgTag.className = index === 0 ? "preview-image active" : "preview-image";
                imgTag.alt = `Preview Page ${index + 1}`;
                imgTag.oncontextmenu = (e) => e.preventDefault();
                sliderContainer.appendChild(imgTag);
            });
        }

        const buyBtn = document.getElementById("stickyBuyBtn");
        if(buyBtn) {
            buyBtn.href = `../ebooks/checkout.html?id=${currentBookData.id}`;
        }

        const backBtn = document.getElementById("backBtn");
        if(backBtn) {
            backBtn.href = "../ebooks/agriculture.html";
        }

    } catch (error) {
        console.error("Error loading book data:", error);
        showToast("डेटा लोड करने में समस्या हुई।");
    }
}

/*==================================================
  2. DOM ELEMENTS & UTILITIES
==================================================*/
const demoForm = document.getElementById("demoForm");
const formSection = document.querySelector(".demo-form-section");
const demoPreview = document.getElementById("demoPreview");
const previewSlider = document.querySelector(".preview-slider");
const loader = document.getElementById("loader");
const toast = document.getElementById("toast");

const nameInput = document.getElementById("name");
const mobileInput = document.getElementById("mobile");
const emailInput = document.getElementById("email");
const stateInput = document.getElementById("state");
const districtInput = document.getElementById("district");
const refInputEl = document.getElementById("referralMobile");

function showLoader() { if(loader) loader.style.display = "flex"; }
function hideLoader() { if(loader) loader.style.display = "none"; }

function showToast(message) {
    if(!toast) return;
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function initializePage() {
    hideLoader();
    if(demoPreview) demoPreview.style.display = "none";
    if(previewSlider) previewSlider.style.display = "none";
}

/*==================================================
  3. VALIDATION & SUPABASE DATA SAVE
==================================================*/
function validateForm() {
    const name = nameInput.value.trim();
    if (name.length < 3) {
        showToast("कृपया पूरा नाम दर्ज करें");
        nameInput.focus();
        return false;
    }

    const mobile = mobileInput.value.trim();
    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobilePattern.test(mobile)) {
        showToast("सही मोबाइल नंबर दर्ज करें");
        mobileInput.focus();
        return false;
    }
    return true;
}

/* ==================================================
  4. FORM SUBMIT EVENT (डेमो फॉर्म सबमिट और स्मार्ट रेफरल बाइंडिंग)
================================================== */
if(demoForm) {
    demoForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (!validateForm()) return;

        showLoader();

        const enteredReferral = refInputEl ? refInputEl.value.trim() : 'AI000004';
        const finalUuid = window.currentReferrerData.uuid || null;
        const finalReferralMobile = window.currentReferrerData.mobile || null;
        const finalReferralCode = window.currentReferrerData.shareId || enteredReferral;

        const userData = {
            bookId: currentBookData ? currentBookData.id : "BK001",
            name: nameInput.value.trim(),
            mobile: mobileInput.value.trim(),
            email: emailInput.value.trim(),
            state: stateInput.value.trim(),
            district: districtInput.value.trim(),
            referred_by: finalUuid,
            referralMobile: finalReferralMobile,
            referralCode: finalReferralCode,
            source: "demo"
        };

        // पहले मुख्य रजिस्ट्रेशन इंजन से यूजर को रजिस्टर करें ताकि रेफरल डेटा पक्का सेव हो
        if (typeof registerUser === "function") {
            try {
                await registerUser({
                    fullName: userData.name,
                    mobile: userData.mobile,
                    email: userData.email,
                    referred_by: userData.referred_by,
                    referralMobile: userData.referralMobile,
                    referralCode: userData.referralCode,
                    source: "demo"
                });
            } catch (regErr) {
                console.log("Demo reg sync note:", regErr);
            }
        }

        // डेमो यूजर सेव फंक्शन कॉल करना
        if (typeof saveDemoUser === "function") {
            await saveDemoUser(userData);
        }

        hideLoader();
        unlockDemo(); 
    });
}

/* ==================================================
  DEMO UNLOCK FUNCTION (डेमो स्क्रीन दिखाने का फंक्शन)
================================================== */
function unlockDemo() {
    if(formSection) formSection.style.display = "none"; 
    if(demoPreview) demoPreview.style.display = "block";
    if(previewSlider) previewSlider.style.display = "block"; 
    showToast("🎉 Demo सफलतापूर्वक Unlock हो गया");
    
    setupSliderImages();
}

/* ==================================================
  5. IMAGE SLIDER & VIEWER LOGIC
================================================== */
let prevBtn, nextBtn;

function setupEventListeners() {
    setupSliderImages();
}

function setupSliderImages() {
    previewImages = document.querySelectorAll(".preview-image");
    prevBtn = document.querySelector(".prev-btn");
    nextBtn = document.querySelector(".next-btn");

    if(nextBtn) nextBtn.onclick = nextImage;
    if(prevBtn) prevBtn.onclick = previousImage;

    if(previewSlider) {
        let touchStartX = 0;
        let touchEndX = 0;
        previewSlider.addEventListener("touchstart", (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        previewSlider.addEventListener("touchend", (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) nextImage();
            else if (touchEndX - touchStartX > 50) previousImage();
        });
    }

    previewImages.forEach((image, index) => {
        image.onclick = () => {
            currentIndex = index;
            openViewer();
        };
    });
}

function showImage(index) {
    previewImages.forEach((image) => image.classList.remove("active"));
    if(previewImages[index]) previewImages[index].classList.add("active");
}

function nextImage() {
    if(previewImages.length === 0) return;
    currentIndex++;
    if (currentIndex >= previewImages.length) currentIndex = 0;
    showImage(currentIndex);
    updateViewerImage();
}

function previousImage() {
    if(previewImages.length === 0) return;
    currentIndex--;
    if (currentIndex < 0) currentIndex = previewImages.length - 1;
    showImage(currentIndex);
    updateViewerImage();
}

const imageViewer = document.getElementById("imageViewer");
const viewerImage = document.getElementById("viewerImage");
const viewerPrev = document.querySelector(".viewer-prev");
const viewerNext = document.querySelector(".viewer-next");
const closeViewer = document.querySelector(".close-viewer");

function openViewer() {
    if(!imageViewer || !viewerImage) return;
    viewerImage.src = previewImages[currentIndex].src;
    imageViewer.style.display = "flex";
    viewerImage.oncontextmenu = (e) => e.preventDefault();
}

if(viewerNext) viewerNext.onclick = () => { nextImage(); };
if(viewerPrev) viewerPrev.onclick = () => { previousImage(); };
if(closeViewer) closeViewer.onclick = () => { closeImageModal(); };

if(imageViewer) {
    imageViewer.onclick = (e) => {
        if (e.target === imageViewer) closeImageModal();
    };
}

function closeImageModal() {
    if(imageViewer) imageViewer.style.display = "none";
    resetViewerZoom();
}

document.addEventListener("keydown", (event) => {
    if (!imageViewer || imageViewer.style.display !== "flex") return;
    if (event.key === "ArrowRight") nextImage();
    if (event.key === "ArrowLeft") previousImage();
    if (event.key === "Escape") closeImageModal();
});

let zoomed = false;
let startX = 0, startY = 0, currentX = 0, currentY = 0, isDragging = false;

if(viewerImage) {
    viewerImage.ondblclick = () => {
        zoomed = !zoomed;
        if (zoomed) {
            viewerImage.style.transform = "scale(2)";
            viewerImage.style.cursor = "zoom-out";
        } else {
            resetViewerZoom();
        }
    };

    viewerImage.addEventListener("touchstart", (e) => {
        if (!zoomed) return;
        isDragging = true;
        startX = e.touches[0].clientX - currentX;
        startY = e.touches[0].clientY - currentY;
    });

    viewerImage.addEventListener("touchmove", (e) => {
        if (!zoomed || !isDragging) return;
        e.preventDefault();
        currentX = e.touches[0].clientX - startX;
        currentY = e.touches[0].clientY - startY;
        viewerImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(2)`;
    }, { passive: false });

    viewerImage.addEventListener("touchend", () => { isDragging = false; });
}

function updateViewerImage() {
    if (imageViewer && imageViewer.style.display === "flex" && viewerImage) {
        viewerImage.src = previewImages[currentIndex].src;
    }
}

function resetViewerZoom() {
    zoomed = false;
    currentX = 0;
    currentY = 0;
    if(viewerImage) {
        viewerImage.style.transform = "scale(1)";
        viewerImage.style.cursor = "zoom-in";
    }
}

closeViewer.addEventListener("click", resetViewerZoom);