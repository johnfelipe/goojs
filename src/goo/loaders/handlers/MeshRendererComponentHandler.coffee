define [
	'goo/loaders/handlers/ConfigHandler'
	'goo/loaders/handlers/ComponentHandler'
	
	'goo/loaders/Loader'
	'goo/entities/components/MeshRendererComponent'
	'goo/entities/components/MeshDataComponent'

	'goo/renderer/Material'
	'goo/renderer/Util'
	'goo/renderer/shaders/ShaderLib'
	'goo/renderer/shaders/ShaderBuilder'
	
	'goo/util/rsvp'
	'goo/util/PromiseUtil'
	
	'goo/util/ObjectUtil'
], (
	ConfigHandler,
	ComponentHandler
	Loader,
	MeshRendererComponent,
	MeshDataComponent,
	Material,
	Util, 
	ShaderLib,
	ShaderBuilder,
	RSVP,
	pu,
	_
) ->

	class MaterialHandler extends ConfigHandler			
		@_register('material')		
		
		constructor: (@world, @getConfig, @updateObject, @options)->
			@_objects = {}
		
		_prepare: (config)->
			config.blendState ?= {}
			_.defaults config.blendState,
					blending: 'NoBlending'
					blendEquation: 'AddEquation'
					blendSrc: 'SrcAlphaFactor'
					blendDst: 'OneMinusSrcAlphaFactor'
			config.cullState ?= {}
			_.defaults config.cullState,
				enabled : true
				cullFace : 'Back'
				frontFace : 'CCW'
			config.depthState ?= {}
			_.defaults config.depthState,
				enabled: true
				write: true

			config.renderQueue ?= -1
		
		_create: (ref)->
			@_objects ?= {}
			@_objects[ref] = new Material(ref)
		
		
		update: (ref, config)->
			@_prepare(config)
			if not @_objects?[ref] then @_create(ref)
			object = @_objects[ref]

			@_getShaderObject(config.shaderRef, config.wireframe).then (shader)=>
				#console.log "Got shader"
				
				if not shader
					console.warn 'Unknown shader', config.shaderRef, '- not updating material', ref
					return
	
				if config.wireframeColor
					object.wireframeColor = Util.clone config.wireframeColor
	
				object.blendState = Util.clone config.blendState
				object.cullState = Util.clone config.cullState
				object.depthState = Util.clone config.depthState
				if config.renderQueue == -1 then object.renderQueue = null
				else object.renderQueue = config.renderQueue
	

				object.shader = shader
				object.uniforms = {}
				for name, value of config.uniforms
					object.uniforms[name] = _.clone(value)
	

				#console.log "#{config.textureRefs?.length or 0} textures"
				promises = []

				for textureType, textureRef of config.texturesMapping
					do (textureType, textureRef)=>
						promises.push @getConfig(textureRef).then (textureConfig)=>
							@updateObject(textureRef, textureConfig, @options).then (texture)=>
								type: textureType
								ref: textureRef 
								texture: texture
				
				if promises?.length 
					return RSVP.all(promises).then (textures)-> 
						for texture in textures
							object.setTexture(texture.type, texture.texture)

						return object
					.then null, (err)->
						console.error "Error loading textures: #{err}"
				else 
					return object
				
		
		_getShaderObject: (ref, wireframe)->
			if wireframe
				promise = new RSVP.Promise()
				shader = Material.createShader ShaderLib.simple
				promise.resolve(shader)
				return promise
			else if ref?
				@getConfig(ref).then (config)=>
					@updateObject(ref, config, @options)
			else
				defaultShader = Material.createShader(ShaderLib.texturedLit, 'DefaultShader')
				pu.createDummyPromise(defaultShader)
	
	
	class ShaderHandler extends ConfigHandler
		@_register('shader')
		
		_create: (ref) ->
			@_objects ?= {}
			@_objects[ref] = Material.createShader(ShaderLib.simple, ref)

		update: (ref, config) ->
			console.log "Updating shader #{ref}"
			# Currently not possible to update a shader, so update = create

			if config?.attributes and config?.uniforms
				shaderDefinition =
					attributes: config.attributes,
					uniforms: config.uniforms
	
				for key, uniform of shaderDefinition.uniforms
	
					if typeof uniform == 'string'
						funcRegexp = /^function\s?\(([^\)]+)\)\s*\{(.*)}$/
						test = uniform.match(funcRegexp);
						if test?.length == 3
							args = test[1].replace(' ','').split(',')
							body = test[2]
							### jshint -W054 ###
							shaderDefinition.uniforms[key] = new Function(args, body)
	
				if config.processors
					shaderDefinition.processors = [];
					for i in [0...config.processors.length]
						shaderDefinition.processors.push ShaderBuilder[config.processors[i]].processor

				if config.defines
					shaderDefinition.defines = config.defines
			else
				shaderDefinition = this._getDefaultShaderDefinition()
			
			promises = [
				@getConfig(config.vshaderRef)
				@getConfig(config.fshaderRef)
			]
			
			RSVP.all(promises).then (shaders)=>
				[vshader, fshader] = shaders
				if not vshader
					console.warn 'Vertex shader', config.vshaderRef, 'in shader', ref, 'not found'
					return
				if not fshader
					console.warn 'Fragment shader', config.fshaderRef, 'in shader', ref, 'not found'
					return

				# We create a new shader here since AFAIK it's not possible to
				# update an existing shader.
				# This leaks resources since the old shader isn't deleted.
				# TODO: Add Shader.release function to release allocated GL resources
				# or a function to re-initialize a shader.
				_.extend shaderDefinition,
					attributes: config.attributes ? {}
					uniforms: config.uniforms ? {}
					vshader: vshader
					fshader: fshader
				
				object = Material.createShader(shaderDefinition, ref)
			
	class MeshRendererComponentHandler extends ComponentHandler
		@_register('meshRenderer')
		
			
		_prepare: (config) ->
			_.defaults config,
				materialRefs: []
				cullMode: 'Dynamic'
				castShadows: false
				receiveShadows: false

		_create: (entity, config) ->
			component = new MeshRendererComponent()
			entity.setComponent(component)
			return component

		update: (entity, config) ->
			component = super(entity, config) # Creates component if needed

			materialRefs = config.materialRefs
			if not materialRefs or materialRefs.length == 0
				console.log "No material refs"
				promise = pu.createDummyPromise([])
			else
				promises = []
				for materialRef in materialRefs
					do (materialRef)=>
						promises.push @_getMaterial(materialRef)
				promise = RSVP.all(promises)
				
			promise.then (materials)=>
				component.materials = materials

				for key, value of config when key != 'materials' and component.hasOwnProperty(key)
					component[key] = _.clone(value)
				
				#console.log "MRCH done #{JSON.stringify(config)} #{entity.ref}"
				return component
			.then null, (err)-> console.error "Error handling materials #{err}"	
				

			# TODO: Handle selection
# 			if entityConfig.selected
# 				newMaterials.push @constructor._selectedMaterial

		
		_getMaterial: (ref)->
			console.log "GetMaterial #{ref}"
			@getConfig(ref).then (config)=>
				@updateObject(ref, config, @options)
				
