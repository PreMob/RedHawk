function detectAnomalies(logEntries = []) {
  if (!Array.isArray(logEntries)) {
    return [];
  }

  return logEntries.filter((entry) => {
    const type = String(entry.type || entry.prediction || '').toLowerCase();
    const sensitivity = String(entry.sensitivity || '').toUpperCase();
    return type === 'anomaly' || sensitivity === 'HIGH';
  });
}

module.exports = {
  detectAnomalies
};
