use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub struct ByteStream {
    offset: *const f32,
    size: usize,
}

#[wasm_bindgen]
impl ByteStream {
    #[wasm_bindgen(constructor)]
    pub fn new(bytes: &[f32]) -> ByteStream {
        ByteStream {
            offset: bytes.as_ptr(),
            size: bytes.len(),
        }
    }

    pub fn offset(&self) -> *const f32 {
        self.offset
    }

    pub fn size(&self) -> usize {
        self.size
    }
}
