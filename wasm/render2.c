#include <emscripten.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

//constants
#define PI 3.14159265358979323846
#define TWO_PI 2 * PI
#define PI_OVER_TWO .5 * PI
#define DEGREES_TO_RADIANS 0.0174533

//Prototypes
void convertCanvasToGrayScale();
void convertCanvasToAtkinsonDither();
void convertCanvasToBoxFilterBlur();
void addToCanvasPixelInt(int x, int y,int val);
int get_canvas_color(int x, int y);
void plotLine(int x0,int y0,int x1,int y1, int color);
void fillRectCanvas(int x,int y,int w,int h, int color);
void fillRectMapCanvas(int x,int y,int w,int h, int color);
inline int wrap(int num, int modul);
inline int min(int a, int b);
void console_log(char* str);
float js_sin(float angle);
float js_cos(float angle);
float js_tan(float angle);

//Game Environment Variables
int render_distance = 150;
float vision_field = 0.785398; //45 degress in radians
float tan_half_vision_field = 0.41421356237; //tangent of 22.5 degrees (used in rendering)
float player_speed = 1.0;
float horizon = 255.0;
float scale_height = 200.0;
float rotation_speed = 0.05;
int background_color = 0xFFF5C9AE;

//Game Variables
float px = 50;
float py = 50;
float pa = PI_OVER_TWO;
float pdx = 0.0;
float pdy = 1.0;
float player_height = 150.0;


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
int player_size = 0;

//Map Canvas Variables
uint8_t* map_canvas;
int map_canvas_width = 0;
int map_canvas_height = 0;
int map_canvas_depth = 0;

//setter functions
void EMSCRIPTEN_KEEPALIVE setPlayerHeight(float height){
    player_height = height;
}

void EMSCRIPTEN_KEEPALIVE setRenderDistance(int rdist){
    render_distance = rdist;
}

void EMSCRIPTEN_KEEPALIVE setHorizon(int new_horizon){
    horizon = new_horizon;
}

void EMSCRIPTEN_KEEPALIVE setVisionField(float degrees){
    vision_field = degrees * DEGREES_TO_RADIANS;
    tan_half_vision_field = js_tan(vision_field * .5);
}

void EMSCRIPTEN_KEEPALIVE setBackgroundColor(int color){
    background_color = color;
}


//game functions
void EMSCRIPTEN_KEEPALIVE move_player(uint8_t keyCode, float p_speed){    
    switch(keyCode){
        case 0: //Left Arrow
            pa -= p_speed;
            pdx = js_cos(pa);
            pdy = js_sin(pa);
            break;
        case 1: //Right Arrow
            pa += p_speed;
            pdx = js_cos(pa);
            pdy = js_sin(pa);
            break;
        case 2: //Up Arrow
            px += pdx * p_speed;
            py += pdy * p_speed;
            break;
        case 3: //Down Arrow
            px -= pdx * p_speed;
            py -= pdy * p_speed;
            break;
        case 4:
            player_height += p_speed;
            break;
        case 5:
            player_height -= p_speed;
            break;
    }

    pa = (pa >= 0) ? fmodf(pa,TWO_PI) : (fmodf(pa,TWO_PI) + TWO_PI);
    px = (px >= 0) ? fmodf(px, map_width) : (fmodf(px,map_width) + map_width);
    py = (py >= 0) ? fmodf(py, map_height) : (fmodf(py, map_height) + map_height);
    player_height = fmaxf(player_height, 0.0);
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
}

void EMSCRIPTEN_KEEPALIVE set_map_canvas(int width, int height, int depth, int ptr){
    map_canvas_width = width;
    map_canvas_height = height;
    map_canvas_depth = depth;
    map_canvas = (uint8_t*)ptr;
    player_size = min(map_canvas_width,map_canvas_height) / 28;
}

void EMSCRIPTEN_KEEPALIVE render(){
    // int arr_len = (canvas_width * canvas_height * canvas_depth) >> 2;
    // for(int i = 0; i < arr_len;i++){
    //     ((int*)canvas)[i] = ((int*)map)[i];
    // }

    float x_step = (float)map_width / (float)canvas_width ;
    float y_step = (float)map_height / (float)canvas_height;
    float map_y = 0.0;
    int alpha = 0xFFB0B0B0;


    for (int y = 0; y < canvas_height;y++){
        float map_x = 0.0;
        for (int x = 0; x < canvas_width;x++){
            *(int*)(canvas + (y * canvas_width + x) * 4) = (*(int*)(map + (((int)map_y) * map_width + (((int)map_x))) * 4)) | alpha;
            map_x += x_step; 
        }
        map_y += y_step;
    }
    
    //0xAFFFFFFF;

    for (int x = (int)px; x < (int)px + 11;x++){
        for (int y = (int)py;y < (int)py + 11;y++){
            int idx = y * canvas_width * 4 + x * 4;
            canvas[idx + 0] = 0;
            canvas[idx + 1] = 0;
            canvas[idx + 2] = 0;
            canvas[idx + 3] = 255;
        }
    }
    plotLine((int)(px + 5),(int)(py+5),(int)((px+5) + pdx * 50),(int)((py+5) + pdy * 50),0xFF000000);
}

void EMSCRIPTEN_KEEPALIVE render_voxel_space(){
    fillRectCanvas(0,canvas_height -1, canvas_width,canvas_height,background_color);
    const float dist = tan_half_vision_field * render_distance;
    const float col_step = canvas_width / floor(2 * dist + 1);
    float col = 0;

    float point_x = px + pdx * render_distance;
    float point_y = py + pdy * render_distance;

    //we are getting perp vector so we swap pdx and pdy and make one negative
    float perp_x = point_x + pdy * dist; //gets perpendicular vector to pdx,pdy line render_distance away
    float perp_y = point_y - pdx * dist; 

    //fillRectCanvas(0,canvas_height - 1, 100,100, 0xFF5500A1);
    for(int j = 0; j < floor(2 * dist + 1); j++){
        // float vx = (perp_x - px) / render_distance;
        // float vy = (perp_y - py) / render_distance;
        float vx = (perp_x - px);
        float vy = (perp_y - py);
        int line_dist = ceil(sqrt(pow(vx,2) + pow(vy,2)));
        vx /= line_dist;
        vy /= line_dist;

        float sx = px + vx;
        float sy = py + vy;

        int max_col_height = 0;
        for(int i = 0; i < line_dist;i++){
            int idx = (wrap((int)sy,map_height) * map_width + wrap((int)sx,map_width)) * 4;
            int distform = (int)((-player_height + (map[idx+3])) / sqrt(pow(py - sy,2) + pow(px - sx,2)) * scale_height + horizon);
            if (distform > max_col_height){
                int color = 0xFF000000 | *((int*)(map + idx)); //get color with alpha channel to 255
                int y = canvas_height - max_col_height - 1;
                int w = ceil(col_step);
                int h = (distform - max_col_height);
                fillRectCanvas((int)col,y,w,h,color);
                max_col_height = distform;
            }
            sx += vx;
            sy += vy;
        }
        col += col_step;
        perp_x -= pdy;
        perp_y += pdx;
    }
    //convertCanvasToBoxFilterBlur();
    //convertCanvasToAtkinsonDither();
    //convertCanvasToGrayScale();
}

void EMSCRIPTEN_KEEPALIVE render_map(){
    float x_ratio = (float)map_width / (float)map_canvas_width;
    float y_ratio = (float)map_height / (float)map_canvas_height;
    
    float map_y = 0;
    for (int y = 0; y < map_canvas_height;y++){
        float map_x = 0;
        for(int x = 0; x < map_canvas_width; x++){
            int cmap_idx = (y * map_canvas_width + x) * 4;
            int map_idx = (floor(map_y) * map_width + floor(map_x)) * 4;
            *(int*)(map_canvas + cmap_idx) = 0xFF000000 | *(int*)(map + map_idx);
            map_x += x_ratio;
        }
        map_y += y_ratio;
    }

    int player_x0 = floor(px / x_ratio);
    int player_y0 = floor(py / y_ratio);
    int player_x1 = floor((px + pdx * 30) / x_ratio);
    int player_y1 = floor((py + pdy * 30) / y_ratio);
    fillRectMapCanvas(player_x0 - (player_size >> 1) ,player_y0 + (player_size >> 1),player_size,player_size,0xAFF0FFFF);
    plotLine(player_x0, player_y0, player_x1, player_y1, 0xAFF0FFFF);


}

void convertCanvasToGrayScale(){
    for (int y = 0; y < canvas_height; y++){
        for (int x = 0; x < canvas_width;x++){
            int idx = (y * canvas_width + x) * 4;
            uint8_t r = canvas[idx + 0];
            uint8_t g = canvas[idx + 1];
            uint8_t b = canvas[idx + 2];
            uint8_t avg = floor((r + g + b) / 3.0);
            *(int*)(canvas + idx) = 0xFF000000 | (avg << 16) | (avg << 8) | (avg);
        }
    }
}

void addToCanvasPixelInt(int x, int y,int val){
    if (!(y >= 0 && y < canvas_height && x >= 0 && x < canvas_width))
        return;
    int idx = (y * canvas_width + x) * 4;
    int canvas_val = *(int*)(canvas + idx);
    *(int*)(canvas + idx) += val;
}

void convertCanvasToAtkinsonDither(){
    for (int y = 0; y < canvas_height; y++){
        for (int x = 0; x < canvas_width;x++){
            int idx = (y * canvas_width + x) * 4;
            uint8_t r = canvas[idx + 0];
            uint8_t g = canvas[idx + 1];
            uint8_t b = canvas[idx + 2];
            uint8_t avg = floor((r + g + b) / 3.0);
            *(int*)(canvas + idx) = (int)avg;
        }
    }

    for (int y = 0; y < canvas_height; y++){
        for (int x = 0; x < canvas_width;x++){
            int idx = (y * canvas_width + x) * 4;
            int old_val = *(int*)(canvas + idx);
            int new_val = (old_val > 128) ? 255 : 0;
            int error = (old_val - new_val) >> 3;
            addToCanvasPixelInt(x + 1,y,error);
            addToCanvasPixelInt(x + 2,y,error);
            addToCanvasPixelInt(x - 1,y+1,error);
            addToCanvasPixelInt(x,y+1,error);
            addToCanvasPixelInt(x+1,y+1,error);
            addToCanvasPixelInt(x,y+2,error);
            uint8_t bit = (uint8_t)new_val;
            *(int*)(canvas + idx) = 0xFF000000 | (bit << 16) | (bit << 8) | (bit);
        }
    }

}

void convertCanvasToBoxFilterBlur(){
    for (int y = 0; y < canvas_height; y++){
        for (int x = 0; x < canvas_width;x++){
            int idx = (y * canvas_width + x) * 4;
            int r = 0;
            int b = 0;
            int g = 0;
            for (int dy = 0; dy < 11;dy++){
                for(int dx = 0; dx < 11; dx++){
                    int color = get_canvas_color(x - 5 + dx, y - 5 + dy);
                    r += (color & 0x000000FF);
                    g += (color & 0x0000FF00) >> 8;
                    b += (color & 0x00FF0000) >> 16;
                }
            }
            r >>= 7;
            g >>= 7;
            b >>= 7;
            int avg = 0xFF000000 | (b << 16) | (g << 8) | r;
            *(int*)(canvas + idx) = avg;
        }
    }
}

int get_canvas_color(int x, int y){
    if (!(x >= 0 && x < canvas_width && y >= 0 && y < canvas_height))
        return 0;
    int idx = (y * canvas_width + x) * 4;
    return *(int*)(canvas + idx);
}

void fillRectCanvas(int x,int y,int w,int h, int color){
    for (int dx = 0; dx < w; dx++){
        for(int dy = 0; dy < h;dy++){
            int idx = (wrap(y-dy,canvas_height) * canvas_width + wrap(x + dx,canvas_width)) * 4;
            *((int*)(canvas + idx)) = color;
        }
    }
}   

void fillRectMapCanvas(int x,int y,int w,int h, int color){
    for (int dx = 0; dx < w; dx++){
        for(int dy = 0; dy < h;dy++){
            int idx = (wrap(y-dy,map_canvas_height) * map_canvas_width + wrap(x + dx,map_canvas_width)) * 4;
            *((int*)(map_canvas + idx)) = color;
        }
    }
}

inline int wrap(int num, int modul){
    int res = num % modul;
    if (res < 0)
        res += modul;
    return res;
}

inline int min(int a, int b) {
    return (a < b) ? a : b;
}

//Bresenham's Line algorithm
void plotLine(int x0,int y0,int x1,int y1, int color){
    int dx = abs(x1 - x0);
    int sx = (x0 < x1) ? 1 : -1;
    int dy = -abs(y1-y0);
    int sy = (y0 < y1) ? 1 : -1;
    int error = dx + dy;
    while (1==1){
        int idx = (wrap(y0,map_canvas_height) * map_canvas_width + wrap(x0,map_canvas_width)) * map_canvas_depth  >> 2;
        ((int*)map_canvas)[idx] = color;
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