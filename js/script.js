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

        const target=document.querySelector(this.getAttribute("href"));

        if(target){

            e.preventDefault();

            target.scrollIntoView({

                behavior:"smooth",

                block:"start"

            });

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
