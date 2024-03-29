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
    translation: [f32; 2],
    direction: Direction,
}

impl Planet {
    pub fn new(radius: f32, initial_x: f32, initial_y: f32, semi_major_axis: f32) -> Planet {
        set_panic_hook();
        Planet::validate(initial_x, initial_y, semi_major_axis);

        let eccentricity = calculate_eccentricity(initial_x, initial_y, semi_major_axis);
        let semi_minor_axis = calculate_semi_minor_axis(semi_major_axis, eccentricity);
        let angle = calculate_angle(initial_x, initial_y);
        let standard_coords = [semi_major_axis, 0.0];

        let transformed_coords =
            Planet::transform_standard_coords(standard_coords, [0.0, 0.0], angle);
        let x_translation = transformed_coords[0] - initial_x;
        let y_translation = transformed_coords[1] - initial_y;

        log!(
            "x translation {} y translation {}",
            x_translation,
            y_translation
        );
        log!("initial x {} initial y {}", initial_x, initial_y);

        log!(
            "transformed coords without translation {:?}",
            Planet::transform_standard_coords(standard_coords, [0.0, 0.0], angle)
        );
        log!(
            "transformed coords with translation {:?}",
            Planet::transform_standard_coords(
                standard_coords,
                [x_translation, y_translation],
                angle
            )
        );

        Planet {
            radius,
            semi_major_axis,
            semi_minor_axis,
            angle,
            standard_coords,
            direction: Direction::Left,
            translation: [x_translation, y_translation],
        }
    }

    fn validate(initial_x: f32, initial_y: f32, semi_major_axis: f32) {
        let perihelion = calculate_perihelion(initial_x, initial_y);
        if perihelion >= semi_major_axis {
            panic!("Perihelion cannot be larger than the semi major axis");
        }
    }

    pub fn tick(&mut self) -> [f32; 2] {
        let x_distance = self.get_x_distance();
        self.direction = self.get_next_direction(x_distance);

        let next_standard_x = self.get_next_standard_x(x_distance, self.direction);
        let next_standard_y = self.get_next_standard_y(next_standard_x, self.direction);
        self.standard_coords = [next_standard_x, next_standard_y];

        Planet::transform_standard_coords(self.standard_coords, self.translation, self.angle)
    }

    fn get_x_distance(&mut self) -> f32 {
        let mut x_distance = 0.007;
        let standard_y = self.standard_coords[1];

        loop {
            let next_direction = self.get_next_direction(x_distance);

            let next_standard_x = self.get_next_standard_x(x_distance, next_direction);
            let next_standard_y = self.get_next_standard_y(next_standard_x, next_direction);

            let y_distance = (next_standard_y - standard_y).abs();

            if y_distance < 0.01 {
                break;
            }
            x_distance = x_distance * 0.9;
        }

        x_distance
    }

    fn get_next_standard_x(&self, x_distance: f32, direction: Direction) -> f32 {
        let standard_x = self.standard_coords[0];
        let x_movement = match direction {
            Direction::Left => -x_distance,
            Direction::Right => x_distance,
        };

        standard_x + x_movement
    }

    fn get_next_standard_y(&self, next_standard_x: f32, direction: Direction) -> f32 {
        let next_standard_y = (self.semi_minor_axis
            * (self.semi_major_axis.powi(2) - next_standard_x.powi(2)).sqrt())
            / self.semi_major_axis;

        match direction {
            Direction::Left => next_standard_y,
            Direction::Right => -next_standard_y,
        }
    }

    fn get_next_direction(&self, x_distance: f32) -> Direction {
        let standard_x = self.standard_coords[0];

        if standard_x < -self.semi_major_axis || standard_x > self.semi_major_axis {
            panic!("Planet is out of bounds");
        }

        match self.direction {
            Direction::Left if (standard_x - x_distance) < -self.semi_major_axis => {
                Direction::Right
            }
            Direction::Right if (standard_x + x_distance) > self.semi_major_axis => Direction::Left,
            _ => self.direction,
        }
    }

    // rotate and translate
    // https://math.stackexchange.com/a/434482
    fn transform_standard_coords(
        standard_coords: [f32; 2],
        translation: [f32; 2],
        angle: f32,
    ) -> [f32; 2] {
        let standard_x = standard_coords[0];
        let standard_y = standard_coords[1];

        let rotated_x = (standard_x * angle.cos()) - (standard_y * angle.sin());
        let rotated_y = (standard_y * angle.cos()) + (standard_x * angle.sin());

        [rotated_x - translation[0], rotated_y - translation[1]]
    }
}
