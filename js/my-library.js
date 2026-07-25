// =========================================================================
// AIM PROJECT - MY LIBRARY V3 FINAL JAVASCRIPT (Error-Free & Updated)
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

// 2. Logout Function
function logoutUser() {
    alert('आप सफलतापूर्वक लॉग आउट हो चुके हैं।');
    window.location.href = '/index.html';
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

// 5. डिफ़ॉल्ट यूजर (अविनाश मिश्रा) और ऑटो-फिल प्रोफाइल डेटा
function initUserData() {
    const defaultUser = "अविनाश मिश्रा";
    const storedUser = localStorage.getItem('aim_user_name') || defaultUser;
    const storedPhone = localStorage.getItem('aim_user_phone') || "7974422572";
    const storedEmail = localStorage.getItem('aim_user_email') || "";
    const storedCity = localStorage.getItem('aim_user_city') || "";
    const storedAddress = localStorage.getItem('aim_user_address') || "";
    
    const userNameSpan = document.getElementById('userName');
    const menuUserName = document.getElementById('menuUserName');
    
    if (userNameSpan) userNameSpan.textContent = storedUser;
    if (menuUserName) menuUserName.textContent = storedUser;

    if (document.getElementById('leadName')) document.getElementById('leadName').value = storedUser;
    if (document.getElementById('leadPhone')) document.getElementById('leadPhone').value = storedPhone;
    if (document.getElementById('leadEmail')) document.getElementById('leadEmail').value = storedEmail;
    if (document.getElementById('leadCity')) document.getElementById('leadCity').value = storedCity;
    if (document.getElementById('leadAddress')) document.getElementById('leadAddress').value = storedAddress;
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
    }
}

function closeLeadModal() {
    const modal = document.getElementById('leadModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function submitLeadForm(event) {
    event.preventDefault();
    const name = document.getElementById('leadName').value;
    const phone = document.getElementById('leadPhone').value;
    const email = document.getElementById('leadEmail') ? document.getElementById('leadEmail').value : '';
    const city = document.getElementById('leadCity') ? document.getElementById('leadCity').value : '';
    const address = document.getElementById('leadAddress') ? document.getElementById('leadAddress').value : '';

    if (name && phone) {
        localStorage.setItem('aim_user_name', name);
        localStorage.setItem('aim_user_phone', phone);
        localStorage.setItem('aim_user_email', email);
        localStorage.setItem('aim_user_city', city);
        localStorage.setItem('aim_user_address', address);
        
        alert('बधाई हो! आपकी प्रोफाइल जानकारी सफलतापूर्वक सहेज ली गई है।');
        closeLeadModal();
        initUserData();
    }
}

// 7. Full Screen Zoom Modal Handler
function openImageZoom(imgSrc) {
    let modal = document.getElementById('imageZoomModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageZoomModal';
        modal.className = 'image-modal-overlay';
        modal.innerHTML = `
            <button class="close-image-modal" onclick="closeImageZoom()">&times;</button>
            <img class="image-modal-content" id="zoomedImg" src="" alt="Zoomed Book">
        `;
        document.body.appendChild(modal);
    }
    document.getElementById('zoomedImg').src = imgSrc;
    modal.classList.add('show');
}

function closeImageZoom() {
    const modal = document.getElementById('imageZoomModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// 8. Load Books Data from books.json
function loadLibraryData() {
    fetch('/data/books.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response error');
            return response.json();
        })
        .then(data => {
            renderLibrarySections(data.books);
        })
        .catch(error => {
            console.error('Error loading library books:', error);
        });
}

function renderLibrarySections(booksArray) {
    const purchasedGrid = document.getElementById('purchasedBooksGrid');
    const availableGrid = document.getElementById('availableBooksGrid');
    const demoGrid = document.getElementById('unlockBooksGrid');
    const comingSoonGrid = document.getElementById('comingSoonGrid');

    if (purchasedGrid) purchasedGrid.innerHTML = '';
    if (availableGrid) availableGrid.innerHTML = '';
    if (demoGrid) demoGrid.innerHTML = '';
    if (comingSoonGrid) comingSoonGrid.innerHTML = '';

    if (!booksArray) return;

    booksArray.forEach(book => {
        // 1. Purchased / My Books (खरीदी गई किताबें)
        if (book.id === 'BK001') {
            const card = document.createElement('div');
            card.className = 'book-card';
            card.innerHTML = `
                <img src="${book.cover}" alt="${book.name}" onclick="openImageZoom('${book.cover}')" title="क्लिक करके बड़ा देखें">
                <h4>${book.name}</h4>
                <div class="book-btn-group">
                    <button class="btn-read" onclick="window.location.href='/ebooks/kharif-master-guide-2026.html'">Read Now</button>
                    <button class="btn-buy" onclick="window.location.href='/ebooks/kharif-master-guide-2026.html'">Download Now</button>
                </div>
            `;
            if (purchasedGrid) purchasedGrid.appendChild(card);
        }

        // 2. Available Books (उपलब्ध बुक्स - तीनों मुख्य किताबें: BK001, BK002, BK006)
        if (book.id === 'BK001' || book.id === 'BK002' || book.id === 'BK006') {
            const availCard = document.createElement('div');
            availCard.className = 'book-card';
            
            let targetUrl = '/ebooks/checkout.html';
            if (book.id === 'BK001') {
                targetUrl = '/ebooks/kharif-master-guide-2026.html';
            }

            availCard.innerHTML = `
                <img src="${book.cover}" alt="${book.name}" onclick="openImageZoom('${book.cover}')">
                <h4>${book.name}</h4>
                <div class="book-btn-group" style="margin-top: 10px;">
                    <a href="${targetUrl}" class="btn-available">Buy Now / Details</a>
                </div>
            `;
            if (availableGrid) availableGrid.appendChild(availCard);
        }

        // 3. Demo Books (डेमो बुक्स)
        if (book.id === 'BK001') {
            const demoCard = document.createElement('div');
            demoCard.className = 'book-card';
            demoCard.innerHTML = `
                <img src="${book.cover}" alt="${book.name}" onclick="openImageZoom('${book.cover}')">
                <h4>${book.name} (Demo)</h4>
                <div class="book-btn-group">
                    <button class="btn-read" onclick="window.location.href='/ebooks/demo-kharif.html'">Read Demo</button>
                </div>
            `;
            if (demoGrid) demoGrid.appendChild(demoCard);
        } else if (book.id === 'BK002' || book.id === 'BK006') {
            const demoCard2 = document.createElement('div');
            demoCard2.className = 'book-card';
            demoCard2.innerHTML = `
                <img src="${book.cover}" alt="${book.name}" onclick="openImageZoom('${book.cover}')">
                <h4>${book.name} (Demo Placeholder)</h4>
                <div class="book-btn-group">
                    <button class="btn-read" style="background: #95a5a6; cursor: not-allowed;">Coming Soon</button>
                </div>
            `;
            if (demoGrid) demoGrid.appendChild(demoCard2);
        }

        // 4. Coming Soon Books (कमिंग सून बुक्स - जिसमें से तीनों मुख्य किताबें हट चुकी हैं)
        if (book.id !== 'BK001' && book.id !== 'BK002' && book.id !== 'BK006') {
            const comingCard = document.createElement('div');
            comingCard.className = 'book-card';
            comingCard.innerHTML = `
                <div style="position: relative;">
                    <img src="${book.cover}" alt="${book.name}" onclick="openImageZoom('${book.cover}')">
                    <span style="position: absolute; top: 8px; right: 8px;" onclick="toggleWishlist(this, '${book.name}')" class="wishlist-heart">❤️</span>
                </div>
                <h4>${book.name}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding: 0 4px;">
                    <span style="font-size: 0.75rem; color: #e67e22; font-weight: 700;">Coming Soon</span>
                    <button class="btn-buy" style="padding: 4px 10px; font-size: 0.75rem;" onclick="window.location.href='/ebooks/wishlist.html'">Buy Now / Place</button>
                </div>
            `;
            if (comingSoonGrid) comingSoonGrid.appendChild(comingCard);
        }
    });
}

// 9. Wishlist Heart Toggle
function toggleWishlist(element, bookName) {
    element.classList.toggle('active');
    if (element.classList.contains('active')) {
        alert(bookName + ' को आपकी Wishlist में जोड़ दिया गया है!');
    } else {
        alert(bookName + ' को Wishlist से हटा दिया गया है।');
    }
}