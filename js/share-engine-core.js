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
                this.nativeShare(pageTitle, shareText, shareUrl);
                break;
            case 'whatsapp':
                this.whatsAppShare(shareText, shareUrl);
                break;
            case 'facebook':
                this.facebookShare(shareUrl);
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
        const baseUrl = window.location.origin;
        const pagePath = window.location.pathname;
        const src = `${assetType}:${assetId}`; 
        const url = new URL(baseUrl + pagePath);

        url.searchParams.set('share_id', this.share_id);
        url.searchParams.set('src', src);

        return url.toString();
    }

    // Use the Web Share API for a native mobile sharing experience (Updated with strict error & state lock)
    nativeShare(title, text, url) {
        if (!navigator.share) {
            console.log('Web Share API not supported, falling back or doing nothing.');
            return;
        }

        if (UniversalShareEngine.isSharing) {
            console.log('A native share is already in progress. Skipping.');
            return;
        }

        UniversalShareEngine.isSharing = true;
        navigator.share({
            title: title,
            text: text,
            url: url,
        })
        .then(() => {
            console.log('Successful native share');
        })
        .catch((error) => {
            if (error.name !== 'AbortError') {
                console.log('Error sharing', error);
            }
        })
        .finally(() => {
            setTimeout(() => {
                UniversalShareEngine.isSharing = false;
            }, 1500);
        });
    }

    // Open WhatsApp share link
    whatsAppShare(text, url) {
        const message = encodeURIComponent(`${text} ${url}`);
        window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
    }

    // Open Facebook share link
    facebookShare(url) {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }

    // Copy the link to the clipboard
    copyToClipboard(url, button) {
        navigator.clipboard.writeText(url).then(() => {
            const originalText = button.innerHTML;
            button.innerHTML = 'Copied!';
            button.disabled = true;
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }
}