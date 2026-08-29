/* ==========================================
   AAROGYAM INDIA - PAYMENT SUCCESS JS V3
   (Multi-Book Cart Purchase Auto-Splitting & Individual Library Addition)
========================================== */

"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    await loadSuccessPage();
    startRedirectTimer(7); // 7 सेकंड का ऑटोमैटिक टाइमर
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

        // 2. Load Book Catalog to resolve metadata
        let booksCatalog = [];
        try {
            const response = await fetch("/data/books.json?v=" + Date.now());
            const data = await response.json();
            booksCatalog = data.books || data || [];
        } catch (e) {
            try {
                const response2 = await fetch("../data/books.json?v=" + Date.now());
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

        document.getElementById("amountPaid").textContent = "₹" + amount;
        document.getElementById("orderId").textContent = orderId;

        // Welcome user message
        const welcomeMsgEl = document.getElementById("welcomeUserMsg");
        if (welcomeMsgEl && (currentUser.full_name || currentUser.name)) {
            const userName = currentUser.full_name || currentUser.name;
            welcomeMsgEl.innerHTML = `📌 बधाई हो, ${userName} जी! आपका पेमेंट सफल रहा।`;
        }

        // 6. SAVE INDIVIDUAL PURCHASES INTO LOCALSTORAGE & SUPABASE
        try {
            const localPurchases = JSON.parse(localStorage.getItem('AI_PURCHASES') || localStorage.getItem('purchases') || '[]');
            const myPurchasedIds = JSON.parse(localStorage.getItem('my_purchased_book_ids') || '[]');
            const activeDb = window.dbClient || window.supabase;
            const profileId = currentUser.id || null;

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

                // Save to Database if connected
                if (activeDb && profileId) {
                    try {
                        await activeDb.from('purchases').insert([{
                            profile_id: profileId,
                            book_id: b.id,
                            amount: b.amount,
                            payment_id: paymentId,
                            order_id: orderId,
                            status: 'completed'
                        }]);
                    } catch (dbErr) {
                        console.warn("DB purchase insert note:", dbErr);
                    }
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

            if (activeDb && profileId) {
                await activeDb.from('profiles').update({
                    is_active: true,
                    is_subscriber: isSub ? true : userObj.is_subscriber
                }).eq('id', profileId);
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

    } catch (error) {
        console.error("Success Page Load Error:", error);
    }
}

/* ==========================================
   AUTOMATIC REDIRECT TIMER
========================================== */
function startRedirectTimer(durationInSeconds) {
    let timeLeft = durationInSeconds;
    const timerDisplay = document.getElementById("timerDisplay");

    if (!timerDisplay) return;

    const countdownInterval = setInterval(() => {
        timeLeft--;

        if (timeLeft > 0) {
            timerDisplay.innerHTML = `⏳ आपको ${timeLeft} सेकंड में ऑटोमैटिकली लाइब्रेरी में भेजा जा रहा है...`;
        } else {
            clearInterval(countdownInterval);
            timerDisplay.innerHTML = `🚀 आपको अब लाइब्रेरी पर भेजा जा रहा है...`;
            
            setTimeout(() => {
                window.location.href = "my-library.html";
            }, 1000);
        }
    }, 1000);
}