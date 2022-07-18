run-web:
	cd ./react; npm run start

compile-wasm:
	cd ./rust; wasm-pack build --out-dir ../react/src/pkg --target web