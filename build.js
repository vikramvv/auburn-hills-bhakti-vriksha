const fs = require('fs');
const path = require('path');

const SECTIONS = ['bg-lectures', 'sb-lectures', 'cc-lectures', '9pm-realizations', 'devotee-realizations', 'sankirtan', 'vaishnava-bhajans', 'tulasi-care'];
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

async function build() {
    console.log('🚀 Starting build...\n');
    const allLectures = await loadAllLectures();
    console.log(`📚 Loaded ${allLectures.length} lectures\n`);
    await cleanupOrphanedFiles(allLectures);
    for (const section of SECTIONS) {
        await generateSectionIndex(section, allLectures);
        await generateSectionPage(section, allLectures);
    }
    for (const lecture of allLectures) {
        await generateLecturePage(lecture);
    }
    console.log('\n✅ Build complete!');
}

function extractDateFromFilename(filename) {
    const match = filename.match(/__(\d{1,2})-([A-Za-z]{3})-(\d{2})\./);
    if (!match) return null;
    const [, day, month, year] = match;
    const monthMap = { 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12' };
    return `20${year}-${monthMap[month]}-${day.padStart(2, '0')}`;
}

async function loadAllLectures() {
    const lectures = [];
    for (const section of SECTIONS) {
        const sectionPath = path.join('data', section);
        if (!fs.existsSync(sectionPath)) continue;
        const files = fs.readdirSync(sectionPath).filter(f => f.endsWith('.json'));
        console.log(`📂 ${section}: ${files.length} lectures`);
        for (const file of files) {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(sectionPath, file), 'utf8'));
                data.section = section;
                data.filename = file;
                if (!data.date) {
                    data.date = extractDateFromFilename(file) || (data.stream_metadata?.published_date || '').split('T')[0];
                }
                data.id = generateIdFromJson(data) || data.id || file.replace('.json', '');
                if (!data.media?.video?.youtube_id && data.stream_metadata?.video_id) {
                    data.media = { video: { youtube_id: data.stream_metadata.video_id } };
                }
                lectures.push(data);
            } catch (error) {
                console.error(`❌ Error: ${file}`);
            }
        }
    }
    return lectures;
}

async function cleanupOrphanedFiles(allLectures) {
    console.log('\n🧹 Cleaning orphaned files...');
    let removed = 0;
    for (const section of SECTIONS) {
        if (!fs.existsSync(section)) continue;
        const htmlFiles = fs.readdirSync(section).filter(f => f.endsWith('.html') && f !== 'index.html');
        for (const htmlFile of htmlFiles) {
            const htmlId = htmlFile.replace('.html', '');
            if (!allLectures.some(l => l.section === section && l.id === htmlId)) {
                fs.unlinkSync(path.join(section, htmlFile));
                console.log(`  🗑️  ${section}/${htmlFile}`);
                removed++;
            }
        }
    }
    console.log(`  Removed ${removed} file(s)`);
}

function generateIdFromJson(json) {
    let date = json.date || 'undated';
    let verse = '';
    if (json.primary_verse) {
        verse = json.primary_verse.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '-');
    } else if (json.title) {
        verse = json.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 40);
    }
    return verse ? `${date}-${verse}` : json.id || null;
}

async function generateSectionIndex(section, allLectures) {
    const sectionLectures = allLectures.filter(l => l.section === section).sort((a, b) => a.date && b.date ? new Date(b.date) - new Date(a.date) : 0);
    const indexData = {
        section, title: SECTION_TITLES[section], count: sectionLectures.length,
        lectures: sectionLectures.map(l => ({ id: l.id, title: l.title, date: l.date, primary_verse: l.primary_verse, takeaway: l.takeaway, summary_short: l.summary_short, featured: l.featured || false, media: l.media, stream_metadata: l.stream_metadata, section: l.section }))
    };
    if (!fs.existsSync(section)) fs.mkdirSync(section, { recursive: true });
    fs.writeFileSync(path.join(section, 'index.json'), JSON.stringify(indexData, null, 2));
    console.log(`✏️  ${section}/index.json`);
}

async function generateSectionPage(section, allLectures) {
    const lectures = allLectures.filter(l => l.section === section).sort((a, b) => a.date && b.date ? new Date(b.date) - new Date(a.date) : 0);
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${SECTION_TITLES[section]}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;700&family=Montserrat:wght@400;700&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Cormorant Garamond',serif;background:linear-gradient(135deg,#E8D4A2 0%,#C4B598 100%);min-height:100vh}header{background:linear-gradient(135deg,#8B7752 0%,#6B5D42 100%);padding:40px 20px;text-align:center;color:#E8D4A2;border-bottom:4px solid #3A2F1F}header h1{font-family:'Playfair Display',serif;font-size:clamp(2em,5vw,3.5em);font-weight:900}header a{color:#E8D4A2;text-decoration:none}.subtitle{font-family:'Montserrat',sans-serif;font-size:1.2em;margin-top:10px;text-transform:uppercase}.breadcrumbs{background:rgba(232,212,162,0.3);padding:15px 20px}.breadcrumbs a{color:#5A4D37;text-decoration:none;font-weight:600}.container{max-width:1400px;margin:0 auto;padding:20px}.section-header{background:white;padding:40px;border-radius:12px;margin-bottom:30px;text-align:center}.lectures-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:25px}.lecture-card{background:white;border:3px solid rgba(139,119,82,0.2);border-radius:12px;overflow:hidden;transition:all 0.3s}.lecture-card:hover{border-color:#8B7752;transform:translateY(-4px)}.lecture-thumbnail{position:relative;width:100%;padding-bottom:56.25%;background:#000}.lecture-thumbnail img{position:absolute;width:100%;height:100%;object-fit:cover}.lecture-body{padding:20px}.lecture-title{font-family:'Playfair Display',serif;font-size:1.3em;color:#3A2F1F;margin-bottom:12px;font-weight:700}.badge{padding:6px 12px;border-radius:6px;font-size:0.85em;font-weight:600}.badge-date{background:rgba(232,212,162,0.4);color:#5A4D37;border:2px solid rgba(139,119,82,0.3);margin-right:10px}.badge-verse{background:rgba(139,119,82,0.2);color:#3A2F1F;border:2px solid rgba(139,119,82,0.4)}.lecture-link{display:inline-block;color:#8B7752;text-decoration:none;font-weight:600;margin-top:10px}</style>
</head><body>
<header><h1><a href="index.html">🕉️ Auburn Hills Bhakti Vriksha</a></h1><p class="subtitle">${SECTION_TITLES[section]}</p></header>
<div class="breadcrumbs"><a href="index.html">Home</a> › ${SECTION_TITLES[section]}</div>
<div class="container"><div class="section-header"><h2>${SECTION_TITLES[section]}</h2><p>${lectures.length} lectures</p></div>
<div class="lectures-grid">${lectures.map(l => `
<div class="lecture-card">
<div class="lecture-thumbnail"><img src="https://img.youtube.com/vi/${getYoutubeId(l)}/mqdefault.jpg" alt="${l.title}"></div>
<div class="lecture-body"><h3 class="lecture-title">${l.title}</h3>
<div>${l.date ? `<span class="badge badge-date">📅 ${formatDate(l.date)}</span>` : ''}${l.primary_verse ? `<span class="badge badge-verse">📖 ${l.primary_verse}</span>` : ''}</div>
<p>${l.takeaway || l.summary_short || ''}</p>
<a href="${section}/${l.id}.html" class="lecture-link">Read More →</a>
</div></div>`).join('')}</div></div></body></html>`;
    fs.writeFileSync(`${section}.html`, html);
    console.log(`✏️  ${section}.html`);
}

async function generateLecturePage(lecture) {
    const hasMermaid = !!lecture.mermaid_chart;
    const videoId = getYoutubeId(lecture);
    
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${lecture.title}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;700&family=Montserrat:wght@400;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Cormorant Garamond',serif;background:linear-gradient(135deg,#E8D4A2,#C4B598);min-height:100vh}header{background:linear-gradient(135deg,#8B7752,#6B5D42);padding:30px 20px;text-align:center;color:#E8D4A2;border-bottom:4px solid #3A2F1F}header h1{font-family:'Playfair Display',serif;font-size:2em;font-weight:900}header a{color:#E8D4A2;text-decoration:none}.breadcrumbs{background:rgba(232,212,162,0.3);padding:15px 20px}.breadcrumbs a{color:#5A4D37;text-decoration:none;font-weight:600}.container{max-width:1200px;margin:0 auto;padding:20px}.lecture-header{background:white;padding:40px;border-radius:12px;margin-bottom:20px;border:3px solid rgba(139,119,82,0.2)}.lecture-title{font-family:'Playfair Display',serif;font-size:2.5em;color:#3A2F1F;margin-bottom:20px}.badge{padding:8px 16px;border-radius:8px;font-size:0.9em;font-weight:600;margin-right:10px}.badge-date{background:rgba(232,212,162,0.4);color:#5A4D37;border:2px solid rgba(139,119,82,0.3)}.badge-verse{background:rgba(139,119,82,0.2);color:#3A2F1F;border:2px solid rgba(139,119,82,0.4)}.badge-speaker{background:rgba(196,30,58,0.1);color:#8b0000;border:2px solid rgba(196,30,58,0.3)}.lecture-tabs{display:flex;background:rgba(232,212,162,0.3);border-radius:12px 12px 0 0;overflow-x:auto;border:3px solid rgba(139,119,82,0.2);border-bottom:none}.tab-btn{flex:1;padding:18px 24px;border:none;background:transparent;color:#5A4D37;font-weight:600;cursor:pointer;text-transform:uppercase;white-space:nowrap}.tab-btn:hover{background:rgba(232,212,162,0.5)}.tab-btn.active{background:white;color:#3A2F1F;font-weight:700}.tab-content{display:none;background:white;padding:40px;border-radius:0 0 12px 12px;border:3px solid rgba(139,119,82,0.2);border-top:none;min-height:400px}.tab-content.active{display:block}.video-container{position:relative;padding-bottom:56.25%;height:0;margin-bottom:30px}.video-container iframe{position:absolute;width:100%;height:100%}.mermaid-container{background:rgba(232,212,162,0.1);padding:30px;border-radius:12px;overflow-x:auto}.content-text{font-size:1.15em;line-height:1.8;margin-bottom:20px}.section-heading{font-family:'Playfair Display',serif;font-size:1.8em;color:#3A2F1F;margin:30px 0 20px;font-weight:700;border-bottom:2px solid rgba(139,119,82,0.2);padding-bottom:10px}.theme-card{background:rgba(232,212,162,0.2);border:2px solid rgba(139,119,82,0.3);border-radius:8px;padding:25px;margin-bottom:20px}.flashcard-container{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}.flashcard{perspective:1000px;height:250px;cursor:pointer}.flashcard-inner{position:relative;width:100%;height:100%;transition:transform 0.6s;transform-style:preserve-3d}.flashcard.flipped .flashcard-inner{transform:rotateY(180deg)}.flashcard-front,.flashcard-back{position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:12px;padding:30px;display:flex;align-items:center;justify-content:center;font-size:1.2em;border:3px solid rgba(139,119,82,0.3)}.flashcard-front{background:linear-gradient(135deg,#8B7752,#6B5D42);color:#E8D4A2;font-weight:700}.flashcard-back{background:white;color:#3A2F1F;transform:rotateY(180deg)}</style>
</head><body>
<header><h1><a href="../index.html">🕉️ Auburn Hills Bhakti Vriksha</a></h1></header>
<div class="breadcrumbs"><a href="../index.html">Home</a> › <a href="../${lecture.section}.html">${SECTION_TITLES[lecture.section]}</a> › ${lecture.title}</div>
<div class="container">
<div class="lecture-header"><h1 class="lecture-title">${lecture.title}</h1>
<div>${lecture.date ? `<span class="badge badge-date">📅 ${formatDate(lecture.date)}</span>` : ''}${lecture.primary_verse ? `<span class="badge badge-verse">📖 ${lecture.primary_verse}</span>` : ''}${lecture.speaker?.name || lecture.speaker ? `<span class="badge badge-speaker">🎤 ${lecture.speaker?.name || lecture.speaker}</span>` : ''}</div></div>
<div class="lecture-tabs">
<button class="tab-btn active" data-tab="overview">Overview</button>
${hasMermaid ? '<button class="tab-btn" data-tab="mindmap">Mind Map</button>' : ''}
<button class="tab-btn" data-tab="notes">Notes</button>
<button class="tab-btn" data-tab="flashcards">Flashcards</button>
<button class="tab-btn" data-tab="transcript">Transcript</button>
</div>
<div class="tab-content active" id="overview">
${videoId ? `<div class="video-container"><iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe></div>` : ''}
${lecture.takeaway ? `<h2 class="section-heading">Key Takeaway</h2><p class="content-text">${lecture.takeaway}</p>` : ''}
${lecture.summary_medium || lecture.summary_short ? `<h2 class="section-heading">Summary</h2><p class="content-text">${lecture.summary_medium || lecture.summary_short}</p>` : ''}
</div>
${hasMermaid ? `<div class="tab-content" id="mindmap"><h2 class="section-heading">Lecture Structure</h2><div class="mermaid-container"><pre class="mermaid">${lecture.mermaid_chart}</pre></div></div>` : ''}
<div class="tab-content" id="notes">${getNotesTab(lecture)}</div>
<div class="tab-content" id="flashcards">${getFlashcardsTab(lecture)}</div>
<div class="tab-content" id="transcript"><div class="content-text" style="white-space:pre-wrap">${lecture.transcript?.full_text || lecture.transcript || 'No transcript available'}</div></div>
</div>
<script>
mermaid.initialize({startOnLoad:true,theme:'neutral'});
document.querySelectorAll('.tab-btn').forEach(btn=>{
btn.addEventListener('click',()=>{
const tab=btn.dataset.tab;
document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
btn.classList.add('active');
document.getElementById(tab).classList.add('active');
});
});
</script>
</body></html>`;
    
    if (!fs.existsSync(lecture.section)) fs.mkdirSync(lecture.section, { recursive: true });
    fs.writeFileSync(path.join(lecture.section, `${lecture.id}.html`), html);
    console.log(`✏️  ${lecture.section}/${lecture.id}.html`);
}

function getNotesTab(lecture) {
    let html = '';
    if (lecture.themes?.length || lecture.concepts?.length) {
        html += '<h2 class="section-heading">Key Concepts</h2>';
        (lecture.themes || lecture.concepts).forEach(t => {
            html += `<div class="theme-card"><h3>${t.title || t.heading}</h3><p>${t.details}</p></div>`;
        });
    }
    if (lecture.sanskrit_terms?.length) {
        html += '<h2 class="section-heading">Sanskrit Terms</h2>';
        lecture.sanskrit_terms.forEach(term => {
            const t = typeof term === 'string' ? {term: term.split(':')[0], definition: term.split(':')[1]} : term;
            html += `<div class="theme-card"><h3>${t.term}</h3><p>${t.definition || t.definition_short}</p></div>`;
        });
    }
    return html || '<p class="content-text">No notes available</p>';
}

function getFlashcardsTab(lecture) {
    const cards = [];
    if (lecture.sanskrit_terms?.length) {
        lecture.sanskrit_terms.forEach(term => {
            const t = typeof term === 'string' ? {term: term.split(':')[0], definition: term.split(':')[1]} : term;
            cards.push({front: t.term, back: t.definition || t.definition_short});
        });
    }
    if (lecture.qa?.length) {
        lecture.qa.forEach(qa => cards.push({front: qa.question, back: qa.answer}));
    }
    if (cards.length === 0) return '<p class="content-text">No flashcards available</p>';
    return `<p class="content-text">Click to flip!</p><div class="flashcard-container">${cards.map(c => `
<div class="flashcard" onclick="this.classList.toggle('flipped')">
<div class="flashcard-inner">
<div class="flashcard-front">${c.front}</div>
<div class="flashcard-back">${c.back}</div>
</div></div>`).join('')}</div>`;
}

function getYoutubeId(lecture) {
    return lecture.media?.video?.youtube_id || lecture.stream_metadata?.video_id || '';
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

build().catch(console.error);