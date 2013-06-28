////////////////////////////////////////////////////////////////////////////////
// FreeControls class //
////////////////////////////////////////////////////////////////////////////////
var rotateStart = new THREE.Vector2();

////////////////////////////////////////////////////////////////////////////////
// FreeControls constructor
// camera: THREE.Camera
// display: RotationDisplay
// domElement: to add mouse listener events
//
// during update, the camera position will be set at [0, 0, dollyDistance] and lookAt [0, 0, 0]
// use the mouse to rotate the target
////////////////////////////////////////////////////////////////////////////////
THREE.FreeControls = function (camera, domElement){
  this.camera = camera;
  this.domElement = domElement;
  this.enabled = true;

  var rotateStart = new THREE.Vector2();
  var scope = this;
  

  THREE.FreeControls.prototype.update = function(delta){
  }
  
  var ZOOM_FACTOR = 5;
  THREE.FreeControls.prototype.zoomOut = function(){
    this.camera.fov = Math.min(this.camera.fov + ZOOM_FACTOR, 180 - ZOOM_FACTOR);
  }
  
  THREE.FreeControls.prototype.zoomIn = function(){
    this.camera.fov = Math.max(this.camera.fov - ZOOM_FACTOR, ZOOM_FACTOR);
  }

  function onMouseDown( event ) {
    rotateStart.set( event.clientX, event.clientY );
    document.addEventListener( 'mousemove', onMouseMove, false );
    document.addEventListener( 'mouseup', onMouseUp, false );
  }

  var ROTATE_FACTOR = 180; // how many degrees to rotate for each screen travelled
  function onMouseMove( event ) {
    if (!scope.enabled)
      return;
    var rotateEnd = new THREE.Vector2( event.clientX, event.clientY );
    var rotateDelta = new THREE.Vector2().subVectors(rotateEnd, rotateStart);
    rotateStart.copy(rotateEnd);
    rotateDelta.x /= canvasWidth;
    rotateDelta.y /= canvasHeight;
    rotateDelta.multiplyScalar(ROTATE_FACTOR * Math.PI / 180);
    //scope.camera.rotateXY(rotateDelta);
    var up = new THREE.Vector3( 0, -1, 0 );
    var left = new THREE.Vector3( -1, 0, 0);
    scope.camera.rotateOnAxis( up, rotateDelta.x );
    scope.camera.rotateOnAxis( left, rotateDelta.y );
 }

  function onMouseUp( event ) {
      document.removeEventListener( 'mousemove', onMouseMove, false );
      document.removeEventListener( 'mouseup', onMouseUp, false );
  }

  function onMouseWheel( event ) {
		// this is needed when the program is inside an iframe
		// to prevent scrolling the whole page
		event.preventDefault();
    if (!scope.enabled)
      return;
		var delta = 0;
		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9
			delta = event.wheelDelta;
		} else if ( event.detail ) { // Firefox
			delta = - event.detail;
		}
		if ( delta > 0 ) {
			scope.zoomIn();
		} else {
			scope.zoomOut();
		}
	}

  // camera move control
	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false ); // prevent menu from showing
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox



}