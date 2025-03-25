#include <emscripten.h>
#include <stdio.h>
#include <stdlib.h>

//Prototypes
void plotLine(int x0,int y0,int x1,int y1, int color);
void console_log(char* str);

//Game Variables
int px = 0;
int py = 0;
int pdx = 0;
int pdy = 0;
int render_distance = 100;
float pa = 0.0;

//Canvas Variables 
uint8_t* canvas;
int canvas_width = 0;
int canvas_height = 0;
int canvas_depth = 0;

//Map Variables
uint8_t* map;
int map_width = 0;
int map_height = 0;
int map_depth = 0;


void EMSCRIPTEN_KEEPALIVE move_player(uint8_t keyCode){
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

void EMSCRIPTEN_KEEPALIVE set_img(int width, int height, int depth, int ptr){
    map_width = width;
    map_height = height;
    map_depth = depth;
    map = (uint8_t*)ptr;
}

void EMSCRIPTEN_KEEPALIVE set_canvas(int width, int height, int depth,int ptr){
    canvas_width = width;
    canvas_height = height;
    canvas_depth = depth;
    canvas = (uint8_t*)ptr;
    // char buf[50];
    // sprintf(buf, "Hello World! %d\n", 123);
    // console_log(buf);
}

void EMSCRIPTEN_KEEPALIVE render(){
    // int arr_len = (canvas_width * canvas_height * canvas_depth) >> 2;
    // for(int i = 0; i < arr_len;i++){
    //     ((int*)canvas)[i] = ((int*)map)[i];
    // }

    float x_step = (float)map_width / (float)canvas_width ;
    float y_step = (float)map_height / (float)canvas_height;
    float map_y = 0.0;
    int alpha = 0xFF808080;


    for (int y = 0; y < canvas_height;y++){
        float map_x = 0.0;
        for (int x = 0; x < canvas_width;x++){
            *(int*)(canvas + (y * canvas_width + x) * 4) = (*(int*)(map + (((int)map_y) * map_width + (((int)map_x))) * 4)) | alpha;
            map_x += x_step; 
        }
        map_y += y_step;
    }
    
    //0xAFFFFFFF;

    for (int x = px; x < px + 10;x++){
        for (int y = py;y < py + 10;y++){
            int idx = y * canvas_width * 4 + x * 4;
            canvas[idx + 0] = 0;
            canvas[idx + 1] = 0;
            canvas[idx + 2] = 0;
            canvas[idx + 3] = 255;
        }
    }
    plotLine(0,0,100,50,0xFF000000);
}


//Bresenham's Line algorithm
void plotLine(int x0,int y0,int x1,int y1, int color){
    int dx = abs(x1 - x0);
    int sx = (x0 < x1) ? 1 : -1;
    int dy = -abs(y1-y0);
    int sy = (y0 < y1) ? 1 : -1;
    int error = dx + dy;
    while (1==1){
        int idx = (y0 * canvas_width * canvas_depth + x0 * canvas_depth) >> 2;
        ((int*)canvas)[idx] = color;
        int e2 = 2 * error;
        if (e2 >= dy){
            if (x0 == x1)
                break;
            error = error + dy;
            x0 = x0 + sx;
        } 
        if (e2 <= dx){
            if (y0 == y1)
                break;
            error = error + dx;
            y0 = y0 + sy;
        }
    }
}