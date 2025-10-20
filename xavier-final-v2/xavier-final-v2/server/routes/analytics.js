const express = require('express');
const router = express.Router();

// Get user analytics
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Mock analytics data
    const analytics = {
      booksGenerated: 5,
      totalWordCount: 125000,
      averageRating: 4.2,
      salesData: {
        total: 47,
        thisMonth: 12,
        revenue: 141.00
      },
      topPerforming: {
        title: "The Runaway's Manifesto",
        sales: 18,
        rating: 4.5
      }
    };
    
    res.json({
      success: true,
      analytics
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Track event
router.post('/track', async (req, res) => {
  try {
    const { eventType, data } = req.body;
    
    // Save event to database
    console.log('Event tracked:', eventType, data);
    
    res.json({
      success: true,
      message: 'Event tracked'
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to track event' });
  }
});

module.exports = router;
