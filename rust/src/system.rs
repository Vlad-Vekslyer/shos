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

impl System {
    fn update_planet_slices(&mut self) {
        let mut planet_slices: Vec<f32> = vec![];
        for planet in &self.planets {
            let slice = planet.as_slice();
            for value in slice {
                planet_slices.push(value);
            }
        }
        self.planet_slices = planet_slices;
    }
}

#[wasm_bindgen]
impl System {
    #[wasm_bindgen(constructor)]
    pub fn new() -> System {
        let planets = vec![Planet::new(0.0, 0.0, 0.2), Planet::new(0.2, 0.0, 0.1)];

        let mut system = System {
            planets,
            planet_slices: vec![],
        };
        system.update_planet_slices();
        system
    }

    #[wasm_bindgen(js_name = "getPlanetCoordinates")]
    pub fn planets_coordinates(&self) -> ByteStream {
        log!("{:?}", self.planet_slices);
        let stream = ByteStream::new(&self.planet_slices);
        stream
    }
}
