/* jshint bitwise: false */
define([
		'goo/lib/rsvp.amd',
		'goo/renderer/MeshData',
		'goo/renderer/Shader',
		'goo/renderer/TextureCreator',
		'goo/renderer/Material',
		'goo/loaders/Loader',
		'goo/loaders/ShaderLoader'
	],
	/** @lends MaterialLoader */
	function(
		RSVP,
		MeshData,
		Shader,
		TextureCreator,
		Material,
		Loader,
		ShaderLoader
	) {
	"use strict";

	/**
	 * Utility class for loading Material objects.
	 *
	 * @constructor
	 * @param {Loader} parameters.loader
	 */
	function MaterialLoader(parameters) {
		if(typeof parameters === "undefined" || parameters === null) {
			throw new Error('MaterialLoader(): Argument `parameters` was undefined/null');
		}

		if(typeof parameters.loader === "undefined" || !(parameters.loader instanceof Loader) || parameters.loader === null) {
			throw new Error('MaterialLoader(): Argument `parameters.loader` was invalid/undefined/null');
		}

		this._loader = parameters.loader;
		this._cache = {};
		this._shaderLoader = new ShaderLoader({ loader: this._loader });
	}

	/**
	 * Loads the material at <code>materialPath</code>.
	 *
	 * @param {string} materialPath Relative path to the material.
	 * @return {Promise} The promise is resolved with the loaded Material object.
	 */
	MaterialLoader.prototype.load = function(materialPath) {
		if (this._cache[materialPath]) {
			return this._cache[materialPath];
		}

		var that = this;
		var promise = this._loader.load(materialPath, function(data) {
			return that._parse(data);
		});

		this._cache[materialPath] = promise;
		return promise;
	};

	MaterialLoader.prototype._parse = function(materialDataSource) {
		var that = this;
		var promises = []; // Keep track of promises
		var shader;
		var materialState = this._getDefaultMaterialState();
		var materialUniforms = {};
		var textures = [];

		function addTexture(i, texture) {
			textures[i] = (new TextureCreator({
				loader:that._loader
			}).loadTexture2D(texture.url));
		}

		function setDestinationColor(destination, color) {
			if(typeof color[0] !== 'undefined' || color[0] !== null) { destination.r = color[0]; }
			if(typeof color[1] !== 'undefined' || color[1] !== null) { destination.g = color[1]; }
			if(typeof color[2] !== 'undefined' || color[2] !== null) { destination.b = color[2]; }
			if(typeof color[3] !== 'undefined' || color[3] !== null) { destination.a = color[3]; }
		}

		var name = materialDataSource.name || 'DefaultMaterial';

		if(materialDataSource) {
			var value;
			value = materialDataSource.shaderRef;
			if(value) {
				var p = this._shaderLoader.load(value)
				.then(function(iShader) {
					shader = iShader;
					return shader;
				});

				promises.push(p);
			}

			if (materialDataSource.uniforms) {
				for (var key in materialDataSource.uniforms) {
					var value = materialDataSource.uniforms[key];
					var match;
					if (match = /^material(\w+)$/.exec(key)) {
						var state = match[1].toLowerCase();
						if(state === 'specularpower') {
							state = 'shininess';
						}

						setDestinationColor(materialState[state], value);
					}
					else {
						materialUniforms[key] = value;
					}
				}
			}
			if (materialDataSource.textures && materialDataSource.textures.length) {
				for (var i = 0; i < materialDataSource.textures.length; i++) {
					var pushTexture = addTexture.bind(null,i);
					var p = this._loader.load(materialDataSource.textures[i])
					.then(pushTexture);
					promises.push(p);
				}
			}
		}
		if(promises.length === 0) {
			var p = new RSVP.Promise();
			p.reject('Material definition `' + materialDataSource + '` does not seem to contain a shader definition.');
			return p;
		}

		return RSVP.all(promises)
		.then(function() {
			var material = new Material(name);
			material.shader = shader;
			material.textures = textures;
			material.materialState = materialState;
			material.uniforms = materialUniforms;
			return material;
		});
	};

	MaterialLoader.prototype._getDefaultMaterialState = function() {
		return {
			ambient  : { r : 0.0, g : 0.0, b : 0.0, a : 1.0 },
			diffuse  : { r : 1.0, g : 1.0, b : 1.0, a : 1.0 },
			emissive : { r : 0.0, g : 0.0, b : 0.0, a : 1.0 },
			specular : { r : 0.0, g : 0.0, b : 0.0, a : 1.0 },
			shininess: 16.0
		};
	};

	return MaterialLoader;
});