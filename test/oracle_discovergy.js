var assert = require('assert');
    

describe('Bootstrap', function() {
  describe('DGY Bootstrap', function() {
    it('Test Bootstrap completed', function() {
      const Bootstrap=require("../oracles/discovergy/bootstrap.js");
      const Discovergy=require("../oracles/discovergy/discovergy.js");
      var bootstrap = new Bootstrap(function() {
                assert.ok(typeof bootstrap.deployment != "undefined");
                assert.ok(typeof bootstrap.ipfs != "undefined");
                assert.ok(typeof bootstrap.storage != "undefined");
                assert.ok(typeof bootstrap.config != "undefined");
    });
     
    });
  });
});
