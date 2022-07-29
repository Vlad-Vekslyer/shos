pub struct Planet {
    radius: f32,
    x: f32,
    y: f32,
}

impl Planet {
    pub fn new(x: f32, y: f32, radius: f32) -> Planet {
        Planet { x, y, radius }
    }
    pub fn as_slice(&self) -> [f32; 3] {
        [self.radius, self.y, self.x]
    }
}
