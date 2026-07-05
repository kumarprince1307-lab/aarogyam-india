window.onload = function () {
    console.log("Aarogyam India Website Loaded Successfully");

    const button = document.querySelector(".btn");

    button.addEventListener("click", function (e) {
        e.preventDefault();

        alert(
            "🚜 Aarogyam India\n\nWebsite पर काम चल रहा है। जल्द ही किसानों के लिए पूरी डिजिटल सेवा उपलब्ध होगी।"
        );
    });
};
