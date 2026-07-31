/*=========================================================
  FILE NAME : script.js
  PROJECT   : Aarogyam India V1
  MODULE    : Home Page (Index)
  VERSION   : 2.0.0
=========================================================*/
"use strict";

document.addEventListener("DOMContentLoaded", () => {

    // --- Existing Mobile Menu Logic ---
    const menuBtn = document.getElementById("menuBtn");
    const closeMenu = document.getElementById("closeMenu");
    const mobileMenu = document.getElementById("mobileMenu");

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener("click", () => {
            mobileMenu.classList.add("active");
        });
    }

    if (closeMenu && mobileMenu) {
        closeMenu.addEventListener("click", () => {
            mobileMenu.classList.remove("active");
        });
    }

    // --- Existing Hero Slider Logic ---
    const slides = document.querySelectorAll(".hero-slider .slide");
    const dots = document.querySelectorAll(".slider-dots .dot");
    const prevBtn = document.getElementById("sliderPrev");
    const nextBtn = document.getElementById("sliderNext");
    let currentSlide = 0;

    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove("active"));
        dots.forEach(dot => dot.classList.remove("active"));
        slides[n].classList.add("active");
        dots[n].classList.add("active");
        currentSlide = n;
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            let next = (currentSlide + 1) % slides.length;
            showSlide(next);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            let prev = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prev);
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            showSlide(index);
        });
    });

    // Auto-play slider
    setInterval(() => {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }, 5000);


    // --- PHASE 1: UNIVERSAL LOGIN INTEGRATION ---

    // Check if V1_SESSION is loaded. It's the foundation.
    if (typeof V1_SESSION === 'undefined') {
        console.error("CRITICAL: Session module (V1_SESSION) not loaded. Login system disabled.");
        return;
    }

    const loginButton = document.getElementById("homeLoginBtn");
    const logoutButton = document.getElementById("homeLogoutBtn");
    const myLibraryButton = document.getElementById("myLibraryBtn");
    const loginModal = document.getElementById("loginModal");
    const closeModalBtn = document.querySelector(".close-button");
    const loginForm = document.getElementById("loginForm");
    const mobileInput = document.getElementById("loginMobile");
    const loginMessage = document.getElementById("loginMessage");

    // 1. Update UI based on login state
    function updateLoginStateUI() {
        if (V1_SESSION.isLoggedIn()) {
            loginButton.style.display = "none";
            logoutButton.style.display = "inline-flex";
            myLibraryButton.style.display = "inline-flex";
        } else {
            loginButton.style.display = "inline-flex";
            logoutButton.style.display = "none";
            myLibraryButton.style.display = "none";
        }
    }

    // 2. Show/Hide Modal
    function showLoginModal() {
        loginMessage.textContent = "";
        mobileInput.value = "";
        loginModal.style.display = "block";
        mobileInput.focus();
    }

    function hideLoginModal() {
        loginModal.style.display = "none";
    }

    // 3. Handle Login/Registration Flow
    async function handleLogin(event) {
        event.preventDefault();
        const mobile = mobileInput.value.trim();

        if (!/^[6-9]\d{9}$/.test(mobile)) {
            loginMessage.textContent = "Please enter a valid 10-digit mobile number.";
            return;
        }

        // This reuses the existing `checkUserExists` function from supabase.js
        if (typeof checkUserExists !== "function") {
            loginMessage.textContent = "Error: Database engine not available.";
            return;
        }

        try {
            const { exists, user } = await checkUserExists(mobile);

            if (exists) {
                // User exists. Reuse the existing session creation logic.
                localStorage.setItem('AI_USER', JSON.stringify(user));
                loginMessage.textContent = "Login Successful! Reloading...";
                setTimeout(() => window.location.reload(), 800);
            } else {
                // User does not exist. Redirect to the existing registration page.
                const registrationUrl = `registration.html?mobile=${mobile}&source=HomePage`;
                window.location.href = registrationUrl;
            }
        } catch (error) {
            console.error("Login check failed:", error);
            loginMessage.textContent = "An error occurred. Please try again.";
        }
    }

    // 4. Bind all events
    loginButton.addEventListener("click", showLoginModal);
    logoutButton.addEventListener("click", () => V1_SESSION.logout()); // Reuse V1_SESSION logout
    closeModalBtn.addEventListener("click", hideLoginModal);
    loginForm.addEventListener("submit", handleLogin);

    window.addEventListener("click", (event) => {
        if (event.target === loginModal) {
            hideLoginModal();
        }
    });

    // 5. Initial UI setup on page load
    updateLoginStateUI();

    console.log("Home Page Login Module Ready.");
});