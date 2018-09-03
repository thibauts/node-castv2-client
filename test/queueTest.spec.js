import queueExample from '../examples/queue';

jest.setTimeout(60000); // It usually takes 25 seconds

describe('Queue', () => {
  it('dynamic playlist changes', (done) => {
    queueExample(done);
  });
});
