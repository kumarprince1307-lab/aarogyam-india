/* ==========================================================
                PART 1.1 START
            BOOK LANDING JS
========================================================== */

/* =========================================
            DOM READY
========================================= */

document.addEventListener("DOMContentLoaded",()=>{

/* =========================================
            COMMON ELEMENTS
========================================= */

const fadeItems=document.querySelectorAll(

".why-card,.preview-card,.highlight-card,.review-card,.faq-item,.bonus-wrapper,.book-details-wrapper"

);

const hero=document.querySelector(".book-hero");

const heroCover=document.querySelector(".hero-book-cover");

const heroButtons=document.querySelectorAll(

".hero-buttons a"

);

/* =========================================
        SCROLL REVEAL
========================================= */

const revealObserver=new IntersectionObserver(

(entries)=>{

entries.forEach((entry)=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

},

{

threshold:.15

}

);

fadeItems.forEach((item)=>{

item.classList.add("fade-up");

revealObserver.observe(item);

});

/* =========================================
        HERO FADE
========================================= */

if(hero){

hero.classList.add("hero-loaded");

}

/* =========================================
        HERO COVER HOVER
========================================= */

if(heroCover){

heroCover.addEventListener("mouseenter",()=>{

heroCover.style.transform="translateY(-10px) scale(1.04)";

});

heroCover.addEventListener("mouseleave",()=>{

heroCover.style.transform="";

});

}

/* =========================================
        BUTTON RIPPLE
========================================= */

heroButtons.forEach((button)=>{

button.addEventListener("click",(e)=>{

const circle=document.createElement("span");

const size=Math.max(

button.clientWidth,

button.clientHeight

);

circle.style.width=size+"px";

circle.style.height=size+"px";

circle.classList.add("ripple");

const rect=button.getBoundingClientRect();

circle.style.left=e.clientX-rect.left-size/2+"px";

circle.style.top=e.clientY-rect.top-size/2+"px";

button.appendChild(circle);

setTimeout(()=>{

circle.remove();

},600);

});

});

});

/* ==========================================================
                PART 1.1 END
========================================================== */
/* ==========================================================
                PART 1.2 START
        PREVIEW GALLERY JS
========================================================== */

/* =========================================
        PREVIEW IMAGE
========================================= */

const previewCards=document.querySelectorAll(".preview-card");

const previewImages=document.querySelectorAll(".preview-card img");

/* =========================================
        IMAGE HOVER EFFECT
========================================= */

previewCards.forEach((card)=>{

card.addEventListener("mouseenter",()=>{

card.style.transform="translateY(-8px)";

});

card.addEventListener("mouseleave",()=>{

card.style.transform="";

});

});

/* =========================================
        IMAGE CLICK EFFECT
========================================= */

previewImages.forEach((image)=>{

image.addEventListener("click",()=>{

image.style.transform="scale(1.08)";

setTimeout(()=>{

image.style.transform="";

},250);

});

});

/* =========================================
        PREVIEW BUTTON
========================================= */

const previewButton=document.querySelector(".preview-buy-btn");

if(previewButton){

previewButton.addEventListener("click",()=>{

const target=document.querySelector("#buy-now");

if(target){

target.scrollIntoView({

behavior:"smooth",

block:"start"

});

}

});

}

/* =========================================
        FUTURE LIGHTBOX
========================================= */

/*

Future Update

Preview Slider

Lightbox

Full Screen Preview

*/

/* ==========================================================
                PART 1.2 END
========================================================== */
/* ==========================================================
                PART 1.3 START
        FAQ + REVIEW ANIMATION JS
========================================================== */

/* =========================================
            FAQ STATIC CARDS (NO ACCORDION)
========================================= */

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
    const answer = item.querySelector("p");
    if (answer) {
        answer.style.display = "block";
    }
});

/* =========================================
        REVIEW CARD HOVER
========================================= */

const reviewCards=document.querySelectorAll(".review-card");

reviewCards.forEach((card)=>{

card.addEventListener("mouseenter",()=>{

card.style.transform="translateY(-10px) scale(1.02)";

});

card.addEventListener("mouseleave",()=>{

card.style.transform="";

});

});

/* =========================================
        REVIEW AUTO GLOW
========================================= */

let reviewIndex=0;

setInterval(()=>{

reviewCards.forEach((card)=>{

card.classList.remove("review-active");

});

if(reviewCards.length){

reviewCards[reviewIndex].classList.add("review-active");

reviewIndex++;

if(reviewIndex>=reviewCards.length){

reviewIndex=0;

}

}

},2500);

/* =========================================
        FAQ SCROLL ANIMATION
========================================= */

const faqObserver=new IntersectionObserver(

(entries)=>{

entries.forEach((entry)=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

},

{

threshold:.15

}

);

faqItems.forEach((item)=>{

faqObserver.observe(item);

});

/* ==========================================================
                PART 1.3 END
========================================================== */
/* ==========================================================
                PART 1.4 START
            STICKY BUY BAR JS
========================================================== */

/* =========================================
        STICKY BUY BAR
========================================= */

const stickyBar=document.querySelector(".sticky-buy-bar");

const heroSection=document.querySelector(".book-hero");

/* Hide Initially */

if(stickyBar){

stickyBar.style.opacity="0";

stickyBar.style.visibility="hidden";

stickyBar.style.transform="translateY(100%)";

}

/* =========================================
        SHOW / HIDE
========================================= */

window.addEventListener("scroll",()=>{

if(!stickyBar || !heroSection) return;

const heroBottom=heroSection.offsetHeight;

if(window.scrollY>heroBottom){

stickyBar.style.opacity="1";

stickyBar.style.visibility="visible";

stickyBar.style.transform="translateY(0)";

}else{

stickyBar.style.opacity="0";

stickyBar.style.visibility="hidden";

stickyBar.style.transform="translateY(100%)";

}

});

/* =========================================
        BUY NOW BUTTON
========================================= */

const stickyBuyBtn=document.querySelector(".sticky-buy-btn");

if(stickyBuyBtn){

stickyBuyBtn.addEventListener("click",()=>{

const buySection=document.querySelector("#buy-now");

if(buySection){

buySection.scrollIntoView({

behavior:"smooth",

block:"start"

});

}

});

}

/* =========================================
        SMALL CLICK ANIMATION
========================================= */

if(stickyBuyBtn){

stickyBuyBtn.addEventListener("mousedown",()=>{

stickyBuyBtn.style.transform="scale(.95)";

});

stickyBuyBtn.addEventListener("mouseup",()=>{

stickyBuyBtn.style.transform="";

});

stickyBuyBtn.addEventListener("mouseleave",()=>{

stickyBuyBtn.style.transform="";

});

}

/* ==========================================================
                PART 1.4 END
========================================================== */
/* ==========================================================
                PART 1.8 START
    INTEREST FORM + FINAL INITIALIZATION
========================================================== */

/* =========================================
        INTEREST POPUP
========================================= */

const interestPopup=document.querySelector(".interest-popup");

const interestForm=document.querySelector(".interest-form");

const interestInputs=document.querySelectorAll(

".interest-form input"

);

/* =========================================
        OPEN INTEREST POPUP
========================================= */

function openInterestPopup(){

if(!interestPopup || !popupOverlay) return;

popupOverlay.style.display="block";

interestPopup.style.display="block";

document.body.style.overflow="hidden";

}

/* =========================================
        CLOSE INTEREST POPUP
========================================= */

function closeInterestPopup(){

if(!interestPopup || !popupOverlay) return;

popupOverlay.style.display="none";

interestPopup.style.display="none";

document.body.style.overflow="";

}

/* =========================================
        FORM VALIDATION
========================================= */

if(interestForm){

interestForm.addEventListener(

"submit",

(event)=>{

event.preventDefault();

let valid=true;

interestInputs.forEach((input)=>{

if(input.value.trim()===""){

valid=false;

input.focus();

}

});

if(valid){

alert(

"धन्यवाद!\n\nहम शीघ्र ही आपसे संपर्क करेंगे।"

);

interestForm.reset();

closeInterestPopup();

}

}

);

}

/* =========================================
        PAYMENT PLACEHOLDER
========================================= */

function paymentGateway(){

console.log(

"Future Razorpay Module"

);

}

/* =========================================
        DOWNLOAD PLACEHOLDER
========================================= */

function downloadBook(){

console.log(

"Future Download Module"

);

}

/* =========================================
        MY LIBRARY PLACEHOLDER
========================================= */

function openLibrary(){

console.log(

"Future My Library Module"

);

}

/* =========================================
        PAGE LOADED
========================================= */

window.addEventListener(

"load",

()=>{

console.log(

"Book Landing Page Ready"

);

}

);

/* ==========================================================
                PART 1.8 END
        BOOK LANDING JS COMPLETE
========================================================== */
/* ==========================================================
            PART 2.3 START
        HERO SHARE BUTTON JS
========================================================== */

const heroShareBtn = document.querySelector(".share-now-btn");

const shareTitle = "खरीफ फसल मास्टर गाइड 2026";

const shareText =
`🌾 खरीफ फसल मास्टर गाइड 2026

📘 धान, सोयाबीन, मक्का सहित खरीफ फसलों की सम्पूर्ण Practical Guide।

💰 सीमित समय के लिए ₹299 की जगह ₹99

👇 अभी देखें`;

const shareUrl = window.location.href;

/* =========================================
        SHARE NOW
========================================= */

if(heroShareBtn){

heroShareBtn.addEventListener("click",()=>{

handleShare('native');

});

}

/* ==========================================================
            PART 2.3 END
========================================================== */
/* ==========================================================
        MASTER SHARE & STICKY SYSTEM (Phase-3 Integrated)
========================================================== */

const shareDataElement = document.getElementById("book-share-data");
const helpButton = document.getElementById("helpButton");
const mobileShareButton = document.getElementById("mobileShareButton");
const desktopWhatsapp = document.querySelector(".share-whatsapp");
const desktopFacebook = document.querySelector(".share-facebook");
const desktopCopy = document.querySelector(".share-copy");

// Helper to get asset data from the DOM
function getBookAsset() {
    if (!shareDataElement) return null;
    return {
        asset_id: shareDataElement.dataset.id || null,
        asset_type: 'book',
        asset_title: shareDataElement.dataset.title || document.title,
        asset_url: shareDataElement.dataset.url || window.location.href,
        description: shareDataElement.dataset.description || '',
        price: shareDataElement.dataset.price || ''
    };
}

// Central share handler
async function handleShare(channel) {
    const asset = getBookAsset();
    if (!asset) {
        console.error("Share asset data not found.");
        return;
    }

    // Use a non-tracked URL for the help button
    if (channel === 'help') {
        const message = `नमस्ते,\n\nमुझे "${asset.asset_title}" के बारे में जानकारी चाहिए।\n\n${asset.asset_url}`;
        window.open("https://wa.me/917974422572?text=" + encodeURIComponent(message), "_blank");
        return;
    }

    // Generate tracked URL for all other channels
    let trackedUrl;
    if (window.universalShareEngine) {
        const assetId = asset.asset_id || 'kharif-master-guide-2026'; // Fallback assetId
        trackedUrl = window.universalShareEngine.generateShareLink(asset.asset_type, assetId);
    } else {
        console.error("UniversalShareEngine not found. Falling back to asset URL.");
        trackedUrl = asset.asset_url;
    }
    const shareText = `📖 ${asset.asset_title}\n${asset.description}\n💰 Limited Time Offer : ${asset.price}\n👇 अभी देखें`;

    switch (channel) {
        case 'whatsapp':
            window.open("https://wa.me/?text=" + encodeURIComponent(shareText + '\n' + trackedUrl), "_blank");
            break;

        case 'facebook':
            window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(trackedUrl), "_blank");
            break;

        case 'copy':
            navigator.clipboard.writeText(trackedUrl)
                .then(() => {
                    if (desktopCopy) {
                        desktopCopy.innerHTML = '<i class="fa-solid fa-circle-check"></i> Copied';
                        setTimeout(() => {
                            desktopCopy.innerHTML = '<i class="fa-solid fa-link"></i> Copy Link';
                        }, 2000);
                    } else {
                        alert("Link Copied!");
                    }
                })
                .catch((err) => console.error("Link Copy Failed:", err));
            break;

        case 'native':
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: asset.asset_title,
                        text: `${asset.description}\n💰 ऑफर : ${asset.price}`,
                        url: trackedUrl
                    });
                } catch (err) {
                    console.log("Share Cancelled");
                }
            } else {
                // Fallback for desktop "mobile" share button
                handleShare('copy');
            }
            break;
    }
}

// Bind events
if (helpButton) {
    helpButton.addEventListener("click", (e) => {
        e.preventDefault();
        handleShare('help');
    });
}
if (mobileShareButton) {
    mobileShareButton.addEventListener("click", () => handleShare('native'));
}
if (desktopWhatsapp) {
    desktopWhatsapp.addEventListener("click", () => handleShare('whatsapp'));
}
if (desktopFacebook) {
    desktopFacebook.addEventListener("click", () => handleShare('facebook'));
}
if (desktopCopy) {
    desktopCopy.addEventListener("click", () => handleShare('copy'));
}

/* ==========================================================
                PART 3C END
========================================================== */