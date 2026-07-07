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
/*=========================================
AAROGYAM INDIA
EBOOK SCRIPT
PART-1
=========================================*/

//=============================
// SEARCH BOOK
//=============================

const searchInput = document.getElementById("bookSearch");

if(searchInput){

searchInput.addEventListener("keyup",function(){

let value=this.value.toLowerCase();

let books=document.querySelectorAll(".ebook-card");

books.forEach(function(book){

let text=book.innerText.toLowerCase();

if(text.indexOf(value)>-1){

book.style.display="block";

}else{

book.style.display="none";

}

});

});

}

//=============================
// SHARE WHATSAPP
//=============================

document.querySelectorAll(".share-whatsapp").forEach(function(btn){

btn.onclick=function(e){

e.preventDefault();

let url=window.location.href;

window.open(

"https://wa.me/?text="+

encodeURIComponent(url),

"_blank"

);

};

});

//=============================
// SHARE FACEBOOK
//=============================

document.querySelectorAll(".share-facebook").forEach(function(btn){

btn.onclick=function(e){

e.preventDefault();

window.open(

"https://www.facebook.com/sharer/sharer.php?u="+

encodeURIComponent(window.location.href),

"_blank"

);

};

});

//=============================
// COPY LINK
//=============================

document.querySelectorAll(".copy-link").forEach(function(btn){

btn.onclick=function(e){

e.preventDefault();

navigator.clipboard.writeText(window.location.href);

alert("Link Copied");

};

});
/*=========================================
AAROGYAM INDIA
SCRIPT PART-2
=========================================*/


//=============================
// BUY NOW
//=============================

document.querySelectorAll(".buy-now").forEach(function(btn){

btn.addEventListener("click",function(){

alert("Payment System Coming Soon");

});

});


//=============================
// ADD TO CART
//=============================

document.querySelectorAll(".add-cart").forEach(function(btn){

btn.addEventListener("click",function(){

alert("Book Added To Cart");

});

});


//=============================
// WISHLIST
//=============================

document.querySelectorAll(".wishlist").forEach(function(btn){

btn.addEventListener("click",function(){

btn.classList.toggle("active");

});

});


//=============================
// SMOOTH SCROLL
//=============================

document.querySelectorAll('a[href^="#"]').forEach(function(anchor){

anchor.addEventListener("click",function(e){

e.preventDefault();

document.querySelector(this.getAttribute("href")).scrollIntoView({

behavior:"smooth"

});

});

});


//=============================
// BACK TO TOP
//=============================

const topBtn=document.getElementById("topBtn");

window.onscroll=function(){

if(topBtn){

if(document.documentElement.scrollTop>300){

topBtn.style.display="block";

}else{

topBtn.style.display="none";

}

}

};

if(topBtn){

topBtn.onclick=function(){

window.scrollTo({

top:0,

behavior:"smooth"

});

};

}


//=============================
// FADE ANIMATION
//=============================

const cards=document.querySelectorAll(".ebook-card");

const observer=new IntersectionObserver(function(entries){

entries.forEach(function(entry){

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

});

cards.forEach(function(card){

observer.observe(card);

});


//=============================
// CATEGORY ACTIVE
//=============================

const categoryMenu = document.querySelectorAll(".ebook-category-menu a");

categoryMenu.forEach(function(link){

    link.onclick = function(){

        categoryMenu.forEach(function(item){
            item.classList.remove("active");
        });

        this.classList.add("active");

    };

});
//=============================
// LOADING COMPLETE
//=============================

window.addEventListener("load",function(){

console.log("Aarogyam India eBook Store Loaded");

});
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

if (menuBtn && menu) {
    menuBtn.onclick = function () {
        menu.classList.toggle("active");
    };
}
