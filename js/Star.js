////////////////////////////////////////////////////////////////////////////////
// Star class //
////////////////////////////////////////////////////////////////////////////////

function Star(){
  this.mass =  this.mass || 1;
  this.position = this.position || new THREE.Vector3();
  this.velocity = this.velocity || new THREE.Vector3();
  this.acc = this.acc || new THREE.Vector3();
  this.type = this.type || "star";
  this.rotationSpeed = 0;
  this.rotationAxis = new THREE.Vector3(0, 0, 1);
}

Star.prototype.copy = function(other){
  this.mass =  other.mass;
  this.position.copy(other.position);
  this.velocity.copy(other.velocity);
  this.acc.copy(other.acc);
  this.type =  other.type;
}

Star.prototype.toString = function(){
  var string = "<Star> mass = " + this.mass.toFixed(2) +
    " position = [" + this.position.x.toFixed(2) + ", " + this.position.y.toFixed(2) + ", " + this.position.z.toFixed(2) +
    "] velocity = [" + this.velocity.x.toFixed(2) + ", " + this.velocity.y.toFixed(2) + ", " + this.velocity.z.toFixed(2) + "]";
  return string;
}

////////////////////////////////////////////////////////////////////////////////
// Star.orbitAround
// set the position and velocity of self to orbit around another star
// the star argument needs to have a mass, velocity, position
// orbitAxis default to be x axis
////////////////////////////////////////////////////////////////////////////////

Star.prototype.orbitAround = function(star, orbitRadius, orbitAxis){
  orbitAxis = typeof orbitAxis !== 'undefined' ? orbitAxis : new THREE.Vector3(1, 0, 0);
  var dist = getPerpendicular(orbitAxis);
  dist.normalize();
  dist.multiplyScalar(orbitRadius);
  this.position.addVectors(star.position, dist);
  this.velocity.crossVectors(orbitAxis, dist);
  this.velocity.normalize();
  this.velocity.multiplyScalar(Math.sqrt(GRAVITY_CONSTANT * star.mass / orbitRadius));
  this.velocity.add(star.velocity);
}

////////////////////////////////////////////////////////////////////////////////
// StarStates class //
////////////////////////////////////////////////////////////////////////////////

function StarStates(number){
  number = typeof number !== 'undefined' ? number : 0;
  this.stars = []
  for (var i = 0; i < number; i++)
    this.stars[i] = new Star();
}

StarStates.prototype.copy = function(other){
  this.stars = []
  for (var i = 0; i < other.stars.length; i++)
  {
    this.stars[i] = new Star();
    this.stars[i].copy(other.stars[i]);
  }
}

StarStates.prototype.add = function(other){
  for (var i = 0; i < this.stars.length; i++)
  {
    this.stars[i].position.add(other.stars[i].position);
    this.stars[i].velocity.add(other.stars[i].velocity);
    this.stars[i].acc.add(other.stars[i].acc);
  }
}

StarStates.prototype.multiplyScalar = function(number){
  for (var i = 0; i < this.stars.length; i++)
  {
    this.stars[i].position.multiplyScalar(number);
    this.stars[i].velocity.multiplyScalar(number);
    this.stars[i].acc.multiplyScalar(number);
  }
}

StarStates.prototype.integrate = function(derivative, dt){
  var temp = new THREE.Vector3();
  for (var i = 0; i < this.stars.length; i++)
  {
    temp.copy(derivative.stars[i].velocity);
    temp.multiplyScalar(dt);
    this.stars[i].position.add(temp);
    temp.copy(derivative.stars[i].acc);
    temp.multiplyScalar(dt);
    this.stars[i].velocity.add(temp);
  }
}

StarStates.prototype.calculateAcc = function(){
  var dist = new THREE.Vector3(); // distance vector between two stars
  var temp = new THREE.Vector3();
  for (var i = 0; i < this.stars.length; i++)
  {
    this.stars[i].acc.set(0, 0, 0);
    for (var j = 0; j < this.stars.length; j++)
    {
      if (i == j){
        continue; // don't interact with self
      }
      dist.subVectors(this.stars[j].position, this.stars[i].position);
      temp.copy(dist);
      temp.normalize();
       this.stars[i].acc.add(
        temp.multiplyScalar(GRAVITY_CONSTANT *  this.stars[j].mass / Math.max(dist.lengthSq(), Number.MIN_VALUE))
      );
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// updatePhysicsRK4
// http://gafferongames.com/game-physics/integration-basics/
////////////////////////////////////////////////////////////////////////////////

StarStates.prototype.updatePhysicsRK4 = function(delta)
{
  var derivativeA = evaluateRK4(this, new StarStates(this.stars.length), 0);
  var derivativeB = evaluateRK4(this, derivativeA, 0.5 * delta);
  var derivativeC = evaluateRK4(this, derivativeB, 0.5 * delta);
  var derivativeD = evaluateRK4(this, derivativeC, delta);
  
  var derivative = new StarStates(this.stars.length);
  derivative.add(derivativeB);
  derivative.add(derivativeC);
  derivative.multiplyScalar(2);
  derivative.add(derivativeA);
  derivative.add(derivativeD);
  derivative.multiplyScalar(1.0 / 6.0);
  
  this.integrate(derivative, delta);
}

function evaluateRK4(initStates, derivative, delta)
{
  var states = new StarStates();
  states.copy(initStates);
  states.integrate(derivative, delta);
  states.calculateAcc();
  return states;
}

////////////////////////////////////////////////////////////////////////////////
// updatePhysicsEuler
// calculate the forces and positions
// using Euler's method, assuming the acceleration is constant over the delta time
// new position = 0.5 * a * t^2 + v * t + old position
// new velocity = a * t + old velocity
// coding this simple formula is a pain in the ass because of THREE.js vector functions' side effects
////////////////////////////////////////////////////////////////////////////////

StarStates.prototype.updatePhysicsEuler = function(delta)
{
  var dist = new THREE.Vector3(); // distance vector between two stars
  var temp = new THREE.Vector3();
  this.calculateAcc();
  for (var i = 0; i < this.stars.length; i++)
  {
    temp.copy(this.stars[i].acc);
    this.stars[i].position.add(temp.multiplyScalar(0.5 * delta * delta));
    temp.copy(this.stars[i].velocity);
    this.stars[i].position.add(temp.multiplyScalar(delta));
    temp.copy(this.stars[i].acc);
    this.stars[i].velocity.add(temp.multiplyScalar(delta));
  }
}

////////////////////////////////////////////////////////////////////////////////
// centerOfMass
// returns a obejct with mass, position, velocity
// essentially a star
////////////////////////////////////////////////////////////////////////////////

function centerOfMass(stars) {
  var center = new Star();
  var temp = new THREE.Vector3();
  for (var i = 0; i < stars.length; i++)
  {
    center.mass += stars[i].mass;
    temp.copy(stars[i].position);
    temp.multiplyScalar(stars[i].mass);
    center.position.add(temp);
    temp.copy(stars[i].velocity);
    temp.multiplyScalar(stars[i].mass);
    center.velocity.add(temp);
  }
  center.position.divideScalar(center.mass);
  center.velocity.divideScalar(center.mass);
  return center;
}

////////////////////////////////////////////////////////////////////////////////
// centerOfPositions
////////////////////////////////////////////////////////////////////////////////

function centerOfPositions(stars) {
  var center = new THREE.Vector3();
  for (var i = 0; i < stars.length; i++)
  {
    center.add(stars[i].position);
  }
  center.divideScalar(stars.length);
  return center;
}


