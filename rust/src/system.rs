use crate::{bytestream::ByteStream, planet::Planet};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct System {
    planets: Vec<Planet>,
}

#[wasm_bindgen]
impl System {
    #[wasm_bindgen(constructor)]
    pub fn new() -> System {
        let planets = vec![Planet::new(0.0, 0.0, "Sun", 1.0)];
        System { planets }
    }

    #[wasm_bindgen(js_name = "getPlanetCoordinates")]
    pub fn planets_coordinates(&self) -> ByteStream {
        let mut planet_slices: Vec<u8> = vec![];
        for planet in &self.planets {
            let slice = planet.as_slice();
            for value in slice {
                let bytes = value.to_ne_bytes();
                planet_slices.extend(bytes);
            }
        }
        let stream = ByteStream::new(&planet_slices);
        stream
    }
}
