/* ==========================================================
        BOOK LANDING PAGE - 100% INDEPENDENT & JSON DRIVEN
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    /* ======================================================
        1. URL से बुक की ID या Slug पहचानना
    ====================================================== */
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get("book") || "BK002"; // डिफ़ॉल्ट आईडी

    let book = null;

    try {
        /* ======================================================
            2. JSON फाइल से डेटा फेच (Fetch) करना
        ====================================================== */
        const response = await fetch(`../data/books.json`); 
        if (!response.ok) {
            throw new Error("JSON फाइल लोड करने में विफल");
        }
        
        const data = await response.json();
        const booksList = data.books || data; 
        book = booksList.find(b => b.id === bookId) || booksList[0];

    } catch (error) {
        console.error("JSON डेटा फेच करने में एरर:", error);
        return; 
    }

    if (!book) return;

    /* ======================================================
        3. RENDER DYNAMIC DATA TO HTML (पेज पर डेटा भरना)
    ====================================================== */
    function renderPage() {
        // Meta & SEO
        document.getElementById("metaTitle").innerText = `${book.title} | Aarogyam India`;
        document.getElementById("metaDesc").setAttribute("content", book.description);
        document.getElementById("metaCanonical").setAttribute("href", book.pageUrl || window.location.href);

        document.getElementById("ogTitle").setAttribute("content", book.title);
        document.getElementById("ogDesc").setAttribute("content", book.description);
        document.getElementById("ogUrl").setAttribute("content", book.pageUrl || window.location.href);
        document.getElementById("ogImage").setAttribute("content", book.coverImage);

        // Hero Section
        document.getElementById("heroBannerBg").src = book.bannerImage;
        document.getElementById("heroBookCover").src = book.coverImage;
        document.getElementById("heroTag").innerText = book.tag;
        document.getElementById("heroTitle").innerText = book.title;
        document.getElementById("heroSubtitle").innerText = book.subtitle;
        document.getElementById("heroRating").innerText = book.ratingText;
        document.getElementById("heroDescription").innerText = book.description;
        document.getElementById("heroOldPrice").innerText = `₹${book.oldPrice}`;
        document.getElementById("heroNewPrice").innerText = `₹${book.price}`;
        document.getElementById("heroOfferBadge").innerText = book.offerBadge;

        // Dynamic Checkout Links (Passing Book ID)
        const checkoutUrl = `checkout.html?book=${book.id}`;
        document.getElementById("heroBuyBtn").setAttribute("href", checkoutUrl);
        document.getElementById("previewBuyBtn").setAttribute("href", checkoutUrl);
        document.getElementById("finalBuyBtn").setAttribute("href", checkoutUrl);
        document.getElementById("stickyBuyBtn").setAttribute("href", checkoutUrl);

        // WhatsApp Support
        const waMsg = encodeURIComponent(`नमस्ते, मुझे '${book.title}' पुस्तक के बारे में जानकारी चाहिए।`);
        document.getElementById("whatsappSupportBtn").setAttribute("href", `https://wa.me/${book.whatsappNumber}?text=${waMsg}`);
        document.getElementById("mobileHelpBtn").setAttribute("href", `https://wa.me/${book.whatsappNumber}?text=${waMsg}`);

        // Hero Features
        if (book.heroFeatures) {
            document.getElementById("heroFeaturesGrid").innerHTML = book.heroFeatures.map(f => `
                <div class="hero-feature">
                    <span style="font-size: 24px;">${f.icon}</span>
                    <span>${f.text}</span>
                </div>
            `).join("");
        }

        // Why Buy Grid
        if (book.whyBuy) {
            document.getElementById("whyBuyGrid").innerHTML = book.whyBuy.map(w => `
                <div class="why-card">
                    <div class="why-icon">${w.icon}</div>
                    <h3>${w.title}</h3>
                    <p>${w.desc}</p>
                </div>
            `).join("");
        }

        // Preview Gallery
        document.getElementById("previewBannerImg").src = book.previewBanner;
        if (book.previews) {
            document.getElementById("previewGrid").innerHTML = book.previews.map(img => `
                <div class="preview-card"><img src="${img}" alt="Preview Page"></div>
            `).join("");
        }

        // Bonus Section
        document.getElementById("bonusImg").src = book.bonusImage;
        if (book.bonusList) {
            document.getElementById("bonusList").innerHTML = book.bonusList.map(item => `<li>${item}</li>`).join("");
        }

        // Highlights Grid
        if (book.highlights) {
            document.getElementById("highlightsGrid").innerHTML = book.highlights.map(h => `
                <div class="highlight-card">${h}</div>
            `).join("");
        }

        // Table Details
        if (book.tableDetails) {
            document.getElementById("bookDetailsTable").innerHTML = book.tableDetails.map(t => `
                <tr><th>${t.label}</th><td>${t.value}</td></tr>
            `).join("");
        }

        // TOC
        if (book.toc) {
            document.getElementById("tocList").innerHTML = book.toc.map(item => `<li>✅ ${item}</li>`).join("");
        }

        // FAQs
        if (book.faqs) {
            document.getElementById("faqWrapper").innerHTML = book.faqs.map(faq => `
                <div class="faq-item">
                    <h3>${faq.q}</h3>
                    <p>${faq.a}</p>
                </div>
            `).join("");
        }

        // Reviews
        if (book.reviews) {
            document.getElementById("reviewsGrid").innerHTML = book.reviews.map(r => `
                <div class="review-card">
                    <div class="review-stars">${r.stars}</div>
                    <p>"${r.text}"</p>
                    <h4>${r.author}</h4>
                </div>
            `).join("");
        }

        // Final Buy Section
        document.getElementById("finalTitle").innerText = book.title;
        document.getElementById("finalDesc").innerText = book.description;
        document.getElementById("finalOldPrice").innerText = `₹${book.oldPrice}`;
        document.getElementById("finalNewPrice").innerText = `₹${book.price}`;

        // Mobile Sticky Bar
        document.getElementById("stickyThumb").src = book.coverImage;
        document.getElementById("stickyTitle").innerText = book.title;
        document.getElementById("stickyOldPrice").innerText = `₹${book.oldPrice}`;
        document.getElementById("stickyNewPrice").innerText = `₹${book.price}`;
    }

    renderPage();

    /* ======================================================
        4. RICH SHARING & COPY LINK SYSTEM (Safe Integration)
    ====================================================== */
    function getBookAsset() {
        if (!book) return null;
        return {
            asset_id: book.id || null,
            asset_type: 'book',
            asset_title: book.title || document.title,
            asset_url: book.pageUrl || window.location.href,
            description: book.description || '',
            price: `₹${book.price}`
        };
    }

    // Ensure share buttons have proper attributes so UniversalShareEngine handles them smoothly
    const shareBtns = [
        document.getElementById("heroShareBtn"),
        document.getElementById("deskShareWhatsapp"),
        document.getElementById("mobileShareButton"),
        document.getElementById("mobileShareBtn"),
        document.getElementById("deskShareFb"),
        document.getElementById("deskShareCopy")
    ];

    shareBtns.forEach(btn => {
        if (btn && !btn.hasAttribute('data-share-button')) {
            btn.setAttribute('data-share-button', 'true');
        }
    });

    // If UniversalShareEngine is already loaded globally, initialize it for this page's buttons
    if (window.universalShareEngine && typeof window.universalShareEngine.init === 'function') {
        window.universalShareEngine.init();
    }

    /* ======================================================
        5. FAQ ACCORDION & STICKY BAR UI LOGIC
    ====================================================== */
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach((item) => {
        const answer = item.querySelector("p");
        if (answer) answer.style.display = "none";

        item.addEventListener("click", () => {
            const opened = item.classList.contains("active");
            faqItems.forEach((faq) => {
                faq.classList.remove("active");
                const p = faq.querySelector("p");
                if (p) p.style.display = "none";
            });
            if (!opened) {
                item.classList.add("active");
                if (answer) answer.style.display = "block";
            }
        });
    });

    // Sticky Bar Scroll Effect
    const stickyBar = document.querySelector(".mobile-sticky-bar");
    const heroSection = document.querySelector(".book-hero");

    window.addEventListener("scroll", () => {
        if (!stickyBar || !heroSection) return;
        if (window.scrollY > heroSection.offsetHeight) {
            stickyBar.style.transform = "translateY(0)";
        } else {
            stickyBar.style.transform = "translateY(100%)";
        }
    });

    /* ======================================================
        6. INDEPENDENT MOBILE MENU & FAVICON FIX
    ====================================================== */
    let faviconLink = document.querySelector("link[rel*='icon']") || document.createElement('link');
    faviconLink.type = 'image/png';
    faviconLink.rel = 'icon';
    faviconLink.href = '../images/logo/favicon.png';
    document.getElementsByTagName('head')[0].appendChild(faviconLink);

    const menuBtn = document.querySelector(".menu-button");
    const mobileMenu = document.querySelector(".mobile-menu");
    const mobileOverlay = document.querySelector(".mobile-overlay");
    const menuClose = document.querySelector(".menu-close");

    function openMobileMenu() {
        if (mobileMenu) mobileMenu.classList.add("active");
        if (mobileOverlay) mobileOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeMobileMenu() {
        if (mobileMenu) mobileMenu.classList.remove("active");
        if (mobileOverlay) mobileOverlay.classList.remove("active");
        document.body.style.overflow = "";
    }

    if (menuBtn) {
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            openMobileMenu();
        });
    }

    if (menuClose) {
        menuClose.addEventListener("click", closeMobileMenu);
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener("click", closeMobileMenu);
    }

});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('PWA Service Worker Active'))
      .catch(err => console.log('PWA Error:', err));
  });
}