const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Generate book recommendation
router.post('/recommend', async (req, res) => {
  try {
    const { userId, musicData, preferences } = req.body;
    
    const prompt = `Based on this music listening data, recommend a book concept:
    
Top Artists: ${musicData.topArtists.join(', ')}
Top Genres: ${musicData.topGenres.join(', ')}
Listening Patterns: ${musicData.patterns}
User Preferences: ${JSON.stringify(preferences)}

Generate a book recommendation with:
1. Title
2. Subtitle  
3. Genre
4. Brief synopsis (3-4 sentences)
5. Target audience
6. Key themes
7. Chapter outline (12 chapters with titles and brief descriptions)

Format as JSON.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    const recommendation = JSON.parse(response.content[0].text);
    
    // Save to database
    // const result = await pool.query(...)
    
    res.json({ 
      success: true, 
      recommendation,
      estimatedCost: 3.61
    });
    
  } catch (error) {
    console.error('Recommendation failed:', error);
    res.status(500).json({ error: 'Failed to generate recommendation' });
  }
});

// Generate full book
router.post('/generate', async (req, res) => {
  try {
    const { userId, recommendationId, customization } = req.body;
    
    // Fetch recommendation from DB
    // Generate each chapter using Claude
    // Save book to database
    
    res.json({
      success: true,
      bookId: 'book_123',
      status: 'generating',
      estimatedTime: 180 // seconds
    });
    
  } catch (error) {
    console.error('Generation failed:', error);
    res.status(500).json({ error: 'Failed to generate book' });
  }
});

// Get current book
router.get('/current', async (req, res) => {
  try {
    // Mock data for development
    const book = {
      id: 1,
      title: "The Runaway's Manifesto",
      subtitle: "A tale of escapism and self-discovery",
      chapters: [
        {
          id: 1,
          number: 1,
          title: "Blueprint for Nowhere",
          content: "Maya wins prestigious architecture competition at age 16...",
          wordCount: 2100
        }
      ],
      style: {
        cover: 'modern',
        color: 'purple',
        font: 'Georgia'
      },
      metadata: {
        genre: 'Contemporary Fiction',
        targetAge: '16+',
        wordCount: 25000
      }
    };
    
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load book' });
  }
});

// Save book
router.post('/save', async (req, res) => {
  try {
    const book = req.body;
    
    // Save to database
    // await pool.query(...)
    
    res.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save book' });
  }
});

// Export book
router.post('/export/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const book = req.body;
    
    if (format === 'pdf') {
      // Generate PDF
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      
      for (const chapter of book.chapters) {
        const page = pdfDoc.addPage();
        const { height } = page.getSize();
        
        page.drawText(chapter.title, {
          x: 50,
          y: height - 100,
          size: 24,
          font
        });
        
        page.drawText(chapter.content, {
          x: 50,
          y: height - 150,
          size: 12,
          font,
          maxWidth: 500
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      res.contentType('application/pdf');
      res.send(Buffer.from(pdfBytes));
      
    } else if (format === 'epub') {
      // Generate EPUB
      res.json({ message: 'EPUB export coming soon' });
    }
    
  } catch (error) {
    console.error('Export failed:', error);
    res.status(500).json({ error: 'Failed to export book' });
  }
});

module.exports = router;
