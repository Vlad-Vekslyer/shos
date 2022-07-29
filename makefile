web-start:
	cd ./react; npm run start

wasm-compile:
	cd ./rust; wasm-pack build --out-dir ../react/src/pkg --target web