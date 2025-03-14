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
    
    constructor(){
        this.colorMap = null;
        this.depthMap = null;
    }

    async loadMap(imgPath, mapType){
        const img = await Maps.loadImage(imgPath);
        const c = document.createElement("canvas");
        const ctx = c.getContext("2d");
        c.width = img.width;
        c.height = img.height;
        ctx.drawImage(img,0,0)
        if (mapType === Maps.MAP_TYPES.COLOR){
            this.colorMap = ctx.getImageData(0,0,c.width,c.height);
        }
        else if (mapType === Maps.MAP_TYPES.DEPTH){
            this.depthMap = ctx.getImageData(0,0,c.width,c.height);
        }
    }

}