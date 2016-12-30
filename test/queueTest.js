var queueExample = require("../examples/queue");
describe('Queue', function() {
  it('dynamic playlist changes', function(done) {
      this.timeout(20000);
      queueExample(done);
  });
});
