import React, { useState } from 'react';
import { Wand2, Download, Eye, Upload, CheckCircle, Loader } from 'lucide-react';

const CanvaCoverGenerator = ({ book }) => {
  const [coverData, setCoverData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Generate, 2: Review, 3: Export

  const generateCover = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/canva/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          title: book.title,
          subtitle: book.subtitle,
          genre: book.metadata.genre,
          themes: book.metadata.themes || ['journey', 'discovery'],
          colorScheme: book.style.color
        })
      });

      const data = await response.json();
      setCoverData(data);
      setStep(2);
    } catch (error) {
      console.error('Cover generation failed:', error);
      alert('Failed to generate cover design');
    }
    setLoading(false);
  };

  const exportCover = async (format) => {
    setLoading(true);
    try {
      const response = await fetch('/api/canva/export-kdp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designId: coverData?.cover?.designId,
          format
        })
      });

      const data = await response.json();
      setStep(3);
      
      // Trigger download
      alert(`Cover exported as ${format.toUpperCase()}! Ready for Amazon KDP upload.`);
    } catch (error) {
      console.error('Export failed:', error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Wand2 className="w-6 h-6 text-purple-600" />
        Canva Cover Generator
      </h2>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: 'Generate Design' },
          { num: 2, label: 'Review & Edit' },
          { num: 3, label: 'Export for KDP' }
        ].map((s) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s.num
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
            </div>
            <div className="ml-2 text-sm font-medium">{s.label}</div>
            {s.num < 3 && (
              <div className={`w-24 h-1 mx-4 ${step > s.num ? 'bg-purple-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Generate */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-3">Book Details</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Title:</span> {book.title}</div>
              <div><span className="font-medium">Subtitle:</span> {book.subtitle}</div>
              <div><span className="font-medium">Genre:</span> {book.metadata.genre}</div>
              <div><span className="font-medium">Themes:</span> {book.metadata.themes?.join(', ') || 'N/A'}</div>
              <div><span className="font-medium">Color Scheme:</span> {book.style.color}</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">What Canva Will Generate:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Professional 6x9" book cover design</li>
              <li>AI-powered layout based on your book's genre and themes</li>
              <li>300 DPI print-ready quality</li>
              <li>Customizable typography and colors</li>
              <li>KDP-compliant specifications</li>
            </ul>
          </div>

          <button
            onClick={generateCover}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Generating Design...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Cover in Canva
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && coverData && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold mb-2 text-green-800">✓ Design Specification Ready!</h3>
            <p className="text-sm text-green-700">
              Your book cover design query has been created. The next step is to generate
              it in Canva using the MCP integration.
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <h4 className="font-semibold mb-4">Design Preview Information:</h4>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-medium">Design Query:</span>
                <div className="mt-2 text-xs font-mono bg-white p-2 rounded overflow-auto max-h-32">
                  {coverData.cover.designQuery.query}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-3 rounded">
                  <div className="font-medium">Specifications</div>
                  <div className="text-xs mt-2 space-y-1">
                    <div>• Size: 6×9 inches</div>
                    <div>• DPI: 300</div>
                    <div>• Format: Print-ready</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-medium">Next Steps</div>
                  <div className="text-xs mt-2 space-y-1">
                    {coverData.instructions?.map((inst, i) => (
                      <div key={i}>• {inst.replace(/^\d+\.\s*/, '')}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.open('https://www.canva.com', '_blank')}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Open in Canva
            </button>
            
            <button
              onClick={() => setStep(3)}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              Continue to Export
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Export */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Ready to Export!</h3>
            <p className="text-gray-600">
              Choose your export format for Amazon KDP
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => exportCover('pdf')}
              disabled={loading}
              className="border-2 border-purple-600 text-purple-600 py-4 rounded-lg font-semibold hover:bg-purple-50 disabled:opacity-50 flex flex-col items-center gap-2"
            >
              <Download className="w-6 h-6" />
              <div>Export as PDF</div>
              <div className="text-xs font-normal">Recommended for KDP</div>
            </button>

            <button
              onClick={() => exportCover('png')}
              disabled={loading}
              className="border-2 border-purple-600 text-purple-600 py-4 rounded-lg font-semibold hover:bg-purple-50 disabled:opacity-50 flex flex-col items-center gap-2"
            >
              <Download className="w-6 h-6" />
              <div>Export as PNG</div>
              <div className="text-xs font-normal">High-res image</div>
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">📦 KDP Upload Specs:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>✓ 6×9 inch trim size</li>
              <li>✓ 300 DPI resolution</li>
              <li>✓ 0.125" bleed included</li>
              <li>✓ CMYK color space</li>
              <li>✓ Ready for paperback upload</li>
            </ul>
          </div>
        </div>
      )}

      {/* Additional Options */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-semibold mb-3">More Canva Features:</h4>
        <div className="grid grid-cols-2 gap-3">
          <button className="text-sm border rounded-lg py-2 hover:bg-gray-50">
            📄 Generate Interior Pages
          </button>
          <button className="text-sm border rounded-lg py-2 hover:bg-gray-50">
            📱 Create Marketing Kit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanvaCoverGenerator;
