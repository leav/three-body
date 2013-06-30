var starMaterialBaseTexture = THREE.ImageUtils.loadTexture( 'textures/sun01_gray.png' );
starMaterialBaseTexture.wrapS = starMaterialBaseTexture.wrapT = THREE.RepeatWrapping;
var starMaterialNoiseTexture = new THREE.ImageUtils.loadTexture( 'textures/cloud.png' );
starMaterialNoiseTexture.wrapS = starMaterialNoiseTexture.wrapT = THREE.RepeatWrapping; 
var starMaterialColorRampTexture = new THREE.ImageUtils.loadTexture( 'textures/star_color_modified.png' );  
  
function CreateStarMaterial(){
  var material = new THREE.ShaderMaterial( 
	{
    uniforms: {
      baseTexture: 	{ type: "t", value: starMaterialBaseTexture },
      baseSpeed: 		{ type: "f", value: 0.05 },
      noiseTexture: 	{ type: "t", value: starMaterialNoiseTexture },
      noiseScale:		{ type: "f", value: 0.25 },
      alpha: 			{ type: "f", value: 1.0 },
      time: 			{ type: "f", value: 1.0 },
      colorRampTexture: { type: "t", value: starMaterialColorRampTexture },
      darkValue: { type: "f", value: 0.0 },
      lightValue: { type: "f", value: 1.0 },
    },
		vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'noiseFragmentShader' ).textContent
	}   );
  return material;
}

