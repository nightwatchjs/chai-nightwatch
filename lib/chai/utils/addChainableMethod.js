/*!
 * Based on chai library
 * http://chaijs.com
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
const transferFlags = require('./transferFlags');
const flag = require('./flag');
const config = require('../config');

// Check whether `__proto__` is supported
const hasProtoSupport = '__proto__' in Object;

// Without `__proto__` support, this module will need to add properties to a function.
// However, some Function.prototype methods cannot be overwritten,
// and there seems no easy cross-platform way to detect them (@see chaijs/chai/issues/69).
const excludeNames = /^(?:length|name|arguments|caller)$/;

// Cache `Function` properties
const call  = Function.prototype.call;
const apply = Function.prototype.apply;

/**
 * ### addChainableMethod (ctx, name, method, chainingBehavior)
 *
 * Adds a method to an object, such that the method can also be chained.
 *
 *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);
 *
 * The result can then be used as both a method assertion, executing both `method` and
 * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.
 *
 *     expect(fooStr).to.be.foo('bar');
 *     expect(fooStr).to.be.foo.equal('foo');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for `name`, when called
 * @param {Function} chainingBehavior function to be called every time the property is accessed
 * @name addChainableMethod
 * @api public
 */

module.exports = function (ctx, name, method, chainingBehavior) {
  if (typeof chainingBehavior !== 'function') {
    chainingBehavior = function () { };
  }

  var chainableBehavior = {
      method: method
    , chainingBehavior: chainingBehavior
  };

  // save the methods so we can overwrite them later, if we need to.
  if (!ctx.__methods) {
    ctx.__methods = {};
  }
  ctx.__methods[name] = chainableBehavior;

  Object.defineProperty(ctx, name, {
    get: function () {
      chainableBehavior.chainingBehavior.call(this);

      const assert = function assert() {
        const old_ssfi = flag(this, 'ssfi');

        if (old_ssfi && config.includeStack === false) {
          flag(this, 'ssfi', assert);
        }

        const result = chainableBehavior.method.apply(this, arguments);

        return result === undefined ? this : result;
      };

      // Use `__proto__` if available
      if (hasProtoSupport) {
        // Inherit all properties from the object by replacing the `Function` prototype
        const prototype = assert.__proto__ = Object.create(this);
        // Restore the `call` and `apply` methods from `Function`
        prototype.call = call;
        prototype.apply = apply;
      }
      // Otherwise, redefine all properties (slow!)
      else {
        const asserterNames = Object.getOwnPropertyNames(ctx);

        asserterNames.forEach(function (asserterName) {
          if (!excludeNames.test(asserterName)) {
            const pd = Object.getOwnPropertyDescriptor(ctx, asserterName);
            Object.defineProperty(assert, asserterName, pd);
          }
        });
      }

      transferFlags(this, assert);

      return assert;
    }, configurable: true
  });
};
