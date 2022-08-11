use web_sys;

use crate::utils::set_panic_hook;

macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

// https://www.mathsisfun.com/algebra/trig-solving-sss-triangles.html
fn calculate_angle(initial_x: f32, initial_y: f32) -> f32 {
    if initial_y == 0.0 {
        return 0.0;
    }

    let side_a = initial_y.abs();
    let side_c = initial_x.abs();
    let side_b = calculate_pythagorean(side_a, side_c);

    log!("sides a{} b{} c{}", side_a, side_b, side_c);

    let angle =
        ((side_b.powi(2) + side_c.powi(2) - side_a.powi(2)) / (2.0 * side_b * side_c)).acos();

    log!("angle {}(radians)", angle);
    angle
}

fn calculate_perihelion(initial_x: f32, initial_y: f32) -> f32 {
    let is_at_angle = initial_y != 0.0;
    match is_at_angle {
        false => initial_x.abs(),
        true => calculate_pythagorean(initial_y.abs(), initial_x.abs()),
    }
}

// https://sciencing.com/calculate-period-orbit-5840979.html
fn calculate_eccentricity(initial_x: f32, initial_y: f32, semi_major_axis: f32) -> f32 {
    let perihelion = calculate_perihelion(initial_x, initial_y);
    let aphelion = (semi_major_axis * 2.0) - perihelion;
    log!("aphelion {}", aphelion);
    log!("perihelion {}", perihelion);

    log!(
        "eccentricity {}",
        (aphelion - perihelion) / (aphelion + perihelion)
    );
    (aphelion - perihelion) / (aphelion + perihelion)
}

// https://en.wikipedia.org/wiki/Semi-major_and_semi-minor_axes
fn calculate_semi_minor_axis(semi_major_axis: f32, eccentricity: f32) -> f32 {
    log!(
        "semi_minor_axis {}",
        semi_major_axis * (1.0 - eccentricity.powi(2)).sqrt()
    );
    semi_major_axis * (1.0 - eccentricity.powi(2)).sqrt()
}

fn calculate_pythagorean(a: f32, b: f32) -> f32 {
    (a.powi(2) + b.powi(2)).sqrt()
}

#[derive(Copy, Clone)]
enum Direction {
    Left,
    Right,
}

pub struct Planet {
    pub radius: f32,
    semi_major_axis: f32,
    semi_minor_axis: f32,
    angle: f32,
    //  keep track of planet coordinates as if the orbit followed the standard ellipse equation.
    //  these coordinates then get transformed to match the actual ellipse equation of the orbit
    // https://www.maa.org/external_archive/joma/Volume8/Kalman/General.html
    standard_coords: [f32; 2],
    direction: Direction,
}

impl Planet {
    pub fn new(radius: f32, initial_x: f32, initial_y: f32, semi_major_axis: f32) -> Planet {
        set_panic_hook();
        Planet::validate(initial_x, initial_y, semi_major_axis);

        let eccentricity = calculate_eccentricity(initial_x, initial_y, semi_major_axis);
        let semi_minor_axis = calculate_semi_minor_axis(semi_major_axis, eccentricity);
        let angle = calculate_angle(initial_x, initial_y);

        Planet {
            radius,
            semi_major_axis,
            semi_minor_axis,
            angle,
            standard_coords: [semi_major_axis, 0.0],
            direction: Direction::Left,
        }
    }

    fn validate(initial_x: f32, initial_y: f32, semi_major_axis: f32) {
        let perihelion = calculate_perihelion(initial_x, initial_y);
        if perihelion >= semi_major_axis {
            panic!("Perihelion cannot be larger than the semi major axis");
        }
    }

    pub fn tick(&mut self) -> [f32; 2] {
        let x_movement = 0.01;
        self.update_direction(x_movement);

        let x_addition = match self.direction {
            Direction::Left => -x_movement,
            Direction::Right => x_movement,
        };

        let standard_x = self.standard_coords[0];
        let next_standard_x = standard_x + x_addition;
        self.update_standard_coords(next_standard_x);

        self.transform_standard_coords()
    }

    fn update_standard_coords(&mut self, next_standard_x: f32) {
        let next_standard_y = (self.semi_minor_axis
            * (self.semi_major_axis.powi(2) - next_standard_x.powi(2)))
            / self.semi_major_axis;

        self.standard_coords = [next_standard_x, next_standard_y];
    }

    fn update_direction(&mut self, x_movement: f32) {
        let standard_x = self.standard_coords[0];
        self.direction = match self.direction {
            Direction::Left if (standard_x - x_movement) < -self.semi_major_axis => {
                Direction::Right
            }
            Direction::Right if (standard_x + x_movement) > self.semi_major_axis => Direction::Left,
            _ => self.direction,
        };
    }

    // rotate and translate
    fn transform_standard_coords(&self) -> [f32; 2] {
        // TODO: translate x to the left
        let standard_x = self.standard_coords[0];
        let standard_y = self.standard_coords[1];
        let transformed_x = (standard_x * self.angle.cos()) - (standard_y * self.angle.sin());
        let transformed_y = (standard_y * self.angle.cos()) + (standard_x * self.angle.sin());
        [transformed_x, transformed_y]
    }
}
