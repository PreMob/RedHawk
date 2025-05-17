const summarizer = require('../services/summarizer');

describe('Summarizer Service', () => {
  test('generateReport should return a string', () => {
    const result = summarizer.generateReport([{ id: 1, detail: 'test' }]);
    expect(typeof result).toBe('string');
  });
});
