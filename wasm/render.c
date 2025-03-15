#define PAGE_SIZE 65536

#define WASM_EXPORT(name) \
  __attribute__((export_name(#name))) \
  name

typedef unsigned char u8;

extern u8 __heap_base;
extern u8 __data_end;

u8* heap_top_ptr = &__heap_base;

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

u8* WASM_EXPORT(heap_base)(){
    return &__heap_base;
}

void WASM_EXPORT(grow)(int pages){
    __builtin_wasm_memory_grow(0,pages);
}

int WASM_EXPORT(get_pages)(int pages){
    return __builtin_wasm_memory_size(0);
}

int WASM_EXPORT(test)(u8* address){
    int mem = __builtin_wasm_memory_size(0);
    int rem_mem = (mem << 16) - (int)heap_top_ptr;
    return rem_mem;
}






