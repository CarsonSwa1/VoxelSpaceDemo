import GameManager from "../classes/GameManager.js";
import Maps from "../classes/Maps.js";

const canvas = document.getElementById("gameScreen");
const ctx = canvas.getContext("2d");

const gm = new GameManager(ctx);
const maps = new Maps(4);

const colorMapPath = "../assets/C1W.png";
const depthMapPath = "../assets/D1.png";

let wasmBytes;

async function delayTwoSeconds() {
    await new Promise(resolve => setTimeout(resolve, 2000));
}

document.addEventListener("DOMContentLoaded",async function load(){
    wasmBytes = await loadWasmFile("../wasm/render.wasm")
    gm.wasm = initWasm(wasmBytes, 4);
    console.log(gm.wasm.exports.get_pages())
    
    maps.wasm = gm.wasm;
    await maps.loadMap(colorMapPath,Maps.MAP_TYPES.COLOR);
    await maps.loadMap(depthMapPath,Maps.MAP_TYPES.DEPTH);
    console.log(maps.map);
    console.log(gm.wasm.exports.get_pages())

    setCanvas();
    gm.loadCanvasBufIntoWasm();

    gm.setEventListeners();
    gm.setIntervals();
    

    // console.log(gm.wasm.exports.heap_base())
    // console.log(gm.wasm.memory);
    // gm.wasm.exports.grow(5);
    // console.log(gm.wasm.exports.heap_base())
    // console.log(gm.wasm.memory);
    // maps.map = new Uint8ClampedArray(gm.wasm.memory.buffer,maps.byteOffset,maps.width*maps.height*maps.depth);
    // console.log(maps.map)
    
    //maps.loadColor(colorMapPath);
    //console.log(maps);
    // wasmBytes = await loadWasmFile("../wasm/render.wasm")
    // gm.wasm = initWasm(wasmBytes, 4);
    // console.log(gm.wasm)
    // console.log(gm.wasm.exports.mallocate(5));
    // console.log(gm.wasm.exports.mallocate(5));
})

window.addEventListener("resize",() => {
    canvas.width = window.innerWidth * .4;
    canvas.height = window.innerHeight * .5;
    gm.canvasResize();
    gm.render();
})


function setCanvas(){
    canvas.width = window.innerWidth * .4;
    canvas.height = window.innerHeight * .5;
    gm.render();
}

async function loadWasmFile(filePath){
    const response = await fetch(filePath);
    const bytes = await response.arrayBuffer();
    return bytes
}

function initWasm(wasm_bytes, num_pages){
    const mod = new WebAssembly.Module(wasm_bytes);
    const memory = new WebAssembly.Memory({initial: num_pages});
    const imports = {env: {
        memory,
        js__realign: realignWasmData,
    },}
    const instance = new WebAssembly.Instance(mod,imports);
    instance.memory = memory;
    return instance
}

//this gets called from wasm if we grow the size of the buffer.
function realignWasmData(){
    if(maps.byteOffset != null && gm.wasm != null){
        maps.map = new Uint8ClampedArray(gm.wasm.memory.buffer,maps.byteOffset,maps.width*maps.height*maps.depth);
    }
}
