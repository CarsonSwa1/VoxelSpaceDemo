#include <emscripten.h>
#include <stdlib.h>

void* EMSCRIPTEN_KEEPALIVE wasmmalloc(size_t n){
    return malloc(n);
}

void EMSCRIPTEN_KEEPALIVE wasmfree(void* ptr){
    free(ptr);
}

void* EMSCRIPTEN_KEEPALIVE wasmrealloc(void* ptr, size_t n){
    return realloc(ptr,n);
}