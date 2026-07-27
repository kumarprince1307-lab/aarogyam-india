// =========================================================================
// AIM PROJECT - MY LIBRARY FINAL JAVASCRIPT (Supabase & Real User Integrated)
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initUserData();
    startDailyTimer();
    loadLibraryData();
    checkAndOpenProfileModal();
});

// 1. Sidebar Menu Toggle Function
function toggleMenu() {
    const sideMenu = document.getElementById('sideMenu');
    if (sideMenu) {
        sideMenu.classList.toggle('active');
    }
}

// 2. सुरक्षित लॉगआउट फंक्शन (बिना किसी लूप के, उसी पेज पर रीफ्रेश करने के लिए)
function logoutUser() {
    // ब्राउज़र के लोकल स्टोरेज से सारा पुराना डेटा और सेशन साफ करें
    localStorage.removeItem('AI_SESSION');
    localStorage.removeItem('AI_USER');
    localStorage.removeItem('AI_PROFILE');
    
    // यूजर को संदेश दें
    alert('आप सफलतापूर्वक लॉग आउट हो चुके हैं।');
    
    // होम पेज पर न भेजकर इसी पेज को फ्रेश (रीलोड) करें ताकि यूजर भटके नहीं
    window.location.reload();
}

// 3. Category Tabs Switching Logic
function switchTab(category) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    const sections = ['purchased', 'available', 'bonus', 'demo', 'coming'];
    sections.forEach(sec => {
        const el = document.getElementById('section-' + sec);
        if (el) el.style.display = 'none';
    });

    const targetSection = document.getElementById('section-' + category);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

// 4. रोज़ सुबह 6:00 बजे से नया 24-घंटे का काउंटडाउन टाइमर
function startDailyTimer() {
    const timerElement = document.getElementById('dealTimer');
    if (!timerElement) return;

    function updateTimer() {
        const now = new Date();
        let target = new Date();
        target.setHours(6, 0, 0, 0);

        if (now >= target) {
            target.setDate(target.getDate() + 1);
        }

        const diff = target - now;
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        timerElement.textContent = 
            String(hours).padStart(2, '0') + ':' + 
            String(minutes).padStart(2, '0') + ':' + 
            String(seconds).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// 5. Supabase और LocalStorage से असली यूजर का नाम, डेटा और प्रोफाइल परसेंटेज कैलकुलेट करना
function initUserData() {
    const storedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
    
    const userName = storedUser.full_name || storedUser.name || "प्रिय पाठक";
    const userMobile = storedUser.mobile || "";
    const userEmail = storedUser.email || "";
    const userState = storedUser.state || storedUser.State || "";
    const userDob = storedUser.dob || "";
    const userCity = storedUser.city || storedUser.district || "";
    const userAddress = storedUser.address || "";
    const userOccupation = storedUser.occupation || "";
    const userInterest = storedUser.interest || "";

    // DOM Elements Update
    const userNameSpan = document.getElementById('userName');
    const menuUserName = document.getElementById('menuUserName');
    
    if (userNameSpan) userNameSpan.textContent = userName;
    if (menuUserName) menuUserName.textContent = userName;

    // फॉर्म इनपुट्स में ऑटो-फिल करना
    if (document.getElementById('leadName')) document.getElementById('leadName').value = userName;
    if (document.getElementById('leadPhone')) document.getElementById('leadPhone').value = userMobile;
    if (document.getElementById('leadEmail')) document.getElementById('leadEmail').value = userEmail;
    if (document.getElementById('leadState')) document.getElementById('leadState').value = userState;
    if (document.getElementById('leadDob')) document.getElementById('leadDob').value = userDob;
    if (document.getElementById('leadCity')) document.getElementById('leadCity').value = userCity;
    if (document.getElementById('leadAddress')) document.getElementById('leadAddress').value = userAddress;
    if (document.getElementById('leadOccupation')) document.getElementById('leadOccupation').value = userOccupation;
    if (document.getElementById('leadInterest')) document.getElementById('leadInterest').value = userInterest;

    // प्रोफाइल कंप्लीशन परसेंटेज कैलकुलेट करना और प्रोग्रेस बार/UI अपडेट करना
    calculateAndUpdateProfileProgress({ userName, userMobile, userEmail, userState, userDob, userCity, userAddress, userOccupation, userInterest });
}

// प्रोफाइल प्रोग्रेस कैलकुलेशन और डायनेमिक बार अपडेट
function calculateAndUpdateProfileProgress(data) {
    let filledFields = 0;
    const totalFields = 9; // कुल 9 जरूरी फील्ड्स

    if (data.userName && data.userName !== "प्रिय पाठक") filledFields++;
    if (data.userMobile) filledFields++;
    if (data.userEmail) filledFields++;
    if (data.userState) filledFields++;
    if (data.userDob) filledFields++;
    if (data.userCity) filledFields++;
    if (data.userAddress) filledFields++;
    if (data.userOccupation) filledFields++;
    if (data.userInterest) filledFields++;

    const percentage = Math.round((filledFields / totalFields) * 100);

    // UI में प्रोग्रेस बार और परसेंटेज टेक्स्ट अपडेट करना
    const progressFill = document.querySelector('.welcome-card-soft div[style*="background: #28a745"], .welcome-card-soft div[style*="background: rgb(40, 167, 69)"], .welcome-card-soft div[style*="background: linear-gradient"]');
    const progressText = document.querySelector('.welcome-card-soft strong');

    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    // यदि परसेंटेज दिखाने वाला स्ट्रॉन्ग टैग मौजूद है
    const statsElements = document.querySelectorAll('.welcome-card-soft div div strong');
    // हम प्रोग्रेस परसेंटेज वाले एलिमेंट को टारगेट कर सकते हैं
    const percentLabel = document.querySelector('.welcome-card-soft span + strong');
    if (percentLabel && percentLabel.textContent.includes('%')) {
        percentLabel.textContent = percentage + '%';
    }
}

// 6. लाइब्रेरी खुलते ही प्रोफाइल फॉर्म ऑटो-ओपन होना (क्रॉस बटन के साथ)
function checkAndOpenProfileModal() {
    const hasSeenModal = localStorage.getItem('aim_profile_prompted');
    if (!hasSeenModal) {
        setTimeout(() => {
            openLeadModal();
            localStorage.setItem('aim_profile_prompted', 'true');
        }, 1000);
    }
}

function openLeadModal() {
    const modal = document.getElementById('leadModal');
    if (modal) {
        initUserData();
        modal.classList.add('show');
        modal.style.display = 'flex'; // पॉपअप को सही से दिखने के लिए
    }
}

function closeLeadModal() {
    const modal = document.getElementById('leadModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none'; // क्रॉस बटन दबाने पर पूरी तरह गायब हो जाए
    }
}

// सुधरा हुआ फॉर्म सबमिट फंक्शन (डेटाबेस के नामों के अनुसार)
async function submitLeadForm(event) {
    event.preventDefault();
    const fullName = document.getElementById('leadName').value;
    const mobile = document.getElementById('leadPhone').value;
    const email = document.getElementById('leadEmail') ? document.getElementById('leadEmail').value : '';
    const state = document.getElementById('leadState') ? document.getElementById('leadState').value : '';
    const dob = document.getElementById('leadDob') ? document.getElementById('leadDob').value : '';
    const city = document.getElementById('leadCity') ? document.getElementById('leadCity').value : '';
    const address = document.getElementById('leadAddress') ? document.getElementById('leadAddress').value : '';
    const occupation = document.getElementById('leadOccupation') ? document.getElementById('leadOccupation').value : '';
    const interest = document.getElementById('leadInterest') ? document.getElementById('leadInterest').value : '';

    if (!fullName || !mobile) {
        alert('कृपया नाम और मोबाइल नंबर दर्ज करें।');
        return;
    }

    const formData = {
        fullName: fullName,
        mobile: mobile,
        email: email,
        state: state,
        dob: dob,
        city: city,
        address: address,
        occupation: occupation,
        interest: interest,
        source: "my_library_profile"
    };

    try {
        if (typeof registerUser === 'function') {
            const result = await registerUser(formData);
            if (result.success) {
                const currentUser = JSON.parse(localStorage.getItem('AI_USER') || '{}');
                if (currentUser.id && typeof updateProfile === 'function') {
                    await updateProfile(currentUser.id, { 
                        State: state, 
                        district: city,
                        occupation: occupation,
                        interest: interest
                    });
                }
                
                // LocalStorage अपडेट करें
                localStorage.setItem('AI_USER', JSON.stringify({ ...currentUser, full_name: fullName, mobile, email, state, dob, city, address, occupation, interest }));
                
                alert('बधाई हो! आपकी प्रोफाइल जानकारी Aarogyam India में सफलतापूर्वक सहेज ली गई है।');
                closeLeadModal();
                initUserData();
            } else {
                alert('सेव करने में त्रुटि: ' + (result.message || 'अज्ञात एरर'));
            }
        } else {
            localStorage.setItem('AI_USER', JSON.stringify({ full_name: fullName, mobile, email, state, dob, city, address, occupation, interest }));
            alert('प्रोफाइल सहेज ली गई है।');
            closeLeadModal();
            initUserData();
        }
    } catch (err) {
        console.error("Profile Submit Error:", err);
        alert('कनेक्शन एरर। कृपया पुनः प्रयास करें।');
    }
}

// 8. Full Screen Zoom Modal Handler (बुक कवर फुल-स्क्रीन और पिंच-ज़ूम इफ़ेक्ट)
function openImageZoom(imgSrc) {
    let modal = document.getElementById('imageZoomModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageZoomModal';
        modal.className = 'image-modal-overlay';
        modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:999999;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(8px);";
        modal.innerHTML = `
            <button onclick="closeImageZoom()" style="position:absolute;top:20px;right:25px;background:#fff;border:none;width:45px;height:45px;border-radius:50%;font-size:26px;font-weight:bold;cursor:pointer;color:#333;box-shadow:0 4px 15px rgba(0,0,0,0.3);z-index:1000000;">&times;</button>
            <div style="max-width:90%;max-height:90%;overflow:auto;display:flex;justify-content:center;align-items:center;">
                <img id="zoomedImg" src="" alt="Zoomed Book Cover" style="max-width:100%;max-height:85vh;object-fit:contain;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);transition:transform 0.3s ease;transform:scale(1);">
            </div>
        `;
        document.body.appendChild(modal);
    }
    const imgEl = document.getElementById('zoomedImg');
    if (imgEl) imgEl.src = imgSrc;
    modal.style.display = 'flex';
}

function closeImageZoom() {
    const modal = document.getElementById('imageZoomModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 9. Load Books Data and Render Dynamic Library Sections
async function loadLibraryData() {
    try {
        const books = typeof getAllBooks === 'function' ? await getAllBooks() : [];
        if (books.length === 0) {
            const res = await fetch('/data/books.json');
            const data = await res.json();
            renderLibrarySections(data.books || data);
        } else {
            renderLibrarySections(books);
        }
    } catch (error) {
        console.error('Error loading library books:', error);
    }
}

async function renderLibrarySections(booksArray) {
    const purchasedGrid = document.getElementById('purchasedBooksGrid');
    const availableGrid = document.getElementById('availableBooksGrid');
    const demoGrid = document.getElementById('unlockBooksGrid') || document.getElementById('section-demo');
    const comingSoonGrid = document.getElementById('comingSoonGrid');

    if (purchasedGrid) purchasedGrid.innerHTML = '';
    if (availableGrid) availableGrid.innerHTML = '';
    if (demoGrid) {
        const demoContent = demoGrid.querySelector('.book-grid-2col') || demoGrid;
        if (demoContent && demoContent !== demoGrid) demoContent.innerHTML = '';
    }
    if (comingSoonGrid) comingSoonGrid.innerHTML = '';

    if (!booksArray) return;

    // चेक करें कि यूजर ने कोई बुक खरीदी है या नहीं (Supabase purchases टेबल से)
    let userPurchases = [];
    const localUser = JSON.parse(localStorage.getItem('AI_USER') || '{}');
    if (localUser.id && typeof db !== 'undefined') {
        try {
            const { data } = await db.from('purchases').select('*').eq('profile_id', localUser.id);
            userPurchases = data || [];
        } catch (e) {
            console.log("Purchases fetch note:", e);
        }
    }

    const testPaymentDone = localStorage.getItem('AI_CURRENT_PAYMENT');
    let hasBoughtAny = userPurchases.length > 0 || testPaymentDone;

    booksArray.forEach(book => {
        const bookId = book.book_id || book.id;
        const bookName = book.title || book.name;
        const bookCover = book.cover_image || book.cover;

        // 1. Purchased / My Books (खरीदी गई किताबें)
        if (hasBoughtAny && (bookId === 'BK001' || userPurchases.some(p => p.book_id === bookId))) {
            const card = document.createElement('div');
            card.className = 'book-card';
            card.innerHTML = `
                <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" title="क्लिक करके फुल-स्क्रीन देखें">
                <h4>${bookName}</h4>
                <div class="book-btn-group" style="display:flex;gap:8px;margin-top:10px;">
                    <button class="btn-read" onclick="window.location.href='/ebooks/kharif-master-guide-2026.html'" style="flex:1;padding:10px;background:#138A36;color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;">Read Now</button>
                    <button class="btn-buy" onclick="window.location.href='/ebooks/kharif-master-guide-2026.html'" style="flex:1;padding:10px;background:#E86A17;color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;">Download</button>
                </div>
            `;
            if (purchasedGrid) purchasedGrid.appendChild(card);
        }

        // 2. Available Books (उपलब्ध बुक्स)
        if (bookId === 'BK001' || bookId === 'BK002' || bookId === 'BK006') {
            const availCard = document.createElement('div');
            availCard.className = 'book-card';
            
            let targetUrl = '/ebooks/checkout.html';
            if (bookId === 'BK001') {
                targetUrl = '/ebooks/kharif-master-guide-2026.html';
            }

            availCard.innerHTML = `
                <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" title="क्लिक करके फुल-स्क्रीन देखें">
                <h4>${bookName}</h4>
                <div class="book-btn-group" style="margin-top: 10px;">
                    <a href="${targetUrl}" class="btn-available">Buy Now / Details</a>
                </div>
            `;
            if (availableGrid) availableGrid.appendChild(availCard);
        }

        // 3. Demo Books (डेमो बुक्स)
        if (bookId === 'BK001') {
            const demoCard = document.createElement('div');
            demoCard.className = 'book-card';
            demoCard.innerHTML = `
                <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" title="क्लिक करके फुल-स्क्रीन देखें">
                <h4>${bookName} (Demo)</h4>
                <div class="book-btn-group" style="margin-top:10px;">
                    <button class="btn-read" onclick="window.location.href='/ebooks/demo-kharif.html'" style="width:100%;padding:10px;background:#138A36;color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;">Read Demo</button>
                </div>
            `;
            const targetDemoGrid = document.getElementById('unlockBooksGrid') || (document.getElementById('section-demo') ? document.getElementById('section-demo').querySelector('.book-grid-2col') : null);
            if (targetDemoGrid) targetDemoGrid.appendChild(demoCard);
        }

        // 4. Coming Soon Books (कमिंग सून बुक्स)
        if (bookId !== 'BK001' && bookId !== 'BK002' && bookId !== 'BK006') {
            const comingCard = document.createElement('div');
            comingCard.className = 'book-card';
            comingCard.innerHTML = `
                <div style="position: relative;">
                    <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" title="क्लिक करके फुल-स्क्रीन देखें">
                    <span style="position: absolute; top: 8px; right: 8px; cursor:pointer; font-size:1.2rem;" onclick="toggleWishlist(this, '${bookName}')" class="wishlist-heart">❤️</span>
                </div>
                <h4>${bookName}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding: 0 4px;">
                    <span style="font-size: 0.75rem; color: #E86A17; font-weight: 700; background:#fdf2e9; padding:4px 8px; border-radius:6px;">Coming Soon</span>
                    <a href="/ebooks/wishlist.html" style="padding: 6px 12px; font-size: 0.75rem; background:#138A36; color:#fff; border-radius:10px; text-decoration:none; font-weight:700;">Notify Me</a>
                </div>
            `;
            if (comingSoonGrid) comingSoonGrid.appendChild(comingCard);
        }
    });

    // यदि यूजर ने कोई बुक नहीं खरीदी है, तो Purchased सेक्शन में संदेश दिखाएं
    if (!hasBoughtAny && purchasedGrid && purchasedGrid.children.length === 0) {
        purchasedGrid.innerHTML = `
            <div style="grid-column: span 2; text-align: center; padding: 30px; color: #666;">
                <p style="font-size: 0.95rem; font-weight: 600;">📚 आपकी लाइब्रेरी में अभी कोई ई-बुक नहीं है।</p>
                <p style="font-size: 0.8rem; margin-top: 5px;">कृपया 'Available' टैब से ई-बुक खरीदें।</p>
            </div>
        `;
    }
}

// 10. Wishlist Heart Toggle
function toggleWishlist(element, bookName) {
    element.classList.toggle('active');
    if (element.classList.contains('active')) {
        alert(bookName + ' को आपकी Wishlist में जोड़ दिया गया है!');
    } else {
        alert(bookName + ' को Wishlist से हटा दिया गया है।');
    }
}

// 11. बधाई हो! सक्सेस पॉपअप (टेस्ट पेमेंट के बाद या बुक खरीदने पर दिखने के लिए)
function showCongratulationsPopup() {
    let pop = document.getElementById('congratsPopup');
    if (!pop) {
        pop = document.createElement('div');
        pop.id = 'congratsPopup';
        pop.className = 'modal-overlay show';
        pop.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:999999;display:flex;justify-content:center;align-items:center;";
        pop.innerHTML = `
            <div class="modal-card" style="background:#fff;padding:30px;border-radius:24px;text-align:center;max-width:400px;width:90%;">
                <h3 style="color: #138A36; font-size: 1.4rem; margin-bottom: 10px;">🎉 बधाई हो!</h3>
                <p style="font-size: 0.95rem; color: #333; line-height: 1.5; margin-bottom: 20px;">
                    आपने सफलतापूर्वक ई-बुक प्राप्त कर ली है, जिसे आप <b>लाइफटाइम (जीवनभर)</b> पढ़ सकते हैं! यह आपकी 'My Library' में जोड़ दी गई है।
                </p>
                <button onclick="document.getElementById('congratsPopup').remove(); window.location.reload();" style="width:100%;padding:12px;background:#138A36;color:#fff;border:none;border-radius:14px;font-weight:700;font-size:1rem;cursor:pointer;">ठीक है (OK)</button>
            </div>
        `;
        document.body.appendChild(pop);
    }
}