build: render.c
	clang -O2 --target=wasm32 --no-standard-libraries -mbulk-memory -Wl,--no-entry -Wl,--import-memory -o render.wasm render.c

wasm: render2.c util.c
	emcc render2.c util.c -o render.wasm --no-entry -O2 -s STANDALONE_WASM=1 -s IMPORTED_MEMORY=1 -s INITIAL_MEMORY=131072 -s ALLOW_MEMORY_GROWTH=1
