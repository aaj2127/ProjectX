const express = require('express');
const router = express.Router();

// Mock authentication for development
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // TODO: Implement real authentication
    const user = {
      id: 'user_123',
      email: email,
      name: 'Test User'
    };
    
    res.json({
      success: true,
      user,
      token: 'mock_token_' + Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    res.json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', async (req, res) => {
  try {
    res.json({
      id: 'user_123',
      email: 'user@example.com',
      name: 'Test User'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
