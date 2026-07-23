/* ==========================================
   Aarogyam India
   registration.js
   Part 1
========================================== */

"use strict";

/* ==========================================
   APP CONFIG
========================================== */

const APP = {

    version: "1.0",

    redirectAfterLogin: "index.html",

    redirectAfterRegister: "index.html"

};

/* ==========================================
   DOM ELEMENTS
========================================== */

const registrationForm = document.getElementById("registrationForm");

const fullName = document.getElementById("fullName");

const mobile = document.getElementById("mobile");

const email = document.getElementById("email");

const state = document.getElementById("state");

const district = document.getElementById("district");

const referralMobile = document.getElementById("referralMobile");

const terms = document.getElementById("terms");

const registerBtn = document.getElementById("registerBtn");

const statusMessage = document.getElementById("statusMessage");

const pageLoader = document.getElementById("pageLoader");

const toastMessage = document.getElementById("toastMessage");

const backBtn = document.getElementById("backBtn");

/* ==========================================
   GLOBAL USER OBJECT
========================================== */

const userData = {

    userId: "",

    referral: "",

    referralSource: "",

    redirectPage: "",

    language: "en"

};

/* ==========================================
   PAGE LOAD
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    detectReferral();

    loadLanguage();

    attachEvents();

});

/* ==========================================
   EVENTS
========================================== */

function attachEvents(){

    if(backBtn){

        backBtn.addEventListener("click", () => {

            history.back();

        });

    }

}

/* ==========================================
   REFERRAL DETECTION
========================================== */

function detectReferral(){

    const params = new URLSearchParams(window.location.search);

    const ref = params.get("ref");

    if(ref){

        referralMobile.value = ref;

        referralMobile.readOnly = true;

        userData.referral = ref;

    }

}

/* ==========================================
   LANGUAGE
========================================== */

function loadLanguage(){

    const lang = localStorage.getItem("language");

    if(lang){

        userData.language = lang;

    }

}

/* ==========================================
   LOADER
========================================== */

function showLoader(){

    pageLoader.classList.add("active");

}

function hideLoader(){

    pageLoader.classList.remove("active");

}

/* ==========================================
   TOAST
========================================== */

function showToast(message){

    toastMessage.innerText = message;

    toastMessage.classList.add("show");

    setTimeout(() => {

        toastMessage.classList.remove("show");

    },3000);

}

/* ==========================================
   STATUS
========================================== */

function setStatus(message,color="#0F7B3F"){

    statusMessage.innerText = message;

    statusMessage.style.color = color;

}
/* ==========================================
   VALIDATION
========================================== */

function validateForm(){

    if(fullName.value.trim().length < 3){

        showToast("Enter valid full name");

        fullName.focus();

        return false;

    }

    if(!/^[6-9]\d{9}$/.test(mobile.value.trim())){

        showToast("Enter valid mobile number");

        mobile.focus();

        return false;

    }

    if(email.value.trim() !== ""){

        const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!emailRegex.test(email.value.trim())){

            showToast("Enter valid email");

            email.focus();

            return false;

        }

    }

    if(!terms.checked){

        showToast("Please accept Terms & Privacy Policy");

        return false;

    }

    return true;

}

/* ==========================================
   USER OBJECT
========================================== */

function collectFormData(){

    return{

        full_name:fullName.value.trim(),

        mobile:mobile.value.trim(),

        email:email.value.trim(),

        state:state.value.trim(),

        district:district.value.trim(),

        referral_mobile:referralMobile.value.trim(),

        language:userData.language,

        created_at:new Date().toISOString()

    };

}

/* ==========================================
   SUBMIT
========================================== */

registrationForm.addEventListener("submit",

async function(e){

    e.preventDefault();

    if(!validateForm()){

        return;

    }

    showLoader();

    registerBtn.disabled=true;

    setStatus("Checking account...");

    const formData=collectFormData();

    await processRegistration(formData);

});

/* ==========================================
   MAIN FLOW
========================================== */

async function processRegistration(formData){

    try{

        const existingUser=
        await checkExistingMobile(
        formData.mobile
        );

        if(existingUser){

            await loginExistingUser(existingUser);

            return;

        }

        await createNewUser(formData);

    }

    catch(error){

        console.error(error);

        hideLoader();

        registerBtn.disabled=false;

        setStatus(
        "Registration failed",
        "#d32f2f"
        );

        showToast(
        "Something went wrong"
        );

    }

}

/* ==========================================
   PLACEHOLDERS
========================================== */

async function checkExistingMobile(mobileNumber){

    /*
      Part-3
      Supabase Query

      select *
      from profiles
      where mobile=mobileNumber

    */

    return null;

}

async function loginExistingUser(user){

    setStatus(
    "Already registered. Logging in..."
    );

    showToast(
    "Welcome Back"
    );

    /*
      Part-3

      Create Session

      Save User

      Redirect

    */

}

async function createNewUser(formData){

    setStatus(
    "Creating account..."
    );

    /*
      Part-3

      Insert into Supabase

      Referral Process

      Session

      Redirect

    */

}
/* ==========================================================
   PART 3
   Registration Complete Flow
   ========================================================== */

/* ================================
   Check Existing Mobile
================================ */

async function checkExistingMobile(mobileNumber){

    try{

        return await getProfileByMobile(mobileNumber);

    }

    catch(error){

        console.error(error);

        return null;

    }

}

/* ================================
   Existing User Login
================================ */

async function loginExistingUser(profile){

    try{

        setStatus(
            "Already Registered. Logging In..."
        );

        showToast(
            "Welcome Back"
        );

        await saveUserSession(profile);

        hideLoader();

        registerBtn.disabled = false;

        setTimeout(()=>{

            redirectAfterLogin(
                userData.redirectPage ||
                APP.redirectAfterLogin
            );

        },1000);

    }

    catch(error){

        console.error(error);

        hideLoader();

        registerBtn.disabled = false;

        showToast(
            "Login Failed"
        );

    }

}

/* ================================
   Create New User
================================ */

async function createNewUser(formData){

    try{

        setStatus(
            "Creating Account..."
        );

        const profile =
            await saveProfile(formData);

        if(!profile){

            throw new Error(
                "Profile Not Created"
            );

        }

        if(formData.referral_mobile){

            await processReferral(

                profile,

                formData.referral_mobile

            );

        }

        await saveUserSession(profile);

        await afterSuccessfulRegistration(profile);

        hideLoader();

        registerBtn.disabled = false;

        setStatus(
            "Registration Successful"
        );

        showToast(
            "Welcome To Aarogyam India"
        );

        setTimeout(()=>{

            redirectAfterRegistration(

                userData.redirectPage ||

                APP.redirectAfterRegister

            );

        },1200);

    }

    catch(error){

        console.error(error);

        hideLoader();

        registerBtn.disabled = false;

        setStatus(

            "Registration Failed",

            "#d32f2f"

        );

        showToast(

            "Please Try Again"

        );

    }

}

/* ================================
   Auto Login Check
================================ */

document.addEventListener(

    "DOMContentLoaded",

    async()=>{

        try{

            const profile=

                await restoreUserSession();

            if(profile){

                console.log(

                    "Session Restored"

                );

            }

        }

        catch(error){

            console.error(error);

        }

    }

);
