const images = [
  "slide1.jpeg",
  "slide2.jpeg",
  "slide3.jpeg"
];

let index = 0;
const slider = document.getElementById("slider");

setInterval(() => {
  index++;
  if (index >= images.length) {
    index = 0;
  }
  slider.src = images[index];
}, 3000);
