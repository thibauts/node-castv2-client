import queueExample from '../examples/queue';

describe('Queue', () => {
  it('dynamic playlist changes', function (done) {
    this.timeout(60000); // It usually takes 25 seconds
    queueExample(done);
  });
});
