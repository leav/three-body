////////////////////////////////////////////////////////////////////////////////
// AxisIndicator class //
////////////////////////////////////////////////////////////////////////////////

THREE.AxisIndicator = function(radius, length) {
  THREE.Object3D.call( this );
  
  var xGeom = new THREE.CylinderGeometry(radius, radius, length, 16, 16, false);
  var xMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
  var xAxis = new THREE.Mesh(xGeom, xMaterial);
  xAxis.rotation.z = Math.PI / 2;
  xAxis.position.x = length / 2;
  this.add(xAxis);
  
  var yGeom = new THREE.CylinderGeometry(radius, radius, length, 16, 16, false);
  var yMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
  var yAxis = new THREE.Mesh(yGeom, yMaterial);
  yAxis.position.y = length / 2;
  this.add(yAxis);
  
  var zGeom = new THREE.CylinderGeometry(radius, radius, length, 16, 16, false);
  var zMaterial = new THREE.MeshBasicMaterial({ color: 0x0000FF });
  var zAxis = new THREE.Mesh(zGeom, zMaterial);
  zAxis.rotation.x = Math.PI / 2;
  zAxis.position.z = length / 2;
  this.add(zAxis);
  
  }

THREE.AxisIndicator.prototype = Object.create( THREE.Object3D.prototype );
