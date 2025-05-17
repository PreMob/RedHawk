const fileParser = require('../utils/fileParser');

describe('File Parser Utility', () => {
  test('parseFile should return an array', () => {
    const result = fileParser.parseFile('dummyPath');
    expect(Array.isArray(result)).toBe(true);
  });
});
