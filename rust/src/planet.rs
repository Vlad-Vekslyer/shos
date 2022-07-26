pub struct Planet {
    radius: f32,
    x: f32,
    y: f32,
    name: &'static str,
}

impl Planet {
    pub fn new(x: f32, y: f32, name: &'static str, radius: f32) -> Planet {
        Planet { x, y, name, radius }
    }
    pub fn as_slice(&self) -> [f32; 3] {
        [self.radius, self.x, self.y]
    }
}
