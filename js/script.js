/* ==========================================================
   AAROGYAM INDIA
   SCRIPT.JS
   VERSION : 2.0
   PART : 1 / 6
========================================================== */

"use strict";

/* ==========================================================
   DOM ELEMENTS
========================================================== */

const slides = document.querySelectorAll(".slide");

const dots = document.querySelectorAll(".dot");

const prevBtn = document.getElementById("sliderPrev");

const nextBtn = document.getElementById("sliderNext");

const menuBtn = document.getElementById("menuBtn");

const closeMenu = document.getElementById("closeMenu");

const mobileMenu = document.getElementById("mobileMenu");

/* ==========================================================
   HERO SLIDER
========================================================== */

let currentSlide = 0;

const totalSlides = slides.length;

/* ==========================================================
   SHOW SLIDE
========================================================== */

function showSlide(index){

    if(index >= totalSlides){

        currentSlide = 0;

    }

    else if(index < 0){

        currentSlide = totalSlides - 1;

    }

    else{

        currentSlide = index;

    }

    slides.forEach((slide)=>{

        slide.classList.remove("active");

    });

    dots.forEach((dot)=>{

        dot.classList.remove("active");

    });

    slides[currentSlide].classList.add("active");

    dots[currentSlide].classList.add("active");

}

/* ==========================================================
   NEXT
========================================================== */

function nextSlide(){

    showSlide(currentSlide + 1);

}

/* ==========================================================
   PREVIOUS
========================================================== */

function previousSlide(){

    showSlide(currentSlide - 1);

}

/* ==========================================================
   BUTTON EVENTS
========================================================== */

if(nextBtn){

    nextBtn.addEventListener("click",nextSlide);

}

if(prevBtn){

    prevBtn.addEventListener("click",previousSlide);

}

/* ==========================================================
   DOT EVENTS
========================================================== */

dots.forEach((dot,index)=>{

    dot.addEventListener("click",()=>{

        showSlide(index);

    });

});

/* ==========================================================
   AUTO SLIDER
========================================================== */

let sliderInterval = setInterval(()=>{

    nextSlide();

},5000);
/* ==========================================================
   SCRIPT.JS
   VERSION : 2.0
   PART : 2 / 6
========================================================== */

/* ==========================================================
   PAUSE SLIDER ON HOVER
========================================================== */

const heroSlider = document.getElementById("heroSlider");

function startSlider(){

    sliderInterval = setInterval(()=>{

        nextSlide();

    },5000);

}

function stopSlider(){

    clearInterval(sliderInterval);

}

if(heroSlider){

    heroSlider.addEventListener("mouseenter",stopSlider);

    heroSlider.addEventListener("mouseleave",startSlider);

}

/* ==========================================================
   MOBILE MENU
========================================================== */

if(menuBtn){

    menuBtn.addEventListener("click",()=>{

        mobileMenu.classList.add("active");

        document.body.style.overflow="hidden";

    });

}

if(closeMenu){

    closeMenu.addEventListener("click",()=>{

        mobileMenu.classList.remove("active");

        document.body.style.overflow="auto";

    });

}

/* ==========================================================
   CLOSE MENU WHEN LINK CLICKED
========================================================== */

const mobileLinks=document.querySelectorAll(".mobile-nav a");

mobileLinks.forEach(link=>{

    link.addEventListener("click",()=>{

        mobileMenu.classList.remove("active");

        document.body.style.overflow="auto";

    });

});

/* ==========================================================
   TOUCH SWIPE
========================================================== */

let touchStartX=0;

let touchEndX=0;

if(heroSlider){

heroSlider.addEventListener("touchstart",(e)=>{

touchStartX=e.changedTouches[0].screenX;

});

heroSlider.addEventListener("touchend",(e)=>{

touchEndX=e.changedTouches[0].screenX;

handleSwipe();

});

}

function handleSwipe(){

if(touchEndX<touchStartX-50){

nextSlide();

}

if(touchEndX>touchStartX+50){

previousSlide();

}

}

/* ==========================================================
   ESC KEY CLOSE MENU
========================================================== */

document.addEventListener("keydown",(e)=>{

if(e.key==="Escape"){

mobileMenu.classList.remove("active");

document.body.style.overflow="auto";

}

});

/* ==========================================================
   HEADER SHADOW ON SCROLL
========================================================== */

const header=document.querySelector(".header");

window.addEventListener("scroll",()=>{

if(window.scrollY>60){

header.classList.add("sticky");

}

else{

header.classList.remove("sticky");

}

});
/* ==========================================================
   SCRIPT.JS
   VERSION : 2.0
   PART : 3 / 6
========================================================== */

/* ==========================================================
   SEARCH BUTTON
========================================================== */

const searchBtn = document.getElementById("searchBtn");

const searchPopup = document.getElementById("searchPopup");

const searchClose = document.getElementById("searchClose");

const searchInput = document.getElementById("searchInput");

if(searchBtn && searchPopup){

    searchBtn.addEventListener("click",()=>{

        searchPopup.classList.add("active");

        document.body.style.overflow="hidden";

        if(searchInput){

            searchInput.focus();

        }

    });

}

if(searchClose){

    searchClose.addEventListener("click",()=>{

        searchPopup.classList.remove("active");

        document.body.style.overflow="auto";

    });

}

/* ==========================================================
   CLOSE SEARCH BY ESC
========================================================== */

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        if(searchPopup){

            searchPopup.classList.remove("active");

            document.body.style.overflow="auto";

        }

    }

});

/* ==========================================================
   BACK TO TOP
========================================================== */

const backTop=document.querySelector(".back-to-top");

window.addEventListener("scroll",()=>{

    if(window.scrollY>500){

        if(backTop){

            backTop.classList.add("active");

        }

    }

    else{

        if(backTop){

            backTop.classList.remove("active");

        }

    }

});

if(backTop){

    backTop.addEventListener("click",()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    });

}

/* ==========================================================
   SMOOTH SCROLL
========================================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

    anchor.addEventListener("click",function(e){

        const href = this.getAttribute("href");
        if(href && href.length > 1) {
            const target=document.querySelector(href);

            if(target){
                e.preventDefault();
                target.scrollIntoView({
                    behavior:"smooth",
                    block:"start"
                });
            }
        }

    });

});

/* ==========================================================
   ACTIVE NAVIGATION
========================================================== */

const sections=document.querySelectorAll("section");

const navLinks=document.querySelectorAll(".nav-menu a");

window.addEventListener("scroll",()=>{

    let current="";

    sections.forEach(section=>{

        const sectionTop=section.offsetTop-120;

        const sectionHeight=section.clientHeight;

        if(pageYOffset>=sectionTop){

            current=section.getAttribute("id");

        }

    });

    navLinks.forEach(link=>{

        link.classList.remove("active");

        const href=link.getAttribute("href");

        if(href==="#" + current){

            link.classList.add("active");

        }

    });

});

/* ==========================================================
   PRELOADER
========================================================== */

const preloader=document.querySelector(".preloader");

window.addEventListener("load",()=>{

    if(preloader){

        preloader.style.opacity="0";

        preloader.style.visibility="hidden";

        setTimeout(()=>{

            preloader.remove();

        },500);

    }

});

/* ==========================================================
   UNIVERSAL LOGIN MODAL
========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements for Universal Login
    const universalLoginModal = document.getElementById('universalLoginModal');
    const universalLoginBtn = document.getElementById('universalLoginBtn');
    const universalLoginCloseBtn = document.getElementById('universalLoginCloseBtn');
    const universalLoginForm = document.getElementById('universalLoginForm');
    const universalLoginMobile = document.getElementById('universalLoginMobile');
    const universalLoginSubmitBtn = document.getElementById('universalLoginSubmitBtn');
    const universalLoginMessage = document.getElementById('universalLoginMessage');
    const loginBtnText = document.getElementById('loginBtnText');
    const modalRegisterLink = document.getElementById('modalRegisterLink');

    // Function to open the modal
    function openLoginModal(e) {
        e.preventDefault();

        const mobileMenu = document.querySelector(".mobile-menu");
        const mobileOverlay = document.querySelector(".mobile-overlay");

        if(mobileMenu && mobileMenu.classList.contains("active")) {
            mobileMenu.classList.remove("active");
            if (mobileOverlay) {
                mobileOverlay.classList.remove("active");
            }
            document.body.style.overflow="";
        }

        if (universalLoginModal) {
            universalLoginModal.style.display = 'flex';
            universalLoginMessage.textContent = '';
            universalLoginSubmitBtn.disabled = false;
            universalLoginSubmitBtn.textContent = 'Login';
            if(universalLoginMobile) universalLoginMobile.focus();
        }
    }

    // Function to close the modal
    function closeLoginModal() {
        if (universalLoginModal) {
            universalLoginModal.style.display = 'none';
        }
    }

    // Main Logout Function
    function handleLogout(e) {
        e.preventDefault();
        if (typeof V1_SESSION !== 'undefined') {
            V1_SESSION.logout();
        }
        updateLoginUI();
    }

    // Function to update the login button UI based on session state
    function updateLoginUI() {
        const isLoggedIn = typeof V1_SESSION !== 'undefined' && V1_SESSION.isLoggedIn();
        const mobileLoginBtn = document.getElementById('mobileLoginBtn');
        const mobileLoginBtnText = document.getElementById('mobileLoginBtnText');

        if (isLoggedIn) {
            // Logged-in state
            if (loginBtnText) loginBtnText.textContent = 'Logout';
            if(universalLoginBtn) {
                universalLoginBtn.href = '#';
                universalLoginBtn.removeEventListener('click', openLoginModal);
                universalLoginBtn.addEventListener('click', handleLogout);
            }

            if(mobileLoginBtnText) mobileLoginBtnText.textContent = 'Logout';
            if(mobileLoginBtn) {
                mobileLoginBtn.removeEventListener('click', openLoginModal);
                mobileLoginBtn.addEventListener('click', handleLogout);
            }
        } else {
            // Logged-out state
            if (loginBtnText) loginBtnText.textContent = 'Login';
            if(universalLoginBtn) {
                universalLoginBtn.href = '#';
                universalLoginBtn.removeEventListener('click', handleLogout);
                universalLoginBtn.addEventListener('click', openLoginModal);
            }

            if(mobileLoginBtnText) mobileLoginBtnText.textContent = 'Login';
            if(mobileLoginBtn) {
                mobileLoginBtn.removeEventListener('click', handleLogout);
                mobileLoginBtn.addEventListener('click', openLoginModal);
            }
        }
    }

    // Event listener for the close button
    if (universalLoginCloseBtn) {
        universalLoginCloseBtn.addEventListener('click', closeLoginModal);
    }

    // Event listener to close the modal when clicking on the overlay
    if (universalLoginModal) {
        universalLoginModal.addEventListener('click', (e) => {
            if (e.target === universalLoginModal) {
                closeLoginModal();
            }
        });
    }
    
    // Event listener for the form submission
    if (universalLoginForm) {
        universalLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const mobile = universalLoginMobile.value.trim();

            if (!/^[6-9]\d{9}$/.test(mobile)) {
                universalLoginMessage.textContent = 'Please enter a valid 10-digit mobile number.';
                return;
            }

            universalLoginSubmitBtn.disabled = true;
            universalLoginSubmitBtn.textContent = 'Checking...';
            universalLoginMessage.textContent = '';

            try {
                const userExists = await isMobileRegistered(mobile);

                if (userExists) {
                    // User exists, create session and log them in
                    createLoginSession(userExists);
                    universalLoginMessage.textContent = 'Login successful!';
                    setTimeout(() => {
                        closeLoginModal();
                        updateLoginUI(); // Refresh the UI
                    }, 500);
                } else {
                    // User does not exist, show message and update register link
                    universalLoginMessage.textContent = 'This mobile number is not registered.';
                    universalLoginSubmitBtn.disabled = false;
                    universalLoginSubmitBtn.textContent = 'Login'; // Revert button text
                    
                    const returnUrl = window.location.pathname;
                    modalRegisterLink.href = `/registration.html?mobile=${mobile}&source=homepage-modal&return=${encodeURIComponent(returnUrl)}`;
                }
            } catch (error) {
                console.error('Login Error:', error);
                universalLoginMessage.textContent = 'An error occurred. Please try again.';
                universalLoginSubmitBtn.disabled = false;
                universalLoginSubmitBtn.textContent = 'Login';
            }
        });
    }

    // Initial check of login status on page load
    updateLoginUI();
});

