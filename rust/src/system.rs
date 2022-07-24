use crate::planet::Planet;
use wasm_bindgen::prelude::*;

struct System {
    planets: Vec<Planet>,
}

#[wasm_bindgen]
impl System {
    pub fn planets(&self) -> *const &[f32] {
        let planet_slices: Vec<f32>;
        for planet in self.planets {
            let slice = planet.as_slice();
            planet_slices.push(slice);
        }
        planet_slices.as_slice().as_ptr()
    }
}
