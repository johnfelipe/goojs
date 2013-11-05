define([
	'goo/statemachine/actions/Action',
	'goo/math/Vector3'
],
/** @lends */
function(
	Action,
	Vector3
) {
	"use strict";

	function TweenMoveAction(/*id, settings*/) {
		Action.apply(this, arguments);
	}

	TweenMoveAction.prototype = Object.create(Action.prototype);
	TweenMoveAction.prototype.constructor = TweenMoveAction;

	TweenMoveAction.external = {
		name: 'Tween Move',
		description: 'Smoothly transitions between two locations',
		canTransition: true,
		parameters: [{
			name: 'Translation',
			key: 'to',
			type: 'position',
			description: 'Move',
			'default': [0, 0, 0]
		}, {
			name: 'Relative',
			key: 'relative',
			type: 'boolean',
			description: 'If true add, otherwise set',
			'default': true
		}, {
			name: 'Time',
			key: 'time',
			type: 'number',
			description: 'Time it takes for this movement to complete',
			'default': 1000
		}, {
			name: 'Easing type',
			key: 'easing1',
			type: 'dropdown',
			description: 'Easing type',
			'default': 'Linear',
			options: ['Linear', 'Quadratic', 'Exponential', 'Circular', 'Elastic', 'Back', 'Bounce']
		}, {
			name: 'Direction',
			key: 'easing2',
			type: 'dropdown',
			description: 'Easing direction',
			'default': 'In',
			options: ['In', 'Out', 'InOut']
		}],
		transitions: [{
			key: 'complete',
			name: 'On Completion',
			description: 'State to transition to when the movement completes'
		}]
	};

	TweenMoveAction.prototype.configure = function (settings) {
		this.to = settings.to;
		this.relative = settings.relative;
		this.time = settings.time;
		if (settings.easing1 === 'Linear') {
			this.easing = window.TWEEN.Easing.Linear.None;
		} else {
			this.easing = window.TWEEN.Easing[settings.easing1][settings.easing2];
		}
		this.eventToEmit = { channel: settings.transitions.complete };
	};

	TweenMoveAction.prototype._setup = function (/*fsm*/) {
		this.tween = new window.TWEEN.Tween();
	};

	TweenMoveAction.prototype.cleanup = function (/*fsm*/) {
		if (this.tween) {
			this.tween.stop();
		}
	};

	TweenMoveAction.prototype._run = function (fsm) {
		var entity = fsm.getOwnerEntity();
		var transformComponent = entity.transformComponent;
		var translation = transformComponent.transform.translation;
		var initialTranslation = new Vector3().copy(translation);

		var fakeFrom = { x: initialTranslation.x, y: initialTranslation.y, z: initialTranslation.z };
		var fakeTo;

		var old = { x: fakeFrom.x, y: fakeFrom.y, z: fakeFrom.z };

		if (this.relative) {
			var to = Vector3.add(initialTranslation, this.to);
			fakeTo = { x: to.x, y: to.y, z: to.z };

			this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function() {
				translation.data[0] += this.x - old.x;
				translation.data[1] += this.y - old.y;
				translation.data[2] += this.z - old.z;

				old.x = this.x;
				old.y = this.y;
				old.z = this.z;

				transformComponent.setUpdated();
			}).onComplete(function() {
				fsm.send(this.eventToEmit.channel);
			}.bind(this)).start(fsm.getTime() * 1000);
		} else {
			fakeTo = { x: this.to[0], y: this.to[1], z: this.to[2] };

			this.tween.from(fakeFrom).to(fakeTo, +this.time).easing(this.easing).onUpdate(function() {
				translation.data[0] += this.x - old.x;
				translation.data[1] += this.y - old.y;
				translation.data[2] += this.z - old.z;

				old.x = this.x;
				old.y = this.y;
				old.z = this.z;

				transformComponent.setUpdated();
			}).onComplete(function() {
				fsm.send(this.eventToEmit.channel);
			}.bind(this)).start(fsm.getTime() * 1000);
		}
	};

	return TweenMoveAction;
});