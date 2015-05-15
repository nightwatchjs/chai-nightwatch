describe('expect', function () {
  var expect = chai.expect;

  it('assertion', function(){
    expect('foo').to.equal('foo');
  });
});
