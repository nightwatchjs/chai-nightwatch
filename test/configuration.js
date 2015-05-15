describe('configuration', function () {
  var assert = require('assert');

  var origConfig;

  beforeEach(function() {
    // backup current config
    function clone(o) {
      return JSON.parse(JSON.stringify(o));
    }
    origConfig = clone(chai.config);
  });

  afterEach(function() {
    // restore config
    Object.keys(origConfig).forEach(function(key) {
      chai.config[key] = origConfig[key];
    });
  });

  function fooThrows () {
    chai.expect('foo').to.be.equal('bar');
  }

  describe('deprecated properties', function() {
    var origWarnFn;
    var warnings;

    beforeEach(function() {
      origWarnFn = console.warn;
      warnings = [];
      console.warn = function(message) {
        warnings.push(message);
      };
    });

    afterEach(function() {
      console.warn = origWarnFn;
    });

    it('Assertion.includeStack warns that it is deprecated', function() {
      chai.Assertion.includeStack;

      assert.equal(warnings.length, 1);
      assert.equal(warnings[0], 'Assertion.includeStack is deprecated, use chai.config.includeStack instead.');

      chai.Assertion.includeStack = true;

      assert.equal(warnings.length, 2);
      assert.equal(warnings[1], 'Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
    });

    it('Assertion.includeStack is kept in sync with config.includeStack', function() {
      assert.equal(chai.Assertion.includeStack, chai.config.includeStack);
      chai.Assertion.includeStack = !chai.Assertion.includeStack;
      assert.equal(chai.Assertion.includeStack, chai.config.includeStack);
      chai.config.includeStack = !chai.config.includeStack;
      assert.equal(chai.Assertion.includeStack, chai.config.includeStack);
    });

    it('Assertion.showDiff warns that it is deprecated', function() {
      chai.Assertion.showDiff;

      assert.equal(warnings.length, 1);
      assert.equal(warnings[0], 'Assertion.showDiff is deprecated, use chai.config.showDiff instead.');

      chai.Assertion.showDiff = true;

      assert.equal(warnings.length, 2);
      assert.equal(warnings[1], 'Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
    });

    it('Assertion.showDiff is kept in sync with config.showDiff', function() {
      assert.equal(chai.Assertion.showDiff, chai.config.showDiff);
      chai.Assertion.showDiff = !chai.Assertion.showDiff;
      assert.equal(chai.Assertion.showDiff, chai.config.showDiff);
      chai.config.showDiff = !chai.config.showDiff;
      assert.equal(chai.Assertion.showDiff, chai.config.showDiff);
    });
    
  });
});
