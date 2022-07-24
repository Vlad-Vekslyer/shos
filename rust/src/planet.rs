pub struct Planet {
    radius: f32,
    x: f32,
    y: f32,
}

impl Planet {
    pub fn as_slice(&self) -> [f32; 3] {
        [self.radius, self.x, self.y]
    }
}
