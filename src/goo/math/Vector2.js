define([
	'goo/math/MathUtils'
], function (
	MathUtils
) {
	'use strict';

	/**
	 * Vector with 2 components.
	 * @extends Vector
	 * @param {Vector2|number[]|...number} arguments Initial values for the components.
	 */
	function Vector2() {
		//Vector.call(this, 2);
/*
		this._x = 0;
		this._y = 0;

		['x', 'y'].forEach(function (property) {
			Object.defineProperty(this, property, {
				get: function () { return this['_' + property]; },
				set: function (value) {
					if (isNaN(value)) {
						throw 'NaN';
					}
					this['_' + property] = value;
					return value;
				}
			});
		}, this);
*/
		if (arguments.length !== 0) {
			Vector2.prototype.set.apply(this, arguments);
		} else {
			this.x = 0;
			this.y = 0;
		}

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	Vector2.prototype.set = function () {
		if (arguments.length === 1 && typeof arguments[0] === 'object') {
			if (arguments[0] instanceof Array) {
				this.x = arguments[0][0];
				this.y = arguments[0][1];
			} else {
				this.copy(arguments[0]);
			}
		} else {
			this.x = arguments[0];
			this.y = arguments[1];
		}

		return this;
	};

	//Vector2.prototype = Object.create(Vector.prototype);
	//Vector2.prototype.constructor = Vector2;
	//
	//Vector.setupAliases(Vector2.prototype, [['x', 'u', 's'], ['y', 'v', 't']]);

	Vector2.ZERO = new Vector2(0, 0);
	Vector2.ONE = new Vector2(1, 1);
	Vector2.UNIT_X = new Vector2(1, 0);
	Vector2.UNIT_Y = new Vector2(0, 1);

	// general purpose vector for holding intermediate data that has no better than 'tmpVec'
	var tmpVec = new Vector2();

	/**
	 * Performs a component-wise addition and stores the result in a separate vector. Equivalent of 'return (target = lhs + rhs);'.
	 * @param {Vector2|number[]|number} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2} [target] Target vector for storage.
	 * @returns {Vector2} A new vector if the target vector is omitted, else the target vector.
	 */
	Vector2.add = function (lhs, rhs, target) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs];
		}

		if (!target) {
			target = new Vector2();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		target.x = ldata[0] + rdata[0];
		target.y = ldata[1] + rdata[1];

		return target;
	};

	/**
	 * Performs a component-wise addition and stores the result locally. Equivalent of 'return (this = this + rhs);'.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @returns {Vector2} Self for chaining.
	 */
	Vector2.prototype.add = function (rhs) {
		return Vector2.add(this, rhs, this);
	};

	/**
	 * Performs a component-wise subtraction and stores the result in a separate vector. Equivalent of 'return (target = lhs - rhs);'.
	 * @param {Vector2|number[]|number} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2} [target] Target vector for storage.
	 * @returns {Vector2} A new vector if the target vector is omitted, else the target vector.
	 */
	Vector2.sub = function (lhs, rhs, target) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs];
		}

		if (!target) {
			target = new Vector2();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;


		target.x = ldata[0] - rdata[0];
		target.y = ldata[1] - rdata[1];

		return target;
	};

	/**
	 * Performs a component-wise subtraction and stores the result locally. Equivalent of 'return (this = this - rhs);'.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @returns {Vector2} Self for chaining.
	 */

	Vector2.prototype.sub = function (rhs) {
		return Vector2.sub(this, rhs, this);
	};

	/**
	 * Performs a component-wise multiplication and stores the result in a separate vector. Equivalent of 'return (target = lhs * rhs);'.
	 * @param {Vector2|number[]|number} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2} [target] Target vector for storage.
	 * @returns {Vector2} A new vector if the target vector is omitted, else the target vector.
	 */
	Vector2.mul = function (lhs, rhs, target) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs];
		}

		if (!target) {
			target = new Vector2();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		target.x = ldata[0] * rdata[0];
		target.y = ldata[1] * rdata[1];

		return target;
	};

	/**
	 * Performs a component-wise multiplication and stores the result locally. Equivalent of 'return (this = this * rhs);'.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @returns {Vector2} Self for chaining.
	 */
	Vector2.prototype.mul = function (rhs) {
		return Vector2.mul(this, rhs, this);
	};

	/**
	 * Performs a component-wise division and stores the result in a separate vector. Equivalent of 'return (target = lhs / rhs);'.
	 * @param {Vector2|number[]|number} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2} [target] Target vector for storage.
	 * @returns {Vector2} A new vector if the target vector is omitted, else the target vector.
	 */
	Vector2.div = function (lhs, rhs, target) {
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs];
		}

		if (!target) {
			target = new Vector2();
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		target.x = ldata[0] / rdata[0];
		target.y = ldata[1] / rdata[1];

		return target;
	};

	/**
	 * Performs a component-wise division and stores the result locally. Equivalent of 'return (this = this / rhs);'.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the right-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @returns {Vector2} Self for chaining.
	 */
	Vector2.prototype.div = function (rhs) {
		return Vector2.div(this, rhs, this);
	};

	/**
	 * Computes the dot product between two vectors. Equivalent of 'return lhs•rhs;'.
	 * @param {Vector2|number[]|number} lhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @returns {number} Dot product.
	 */
	Vector2.dot = function (lhs, rhs) {
		throw '';
		if (typeof lhs === 'number') {
			lhs = [lhs, lhs];
		}

		if (typeof rhs === 'number') {
			rhs = [rhs, rhs];
		}

		var ldata = lhs.data || lhs;
		var rdata = rhs.data || rhs;

		return ldata[0] * rdata[0] +
			ldata[1] * rdata[1];
	};

	/**
	 * Computes the dot product between two vectors. Equivalent of 'return this•rhs;'.
	 * @param {Vector2|number[]|number} rhs Vector, array of scalars or scalar on the left-hand side. For single scalars, the value is repeated for
	 *            every component.
	 * @returns {number} Dot product.
	 */
	Vector2.prototype.dot = function (rhs) {
		return Vector2.dot(this, rhs);
	};

	/**
	 * Computes the dot product between the current vector and 'rhs'.
	 * @param {Vector2} rhs
	 * @returns {number}
	 */
	Vector2.prototype.dotVector = function (rhs) {
		//var ldata = this.data;
		//var rdata = rhs.data;

		return this.x * rhs.x +
			this.y * rhs.y;
	};

	Vector2.prototype.equals = function (that) {
		return (Math.abs(this.x - that.x) <= MathUtils.EPSILON) &&
			(Math.abs(this.y - that.y) <= MathUtils.EPSILON);
	};

	/**
	 * Reflects a vector relative to the plane obtained from the normal parameter.
	 * @param {Vector2} normal Defines the plane that reflects the vector. Assumed to be of unit length.
	 * @returns {Vector2} Self to allow chaining
	 */
	Vector2.prototype.reflect = function (normal) {
		tmpVec.copy(normal);
		tmpVec.scale(2 * this.dotVector(normal));
		this.subVector(tmpVec);
		return this;
	};

	Vector2.prototype.lengthSquared = function () {
		return this.x * this.x + this.y * this.y;
	};

	/**
	 * Calculates length squared of vector
	 * @returns {number} length squared
	 */
	Vector2.prototype.length = function () {
		return Math.sqrt(this.lengthSquared());
	};

	Vector2.prototype.normalize = function () {
		var l = this.length();

		if (l < 0.0000001) { //AT: why is not MathUtil.EPSILON(^2) good?
			this.x = 0;
			this.y = 0;
		} else {
			l = 1.0 / l;
			this.x *= l;
			this.y *= l;
		}

		return this;
	};

	function addWarning(method, warning) {
		var warned = false;
		return function () {
			if (!warned) {
				warned = true;
				console.warn(warning);
			}
			return method.apply(this, arguments);
		};
	}

	/**
	 * Sets the vector's values from 2 numeric arguments
	 * @param {number} x
	 * @param {number} y
	 * @returns {Vector2} Self to allow chaining
	 * @example
	 * var v1 = new Vector2(); // v1 == (0, 0)
	 * v1.setDirect(2, 4); // v1 == (2, 4)
	 */
	Vector2.prototype.setDirect = function (x, y) {
		this.x = x;
		this.y = y;

		return this;
	};

	Vector2.prototype.setd = addWarning(
		Vector2.prototype.setDirect, '.setd is deprecated; please use .setDirect instead');

	/**
	 * Sets the vector's values from an array
	 * @param {number[]} array
	 * @returns {Vector2} Self to allow chaining
	 * @example
	 * var v1 = new Vector2(); // v1 == (0, 0)
	 * v1.setArray([2, 4]); // v1 == (2, 4)
	 */
	Vector2.prototype.setArray = function (array) {
		this.x = array[0];
		this.y = array[1];

		return this;
	};

	Vector2.prototype.seta = addWarning(
		Vector2.prototype.setArray, '.seta is deprecated; please use .setArray instead');

	/**
	 * Sets the vector's values from another vector
	 * @param {Vector2} vector
	 * @returns {Vector2} Self to allow chaining
	 * @example
	 * var v1 = new Vector2(); // v1 == (0, 0)
	 * v1.setVector(new Vector2(2, 4)); // v1 == (2, 4)
	 */
	Vector2.prototype.setVector = function (vector) {
		this.x = vector.x;
		this.y = vector.y;

		return this;
	};

	Vector2.prototype.setv = addWarning(
		Vector2.prototype.setVector, '.setv is deprecated; please use .setVector instead');

	/**
	 * Adds arguments 'x', 'y' to the current vector
	 * @param {number} x
	 * @param {number} y
	 * @returns {Vector2} this for chaining
	 * @example
	 * var v1 = new Vector2(1, 2); // v1 == (1, 2)
	 * v1.addd(2, 4); // v1 == (3, 6)
	 */
	Vector2.prototype.addDirect = function (x, y) {
		this.x += x;
		this.y += y;

		return this;
	};

	/**
	 * Adds the vector argument to the current vector
	 * @param {Vector2} vector
	 * @returns {Vector2} this for chaining
	 * @example
	 * var v1 = new Vector2(1, 2); // v1 == (1, 2)
	 * v1.addVector(new Vector2(2, 4)); // v1 == (3, 6)
	 */
	Vector2.prototype.addVector = function (vector) {
		this.x += vector.x;
		this.y += vector.y;

		return this;
	};


	/**
	 * Multiplies the vector by arguments 'x', 'y'
	 * @param {number} x
	 * @param {number} y
	 * @returns {Vector2} this for chaining
	 * @example
	 * var v1 = new Vector2(1, 2); // v1 == (1, 2)
	 * v1.mulDirect(2, 4); // v1 == (2, 8)
	 */
	Vector2.prototype.mulDirect = function (x, y) {
		this.x *= x;
		this.y *= y;

		return this;
	};

	/**
	 * Multiplies the vector by the argument
	 * @param {Vector2} vector
	 * @returns {Vector2} this for chaining
	 * @example
	 * var v1 = new Vector2(1, 2); // v1 == (1, 2)
	 * v1.mulVector(new Vector2(2, 4)); // v1 == (2, 8)
	 */
	Vector2.prototype.mulVector = function (vector) {
		this.x *= vector.x;
		this.y *= vector.y;

		return this;
	};


	/**
	 * Subtracts arguments 'x', 'y' form the current vector
	 * @param {number} x
	 * @param {number} y
	 * @returns {Vector2} this for chaining
	 * @example
	 * var v1 = new Vector2(1, 2); // v1 == (1, 2)
	 * v1.subd(2, 4); // v1 == (-1, -2)
	 */
	Vector2.prototype.subDirect = function (x, y) {
		this.x -= x;
		this.y -= y;

		return this;
	};

	/**
	 * Subtracts the vector argument from the current vector
	 * @param {Vector2} vector
	 * @returns {Vector2} this for chaining
	 * @example
	 * var v1 = new Vector2(1, 2); // v1 == (1, 2)
	 * v1.addVector(new Vector2(2, 4)); // v1 == (-1, -2)
	 */
	Vector2.prototype.subVector = function (vector) {
		this.x -= vector.x;
		this.y -= vector.y;

		return this;
	};


	/**
	 * Scales the vector by a factor
	 * @param {number} factor
	 * @returns {Vector2} Self for chaining
	 */
	Vector2.prototype.scale = function (factor) {
		this.x *= factor;
		this.y *= factor;
		return this;
	};

	/**
	 * Clones the vector.
	 * @returns {Vector2} Clone of self.
	 */
	Vector2.prototype.clone = function () {
		return new Vector2().copy(this);
	};

	/**
	 * Copies the values of another vector to this vector; an alias for .setVector
	 * @param {Vector2} Source vector
	 */
	Vector2.prototype.copy = Vector2.prototype.setVector;

	Vector2.prototype.copyTo = function (destination) {
		destination.x = this.x;
		destination.y = this.y;
		return this;
	};



	// #ifdef DEBUG
	/*Vector.addPostChecks(Vector2.prototype, [
		'add', 'sub', 'mul', 'div', 'invert', 'dot', 'dotVector',
		'reflect',
		'setDirect', 'setArray', 'setVector',
		'addDirect', 'addVector',
		'subDirect', 'subVector',
		'mulDirect', 'mulVector',
		'scale'
	]);*/
	// #endif

	return Vector2;
});
