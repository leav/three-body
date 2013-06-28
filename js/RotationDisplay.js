////////////////////////////////////////////////////////////////////////////////
// RotationDisplay class //
////////////////////////////////////////////////////////////////////////////////

THREE.RotationDisplay = function() {
  THREE.Object3D.call( this );
  
  this.translationObject = new THREE.Object3D();
  this.pivot = new THREE.Vector3();
  this.add(this.translationObject);
}

THREE.RotationDisplay.prototype = Object.create( THREE.Object3D.prototype );

THREE.RotationDisplay.prototype.addMesh = function(mesh){
  this.translationObject.add(mesh);
}

THREE.RotationDisplay.prototype.removeMesh = function(mesh){
  this.translationObject.remove(mesh);
}

THREE.RotationDisplay.prototype.rotateXY = function(deltaVector) {
  var matrix = new THREE.Matrix4();
  matrix.extractRotation(this.matrix);
  matrix.transpose();
  var up = new THREE.Vector3( 0, 1, 0 );
  up.applyMatrix4(matrix);
  var left = new THREE.Vector3( 1, 0, 0);
  left.applyMatrix4(matrix);
  this.rotateOnAxis( up, deltaVector.x );
  this.rotateOnAxis( left, deltaVector.y );
}

THREE.RotationDisplay.prototype.update = function(delta){
  this.translationObject.position.copy(this.pivot);
  this.translationObject.position.negate();
}