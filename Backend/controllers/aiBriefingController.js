const threatBriefingService = require('../services/threatBriefingService');

exports.getBriefing = async (req, res) => {
  try {
    const briefing = await threatBriefingService.getThreatBriefing();
    res.status(200).json({ briefing });
  } catch (error) {
    console.error('Error generating AI threat briefing:', error);
    res.status(500).json({
      error: 'Failed to generate AI threat briefing',
      details: error.message
    });
  }
};
