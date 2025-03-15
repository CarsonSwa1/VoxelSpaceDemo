
export default class GameManager{  
    constructor(ctx){
        this.frameRate = (1000/60);

        this.pX = 0;
        this.pY = 0;
        this.keys = new Array(6);
        this.keys.fill(false);

        this.ctx = ctx;
        this.canvasBuf = new ImageData(ctx.canvas.width,ctx.canvas.height);
        this.canvasBufOffset = null;
        this.wasm = null;
        

        this.setEventListeners();
        this.setIntervals();
    }


    setEventListeners(){
        this.keyPress = (e) => {
            this.keys[getKeyCode(e.key)] = true;
        }
        this.keyUnpress = (e) => {
            this.keys[getKeyCode(e.key)] = false;
        }

        document.addEventListener('keydown',this.keyPress);
        document.addEventListener('keyup',this.keyUnpress);
    }

    setIntervals(){
        this.gameLoop = window.setInterval(() => {
            this.movePlayer();
            this.render();
        },this.frameRate)
    }
    
    movePlayer(){
        if (this.keys[0])
            this.pX -= 1;
        if (this.keys[1])
            this.pX += 1;
        if (this.keys[2])
            this.pY -= 1;
        if (this.keys[3])
            this.pY += 1;
    }

    render(){
        this.ctx.fillStyle = 'grey';
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.pX,this.pY,10,10);
    }

    canvasResize(){
        console.log(this.ctx.canvas.width);
        this.canvasBuf = new ImageData(this.ctx.canvas.width,this.ctx.canvas.height);
    }

    loadCanvasBufIntoWasm(){
        const arrSize = this.ctx.canvas.height * this.ctx.canvas.width * 4;
        this.canvasBufOffset = this.wasm.exports.mallocate(arrSize);
        this.canvasBuf = new ImageData(
            new Uint8ClampedArray(this.wasm.memory.buffer,this.canvasBufOffset,arrSize),
            this.ctx.canvas.width,
            this.ctx.canvas.height,
        );
    }
    


}


function getKeyCode(key){
    let ret = -1
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
    }
    return ret;
}