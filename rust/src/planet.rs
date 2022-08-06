use web_sys;

macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

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

fn calculate_pythagorean(a: f32, b: f32) -> f32 {
    (a.powf(2.0) + b.powf(2.0)).sqrt()
}

pub struct Planet {
    pub radius: f32,
    pub eccentricity: f32,
    semi_major_axis: f32,
}

impl Planet {
    pub fn new(radius: f32, initial_x: f32, initial_y: f32, semi_major_axis: f32) -> Planet {
        Planet {
            radius,
            semi_major_axis,
            eccentricity: calculate_eccentricity(initial_x, initial_y, semi_major_axis),
        }
    }
}
