#include <emscripten.h>
#include <stdlib.h>

EM_JS(void, js_console_log, (char* str),{});

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