use web_sys;

macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

// https://www.mathsisfun.com/algebra/trig-solving-sss-triangles.html
fn calculate_angle(initial_x: f32, initial_y: f32) -> f32 {
    let side_a = initial_x.abs();
    let side_c = initial_y.abs();
    let side_b = calculate_pythagorean(side_a, side_c);

    (side_b.powi(2) + side_c.powi(2) - side_a.powi(2)) / (2.0 * side_b * side_c).acos()
}

// https://sciencing.com/calculate-period-orbit-5840979.html
fn calculate_eccentricity(initial_x: f32, initial_y: f32, semi_major_axis: f32) -> f32 {
    let is_at_angle = initial_y != 0.0;
    let perihelion = match is_at_angle {
        false => initial_x.abs(),
        true => calculate_pythagorean(initial_y.abs(), initial_x.abs()),
    };
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

pub struct Planet {
    pub radius: f32,
    eccentricity: f32,
    semi_major_axis: f32,
    semi_minor_axis: f32,
    angle: f32,
}

impl Planet {
    pub fn new(radius: f32, initial_x: f32, initial_y: f32, semi_major_axis: f32) -> Planet {
        let eccentricity = calculate_eccentricity(initial_x, initial_y, semi_major_axis);
        let semi_minor_axis = calculate_semi_minor_axis(semi_major_axis, eccentricity);
        let angle = calculate_angle(initial_x, initial_y);

        Planet {
            radius,
            semi_major_axis,
            semi_minor_axis,
            eccentricity,
            angle,
        }
    }
    // https://math.stackexchange.com/questions/426150/what-is-the-general-equation-of-the-ellipse-that-is-not-in-the-origin-and-rotate
    pub fn calculate_next_y_coord(&self, next_x: f32, current_y: f32) -> f32 {
        let next_y = (self.semi_minor_axis * (self.semi_major_axis.powi(2) - next_x.powi(2)))
            / self.semi_major_axis;
        0.0
    }
}
