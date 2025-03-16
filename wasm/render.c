#define PAGE_SIZE 65536

#define WASM_EXPORT(name) \
  __attribute__((export_name(#name))) \
  name

typedef unsigned char u8;

extern u8 __heap_base;
extern u8 __data_end;

u8* heap_top_ptr = &__heap_base;

//Game Variables
int px = 0;
int py = 0;
float pa = 0.;
float pdx = 0.;
float pdy = 0.;

//Canvas Variables
u8* canvas;
int canvas_width = 0;
int canvas_height = 0;
int canvas_depth = 0;

//Img Variables
u8* img;
int img_width = 0;
int img_height = 0;
int img_depth = 0;


__attribute__((import_module("env"), import_name("js__realign")))
void js_realign();


void* WASM_EXPORT(mallocate)(int bytes){
    int mem = __builtin_wasm_memory_size(0) << 16;
    int rem_mem = mem - (int)heap_top_ptr;
    if(bytes > rem_mem){
        int needed_mem = ((bytes - rem_mem) >> 16) + 1;
        __builtin_wasm_memory_grow(0,needed_mem);
        js_realign();
    }   
    u8* malloc_ptr = heap_top_ptr;
    heap_top_ptr += bytes;
    return (void*)malloc_ptr;
}

//NOTE: this realloc only works on the last block in the heap (probably not a good solution)
//only use this on the canvas for now
void WASM_EXPORT(reallocate)(int ptr,int bytes){
    int mem = __builtin_wasm_memory_size(0) << 16;
    int rem_mem = mem - ptr;
    if (rem_mem < bytes){
        int needed_mem = ((bytes - rem_mem) >> 16) + 1;
        __builtin_wasm_memory_grow(0,needed_mem);
        js_realign();
    }
    heap_top_ptr = (u8*)(ptr + bytes);
}

int WASM_EXPORT(get_pages)(int pages){
    return __builtin_wasm_memory_size(0);
}

void WASM_EXPORT(move_player)(u8 keyCode){
    switch(keyCode){
        case 0: //Left Arrow
            px -= 1;
            break;
        case 1: //Right Arrow
            px += 1;
            break;
        case 2: 
            py -= 1;
            break;
        case 3: 
            py += 1;
            break;
    }
}

void WASM_EXPORT(set_img)(int width, int height, int depth, int ptr){
    img_width = width;
    img_height = height;
    img_depth = depth;
    img = (u8*)ptr;
}

void WASM_EXPORT(set_canvas)(int width, int height, int depth,int ptr){
    canvas_width = width;
    canvas_height = height;
    canvas_depth = depth;
    canvas = (u8*)ptr;
}


void WASM_EXPORT(render)(){
    int arr_len = (canvas_width * canvas_height * canvas_depth) >> 2;
    for(int i = 0; i < arr_len;i++){
        ((int*)canvas)[i] = 0xAFFFFFFF;
    }

    for (int x = px; x < px + 10;x++){
        for (int y = py;y < py + 10;y++){
            int idx = y * canvas_width * 4 + x * 4;
            canvas[idx + 0] = 0;
            canvas[idx + 1] = 0;
            canvas[idx + 2] = 0;
            canvas[idx + 3] = 255;
        }
    }
    
}





