import basicExample from '../examples/basic';

jest.setTimeout(60000); // It usually takes 25 seconds

describe('Basic', () => {
  it('base functions', async () => {
    await basicExample();
  });
});
