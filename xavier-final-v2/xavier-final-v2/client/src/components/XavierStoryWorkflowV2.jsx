import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Sparkles, Book, Wand2, ArrowRight, Music, Lightbulb } from 'lucide-react';

const XavierStoryWorkflow = () => {
  const [step, setStep] = useState(1); // 1: Cover, 2: Intent, 3: Story Pitch, 4: Structure, 5: Generate, 6: Edit
  const [selectedCover, setSelectedCover] = useState(null);
  const [userIntent, setUserIntent] = useState('');
  const [musicGenome, setMusicGenome] = useState([]);
  const [storyPitches, setStoryPitches] = useState([]);
  const [approvedPitches, setApprovedPitches] = useState([]);
  const [deniedPitches, setDeniedPitches] = useState([]);
  const [wordCloud, setWordCloud] = useState({});
  const [bookStructure, setBookStructure] = useState(null);
  const [generatedBook, setGeneratedBook] = useState(null);
  const [loading, setLoading] = useState(false);

  // Update word cloud in real-time based on approvals/denials
  useEffect(() => {
    const newCloud = {};
    
    approvedPitches.forEach(pitch => {
      pitch.keywords.forEach(keyword => {
        newCloud[keyword] = (newCloud[keyword] || 0) + 3;
      });
      pitch.demographics.forEach(demo => {
        newCloud[demo] = (newCloud[demo] || 0) + 2;
      });
    });
    
    deniedPitches.forEach(pitch => {
      pitch.keywords.forEach(keyword => {
        newCloud[keyword] = (newCloud[keyword] || 0) - 1;
      });
    });
    
    Object.keys(newCloud).forEach(key => {
      if (newCloud[key] <= 0) delete newCloud[key];
    });
    
    setWordCloud(newCloud);
  }, [approvedPitches, deniedPitches]);

  // STEP 1: Cover Selection
  const coverOptions = [
    { id: 1, url: '/covers/blue-ocean.jpg', style: 'corporate', mood: 'professional', color: 'from-blue-500 to-purple-600' },
    { id: 2, url: '/covers/abstract.jpg', style: 'modern', mood: 'innovative', color: 'from-purple-500 to-pink-600' },
    { id: 3, url: '/covers/minimalist.jpg', style: 'clean', mood: 'focused', color: 'from-gray-700 to-gray-900' },
    { id: 4, url: '/covers/warm.jpg', style: 'warm', mood: 'emotional', color: 'from-orange-500 to-red-600' }
  ];

  const selectCover = (cover) => {
    setSelectedCover(cover);
    setStep(2);
  };

  // STEP 2: Process User Intent & Generate Music Genome
  const processIntent = async () => {
    if (!userIntent.trim()) {
      alert('Please describe your book idea!');
      return;
    }

    setLoading(true);

    try {
      // Analyze intent and generate music genome
      const response = await fetch('/api/books/analyze-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIntent,
          coverStyle: selectedCover.style,
          coverMood: selectedCover.mood
        })
      });

      const data = await response.json();
      setMusicGenome(data.musicGenome);
      
      // Generate story pitches based on intent + music
      generateStoryPitches(data.musicGenome);
      
      setStep(3);
    } catch (error) {
      console.error('Intent analysis failed:', error);
      alert('Failed to analyze intent. Please try again.');
    }

    setLoading(false);
  };

  // STEP 3: Generate Story Pitches
  const generateStoryPitches = async (genome) => {
    setLoading(true);
    
    const response = await fetch('/api/books/generate-pitches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coverStyle: selectedCover.style,
        coverMood: selectedCover.mood,
        userIntent: userIntent,
        musicGenome: genome,
        maxPages: 96
      })
    });
    
    const data = await response.json();
    setStoryPitches(data.pitches);
    setLoading(false);
  };

  // Handle pitch approval/denial
  const handlePitchVote = (pitch, approved) => {
    if (approved) {
      setApprovedPitches([...approvedPitches, pitch]);
    } else {
      setDeniedPitches([...deniedPitches, pitch]);
    }
    
    setStoryPitches(storyPitches.filter(p => p.id !== pitch.id));
    generateRefinedPitch();
  };

  const generateRefinedPitch = async () => {
    const response = await fetch('/api/books/refine-pitch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wordCloud,
        approvedElements: approvedPitches.map(p => p.core),
        deniedElements: deniedPitches.map(p => p.core),
        musicGenome
      })
    });
    
    const data = await response.json();
    setStoryPitches([...storyPitches, data.pitch]);
  };

  // Approve structure
  const approveStructure = async () => {
    setLoading(true);
    
    const response = await fetch('/api/books/create-structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approvedPitches,
        wordCloud,
        coverStyle: selectedCover.style,
        userIntent,
        musicGenome,
        maxPages: 96
      })
    });
    
    const data = await response.json();
    setBookStructure(data.structure);
    setStep(4);
    setLoading(false);
  };

  // Generate full book
  const generateFullBook = async () => {
    setLoading(true);
    
    const response = await fetch('/api/books/generate-full', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structure: bookStructure,
        wordCloud,
        musicGenome,
        maxPages: 96,
        style: selectedCover.style
      })
    });
    
    const data = await response.json();
    setGeneratedBook(data.book);
    setStep(5);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          {['Cover', 'Intent', 'Music', 'Story', 'Generate'].map((label, idx) => (
            <div key={idx} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step > idx + 1 ? 'bg-green-500 text-white' :
                step === idx + 1 ? 'bg-purple-600 text-white' :
                'bg-gray-300 text-gray-500'
              }`}>
                {step > idx + 1 ? '✓' : idx + 1}
              </div>
              <span className="ml-2 text-sm font-medium">{label}</span>
              {idx < 4 && <div className="w-12 h-1 mx-3 bg-gray-300" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* STEP 1: Cover Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold mb-2">Choose Your Cover Style</h2>
            <p className="text-gray-600 mb-8">This sets the visual tone for your book</p>
            
            <div className="grid grid-cols-4 gap-6">
              {coverOptions.map(cover => (
                <div
                  key={cover.id}
                  onClick={() => selectCover(cover)}
                  className="cursor-pointer border-4 border-transparent hover:border-purple-600 rounded-lg overflow-hidden transition transform hover:scale-105"
                >
                  <div className={`bg-gradient-to-br ${cover.color} h-48 flex items-center justify-center text-white text-xl font-bold`}>
                    {cover.style.toUpperCase()}
                  </div>
                  <div className="bg-white p-4">
                    <div className="font-semibold capitalize">{cover.style}</div>
                    <div className="text-sm text-gray-600 capitalize">{cover.mood}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: User Intent Paragraph */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="w-8 h-8 text-yellow-500" />
                <h2 className="text-3xl font-bold">Describe Your Vision</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                Tell us about your book in a paragraph. Include:
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="font-semibold text-purple-900 mb-2">🎯 Goal</div>
                  <div className="text-sm text-purple-700">What do you want readers to feel/learn?</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-semibold text-blue-900 mb-2">👥 Audience</div>
                  <div className="text-sm text-blue-700">Who is this book for?</div>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <div className="font-semibold text-pink-900 mb-2">🎨 Vibe</div>
                  <div className="text-sm text-pink-700">What's the tone/feeling?</div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Book Intent
                </label>
                <textarea
                  value={userIntent}
                  onChange={(e) => setUserIntent(e.target.value)}
                  placeholder="Example: I want to write a book that helps burned-out millennials in corporate jobs find the courage to pursue their creative passions. The tone should be empowering but realistic, with a touch of humor. Think of it as a friend giving honest advice over coffee. Target audience: 28-40 year olds feeling stuck in their careers, probably listen to indie rock and podcasts about meaning."
                  className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none resize-none"
                />
                <div className="text-sm text-gray-500 mt-2">
                  {userIntent.length} characters • Be specific!
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-semibold text-yellow-900 mb-1">What happens next:</div>
                    <div className="text-yellow-800">
                      We'll analyze your intent and match it with songs that have the same vibe.
                      This creates a "musical genome" that shapes your story's emotional DNA.
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={processIntent}
                disabled={loading || !userIntent.trim()}
                className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>Analyzing your vision...</>
                ) : (
                  <>
                    <Music className="w-6 h-6" />
                    Generate Musical Genome
                  </>
                )}
              </button>
            </div>

            {/* Selected Cover Preview */}
            <div className="mt-6 bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 bg-gradient-to-br ${selectedCover.color} rounded-lg`}></div>
                <div>
                  <div className="text-sm text-gray-600">Selected Cover Style</div>
                  <div className="font-semibold capitalize">{selectedCover.style} • {selectedCover.mood}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Story Pitch Voting with Music Genome */}
        {step === 3 && (
          <div className="grid grid-cols-3 gap-8">
            {/* Left: Story Pitches */}
            <div className="col-span-2">
              <h2 className="text-3xl font-bold mb-6">Vote on Story Directions</h2>
              <p className="text-gray-600 mb-8">
                These pitches are shaped by your vision and musical vibe
              </p>
              
              {loading && <div className="text-center py-12">Generating pitches...</div>}
              
              <div className="space-y-6">
                {storyPitches.map(pitch => (
                  <div key={pitch.id} className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-3">{pitch.title}</h3>
                    <p className="text-gray-700 mb-4">{pitch.synopsis}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {pitch.keywords.map(kw => (
                        <span key={kw} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {kw}
                        </span>
                      ))}
                    </div>
                    
                    {/* Musical Match Score */}
                    {pitch.musicMatch && (
                      <div className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <Music className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">Musical Match: {pitch.musicMatch}%</span>
                          <span className="text-gray-600">• Feels like: {pitch.musicVibe}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => handlePitchVote(pitch, true)}
                        className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center gap-2"
                      >
                        <ThumbsUp className="w-5 h-5" />
                        I Like This
                      </button>
                      
                      <button
                        onClick={() => handlePitchVote(pitch, false)}
                        className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 flex items-center justify-center gap-2"
                      >
                        <ThumbsDown className="w-5 h-5" />
                        Not This
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {approvedPitches.length >= 2 && (
                <button
                  onClick={approveStructure}
                  className="mt-6 w-full bg-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-6 h-6" />
                  Continue to Structure
                </button>
              )}
            </div>

            {/* Right: Live Word Cloud + Music Genome */}
            <div className="col-span-1 space-y-6">
              {/* Musical Genome */}
              <div className="sticky top-8 bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Music className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-bold">Musical Genome</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Songs that match your book's vibe
                </p>
                
                <div className="space-y-3 mb-6">
                  {musicGenome.slice(0, 5).map((track, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Music className="w-4 h-4 text-purple-600" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{track.title}</div>
                        <div className="text-xs text-gray-600 truncate">{track.artist}</div>
                      </div>
                      <div className="text-xs font-medium text-purple-600">
                        {track.match}%
                      </div>
                    </div>
                  ))}
                </div>

                {/* Genome Attributes */}
                <div className="border-t pt-4">
                  <div className="text-xs font-semibold text-gray-500 mb-2">VIBE ATTRIBUTES</div>
                  <div className="flex flex-wrap gap-2">
                    {musicGenome[0]?.attributes.map((attr, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded">
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Word Cloud */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Story DNA</h3>
                <p className="text-sm text-gray-600 mb-6">Live keywords from your votes</p>
                
                <div className="flex flex-wrap gap-2">
                  {Object.entries(wordCloud)
                    .sort(([,a], [,b]) => b - a)
                    .map(([word, weight]) => (
                      <span
                        key={word}
                        className="px-3 py-2 rounded-full font-medium transition-all"
                        style={{
                          fontSize: `${12 + weight * 2}px`,
                          backgroundColor: `rgba(147, 51, 234, ${0.1 + weight * 0.1})`,
                          color: `rgb(${147 - weight * 10}, ${51 + weight * 5}, 234)`
                        }}
                      >
                        {word}
                      </span>
                    ))}
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between mb-2">
                      <span>Approved:</span>
                      <span className="font-bold text-green-600">{approvedPitches.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Denied:</span>
                      <span className="font-bold text-red-600">{deniedPitches.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of the steps remain the same... */}
      </div>
    </div>
  );
};

export default XavierStoryWorkflow;
