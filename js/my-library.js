// =========================================================================
// AIM PROJECT - MY LIBRARY FINAL JAVASCRIPT (Supabase & Real User Integrated)
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initUserData();
    startDailyTimer();
    loadLibraryData();
    checkAndOpenProfileModal();
    checkAndControlLoginPopup(); // Check for login status on page load
});

// LOGIN POPUP & DATABASE CHECK
function checkAndControlLoginPopup() {
    const popupOverlay = document.getElementById('login-popup-overlay');
    if (!popupOverlay) return;

    if (isLoggedIn()) {
        popupOverlay.style.display = 'none';
    } else {
        popupOverlay.style.display = 'flex';
    }
}

async function checkUserLogin() {
    let rawInput = document.getElementById('login-mobile').value.trim();
    if (!rawInput || rawInput.length < 10) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    let cleanMobile = rawInput.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
        alert("Invalid mobile number! Please enter only 10 digits.");
        return;
    }

    const { data, error } = await isMobileRegistered(cleanMobile);

    if (error || !data) {
        alert("This mobile number is not registered. Please sign up first.");
        return;
    }

    createLoginSession(data);
    
    const popupOverlay = document.getElementById('login-popup-overlay');
    if (popupOverlay) {
        popupOverlay.style.display = 'none';
    }
    
    alert("Welcome back, " + (data.full_name || 'User') + "!");
    window.location.reload();
}

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

    // डायनेमिक प्रोफाइल परसेंटेज कैलकुलेशन
    calculateAndUpdateProfileProgress({ userName, userMobile, userEmail, userState, userDob, userCity, userAddress, userOccupation, userInterest });
}

// प्रोफाइल प्रोग्रेस बार (10% से 100% तक वास्तविक डेटा के आधार पर)
function calculateAndUpdateProfileProgress(data) {
    let filledFields = 0;
    const totalFields = 9;

    if (data.userName && data.userName !== "प्रिय पाठक") filledFields++;
    if (data.userMobile) filledFields++;
    if (data.userEmail) filledFields++;
    if (data.userState) filledFields++;
    if (data.userDob) filledFields++;
    if (data.userCity) filledFields++;
    if (data.userAddress) filledFields++;
    if (data.userOccupation) filledFields++;
    if (data.userInterest) filledFields++;

    const percentage = Math.max(10, Math.round((filledFields / totalFields) * 100)); // न्यूनतम 10% से शुरू होकर 100% तक

    // प्रोग्रेस बार की चौड़ाई और परसेंटेज टेक्स्ट अपडेट करना
    const progressFill = document.querySelector('.welcome-card-soft div[style*="background: #28a745"], .welcome-card-soft div[style*="background: rgb(40, 167, 69)"], .welcome-card-soft div[style*="background: linear-gradient"]');
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }

    // परसेंटेज टेक्स्ट लेबल अपडेट
    const percentLabels = document.querySelectorAll('.welcome-card-soft strong');
    percentLabels.forEach(el => {
        if (el.textContent.includes('%') || el.previousElementSibling?.textContent.includes('प्रोफाइल')) {
            el.textContent = percentage + '%';
        }
    });
}

// 6. स्मार्ट चेक: यदि यूजर लॉग-इन नहीं है या प्रोफाइल पहले से भरी हुई है, तो ऑटो-पॉपअप नहीं खुलेगा
function checkAndOpenProfileModal() {
    const storedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
    
    // अगर यूजर लॉग-इन ही नहीं है, तो बिल्कुल मत खोलो (लॉगिन पॉपअप के साथ क्लैश बंद)
    if (!storedUser.id && !storedUser.mobile) {
        return;
    }

    // अगर यूजर की प्रोफाइल पहले से भरी हुई है (यानी नाम और मोबाइल दोनों मौजूद हैं और प्रोग्रेस अच्छी है), तो बार-बार परेशान न करो
    const isProfileComplete = storedUser.full_name && storedUser.mobile && (storedUser.state || storedUser.city || storedUser.occupation);
    if (isProfileComplete) {
        return; 
    }

    // केवल नए या अधूरे प्रोफाइल वाले यूजर के लिए एक बार पॉपअप दिखाएं
    const hasSeenModal = localStorage.getItem('aim_profile_prompted');
    if (!hasSeenModal) {
        setTimeout(() => {
            openLeadModal();
            localStorage.setItem('aim_profile_prompted', 'true');
        }, 1200);
    }
}

function openLeadModal() {
    const modal = document.getElementById('leadModal');
    if (modal) {
        initUserData();
        modal.classList.add('show');
        modal.style.display = 'flex'; // पॉपअप को सही से स्क्रीन पर लाना
    }
}

function closeLeadModal() {
    const modal = document.getElementById('leadModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none'; // क्रॉस दबाते ही पॉपअप पूरी तरह गायब हो जाए
    }
}

// Form submission and save function
async function submitLeadForm(event) {
    event.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('You must be logged in to update your profile.');
        return;
    }

    const profileData = {
        full_name: document.getElementById('leadName').value,
        mobile: document.getElementById('leadPhone').value,
        email: document.getElementById('leadEmail') ? document.getElementById('leadEmail').value : '',
        State: document.getElementById('leadState') ? document.getElementById('leadState').value : '',
        dob: document.getElementById('leadDob') ? document.getElementById('leadDob').value : '',
        district: document.getElementById('leadCity') ? document.getElementById('leadCity').value : '',
        address: document.getElementById('leadAddress') ? document.getElementById('leadAddress').value : '',
        occupation: document.getElementById('leadOccupation') ? document.getElementById('leadOccupation').value : '',
        interest: document.getElementById('leadInterest') ? document.getElementById('leadInterest').value : ''
    };

    if (!profileData.full_name || !profileData.mobile) {
        alert('Please enter your name and mobile number.');
        return;
    }

    const { success, message, profile } = await updateProfile(currentUser.id, profileData);

    if (success) {
        alert('Congratulations! Your profile has been successfully updated.');
        closeLeadModal();
        initUserData(); // Re-initialize user data to reflect changes
    } else {
        alert('Error saving profile: ' + (message || 'Unknown error'));
    }
}

// ... (rest of the file remains the same until renderLibrarySections)

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

    const currentUser = getCurrentUser();
    let purchasedBookIds = [];
    if (currentUser) {
        const { data: purchases } = await getUserPurchases(currentUser.id);
        if (purchases) {
            purchasedBookIds = purchases.map(p => p.book_id);
        }
    }

    let purchasedCount = 0;
    let wishlistCount = JSON.parse(localStorage.getItem('AI_WISHLIST') || '[]').length;

    booksArray.forEach(book => {
        const bookId = book.book_id || book.id;
        const bookName = book.title || book.name;
        const bookCover = book.cover_image || book.cover;

        // 1. Purchased / My Books
        if (purchasedBookIds.includes(bookId)) {
            purchasedCount++;
            const card = document.createElement('div');
            card.className = 'book-card';
            card.innerHTML = `
                <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" title="Click to view full screen">
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
            
            let targetUrl = `/ebooks/checkout.html?id=${bookId}`;
            
            availCard.innerHTML = `
                <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" title="Click to view full screen">
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
                <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" title="Click to view full screen">
                <h4>${bookName} (Demo)</h4>
                <div class="book-btn-group" style="margin-top:10px;">
                    <button class="btn-read" onclick="window.location.href='download.html'" style="width:100%;padding:10px;background:#138A36;color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;">Read Demo</button>
                </div>
            `;
            const targetDemoGrid = document.getElementById('unlockBooksGrid') || (document.getElementById('section-demo') ? document.getElementById('section-demo').querySelector('.book-grid-2col') : null);
            if (targetDemoGrid) targetDemoGrid.appendChild(demoCard);
        }

        // 4. Coming Soon Books
        if (bookId !== 'BK001' && bookId !== 'BK002' && bookId !== 'BK006' && !purchasedBookIds.includes(bookId)) {
            const comingCard = document.createElement('div');
            comingCard.className = 'book-card';
            comingCard.innerHTML = `
                <div style="position: relative;">
                    <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" title="Click to view full screen">
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

    updateWelcomeStatsCounts(purchasedCount, 0, wishlistCount);

    if (purchasedCount === 0 && purchasedGrid) {
        purchasedGrid.innerHTML = `
            <div style="grid-column: span 2; text-align: center; padding: 30px; color: #666;">
                <p style="font-size: 0.95rem; font-weight: 600;">📚 You don't have any eBooks in your library yet.</p>
                <p style="font-size: 0.8rem; margin-top: 5px;">Please purchase an eBook from the 'Available' tab.</p>
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
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('PWA Service Worker Active'))
      .catch(err => console.log('PWA Error:', err));
  });
}