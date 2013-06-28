////////////////////////////////////////////////////////////////////////////////
// Global variables
////////////////////////////////////////////////////////////////////////////////

/*global THREE, document, window, Stats, dat*/

var camera, scene, renderer, stats;
var cameraControls;
var clock = new THREE.Clock();

var starStates;

var stellarViewMeshes;
var stellarViewTrails;
var stellarDisplay;
var spaceMesh;

var noiseUniforms;


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
	camera = new THREE.PerspectiveCamera( 35, canvasWidth/ canvasHeight, 1, 10000 );
	camera.position.set( 0, 0, 4000 );


	// STATS
	stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
	document.body.appendChild( stats.domElement );

	fillScene();
  
	// CONTROLS
	cameraControls = new THREE.OrbitControls(camera, stellarDisplay, renderer.domElement);
  
  setupGui();
}

////////////////////////////////////////////////////////////////////////////////
// fillScene
////////////////////////////////////////////////////////////////////////////////

function fillScene() {
	scene = new THREE.Scene();
  stellarDisplay = new THREE.RotationDisplay();
  //stellarDisplay.add(new THREE.AxisIndicator(5, 1000));
  scene.add(stellarDisplay);
  
  
	// LIGHTS
	scene.add( new THREE.AmbientLight( 0x222222 ) )
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  directionalLight.position.set( 1, 1, 1 );
  scene.add( directionalLight );
  
  // stars
  starStates = new StarStates();
  starStates.stars = createStableStarSystem();
  stellarViewMeshes = createStarMeshes(starStates.stars);
  for (var i = 0; i < stellarViewMeshes.length; i++)
    stellarDisplay.addMesh(stellarViewMeshes[i]);
 
  // particle system for the trails
  // vertex colors
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
    //scene.add(stellarViewTrails[i]);
    stellarDisplay.addMesh(stellarViewTrails[i]);
  }
  
  // sky box
  // var imagePrefix = "textures/space";
	// var directions  = ["1", "2", "3", "4", "5", "6"];
	// var imageSuffix = ".png";
	// var spaceGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );	
	
	// var materialArray = [];
	// for (var i = 0; i < 6; i++)
		// materialArray.push( new THREE.MeshBasicMaterial({
			// map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
			// side: THREE.BackSide
		// }));
	// var spaceMaterial = new THREE.MeshFaceMaterial( materialArray );
	// var skyBox = new THREE.Mesh( spaceGeometry, spaceMaterial );
	// stellarDisplay.addMesh( skyBox );  
  
  var spaceGeometry = new THREE.SphereGeometry(5000, 32, 16);
  var spaceMaterial = new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture( "textures/space_sphere.png"),
			side: THREE.BackSide
		});
  spaceMesh = new THREE.Mesh( spaceGeometry, spaceMaterial );
  stellarDisplay.addMesh(spaceMesh);

  
}

////////////////////////////////////////////////////////////////////////////////
// setupGui
////////////////////////////////////////////////////////////////////////////////

	effectController = {
		speed: 0,
    trail: 300
	};
  
function setupGui() {
	var gui = new dat.GUI();

	gui.add( effectController, "speed", 0.0, 1000.0 ).step(1.0);
  gui.add( effectController, "trail", 0.0, 10000.0 ).step(1.0).name("trail (frame)");
}

////////////////////////////////////////////////////////////////////////////////
// createStableStarSystem
// returns a star array with three somewhat stable stars
// star:planet mass ratio is about 3 * 10e5
////////////////////////////////////////////////////////////////////////////////
var MAX_STAR_MASS = 1000;
var INNER_STAR_ORBIT = 200;
var OUTTER_STAR_ORBIT = 1000;
var PLATNET_ORBIT = 200;
var MIN_ORBIT_FACTOR = 0.8;
var MAX_ORBIT_FACTOR = 1.2;
var PLANET_MASS = 0.000;

function createStableStarSystem()
{
  var array = [];
  // double star
  array[0] = new Star();
  array[0].mass = randRange(MAX_STAR_MASS / 5, MAX_STAR_MASS);
  array[1] = new Star()
  array[1].mass = randRange(MAX_STAR_MASS / 5, MAX_STAR_MASS);
  array[1].orbitAround(array[0], randRange(INNER_STAR_ORBIT * MIN_ORBIT_FACTOR, INNER_STAR_ORBIT * MAX_ORBIT_FACTOR), randVector3(-1, 1));
  // third star at outer orbit
  var center = centerOfMass(array);
  array[2] = new Star()
  array[2].mass = randRange(MAX_STAR_MASS / 5, MAX_STAR_MASS);
  array[2].orbitAround(center, randRange(OUTTER_STAR_ORBIT * MIN_ORBIT_FACTOR, OUTTER_STAR_ORBIT * MAX_ORBIT_FACTOR), randVector3(-1, 1));
  // planet at third star
  array[3] = new Star({type: "planet"});
  array[3].mass = PLANET_MASS
  array[3].orbitAround(array[2], randRange(PLATNET_ORBIT * MIN_ORBIT_FACTOR, PLATNET_ORBIT * MAX_ORBIT_FACTOR), randVector3(-1, 1));
  
  //array[0].velocity = randVector3(-0.1, 0.1);
  array[1].velocity.addRandFactor(0.2);
  array[2].velocity.addRandFactor(0.2);
  array[3].velocity.addRandFactor(0.2);

  log("center mass " + center.toString());
  log("3rd star " + array[2].toString());
  return array;
}

////////////////////////////////////////////////////////////////////////////////
// createStarMeshes
// returns a mesh array for the stars
////////////////////////////////////////////////////////////////////////////////

var MAX_STAR_SIZE = 50;
var star_texture = THREE.ImageUtils.loadTexture( 'textures/sun01_512.png' );
star_texture.wrapS = THREE.RepeatWrapping;
star_texture.wrapT = THREE.RepeatWrapping;
var noiseTexture = new THREE.ImageUtils.loadTexture( 'textures/cloud.png' );
	noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping; 
noiseUniforms = {
		baseTexture: 	{ type: "t", value: star_texture },
		baseSpeed: 		{ type: "f", value: 0.05 },
		noiseTexture: 	{ type: "t", value: noiseTexture },
		noiseScale:		{ type: "f", value: 0.25 },
		alpha: 			{ type: "f", value: 1.0 },
		time: 			{ type: "f", value: 1.0 }
	};
var star_material = new THREE.ShaderMaterial( 
	{
	    uniforms: noiseUniforms,
		vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'noiseFragmentShader' ).textContent
	}   );
var planet_material = new THREE.MeshPhongMaterial( { shininess: 100 } );
function createStarMeshes(stars)
{
  var meshes = [];
  for (var i = 0; i < stars.length; i++)
  {
    var radius = Math.max(Math.pow(stars[i].mass / MAX_STAR_MASS, 1/3) * MAX_STAR_SIZE, 1);
    meshes[i] = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 32, 16),
      star_material );
  }
  return meshes;
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
  stellarDisplay.pivot.copy(centerOfPositions(starStates.stars));
  stellarDisplay.update(delta);
  spaceMesh.position.copy(stellarDisplay.pivot);
  
  updateStars(delta);
  updateStellarView(delta);
  //cameraControls.target.copy(centerOfPositions(starStates.stars));
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
    starStates.updatePhysicsRK4(delta);
  }
}

////////////////////////////////////////////////////////////////////////////////
// updateStellarView
////////////////////////////////////////////////////////////////////////////////

function updateStellarView(delta){
  for (var i = 0; i < starStates.stars.length; i++)
  {
    stellarViewMeshes[i].position.copy(starStates.stars[i].position);
    var pos = new THREE.Vector3();
    pos.copy(starStates.stars[i].position);
    stellarViewTrails[i].geometry.vertices.push(pos);
    // hack to dynamically add particles
    //scene.remove(stellarViewTrails[i]);
    stellarDisplay.removeMesh(stellarViewTrails[i]);
    var vertices = stellarViewTrails[i].geometry.vertices;
    if (vertices.length > effectController.trail)
    {
      vertices.splice(0, vertices.length - effectController.trail);
    }
    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    stellarViewTrails[i] = new THREE.ParticleSystem(geom, stellarViewTrails[i].material);
    //scene.add(stellarViewTrails[i]);
    stellarDisplay.addMesh(stellarViewTrails[i]);
  }
  
  noiseUniforms.time.value += delta;
  star_texture.offset.add(new THREE.Vector2(0.005, 0.00) );
}




////////////////////////////////////////////////////////////////////////////////
// fire up the system
////////////////////////////////////////////////////////////////////////////////

init();
animate();