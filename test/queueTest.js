var queueExample = require("../examples/queue");
describe('Queue', function() {
  it('dynamic playlist changes', function(done) {
      this.timeout(60000); //It usually takes 25 seconds
      queueExample(done);
  });
});
