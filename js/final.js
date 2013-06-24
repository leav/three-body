////////////////////////////////////////////////////////////////////////////////
// Global variables
////////////////////////////////////////////////////////////////////////////////

/*global THREE, document, window, Stats, dat*/

var camera, scene, renderer, stats;
var cameraControls;
var clock = new THREE.Clock();

var stars = []


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
}

////////////////////////////////////////////////////////////////////////////////
// init
////////////////////////////////////////////////////////////////////////////////

function fillScene() {
	scene = new THREE.Scene();

	// LIGHTS
	scene.add( new THREE.AmbientLight( 0x222222 ) )
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  directionalLight.position.set( 1, 1, 1 );
  scene.add( directionalLight );
  
  // stars

  
  for (var i = 0; i < 3; i++)
  {
    stars[i] = createStar();
    scene.add(stars[i]);
  }



}

////////////////////////////////////////////////////////////////////////////////
// init
////////////////////////////////////////////////////////////////////////////////

var starMaterial = new THREE.MeshPhongMaterial( { shininess: 100 } );
var STAR_POSITION_RANGE = [-100, 100];
var STAR_SIZE_RANGE = [5, 20];
var STAR_VELOCITY_RANGE = [-10, 10];
var STAR_MASS_RANGE = [10, 10];
function createStar() {
  star = new THREE.Mesh(
		new THREE.SphereGeometry( randRange(STAR_SIZE_RANGE[0], STAR_SIZE_RANGE[1]), 32, 16),
    starMaterial );
  star.position.set(
    randRange(STAR_POSITION_RANGE[0], STAR_POSITION_RANGE[1]),
    randRange(STAR_POSITION_RANGE[0], STAR_POSITION_RANGE[1]),
    randRange(STAR_POSITION_RANGE[0], STAR_POSITION_RANGE[1])
  );
  star.velocity = new THREE.Vector3(
    randRange(STAR_VELOCITY_RANGE[0], STAR_VELOCITY_RANGE[1]),
    randRange(STAR_VELOCITY_RANGE[0], STAR_VELOCITY_RANGE[1]),
    randRange(STAR_VELOCITY_RANGE[0], STAR_VELOCITY_RANGE[1])
  );
  star.acc = new THREE.Vector3();
  star.mass = randRange(STAR_MASS_RANGE[0], STAR_MASS_RANGE[1])
  return star;
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
// randInt
// returns a integer number between [min, max)
////////////////////////////////////////////////////////////////////////////////

function randInt(min, max)
{
  return Math.floor(randRange(min, max));
}

////////////////////////////////////////////////////////////////////////////////
// init
////////////////////////////////////////////////////////////////////////////////

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

////////////////////////////////////////////////////////////////////////////////
// init
////////////////////////////////////////////////////////////////////////////////

function render() {
	var delta = clock.getDelta();
  
  updateStars(delta);
  cameraControls.update(delta);
  stats.update();
  renderer.render(scene, camera);
}


////////////////////////////////////////////////////////////////////////////////
// updateStars
////////////////////////////////////////////////////////////////////////////////

var ITERATIONS = 10;
function updateStars(delta)
{
  for (var i = 0; i < ITERATIONS; i++)
  {
    updateStarPhysics(delta);
  }
}

////////////////////////////////////////////////////////////////////////////////
// updateStarPhysics
// calculate the forces and positions
// new position = 0.5 * a * t^2 + vt + old position
// new velocity = at + old velocity
// implementing this simple formula is a pain in the ass because of THREE.js vector functions' side effects
////////////////////////////////////////////////////////////////////////////////

var GRAVITY_CONSTANT = 1000;
function updateStarPhysics(delta)
{
  var acc = new THREE.Vector3(); // acceleration
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
// fire up the system
////////////////////////////////////////////////////////////////////////////////

init();
animate();