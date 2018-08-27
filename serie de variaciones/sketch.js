
var flock;

function setup() {
  createCanvas(1900,1900);
    background(11,0);
    // colorMode(HSB);


  // createP("Drag the mouse to generate new boids.");
  // blendMode(REPLACE);
  // blendMode(OVERLAY); // funciona wf01 (42)
  // blendMode(BLEND);
  // blendMode(SCREEN);
  // blendMode(ADD);
  // blendMode(SOFT_LIGHT);
    // blendMode(HARD_LIGHT);
  // blendMode(MULTIPLY);
  // blendMode(DARKEST);
  // blendMode(DODGE); // balnco funcona sobre negro 1 solo tono
  // blendMode(DIFFERENCE);
  // blendMode(LIGHTEST);
  // blendMode(EXCLUSION);
  // blendMode(BURN);


  flock = new Flock();
  // Add an initial set of boids into the system
  for (var i = 0; i < 280; i++) {
    var b = new Boid(width/2,height/2);
    flock.addBoid(b);
  }
}

function draw() {
// background(151);
  flock.run();
}

// Add a new boid into the System
function mouseDragged() {
  flock.addBoid(new Boid(mouseX,mouseY));
}

function mousePressed(){
  saveCanvas("fs", "png");
}
