var coronaMaterialNoiseTexture = new THREE.ImageUtils.loadTexture( 'textures/corona_noise.png' );
coronaMaterialNoiseTexture.wrapS = coronaMaterialNoiseTexture.wrapT = THREE.RepeatWrapping; 
function createCoronaMaterial(){
  var material = new THREE.ShaderMaterial( 
	{
    uniforms: {
      baseSpeed: 		{ type: "f", value: 0.02 },
      noiseTexture: 	{ type: "t", value: coronaMaterialNoiseTexture },
      noiseScale:		{ type: "f", value: 0.25 },
      alpha: 			{ type: "f", value: 0.5 },
      time: 			{ type: "f", value: 1.0 },
      colorRampTexture: { type: "t", value: starMaterialColorRampTexture },
      colorRampValue: { type: "f", value: 0.5 },
      innerRadius:  { type: "f", value: 0.5 },
      rotation:  { type: "f", value: 0.0 },
    },
		vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'coronaFragmentShader' ).textContent,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
	}   );
  return material;
}