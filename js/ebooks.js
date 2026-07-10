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
