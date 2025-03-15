#define PAGE_SIZE 65536

#define WASM_EXPORT(name) \
  __attribute__((export_name(#name))) \
  name

typedef unsigned char u8;

extern u8 __heap_base;
extern u8 __data_end;

u8* heap_top_ptr = &__heap_base;

void* WASM_EXPORT(mallocate)(int bytes){
    u8* malloc_ptr = heap_top_ptr;
    heap_top_ptr += bytes;
    return (void*)malloc_ptr;
}

u8* WASM_EXPORT(heap_base)(){
    return &__heap_base;
}

void WASM_EXPORT(grow)(int pages){
    __builtin_wasm_memory_grow(0,pages);
}

u8 WASM_EXPORT(test)(u8* address){
   return address[0];
}




