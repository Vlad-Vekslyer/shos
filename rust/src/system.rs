use crate::{bytestream::ByteStream, planet::Planet};
use wasm_bindgen::prelude::*;
use web_sys;

macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

#[wasm_bindgen]
pub struct System {
    planet_count: usize,
    planet_slices: Vec<f32>,
}

impl System {
    fn get_planet_slice(&self, planet_num: usize) -> [f32; 3] {
        let starting_index = planet_num * 3;
        [
            self.planet_slices[starting_index],
            self.planet_slices[starting_index + 1],
            self.planet_slices[starting_index + 2],
        ]
    }
}

#[wasm_bindgen]
impl System {
    #[wasm_bindgen(constructor)]
    pub fn new() -> System {
        let planets = vec![Planet::new(0.0, 0.0, 0.2), Planet::new(0.2, 0.0, 0.1)];

        let mut planet_slices: Vec<f32> = vec![];
        for planet in &planets {
            let slice = planet.as_slice();
            for value in slice {
                planet_slices.push(value);
            }
        }

        System {
            planet_slices,
            planet_count: planets.len(),
        }
    }

    #[wasm_bindgen(js_name = "getPlanetCoordinates")]
    pub fn planets_coordinates(&self) -> ByteStream {
        log!("{:?}", self.planet_slices);
        let stream = ByteStream::new(&self.planet_slices);
        stream
    }
}
