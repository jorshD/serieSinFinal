// / Boid class
// Methods for Separation, Cohesion, Alignment added

function Boid(x,y) {
  this.acceleration = p5.Vector.random2D();
  this.velocity = p5.Vector.random2D();
  this.position = createVector(x,y);
  this.r = random(28,380);
  this.maxspeed = random(0.5);    // Maximum speed
  this.maxforce = random(50); // Maximum steering force
  this.t = random(0.0002, 0.002);
  this.co = random(255);
}

Boid.prototype.run = function(boids) {
  this.flock(boids);
  this.update();
  // this.borders();
  this.render();
  // for(let i = 0 ; i < boids.length ; i ++){
  //
  //   if (this.intersects(boids[i])) {
  //     this.render(boids[i]);
  //
  //   }
  // }
}

Boid.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

Boid.prototype.intersects = function(other){

    let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      return d < (this.r + other.r);

}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
  var sep = this.separate(boids);   // Separation
  var ali = this.align(boids);      // Alignment
  var coh = this.cohesion(boids);   // Cohesion
  let pos = createVector(width/2, height/2);
  let seek = this.seek(pos);
  // Arbitrarily weight these forces
  sep.mult(map(cos(frameCount/150),-1, 1, 1 ,41055));
  ali.mult(map(cos(frameCount/50),-1, 1, 1 ,5));
  coh.mult(map(cos(frameCount/50),-1, 1, 1 ,50));
  seek.mult(map(cos(frameCount/50),-1, 1, 1 ,5105));
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
  this.applyForce(seek);
  // this.applyForce(seek);
}

// Method to update location
Boid.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.mult(0);
}

Boid.prototype.render = function() {

  // Draw a triangle rotated in the direction of velocity
  var theta = this.velocity.heading() + radians(90);

  let col = map(cos(frameCount/204),-1, 1, 0 ,255);
  // let col = map(this.r, 0, this.r, 0 ,255);
  // print(col);
  fill(col,2);
  stroke(col,2);
  // strokeWeight(4.9);
  push();
  translate(this.position.x,this.position.y);
  rotate(theta);
  beginShape();
  // vertex(0, -this.r);
  vertex(-this.r, this.r*2);
  vertex(this.r, this.r*2);
  endShape(CLOSE);
  pop();
  ellipse(this.position.x, this.position.y,this.r/2);
    // line(this.position.x, this.position.y, boids.position.x, boids.position.y);
  // this.r = lerp(this.r, 0, 0.0005);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
  var desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  var steer = p5.Vector.sub(desired,this.velocity);
  steer.limit(this.maxforce);  // Limit to maximum steering force
  return steer;
}



// Wraparound
Boid.prototype.borders = function() {
  if (this.position.x < -this.r)  this.position.x = width +this.r;
  if (this.position.y < -this.r)  this.position.y = height+this.r;
  if (this.position.x > width +this.r) this.position.x = -this.r;
  if (this.position.y > height+this.r) this.position.y = -this.r;
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
  var desiredseparation = 1080;
  var steer = createVector(0,0);
  var count = 0;
  // For every boid in the system, check if it's too close
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      var diff = p5.Vector.sub(this.position,boids[i].position);
      diff.normalize();
      diff.div(d);        // Weight by distance
      steer.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;

}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
  var neighbordist = 50;
  var sum = createVector(0,0);
  var count = 0;
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    var steer = p5.Vector.sub(sum,this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0,0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
  var neighbordist = 50 ;
  var sum = createVector(0,0);   // Start with empty vector to accumulate all locations
  var count = 0;
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);  // Steer towards the location
  } else {
    return createVector(0,0);
  }
}
