#include <emscripten.h>
#include <stdlib.h>

EM_JS(void, js_console_log, (char* str),{});
EM_JS(float, js_sin, (float angle),{});
EM_JS(float, js_cos, (float angle),{});
EM_JS(float, js_tan, (float angle),{});

void* EMSCRIPTEN_KEEPALIVE wasmmalloc(size_t n){
    return malloc(n);
}

void EMSCRIPTEN_KEEPALIVE wasmfree(void* ptr){
    free(ptr);
}

void* EMSCRIPTEN_KEEPALIVE wasmrealloc(void* ptr, size_t n){
    return realloc(ptr,n);
}

void console_log(char* str){
    js_console_log(str);
}