const express = require('express');
const router = express.Router();
const canvaService = require('../services/canvaService');

/**
 * Generate book cover using Canva
 * POST /api/canva/generate-cover
 */
router.post('/generate-cover', async (req, res) => {
  try {
    const { bookId, title, subtitle, genre, themes, colorScheme } = req.body;

    console.log(`🎨 Generating Canva cover for: ${title}`);

    // Generate cover design
    const coverDesign = await canvaService.generateBookCover({
      title,
      subtitle,
      genre,
      themes: themes || ['journey', 'discovery'],
      colorScheme: colorScheme || 'bold and modern'
    });

    // In production, this would call Canva MCP tools
    // For now, return the design specification
    res.json({
      success: true,
      bookId,
      cover: coverDesign,
      message: 'Cover design specification ready. Connect to Canva to generate.',
      instructions: [
        '1. Design query has been created based on your book metadata',
        '2. Use Canva integration to generate the actual design',
        '3. Export as PDF/PNG for Amazon KDP',
        '4. Designs are optimized for 6x9 inch book covers'
      ]
    });

  } catch (error) {
    console.error('Cover generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate cover',
      details: error.message 
    });
  }
});

/**
 * Search Canva for existing book cover templates
 * GET /api/canva/search-covers
 */
router.get('/search-covers', async (req, res) => {
  try {
    const { genre, style } = req.query;
    
    const searchQuery = `${genre || ''} ${style || ''} book cover template professional`;
    
    const searchSpec = await canvaService.searchBookCoverDesigns(searchQuery.trim());

    res.json({
      success: true,
      search: searchSpec,
      message: 'Search specification ready for Canva',
      tip: 'Use Canva search tool with this query to find relevant templates'
    });

  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * Export Canva design to KDP-ready format
 * POST /api/canva/export-kdp
 */
router.post('/export-kdp', async (req, res) => {
  try {
    const { designId, format } = req.body;

    if (!designId) {
      return res.status(400).json({ error: 'Design ID required' });
    }

    const exportSpec = await canvaService.exportForKDP(designId, format || 'pdf');

    res.json({
      success: true,
      export: exportSpec,
      specifications: {
        format: format || 'pdf',
        dimensions: '6x9 inches',
        dpi: 300,
        colorSpace: 'CMYK',
        bleed: '0.125 inches',
        ready_for: 'Amazon KDP Upload'
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

/**
 * Generate complete book interior in Canva
 * POST /api/canva/generate-interior
 */
router.post('/generate-interior', async (req, res) => {
  try {
    const { bookId, chapters, style } = req.body;

    const interiorSpec = await canvaService.generateBookInterior({
      chapters,
      style: style || { font: 'Georgia', color: 'neutral' }
    });

    res.json({
      success: true,
      bookId,
      interior: interiorSpec,
      message: 'Book interior design specification ready',
      features: [
        'Chapter title pages',
        'Body text layouts',
        'Page numbers',
        'Professional formatting',
        'KDP-ready 6x9 size'
      ]
    });

  } catch (error) {
    res.status(500).json({ error: 'Interior generation failed' });
  }
});

/**
 * Upload asset to Canva (e.g., AI-generated images)
 * POST /api/canva/upload-asset
 */
router.post('/upload-asset', async (req, res) => {
  try {
    const { assetUrl, assetName } = req.body;

    if (!assetUrl) {
      return res.status(400).json({ error: 'Asset URL required' });
    }

    const uploadSpec = await canvaService.uploadAssetToCanva(
      assetUrl,
      assetName || 'Xavier Book Asset'
    );

    res.json({
      success: true,
      upload: uploadSpec,
      message: 'Asset ready to upload to Canva',
      usage: 'Can be used in book covers, interiors, and marketing materials'
    });

  } catch (error) {
    res.status(500).json({ error: 'Upload preparation failed' });
  }
});

/**
 * Generate complete marketing kit in Canva
 * POST /api/canva/generate-marketing
 */
router.post('/generate-marketing', async (req, res) => {
  try {
    const { bookId, title, coverUrl, launchDate } = req.body;

    const marketingKit = await canvaService.generateMarketingKit({
      title,
      coverUrl,
      launchDate
    });

    res.json({
      success: true,
      bookId,
      marketingKit,
      includes: [
        'Instagram announcement post',
        'Facebook promotion graphic',
        'Launch event poster',
        'Social media story template'
      ],
      message: 'Marketing kit specifications ready for Canva generation'
    });

  } catch (error) {
    res.status(500).json({ error: 'Marketing kit generation failed' });
  }
});

/**
 * Get Canva integration status and capabilities
 * GET /api/canva/status
 */
router.get('/status', (req, res) => {
  res.json({
    integrated: true,
    capabilities: [
      'Book cover generation',
      'Interior design layouts',
      'Marketing material creation',
      'KDP-ready exports',
      'Asset management',
      'Design search and templates'
    ],
    supported_formats: ['PDF', 'PNG', 'JPG'],
    specifications: {
      book_cover_size: '6x9 inches',
      dpi: 300,
      color_space: 'CMYK',
      bleed: '0.125 inches'
    },
    design_types: [
      'book_cover',
      'book_interior',
      'instagram_post',
      'facebook_post',
      'poster',
      'flyer'
    ]
  });
});

module.exports = router;
