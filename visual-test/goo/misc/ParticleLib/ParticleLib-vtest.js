require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/particles/ParticleLib',
	'goo/util/ParticleSystemUtils',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Vector3,
	ParticleLib,
	ParticleSystemUtils,
	V
	) {
	'use strict';

	function addFire(translation) {
		var material = new Material(ShaderLib.particles);
		var texture = ParticleSystemUtils.createFlareTexture();
		texture.generateMipmaps = true;
		material.setTexture('DIFFUSE_MAP', texture);
		material.blendState.blending = 'AdditiveBlending';
		material.cullState.enabled = false;
		material.depthState.write = false;
		material.renderQueue = 2002;

		ParticleSystemUtils.createParticleSystemEntity(
			world,
			ParticleLib.getFire({
				scale: 1,
				startColor: [1, 1, 0],
				endColor: [1, 0, 0]
			}),
			material
		).set(translation)
		.addToWorld();
	}

	function addSmoke(translation) {
		var material = new Material(ShaderLib.particles);
		var texture = ParticleSystemUtils.createFlareTexture();
		texture.generateMipmaps = true;
		material.setTexture('DIFFUSE_MAP', texture);
		material.blendState.blending = 'AlphaBlending';
		material.cullState.enabled = false;
		material.depthState.write = false;
		material.renderQueue = 2001;

		ParticleSystemUtils.createParticleSystemEntity(
			world,
			ParticleLib.getSmoke({
				scale: 1,
				color: [0.1, 0.05, 0]
			}),
			material
		).set(translation)
		.addToWorld();
	}

	var goo = V.initGoo();
	var world = goo.world;

	V.addOrbitCamera(new Vector3(60, Math.PI / 2, 0));

	addFire([ 10, 0, 0]);
	addSmoke([-10, 0, 0]);

	V.process();
});