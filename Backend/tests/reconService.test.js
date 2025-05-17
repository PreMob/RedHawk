const reconService = require('../services/reconService');

describe('Recon Service', () => {
  test('performRecon should return an object', () => {
    const result = reconService.performRecon('https://example.com');
    expect(typeof result).toBe('object');
  });
});
