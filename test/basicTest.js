var basicExample = require("../examples/basic");

describe('Basic', function() {
  it('base functions', function(done) {
      this.timeout(60000); //It usually takes 10 seconds
      basicExample(done);
  });
});
