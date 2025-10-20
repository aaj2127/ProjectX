const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const musicGenomeService = require('../services/musicGenomeService');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Analyze user intent and generate musical genome
 * POST /api/books/analyze-intent
 */
router.post('/analyze-intent', async (req, res) => {
  try {
    const { userIntent, coverStyle, coverMood } = req.body;

    console.log('📝 Analyzing user intent...');

    // Generate musical genome from user's intent
    const musicGenome = await musicGenomeService.analyzeIntentAndGenerateGenome(
      userIntent,
      coverStyle,
      coverMood
    );

    console.log('🎵 Musical genome generated:', musicGenome.attributes);

    res.json({
      success: true,
      musicGenome: musicGenome.tracks.map(track => ({
        title: track.title,
        artist: track.artist,
        match: track.match,
        reason: track.reason,
        attributes: track.attributes
      })),
      vibeProfile: musicGenome.vibeProfile,
      attributes: musicGenome.attributes,
      emotionalTone: musicGenome.emotionalTone
    });

  } catch (error) {
    console.error('Intent analysis failed:', error);
    res.status(500).json({ error: 'Failed to analyze intent' });
  }
});

/**
 * Generate initial story pitches based on cover selection, user intent, and music genome
 * POST /api/books/generate-pitches
 */
router.post('/generate-pitches', async (req, res) => {
  try {
    const { coverStyle, coverMood, userIntent, musicGenome, maxPages } = req.body;

    const prompt = `Based on this information, generate 5 distinct story pitch ideas for a ${maxPages}-page book:

USER INTENT:
${userIntent}

COVER: ${coverStyle} / ${coverMood}

MUSICAL GENOME (songs that match the vibe):
${musicGenome.map(t => `- "${t.title}" by ${t.artist} (${t.match}% match)\n  Attributes: ${t.attributes.join(', ')}`).join('\n')}

INSTRUCTIONS:
Generate 5 story pitches that capture the emotional essence of both the user's intent AND the musical vibe.
Each pitch should feel like it could be the soundtrack to these songs.

For each pitch, provide:
1. Title (compelling, memorable)
2. Synopsis (2-3 sentences, hook-focused)
3. Keywords (5-7 words: themes, emotions, demographics)
4. Demographics (target audience tags)
5. Core elements (3-4 story pillars)
6. Musical Vibe (which song(s) this pitch most resonates with)
7. Music Match (0-100, how well it captures the musical genome)

Output as JSON array:
[{
  "id": "pitch_1",
  "title": "string",
  "synopsis": "string",
  "keywords": ["keyword1", "keyword2", ...],
  "demographics": ["demo1", "demo2", ...],
  "core": ["element1", "element2", ...],
  "musicVibe": "feels like [song] by [artist]",
  "musicMatch": 0-100
}]

Make each pitch DISTINCTLY different but all aligned with the user's intent and musical taste.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    });

    const pitches = JSON.parse(response.content[0].text);

    res.json({
      success: true,
      pitches,
      metadata: {
        coverStyle,
        coverMood,
        musicGenomeUsed: true,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Pitch generation failed:', error);
    res.status(500).json({ error: 'Failed to generate pitches' });
  }
});

/**
 * Generate refined pitch based on user feedback
 * POST /api/books/refine-pitch
 */
router.post('/refine-pitch', async (req, res) => {
  try {
    const { wordCloud, approvedElements, deniedElements } = req.body;

    const prompt = `Generate ONE new story pitch that learns from user feedback:

WORD CLOUD (higher weight = user likes more):
${JSON.stringify(wordCloud, null, 2)}

APPROVED ELEMENTS (user liked these):
${approvedElements.map(e => '- ' + e.join(', ')).join('\n')}

DENIED ELEMENTS (user disliked these):
${deniedElements.map(e => '- ' + e.join(', ')).join('\n')}

Create a NEW pitch that:
1. Emphasizes high-weight keywords from word cloud
2. Incorporates themes from approved elements
3. AVOIDS patterns from denied elements
4. Offers a fresh angle user hasn't seen yet

Return as single JSON object:
{
  "id": "pitch_refined_X",
  "title": "string",
  "synopsis": "string",
  "keywords": ["keyword1", "keyword2", ...],
  "demographics": ["demo1", "demo2", ...],
  "core": ["element1", "element2", ...]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    const pitch = JSON.parse(response.content[0].text);

    res.json({
      success: true,
      pitch
    });

  } catch (error) {
    console.error('Refined pitch generation failed:', error);
    res.status(500).json({ error: 'Failed to refine pitch' });
  }
});

/**
 * Create full book structure from approved pitches
 * POST /api/books/create-structure
 */
router.post('/create-structure', async (req, res) => {
  try {
    const { approvedPitches, wordCloud, coverStyle, maxPages } = req.body;

    const prompt = `Create a complete book structure from these approved story elements:

APPROVED PITCHES:
${approvedPitches.map(p => `
Title: ${p.title}
Synopsis: ${p.synopsis}
Keywords: ${p.keywords.join(', ')}
`).join('\n---\n')}

WORD CLOUD (emphasize these):
${JSON.stringify(wordCloud, null, 2)}

CONSTRAINTS:
- Maximum ${maxPages} pages
- Cover style: ${coverStyle}
- Should synthesize best elements from ALL approved pitches
- Create cohesive narrative

Provide:
1. Final book title
2. Comprehensive synopsis (paragraph)
3. Chapter-by-chapter breakdown with:
   - Chapter titles
   - 2-3 sentence summary per chapter
   - Estimated pages per chapter
4. Total page count (must be ≤ ${maxPages})

Return as JSON:
{
  "title": "string",
  "synopsis": "string",
  "chapters": [{
    "number": 1,
    "title": "string",
    "summary": "string",
    "estimatedPages": number
  }],
  "totalPages": number
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    const structure = JSON.parse(response.content[0].text);

    res.json({
      success: true,
      structure
    });

  } catch (error) {
    console.error('Structure creation failed:', error);
    res.status(500).json({ error: 'Failed to create structure' });
  }
});

/**
 * Generate full book content
 * POST /api/books/generate-full
 */
router.post('/generate-full', async (req, res) => {
  try {
    const { structure, wordCloud, maxPages, style } = req.body;

    // This would be a long-running job
    // For now, return a job ID and process async
    const jobId = `gen_${Date.now()}`;

    // Start async generation
    generateBookAsync(jobId, structure, wordCloud, maxPages, style);

    res.json({
      success: true,
      jobId,
      status: 'generating',
      estimatedTime: 180, // seconds
      message: 'Book generation started. Check status with GET /api/books/status/:jobId'
    });

  } catch (error) {
    console.error('Book generation failed:', error);
    res.status(500).json({ error: 'Failed to start generation' });
  }
});

/**
 * Check generation status
 * GET /api/books/status/:jobId
 */
router.get('/status/:jobId', async (req, res) => {
  const { jobId } = req.params;
  
  // In production, check actual job status from database/queue
  // For now, mock response
  res.json({
    jobId,
    status: 'complete',
    progress: 100,
    book: {
      id: 'book_' + jobId,
      pages: Array.from({ length: 96 }, (_, i) => ({
        number: i + 1,
        content: `Page ${i + 1} content...`
      }))
    }
  });
});

/**
 * Async book generation (would be in worker/queue in production)
 */
async function generateBookAsync(jobId, structure, wordCloud, maxPages, style) {
  try {
    const pages = [];
    
    for (const chapter of structure.chapters) {
      const prompt = `Write Chapter ${chapter.number}: "${chapter.title}"

Summary: ${chapter.summary}

Context:
- Book title: ${structure.title}
- Overall synopsis: ${structure.synopsis}
- Word cloud emphasis: ${Object.keys(wordCloud).join(', ')}
- Style: ${style}
- Target length: ~${chapter.estimatedPages} pages

Write the COMPLETE chapter content. Make it engaging, vivid, and true to the synopsis.
Aim for approximately ${chapter.estimatedPages * 250} words.`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: chapter.estimatedPages * 500,
        messages: [{ role: 'user', content: prompt }]
      });

      const chapterContent = response.content[0].text;
      
      // Split into pages (rough estimate: 250 words per page)
      const words = chapterContent.split(/\s+/);
      const wordsPerPage = 250;
      
      for (let i = 0; i < words.length; i += wordsPerPage) {
        pages.push({
          number: pages.length + 1,
          chapter: chapter.number,
          content: words.slice(i, i + wordsPerPage).join(' ')
        });
      }
    }

    // Save to database with jobId
    console.log(`Book generation complete for job ${jobId}: ${pages.length} pages`);
    
  } catch (error) {
    console.error(`Book generation failed for job ${jobId}:`, error);
  }
}

module.exports = router;
