#!/bin/bash

# Xavier Book Suite - Canva Integration Demo
# This script demonstrates the complete workflow

echo "🎨 Xavier Book Suite - Canva Integration Demo"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Check Canva Integration Status${NC}"
echo "---------------------------------------"
curl -s http://localhost:3001/api/canva/status | python3 -m json.tool
echo ""
echo ""

echo -e "${PURPLE}Step 2: Generate Book Cover Design${NC}"
echo "-----------------------------------"
echo "Generating cover for 'The Runaway's Manifesto'..."
curl -s -X POST http://localhost:3001/api/canva/generate-cover \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "demo_book_001",
    "title": "The Runaways Manifesto",
    "subtitle": "A tale of escapism and self-discovery",
    "genre": "contemporary fiction",
    "themes": ["escapism", "self-discovery", "identity", "journey"],
    "colorScheme": "deep purple with warm accents"
  }' | python3 -m json.tool

echo ""
echo ""

echo -e "${GREEN}Step 3: Search for Cover Templates${NC}"
echo "-----------------------------------"
curl -s "http://localhost:3001/api/canva/search-covers?genre=contemporary%20fiction&style=modern" | python3 -m json.tool
echo ""
echo ""

echo -e "${BLUE}Step 4: Export Specifications for KDP${NC}"
echo "---------------------------------------"
curl -s -X POST http://localhost:3001/api/canva/export-kdp \
  -H "Content-Type: application/json" \
  -d '{
    "designId": "demo_design_123",
    "format": "pdf"
  }' | python3 -m json.tool

echo ""
echo ""

echo -e "${PURPLE}Step 5: Generate Marketing Kit${NC}"
echo "--------------------------------"
curl -s -X POST http://localhost:3001/api/canva/generate-marketing \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "demo_book_001",
    "title": "The Runaways Manifesto",
    "coverUrl": "https://example.com/cover.jpg",
    "launchDate": "2025-11-15"
  }' | python3 -m json.tool

echo ""
echo ""

echo -e "${GREEN}✅ Demo Complete!${NC}"
echo ""
echo "Next Steps:"
echo "1. Connect Xavier to Canva (Settings > Integrations)"
echo "2. Generate real designs using the UI"
echo "3. Export covers for Amazon KDP"
echo "4. Publish your books!"
echo ""
echo "For more info, check: CANVA_INTEGRATION.md"
