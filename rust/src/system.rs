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
    planets: Vec<Planet>,
    planet_slices: Vec<f32>,
}

#[wasm_bindgen]
impl System {
    #[wasm_bindgen(constructor)]
    pub fn new() -> System {
        let planets = vec![Planet::new(0.0, 0.0, 0.2)];

        let mut planet_slices: Vec<f32> = vec![];
        for planet in &planets {
            let slice = planet.as_slice();
            for value in slice {
                planet_slices.push(value);
            }
        }

        System {
            planets,
            planet_slices,
        }
    }

    #[wasm_bindgen(js_name = "getPlanetCoordinates")]
    pub fn planets_coordinates(&self) -> ByteStream {
        log!("{:?}", self.planet_slices);
        let stream = ByteStream::new(&self.planet_slices);
        stream
    }
}
