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

// 2. सुरक्षित लॉगआउट फंक्शन (पूरी तरह से स्टोरेज साफ करने वाला)
function logoutUser() {
    // 1. ब्राउज़र की पूरी स्टोरेज साफ़ करें
    localStorage.clear();
    sessionStorage.clear();
    
    // 2. यूजर को सूचित करें
    alert('आप सफलतापूर्वक लॉग आउट हो चुके हैं।');
    
    // 3. बिना किसी रुकावट के तुरंत पेज को फ्रेश रीलोड करें
    window.location.href = window.location.pathname;
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

// 5. Supabase और LocalStorage से असली यूजर का डेटा और डायनेमिक प्रोग्रेस कैलकुलेशन
function calculateProfileProgress() {
    const storedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
    let score = 0;
    const totalFields = 11; // 11 fields including NetSurf ID
    
    if (storedUser.full_name) score++;
    if (storedUser.mobile) score++;
    if (storedUser.email) score++;
    if (storedUser.gender) score++;
    if (storedUser.State || storedUser.state) score++;
    if (storedUser.dob && String(storedUser.dob).trim()) score++;
    if (storedUser.district || storedUser.city) score++;
    if (storedUser.address) score++;
    if (storedUser.occupation) score++;
    if (storedUser.interest) score++;
    if (storedUser.netsurf_id && String(storedUser.netsurf_id).trim()) score++;
    
    const percentage = Math.min(100, Math.round((score / totalFields) * 100));

    const completionText = document.getElementById('profileCompletionText');
    const completionBar = document.getElementById('profileCompletionBar');
    const statusHint = document.getElementById('profileStatusHint');
    const nudgePopup = document.getElementById('profile100NudgePopup');
    const nudgePercent = document.getElementById('nudgePercentText');

    if (completionText) completionText.textContent = `${percentage}%`;
    if (completionBar) {
        completionBar.style.width = `${percentage}%`;
        if (percentage === 100) {
            completionBar.style.background = '#10b981';
        } else if (percentage >= 60) {
            completionBar.style.background = 'linear-gradient(90deg, #f59e0b, #10b981)';
        } else {
            completionBar.style.background = '#f59e0b';
        }
    }

    if (statusHint) {
        if (percentage === 100) {
            statusHint.textContent = '🟢 प्रोफाइल 100% पूर्ण है!';
            statusHint.style.color = '#10b981';
        } else {
            statusHint.textContent = `⚠️ केवल ${percentage}% पूर्ण — 100% करें`;
            statusHint.style.color = '#d97706';
        }
    }

    // Persistent Popup Reminder if < 100%
    if (nudgePopup) {
        if (percentage < 100 && (storedUser.id || storedUser.mobile)) {
            nudgePopup.style.display = 'block';
            if (nudgePercent) nudgePercent.textContent = `${percentage}%`;
        } else {
            nudgePopup.style.display = 'none';
        }
    }
}

function initUserData() {
    const storedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
    
    const userName = storedUser.full_name || storedUser.name || "प्रिय पाठक";
    const userMobile = storedUser.mobile || "";
    const userEmail = storedUser.email || "";
    const userNetsurfId = storedUser.netsurf_id || "";
    const userState = storedUser.state || storedUser.State || "";
    const userDob = storedUser.dob || "";
    const userCity = storedUser.city || storedUser.district || "";
    const userAddress = storedUser.address || "";
    const userOccupation = storedUser.occupation || "";
    const userInterest = storedUser.interest || "";
    const userGender = storedUser.gender || "";

    // DOM Elements Update
    const userNameSpan = document.getElementById('userName');
    const menuUserName = document.getElementById('menuUserName');
    const mobileUserPhoneSpan = document.getElementById('mobileUserPhone');

    if (userNameSpan) userNameSpan.textContent = userName;
    if (menuUserName) menuUserName.textContent = userName;
    if (mobileUserPhoneSpan) mobileUserPhoneSpan.textContent = userMobile;

    // फॉर्म इनपुट्स में ऑटो-फिल करना
    if (document.getElementById('leadName')) document.getElementById('leadName').value = userName;
    if (document.getElementById('leadPhone')) document.getElementById('leadPhone').value = userMobile;
    if (document.getElementById('leadNetsurfId')) document.getElementById('leadNetsurfId').value = userNetsurfId;
    if (document.getElementById('leadEmail')) document.getElementById('leadEmail').value = userEmail;
    if (document.getElementById('leadGender')) document.getElementById('leadGender').value = userGender;
    if (document.getElementById('leadState')) document.getElementById('leadState').value = userState;
    if (document.getElementById('leadDob')) document.getElementById('leadDob').value = userDob;
    if (document.getElementById('leadCity')) document.getElementById('leadCity').value = userCity;
    if (document.getElementById('leadAddress')) document.getElementById('leadAddress').value = userAddress;
    if (document.getElementById('leadOccupation')) document.getElementById('leadOccupation').value = userOccupation;
    if (document.getElementById('leadInterest')) document.getElementById('leadInterest').value = userInterest;

    // 🟢 Active / Inactive User Status & 365-Day Countdown Timer
    updateSubscriptionTimerAndStatus(storedUser);

    calculateProfileProgress();
}

function updateSubscriptionTimerAndStatus(storedUser) {
    const isActive = Boolean(storedUser.is_active || storedUser.is_subscriber || storedUser.status === 'active');
    const badgeEl = document.getElementById('userStatusBadge');
    const badgeText = document.getElementById('userStatusText');
    const activeCard = document.getElementById('activeSubscriptionCard');
    const inactiveBanner = document.getElementById('inactiveSubscriptionBanner');

    if (badgeEl && badgeText) {
        if (isActive) {
            badgeEl.style.background = 'rgba(16,185,129,0.15)';
            badgeEl.style.color = '#059669';
            badgeEl.style.borderColor = 'rgba(16,185,129,0.3)';
            badgeText.textContent = '🟢 Active Subscriber';
        } else {
            badgeEl.style.background = 'rgba(239,68,68,0.12)';
            badgeEl.style.color = '#dc2626';
            badgeEl.style.borderColor = 'rgba(239,68,68,0.25)';
            badgeText.textContent = '🔴 Inactive / Free Member';
        }
    }

    if (isActive) {
        if (activeCard) activeCard.style.display = 'block';
        if (inactiveBanner) inactiveBanner.style.display = 'none';

        // 365-Day Countdown Calculation
        const regDateStr = storedUser.created_at || storedUser.subscribed_at || new Date().toISOString();
        const startDate = new Date(regDateStr);
        const endDate = new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000));
        const now = new Date();

        const diffTime = endDate - now;
        const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        const subStartDateEl = document.getElementById('subStartDate');
        const subEndDateEl = document.getElementById('subEndDate');
        const daysBadge = document.getElementById('subDaysLeftBadge');

        if (subStartDateEl) subStartDateEl.textContent = startDate.toLocaleDateString('hi-IN');
        if (subEndDateEl) subEndDateEl.textContent = endDate.toLocaleDateString('hi-IN');
        if (daysBadge) daysBadge.textContent = `⏳ ${daysLeft} दिन शेष`;
    } else {
        if (activeCard) activeCard.style.display = 'none';
        if (inactiveBanner) inactiveBanner.style.display = 'block';
    }
}

// 6. स्मार्ट चेक: यदि यूजर लॉग-इन नहीं है तो ऑटो-पॉपअप नहीं खुलेगा
function checkAndOpenProfileModal() {
    const storedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
    
    if (!storedUser.id && !storedUser.mobile) {
        return;
    }

    // अगर यूजर की प्रोफाइल 100% पूरी है तो सीधे रिटर्न करें
    const is100Complete = storedUser.full_name && storedUser.mobile && storedUser.email && storedUser.gender && storedUser.dob && (storedUser.state || storedUser.State) && (storedUser.city || storedUser.district) && storedUser.address && storedUser.occupation && storedUser.interest && storedUser.netsurf_id;
    if (is100Complete) {
        return; 
    }

    // अगर प्रोफाइल अधूरी है तो 1.5 सेकंड बाद पॉपअप खोलें
    const hasSeenModal = sessionStorage.getItem('aim_profile_prompted_session');
    if (!hasSeenModal) {
        setTimeout(() => {
            openLeadModal();
            sessionStorage.setItem('aim_profile_prompted_session', 'true');
        }, 1200);
    }
}

function openLeadModal() {
    const modal = document.getElementById('leadModal');
    if (modal) {
        initUserData();
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeLeadModal() {
    const modal = document.getElementById('leadModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// फॉर्म सबमिट और सेव फंक्शन
async function submitLeadForm(event) {
    event.preventDefault();
    const fullName = document.getElementById('leadName').value.trim();
    const mobile = document.getElementById('leadPhone').value.trim();
    
    const netsurfIdElem = document.getElementById('leadNetsurfId');
    const netsurfId = netsurfIdElem && netsurfIdElem.value.trim() !== '' ? netsurfIdElem.value.trim() : null;

    const emailElem = document.getElementById('leadEmail');
    const email = emailElem && emailElem.value.trim() !== '' ? emailElem.value.trim() : null;

    const genderElem = document.getElementById('leadGender');
    const gender = genderElem && genderElem.value.trim() !== '' ? genderElem.value.trim() : null;

    const stateElem = document.getElementById('leadState');
    const state = stateElem && stateElem.value.trim() !== '' ? stateElem.value.trim() : null;

    const dobElem = document.getElementById('leadDob');
    const dob = dobElem && dobElem.value.trim() !== '' ? dobElem.value.trim() : null;

    const cityElem = document.getElementById('leadCity');
    const city = cityElem && cityElem.value.trim() !== '' ? cityElem.value.trim() : null;

    const addressElem = document.getElementById('leadAddress');
    const address = addressElem && addressElem.value.trim() !== '' ? addressElem.value.trim() : null;

    const occupationElem = document.getElementById('leadOccupation');
    const occupation = occupationElem && occupationElem.value.trim() !== '' ? occupationElem.value.trim() : null;

    const interestElem = document.getElementById('leadInterest');
    const interest = interestElem && interestElem.value.trim() !== '' ? interestElem.value.trim() : null;

    if (!fullName || !mobile) {
        alert('कृपया नाम और मोबाइल नंबर दर्ज करें।');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('AI_USER') || '{}');
    if (!currentUser.id) {
        alert('User not logged in. Cannot update profile.');
        return;
    }

    const profileData = {
        full_name: fullName,
        netsurf_id: netsurfId,
        email: email,
        gender: gender,
        dob: dob,
        State: state, 
        district: city,
        address: address,
        occupation: occupation,
        interest: interest,
    };

    const submitBtn = document.getElementById('leadSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'सेव हो रहा है...';
    }

    try {
        if (typeof updateProfile !== 'function') {
            alert('Error: Update function is not available.');
            return;
        }

        const result = await updateProfile(currentUser.id, profileData);

        if (result.success) {
            const updatedUser = { ...currentUser, ...result.profile, netsurf_id: netsurfId };
            localStorage.setItem('AI_USER', JSON.stringify(updatedUser));
            if (typeof ProfileStorage !== 'undefined') ProfileStorage.save(updatedUser);

            alert('🎉 बधाई हो! आपकी प्रोफाइल जानकारी (NetSurf ID सहित) सफलतापूर्वक सहेज ली गई है।');
            closeLeadModal();
            initUserData();
            calculateProfileProgress();
        } else {
            alert('प्रोफाइल अपडेट करने में त्रुटि: ' + (result.message || 'अज्ञात एरर'));
        }
    } catch (err) {
        console.error('Profile update exception', err);
        alert('प्रोफाइल सेव करने में त्रुटि हुई।');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'जानकारी सुरक्षित करें (Save Profile)';
        }
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
                <img id="zoomedImg" src="" alt="Zoomed Book Cover" style="max-width:100%;max-height:85vh;object-fit:contain;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
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

// 9. Load Books Data and Render Dynamic Library Sections & Dynamic Counts
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

    // डायनेमिक काउंट्स कैलकुलेट करना (Purchased, Bonus, Wishlist)
    let purchasedCount = 0;
    let bonusCount = 0; // उदाहरण के लिए फिक्स या डायनेमिक बोनस
    let wishlistCount = JSON.parse(localStorage.getItem('AI_WISHLIST') || '[]').length;

    booksArray.forEach(book => {
        const bookId = book.book_id || book.id;
        const bookName = book.title || book.name;
        const bookCover = book.cover_image || book.cover;

      
       // 1. Purchased / My Books
if (userPurchases.some(p => p.book_id === bookId)) {
    purchasedCount++;
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
        <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" title="क्लिक करके फुल-स्क्रीन देखें">
        <h4>${bookName}</h4>
        <div class="book-btn-group" style="display:flex;gap:8px;margin-top:10px;">
            <a href="reader.html?book=${bookId}" class="btn-read" style="flex:1;padding:10px;background:#138A36;color:#fff;text-align:center;border-radius:12px;font-weight:700;text-decoration:none;cursor:pointer;">Read Now</a>
            <a href="download.html?book=${bookId}" class="btn-buy" style="flex:1;padding:10px;background:#E86A17;color:#fff;text-align:center;border-radius:12px;font-weight:700;text-decoration:none;cursor:pointer;">Download</a>
        </div>
    `;
    if (purchasedGrid) purchasedGrid.appendChild(card);
}

      // 2. Available Books
        if (bookId === 'BK001' || bookId === 'BK002' || bookId === 'BK006') {
            const availCard = document.createElement('div');
            availCard.className = 'book-card';
            
            // हर बुक के हिसाब से उसकी सही ID के साथ URL सेट करें
            let targetUrl = `/ebooks/checkout.html?id=${bookId}`;

            availCard.innerHTML = `
                <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" title="क्लिक करके फुल-स्क्रीन देखें">
                <h4>${bookName}</h4>
                <div class="book-btn-group" style="margin-top: 10px;">
                    <a href="${targetUrl}" class="btn-available">Buy Now / Details</a>
                </div>
            `;
            if (availableGrid) availableGrid.appendChild(availCard);
        }

        // 3. Demo Books
        if (bookId === 'BK001') {
            const demoCard = document.createElement('div');
            demoCard.className = 'book-card';
            demoCard.innerHTML = `
                <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" title="क्लिक करके फुल-स्क्रीन देखें">
                <h4>${bookName} (Demo)</h4>
                <div class="book-btn-group" style="margin-top:10px;">
                    <button class="btn-read" onclick="window.location.href='download.html'" style="width:100%;padding:10px;background:#138A36;color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;">Read Demo</button>
                </div>
            `;
            const targetDemoGrid = document.getElementById('unlockBooksGrid') || (document.getElementById('section-demo') ? document.getElementById('section-demo').querySelector('.book-grid-2col') : null);
            if (targetDemoGrid) targetDemoGrid.appendChild(demoCard);
        }

        // 4. Coming Soon Books
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

    // वेलकम कार्ड के स्टेट्स काउंट्स को डायनेमिक रूप से अपडेट करना
    updateWelcomeStatsCounts(hasBoughtAny ? purchasedCount : 0, bonusCount, wishlistCount);

    if (!hasBoughtAny && purchasedGrid && purchasedGrid.children.length === 0) {
        purchasedGrid.innerHTML = `
            <div style="grid-column: span 2; text-align: center; padding: 30px; color: #666;">
                <p style="font-size: 0.95rem; font-weight: 600;">📚 आपकी लाइब्रेरी में अभी कोई ई-बुक नहीं है।</p>
                <p style="font-size: 0.8rem; margin-top: 5px;">कृपया 'Available' टैब से ई-बुक खरीदें।</p>
            </div>
        `;
    }
}

// वेलकम कार्ड के काउंट्स को वास्तविक वैल्यू से अपडेट करने का फंक्शन
function updateWelcomeStatsCounts(purchased, bonus, wishlist) {
    const statsContainer = document.querySelector('.welcome-card-soft');
    if (!statsContainer) return;
    
    const countElements = statsContainer.querySelectorAll('div[style*="background: #fff"] strong, div[style*="background: #FFFFFF"] strong, .welcome-card-soft div > div > strong');
    if (countElements.length >= 3) {
        countElements[0].textContent = purchased;
        countElements[1].textContent = bonus;
        countElements[2].textContent = wishlist;
    }
}

// 10. Wishlist Heart Toggle
function toggleWishlist(element, bookName) {
    element.classList.toggle('active');
    let wishlist = JSON.parse(localStorage.getItem('AI_WISHLIST') || '[]');
    if (element.classList.contains('active')) {
        if (!wishlist.includes(bookName)) wishlist.push(bookName);
        alert(bookName + ' को आपकी Wishlist में जोड़ दिया गया है!');
    } else {
        wishlist = wishlist.filter(item => item !== bookName);
        alert(bookName + ' को Wishlist से हटा दिया गया है।');
    }
    localStorage.setItem('AI_WISHLIST', JSON.stringify(wishlist));
}

// 11. बधाई हो! सक्सेस पॉपअप
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