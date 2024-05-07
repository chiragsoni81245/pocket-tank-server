var mouseX = 0;
var mouseY = 0;
document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});
const mainContainer = document.getElementsByClassName("main-container")[0];
const arenaContainer = document.getElementsByClassName("arena-container")[0];
const controllerContainer = document.getElementsByClassName(
    "controller-container"
)[0];
const arena = document.getElementById("arena");
arena.width = arenaContainer.clientWidth;
arena.height = arenaContainer.clientHeight;
var context = arena.getContext("2d");
let objects = [];
// Global Physics Variables
const gravity = 10;
const globalAnimationSpeed = 35;
