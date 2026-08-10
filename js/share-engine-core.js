
class UniversalShareEngine {
    // Add a static property to track if a share operation is in progress
    static isSharing = false;
    constructor() {
        // Get the share_id upon initialization.
        this.share_id = this.getShareId();
        // Make this instance globally accessible to be used by other scripts.
        window.universalShareEngine = this;
    }

    // Initialize the engine, find and prepare all share buttons on the page
    init() {
        const shareButtons = document.querySelectorAll('[data-share-button="true"]');
        shareButtons.forEach(button => {
            // Share buttons are always active for both guests and logged-in users.
            button.addEventListener('click', (event) => this.handleShareClick(event));
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
    handleShareClick(event) {
        const button = event.currentTarget;
        const target = button.dataset.shareTarget; // e.g., 'native', 'whatsapp', 'facebook', 'copy'
        
        const assetType = button.dataset.assetType || 'page';
        const assetId = button.dataset.assetId || window.location.pathname;
        const pageTitle = document.title;

        const shareUrl = this.generateShareLink(assetType, assetId);
        const shareText = `Check this out: ${pageTitle}`;

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

    // Generate the universal share link.
    generateShareLink(assetType, assetId) {
        const baseUrl = window.location.origin;
        const pagePath = window.location.pathname;
        // The 'src' parameter provides context on what is being shared.
        const src = `${assetType}:${assetId}`; 
        const url = new URL(baseUrl + pagePath);

        // Always include the share_id (either user's or guest's).
        url.searchParams.set('share_id', this.share_id);
        url.searchParams.set('src', src);

        return url.toString();
    }

    // Use the Web Share API for a native mobile sharing experience
    nativeShare(title, text, url) {
        if (!navigator.share) {
            console.log('Web Share API not supported, falling back or doing nothing.');
            return;
        }

        // Prevent multiple simultaneous share calls
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
            console.log('Error sharing', error);
        })
        .finally(() => {
            UniversalShareEngine.isSharing = false;
        });
    }

    // Open WhatsApp share link
    whatsAppShare(text, url) {
        const message = encodeURIComponent(`${text} ${url}`);
        window.open(`https://api.whatsapp.com/send?text=${message}`);
    }

    // Open Facebook share link
    facebookShare(url) {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
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

// To be instantiated and initialized on pages that use it.
// Example:
// document.addEventListener('DOMContentLoaded', () => {
//     const shareEngine = new UniversalShareEngine();
//     shareEngine.init();
// });
