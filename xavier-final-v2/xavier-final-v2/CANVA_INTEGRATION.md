# 🎨 Canva Integration Guide for Xavier Book Suite

## Overview

This guide shows you how to integrate Canva with Xavier Book Suite for automated book cover generation, interior design, and marketing materials.

## 🌟 What This Integration Does

### Automated Workflows:
1. **Book Cover Generation** - AI-powered covers based on genre, themes, and style
2. **Interior Layouts** - Professional chapter pages and text formatting
3. **Marketing Kit** - Social media graphics, posters, promotional materials
4. **KDP Export** - One-click export to Amazon-ready formats

### Key Benefits:
- ✅ **No Design Skills Needed** - AI generates professional designs
- ✅ **KDP-Compliant** - Automatic 6×9" sizing, 300 DPI, proper bleed
- ✅ **Batch Processing** - Generate covers for multiple books
- ✅ **Brand Consistency** - Reusable templates and style guides

## 📋 Implementation Steps

### Step 1: Test the API Endpoints

```bash
# Test Canva integration status
curl http://localhost:3001/api/canva/status

# Generate a book cover
curl -X POST http://localhost:3001/api/canva/generate-cover \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "book_123",
    "title": "The Runaway'\''s Manifesto",
    "subtitle": "A tale of escapism",
    "genre": "contemporary fiction",
    "themes": ["escapism", "self-discovery"],
    "colorScheme": "purple and modern"
  }'

# Search for existing templates
curl "http://localhost:3001/api/canva/search-covers?genre=fiction&style=modern"
```

### Step 2: Understanding the Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   CANVA INTEGRATION FLOW                     │
└─────────────────────────────────────────────────────────────┘

1. USER INPUT                2. DESIGN QUERY           3. CANVA GENERATION
   ├─ Book metadata             ├─ Genre analysis          ├─ AI creates design
   ├─ Title/subtitle            ├─ Theme extraction        ├─ Template selection
   ├─ Genre/themes              └─ Style guidelines        └─ Custom elements
   └─ Color preferences
                                     ↓
4. REVIEW & EDIT            5. EXPORT                 6. KDP UPLOAD
   ├─ Preview design           ├─ PDF (recommended)      ├─ Upload to KDP
   ├─ Make adjustments         ├─ PNG (alternative)      ├─ Set price/royalty
   └─ Approve final            └─ 6×9", 300 DPI          └─ Publish!
```

### Step 3: Using the React Component

Add to your book editor:

```javascript
import CanvaCoverGenerator from './components/CanvaCoverGenerator';

function BookEditor() {
  const [book, setBook] = useState({...});
  const [showCoverGenerator, setShowCoverGenerator] = useState(false);

  return (
    <div>
      {/* Your existing editor */}
      
      <button onClick={() => setShowCoverGenerator(true)}>
        Generate Cover with Canva
      </button>

      {showCoverGenerator && (
        <CanvaCoverGenerator book={book} />
      )}
    </div>
  );
}
```

### Step 4: Connecting to Claude MCP (Me!)

I have **direct access** to Canva tools! Here's how to use them:

**Ask me to:**
```
"Generate a book cover for [book title] in Canva"
"Search Canva for thriller book cover templates"
"Export this Canva design as a KDP-ready PDF"
"Create marketing graphics for my book launch"
```

**I can:**
- ✅ Generate designs using `Canva:generate-design`
- ✅ Search existing designs with `Canva:search-designs`
- ✅ Export to PDF/PNG with `Canva:export-design`
- ✅ Upload assets with `Canva:upload-asset-from-url`
- ✅ Manage folders and organization

### Step 5: Automation Examples

#### Auto-Generate Covers for All Books:

```javascript
// In your backend
async function generateCoversForAllBooks() {
  const books = await getAllBooks();
  
  for (const book of books) {
    const coverSpec = await canvaService.generateBookCover({
      title: book.title,
      subtitle: book.subtitle,
      genre: book.genre,
      themes: book.themes,
      colorScheme: book.colorScheme
    });
    
    // Save design ID for later export
    await saveDesignId(book.id, coverSpec.designId);
  }
}
```

#### Batch Export for KDP:

```javascript
async function exportAllCoversForKDP() {
  const books = await getBooksWithDesigns();
  
  for (const book of books) {
    const pdfUrl = await canvaService.exportForKDP(
      book.canvaDesignId,
      'pdf'
    );
    
    // Auto-upload to KDP or save to S3
    await uploadToKDP(book.id, pdfUrl);
  }
}
```

## 🔧 API Reference

### Generate Book Cover
```
POST /api/canva/generate-cover

Request:
{
  "bookId": "string",
  "title": "string",
  "subtitle": "string",
  "genre": "string",
  "themes": ["string"],
  "colorScheme": "string"
}

Response:
{
  "success": true,
  "designId": "string",
  "designQuery": {...},
  "instructions": [...]
}
```

### Export for KDP
```
POST /api/canva/export-kdp

Request:
{
  "designId": "string",
  "format": "pdf" | "png"
}

Response:
{
  "success": true,
  "downloadUrl": "string",
  "specifications": {...}
}
```

### Generate Marketing Kit
```
POST /api/canva/generate-marketing

Request:
{
  "bookId": "string",
  "title": "string",
  "coverUrl": "string",
  "launchDate": "string"
}

Response:
{
  "success": true,
  "designs": [
    { "type": "instagram_post", "designId": "..." },
    { "type": "facebook_post", "designId": "..." },
    { "type": "poster", "designId": "..." }
  ]
}
```

## 📐 Design Specifications

### Book Cover (KDP Standard)
- **Trim Size**: 6×9 inches
- **DPI**: 300
- **Color Space**: CMYK
- **Bleed**: 0.125 inches
- **Format**: PDF (preferred) or PNG
- **Spine**: Calculated based on page count

### Interior Pages
- **Trim Size**: 6×9 inches
- **Margins**: 0.75" top/bottom, 1" inside, 0.5" outside
- **Font Size**: 10-12pt for body text
- **Line Spacing**: 1.15-1.5
- **Chapter Starts**: Always on odd page

## 🎯 Genre-Specific Design Patterns

The integration automatically adjusts designs based on genre:

### Contemporary Fiction
- **Style**: Clean, modern typography
- **Colors**: Muted, sophisticated palette
- **Imagery**: Abstract or emotional scenes
- **Fonts**: Sans-serif for title, serif for subtitle

### Romance
- **Style**: Elegant, warm
- **Colors**: Soft pinks, purples, golds
- **Imagery**: Romantic scenes, couples, flowers
- **Fonts**: Script or elegant serif

### Thriller/Mystery
- **Style**: Bold, dark, mysterious
- **Colors**: Black, red, deep blues
- **Imagery**: Shadowy figures, urban scenes
- **Fonts**: Strong, bold typography

### Sci-Fi/Fantasy
- **Style**: Epic, otherworldly
- **Colors**: Rich, vibrant, metallic
- **Imagery**: Cosmic, magical, futuristic
- **Fonts**: Modern or stylized

## 💡 Advanced Features

### 1. A/B Testing Covers
Generate multiple versions:
```javascript
const versions = ['modern', 'classic', 'bold'];

for (const style of versions) {
  await canvaService.generateBookCover({
    ...bookData,
    styleVariant: style
  });
}
```

### 2. Brand Kit Integration
Create consistent branding across all books:
```javascript
const brandKit = {
  primaryColor: '#8B5CF6',
  secondaryColor: '#EC4899',
  fonts: ['Playfair Display', 'Inter'],
  logo: 'https://...'
};

await canvaService.applyBrandKit(designId, brandKit);
```

### 3. Series Consistency
Auto-generate covers for book series:
```javascript
const seriesTemplate = await canvaService.createSeriesTemplate({
  baseCover: 'design_id_book1',
  seriesName: 'The Xavier Chronicles',
  volumes: 5
});
```

## 🚀 Next Steps

1. **Test the API**: Run the curl commands above
2. **Try the React component**: Add it to your editor
3. **Generate your first cover**: Ask me to create one!
4. **Export to KDP**: Get the PDF and upload
5. **Automate**: Set up batch processing for multiple books

## 🤖 Ask Claude (Me!) For Help

I can directly:
- Generate cover designs right now
- Search templates for you
- Export designs to KDP format
- Create marketing materials
- Upload your assets to Canva

Just say: **"Claude, generate a Canva cover for my book about [topic]"**

## 📚 Resources

- [Canva Design School](https://www.canva.com/learn/)
- [Amazon KDP Cover Guidelines](https://kdp.amazon.com/en_US/cover-templates)
- [Book Cover Design Best Practices](https://www.canva.com/learn/book-cover-design/)

---

**Ready to generate amazing book covers?** Let's do it! 🎨
