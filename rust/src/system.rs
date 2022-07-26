use crate::{bytestream::ByteStream, planet::Planet};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
struct System {
    planets: Vec<Planet>,
}

#[wasm_bindgen]
impl System {
    #[wasm_bindgen(constructor)]
    pub fn new(&mut self) {
        self.planets = vec![Planet::new(0.0, 0.0, "Sun", 1.0)]
    }

    pub fn planets(&self) -> ByteStream {
        let mut planet_slices: Vec<f32> = vec![];
        for planet in &self.planets {
            let slice = planet.as_slice();
            for value in slice {
                planet_slices.push(value);
            }
        }
        let stream = ByteStream::new(planet_slices.as_slice());
        stream
    }
}