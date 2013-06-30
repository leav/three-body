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

THREE.RotationDisplay.prototype.displayMatrix = function(){
  var matrix = new THREE.Matrix4().copy(this.translationObject.matrix);
  matrix.multiply(this.matrix);
  return matrix;
}

THREE.RotationDisplay.prototype.update = function(delta){
  this.translationObject.position.copy(this.pivot);
  this.translationObject.position.negate();
}