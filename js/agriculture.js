/* ==========================================================
                HERO BANNER START
                HERO SLIDER JS
========================================================== */

const heroSlides = document.querySelectorAll(".hero-slide");
const heroDots = document.querySelectorAll(".hero-dot");
const heroPrev = document.querySelector(".hero-prev");
const heroNext = document.querySelector(".hero-next");

let currentSlide = 0;
let heroInterval;

/* ===============================
        Show Slide
================================ */

function showSlide(index){

    heroSlides.forEach((slide)=>{
        slide.classList.remove("active");
    });

    heroDots.forEach((dot)=>{
        dot.classList.remove("active");
    });

    heroSlides[index].classList.add("active");
    heroDots[index].classList.add("active");

    currentSlide = index;

}

/* ===============================
        Next Slide
================================ */

function nextSlide(){

    currentSlide++;

    if(currentSlide >= heroSlides.length){

        currentSlide = 0;

    }

    showSlide(currentSlide);

}

/* ===============================
        Previous Slide
================================ */

function prevSlide(){

    currentSlide--;

    if(currentSlide < 0){

        currentSlide = heroSlides.length-1;

    }

    showSlide(currentSlide);

}

/* ===============================
        Auto Slide
================================ */

function startSlider(){

    heroInterval = setInterval(nextSlide,5000);

}

/* ===============================
        Stop Slider
================================ */

function stopSlider(){

    clearInterval(heroInterval);

}

/* ===============================
        Buttons
================================ */

if(heroNext){

    heroNext.addEventListener("click",()=>{

        stopSlider();
        nextSlide();
        startSlider();

    });

}

if(heroPrev){

    heroPrev.addEventListener("click",()=>{

        stopSlider();
        prevSlide();
        startSlider();

    });

}

/* ===============================
        Dot Click
================================ */

heroDots.forEach((dot,index)=>{

    dot.addEventListener("click",()=>{

        stopSlider();

        showSlide(index);

        startSlider();

    });

});

/* ===============================
               HERO BANNER end
                 : HERO SLIDER JS
========================================================== */
/* ==========================================================
                START
            AVAILABLE EBOOKS JS
========================================================== */

const bookCards = document.querySelectorAll(".book-card");

/* ===============================
        Scroll Animation
================================ */

const bookObserver = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show-book");

        }

    });

}, {

    threshold: 0.15

});

/* Observe Cards */

bookCards.forEach((card) => {

    card.classList.add("book-hidden");

    bookObserver.observe(card);

});

/* ==========================================================
               e book available END
========================================================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('PWA Service Worker Active'))
      .catch(err => console.log('PWA Error:', err));
  });
}