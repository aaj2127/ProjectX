import React, { useState, useEffect } from 'react';
import { Save, Eye, Download, Wand2, Book, Plus, Trash2 } from 'lucide-react';

const BookEditor = () => {
  const [book, setBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [saved, setSaved] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBook();
  }, []);

  const loadBook = async () => {
    try {
      const response = await fetch('/api/books/current');
      const data = await response.json();
      setBook(data);
    } catch (error) {
      console.error('Failed to load book:', error);
    }
  };

  const updateChapter = (field, value) => {
    if (!book) return;
    
    const updated = { ...book };
    updated.chapters[selectedChapter][field] = value;
    
    // Update word count
    if (field === 'content') {
      updated.chapters[selectedChapter].wordCount = value.split(/\s+/).length;
    }
    
    setBook(updated);
    setSaved(false);
  };

  const saveBook = async () => {
    setLoading(true);
    try {
      await fetch('/api/books/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
      });
      setSaved(true);
    } catch (error) {
      console.error('Save failed:', error);
    }
    setLoading(false);
  };

  const addChapter = () => {
    const newChapter = {
      id: Date.now(),
      number: book.chapters.length + 1,
      title: `Chapter ${book.chapters.length + 1}`,
      content: '',
      wordCount: 0
    };
    
    setBook({
      ...book,
      chapters: [...book.chapters, newChapter]
    });
    setSaved(false);
  };

  const deleteChapter = (chapterId) => {
    if (book.chapters.length <= 1) {
      alert('Cannot delete the last chapter');
      return;
    }
    
    setBook({
      ...book,
      chapters: book.chapters.filter(ch => ch.id !== chapterId)
    });
    
    if (selectedChapter >= book.chapters.length - 1) {
      setSelectedChapter(book.chapters.length - 2);
    }
    
    setSaved(false);
  };

  const exportBook = async (format) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/books/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${book.title}.${format}`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
    setLoading(false);
  };

  if (!book) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }

  const currentChapter = book.chapters[selectedChapter];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Chapter List */}
      <div className="w-72 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
            <Book className="w-5 h-5 text-purple-600" />
            {book.title}
          </h2>
          <p className="text-sm text-gray-600">{book.subtitle}</p>
          <div className="mt-2 text-xs text-gray-500">
            {book.chapters.length} chapters • {book.metadata.wordCount.toLocaleString()} words
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {book.chapters.map((ch, idx) => (
              <div
                key={ch.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition ${
                  idx === selectedChapter 
                    ? 'bg-purple-100 border-2 border-purple-600' 
                    : 'hover:bg-gray-100 border-2 border-transparent'
                }`}
                onClick={() => setSelectedChapter(idx)}
              >
                <div className="font-medium text-sm">Chapter {ch.number}</div>
                <div className="text-sm text-gray-600 truncate mt-1">{ch.title}</div>
                <div className="text-xs text-gray-500 mt-1">{ch.wordCount} words</div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChapter(ch.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={addChapter}
            className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 flex items-center justify-center gap-2 text-gray-600 hover:text-purple-600"
          >
            <Plus className="w-4 h-4" />
            Add Chapter
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={saveBook}
              disabled={loading || saved}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                saved 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <Save className="w-4 h-4" />
              {saved ? 'Saved' : 'Save Changes'}
            </button>
            
            <div className="border-l h-8"></div>
            
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => exportBook('pdf')}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            
            <button 
              onClick={() => exportBook('epub')}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export EPUB
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8 min-h-full">
              {/* Chapter Title */}
              <input
                type="text"
                value={currentChapter.title}
                onChange={(e) => updateChapter('title', e.target.value)}
                placeholder="Chapter title..."
                className="text-3xl font-bold w-full mb-8 border-b-2 border-gray-200 pb-4 focus:outline-none focus:border-purple-600"
              />
              
              {/* Chapter Content */}
              <textarea
                value={currentChapter.content}
                onChange={(e) => updateChapter('content', e.target.value)}
                placeholder="Start writing your chapter..."
                className="w-full min-h-[600px] text-lg leading-relaxed resize-none focus:outline-none font-serif"
                style={{ fontFamily: book.style?.font || 'Georgia' }}
              />
              
              {/* Word Count */}
              <div className="mt-6 pt-6 border-t text-sm text-gray-500 flex justify-between items-center">
                <span>{currentChapter.wordCount.toLocaleString()} words</span>
                <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
                  <Wand2 className="w-4 h-4" />
                  AI Enhance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookEditor;
