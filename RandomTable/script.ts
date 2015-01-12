var body = document.body;

var btn = <HTMLButtonElement>document.createElement("button");
btn.innerText = "click";
var width = window.innerWidth, height = window.innerHeight;

body.appendChild(btn);

btn.style.marginLeft = (width / 2 - btn.offsetWidth / 2).toString() + "px";
btn.style.marginTop = (height / 2 - btn.offsetHeight / 2).toString() + "px";


btn.addEventListener("click", (event) => {
  window.alert("klik");
}, false);

var moveCount = 0;
btn.addEventListener("mousedown", (event) => {
  if(moveCount === 4) {
    console.log("już się nie porusza po kliknięciu")
  }
  else {
    var r = Math.floor(Math.random() * 4);
    if(r === 0)
      btn.style.marginLeft = (parseInt(btn.style.marginLeft) - 50).toString() + "px";
    if(r === 1)
      btn.style.marginLeft = (parseInt(btn.style.marginLeft) + 50).toString() + "px";
    if(r === 2)
      btn.style.marginTop = (parseInt(btn.style.marginTop) - 50).toString() + "px";
    if(r === 3)
      btn.style.marginTop = (parseInt(btn.style.marginTop) + 50).toString() + "px";
    moveCount++;
  }
}, false);

var color = [
  "rgba(255, 0, 0, 1)",
  "rgba(255, 255, 0, 1)",
  "rgba(5, 0, 255, 1)",
  "rgba(5, 255, 255, 1)",
  "rgba(25, 0, 100, 1)",
];

btn.addEventListener("mouseover", (event) => {
  if(moveCount === 4) {
    var r = Math.floor(Math.random() * 5);
    btn.style.backgroundColor = color[r];
  }
}, false);
