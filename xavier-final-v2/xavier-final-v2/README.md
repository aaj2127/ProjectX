# Xavier Book Suite 📚🎵

Transform your music listening history into personalized books and publish them to Amazon KDP automatically.

## Features

- **Music Platform Integration**: Spotify, Last.fm, Apple Music, YouTube Music
- **AI Book Generation**: Claude-powered content creation
- **Amazon KDP Publishing**: One-click publishing with proper formatting
- **Book Editing Suite**: Full editor with real-time preview
- **Analytics Dashboard**: Track sales, rankings, and performance

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- AWS account (for S3 storage)
- Anthropic API key
- Last.fm API key (optional, for music data)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/xavier-book-suite.git
cd xavier-book-suite
```

2. **Install dependencies**
```bash
npm install
cd client && npm install
cd ..
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
# API Keys
ANTHROPIC_API_KEY=your_anthropic_key
LASTFM_API_KEY=your_lastfm_key
SPOTIFY_CLIENT_ID=your_spotify_id
SPOTIFY_CLIENT_SECRET=your_spotify_secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/xavier

# AWS (for file storage)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_BUCKET_NAME=xavier-books

# App
PORT=3001
NODE_ENV=development
```

4. **Initialize database**
```bash
npm run db:migrate
```

5. **Run the application**
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Project Structure

```
xavier-book-suite/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   └── App.jsx
│   └── package.json
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── index.js
├── database/             # Database schemas
├── .env.example         # Environment template
├── package.json
└── README.md
```

## Usage

### 1. Connect Music Platform
- Navigate to Settings
- Connect your Last.fm, Spotify, or other music account
- System will analyze your listening history

### 2. Generate Book
- Review AI-generated book recommendations
- Customize themes, genres, and keywords
- Click "Generate Book" (takes ~2-3 minutes)

### 3. Edit Book
- Use the built-in editor to refine content
- Adjust chapter order, titles, and content
- Preview in real-time

### 4. Publish to Amazon KDP
- One-click export to PDF/EPUB
- Automatic cover generation
- Submit directly to Amazon KDP

## API Documentation

### Generate Book Recommendation
```javascript
POST /api/books/recommend
{
  "userId": "user_123",
  "musicData": { /* listening history */ },
  "preferences": {
    "genre": "contemporary fiction",
    "keywords": ["escape", "journey", "discovery"]
  }
}
```

### Create Book
```javascript
POST /api/books/generate
{
  "userId": "user_123",
  "recommendationId": "rec_456",
  "customization": {
    "chapters": 12,
    "wordCount": 25000
  }
}
```

## Cost Breakdown

- **Book Generation**: ~$3.61 per book (Claude API usage)
- **Storage**: ~$0.023/month per book (AWS S3)
- **Total**: Break-even at 2 book sales

## Roadmap

- [ ] Multi-language support
- [ ] Mobile app (iOS/Android)
- [ ] Audiobook generation
- [ ] Print-on-demand integration
- [ ] Author collaboration tools

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [wiki](https://github.com/yourusername/xavier-book-suite/wiki)
- Issues: [GitHub Issues](https://github.com/yourusername/xavier-book-suite/issues)
- Email: support@xavier-books.com

## Credits

Built with:
- [Claude](https://claude.ai) - AI content generation
- [React](https://react.dev) - Frontend framework
- [Node.js](https://nodejs.org) - Backend runtime
- [PostgreSQL](https://postgresql.org) - Database

---

**Note**: This is a working prototype. Production deployment requires additional security hardening and scalability considerations.
