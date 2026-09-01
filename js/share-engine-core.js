class UniversalShareEngine {
    // Add a static property to track if a share operation is in progress
    static isSharing = false;
    
    constructor() {
        // --- सुरक्षा: इंजन को जीवन में सिर्फ एक ही बार बनने दें ---
        if (window.activeShareEngine) {
            return window.activeShareEngine;
        }
        window.activeShareEngine = this;

        // Get the share_id upon initialization.
        this.share_id = this.getShareId();
        // Make this instance globally accessible to be used by other scripts.
        window.universalShareEngine = this;

        // Automatically handle incoming click/visit tracking on page load
        this.handleIncomingAttribution();

        // ऑटोमैटिकली init चलाएं ताकि अलग से कॉल करने की जरूरत न पड़े
        this.init();
    }

    // Initialize the engine using Event Delegation (Runs only once globally)
    init() {
        if (window.universalShareDelegated === true) {
            return;
        }
        window.universalShareDelegated = true;

        // पूरे डॉक्यूमेंट पर सिर्फ एक बार क्लिक लिसनर लगेगा
        document.addEventListener('click', (event) => {
            const button = event.target.closest('[data-share-button="true"]');
            if (!button) return;

            // सही बटन और इवेंट को हैंडलर में पास करें
            this.handleShareClick(event, button);
        });
    }

    // Get the share_id.
    // If a user is logged in, use their share_id.
    // If no user is logged in (guest), use the universal guest share_id 'AI000004'.
    getShareId() {
        const userString = localStorage.getItem('AI_USER');
        if (userString) {
            const user = JSON.parse(userString);
            return user.share_id || 'AI000004'; // Fallback for logged-in user without share_id
        }
        return 'AI000004'; // Fallback for guests
    }

    // Main handler for all share button clicks
    handleShareClick(event, directButton = null) {
        // --- सुरक्षा: सही बटन का रेफेरेंस प्राप्त करें ---
        const button = directButton || event.currentTarget || event.target.closest('[data-share-button="true"]');
        if (!button) return;

        // --- किसी भी अन्य छुपे हुए लिसनर या डुप्लीकेट ट्रिगर को रोकें ---
        if (event) {
            if (typeof event.stopImmediatePropagation === 'function') {
                event.stopImmediatePropagation();
            }
            if (typeof event.preventDefault === 'function') {
                event.preventDefault();
            }
        }
        
        // --- RAPID CLICK & GLOBAL SHARING PREVENTION ---
        if (button.dataset.isProcessing === 'true' || UniversalShareEngine.isSharing) {
            console.log('Share action already in progress. Ignoring rapid click.');
            return;
        }
        button.dataset.isProcessing = 'true';
        setTimeout(() => {
            button.dataset.isProcessing = 'false';
        }, 2000); // 2 सेकंड का कड़ा कूलडाउन
        // ---------------------------------------------

        const target = button.dataset.shareTarget; // e.g., 'native', 'whatsapp', 'facebook', 'copy'
        
        const assetType = button.dataset.assetType || 'page';
        const assetId = button.dataset.assetId || window.location.pathname;
        const pageTitle = document.title;

        const shareUrl = this.generateShareLink(assetType, assetId);
        const shareText = `Check this out: ${pageTitle}`;

        // ==========================================
        // 1. TRACK 'share' EVENT IN SUPABASE
        // ==========================================
        if (typeof trackAttributionEvent === 'function') {
            console.log('Tracking Event:', { event_type: 'share', share_token: this.share_id });
            trackAttributionEvent({
                event_type: 'share',
                share_token: this.share_id,
                referral_code: this.share_id,
                asset_type: assetType,
                asset_id: assetId
            });
        }

        switch (target) {
            case 'native':
                this.nativeShare(pageTitle, shareText, shareUrl, button);
                break;
            case 'whatsapp':
                this.whatsAppShare(shareText, shareUrl, button);
                break;
            case 'facebook':
                this.facebookShare(shareUrl, button);
                break;
            case 'copy':
                this.copyToClipboard(shareUrl, button);
                break;
            default:
                console.warn(`Unknown share target: ${target}`);
        }
    }

    // Handle incoming visitors via shared link (Click & Visit)
    handleIncomingAttribution() {
        const urlParams = new URLSearchParams(window.location.search);
        const incomingShareId = urlParams.get('share_id');

        if (incomingShareId) {
            // Save incoming share_id to localStorage so registration can use it later
            localStorage.setItem('AI_PENDING_REFERRAL', incomingShareId);

            // ==========================================
            // 2. TRACK 'click' & 'visit' EVENTS IN SUPABASE
            // ==========================================
            if (typeof trackAttributionEvent === 'function') {
                // Track Click
                console.log('Tracking Event:', { event_type: 'click', share_token: incomingShareId });
                trackAttributionEvent({
                    event_type: 'click',
                    share_token: incomingShareId,
                    referral_code: incomingShareId
                });

                // Track Visit
                console.log('Tracking Event:', { event_type: 'visit', share_token: incomingShareId });
                trackAttributionEvent({
                    event_type: 'visit',
                    share_token: incomingShareId,
                    referral_code: incomingShareId
                });
            }
        }
    }

    // Generate the universal share link.
    generateShareLink(assetType, assetId) {
        const origin = window.location.origin || 'https://aarogyamindia.online';
        let bookId = '';
        if (assetId && typeof assetId === 'string' && assetId.toUpperCase().startsWith('BK')) {
            bookId = assetId.toUpperCase();
        } else {
            const params = new URLSearchParams(window.location.search);
            bookId = (params.get('id') || params.get('book') || params.get('book_id') || '').toUpperCase();
            if (!bookId) {
                if (window.location.pathname.includes('kharif-master-guide-2026')) bookId = 'BK001';
                else if (window.location.pathname.includes('kheti-dr')) bookId = 'BK002';
            }
        }

        if (bookId) {
            return `${origin}/api/share?id=${encodeURIComponent(bookId)}&share_id=${encodeURIComponent(this.share_id)}`;
        }

        const pagePath = window.location.pathname;
        const src = `${assetType}:${assetId}`; 
        const url = new URL(origin + pagePath);
        url.searchParams.set('share_id', this.share_id);
        url.searchParams.set('src', src);
        return url.toString();
    }

    // Use the Web Share API for a native mobile sharing experience (With 100% WhatsApp Fallback)
    nativeShare(title, text, url, button) {
        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

        if (navigator.share && isMobile) {
            if (UniversalShareEngine.isSharing) return;
            UniversalShareEngine.isSharing = true;

            navigator.share({
                title: title,
                text: text,
                url: url
            })
            .then(() => {
                this._showConfirmation(button, '✅ Shared!');
            })
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    // If native share fails or canceled with error, fallback to WhatsApp
                    this.whatsAppShare(text, url, button);
                }
            })
            .finally(() => {
                setTimeout(() => {
                    UniversalShareEngine.isSharing = false;
                }, 1000);
            });
            return;
        }

        // On desktop or when native share is unavailable, immediately trigger WhatsApp
        this.whatsAppShare(text, url, button);
    }

    // Open WhatsApp share link (Mobile & Desktop Web)
    whatsAppShare(text, url, button) {
        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
        const fullMsg = (text && text.includes(url)) ? text : `${text}\n\n👉 अभी ऑर्डर करें:\n${url}`;
        const message = encodeURIComponent(fullMsg);

        // Copy to clipboard as backup
        if (navigator.clipboard) {
            navigator.clipboard.writeText(fullMsg).catch(() => {});
        }

        const waUrl = isMobile 
            ? `https://api.whatsapp.com/send?text=${message}` 
            : `https://web.whatsapp.com/send?text=${message}`;

        const win = window.open(waUrl, '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
            window.location.href = waUrl;
        }
        this._showConfirmation(button, '✅ WhatsApp Opened!');
    }

    // Open Facebook share link
    facebookShare(url, button) {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        this._showConfirmation(button, 'Shared!');
    }

    // Copy the link to the clipboard
    copyToClipboard(url, button) {
        navigator.clipboard.writeText(url).then(() => {
            this._showConfirmation(button, '📋 Copied!');
        }).catch(err => {
            prompt('शेयर लिंक कॉपी करें:', url);
        });
    }

    // Private helper to show a temporary confirmation message on a button
    _showConfirmation(button, message = 'Shared!', duration = 2000) {
        if (!button) return;
        const originalText = button.innerHTML;
        button.innerHTML = message;
        setTimeout(() => {
            button.innerHTML = originalText;
        }, duration);
    }
}

// Auto-initialize UniversalShareEngine immediately on script load
if (typeof window !== 'undefined') {
    if (!window.universalShareEngine) {
        window.universalShareEngine = new UniversalShareEngine();
    }
}