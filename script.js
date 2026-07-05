/* =====================================
   Aarogyam India Version 2.0
===================================== */

/* Banner Slider */

const images = [
"images/banners/banner1.jpeg",
"images/banners/banner2.jpeg",
"images/banners/banner3.jpeg"
];

let current = 0;

const slider = document.getElementById("slider");
const dots = document.querySelectorAll(".dot");

function showSlide(index){

current=index;

if(slider){

slider.style.opacity="0";

setTimeout(()=>{

slider.src=images[current];

slider.style.opacity="1";

},300);

}

if(dots.length){

dots.forEach(dot=>dot.classList.remove("active"));

dots[current].classList.add("active");

}

}

if(dots.length){

dots.forEach((dot,i)=>{

dot.addEventListener("click",()=>{

showSlide(i);

});

});

}

setInterval(()=>{

current++;

if(current>=images.length){

current=0;

}

showSlide(current);

},5000);


/* Mobile Menu */

const menuBtn=document.getElementById("menuBtn");

const menu=document.getElementById("menu");

if(menuBtn){

menuBtn.addEventListener("click",()=>{

menu.classList.toggle("active");

});

}


/* Smooth Scroll */

document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

anchor.addEventListener("click",function(e){

e.preventDefault();

const target=document.querySelector(this.getAttribute("href"));

if(target){

target.scrollIntoView({

behavior:"smooth"

});

}

});

});


/* Future Popup Support */

function openPopup(){

const popup=document.querySelector(".popup");

if(popup){

popup.classList.add("show");

}

}

function closePopup(){

const popup=document.querySelector(".popup");

if(popup){

popup.classList.remove("show");

}

}


/* Scroll Animation */

const cards=document.querySelectorAll(".card,.category-card");

window.addEventListener("scroll",()=>{

cards.forEach(card=>{

const top=card.getBoundingClientRect().top;

if(top<window.innerHeight-100){

card.style.opacity="1";

card.style.transform="translateY(0)";

}

});

});


/* Initial Animation */

cards.forEach(card=>{

card.style.opacity="0";

card.style.transform="translateY(40px)";

card.style.transition=".6s";

});


console.log("Aarogyam India Version 2.0 Loaded");
