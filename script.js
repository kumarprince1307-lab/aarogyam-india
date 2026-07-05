const images = [
  "banner1.jpeg",
  "banner2.jpeg",
  "banner3.jpeg"
];

let index = 0;

const slider = document.getElementById("slider");
const dots = document.querySelectorAll(".dot");

function showSlide(i){

    index = i;

    slider.style.opacity="0";

    setTimeout(()=>{

        slider.src = images[index];

        slider.style.opacity="1";

        dots.forEach(dot=>dot.classList.remove("active"));

        dots[index].classList.add("active");

    },300);

}

dots.forEach((dot,i)=>{

    dot.addEventListener("click",()=>{

        showSlide(i);

    });

});

setInterval(()=>{

    index++;

    if(index>=images.length){

        index=0;

    }

    showSlide(index);

},5000);
