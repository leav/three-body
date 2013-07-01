////////////////////////////////////////////////////////////////////////////////
// Global variables
////////////////////////////////////////////////////////////////////////////////

/*global THREE, document, window, Stats, dat*/

var renderer, stats;
var clock = new THREE.Clock();
var canvasWidth, canvasHeight;

var mainCamera, sideCamera;
var viewState;

// stellar view

var camera, scene

var starStates;

var stellarDisplay;
var stellarViewMeshes;
var planetMesh;
var stellarViewTrails;
var planetTrail;
var spaceMesh;

// planet view

var planetCamera;

// shader variable

var noiseUniforms;


////////////////////////////////////////////////////////////////////////////////
// init
////////////////////////////////////////////////////////////////////////////////

function init() {
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor( 0x0, 1.0 );
	renderer.shadowMapEnabled = true;
  renderer.setScissor( 0.75 * canvasWidth, 0,
  0.25 * canvasWidth, 0.25 * canvasHeight );
	renderer.autoClear = false; // don't clear when second viewport is drawn
  
	document.body.appendChild( renderer.domElement );

	// STATS
	stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.zIndex = '1';
	document.body.appendChild( stats.domElement );

  // stars
  starStates = new StarStates();
  createStableStarSystem();

  // stellar view
	initStellarView();
  
  // planetView
  initPlanetView();

  // camera switching
  viewState = 'star';
  mainCamera = camera;
  sideCamera = planetCamera;
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );

  // gui
  setupGui();
}

////////////////////////////////////////////////////////////////////////////////
// setupGui
////////////////////////////////////////////////////////////////////////////////

	effectController = {
    start: function(){
      createStableStarSystem();
      resetStellarViewTrails();
      },
    innerOrbit: 5.0,
    outerOrbit: 9.0,
    planetOrbit: 5.0,
    randomness: 0.2,
    
		speed: 50,
    trail: 5000,
    planetRotation: 0.01,
	};
  
function setupGui() {
	var gui = new dat.GUI();
  var initialState = gui.addFolder('Initial State');
  initialState.open();
	initialState.add( effectController, "innerOrbit", 0.1, 100.0 ).step(0.1);
  initialState.add( effectController, "outerOrbit", 0.1, 100.0 ).step(0.1);
  initialState.add( effectController, "planetOrbit", 0.1, 100.0 ).step(0.1);
  initialState.add( effectController, "randomness", 0.0, 1.0 ).step(0.1);
  initialState.add( effectController, "start" );
  var displayControl = gui.addFolder('Display Control');
  displayControl.open();
	displayControl.add( effectController, "speed", 0.0, 100.0 ).step(1.0);
  displayControl.add( effectController, "trail", 0.0, 10000.0 ).step(1.0).name("trail (frame)");
  displayControl.add( effectController, "planetRotation", 0.0, 0.1 ).step(0.001).name("planet rotation");
}


////////////////////////////////////////////////////////////////////////////////
// createStableStarSystem
// returns a star array with three somewhat stable stars
// star:planet mass ratio is about 3 * 10e5
////////////////////////////////////////////////////////////////////////////////
var MAX_STAR_MASS = 1000;
var PLANET_MASS = 0.000;

var MAX_STAR_SIZE = 1000;
var PLANET_SIZE = MAX_STAR_SIZE / 100;

var MIN_ORBIT_FACTOR = 0.8;
var MAX_ORBIT_FACTOR = 1.2;

var SPACE_GEOMETRY_RADIUS = MAX_STAR_SIZE * 100;
var FAR_PLANE = SPACE_GEOMETRY_RADIUS * 2;
var STELLAR_MAX_DOLLY_DISTANCE = SPACE_GEOMETRY_RADIUS * 0.9;
var STELLAR_STARTING_POSITION = STELLAR_MAX_DOLLY_DISTANCE / 2;

var STAR_ROTATION_MAX = 0.05 * Math.PI / 180;
var STAR_ROTATION_MIN = 0.02 * Math.PI / 180;

var GRAVITY_CONSTANT = 10000;


function createStableStarSystem()
{
  var innerOrbit = effectController.innerOrbit * MAX_STAR_SIZE;
  var outerOrbit = effectController.outerOrbit * MAX_STAR_SIZE;
  var planetOrbit = effectController.planetOrbit * MAX_STAR_SIZE;
  var randomness = effectController.randomness;
  var array = [];
  // double star
  array[0] = new Star();
  array[0].mass = randRange(MAX_STAR_MASS / 5, MAX_STAR_MASS);
  array[1] = new Star()
  array[1].mass = randRange(MAX_STAR_MASS / 5, MAX_STAR_MASS);
  array[1].orbitAround(array[0], randRange(innerOrbit * MIN_ORBIT_FACTOR, innerOrbit * MAX_ORBIT_FACTOR), randVector3(-1, 1));
  // third star at outer orbit
  var center = centerOfMass(array);
  array[2] = new Star()
  array[2].mass = randRange(MAX_STAR_MASS / 5, MAX_STAR_MASS);
  array[2].orbitAround(center, randRange(outerOrbit * MIN_ORBIT_FACTOR, outerOrbit * MAX_ORBIT_FACTOR), randVector3(-1, 1));
  // planet at third star
  array[3] = new Star();
  array[3].type = "planet";
  array[3].mass = PLANET_MASS
  array[3].orbitAround(array[2], randRange(planetOrbit * MIN_ORBIT_FACTOR, planetOrbit * MAX_ORBIT_FACTOR), randVector3(-1, 1));
  
  for (var i = 0; i <= 2; i++) {
    array[i].rotationSpeed = randRange(STAR_ROTATION_MIN, STAR_ROTATION_MAX);
    array[i].rotationAxis = randVector3(-1, 1);
  }
  for (var i = 0; i < array.length; i++) {
    array[i].velocity.addRandFactor(randomness);
  }

  //log("center mass " + center.toString());
  //log("3rd star " + array[2].toString());
  starStates.stars = array;
}

////////////////////////////////////////////////////////////////////////////////
// initStellarView
////////////////////////////////////////////////////////////////////////////////

function initStellarView() {
	scene = new THREE.Scene();
  stellarDisplay = new THREE.RotationDisplay();
  //stellarDisplay.add(new THREE.AxisIndicator(5, MAX_STAR_SIZE * 10));
  scene.add(stellarDisplay);
  
	// CAMERA
	camera = new THREE.PerspectiveCamera( 35, canvasWidth/ canvasHeight, 1, FAR_PLANE );
	camera.position.set( 0, 0, STELLAR_STARTING_POSITION );
	// CONTROLS
	camera.controls = new THREE.OrbitControls(camera, stellarDisplay, renderer.domElement);
  camera.controls.maxDollyDistance = STELLAR_MAX_DOLLY_DISTANCE
  
  
	// LIGHTS
	scene.add( new THREE.AmbientLight( 0x222222 ) )
  
  // stars
  stellarViewMeshes = [];
  for (var i = 0; i < starStates.stars.length; i++) {
    stellarViewMeshes[i] = createStarMesh(starStates.stars[i])
    stellarDisplay.addMesh(stellarViewMeshes[i]);
  }
  planetMesh = stellarViewMeshes[starStates.stars.length - 1];
 
  // particle system for the trails
  // vertex colors
  initStellarViewTrails();
  
  // sky box 
  var spaceGeometry = new THREE.SphereGeometry(SPACE_GEOMETRY_RADIUS, 16, 16);
  var spaceMaterial = new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture( "textures/space_sphere.png"),
			side: THREE.BackSide
		});
  spaceMesh = new THREE.Mesh( spaceGeometry, spaceMaterial );
  stellarDisplay.addMesh(spaceMesh);

  
}

////////////////////////////////////////////////////////////////////////////////
// initStellarViewTrails
////////////////////////////////////////////////////////////////////////////////

function initStellarViewTrails(){
  stellarViewTrails = [];
  var material = new THREE.ParticleBasicMaterial( {
      size: 10,
      sizeAttenuation: true,
      blending: THREE.NormalBlending,
      transparent: false,
      opacity: 1,
      vertexColors: false
  } ); 
  for (var i = 0; i < stellarViewMeshes.length; i++)
  {
    var geometry = new THREE.Geometry();
    geometry.colors = [];
    stellarViewTrails[i] = new THREE.ParticleSystem( geometry, material, {dynamic : true});
    stellarDisplay.addMesh(stellarViewTrails[i]);
  }
  planetTrail = stellarViewTrails[stellarViewTrails.length - 1];
}


////////////////////////////////////////////////////////////////////////////////
// initPlanetView
////////////////////////////////////////////////////////////////////////////////

function initPlanetView()
{
	// CAMERA
	planetCamera = new THREE.PerspectiveCamera( 25, canvasWidth/ canvasHeight, 1, FAR_PLANE );
	planetCamera.position.set( PLANET_SIZE * 1.2, 0, 0 );
  planetCamera.rotation.set(0, 30 * Math.PI / 180, -Math.PI / 2);
  planetMesh.add(planetCamera);
  planetCamera.controls = new THREE.FreeControls(planetCamera, renderer.domElement);
}



////////////////////////////////////////////////////////////////////////////////
// textures and materials
////////////////////////////////////////////////////////////////////////////////


var planet_texture = THREE.ImageUtils.loadTexture( "textures/mercury.jpg" );
var planet_material = new THREE.MeshLambertMaterial( { map: planet_texture } );

var corona_texture = THREE.ImageUtils.loadTexture( "textures/corona.png" );
var corona_material = new THREE.MeshBasicMaterial( { map: corona_texture, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending} );

var STAR_VALUE_RANGE = 0.3;
////////////////////////////////////////////////////////////////////////////////
// createStarMeshes
// returns a mesh array for the stars
////////////////////////////////////////////////////////////////////////////////

function createStarMesh(star)
{
  if (star.type == "star") {
    var radius = Math.pow(star.mass / MAX_STAR_MASS, 1/3) * MAX_STAR_SIZE;
    var material = CreateStarMaterial();
    var star_color = randRange(STAR_VALUE_RANGE, 1.0);
    material.uniforms.lightValue.value = star_color;
    material.uniforms.darkValue.value = star_color - STAR_VALUE_RANGE;
  }
  else {
    var radius = PLANET_SIZE;
    var material = planet_material;
  }
  var mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 64, 32), material);
  if (star.type == "star") {
    // randomize rotation
    mesh.rotation.copy(randVector3(0, Math.PI * 2));
    // star light
    var lightColor = 0xFFFFFF;
    var light = new THREE.PointLight( lightColor, 1, SPACE_GEOMETRY_RADIUS );
    mesh.add(light);
    // corona
    var corona = new THREE.Mesh(new THREE.CircleGeometry(radius * 2, 32), corona_material);
    // var gyroscope = new THREE.Gyroscope();
    // gyroscope.add(corona);
    mesh.corona = corona;
    scene.add(corona);
  }
  return mesh;
}





////////////////////////////////////////////////////////////////////////////////
// onDocumentMouseDown
////////////////////////////////////////////////////////////////////////////////

function onDocumentMouseDown( event ) {
	var canvasPosition = renderer.domElement.getBoundingClientRect();
	var mouseX = event.clientX - canvasPosition.left;
	var mouseY = event.clientY - canvasPosition.top;
  
  if (mouseX > 0.75 * canvasWidth && mouseY > 0.75 * canvasHeight && mouseX < canvasWidth && mouseY < canvasHeight)
  {
    switchViewState();
  }
}

////////////////////////////////////////////////////////////////////////////////
// switchViewState
////////////////////////////////////////////////////////////////////////////////

function switchViewState(){
  if (viewState == 'star')
  {
    viewState = 'planet';
    mainCamera = planetCamera;
    sideCamera = camera;
    planetTrail.visible = false;
  }
  else {
    viewState = 'star';
    mainCamera = camera;
    sideCamera = planetCamera;
    planetTrail.visible = true;
  }
}



////////////////////////////////////////////////////////////////////////////////
// animate loop
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
  
  stats.update();
  
  updateStars(delta);
    
  updateStellarView(delta);
  
  mainCamera.controls.enabled = true;
  sideCamera.controls.enabled = false;
  mainCamera.updateProjectionMatrix();
  sideCamera.updateProjectionMatrix();
  
	// main camera render
  renderer.enableScissorTest( false );
	renderer.setViewport( 0, 0, canvasWidth, canvasHeight );
	renderer.clear();
	renderer.render( scene, mainCamera );

	// side camera render
	renderer.enableScissorTest( true );
	renderer.setViewport( 0.75 * canvasWidth, 0,
		0.25 * canvasWidth, 0.25 * canvasHeight );
	renderer.clear();
	renderer.render( scene, sideCamera );
}


////////////////////////////////////////////////////////////////////////////////
// updateStars
////////////////////////////////////////////////////////////////////////////////

function updateStars(delta)
{
  for (var i = 0; i < effectController.speed; i++)
    starStates.updatePhysicsRK4(delta);
}

////////////////////////////////////////////////////////////////////////////////
// updateStellarView
////////////////////////////////////////////////////////////////////////////////

function updateStellarView(delta){
  // update center of camera
  stellarDisplay.pivot.copy(centerOfPositions(starStates.stars));
  stellarDisplay.update(delta);
  // update space sphere
  spaceMesh.position.copy(stellarDisplay.pivot);
  // update star mesh
  for (var i = 0; i < starStates.stars.length; i++)
  {
    stellarViewMeshes[i].position.copy(starStates.stars[i].position);
    stellarViewMeshes[i].rotateOnAxis(starStates.stars[i].rotationAxis, starStates.stars[i].rotationSpeed);
    if (starStates.stars[i].type == 'star')
    {
      stellarViewMeshes[i].material.uniforms.time.value += delta;
      stellarViewMeshes[i].corona.matrix.identity();
      stellarViewMeshes[i].corona.applyMatrix(stellarViewMeshes[i].matrixWorld);
      stellarViewMeshes[i].corona.lookAt(camera.position);
    }
    // create trail particle
    var pos = new THREE.Vector3();
    pos.copy(starStates.stars[i].position);
    stellarViewTrails[i].geometry.vertices.push(pos);
  }
  hackRefreshStellarViewTrails();
  planetMesh.rotateOnAxis(new THREE.Vector3(0,1,0), effectController.planetRotation * Math.PI / 180 * effectController.speed);
  camera.controls.update(delta);
}

////////////////////////////////////////////////////////////////////////////////
// hackRefreshStellarViewTrails
////////////////////////////////////////////////////////////////////////////////

function hackRefreshStellarViewTrails(){
  for (var i = 0; i < starStates.stars.length; i++) {
    // hack to dynamically add particles
    stellarDisplay.removeMesh(stellarViewTrails[i]);
    var vertices = stellarViewTrails[i].geometry.vertices;
    if (vertices.length > effectController.trail)
    {
      vertices.splice(0, vertices.length - effectController.trail);
    }
    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    stellarViewTrails[i] = new THREE.ParticleSystem(geom, stellarViewTrails[i].material);
    stellarDisplay.addMesh(stellarViewTrails[i]);
  }
}

////////////////////////////////////////////////////////////////////////////////
// resetStellarViewTrails
////////////////////////////////////////////////////////////////////////////////

function resetStellarViewTrails(){
  for (var i = 0; i < starStates.stars.length; i++) {
    stellarDisplay.removeMesh(stellarViewTrails[i]);
    stellarViewTrails[i] = new THREE.ParticleSystem(new THREE.Geometry(), stellarViewTrails[i].material);
    stellarDisplay.addMesh(stellarViewTrails[i]);
  }
}

////////////////////////////////////////////////////////////////////////////////
// updatePlaentView
////////////////////////////////////////////////////////////////////////////////

function updatePlaentView(delta){
  planetCamera.controls.update(delta);
}


////////////////////////////////////////////////////////////////////////////////
// fire up the system
////////////////////////////////////////////////////////////////////////////////

init();
animate();