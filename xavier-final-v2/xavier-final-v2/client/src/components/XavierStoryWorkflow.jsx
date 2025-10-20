import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Sparkles, Book, Wand2, ArrowRight } from 'lucide-react';

const XavierStoryWorkflow = () => {
  const [step, setStep] = useState(1); // 1: Cover, 2: Story Pitch, 3: Structure, 4: Generate, 5: Edit
  const [selectedCover, setSelectedCover] = useState(null);
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
    
    // Add weight from approved pitches
    approvedPitches.forEach(pitch => {
      pitch.keywords.forEach(keyword => {
        newCloud[keyword] = (newCloud[keyword] || 0) + 3;
      });
      pitch.demographics.forEach(demo => {
        newCloud[demo] = (newCloud[demo] || 0) + 2;
      });
    });
    
    // Subtract weight from denied pitches
    deniedPitches.forEach(pitch => {
      pitch.keywords.forEach(keyword => {
        newCloud[keyword] = (newCloud[keyword] || 0) - 1;
      });
    });
    
    // Remove negative or zero values
    Object.keys(newCloud).forEach(key => {
      if (newCloud[key] <= 0) delete newCloud[key];
    });
    
    setWordCloud(newCloud);
  }, [approvedPitches, deniedPitches]);

  // STEP 1: Cover Selection
  const coverOptions = [
    { id: 1, url: '/covers/blue-ocean.jpg', style: 'corporate', mood: 'professional' },
    { id: 2, url: '/covers/abstract.jpg', style: 'modern', mood: 'innovative' },
    { id: 3, url: '/covers/minimalist.jpg', style: 'clean', mood: 'focused' }
  ];

  const selectCover = (cover) => {
    setSelectedCover(cover);
    generateStoryPitches(cover);
    setStep(2);
  };

  // STEP 2: Generate Story Pitches based on cover
  const generateStoryPitches = async (cover) => {
    setLoading(true);
    
    const response = await fetch('/api/books/generate-pitches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coverStyle: cover.style,
        coverMood: cover.mood,
        musicProfile: {
          topArtists: ['Elliott Smith', 'Taylor Swift', 'Kanye West'],
          genres: ['indie', 'pop', 'hip-hop']
        },
        maxPages: 96
      })
    });
    
    const data = await response.json();
    setStoryPitches(data.pitches);
    setLoading(false);
  };

  // STEP 2: Handle pitch approval/denial
  const handlePitchVote = (pitch, approved) => {
    if (approved) {
      setApprovedPitches([...approvedPitches, pitch]);
    } else {
      setDeniedPitches([...deniedPitches, pitch]);
    }
    
    // Remove from available pitches
    setStoryPitches(storyPitches.filter(p => p.id !== pitch.id));
    
    // Generate new pitch based on learnings
    generateRefinedPitch();
  };

  const generateRefinedPitch = async () => {
    const response = await fetch('/api/books/refine-pitch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wordCloud,
        approvedElements: approvedPitches.map(p => p.core),
        deniedElements: deniedPitches.map(p => p.core)
      })
    });
    
    const data = await response.json();
    setStoryPitches([...storyPitches, data.pitch]);
  };

  // STEP 3: Approve structure
  const approveStructure = async () => {
    setLoading(true);
    
    const response = await fetch('/api/books/create-structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approvedPitches,
        wordCloud,
        coverStyle: selectedCover.style,
        maxPages: 96
      })
    });
    
    const data = await response.json();
    setBookStructure(data.structure);
    setStep(4);
    setLoading(false);
  };

  // STEP 4: Generate full book
  const generateFullBook = async () => {
    setLoading(true);
    
    const response = await fetch('/api/books/generate-full', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structure: bookStructure,
        wordCloud,
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
          {['Cover', 'Story', 'Structure', 'Generate', 'Edit'].map((label, idx) => (
            <div key={idx} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step > idx + 1 ? 'bg-green-500 text-white' :
                step === idx + 1 ? 'bg-purple-600 text-white' :
                'bg-gray-300 text-gray-500'
              }`}>
                {step > idx + 1 ? '✓' : idx + 1}
              </div>
              <span className="ml-2 text-sm font-medium">{label}</span>
              {idx < 4 && <div className="w-16 h-1 mx-4 bg-gray-300" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* STEP 1: Cover Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Choose Your Cover Style</h2>
            <p className="text-gray-600 mb-8">This will influence the story tone and direction</p>
            
            <div className="grid grid-cols-3 gap-6">
              {coverOptions.map(cover => (
                <div
                  key={cover.id}
                  onClick={() => selectCover(cover)}
                  className="cursor-pointer border-4 border-transparent hover:border-purple-600 rounded-lg overflow-hidden transition"
                >
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-64 flex items-center justify-center text-white text-xl font-bold">
                    {cover.style.toUpperCase()}
                  </div>
                  <div className="bg-white p-4">
                    <div className="font-semibold">{cover.style}</div>
                    <div className="text-sm text-gray-600">{cover.mood}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Story Pitch Voting */}
        {step === 2 && (
          <div className="grid grid-cols-3 gap-8">
            {/* Left: Story Pitches */}
            <div className="col-span-2">
              <h2 className="text-3xl font-bold mb-6">Vote on Story Directions</h2>
              <p className="text-gray-600 mb-8">Approve stories you like. The AI learns from your choices.</p>
              
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

            {/* Right: Live Word Cloud */}
            <div className="col-span-1">
              <div className="sticky top-8 bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Story DNA</h3>
                <p className="text-sm text-gray-600 mb-6">Live keywords based on your choices</p>
                
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

        {/* STEP 3: Structure Review */}
        {step === 4 && bookStructure && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Story Structure</h2>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h3 className="text-2xl font-bold mb-4">{bookStructure.title}</h3>
              <p className="text-gray-700 mb-6">{bookStructure.synopsis}</p>
              
              <div className="space-y-4">
                {bookStructure.chapters.map((chapter, idx) => (
                  <div key={idx} className="border-l-4 border-purple-600 pl-4">
                    <div className="font-semibold">Chapter {idx + 1}: {chapter.title}</div>
                    <div className="text-sm text-gray-600">{chapter.summary}</div>
                    <div className="text-xs text-gray-500 mt-1">~{chapter.estimatedPages} pages</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t text-sm text-gray-600">
                <div>Total estimated pages: {bookStructure.totalPages} / 96</div>
              </div>
            </div>
            
            <button
              onClick={generateFullBook}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>Generating book...</>
              ) : (
                <>
                  <Wand2 className="w-6 h-6" />
                  Generate Full Book
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 5: Page-by-Page Editor */}
        {step === 5 && generatedBook && (
          <div className="text-center py-12">
            <Book className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Book Generated!</h2>
            <p className="text-gray-600 mb-6">{generatedBook.pages.length} pages ready to edit</p>
            <button className="bg-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-purple-700">
              Start Editing Page by Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default XavierStoryWorkflow;
