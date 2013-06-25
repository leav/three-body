////////////////////////////////////////////////////////////////////////////////
// Global variables
////////////////////////////////////////////////////////////////////////////////

/*global THREE, document, window, Stats, dat*/

var camera, scene, renderer, stats;
var cameraControls;
var clock = new THREE.Clock();

var stars;
var stellarViewMeshes;


////////////////////////////////////////////////////////////////////////////////
// init
////////////////////////////////////////////////////////////////////////////////

function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColorHex( 0x0, 1.0 );
	renderer.shadowMapEnabled = true;

	document.body.appendChild( renderer.domElement );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 35, canvasWidth/ canvasHeight, 1, 4000 );
	camera.position.set( 0, 2000, 0 );

	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0,0,0);

	// STATS
	stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
	document.body.appendChild( stats.domElement );

	fillScene();
  setupGui();
}

////////////////////////////////////////////////////////////////////////////////
// fillScene
////////////////////////////////////////////////////////////////////////////////

function fillScene() {
	scene = new THREE.Scene();

	// LIGHTS
	scene.add( new THREE.AmbientLight( 0x222222 ) )
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  directionalLight.position.set( 1, 1, 1 );
  scene.add( directionalLight );
  
  // stars

  stars = createStableStarSystem();
  stellarViewMeshes = createStarMeshes(stars);
  for (var i = 0; i < stellarViewMeshes.length; i++)
    scene.add(stellarViewMeshes[i]);
  
}

////////////////////////////////////////////////////////////////////////////////
// setupGui
////////////////////////////////////////////////////////////////////////////////

	effectController = {
		speed: 50
	};
  
function setupGui() {
	var gui = new dat.GUI();

	gui.add( effectController, "speed", 0.0, 100.0 ).step(1.0);
}

////////////////////////////////////////////////////////////////////////////////
// createStableStarSystem
// returns a star array with three somewhat stable stars
////////////////////////////////////////////////////////////////////////////////

function createStableStarSystem()
{
  var array = [];
  array[0] = new Star();
  array[0].randMass();
  array[1] = new Star()
  array[1].randMass();
  array[1].orbitAround(array[0], randRange(50, 100), randVector3(1, 1));
  var center = centerOfMass(array);
  array[2] = new Star()
  array[2].randMass();
  array[2].orbitAround(array[0], randRange(1000, 2000), randVector3(1, 1));

  return array;
}

////////////////////////////////////////////////////////////////////////////////
// createStarMeshes
// returns a mesh array for the stars
////////////////////////////////////////////////////////////////////////////////

var starMaterial = new THREE.MeshPhongMaterial( { shininess: 100 } );
function createStarMeshes(stars)
{
  var meshes = [];
  for (var i = 0; i < stars.length; i++)
  {
    meshes[i] = new THREE.Mesh(
      new THREE.SphereGeometry( Math.max(Math.pow(stars[i].mass, 1/3), 1), 32, 16),
      starMaterial );
  }
  return meshes;
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
// Star class
////////////////////////////////////////////////////////////////////////////////

var STAR_POSITION_RANGE = [-100, 100];
var STAR_VELOCITY_RANGE = [-10, 10];
var STAR_MASS_RANGE = [500, 1000];

function Star(){
  this.mass =  this.mass || 1;
  this.position = this.position || new THREE.Vector3();
  this.velocity = this.velocity || new THREE.Vector3();
  this.acc = this.acc || new THREE.Vector3();
}

Star.prototype.randProperties = function(){
  this.randPosition();
  this.randMass();
  this.randVelocity();
  return this;
}

Star.prototype.randPosition = function(){
  this.position.copy(
    randVector3(STAR_POSITION_RANGE[0], STAR_POSITION_RANGE[1])
  );
}

Star.prototype.randMass = function(){
  this.mass = randRange(STAR_MASS_RANGE[0], STAR_MASS_RANGE[1]);
}

Star.prototype.randVelocity = function(){
  this.velocity.copy(
    randVector3(STAR_VELOCITY_RANGE[0], STAR_VELOCITY_RANGE[1])
  );
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
// animate
////////////////////////////////////////////////////////////////////////////////

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

////////////////////////////////////////////////////////////////////////////////
// render
////////////////////////////////////////////////////////////////////////////////

function render() {
	var delta = Math.min(clock.getDelta(), 0.1); // set max delta
  
  updateStars(delta);
  cameraControls.update(delta);
  stats.update();
  renderer.render(scene, camera);
}


////////////////////////////////////////////////////////////////////////////////
// updateStars
////////////////////////////////////////////////////////////////////////////////

function updateStars(delta)
{
  for (var i = 0; i < effectController.speed; i++)
  {
    updateStarPhysics(delta);
  }
  for (var i = 0; i < stars.length; i++)
  {
    stellarViewMeshes[i].position.copy(stars[i].position);
  }
}

////////////////////////////////////////////////////////////////////////////////
// updateStarPhysics
// calculate the forces and positions
// using Euler's method, assuming the acceleration is constant over the delta time
// new position = 0.5 * a * t^2 + v * t + old position
// new velocity = a * t + old velocity
// coding this simple formula is a pain in the ass because of THREE.js vector functions' side effects
////////////////////////////////////////////////////////////////////////////////

var GRAVITY_CONSTANT = 1;
function updateStarPhysics(delta)
{
  var dist = new THREE.Vector3(); // distance vector between two stars
  var temp = new THREE.Vector3();
  for (var i = 0; i < stars.length; i++)
  {
    stars[i].acc.set(0, 0, 0);
    for (var j = 0; j < stars.length; j++)
    {
      if (i == j)
        break; // don't interact with self
      dist.subVectors(stars[j].position, stars[i].position);
      temp.copy(dist);
      temp.normalize();
      
      stars[i].acc.add(
        temp.multiplyScalar(GRAVITY_CONSTANT * stars[j].mass / dist.lengthSq())
      );
    }
  }
  for (var i = 0; i < stars.length; i++)
  {
    temp.copy(stars[i].acc);
    stars[i].position.add(temp.multiplyScalar(0.5 * delta * delta));
    temp.copy(stars[i].velocity);
    stars[i].position.add(temp.multiplyScalar(delta));
    temp.copy(stars[i].acc);
    stars[i].velocity.add(temp.multiplyScalar(delta));
  }
}

////////////////////////////////////////////////////////////////////////////////
// utils
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// log
////////////////////////////////////////////////////////////////////////////////

function log(msg) {
    setTimeout(function() {
        throw new Error(msg);
    }, 0);
}

////////////////////////////////////////////////////////////////////////////////
// randRange
// returns a number between [min, max)
////////////////////////////////////////////////////////////////////////////////

function randRange(min, max)
{
  return Math.random() * (max - min) + min;
}

////////////////////////////////////////////////////////////////////////////////
// randVector3
// returns a Vector3 with randomized xyz
////////////////////////////////////////////////////////////////////////////////

function randVector3(min, max)
{
  return new THREE.Vector3(randRange(min, max), randRange(min, max), randRange(min, max));
}

////////////////////////////////////////////////////////////////////////////////
// get a perpendicular vector
////////////////////////////////////////////////////////////////////////////////

function getPerpendicular(vector)
{
  var result = new THREE.Vector3();
  result.crossVectors(vector, new THREE.Vector3(0, 1, 0));
  if (result.lengthSq() == 0)
    result.crossVectors(vector, new THREE.Vector3(0, 0, 1)); // try a different axis
  return result;
}

////////////////////////////////////////////////////////////////////////////////
// fire up the system
////////////////////////////////////////////////////////////////////////////////

init();
animate();