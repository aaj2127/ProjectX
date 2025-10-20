# 🔧 Troubleshooting Xavier Book Suite

## 500 Server Error - Quick Fixes

### Issue 1: Missing Environment Variables
**Symptom**: Server starts but APIs return 500 errors

**Fix**:
```bash
# Copy the example env file
cp .env.example .env

# Edit with your actual keys
nano .env  # or use your preferred editor
```

**Required variables**:
- `ANTHROPIC_API_KEY` - Get from https://console.anthropic.com
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Default: 3001

### Issue 2: Missing Dependencies
**Symptom**: Module not found errors

**Fix**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: Database Connection Failed
**Symptom**: Cannot connect to database

**Fix**:
```bash
# Option A: Use SQLite for development (simpler)
npm install sqlite3
# Update DATABASE_URL in .env:
# DATABASE_URL=sqlite:./dev.db

# Option B: Install PostgreSQL
# Mac: brew install postgresql
# Ubuntu: sudo apt install postgresql
# Windows: Download from postgresql.org
```

### Issue 4: Port Already in Use
**Symptom**: Error: listen EADDRINUSE :::3001

**Fix**:
```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

## Testing the Server

### Step 1: Start Server
```bash
npm run dev
```

Expected output:
```
🚀 Xavier Book Suite server running on port 3001
📚 Environment: development
```

### Step 2: Test Health Endpoint
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-10-20T..."}
```

### Step 3: Test Books API
```bash
curl http://localhost:3001/api/books/current
```

Should return mock book data

## Common Issues & Solutions

### "Cannot find module"
```bash
npm install
```

### "ANTHROPIC_API_KEY is not defined"
```bash
# Add to .env file
echo "ANTHROPIC_API_KEY=your_key_here" >> .env
```

### "Database connection refused"
```bash
# Check PostgreSQL is running
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### "Permission denied"
```bash
# Make scripts executable
chmod +x test-server.sh
chmod +x *.sh
```

## Development Mode Without API Keys

If you don't have API keys yet, you can still test:

1. **Comment out Claude API calls** in `server/routes/books.js`
2. **Use mock data** (already included)
3. **Skip music integration** temporarily

```javascript
// In server/routes/books.js
// Comment out this:
// const response = await anthropic.messages.create(...)

// Use this instead:
const recommendation = {
  title: "Mock Book",
  subtitle: "Test subtitle",
  // ... mock data
};
```

## Still Having Issues?

### Check Server Logs
```bash
npm run server 2>&1 | tee server.log
```

### Enable Debug Mode
```bash
# In .env
NODE_ENV=development
DEBUG=*
```

### Verify File Structure
```bash
tree -L 3
```

Should see:
```
xavier-book-suite/
├── server/
│   ├── index.js
│   └── routes/
│       ├── auth.js
│       ├── books.js
│       ├── music.js
│       └── analytics.js
├── package.json
├── .env
└── .env.example
```

## Getting Help

1. **Check logs**: Look at server console output
2. **Test endpoints**: Use curl or Postman
3. **Verify env**: Make sure all required variables are set
4. **Check dependencies**: Run `npm list` to see installed packages

## Quick Reset

If everything is broken:
```bash
# Nuclear option - start fresh
rm -rf node_modules package-lock.json
rm .env
cp .env.example .env
npm install
npm run dev
```

## Contact

If you're still stuck:
- Check the GitHub Issues
- Review the full README.md
- Look at example requests in `/examples` folder
