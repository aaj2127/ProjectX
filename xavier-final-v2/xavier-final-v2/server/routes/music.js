const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get Last.fm profile data
router.get('/lastfm/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const apiKey = process.env.LASTFM_API_KEY;
    
    if (!apiKey) {
      return res.json({
        success: false,
        message: 'Last.fm API key not configured'
      });
    }
    
    // Get top artists
    const topArtists = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'user.gettopartists',
        user: username,
        api_key: apiKey,
        format: 'json',
        period: 'overall',
        limit: 50
      }
    });
    
    // Get recent tracks
    const recentTracks = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'user.getrecenttracks',
        user: username,
        api_key: apiKey,
        format: 'json',
        limit: 100
      }
    });
    
    res.json({
      success: true,
      data: {
        topArtists: topArtists.data.topartists.artist,
        recentTracks: recentTracks.data.recenttracks.track
      }
    });
    
  } catch (error) {
    console.error('Last.fm fetch failed:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Last.fm data',
      details: error.message 
    });
  }
});

// Analyze music data for book generation
router.post('/analyze', async (req, res) => {
  try {
    const { musicData } = req.body;
    
    // Extract patterns from music data
    const analysis = {
      topGenres: extractGenres(musicData),
      emotionalTone: analyzeEmotionalTone(musicData),
      themes: extractThemes(musicData),
      intensity: calculateIntensity(musicData)
    };
    
    res.json({
      success: true,
      analysis
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Helper functions
function extractGenres(musicData) {
  // Mock implementation
  return ['indie rock', 'folk', 'electronic'];
}

function analyzeEmotionalTone(musicData) {
  // Mock implementation
  return {
    melancholic: 0.7,
    uplifting: 0.4,
    introspective: 0.8,
    energetic: 0.5
  };
}

function extractThemes(musicData) {
  // Mock implementation
  return ['escapism', 'self-discovery', 'relationships', 'identity'];
}

function calculateIntensity(musicData) {
  // Mock implementation
  return 0.65;
}

module.exports = router;
