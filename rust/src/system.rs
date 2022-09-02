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
    planets_coords: Vec<f32>,
}

impl System {
    fn get_planet_coords(&self, planet_num: usize) -> [f32; 2] {
        let starting_index = planet_num * 2;
        [
            self.planets_coords[starting_index],
            self.planets_coords[starting_index + 1],
        ]
    }

    fn set_planet_coords(&mut self, planet_num: usize, coords: [f32; 2]) {
        let starting_index = planet_num * 2;
        self.planets_coords[starting_index] = coords[0];
        self.planets_coords[starting_index + 1] = coords[1];
    }
}

#[wasm_bindgen]
impl System {
    #[wasm_bindgen(constructor)]
    pub fn new() -> System {
        let planets = vec![
            Planet::new(0.1, 0.2, 0.5, 1.0),
            Planet::new(0.2, 0.5, 1.0, 1.5),
        ];
        let planets_coords: Vec<f32> = vec![0.2, -0.5, 0.5, -1.0];
        // let planets_coords: Vec<f32> = vec![0.2, -0.5];

        if planets.len() * 2 != planets_coords.len() {
            panic!("Planet coordinates length must equal the number of planets by 2");
        }

        System {
            planets_coords,
            planets,
        }
    }

    #[wasm_bindgen(js_name = "getInitialPlanetData")]
    pub fn initial_planet_data(&self) -> JsValue {
        let mut data: Vec<f32> = vec![];

        for index in 0..self.planets.len() {
            let planet = &self.planets[index];
            let coords = self.get_planet_coords(index);

            data.push(coords[0]);
            data.push(coords[1]);
            data.push(planet.radius)
        }
        JsValue::from_serde(&data).unwrap()
    }

    #[wasm_bindgen(js_name = "getPlanetCoordinates")]
    pub fn planets_coordinates(&self) -> ByteStream {
        ByteStream::new(&self.planets_coords)
    }

    pub fn tick(&mut self) -> ByteStream {
        for index in 0..self.planets.len() {
            let [new_x, new_y] = self.planets[index].tick();
            self.set_planet_coords(index, [new_x, -new_y]);
        }
        self.planets_coordinates()
    }
}
