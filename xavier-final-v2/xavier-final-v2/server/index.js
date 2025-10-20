require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/music', require('./routes/music'));
app.use('/api/books', require('./routes/books'));
app.use('/api/books', require('./routes/story-workflow')); // New workflow
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/canva', require('./routes/canva'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Xavier Book Suite server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
