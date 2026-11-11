/* ==========================================
   AAROGYAM INDIA - PAYMENT SUCCESS JS V3
   (Multi-Book Cart Purchase Auto-Splitting & Individual Library Addition)
========================================== */

"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    await loadSuccessPage();
});

async function loadSuccessPage() {
    try {
        const params = new URLSearchParams(window.location.search);
        
        // 1. URL Parameters व LocalStorage से ऑर्डर डेटा प्राप्त करें
        let rawBookId = params.get("ids") || params.get("book_id") || params.get("id") || params.get("bookId");
        let amount = params.get("amount");
        let orderId = params.get("order") || params.get("orderId") || params.get("payment_id") || params.get("order_id");
        let paymentId = params.get("payment_id") || params.get("razorpay_payment_id") || ("pay_" + Math.floor(100000000 + Math.random() * 900000000));

        const storedOrder = JSON.parse(localStorage.getItem("AI_CURRENT_ORDER") || "{}");
        const currentUser = JSON.parse(localStorage.getItem("AI_USER") || localStorage.getItem("AI_PROFILE") || "{}");

        if (!rawBookId && storedOrder.bookId) rawBookId = storedOrder.bookId;
        if (!rawBookId && storedOrder.book_id) rawBookId = storedOrder.book_id;
        
        // Check if storedOrder has items list
        let orderItems = [];
        if (storedOrder.items && Array.isArray(storedOrder.items) && storedOrder.items.length > 0) {
            orderItems = storedOrder.items;
        }

        amount = amount || storedOrder.amount || storedOrder.offerPrice || "99";
        orderId = orderId || storedOrder.orderId || storedOrder.paymentId || ("TXN_" + Math.floor(100000000 + Math.random() * 900000000));

        // 2. Load Book Catalog to resolve metadata (Zero-Egress 5-Min Rolling HTTP Cache)
        let booksCatalog = [];
        const cacheTime = Math.floor(Date.now() / 300000);
        try {
            const response = await fetch("/data/books.json?v=" + cacheTime);
            const data = await response.json();
            booksCatalog = data.books || data || [];
        } catch (e) {
            try {
                const response2 = await fetch("../data/books.json?v=" + cacheTime);
                const data2 = await response2.json();
                booksCatalog = data2.books || data2 || [];
            } catch (e2) {}
        }

        try {
            const customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
            if (Array.isArray(customBooks)) {
                customBooks.forEach(cb => {
                    if (cb && cb.id) booksCatalog.unshift(cb);
                });
            }
        } catch (e) {}

        // 3. Extract All Individual Book IDs (Split comma-separated lists)
        let bookIdsToProcess = [];
        if (rawBookId) {
            bookIdsToProcess = String(rawBookId).split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
        } else if (orderItems.length > 0) {
            bookIdsToProcess = orderItems.map(it => (it.id || it.book_id || '').toUpperCase()).filter(Boolean);
        } else {
            // Check AI_CART_ITEMS
            const cartItems = JSON.parse(localStorage.getItem('AI_CART_ITEMS') || '[]');
            if (Array.isArray(cartItems) && cartItems.length > 0) {
                bookIdsToProcess = cartItems.map(x => String(x).trim().toUpperCase()).filter(Boolean);
            } else {
                bookIdsToProcess = ['BK001'];
            }
        }

        // Deduplicate book IDs
        bookIdsToProcess = [...new Set(bookIdsToProcess)];

        // 4. Resolve Book Details for each ID
        const resolvedBooks = bookIdsToProcess.map(bId => {
            const b = booksCatalog.find(item => (item.id && item.id.toUpperCase() === bId) || (item.book_id && item.book_id.toUpperCase() === bId)) || {
                id: bId,
                title: bId === 'BK001' ? 'खरीफ फसल मास्टर गाइड 2026' : (bId === 'BK002' ? 'खेती का डॉक्टर (Pocket Doctor)' : 'Aarogyam Digital eBook'),
                offerPrice: Math.round(parseFloat(amount) / bookIdsToProcess.length) || 99,
                cover: bId === 'BK002' ? '/images/books/fasal-ka-doctor-cover.webp' : '/images/books/kharif-master-guide-2026-cover.webp'
            };
            return {
                id: bId,
                title: b.title || b.name || b.heading || bId,
                amount: b.offerPrice || Math.round(parseFloat(amount) / bookIdsToProcess.length) || 99,
                cover: b.cover || b.cover_image || b.thumbnail || '/images/books/kharif-master-guide-2026-cover.webp'
            };
        });

        // 5. Update UI Elements
        const bookNameEl = document.getElementById("bookName");
        if (bookNameEl) {
            if (resolvedBooks.length === 1) {
                bookNameEl.textContent = resolvedBooks[0].title;
            } else {
                bookNameEl.innerHTML = `
                    <div style="font-weight:900; color:#15803d; margin-bottom:6px;">
                        📚 ${resolvedBooks.length} डिजिटल पुस्तकें आपकी लाइब्रेरी में जोड़ी गईं:
                    </div>
                    <ul style="list-style:none; padding:0; margin:0; font-size:0.85rem; color:#334155; line-height:1.45;">
                        ${resolvedBooks.map(b => `<li style="margin-bottom:3px;">✅ <strong>${b.title}</strong></li>`).join('')}
                    </ul>
                `;
            }
        }

        const amountPaidEl = document.getElementById("amountPaid");
        if (amountPaidEl) amountPaidEl.textContent = "₹" + amount;
        const orderIdDisplayEl = document.getElementById("orderId");
        if (orderIdDisplayEl) orderIdDisplayEl.textContent = orderId;

        const welcomeMsgEl = document.getElementById("welcomeUserMsg");
        const userName = currentUser.full_name || currentUser.name;
        if (welcomeMsgEl && userName) {
            welcomeMsgEl.innerHTML = `📌 बधाई हो, ${userName} जी! आपका पेमेंट सफल रहा।`;
        }

        // 6. SAVE INDIVIDUAL PURCHASES INTO LOCALSTORAGE & SUPABASE
        try {
            const localPurchases = JSON.parse(localStorage.getItem('AI_PURCHASES') || localStorage.getItem('purchases') || '[]');
            const myPurchasedIds = JSON.parse(localStorage.getItem('my_purchased_book_ids') || '[]');
            let activeDb = window.dbClient || (window.supabase && typeof window.supabase.from === 'function' ? window.supabase : null);
            if (!activeDb && typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
                try {
                    activeDb = window.supabase.createClient("https://qjhjrzsnrtahmhswxyvb.supabase.co", "sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU");
                    window.dbClient = activeDb;
                } catch (_) {}
            }
            const profileId = currentUser.id || null;

            // Invalidate session purchase caches so next visit gets fresh data immediately
            try {
                if (profileId) sessionStorage.removeItem('AIM_PURCHASES_CACHE_' + profileId);
                Object.keys(sessionStorage).forEach(k => {
                    if (k.startsWith('AIM_PURCHASES_CACHE_')) sessionStorage.removeItem(k);
                });
            } catch (e) {}

            for (const b of resolvedBooks) {
                // Check if this book for this order is already added
                const alreadyExists = localPurchases.some(p => (p.book_id && p.book_id.toUpperCase() === b.id.toUpperCase()) && (p.order_id === orderId || p.payment_id === paymentId));
                
                if (!alreadyExists) {
                    const newPurchaseRecord = {
                        id: 'pur_' + orderId + '_' + b.id,
                        book_id: b.id,
                        title: b.title,
                        amount: b.amount,
                        order_id: orderId,
                        payment_id: paymentId,
                        cover: b.cover,
                        status: 'completed',
                        payment_status: 'success',
                        created_at: new Date().toISOString()
                    };
                    localPurchases.push(newPurchaseRecord);
                }

                if (!myPurchasedIds.includes(b.id)) {
                    myPurchasedIds.push(b.id);
                }
            }

            // 🛡️ CONSTITUTIONAL RULE: Bundle Single-Order DB Insert (Never split into 5 individual rows)
            let targetProfileId = profileId;
            if (!targetProfileId && activeDb) {
                const mob = currentUser.mobile || storedOrder.mobile || storedOrder.customerMobile || localStorage.getItem('user_mobile');
                if (mob) {
                    const cleanM = String(mob).replace(/\D/g, '').slice(-10);
                    if (cleanM) {
                        try {
                            const { data: prof } = await activeDb.from('profiles').select('id').eq('mobile', cleanM).maybeSingle();
                            if (prof && prof.id) targetProfileId = prof.id;
                        } catch (_) {}
                    }
                }
            }

            if (activeDb && targetProfileId) {
                try {
                    // Check if already inserted by checkout.js (Deduplication)
                    const { data: existingP } = await activeDb.from('purchases').select('id').eq('payment_id', paymentId).limit(1);
                    if (!existingP || existingP.length === 0) {
                        const finalDbBookId = rawBookId || bookIdsToProcess.join(',');
                        await activeDb.from('purchases').insert([{
                            profile_id: targetProfileId,
                            book_id: finalDbBookId,
                            amount: Number(amount) || 149,
                            payment_id: paymentId,
                            order_id: orderId,
                            payment_status: 'success',
                            purchase_date: new Date().toISOString()
                        }]);
                    }
                } catch (dbErr) {
                    console.warn("DB purchase insert note:", dbErr);
                }
            }

            localStorage.setItem('AI_PURCHASES', JSON.stringify(localPurchases));
            localStorage.setItem('purchases', JSON.stringify(localPurchases));
            localStorage.setItem('my_purchased_book_ids', JSON.stringify(myPurchasedIds));

            // Clear Cart after successful checkout
            localStorage.removeItem('AI_CART_ITEMS');

            // Activate User
            const isSub = bookIdsToProcess.some(id => id.includes('SUB')) || parseInt(amount, 10) >= 999;
            const userObj = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
            userObj.is_active = true;
            if (isSub) userObj.is_subscriber = true;
            localStorage.setItem('AI_USER', JSON.stringify(userObj));
            localStorage.setItem('AI_PROFILE', JSON.stringify(userObj));
            localStorage.setItem('UCAS_USER', JSON.stringify(userObj));
            localStorage.setItem('user_is_active', 'true');
            if (isSub) localStorage.setItem('user_is_subscriber', 'true');

            const finalActiveProfId = profileId || targetProfileId;
            if (activeDb && finalActiveProfId) {
                try {
                    await activeDb.from('profiles').update({
                        is_active: true
                    }).eq('id', finalActiveProfId);
                } catch (e) {
                    console.warn("Profile activation error:", e);
                }
            }
        } catch (e) {
            console.error("Purchase processing error:", e);
        }

        // 7. Facebook Pixel Purchase Event
        if (typeof fbq === 'function') {
            fbq('track', 'Purchase', {
                value: parseFloat(amount),
                currency: 'INR',
                content_ids: bookIdsToProcess,
                content_type: 'product',
                order_id: orderId
            });
        }

        // 8. DIRECT FLOW TO DOWNLOAD.HTML FOR PURCHASED BOOK
        let targetBookId = 'BK001';
        if (resolvedBooks && resolvedBooks.length > 0 && resolvedBooks[0].id) {
            targetBookId = resolvedBooks[0].id;
        } else if (rawBookId) {
            targetBookId = String(rawBookId).split(',')[0].trim().toUpperCase();
        }

        const isBundle = resolvedBooks && resolvedBooks.length > 1;
        const targetDownloadUrl = isBundle 
            ? `download.html?book=${encodeURIComponent(targetBookId)}&bundle=true` 
            : `download.html?book=${encodeURIComponent(targetBookId)}`;

        const downloadBtn = document.getElementById("btnDownloadNow") || document.querySelector(".library-btn");
        if (downloadBtn) {
            downloadBtn.href = targetDownloadUrl;
            downloadBtn.innerHTML = isBundle 
                ? `📥 सभी ${resolvedBooks.length} पुस्तकें डाउनलोड करें / पढ़ें` 
                : `📥 ई-बुक तुरंत डाउनलोड करें / ऐप में खोलें`;
        }

        // Auto-redirect to download.html in 2 seconds (Fast & instant delivery)
        startRedirectTimer(2, targetDownloadUrl);

    } catch (error) {
        console.error("Success Page Load Error:", error);
        // Fallback redirect even on error
        startRedirectTimer(2, "download.html");
    }
}

/* ==========================================
   AUTOMATIC REDIRECT TIMER TO DOWNLOAD.HTML (2 SECONDS FAST)
========================================== */
function startRedirectTimer(durationInSeconds, targetUrl) {
    let timeLeft = durationInSeconds || 2;
    const timerDisplay = document.getElementById("timerDisplay");
    const destination = targetUrl || "download.html?book=BK001";

    if (!timerDisplay) return;

    timerDisplay.innerHTML = `⏳ आपको ${timeLeft} सेकंड में सीधे ई-बुक डाउनलोड व ऐप हब पर भेजा जा रहा है...`;

    const countdownInterval = setInterval(() => {
        timeLeft--;

        if (timeLeft > 0) {
            timerDisplay.innerHTML = `⏳ आपको ${timeLeft} सेकंड में सीधे ई-बुक डाउनलोड व ऐप हब पर भेजा जा रहा है...`;
        } else {
            clearInterval(countdownInterval);
            timerDisplay.innerHTML = `🚀 आपको अब ई-बुक डाउनलोड हब पर भेजा जा रहा है...`;
            
            setTimeout(() => {
                window.location.replace(destination);
            }, 200);
        }
    }, 1000);
}