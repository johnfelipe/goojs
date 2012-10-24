// REVIEW: Applies to all files: Put "use strict" inside function.
// It's safer for concatenating scripts, see
// http://stackoverflow.com/questions/4462478/jslint-is-suddenly-reporting-use-the-function-form-of-use-strict

"use strict";

define([ 'goo/entities/Entity', 'goo/entities/managers/EntityManager' ], function(Entity, EntityManager) {
	function World() {
		this._managers = [];
		this._systems = [];

		this._addedEntities = [];
		this._changedEntities = [];
		this._removedEntities = [];

		this._entityManager = new EntityManager();
		this.setManager(this._entityManager);

		this.tpf = 1.0;
	}

	World.prototype.setManager = function(manager) {
		this._managers.push(manager);
	};

	World.prototype.getManager = function(type) {
		for ( var i in this._managers) {
			var manager = this._managers[i];
			if (manager.type == type) {
				return manager;
			}
		}
	};

	World.prototype.setSystem = function(system) {
		this._systems.push(system);
	};

	World.prototype.getSystem = function(type) {
		for ( var i in this._systems) {
			var system = this._systems[i];
			if (system.type == type) {
				return system;
			}
		}
	};

	World.prototype.createEntity = function() {
		return new Entity(this);
	};

	World.prototype.getEntities = function() {
		return this._entityManager.getEntities();
	};

	World.prototype.addEntity = function(entity) {
		this._addedEntities.push(entity);
	};

	World.prototype.removeEntity = function(entity) {
		this._removedEntities.push(entity);
	};

	World.prototype.changedEntity = function(entity) {
		this._changedEntities.push(entity);
	};

	World.prototype.process = function() {
		this._check(this._addedEntities, function(observer, entity) {
			if (observer.added) {
				observer.added(entity);
			}
		});
		this._check(this._changedEntities, function(observer, entity) {
			if (observer.changed) {
				observer.changed(entity);
			}
		});
		this._check(this._removedEntities, function(observer, entity) {
			if (observer.removed) {
				observer.removed(entity);
			}
		});

		for ( var systemIndex in this._systems) {
			var system = this._systems[systemIndex];
			if (!system.passive) {
				system._process();
			}
		}
	};

	World.prototype._check = function(entities, callback) {
		// REVIEW: Code style? Spaces before and after "("?
		for ( var index in entities) {
			var entity = entities[index];
			for ( var managerIndex in this._managers) {
				var manager = this._managers[managerIndex];
				callback(manager, entity);
			}
			for ( var systemIndex in this._systems) {
				var system = this._systems[systemIndex];
				callback(system, entity);
			}
		}
		entities.length = 0;
	};

	return World;
});