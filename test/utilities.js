var assert = require('assert');

describe('utilities', function () {
  var expect = chai.expect;

  after(function() {
    // Some clean-up so we can run tests in a --watch
    delete chai.Assertion.prototype.eqqqual;
    delete chai.Assertion.prototype.result;
    delete chai.Assertion.prototype.doesnotexist;
  });

  it('transferFlags', function () {
    var foo = 'bar'
      , test = expect(foo).not;

    chai.use(function (_chai, utils) {
      var obj = {};
      utils.transferFlags(test, obj);
      expect(utils.flag(obj, 'object')).to.equal(foo);
      expect(utils.flag(obj, 'negate')).to.equal(true);
    });
  });

  it('transferFlags, includeAll = false', function () {
    var foo = 'bar';

    chai.use(function (_chai, utils) {
      var obj = {};
      var test = function() {};

      var assertion = new chai.Assertion({}, "message", test);
      var flag = {};
      utils.flag(obj, 'flagMe', flag);
      utils.flag(obj, 'negate', true);
      utils.transferFlags(test, obj, false);

      expect(utils.flag(obj, 'object')).to.equal(undefined);
      expect(utils.flag(obj, 'message')).to.equal(undefined);
      expect(utils.flag(obj, 'ssfi')).to.equal(undefined);
      expect(utils.flag(obj, 'negate')).to.equal(true);
      expect(utils.flag(obj, 'flagMe')).to.equal(flag);
    });
  });


  it('getPathValue', function () {
    var object = {
        hello: 'universe'
      , universe: {
          hello: 'world'
        }
      , world: [ 'hello', 'universe' ]
      , complex: [
            { hello: 'universe' }
          , { universe: 'world' }
          , [ { hello: 'world' } ]
        ]
    }

    var arr = [ [ true ] ];

    chai.use(function (_chai, utils) {
      var gpv = utils.getPathValue;
      expect(gpv('hello', object)).to.equal('universe');
      expect(gpv('universe.hello', object)).to.equal('world');
      expect(gpv('world[1]', object)).to.equal('universe');
      expect(gpv('complex[1].universe', object)).to.equal('world');
      expect(gpv('complex[2][0].hello', object)).to.equal('world');
      expect(gpv('[0][0]', arr)).to.be.true;
    });
  });

  it('addMethod', function () {
    chai.use(function(_chai, utils) {
      _chai.Assertion.addMethod('eqqqual', function (str) {
        var object = utils.flag(this, 'object');
      });
    });

    expect('spec').to.eqqqual('spec');
  });

  it('addMethod returning result', function () {
    chai.use(function(_chai, utils) {
      _chai.Assertion.addMethod('result', function () {
        return 'result';
      })
    });

    expect(expect('foo').result()).to.equal('result');
  });

  it('overwriteMethod', function () {
    chai.use(function (_chai, _) {
      _chai.Assertion.overwriteMethod('eqqqual', function (_super) {
        return function (str) {
          var object = _.flag(this, 'object');
          if (object == 'cucumber' && str == 'cuke') {
            _.flag(this, 'cucumber', true);
          } else {
            _super.apply(this, arguments);
          }
        };
      });

    });

    var vege = expect('cucumber').to.eqqqual('cucumber');
    assert.ok(typeof vege.__flags['cucumber'] == 'undefined');
    var cuke = expect('cucumber').to.eqqqual('cuke');
    assert.ok(typeof cuke.__flags['cucumber'] !== 'undefined');

    chai.use(function (_chai, _) {
      _chai.Assertion.overwriteMethod('doesnotexist', function (_super) {
        assert(typeof _super == 'function');
        return function () {
          _.flag(this, 'doesnt', true);
          _super.apply(this, arguments);
        }
      });
    });

    var dne = expect('something').to.doesnotexist();
    assert.ok(dne.__flags['doesnt']);
  });

  it('overwriteMethod returning result', function () {
    chai.use(function (_chai, _) {
      _chai.Assertion.overwriteMethod('result', function (_super) {
        return function () {
          return 'result';
        }
      });
    });

    expect(expect('foo').result()).to.equal('result');
  });

  it('addProperty', function () {
    chai.use(function (_chai, _) {
      _chai.Assertion.addProperty('tea', function () {
        _.flag(this, 'tea', 'chai');
      });
    });

    var assert = expect('chai').to.be.tea;
    expect(assert.__flags.tea).to.equal('chai');
  });

  it('addProperty returning result', function () {
    chai.use(function(_chai, _) {
      _chai.Assertion.addProperty('result', function () {
        return 'result';
      })
    });

    expect(expect('foo').result).to.equal('result');
  });

  it('overwriteProperty', function () {
    chai.use(function (_chai, _) {
      _chai.Assertion.overwriteProperty('tea', function (_super) {
        return function () {
          var act = _.flag(this, 'object');
          if (act === 'matcha') {
            _.flag(this, 'tea', 'matcha');
          } else {
            _super.call(this);
          }
        }
      });
    });

    var matcha = expect('matcha').to.be.tea;
    assert(matcha.__flags.tea, 'matcha');
    var assertTea = expect('something').to.be.tea;
    assert(assertTea.__flags.tea, 'chai');
  });

  it('overwriteProperty returning result', function () {
    chai.use(function(_chai, _) {
      _chai.Assertion.overwriteProperty('result', function (_super) {
        return function () {
          return 'result';
        }
      });
    });

    expect(expect('foo').result).to.equal('result');
  });

  it('getMessage', function () {
    chai.use(function (_chai, _) {
      expect(_.getMessage({}, [])).to.equal('');
      expect(_.getMessage({}, [null, null, null])).to.equal('');

      var obj = {};
      _.flag(obj, 'message', 'foo');
      assert(_.getMessage(obj, []).indexOf('foo') > -1);

      var obj = {};
      var msg = function() { return "expected a to eql b"; }
      var negateMsg = function() { return "expected a not to eql b"; }
      expect(_.getMessage(obj, [null, msg, negateMsg])).to.equal("expected a to eql b");
      _.flag(obj, 'negate', true);
      expect(_.getMessage(obj, [null, msg, negateMsg])).to.equal("expected a not to eql b");
    });
  });

  it('inspect with custom object-returning inspect()s', function () {
    chai.use(function (_chai, _) {
      var obj = {
        outer: {
          inspect: function () {
            return { foo: 'bar' };
          }
        }
      };

      expect(_.inspect(obj)).to.equal('{ outer: { foo: \'bar\' } }');
    });
  });

  it('inspect negative zero', function () {
    chai.use(function (_chai, _) {
      expect(_.inspect(-0)).to.equal('-0');
      expect(_.inspect([-0])).to.equal('[ -0 ]');
      expect(_.inspect({ hp: -0 })).to.equal('{ hp: -0 }');
    });
  });

  it('addChainableMethod', function () {
    chai.use(function (_chai, _) {
      _chai.Assertion.addChainableMethod('x',
        function () {
          new chai.Assertion(this._obj).to.be.equal('x');
        }
      , function () {
          this._obj = this._obj || {};
          this._obj.__x = 'X!'
        }
      );

      expect("foo").x.to.equal("foo");
      expect("x").x();
    })
  });

  it('overwriteChainableMethod', function () {
    chai.use(function (_chai, _) {
      _chai.Assertion.overwriteChainableMethod('x',
        function(_super) {
          return function() {
            if (_.flag(this, 'marked')) {
              new chai.Assertion(this._obj).to.be.equal('spot');
            } else {
              _super.apply(this, arguments);
            }
          };
        }
      , function(_super) {
          return function() {
            _.flag(this, 'message', 'x marks the spot');
            _super.apply(this, arguments);
          };
        }
      );

      // Make sure the original behavior of 'x' remains the same
      expect('foo').x.to.equal("foo");
      expect("x").x();
    });
  });

});
