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
            FAQ ACCORDION
========================================= */

const faqItems=document.querySelectorAll(".faq-item");

faqItems.forEach((item)=>{

const answer=item.querySelector("p");

if(answer){

answer.style.display="none";

}

item.addEventListener("click",()=>{

const opened=item.classList.contains("active");

/* Close All */

faqItems.forEach((faq)=>{

faq.classList.remove("active");

const p=faq.querySelector("p");

if(p){

p.style.display="none";

}

});

/* Open Selected */

if(!opened){

item.classList.add("active");

if(answer){

answer.style.display="block";

}

}

});

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
                PART 1.5 START
        FLOATING SHARE BAR JS
========================================================== */

/* =========================================
        SHARE ELEMENTS
========================================= */

const shareToggle=document.querySelector(".share-toggle");

const shareIcons=document.querySelector(".share-icons");

const stickyShareBtn=document.querySelector(".sticky-share-btn");

/* =========================================
        INITIAL STATE
========================================= */

if(shareIcons){

shareIcons.style.display="none";

}

/* =========================================
        SHARE TOGGLE
========================================= */

function toggleShareBar(){

if(!shareIcons) return;

if(shareIcons.style.display==="flex"){

shareIcons.style.display="none";

}else{

shareIcons.style.display="flex";

}

}

/* =========================================
        FLOATING SHARE BUTTON
========================================= */

if(shareToggle){

shareToggle.addEventListener("click",()=>{

toggleShareBar();

});

}

/* =========================================
        STICKY SHARE BUTTON
========================================= */

if(stickyShareBtn){

stickyShareBtn.addEventListener("click",()=>{

toggleShareBar();

});

}

/* =========================================
        CLOSE ON OUTSIDE CLICK
========================================= */

document.addEventListener("click",(event)=>{

if(!shareIcons || !shareToggle) return;

const clickedInside=

shareIcons.contains(event.target) ||

shareToggle.contains(event.target) ||

(stickyShareBtn && stickyShareBtn.contains(event.target));

if(!clickedInside){

shareIcons.style.display="none";

}

});

/* =========================================
        ESC KEY CLOSE
========================================= */

document.addEventListener("keydown",(event)=>{

if(event.key==="Escape"){

if(shareIcons){

shareIcons.style.display="none";

}

}

});

/* ==========================================================
                PART 1.5 END
========================================================== */\/* ==========================================================
                PART 1.6 START
        SHARE BUTTON FUNCTIONALITY
========================================================== */

/* =========================================
        SHARE BUTTONS
========================================= */

const whatsappBtn=document.querySelector(".popup-whatsapp");

const facebookBtn=document.querySelector(".popup-facebook");

const copyBtn=document.querySelector(".popup-copy");

/* =========================================
        CURRENT PAGE
========================================= */

const currentUrl=window.location.href;

const bookTitle="खरीफ फसल मास्टर गाइड 2026";

const shareText=

`📘 ${bookTitle}

🌾 खरीफ खेती की सम्पूर्ण Practical Guide

👉 ${currentUrl}`;

/* =========================================
        WHATSAPP SHARE
========================================= */

if(whatsappBtn){

whatsappBtn.addEventListener("click",()=>{

window.open(

"https://wa.me/?text="+

encodeURIComponent(shareText),

"_blank"

);

});

}

/* =========================================
        FACEBOOK SHARE
========================================= */

if(facebookBtn){

facebookBtn.addEventListener("click",()=>{

window.open(

"https://www.facebook.com/sharer/sharer.php?u="+

encodeURIComponent(currentUrl),

"_blank"

);

});

}

/* =========================================
        COPY LINK
========================================= */

if(copyBtn){

copyBtn.addEventListener("click",()=>{

navigator.clipboard.writeText(currentUrl)

.then(()=>{

copyBtn.innerHTML=

'<i class="fa-solid fa-circle-check"></i> Link Copied';

setTimeout(()=>{

copyBtn.innerHTML=

'<i class="fa-solid fa-link"></i> Copy Link';

},2000);

})

.catch(()=>{

alert("Link Copy Failed");

});

});

}

/* ==========================================================
                PART 1.6 END
========================================================== */
/* ==========================================================
                PART 1.7 START
        SHARE POPUP + OVERLAY SYSTEM
========================================================== */

/* =========================================
        POPUP ELEMENTS
========================================= */

const popupOverlay=document.querySelector(".popup-overlay");

const sharePopup=document.querySelector(".share-popup");

const popupCloseButtons=document.querySelectorAll(".popup-close");

const floatingShareButton=document.querySelector(".share-toggle");

const stickyShareButton=document.querySelector(".sticky-share-btn");

/* =========================================
        OPEN SHARE POPUP
========================================= */

function openSharePopup(){

if(!popupOverlay || !sharePopup) return;

popupOverlay.style.display="block";

sharePopup.style.display="block";

document.body.style.overflow="hidden";

}

/* =========================================
        CLOSE SHARE POPUP
========================================= */

function closeSharePopup(){

if(!popupOverlay || !sharePopup) return;

popupOverlay.style.display="none";

sharePopup.style.display="none";

document.body.style.overflow="";

}

/* =========================================
        FLOATING SHARE
========================================= */

if(floatingShareButton){

floatingShareButton.addEventListener(

"click",

openSharePopup

);

}

/* =========================================
        STICKY SHARE
========================================= */

if(stickyShareButton){

stickyShareButton.addEventListener(

"click",

openSharePopup

);

}

/* =========================================
        CLOSE BUTTON
========================================= */

popupCloseButtons.forEach((button)=>{

button.addEventListener(

"click",

closeSharePopup

);

});

/* =========================================
        CLICK OVERLAY
========================================= */

if(popupOverlay){

popupOverlay.addEventListener(

"click",

closeSharePopup

);

}

/* =========================================
        ESC CLOSE
========================================= */

document.addEventListener(

"keydown",

(event)=>{

if(event.key==="Escape"){

closeSharePopup();

}

}

);

/* ==========================================================
                PART 1.7 END
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
