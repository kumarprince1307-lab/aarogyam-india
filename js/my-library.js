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
    const isProfileMarkedDone = localStorage.getItem('ai_profile_completed') === 'true';
    
    if (storedUser.full_name || storedUser.name) score++;
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
    
    const hasCoreFields = Boolean((storedUser.full_name || storedUser.name) && storedUser.mobile && (storedUser.state || storedUser.State || storedUser.district || storedUser.city));
    let percentage = Math.min(100, Math.round((score / 11) * 100));
    if (isProfileMarkedDone || (hasCoreFields && score >= 4)) {
        percentage = 100;
    }

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

    // Persistent Popup Reminder only if strictly incomplete AND not dismissed
    if (nudgePopup) {
        const isDismissed = sessionStorage.getItem('ai_profile_nudge_dismissed') === 'true' || isProfileMarkedDone;
        if (percentage < 100 && (storedUser.id || storedUser.mobile) && !isDismissed) {
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
    const bonusGrid = document.getElementById('bonusBooksGrid');
    const demoGrid = document.getElementById('demoBooksGrid');
    const comingSoonGrid = document.getElementById('comingSoonGrid');

    if (purchasedGrid) purchasedGrid.innerHTML = '';
    if (availableGrid) availableGrid.innerHTML = '';
    if (bonusGrid) bonusGrid.innerHTML = '';
    if (demoGrid) demoGrid.innerHTML = '';
    if (comingSoonGrid) comingSoonGrid.innerHTML = '';

    if (!booksArray) return;

    // 1. Gather all purchases (LocalStorage + Supabase)
    const localPurchases = JSON.parse(localStorage.getItem('AI_PURCHASES') || localStorage.getItem('purchases') || '[]');
    let userPurchases = [...localPurchases];

    const localUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
    if (localUser.id) {
        try {
            const activeDb = window.dbClient || window.supabase || (typeof db !== 'undefined' ? db : null);
            if (activeDb) {
                const { data } = await activeDb.from('purchases').select('*').eq('profile_id', localUser.id);
                if (data && data.length) {
                    data.forEach(p => {
                        if (!userPurchases.some(up => up.book_id === p.book_id)) {
                            userPurchases.push(p);
                        }
                    });
                }
            }
        } catch (e) {
            console.log("Purchases fetch note:", e);
        }
    }

    const testPaymentDone = localStorage.getItem('AI_CURRENT_PAYMENT');
    let hasBoughtAny = userPurchases.length > 0 || Boolean(testPaymentDone);

    let purchasedCount = 0;
    let bonusCount = 0;
    let demoCount = 0;
    let wishlistItems = JSON.parse(localStorage.getItem('AI_WISHLIST') || '[]');
    let wishlistCount = wishlistItems.length;

    const seenPurchasedIds = new Set();
    const seenAvailableIds = new Set();
    const seenDemoIds = new Set();
    const seenComingSoonIds = new Set();

    // Render Books across all active sections (Deduplicated)
    booksArray.forEach(book => {
        const rawId = (book.book_id || book.id || '').toUpperCase();
        if (!rawId) return;

        const bookId = book.book_id || book.id;
        const bookName = book.title || book.heading || book.name;
        const bookCover = book.cover_image || book.cover || '/images/banners/farmer-community-banner.jpeg';

        // 1. Purchased / My Books (Unique per Book ID)
        const isPurchased = userPurchases.some(p => (p.book_id && p.book_id.toUpperCase() === rawId) || (p.id && p.id.toUpperCase() === rawId));
        if (isPurchased && !seenPurchasedIds.has(rawId)) {
            seenPurchasedIds.add(rawId);
            purchasedCount++;
            const card = document.createElement('div');
            card.className = 'book-card';
            card.innerHTML = `
                <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" title="क्लिक करके फुल-स्क्रीन देखें">
                <h4>${bookName}</h4>
                <div class="book-btn-group" style="display:flex;gap:8px;margin-top:10px;">
                    <a href="/ebooks/reader.html?book=${bookId}" class="btn-read" style="flex:1;padding:10px;background:#138A36;color:#fff;text-align:center;border-radius:12px;font-weight:700;text-decoration:none;cursor:pointer;">Read Now</a>
                    <a href="/pdf/full/${bookId}.pdf" target="_blank" class="btn-buy" style="flex:1;padding:10px;background:#E86A17;color:#fff;text-align:center;border-radius:12px;font-weight:700;text-decoration:none;cursor:pointer;">Download PDF</a>
                </div>
            `;
            if (purchasedGrid) purchasedGrid.appendChild(card);

            // Check if purchased book has specific bonus books in JSON
            if (book.bonusBooks && Array.isArray(book.bonusBooks) && book.bonusBooks.length > 0 && bonusGrid) {
                book.bonusBooks.forEach((bonusFile, bIdx) => {
                    bonusCount++;
                    const bonusCard = document.createElement('div');
                    bonusCard.className = 'book-card';
                    bonusCard.style.cssText = 'background:#fff;border-radius:12px;padding:14px;border:1.5px solid #10b981;box-shadow:0 4px 12px rgba(0,0,0,0.05);';
                    bonusCard.innerHTML = `
                        <div style="font-size:2rem;text-align:center;margin-bottom:6px;">🎁</div>
                        <h4 style="color:#065f46;margin-bottom:6px;">${bookName} — VIP बोनस सामग्री #${bIdx + 1}</h4>
                        <p style="font-size:0.8rem;color:#64748b;margin-bottom:12px;">आपकी ${bookName} खरीद के साथ मुफ़्त उपलब्ध।</p>
                        <a href="${bonusFile}" target="_blank" style="display:block;text-align:center;background:#10b981;color:#fff;padding:8px;border-radius:8px;font-weight:700;text-decoration:none;">📥 बोनस फाइल डाउनलोड</a>
                    `;
                    bonusGrid.appendChild(bonusCard);
                });
            }
        }

        // 2. Available Books (Unique per Book ID)
        if ((book.status === 'active' || rawId === 'BK001' || rawId === 'BK002' || rawId === 'BK006' || rawId === 'SUB001') && !seenAvailableIds.has(rawId)) {
            seenAvailableIds.add(rawId);
            const availCard = document.createElement('div');
            availCard.className = 'book-card';
            let targetUrl = rawId === 'SUB001' ? '/subscription.html' : `/ebooks/checkout.html?id=${bookId}`;

            availCard.innerHTML = `
                <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" title="क्लिक करके फुल-स्क्रीन देखें">
                <h4>${bookName}</h4>
                <div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0;">
                    <span style="font-weight:800;color:#138A36;font-size:1.05rem;">₹${book.offerPrice || 99}</span>
                    <span style="text-decoration:line-through;color:#94a3b8;font-size:0.85rem;">₹${book.mrp || 299}</span>
                </div>
                <div class="book-btn-group" style="margin-top: 6px;">
                    <a href="${targetUrl}" class="btn-available" style="width:100%;text-align:center;display:block;padding:10px;background:#E86A17;color:#fff;border-radius:10px;font-weight:700;text-decoration:none;">Buy Now / Details</a>
                </div>
            `;
            if (availableGrid) availableGrid.appendChild(availCard);
        }

        // 3. Demo Books (Read Free Samples)
        if ((book.demoAvailable || book.demoPdf || rawId === 'BK001' || rawId === 'BK002') && !seenDemoIds.has(rawId)) {
            seenDemoIds.add(rawId);
            demoCount++;
            const demoCard = document.createElement('div');
            demoCard.className = 'book-card';
            const demoPdfUrl = book.demoPdf || `/pdf/sample/${bookId}-demo.pdf`;
            demoCard.innerHTML = `
                <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" title="क्लिक करके फुल-स्क्रीन देखें">
                <h4>${bookName} (Free Demo)</h4>
                <div style="margin-top:8px;">
                    <a href="${demoPdfUrl}" target="_blank" style="display:block;text-align:center;background:#0284c7;color:#fff;padding:8px 12px;border-radius:8px;font-weight:700;text-decoration:none;">📖 सैंपल पढ़ें (Read Demo)</a>
                </div>
            `;
            if (demoGrid) demoGrid.appendChild(demoCard);
        }

        // 4. Coming Soon Books (Unique per Book ID)
        if ((book.status === 'coming_soon' || (rawId !== 'BK001' && rawId !== 'BK002' && rawId !== 'BK006' && rawId !== 'SUB001')) && !seenComingSoonIds.has(rawId) && !seenAvailableIds.has(rawId)) {
            seenComingSoonIds.add(rawId);
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
                    <a href="javascript:void(0)" onclick="alert('✅ आपकी रुचि दर्ज कर ली गई है। पुस्तक लाइव होने पर आपको सूचित किया जाएगा।')" style="padding: 6px 12px; font-size: 0.75rem; background:#138A36; color:#fff; border-radius:10px; text-decoration:none; font-weight:700;">Notify Me</a>
                </div>
            `;
            if (comingSoonGrid) comingSoonGrid.appendChild(comingCard);
        }
    });

    // Default General Bonus Cards
    if (bonusGrid) {
        bonusCount += 2;
        const genBonusCard1 = document.createElement('div');
        genBonusCard1.className = 'book-card';
        genBonusCard1.style.cssText = 'background:#fff;border-radius:12px;padding:14px;border:1.5px solid #10b981;box-shadow:0 4px 12px rgba(0,0,0,0.05);';
        genBonusCard1.innerHTML = `
            <div style="font-size:2.2rem;text-align:center;margin-bottom:8px;">🌿</div>
            <h4 style="color:#065f46;margin-bottom:6px;">ऑर्गेनिक स्प्रे एवं फसल सुरक्षा फॉर्मूला</h4>
            <p style="font-size:0.8rem;color:#64748b;margin-bottom:12px;line-height:1.4;">घर पर प्राकृतिक कीटनाशक और टॉनिक बनाने की सम्पूर्ण विधि।</p>
            <a href="/pdf/sample/BK001-demo.pdf" target="_blank" style="display:block;text-align:center;background:#10b981;color:#fff;padding:8px;border-radius:8px;font-weight:700;text-decoration:none;">📥 बोनस PDF डाउनलोड</a>
        `;
        bonusGrid.appendChild(genBonusCard1);

        const genBonusCard2 = document.createElement('div');
        genBonusCard2.className = 'book-card';
        genBonusCard2.style.cssText = 'background:#fff;border-radius:12px;padding:14px;border:1.5px solid #f59e0b;box-shadow:0 4px 12px rgba(0,0,0,0.05);';
        genBonusCard2.innerHTML = `
            <div style="font-size:2.2rem;text-align:center;margin-bottom:8px;">💻</div>
            <h4 style="color:#92400e;margin-bottom:6px;">AI वेबसाइट एवं डिजिटल टूल्स चीटशीट</h4>
            <p style="font-size:0.8rem;color:#64748b;margin-bottom:12px;line-height:1.4;">10 उपयोगी AI टूल्स व प्रॉम्प्ट्स का विशेष गाइड।</p>
            <a href="/pdf/sample/BK001-demo.pdf" target="_blank" style="display:block;text-align:center;background:#f59e0b;color:#fff;padding:8px;border-radius:8px;font-weight:700;text-decoration:none;">📥 बोनस PDF डाउनलोड</a>
        `;
        bonusGrid.appendChild(genBonusCard2);
    }

    // Update Welcome Card Stats
    updateWelcomeStatsCounts(purchasedCount, bonusCount, wishlistCount, demoCount);

    if (purchasedCount === 0 && purchasedGrid) {
        purchasedGrid.innerHTML = `
            <div style="grid-column: span 2; text-align: center; padding: 30px; color: #666; background:#fff; border-radius:12px; border:1px dashed #cbd5e1;">
                <p style="font-size: 0.95rem; font-weight: 700; color:#1e293b;">📚 आपकी लाइब्रेरी में अभी कोई खरीदी गई ई-बुक नहीं है।</p>
                <p style="font-size: 0.82rem; margin-top: 6px; color:#64748b;">कृपया 'उपलब्ध बुक्स (AVAILABLE)' टैब से अपनी पसंद की ई-बुक या VIP पास प्राप्त करें।</p>
                <button onclick="switchTab('available')" style="margin-top:12px; background:#E86A17; color:#fff; border:none; padding:8px 18px; border-radius:8px; font-weight:800; cursor:pointer;">
                    🛍️ उपलब्ध पुस्तकें देखें
                </button>
            </div>
        `;
    }
}

// वेलकम कार्ड के काउंट्स को वास्तविक वैल्यू से अपडेट करने का फंक्शन
function updateWelcomeStatsCounts(purchased, bonus, wishlist, demo) {
    const kpiPurchased = document.getElementById('kpiPurchasedCount');
    if (kpiPurchased) kpiPurchased.textContent = purchased;

    const kpiBonus = document.getElementById('kpiBonusCount');
    if (kpiBonus) kpiBonus.textContent = bonus || 0;

    const kpiDemo = document.getElementById('kpiDemoCount');
    if (kpiDemo) kpiDemo.textContent = demo || 0;

    const kpiWishlist = document.getElementById('kpiWishlistCount');
    if (kpiWishlist) kpiWishlist.textContent = wishlist;
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