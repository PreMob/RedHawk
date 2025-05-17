const vulnScanner = require('../services/vulnScanner');

describe('Vulnerability Scanner Service', () => {
  test('scanVulnerabilities should return an array', () => {
    const result = vulnScanner.scanVulnerabilities('http://example.com');
    expect(Array.isArray(result)).toBe(true);
  });
});
