build: render.c
	clang -O2 --target=wasm32 --no-standard-libraries -mbulk-memory -Wl,--no-entry -Wl,--import-memory -o render.wasm render.c