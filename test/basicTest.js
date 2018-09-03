import basicExample from '../examples/basic';

describe('Basic', () => {
  it('base functions', function (done) {
    this.timeout(60000); // It usually takes 10 seconds
    basicExample(done);
  });
});
