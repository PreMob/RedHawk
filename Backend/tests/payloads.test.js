const payloads = require('../utils/payloads');

describe('Payloads Utility', () => {
  test('payloads should be an array', () => {
    expect(Array.isArray(payloads.payloads)).toBe(true);
  });
});
