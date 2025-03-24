export default class WasmArray{
    constructor(data, offset, length, isImageData = false){
        this.data = data
        this.offset = offset;
        this.length = length;
        this.isImageData = isImageData;
    }

    fix_buffer(buffer){
        if (this.isImageData){
            let typeArray = this.data.data[Symbol.toStringTag];
            this.data = new ImageData(
                new window[typeArray](buffer,this.offset,this.length),
                this.data.width,
                this.data.height
            )
        }
        else{
            let typeArray = this.data[Symbol.toStringTag];
            this.data = new window[typeArray](buffer,this.offset,this.length);
        }
    }
}
