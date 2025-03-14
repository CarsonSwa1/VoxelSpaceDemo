import GameManager from "../classes/GameManager.js";
import Maps from "../classes/Maps.js";

const canvas = document.getElementById("gameScreen");
const ctx = canvas.getContext("2d");

const gm = new GameManager(ctx);
const maps = new Maps();

const colorMapPath = "../assets/C1W.png";
const depthMapPath = "../assets/D1.png";

document.addEventListener("DOMContentLoaded",() => {
    setCanvas();
})

window.addEventListener("resize",() => {
    setCanvas();
})


function setCanvas(){
    canvas.width = window.innerWidth * .4;
    canvas.height = window.innerHeight * .5;
    gm.render();
}