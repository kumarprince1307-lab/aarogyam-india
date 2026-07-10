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
