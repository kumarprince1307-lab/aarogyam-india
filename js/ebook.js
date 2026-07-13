/*=========================================================
                EBOOK.JS
                  PART A
        CORE + HEADER + MOBILE MENU
=========================================================*/

'use strict';

/*=========================================================
        DOM READY
=========================================================*/

document.addEventListener('DOMContentLoaded', () => {

    initStickyHeader();

    initBackToTop();

    initSmoothScroll();

    initSearchPlaceholder();

});

/*=========================================================
        STICKY HEADER
=========================================================*/

function initStickyHeader(){

    const header=document.querySelector('.ebook-header');

    if(!header) return;

    window.addEventListener('scroll',()=>{

        if(window.scrollY>80){

            header.classList.add('sticky');

        }else{

            header.classList.remove('sticky');

        }

    });

}

/*=========================================================
        MOBILE MENU
=========================================================*/

function openMobileMenu(){

    document.body.classList.add('menu-open');

}

function closeMobileMenu(){

    document.body.classList.remove('menu-open');

}

document.addEventListener('click',(e)=>{

    if(e.target.matches('.menu-btn')){

        openMobileMenu();

    }

    if(e.target.matches('.menu-close')){

        closeMobileMenu();

    }

});

/*=========================================================
        SEARCH
=========================================================*/

function initSearchPlaceholder(){

    const search=document.querySelector('.search-box input');

    if(!search) return;

    search.addEventListener('focus',()=>{

        search.placeholder='Search eBooks...';

    });

    search.addEventListener('blur',()=>{

        search.placeholder='Search';

    });

}

/*=========================================================
        BACK TO TOP
=========================================================*/

function initBackToTop(){

    const btn=document.querySelector('.back-top');

    if(!btn) return;

    window.addEventListener('scroll',()=>{

        if(window.scrollY>400){

            btn.classList.add('show');

        }else{

            btn.classList.remove('show');

        }

    });

    btn.addEventListener('click',()=>{

        window.scrollTo({

            top:0,

            behavior:'smooth'

        });

    });

}

/*=========================================================
        SMOOTH SCROLL
=========================================================*/

function initSmoothScroll(){

    document.querySelectorAll('a[href^="#"]').forEach(link=>{

        link.addEventListener('click',(e)=>{

            const id=link.getAttribute('href');

            if(id==='#') return;

            const target=document.querySelector(id);

            if(!target) return;

            e.preventDefault();

            target.scrollIntoView({

                behavior:'smooth'

            });

        });

    });

}

/*=========================================================
                END OF PART A
=========================================================*/
/*=========================================================
                EBOOK.JS
                  PART B
     CATEGORY + FILTER + BOOK ACTIONS
=========================================================*/

/*=========================================================
        CATEGORY MENU
=========================================================*/

function initCategoryMenu(){

    const categoryBtn=document.querySelector('.mega-menu');

    if(!categoryBtn) return;

    categoryBtn.addEventListener('mouseenter',()=>{

        categoryBtn.classList.add('active');

    });

    categoryBtn.addEventListener('mouseleave',()=>{

        categoryBtn.classList.remove('active');

    });

}

initCategoryMenu();

/*=========================================================
        FILTER BUTTONS
=========================================================*/

function initFilterBar(){

    const buttons=document.querySelectorAll('.filter-bar button');

    if(!buttons.length) return;

    buttons.forEach(btn=>{

        btn.addEventListener('click',()=>{

            buttons.forEach(item=>{

                item.classList.remove('active');

            });

            btn.classList.add('active');

        });

    });

}

initFilterBar();

/*=========================================================
        BOOK CARD HOVER
=========================================================*/

function initBookCards(){

    const cards=document.querySelectorAll('.book-card');

    if(!cards.length) return;

    cards.forEach(card=>{

        card.addEventListener('mouseenter',()=>{

            card.classList.add('hover');

        });

        card.addEventListener('mouseleave',()=>{

            card.classList.remove('hover');

        });

    });

}

initBookCards();

/*=========================================================
        FEATURED BOOK
=========================================================*/

function initFeaturedBook(){

    const book=document.querySelector('.featured-book-card');

    if(!book) return;

    book.addEventListener('mouseenter',()=>{

        book.classList.add('active');

    });

    book.addEventListener('mouseleave',()=>{

        book.classList.remove('active');

    });

}

initFeaturedBook();

/*=========================================================
        OFFER BANNER
=========================================================*/

function initOfferBanner(){

    const banner=document.querySelector('.offer-banner');

    if(!banner) return;

    banner.addEventListener('click',()=>{

        window.location.href='agriculture.html';

    });

}

initOfferBanner();

/*=========================================================
        BUY BUTTONS
=========================================================*/

function initBuyButtons(){

    const buttons=document.querySelectorAll('.buy-btn');

    if(!buttons.length) return;

    buttons.forEach(btn=>{

        btn.addEventListener('click',()=>{

            window.location.href='agriculture.html';

        });

    });

}

initBuyButtons();

/*=========================================================
        VIEW DETAILS
=========================================================*/

function initDetailsButtons(){

    const buttons=document.querySelectorAll('.view-book-btn');

    if(!buttons.length) return;

    buttons.forEach(btn=>{

        btn.addEventListener('click',()=>{

            window.location.href='agriculture.html';

        });

    });

}

initDetailsButtons();

/*=========================================================
                END OF PART B
=========================================================*/
/*=========================================================
                EBOOK.JS
                  PART C
    FLOATING BUTTONS + NEWSLETTER + ANIMATIONS
=========================================================*/

/*=========================================================
        STICKY BUY BUTTON
=========================================================*/

function initStickyBuy(){

    const sticky=document.querySelector('.sticky-buy');

    if(!sticky) return;

    window.addEventListener('scroll',()=>{

        if(window.scrollY>300){

            sticky.classList.add('show');

        }else{

            sticky.classList.remove('show');

        }

    });

}

initStickyBuy();

/*=========================================================
        WHATSAPP BUTTON
=========================================================*/

function initWhatsappButton(){

    const whatsapp=document.querySelector('.whatsapp-float');

    if(!whatsapp) return;

    whatsapp.addEventListener('mouseenter',()=>{

        whatsapp.classList.add('pulse');

    });

    whatsapp.addEventListener('mouseleave',()=>{

        whatsapp.classList.remove('pulse');

    });

}

initWhatsappButton();

/*=========================================================
        NEWSLETTER BANNER
=========================================================*/

function initNewsletter(){

    const banner=document.querySelector('.newsletter-banner');

    if(!banner) return;

    banner.addEventListener('click',()=>{

        console.log('Newsletter Banner Clicked');

    });

}

initNewsletter();

/*=========================================================
        FOOTER LINKS
=========================================================*/

function initFooter(){

    const links=document.querySelectorAll('.footer-column a');

    if(!links.length) return;

    links.forEach(link=>{

        link.addEventListener('mouseenter',()=>{

            link.classList.add('active');

        });

        link.addEventListener('mouseleave',()=>{

            link.classList.remove('active');

        });

    });

}

initFooter();

/*=========================================================
        FADE IN ON SCROLL
=========================================================*/

function initReveal(){

    const elements=document.querySelectorAll(

        '.book-card,.feature-box,.category-grid a,.featured-book-card'

    );

    if(!elements.length) return;

    const observer=new IntersectionObserver(entries=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                entry.target.classList.add('show');

            }

        });

    },{

        threshold:.15

    });

    elements.forEach(el=>observer.observe(el));

}

initReveal();

/*=========================================================
        COMMON UTILITIES
=========================================================*/

function scrollTopPage(){

    window.scrollTo({

        top:0,

        behavior:'smooth'

    });

}

function pageReload(){

    location.reload();

}

/*=========================================================
                END OF PART C
=========================================================*/
/*=========================================================
                EBOOK.JS
                  PART D
        FINAL UTILITIES + PERFORMANCE
=========================================================*/

/*=========================================================
        IMAGE LAZY LOADING
=========================================================*/

function initLazyImages(){

    const images=document.querySelectorAll('img');

    if(!images.length) return;

    const observer=new IntersectionObserver(entries=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                const img=entry.target;

                const src=img.dataset.src;

                if(src){

                    img.src=src;

                }

                observer.unobserve(img);

            }

        });

    });

    images.forEach(img=>observer.observe(img));

}

initLazyImages();

/*=========================================================
        BUTTON RIPPLE EFFECT
=========================================================*/

function initRipple(){

    const buttons=document.querySelectorAll('button,.buy-btn,.demo-btn');

    buttons.forEach(button=>{

        button.addEventListener('click',()=>{

            button.classList.add('clicked');

            setTimeout(()=>{

                button.classList.remove('clicked');

            },250);

        });

    });

}

initRipple();

/*=========================================================
        WINDOW RESIZE
=========================================================*/

function initResize(){

    window.addEventListener('resize',()=>{

        console.log(

            'Screen :',

            window.innerWidth,

            'x',

            window.innerHeight

        );

    });

}

initResize();

/*=========================================================
        FUTURE HOOKS
=========================================================*/

function initFutureModules(){

    console.log('Future Modules Ready');

    /*
        Wishlist

        Cart

        Login

        Razorpay

        Coupons

        Reviews

        Search API

        Admin Panel

        Dashboard

        Notifications
    */

}

initFutureModules();

/*=========================================================
        GLOBAL ERROR SAFE
=========================================================*/

window.addEventListener('error',(e)=>{

    console.error(

        'JS Error :',

        e.message

    );

});

/*=========================================================
        PAGE LOADED
=========================================================*/

window.addEventListener('load',()=>{

    document.body.classList.add('page-loaded');

});

/*=========================================================
        VERSION
=========================================================*/

const APP_VERSION='1.0.0';

console.log(

    'Aarogyam India eBook',

    APP_VERSION

);

/*=========================================================
            END OF EBOOK.JS
=========================================================*/
/*=========================================================
            PART E
    STICKY BUY + BACK TO TOP
=========================================================*/

const stickyBuy = document.querySelector(".sticky-buy");
const backTop = document.querySelector(".back-top");

window.addEventListener("scroll", () => {

    if (window.scrollY > 300) {

        if (stickyBuy) {

            stickyBuy.classList.add("show");

        }

        if (backTop) {

            backTop.style.display = "flex";

        }

    } else {

        if (stickyBuy) {

            stickyBuy.classList.remove("show");

        }

        if (backTop) {

            backTop.style.display = "none";

        }

    }

});

if (backTop) {

    backTop.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

/*=========================================================
                MOBILE MENU
=========================================================*/

const menuBtn = document.querySelector(".menu-button");

const mobileMenu = document.querySelector(".mobile-menu");

const menuClose = document.querySelector(".menu-close");

const mobileOverlay = document.querySelector(".mobile-overlay");

if(menuBtn && mobileMenu){

    menuBtn.addEventListener("click",()=>{

        mobileMenu.classList.add("active");

        mobileOverlay.classList.add("active");

        document.body.style.overflow="hidden";

    });

}

if(menuClose){

    menuClose.addEventListener("click",()=>{

        mobileMenu.classList.remove("active");

        mobileOverlay.classList.remove("active");

        document.body.style.overflow="";

    });

}

if(mobileOverlay){

    mobileOverlay.addEventListener("click",()=>{

        mobileMenu.classList.remove("active");

        mobileOverlay.classList.remove("active");

        document.body.style.overflow="";

    });

}

/*=========================================================
            END MOBILE MENU
=========================================================*/
