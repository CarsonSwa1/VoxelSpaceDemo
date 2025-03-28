import GameManager from "../classes/GameManager.js";
import Maps from "../classes/Maps.js";

const page = document.getElementById("page-container")

const canvas = document.getElementById("gameScreen");
const ctx = canvas.getContext("2d");

const gm = new GameManager(ctx);
const maps = new Maps(4);

const colorMapPath = "../assets/C1W.png";
const depthMapPath = "../assets/D1.png";

//WASM variables
let exports, memory, wasm_data;

document.addEventListener("DOMContentLoaded",async function load(){
    //load wasm file
    memory = new WebAssembly.Memory({initial: 2, maximum: 256});
    wasm_data = new Set();
    exports = await loadWasm("../wasm/render.wasm",memory,wasm_data);

    //load map into wasm
    maps.setWasm(exports,memory,wasm_data);
    await maps.loadMap(colorMapPath,Maps.MAP_TYPES.COLOR);
    await maps.loadMap(depthMapPath,Maps.MAP_TYPES.DEPTH);

    //load canvas buffer into wasm
    setCanvas();
    gm.setWasm(exports, memory, wasm_data);
    gm.loadCanvasBufIntoWasm();
    gm.render();

    //set up event listeners and gameloop
    gm.setEventListeners();
    gm.setIntervals();

    // wasmBytes = await loadWasmFile("../wasm/render.wasm")
    // gm.wasm = initWasm(wasmBytes, 4);
    
    /*
    maps.wasm = gm.wasm;
    await maps.loadMap(colorMapPath,Maps.MAP_TYPES.COLOR);
    await maps.loadMap(depthMapPath,Maps.MAP_TYPES.DEPTH);
    console.log(maps.map);
    console.log(gm.wasm.exports.get_pages())

    setCanvas();
    gm.loadCanvasBufIntoWasm();

    gm.setEventListeners();
    gm.setIntervals();
    */
})

function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

window.addEventListener("resize",() => {
    setCanvas();
    gm.canvasResize();
    gm.render();
})


function setCanvas(){
    canvas.width = window.innerWidth * .4;
    canvas.height = window.innerHeight * .5;
    const rect = canvas.getBoundingClientRect();
    const left = rect.left + window.scrollX;
    const top = rect.top + window.scrollY;
    page.style.setProperty("--game-canvas-width",canvas.width + "px");
    page.style.setProperty("--game-canvas-height",canvas.height + "px");
    page.style.setProperty("--game-canvas-left",left + "px");
    page.style.setProperty("--game-canvas-top",top + "px");
}


async function loadWasm(filePath, memory, wasmData){
    let exports;
    await WebAssembly.instantiateStreaming(
        fetch(filePath),{
            env: {
                memory: memory,
                emscripten_resize_heap: function(size){memory.grow(size);},
                emscripten_notify_memory_growth: function(){fixWasmData(wasmData)},
                js_console_log: wasmConsoleLog,
                js_sin: Math.sin,
                js_cos: Math.cos,
                js_tan: Math.tan,
            }
        }
    ).then(results => {
        exports = results.instance.exports;
    })
    return exports
}


//this gets called from wasm if we grow the size of the buffer.
//javascipt typed arrays need to have buffer updated on size grow
function fixWasmData(wasmData){
    for(const data of wasmData){
        data.fix_buffer(memory.buffer);
    }
}

function wasmConsoleLog(char_ptr){
    const arr = new Uint8ClampedArray(memory.buffer, char_ptr);
    let str = "";
    let i = 0;
    while (arr[i] != 0){
        str += String.fromCharCode(arr[i]);
        i += 1;
    }
    console.log(str);
}

