export default class Maps{
    static async loadImage(imgPath){
        return new Promise((resolve,reject) => {
            const img = new Image();
            img.src = imgPath;
            img.onload = () => {
                resolve(img);
            }
            img.onerror = (e) => {
                reject(e);
            }
        })
    }

    static MAP_TYPES = {
        COLOR: 0,
        DEPTH: 1,
    }
    
    constructor(depth=4){
        this.map = new Uint8ClampedArray();
        this.width = 0;
        this.height = 0;
        this.depth = depth;
        this.wasm = null;
        this.byteOffset = null;
    }

    async loadMap(imgPath, mapType){
        const img = await Maps.loadImage(imgPath);
        const c = document.createElement("canvas");
        const ctx = c.getContext("2d");
        c.width = img.width;
        c.height = img.height;
        ctx.drawImage(img,0,0)
        if (mapType === Maps.MAP_TYPES.COLOR){
            const colorMap = ctx.getImageData(0,0,c.width,c.height);
            this.loadColor(colorMap);
        }
        else if (mapType === Maps.MAP_TYPES.DEPTH){
            const depthMap = ctx.getImageData(0,0,c.width,c.height);
            this.loadDepth(depthMap);
        }
    }

    loadColor(colorMap){
        if (this.map.length == 0){
            this.width = colorMap.width;
            this.height = colorMap.height;
            const arrLen = this.width * this.height * this.depth;
            this.byteOffset = this.wasm.exports.mallocate(arrLen);
            this.map = new Uint8ClampedArray(this.wasm.memory.buffer,this.byteOffset,arrLen);
            this.wasm.exports.set_img(this.width,this.height,this.depth,this.byteOffset);
        }

        for(let y = 0; y < this.height;y++){
            for(let x = 0; x < this.width;x++){
                const idx = y * this.width * 4 + x * 4;
                this.map[idx + 0] = colorMap.data[idx + 0];
                this.map[idx + 1] = colorMap.data[idx + 1];
                this.map[idx + 2] = colorMap.data[idx + 2];
            }
        }
        console.log("Color Map Loaded")
    }

    loadDepth(depthMap){
        if (this.map.length == 0){
            this.width = depthMap.width;
            this.height = depthMap.height;
            const arrLen = this.width * this.height * this.depth;
            this.byteOffset = this.wasm.exports.mallocate(arrLen);
            this.map = new Uint8ClampedArray(this.wasm.memory.buffer,this.byteOffset,arrLen);
            this.wasm.exports.set_img(this.width,this.height,this.depth,this.byteOffset);
        }
        for(let y = 0; y < this.height;y++){
            for(let x = 0; x < this.width;x++){
                const idx = y * this.width * 4 + x * 4;
                this.map[idx + 3] = depthMap.data[idx];
            }
        }
        console.log("Depth Map Loaded")
    }

}