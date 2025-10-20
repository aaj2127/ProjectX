/**
 * Music Genome Project Integration
 * 
 * While Pandora's Music Genome Project is proprietary, we can approximate
 * its functionality using:
 * 1. Spotify's Audio Features API (tempo, energy, valence, etc.)
 * 2. Last.fm's similar artists/tags
 * 3. Our own semantic analysis of user intent
 * 
 * This creates a "musical genome" that matches the book's emotional DNA.
 */

const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

class MusicGenomeService {
  
  /**
   * Analyze user intent and generate matching musical genome
   * @param {string} userIntent - User's paragraph describing the book
   * @param {string} coverStyle - Selected cover style
   * @param {string} coverMood - Selected cover mood
   * @returns {Object} Musical genome with tracks and attributes
   */
  async analyzeIntentAndGenerateGenome(userIntent, coverStyle, coverMood) {
    
    // Step 1: Extract emotional/thematic attributes from user intent
    const attributes = await this.extractMusicAttributes(userIntent, coverStyle, coverMood);
    
    // Step 2: Match attributes to actual songs (using Last.fm, Spotify, or internal DB)
    const matchedTracks = await this.findMatchingSongs(attributes);
    
    // Step 3: Create genome profile
    const genome = {
      attributes: attributes.primary,
      secondaryAttributes: attributes.secondary,
      tracks: matchedTracks,
      vibeProfile: attributes.vibe,
      emotionalTone: attributes.emotional,
      generatedAt: new Date().toISOString()
    };
    
    return genome;
  }

  /**
   * Extract musical attributes from user intent using Claude
   */
  async extractMusicAttributes(userIntent, coverStyle, coverMood) {
    const prompt = `Analyze this book description and extract musical/emotional attributes that would match its vibe:

USER INTENT:
${userIntent}

COVER: ${coverStyle} / ${coverMood}

Based on this, identify:
1. PRIMARY ATTRIBUTES (5-7): Musical characteristics (e.g., "melancholic", "uplifting", "introspective", "energetic", "nostalgic", "hopeful")
2. SECONDARY ATTRIBUTES (3-5): Supplementary vibes
3. VIBE PROFILE: One-sentence summary of the overall feeling
4. EMOTIONAL TONE: Dominant emotion (scale 0-1 for: melancholic, uplifting, introspective, energetic, nostalgic, romantic, rebellious, peaceful)
5. GENRE HINTS: Musical genres that match this vibe (e.g., "indie folk", "electronic", "lo-fi hip-hop")

Return as JSON:
{
  "primary": ["attr1", "attr2", ...],
  "secondary": ["attr3", "attr4", ...],
  "vibe": "one sentence summary",
  "emotional": {
    "melancholic": 0.0-1.0,
    "uplifting": 0.0-1.0,
    "introspective": 0.0-1.0,
    "energetic": 0.0-1.0,
    "nostalgic": 0.0-1.0,
    "romantic": 0.0-1.0,
    "rebellious": 0.0-1.0,
    "peaceful": 0.0-1.0
  },
  "genreHints": ["genre1", "genre2", ...]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }

  /**
   * Find songs that match the extracted attributes
   * This is where we'd integrate with:
   * - Spotify API for audio features
   * - Last.fm for similar tracks
   * - User's Last.fm history (aaj441)
   */
  async findMatchingSongs(attributes) {
    // For now, use Claude to suggest songs based on attributes
    // In production, this would query actual music APIs
    
    const prompt = `Based on these musical attributes, suggest 10 songs that perfectly match this vibe:

PRIMARY ATTRIBUTES: ${attributes.primary.join(', ')}
VIBE: ${attributes.vibe}
EMOTIONAL TONE: ${JSON.stringify(attributes.emotional, null, 2)}
GENRE HINTS: ${attributes.genreHints.join(', ')}

For each song, provide:
- Title
- Artist
- Why it matches (1 sentence)
- Match score (0-100)

Return as JSON array:
[{
  "title": "Song Title",
  "artist": "Artist Name",
  "reason": "Why it matches the vibe",
  "match": 95,
  "attributes": ["melancholic", "introspective", "acoustic"]
}]

Focus on songs that would be in the listening history of someone who described a book this way.
Include a mix of well-known and deep cuts.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }

  /**
   * Enhance genome with user's actual Last.fm data
   * @param {Object} genome - Base genome
   * @param {string} lastfmUsername - User's Last.fm username
   */
  async enhanceWithLastfmData(genome, lastfmUsername) {
    try {
      // Fetch user's Last.fm top tracks
      const lastfmData = await this.fetchLastfmTopTracks(lastfmUsername);
      
      // Find overlaps between genome suggestions and user's actual listening
      const personalizedTracks = this.findPersonalMatches(genome.tracks, lastfmData);
      
      return {
        ...genome,
        personalizedTracks,
        lastfmEnhanced: true
      };
      
    } catch (error) {
      console.error('Last.fm enhancement failed:', error);
      return genome; // Return base genome if enhancement fails
    }
  }

  /**
   * Fetch Last.fm top tracks
   */
  async fetchLastfmTopTracks(username) {
    // This would use the actual Last.fm API
    // For now, mock response
    return {
      topTracks: [],
      topArtists: [],
      topTags: []
    };
  }

  /**
   * Find tracks from user's listening history that match genome
   */
  findPersonalMatches(genomeTracks, lastfmData) {
    // Compare genome suggestions with user's actual history
    // Return tracks that:
    // 1. User has listened to
    // 2. Match the genome attributes
    // This makes the genome feel personal and familiar
    return [];
  }

  /**
   * Create "Pandora-style" attributes for a track
   * Simulates Music Genome Project analysis
   */
  generatePandoraStyleAttributes(track) {
    // Pandora analyzes songs on 450+ attributes
    // We can approximate with key ones:
    return {
      melodicAttributes: [
        'minor key tonality',
        'acoustic sonority',
        'extensive vamping'
      ],
      rhythmicAttributes: [
        'syncopated beats',
        'moderate tempo',
        '4/4 time signature'
      ],
      vocalAttributes: [
        'breathy vocals',
        'intimate singing',
        'confessional lyrics'
      ],
      instrumentalAttributes: [
        'acoustic guitar riffs',
        'sparse arrangement',
        'lo-fi production'
      ],
      emotionalAttributes: [
        'melancholic mood',
        'introspective tone',
        'vulnerable delivery'
      ]
    };
  }

  /**
   * Score how well a song matches the book intent
   * @param {Object} song - Song to score
   * @param {Object} intentAttributes - Attributes from user intent
   * @returns {number} Match score 0-100
   */
  calculateMatchScore(song, intentAttributes) {
    let score = 0;
    
    // Compare attributes
    const songAttrs = new Set(song.attributes || []);
    const intentAttrs = new Set(intentAttributes.primary.concat(intentAttributes.secondary));
    
    // Count overlaps
    const overlaps = [...songAttrs].filter(attr => intentAttrs.has(attr));
    score = (overlaps.length / intentAttrs.size) * 100;
    
    // Boost score if emotional tones align
    if (song.emotional && intentAttributes.emotional) {
      const emotionalMatch = this.compareEmotionalProfiles(
        song.emotional,
        intentAttributes.emotional
      );
      score = (score * 0.7) + (emotionalMatch * 30);
    }
    
    return Math.round(score);
  }

  /**
   * Compare two emotional profiles
   */
  compareEmotionalProfiles(profile1, profile2) {
    const emotions = Object.keys(profile1);
    let totalDiff = 0;
    
    emotions.forEach(emotion => {
      const diff = Math.abs(profile1[emotion] - profile2[emotion]);
      totalDiff += diff;
    });
    
    // Lower diff = better match
    const avgDiff = totalDiff / emotions.length;
    return Math.max(0, 1 - avgDiff);
  }
}

module.exports = new MusicGenomeService();
