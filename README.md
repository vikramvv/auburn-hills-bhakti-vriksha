# Auburn Hills Bhakti Vriksha Website

A beautiful, static website for hosting sacred transcripts and teachings from Bhagavad Gita, Srimad Bhagavatam, and other Vaishnava content.

## 🌟 Features

- **8 Content Sections**: BG Lectures, SB Lectures, CC Lectures, 9pm Realizations, Devotee Realizations, Sankirtan, Vaishnava Bhajans, Tulasi Care
- **Featured Carousel**: Auto-rotating showcase of featured lectures
- **Rich Content Display**: YouTube videos, study notes, Sanskrit terms, quotes, stories
- **Interactive Learning**: Flashcards and quizzes generated from content
- **Mobile Optimized**: Fully responsive design
- **Fast Loading**: Static HTML generation, no runtime dependencies
- **SEO Friendly**: Individual pages for each lecture with proper metadata

## 📁 Project Structure

```
auburn-hills-bhakti-vriksha/
├── index.html                 # Landing page (edit this manually)
├── build.js                   # Build script (generates all pages)
├── data/                      # JSON content files
│   ├── bg-lectures/
│   │   ├── bg-6-47-2024-11-27.json
│   │   └── bg-6-46-2024-11-26.json
│   ├── sb-lectures/
│   ├── cc-lectures/
│   ├── 9pm-realizations/
│   ├── devotee-realizations/
│   ├── sankirtan/
│   ├── vaishnava-bhajans/
│   └── tulasi-care/
├── bg-lectures/               # Generated HTML pages
│   ├── index.json            # Generated index
│   └── bg-6-47-2024-11-27.html
├── .github/
│   └── workflows/
│       └── build-deploy.yml  # GitHub Action
└── README.md
```

## 🚀 Quick Start

### 1. Create GitHub Repository

```bash
# Create new repo on GitHub
# Clone it locally
git clone https://github.com/YOUR_USERNAME/auburn-hills-bhakti-vriksha.git
cd auburn-hills-bhakti-vriksha
```

### 2. Add Files

Copy these files to your repository:
- `index.html` (landing page)
- `build.js` (build script)
- `.github/workflows/build-deploy.yml` (GitHub Action)
- `README.md` (this file)

### 3. Create Data Folder Structure

```bash
mkdir -p data/{bg-lectures,sb-lectures,cc-lectures,9pm-realizations,devotee-realizations,sankirtan,vaishnava-bhajans,tulasi-care}
```

### 4. Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: **GitHub Actions**
3. Save

### 5. Add Your First Lecture

Create `data/bg-lectures/bg-6-47-2024-11-27.json`:

```json
{
  "id": "bg-6-47-2024-11-27",
  "section": "bg-lectures",
  "title": "Bhakti Supremacy: Why Pure Devotion Surpasses All Other Paths",
  "date": "2024-11-27",
  "primary_verse": "BG 6.47",
  "speaker": "Jai Sacinandana Kṛṣṇa Dāsa",
  "takeaway": "Krishna declares that among all yogis, the devotee who worships Him with faith and love is the highest.",
  "transcript": "Full transcript text here...",
  "media": {
    "video": {
      "youtube_id": "YOUR_VIDEO_ID"
    }
  },
  "featured": true
}
```

### 6. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

The GitHub Action will automatically:
1. Run the build script
2. Generate all HTML pages
3. Deploy to GitHub Pages
4. Site will be live at: `https://YOUR_USERNAME.github.io/auburn-hills-bhakti-vriksha/`

## 📝 Adding New Lectures

### Option 1: Via GitHub Web Interface (Easiest)

1. Go to your repository on GitHub
2. Navigate to `data/bg-lectures/` (or appropriate section)
3. Click **Add file** → **Create new file**
4. Name it: `YYYY-MM-DD-topic.json`
5. Paste your JSON content
6. Click **Commit changes**
7. Site updates automatically in ~2 minutes!

### Option 2: Via Git Command Line

```bash
# Add new JSON file
echo '{"title": "New Lecture", ...}' > data/bg-lectures/new-lecture.json

# Commit and push
git add data/bg-lectures/new-lecture.json
git commit -m "Add new BG lecture"
git push

# GitHub Action runs automatically
```

### Option 3: Local Build (for testing)

```bash
# Install Node.js if not installed
# Then run build script locally
node build.js

# Test locally (optional)
npx serve .

# Push when ready
git add .
git commit -m "Add new lectures"
git push
```

## 🎨 JSON Structure

### Minimal Structure (Required Fields)

```json
{
  "id": "unique-id",
  "section": "bg-lectures",
  "title": "Lecture Title",
  "date": "2024-11-27",
  "transcript": "Full transcript..."
}
```

### Full Structure (All Optional Features)

See the comprehensive JSON structure in the build script comments. Key sections include:

- **Core Metadata**: id, section, title, date, speaker
- **Scripture Reference**: primary_verse, transliteration, translation, word meanings
- **Content**: transcript, takeaway, summaries (short/medium/long)
- **Structured Content**: themes/concepts with details, examples, verses
- **Sanskrit Terms**: term, devanagari, definition, pronunciation
- **Supporting Content**: quotes, stories, life applications, Q&A
- **Media**: YouTube video ID, audio, images
- **Interactive**: quiz questions, talk flow for Mermaid diagrams
- **SEO**: meta description, keywords, hashtags

## 🎯 Features Generated Automatically

### From Your JSON Data

1. **Section Index Pages**: Lists all lectures in each section
2. **Individual Lecture Pages** with 5 tabs:
   - **Overview**: Video + key takeaways
   - **Study Notes**: Themes, Sanskrit terms, applications
   - **Flashcards**: Auto-generated from Sanskrit terms and Q&A
   - **Quiz**: Interactive knowledge check (results saved locally)
   - **Transcript**: Full searchable text

3. **Flashcards**: Generated from:
   - Sanskrit terms (term → definition)
   - Q&A (question → answer)
   - Key themes (title → details)

4. **Quiz**: Generated from:
   - Q&A section (if available)
   - Manual quiz questions (if provided in JSON)

## 🔧 Customization

### Change Color Theme

Edit the CSS variables in `build.js` (line ~250) or `index.html`:

```css
/* Current theme: Cream/Gold/Brown */
background: linear-gradient(135deg, #E8D4A2 0%, #D4C5A0 50%, #C4B598 100%);
```

### Add New Sections

1. Add section to `SECTIONS` array in `build.js`
2. Add title to `SECTION_TITLES` object
3. Add tab to `index.html` navigation
4. Create `data/NEW_SECTION/` folder

### Modify Page Templates

Edit the template functions in `build.js`:
- `getOverviewTab()` - Overview tab content
- `getNotesTab()` - Study notes tab
- `getFlashcardsTab()` - Flashcards display
- `getQuizTab()` - Quiz interface
- `getTranscriptTab()` - Transcript display

## 🐛 Troubleshooting

### Site Not Updating

1. Check GitHub Actions tab - build successful?
2. Check Pages settings - source set to "GitHub Actions"?
3. Wait 2-3 minutes after push for deployment
4. Hard refresh browser (Ctrl+Shift+R)

### JSON Errors

1. Validate JSON syntax: https://jsonlint.com/
2. Check console in build logs for errors
3. Required fields: `id`, `section`, `title`, `date`, `transcript`

### Missing Videos

1. Check `media.video.youtube_id` or `stream_metadata.video_id` in JSON
2. Verify YouTube video is public/unlisted (not private)
3. Use video ID only (not full URL): `JDWeD-BzCiM`

## 📱 Mobile Optimization

The site is fully mobile-responsive with:
- Touch-friendly navigation
- Swipeable carousel
- Collapsible sections
- Readable font sizes
- Optimized layouts for small screens

## 🔐 Quiz Data Storage

Quiz results are currently stored in browser localStorage (per-device). To upgrade to cloud storage (Firebase):

1. Create Firebase project
2. Enable Firestore
3. Add Firebase SDK to lecture pages
4. Update quiz save function to use Firestore

See comments in `build.js` for Firebase integration points.

## 📊 Analytics (Optional)

To track visitors, add to `<head>` in templates:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🙏 Support

For questions or issues:
1. Check this README
2. Review build.js comments
3. Check GitHub Actions logs
4. Create GitHub Issue

## 📄 License

This project is open source and available for use by any Vaishnava community.

---

**Hare Krishna! 🕉️**
