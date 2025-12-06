// build.js - Logic only, no HTML templates
const fs = require('fs');
const path = require('path');
const templates = require('./templates');

// Configuration
const SECTIONS = [
    'bg-lectures',
    'sb-lectures', 
    'cc-lectures',
    '9pm-realizations',
    'devotee-realizations',
    'sankirtan',
    'vaishnava-bhajans',
    'tulasi-care'
];

const SECTION_TITLES = {
    'bg-lectures': 'Bhagavad Gita Lectures',
    'sb-lectures': 'Srimad Bhagavatam Lectures',
    'cc-lectures': 'Caitanya Caritamrta Lectures',
    '9pm-realizations': '9pm Realizations',
    'devotee-realizations': 'Devotee Realizations',
    'sankirtan': 'Sankirtan',
    'vaishnava-bhajans': 'Vaishnava Bhajans',
    'tulasi-care': 'Tulasi Care'
};

// ============================================================================
// MAIN BUILD FUNCTION
// ============================================================================
async function build() {
    console.log('🚀 Starting enhanced build process...\n');
    console.log('📍 Current directory:', process.cwd());
    console.log('📍 Looking for data folder...\n');
    
    // Check if data folder exists
    if (!fs.existsSync('data')) {
        console.error('❌ ERROR: "data" folder not found!');
        console.error('   Make sure you run this from the project root directory');
        console.error('   Expected structure: data/bg-lectures/, data/sb-lectures/, etc.\n');
        return;
    }
    
    // Load all lectures
    const allLectures = await loadAllLectures();
    console.log(`\n📚 Loaded ${allLectures.length} total lectures\n`);
    
    // If no lectures found, exit
    if (allLectures.length === 0) {
        console.log('⚠️  No lectures found. Exiting...\n');
        return;
    }
    
    // Clean up orphaned HTML files
    await cleanupOrphanedFiles(allLectures);
    
    // Generate section files
    for (const section of SECTIONS) {
        await generateSectionIndex(section, allLectures);
        await generateSectionPage(section, allLectures);
    }
    
    // Generate individual lecture pages
    for (const lecture of allLectures) {
        await generateLecturePage(lecture);
    }
    
    console.log('\n✅ Build complete!');
}

// ============================================================================
// DATE EXTRACTION
// ============================================================================
function extractDateFromFilename(filename) {
    // Extract date from format: videoId__DD-MMM-YY.ext
    // Example: mGwIj-Jhkuw__9-Jul-25.srt → 2025-07-09
    const match = filename.match(/__(\d{1,2})-([A-Za-z]{3})-(\d{2})\./);
    if (!match) return null;
    
    const [, day, month, year] = match;
    const monthMap = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const fullYear = `20${year}`;
    const monthNum = monthMap[month];
    const dayNum = day.padStart(2, '0');
    
    return `${fullYear}-${monthNum}-${dayNum}`;
}

// ============================================================================
// LOAD LECTURES
// ============================================================================
async function loadAllLectures() {
    const lectures = [];
    
    for (const section of SECTIONS) {
        const sectionPath = path.join('data', section);
        
        if (!fs.existsSync(sectionPath)) {
            console.log(`⚠️  Section folder not found: ${section}`);
            continue;
        }
        
        const files = fs.readdirSync(sectionPath)
            .filter(f => f.endsWith('.json'));
        
        console.log(`📂 ${section}: Found ${files.length} lectures`);
        
        for (const file of files) {
            try {
                const filePath = path.join(sectionPath, file);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                // Add metadata
                data.section = section;
                data.filename = file;
                
                // Extract date with priority: 1) filename, 2) json date, 3) stream metadata
                if (!data.date) {
                    const filenameDate = extractDateFromFilename(file);
                    if (filenameDate) {
                        data.date = filenameDate;
                        console.log(`  📅 Extracted date from filename: ${file} → ${filenameDate}`);
                    } else if (data.stream_metadata?.published_date) {
                        data.date = data.stream_metadata.published_date.split('T')[0];
                    }
                }
                
                // Generate proper ID
                data.id = generateIdFromJson(data) || data.id || file.replace('.json', '');
                
                // Extract video ID from stream_metadata if missing
                if (!data.media?.video?.youtube_id && data.stream_metadata?.video_id) {
                    data.media = data.media || {};
                    data.media.video = data.media.video || {};
                    data.media.video.youtube_id = data.stream_metadata.video_id;
                }
                
                lectures.push(data);
            } catch (error) {
                console.error(`❌ Error loading ${file}:`, error.message);
            }
        }
    }
    
    return lectures;
}

// ============================================================================
// CLEANUP ORPHANED FILES
// ============================================================================
async function cleanupOrphanedFiles(allLectures) {
    console.log('\n🧹 Cleaning up orphaned files...');
    let removed = 0;
    
    for (const section of SECTIONS) {
        const sectionFolder = path.join(section);
        
        if (!fs.existsSync(sectionFolder)) continue;
        
        const htmlFiles = fs.readdirSync(sectionFolder)
            .filter(f => f.endsWith('.html') && f !== 'index.html');
        
        for (const htmlFile of htmlFiles) {
            const htmlId = htmlFile.replace('.html', '');
            const hasJson = allLectures.some(l => 
                l.section === section && l.id === htmlId
            );
            
            if (!hasJson) {
                const htmlPath = path.join(sectionFolder, htmlFile);
                fs.unlinkSync(htmlPath);
                console.log(`  🗑️  Removed orphaned: ${section}/${htmlFile}`);
                removed++;
            }
        }
    }
    
    console.log(`  Removed ${removed} orphaned file(s)`);
}

// ============================================================================
// GENERATE ID FROM JSON
// ============================================================================
function generateIdFromJson(json) {
    let date = json.date || 'undated';
    
    let verse = '';
    if (json.primary_verse) {
        // "BG 9.34" → "bg-9-34"
        // "SB 1.2.6" → "sb-1-2-6"
        // "CC Adi 1.1" → "cc-adi-1-1"
        verse = json.primary_verse
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/\./g, '-');
    }
    
    if (!verse && json.title) {
        verse = json.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 40);
    }
    
    if (!verse) {
        return json.id || null;
    }
    
    return `${date}-${verse}`;
}

// ============================================================================
// GENERATE SECTION INDEX JSON
// ============================================================================
async function generateSectionIndex(section, allLectures) {
    const sectionLectures = allLectures.filter(l => l.section === section);
    
    // Sort by date (newest first)
    sectionLectures.sort((a, b) => {
        if (a.date && b.date) {
            return new Date(b.date) - new Date(a.date);
        }
        return 0;
    });
    
    const indexData = {
        section: section,
        title: SECTION_TITLES[section],
        count: sectionLectures.length,
        lectures: sectionLectures.map(l => ({
            id: l.id,
            title: l.title,
            date: l.date,
            primary_verse: l.primary_verse,
            takeaway: l.takeaway,
            summary_short: l.summary_short,
            featured: l.featured || false,
            media: l.media,
            stream_metadata: l.stream_metadata,
            section: l.section
        }))
    };
    
    const sectionFolder = path.join(section);
    if (!fs.existsSync(sectionFolder)) {
        fs.mkdirSync(sectionFolder, { recursive: true });
    }
    
    fs.writeFileSync(
        path.join(sectionFolder, 'index.json'),
        JSON.stringify(indexData, null, 2)
    );
    
    console.log(`✏️  Generated ${section}/index.json`);
}

// ============================================================================
// GENERATE SECTION PAGE
// ============================================================================
async function generateSectionPage(section, allLectures) {
    const sectionLectures = allLectures
        .filter(l => l.section === section)
        .sort((a, b) => {
            if (a.date && b.date) {
                return new Date(b.date) - new Date(a.date);
            }
            return 0;
        });
    
    const sectionTitle = SECTION_TITLES[section];
    
    // Use template from templates.js
    const html = templates.getSectionPageTemplate(section, sectionTitle, sectionLectures);
    
    fs.writeFileSync(`${section}.html`, html);
    console.log(`✏️  Generated ${section}.html`);
}

// ============================================================================
// GENERATE LECTURE PAGE
// ============================================================================
async function generateLecturePage(lecture) {
    const sectionTitle = SECTION_TITLES[lecture.section];
    
    // Use template from templates.js
    const html = templates.getLecturePageTemplate(lecture, sectionTitle);
    
    const sectionFolder = path.join(lecture.section);
    if (!fs.existsSync(sectionFolder)) {
        fs.mkdirSync(sectionFolder, { recursive: true });
    }
    
    fs.writeFileSync(
        path.join(sectionFolder, `${lecture.id}.html`),
        html
    );
    
    console.log(`✏️  Generated ${lecture.section}/${lecture.id}.html`);
}

// ============================================================================
// RUN BUILD
// ============================================================================
if (require.main === module) {
    // Only run if this file is executed directly
    build().catch(error => {
        console.error('❌ Build failed:', error);
        console.error(error.stack);
        process.exit(1);
    });
}