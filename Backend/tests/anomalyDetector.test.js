const anomalyDetector = require('../services/anomalyDetector');

describe('Anomaly Detector Service', () => {
  test('detectAnomalies should return an array', () => {
    const result = anomalyDetector.detectAnomalies('sample log data');
    expect(Array.isArray(result)).toBe(true);
  });
});
