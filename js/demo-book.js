/*==================================================
AAROGYAM INDIA
DEMO BOOK JS
PART - 1
==================================================*/

/*==================================================
DOM ELEMENTS
==================================================*/

const demoForm = document.getElementById("demoForm");

const formSection = document.querySelector(".demo-form-section");

const demoPreview = document.getElementById("demoPreview");

const previewSlider = document.querySelector(".preview-slider");

const loader = document.getElementById("loader");

const toast = document.getElementById("toast");

const nameInput = document.getElementById("name");

const mobileInput = document.getElementById("mobile");

const emailInput = document.getElementById("email");

const stateInput = document.getElementById("state");

const districtInput = document.getElementById("district");


/*==================================================
LOADER
==================================================*/

function showLoader(){

    loader.style.display = "flex";

}

function hideLoader(){

    loader.style.display = "none";

}


/*==================================================
TOAST
==================================================*/

function showToast(message){

    toast.innerText = message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}


/*==================================================
PAGE INITIALIZE
==================================================*/

function initializePage(){

    hideLoader();

    demoPreview.style.display = "none";

    previewSlider.style.display = "none";

}


/*==================================================
VALIDATION
==================================================*/

function validateName(){

    const value = nameInput.value.trim();

    if(value.length < 3){

        showToast("कृपया पूरा नाम दर्ज करें");

        nameInput.focus();

        return false;

    }

    return true;

}


function validateMobile(){

    const mobile = mobileInput.value.trim();

    const mobilePattern = /^[6-9]\d{9}$/;

    if(!mobilePattern.test(mobile)){

        showToast("सही मोबाइल नंबर दर्ज करें");

        mobileInput.focus();

        return false;

    }

    return true;

}


function validateForm(){

    if(!validateName()){

        return false;

    }

    if(!validateMobile()){

        return false;

    }

    return true;

}


/*==================================================
SAVE USER
SUPABASE PLACEHOLDER
==================================================*/

async function saveUser(){

    /*
    Future

    await supabase
    .from("demo_users")
    .insert([...]);

    */

    return true;

}
/*==================================================
FORM SUBMIT
==================================================*/

demoForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (!validateForm()) {

        return;

    }

    showLoader();

    const userData = {

        name: nameInput.value.trim(),

        mobile: mobileInput.value.trim(),

        email: emailInput.value.trim(),

        state: stateInput.value.trim(),

        district: districtInput.value.trim(),

        createdAt: new Date().toISOString()

    };

    const saved = await saveUser(userData);

    hideLoader();

    if (!saved) {

        showToast("कुछ समस्या हुई। कृपया पुनः प्रयास करें।");

        return;

    }

    unlockDemo();

});


/*==================================================
UNLOCK DEMO
==================================================*/

function unlockDemo() {

    formSection.style.display = "none";

    demoPreview.style.display = "block";

    previewSlider.style.display = "block";

    showToast("🎉 Demo सफलतापूर्वक Unlock हो गया");

}


/*==================================================
RESET FORM
==================================================*/

function resetForm() {

    demoForm.reset();

}


/*==================================================
AUTO FOCUS
==================================================*/

window.addEventListener("load", () => {

    initializePage();

    nameInput.focus();

});
/*==================================================
IMAGE SLIDER
==================================================*/

const previewImages = document.querySelectorAll(".preview-image");

const prevBtn = document.querySelector(".prev-btn");

const nextBtn = document.querySelector(".next-btn");

let currentIndex = 0;


/*==================================================
SHOW IMAGE
==================================================*/

function showImage(index){

    previewImages.forEach((image)=>{

        image.classList.remove("active");

    });

    previewImages[index].classList.add("active");

}


/*==================================================
NEXT IMAGE
==================================================*/

function nextImage(){

    currentIndex++;

    if(currentIndex >= previewImages.length){

        currentIndex = 0;

    }

    showImage(currentIndex);

}


/*==================================================
PREVIOUS IMAGE
==================================================*/

function previousImage(){

    currentIndex--;

    if(currentIndex < 0){

        currentIndex = previewImages.length - 1;

    }

    showImage(currentIndex);

}


/*==================================================
BUTTON EVENTS
==================================================*/

nextBtn.addEventListener("click", nextImage);

prevBtn.addEventListener("click", previousImage);


/*==================================================
SWIPE SUPPORT
==================================================*/

let touchStartX = 0;

let touchEndX = 0;

previewSlider.addEventListener("touchstart",(event)=>{

    touchStartX = event.changedTouches[0].screenX;

});

previewSlider.addEventListener("touchend",(event)=>{

    touchEndX = event.changedTouches[0].screenX;

    if(touchStartX - touchEndX > 50){

        nextImage();

    }

    else if(touchEndX - touchStartX > 50){

        previousImage();

    }

});


/*==================================================
INITIAL IMAGE
==================================================*/

showImage(currentIndex);
/*==================================================
IMAGE VIEWER
==================================================*/

const imageViewer = document.getElementById("imageViewer");

const viewerImage = document.getElementById("viewerImage");

const viewerPrev = document.querySelector(".viewer-prev");

const viewerNext = document.querySelector(".viewer-next");

const closeViewer = document.querySelector(".close-viewer");


/*==================================================
OPEN VIEWER
==================================================*/

previewImages.forEach((image, index) => {

    image.addEventListener("click", () => {

        currentIndex = index;

        viewerImage.src = previewImages[currentIndex].src;

        imageViewer.style.display = "flex";

    });

});


/*==================================================
VIEWER NEXT
==================================================*/

viewerNext.addEventListener("click", () => {

    nextImage();

    viewerImage.src = previewImages[currentIndex].src;

});


/*==================================================
VIEWER PREVIOUS
==================================================*/

viewerPrev.addEventListener("click", () => {

    previousImage();

    viewerImage.src = previewImages[currentIndex].src;

});


/*==================================================
CLOSE VIEWER
==================================================*/

closeViewer.addEventListener("click", () => {

    imageViewer.style.display = "none";

});


/*==================================================
CLICK OUTSIDE TO CLOSE
==================================================*/

imageViewer.addEventListener("click", (event) => {

    if (event.target === imageViewer) {

        imageViewer.style.display = "none";

    }

});


/*==================================================
KEYBOARD SUPPORT
==================================================*/

document.addEventListener("keydown", (event) => {

    if (imageViewer.style.display !== "flex") return;

    if (event.key === "ArrowRight") {

        nextImage();

        viewerImage.src = previewImages[currentIndex].src;

    }

    if (event.key === "ArrowLeft") {

        previousImage();

        viewerImage.src = previewImages[currentIndex].src;

    }

    if (event.key === "Escape") {

        imageViewer.style.display = "none";

    }

});


/*==================================================
DOUBLE CLICK ZOOM
==================================================*/

let zoomed = false;

viewerImage.addEventListener("dblclick", () => {

    zoomed = !zoomed;

    if (zoomed) {

        viewerImage.style.transform = "scale(2)";

        viewerImage.style.cursor = "zoom-out";

    } else {

        viewerImage.style.transform = "scale(1)";

        viewerImage.style.cursor = "zoom-in";

    }

});


/*==================================================
RESET ZOOM AFTER CLOSE
==================================================*/

function resetViewer() {

    zoomed = false;

    viewerImage.style.transform = "scale(1)";

    viewerImage.style.cursor = "zoom-in";

}

closeViewer.addEventListener("click", resetViewer);

imageViewer.addEventListener("click", (event) => {

    if (event.target === imageViewer) {

        resetViewer();

    }

});


/*==================================================
END OF FILE
==================================================*/