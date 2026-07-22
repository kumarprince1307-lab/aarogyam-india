/*==================================================
AAROGYAM INDIA
COMMON DEMO BOOK JS
PART - 1
==================================================*/

"use strict";

/*==================================================
DOM ELEMENTS
==================================================*/

const demoForm = document.getElementById("demoForm");
const demoSection = document.getElementById("demoPreview");

const loader = document.getElementById("loader");
const toast = document.getElementById("toast");

/*==================================================
LOADER
==================================================*/

function showLoader(){

    if(loader){

        loader.style.display="flex";

    }

}

function hideLoader(){

    if(loader){

        loader.style.display="none";

    }

}

/*==================================================
TOAST
==================================================*/

function showToast(message){

    if(!toast){

        alert(message);

        return;

    }

    toast.innerHTML=message;

    toast.style.display="block";

    setTimeout(()=>{

        toast.style.display="none";

    },2500);

}

/*==================================================
MOBILE VALIDATION
==================================================*/

function validMobile(number){

    return /^[6-9]\d{9}$/.test(number);

}

/*==================================================
SUPABASE PLACE HOLDER

Future

await supabase
.from("demo_users")
.insert([userData]);

==================================================*/

async function saveUser(userData){

    console.log(

        "Future Supabase",

        userData

    );

    return true;

}

/*==================================================
FORM SUBMIT
==================================================*/

if(demoForm){

demoForm.addEventListener(

"submit",

async function(e){

e.preventDefault();

const name=document
.getElementById("name")
.value.trim();

const mobile=document
.getElementById("mobile")
.value.trim();

const email=document
.getElementById("email")
.value.trim();

const state=document
.getElementById("state")
.value.trim();

const district=document
.getElementById("district")
.value.trim();

/*=========================
VALIDATION
=========================*/

if(name.length<3){

showToast(

"कृपया पूरा नाम दर्ज करें"

);

return;

}

if(!validMobile(mobile)){

showToast(

"सही मोबाइल नंबर दर्ज करें"

);

return;

}

/*=========================
USER DATA
=========================*/

const userData={

name,

mobile,

email,

state,

district,

date:new Date()

.toISOString()

};

/*=========================
SAVE
=========================*/

showLoader();

await saveUser(userData);

/*=========================
LOCAL BACKUP
=========================*/

localStorage.setItem(

"demoUser",

JSON.stringify(userData)

);

/*=========================
SUCCESS
=========================*/

hideLoader();

demoForm.style.display="none";

if(demoSection){

demoSection.classList.add(

"active"

);

demoSection.scrollIntoView({

behavior:"smooth"

});

}

showToast(

"Demo Unlock Successfully"

);

});

}

/*==================================================
AUTO RESTORE

Future

Supabase Session

==================================================*/

window.addEventListener(

"load",

()=>{

hideLoader();

});

/*==================================================
PART 1 END

NEXT

Slider

Previous

Next

Swipe

Image Viewer

==================================================*/
/*==================================================
IMAGE SLIDER
==================================================*/

const images=document.querySelectorAll(".preview-image");

const prevBtn=document.querySelector(".prev-btn");

const nextBtn=document.querySelector(".next-btn");

const viewer=document.getElementById("imageViewer");

const viewerImage=document.getElementById("viewerImage");

const closeViewer=document.querySelector(".close-viewer");

const viewerPrev=document.querySelector(".viewer-prev");

const viewerNext=document.querySelector(".viewer-next");

let currentImage=0;

/*==================================================
SHOW IMAGE
==================================================*/

function showImage(index){

if(images.length===0){

return;

}

if(index<0){

index=images.length-1;

}

if(index>=images.length){

index=0;

}

images.forEach((img)=>{

img.classList.remove("active");

});

images[index].classList.add("active");

currentImage=index;

}

/*==================================================
PREVIOUS
==================================================*/

if(prevBtn){

prevBtn.addEventListener("click",()=>{

showImage(currentImage-1);

});

}

/*==================================================
NEXT
==================================================*/

if(nextBtn){

nextBtn.addEventListener("click",()=>{

showImage(currentImage+1);

});

}

/*==================================================
OPEN VIEWER
==================================================*/

images.forEach((img,index)=>{

img.addEventListener("click",()=>{

currentImage=index;

viewerImage.src=images[currentImage].src;

viewer.classList.add("active");

});

});

/*==================================================
VIEWER IMAGE
==================================================*/

function updateViewer(){

viewerImage.src=images[currentImage].src;

}

/*==================================================
VIEWER PREVIOUS
==================================================*/

if(viewerPrev){

viewerPrev.addEventListener("click",()=>{

showImage(currentImage-1);

updateViewer();

});

}

/*==================================================
VIEWER NEXT
==================================================*/

if(viewerNext){

viewerNext.addEventListener("click",()=>{

showImage(currentImage+1);

updateViewer();

});

}

/*==================================================
CLOSE
==================================================*/

if(closeViewer){

closeViewer.addEventListener("click",()=>{

viewer.classList.remove("active");

});

}

if(viewer){

viewer.addEventListener("click",(e)=>{

if(e.target===viewer){

viewer.classList.remove("active");

}

});

}

/*==================================================
MOBILE SWIPE
==================================================*/

const slider=document.querySelector(".slider-container");

let touchStart=0;

let touchEnd=0;

if(slider){

slider.addEventListener("touchstart",(e)=>{

touchStart=e.changedTouches[0].screenX;

});

slider.addEventListener("touchend",(e)=>{

touchEnd=e.changedTouches[0].screenX;

if(touchStart-touchEnd>50){

showImage(currentImage+1);

}

if(touchEnd-touchStart>50){

showImage(currentImage-1);

}

});

}

/*==================================================
INITIAL IMAGE
==================================================*/

if(images.length){

showImage(0);

}

/*==================================================
PART-2 END

NEXT

✓ Zoom

✓ Keyboard Support

✓ Initialization

==================================================*/
/*==================================================
IMAGE ZOOM
==================================================*/

let zoomLevel = 1;

if(viewerImage){

viewerImage.addEventListener("dblclick",()=>{

if(zoomLevel===1){

zoomLevel=2;

}else{

zoomLevel=1;

}

viewerImage.style.transform=`scale(${zoomLevel})`;

viewerImage.style.transition="0.3s";

});

}

/*==================================================
RESET ZOOM
==================================================*/

function resetZoom(){

zoomLevel=1;

viewerImage.style.transform="scale(1)";

}

/*==================================================
CLOSE VIEWER
==================================================*/

function closeImageViewer(){

if(viewer){

viewer.classList.remove("active");

}

resetZoom();

}

if(closeViewer){

closeViewer.addEventListener("click",closeImageViewer);

}

if(viewer){

viewer.addEventListener("click",(e)=>{

if(e.target===viewer){

closeImageViewer();

}

});

}

/*==================================================
KEYBOARD SUPPORT
==================================================*/

document.addEventListener("keydown",(e)=>{

if(!viewer.classList.contains("active")){

return;

}

if(e.key==="ArrowLeft"){

showImage(currentImage-1);

updateViewer();

resetZoom();

}

if(e.key==="ArrowRight"){

showImage(currentImage+1);

updateViewer();

resetZoom();

}

if(e.key==="Escape"){

closeImageViewer();

}

});

/*==================================================
INITIALIZE
==================================================*/

window.addEventListener("DOMContentLoaded",()=>{

hideLoader();

if(images.length){

showImage(0);

}

});

/*==================================================
COMMON PLACEHOLDERS
==================================================*/

/*

Future

1.

Supabase

saveUser()

2.

Razorpay

3.

Payment Verification

4.

Book Unlock

5.

My Library

Only these sections will be added later.

No change in HTML/CSS/JS flow.

*/

/*==================================================
END OF FILE

AAROGYAM INDIA

COMMON DEMO BOOK JS

VERSION : V1

==================================================*/