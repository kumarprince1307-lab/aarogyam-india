const images = [
 const slides = [
  "banner1.jpeg",
  "banner2.jpeg",
  "banner3.jpeg"
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
