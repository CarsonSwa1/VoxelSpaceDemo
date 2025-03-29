import WasmArray from "../classes/WasmArray.js";

const fps = document.getElementById("fps-counter");

export default class GameManager{  
    constructor(ctx){
        this.frameRate = (1000/60);

        this.keys = new Array(6);
        this.keys.fill(false);

        this.ctx = ctx;
        
        this.canvasBuf = new ImageData(ctx.canvas.width,ctx.canvas.height);
        this.wasmBuf = null;

        this.wasm = {exports: null, memory: null, wasm_data: null}
    }


    setEventListeners(){

        // Keyboard Events
        this.keyEvent = (key, press) => {
            document.dispatchEvent(new CustomEvent(key,{detail: {pressed: press}}));
            this.keys[getKeyCode(key)] = press;
        };
        this.keyPress = (e) => {this.keyEvent(e.key,true);};
        this.keyUnpress = (e) => {this.keyEvent(e.key, false)};
        this.keyButtonEvent = (e) => {this.keys[getKeyCode(e.detail.key)] = e.detail.press;};


        document.addEventListener('keydown',this.keyPress);
        document.addEventListener('keyup',this.keyUnpress);
        document.addEventListener("keyButtonEvent",this.keyButtonEvent);


        //Settings input events

        //render distance input field
        this.render_distance_input = document.getElementById("input-render-distance");
        this.render_distance_input.value = 150;
        this.updateRenderDistance = () => {
            this.wasm.exports.setRenderDistance(this.render_distance_input.value);
        }
        this.updateRenderDistance();
        this.render_distance_input.addEventListener("input",this.updateRenderDistance);


        //horizon input field
        this.horizon_input = document.getElementById("input-horizon");
        this.horizon_input.value = 255;
        this.updateHorizon = () => {
            this.wasm.exports.setHorizon(this.horizon_input.value);
        }
        this.updateHorizon();
        this.horizon_input.addEventListener("input",this.updateHorizon);


        //vision field input
        this.vison_field = document.getElementById("input-vision-field");
        this.vison_field.value = 45;
        this.updateVisionField = () => {
            this.wasm.exports.setVisionField(this.vison_field.value);
        }
        this.updateVisionField();
        this.vison_field.addEventListener("input",this.updateVisionField);

        //background color input
        this.background_color = document.getElementById("input-background-color");
        this.background_color.value = "#AEC9F5";
        this.updateBackgroundColor = () => {
            const color = this.background_color.value;
            const color_little_endian = "FF" + color.substring(5) + color.substring(3,5) + color.substring(1,3);
            const int_color = parseInt(color_little_endian,16);
            this.wasm.exports.setBackgroundColor(int_color);
        }
        this.updateBackgroundColor();
        this.background_color.addEventListener("input",this.updateBackgroundColor);

    }

    setIntervals(){
        // this.gameLoop = window.setInterval(() => {
        //     this.movePlayer();
        //     this.render();
        // },this.frameRate)
        let prev_time = 0;
        let ticks = 0;
        this.draw = () => {
            requestAnimationFrame(this.draw);
            this.movePlayer();
            this.render();
            const now = performance.now();
            if ((now - prev_time) > 1000){
                fps.textContent = "FPS: " + (1000 / ((now - prev_time) / ticks)).toFixed(1);
                prev_time = now;
                ticks = -1;
            }
            ticks += 1
        }

        this.draw();
    }
    
    movePlayer(){
        if (this.keys[0]){
            this.wasm.exports.move_player(0);
        }
        if (this.keys[1]){
            this.wasm.exports.move_player(1);
        }
        if (this.keys[2]){
            this.wasm.exports.move_player(2);
        }
        if (this.keys[3]){
            this.wasm.exports.move_player(3);
        }
        if (this.keys[4]){
            this.wasm.exports.move_player(4);
        }
        if (this.keys[5]){
            this.wasm.exports.move_player(5);
        }
    }

    render(){
        // var performance = window.performance;
        // var t0 = performance.now();
        this.wasm.exports.render_voxel_space();
        this.ctx.putImageData(this.wasmBuf.data,0,0);
        // var t1 = performance.now();
        // console.log("Call to doWork took " + (t1 - t0) + " milliseconds.")
    }

    canvasResize(){
        const arrSize = this.ctx.canvas.height * this.ctx.canvas.width * 4;
        this.wasm.wasm_data.delete(this.wasmBuf);
        //const offset = this.wasm.exports.wasmrealloc(this.wasmBuf.offset,arrSize);
        this.wasm.exports.wasmfree(this.wasmBuf.offset);
        console.log(this.wasm.memory)
        console.log(this.wasmBuf.offset);
        const offset = this.wasm.exports.wasmmalloc(arrSize);

        if (offset == 0)
            throw new Error("Not Enough Wasm Memory, increase max memory size")
        

        const data = new Uint8ClampedArray(this.wasm.memory.buffer,offset,arrSize);
        const canvasBuf = new ImageData(
            data,
            this.ctx.canvas.width,
            this.ctx.canvas.height,
        );
        this.wasmBuf.data = canvasBuf;
        this.wasmBuf.offset = offset;
        this.wasmBuf.length = arrSize;
        this.wasm.wasm_data.add(this.wasmBuf); 
        

        this.wasm.exports.set_canvas(this.ctx.canvas.width,this.ctx.canvas.height,4,offset);
    }

    setWasm(exports, memory, wasm_data){
        this.wasm.exports = exports;
        this.wasm.memory = memory;
        this.wasm.wasm_data = wasm_data;
    }

    loadCanvasBufIntoWasm(){
        const arrSize = this.ctx.canvas.height * this.ctx.canvas.width * 4;
        const offset = this.wasm.exports.wasmmalloc(arrSize);
        if (offset == 0)
            throw new Error("Not Enough Wasm Memory, increase max memory size")
        
        const data = new Uint8ClampedArray(this.wasm.memory.buffer,offset,arrSize);
        const canvasBuf = new ImageData(
            data,
            this.ctx.canvas.width,
            this.ctx.canvas.height,
        );
        this.wasmBuf = new WasmArray(canvasBuf,offset,arrSize,true);
        this.wasm.wasm_data.add(this.wasmBuf);
        this.wasm.exports.set_canvas(this.ctx.canvas.width,this.ctx.canvas.height,4,offset);
    }
    
}


function getKeyCode(key){
    let ret = -1;
    switch(key){
        case "ArrowLeft":
            ret = 0
            break;
        case "ArrowRight":
            ret = 1;
            break;
        case "ArrowUp":
            ret = 2;
            break;
        case "ArrowDown":
            ret = 3;
            break;
        case "z":
            ret = 4;
            break;
        case "x":
            ret = 5;
            break;
    }
    return ret;
}