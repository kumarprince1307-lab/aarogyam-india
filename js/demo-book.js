/* ==========================================================
   AAROGYAM INDIA - UNIVERSAL DEMO BOOK JS (FINAL)
   ========================================================== */

let currentBookData = null;
let previewImages = [];
let currentIndex = 0;

document.addEventListener("DOMContentLoaded", async () => {
    showLoader();
    await loadBookData();
    initializePage();
    setupEventListeners();
});

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
            window.location.href = "/";
            return;
        }

        // Bind Dynamic Data to HTML Elements
        document.title = `${currentBookData.name} | Aarogyam India`;
        
        const coverEl = document.getElementById("bookCover");
        if (coverEl) coverEl.src = currentBookData.cover || currentBookData.thumbnail;

        const titleEl = document.getElementById("bookTitle");
        if (titleEl) titleEl.textContent = currentBookData.name;

        // Price Updates
        const mrpEl = document.getElementById("bookMrp");
        if (mrpEl) mrpEl.textContent = "₹" + currentBookData.mrp;

        const priceEl = document.getElementById("bookPrice");
        if (priceEl) priceEl.textContent = "₹" + currentBookData.offerPrice;

        const barMrp = document.getElementById("barMrp");
        if (barMrp) barMrp.textContent = "₹" + currentBookData.mrp;

        const barOffer = document.getElementById("barOffer");
        if (barOffer) barOffer.textContent = "₹" + currentBookData.offerPrice;

        // Dynamic Demo Images Generation from JSON Array
        const sliderContainer = document.querySelector(".slider-container");
        if (sliderContainer && currentBookData.demoImages && Array.isArray(currentBookData.demoImages)) {
            sliderContainer.innerHTML = "";
            currentBookData.demoImages.forEach((imgPath, index) => {
                let imgTag = document.createElement("img");
                imgTag.src = imgPath;
                imgTag.className = index === 0 ? "preview-image active" : "preview-image";
                imgTag.alt = `Preview Page ${index + 1}`;
                // सुरक्षा: डाउनलोड रोकने के लिए contextmenu disable करना
                imgTag.oncontextmenu = (e) => e.preventDefault();
                sliderContainer.appendChild(imgTag);
            });
        }

        // Update Checkout Link dynamically
        const buyBtn = document.getElementById("stickyBuyBtn");
        if(buyBtn) {
            buyBtn.href = `${currentBookData.checkoutPage || '../checkout.html'}?id=${currentBookData.id}`;
        }

        // Update Back Button Link
        const backBtn = document.getElementById("backBtn");
        if(backBtn && currentBookData.landingPage) {
            backBtn.href = currentBookData.landingPage;
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

async function saveUserToSupabase(userData) {
    try {
        // चूंकि HTML के नीचे Supabase की स्क्रिप्ट है, यह window.supabase का उपयोग करेगा
        if (!window.supabase) {
            console.error("Supabase script not loaded in HTML");
            return true; // अगर स्क्रिप्ट लोड होने में दिक्कत हो तो भी यूजर का फ्लो न रुके
        }

        // मान लीजिए आपने HTML में supabase client इनिशियलाइज किया है या यहाँ कर रहे हैं
        // अगर window.supabaseClient उपलब्ध है या स्टैंडर्ड supabase ऑब्जेक्ट है:
        const client = window.supabaseClient || window.supabase;
        
        if (client && typeof client.from === 'function') {
            const { data, error } = await client
                .from("demo_users") // आपकी Supabase टेबल का नाम
                .insert([
                    {
                        book_id: userData.book_id,
                        book_name: userData.book_name,
                        full_name: userData.name,
                        mobile: userData.mobile,
                        email: userData.email,
                        state: userData.state,
                        district: userData.district,
                        created_at: userData.created_at
                    }
                ]);

            if (error) {
                console.error("Supabase Insert Error:", error.message);
                // एरर होने पर भी यूजर को रोकने के बजाय लॉग कर रहे हैं ताकि डेमो न अटके
            }
        }
        return true;
    } catch (err) {
        console.error("Supabase Connection Error:", err);
        return true; 
    }
}

/*==================================================
  4. FORM SUBMIT EVENT
==================================================*/
if(demoForm) {
    demoForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (!validateForm()) return;

        showLoader();

        const userData = {
            book_id: currentBookData ? currentBookData.id : "BK001",
            book_name: currentBookData ? currentBookData.name : "",
            name: nameInput.value.trim(),
            mobile: mobileInput.value.trim(),
            email: emailInput.value.trim(),
            state: stateInput.value.trim(),
            district: districtInput.value.trim(),
            created_at: new Date().toISOString()
        };

        await saveUserToSupabase(userData);
        hideLoader();
        unlockDemo();
    });
}

function unlockDemo() {
    if(formSection) formSection.style.display = "none"; // फॉर्म गायब हो जाएगा
    if(demoPreview) demoPreview.style.display = "block";
    if(previewSlider) previewSlider.style.display = "block"; // डेमो बुक इमेज खुल जाएगी
    showToast("🎉 Demo सफलतापूर्वक Unlock हो गया");
    
    setupSliderImages();
}

/*==================================================
  5. IMAGE SLIDER & VIEWER LOGIC
==================================================*/
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

    // Swipe Support for Mobile
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

    // Full screen viewer bindings on image click
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

// Fullscreen Viewer Elements
const imageViewer = document.getElementById("imageViewer");
const viewerImage = document.getElementById("viewerImage");
const viewerPrev = document.querySelector(".viewer-prev");
const viewerNext = document.querySelector(".viewer-next");
const closeViewer = document.querySelector(".close-viewer");

function openViewer() {
    if(!imageViewer || !viewerImage) return;
    viewerImage.src = previewImages[currentIndex].src;
    imageViewer.style.display = "flex";
    // सुरक्षा: व्यूअर में भी डाउनलोड रोकने के लिए
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

// Keyboard Support (ESC से बाहर, Arrow Keys से स्लाइड)
document.addEventListener("keydown", (event) => {
    if (!imageViewer || imageViewer.style.display !== "flex") return;
    if (event.key === "ArrowRight") nextImage();
    if (event.key === "ArrowLeft") previousImage();
    if (event.key === "Escape") closeImageModal();
});

// Zoom & Pan Variables
let zoomed = false;
let startX = 0, startY = 0, currentX = 0, currentY = 0, isDragging = false;

if(viewerImage) {
    // Double click zoom
    viewerImage.ondblclick = () => {
        zoomed = !zoomed;
        if (zoomed) {
            viewerImage.style.transform = "scale(2)";
            viewerImage.style.cursor = "zoom-out";
        } else {
            resetViewerZoom();
        }
    };

    // Mobile touch drag after zoom
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