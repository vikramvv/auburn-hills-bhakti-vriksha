const fs = require('fs');
const path = require('path');

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

// Main build function
async function build() {
    console.log('🚀 Starting build process...\n');
    
    // Load all lectures from data folder
    const allLectures = await loadAllLectures();
    console.log(`📚 Loaded ${allLectures.length} total lectures\n`);
    
    // Generate section index files
    for (const section of SECTIONS) {
        await generateSectionIndex(section, allLectures);
    }
    
    // Generate individual lecture pages
    for (const lecture of allLectures) {
        await generateLecturePage(lecture);
    }
    
    console.log('\n✅ Build complete!');
}

// Load all lectures from data/ folder
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
                
                // Extract date from stream_metadata if missing
                if (!data.date && data.stream_metadata?.published_date) {
                    data.date = data.stream_metadata.published_date.split('T')[0];
                }
                
                // Generate proper ID from JSON content
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

// Generate standardized ID from JSON content
function generateIdFromJson(json) {
    // Get date
    let date = json.date || 
               (json.stream_metadata?.published_date || '').split('T')[0];
    
    if (!date) {
        date = 'undated';
    }
    
    // Get verse identifier
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
    
    // Fallback: use first few words of title
    if (!verse && json.title) {
        verse = json.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')  // Remove leading/trailing dashes
            .substring(0, 40);
    }
    
    // If still no verse, use existing ID
    if (!verse) {
        return json.id || null;
    }
    
    return `${date}-${verse}`;
}

// Generate section index.json file
async function generateSectionIndex(section, allLectures) {
    const sectionLectures = allLectures.filter(l => l.section === section);
    
    // Sort by date (newest first) or verse number
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
    
    // Create section folder if doesn't exist
    const sectionFolder = path.join(section);
    if (!fs.existsSync(sectionFolder)) {
        fs.mkdirSync(sectionFolder, { recursive: true });
    }
    
    // Write index.json
    fs.writeFileSync(
        path.join(sectionFolder, 'index.json'),
        JSON.stringify(indexData, null, 2)
    );
    
    console.log(`✏️  Generated ${section}/index.json`);
}

// Generate individual lecture page
async function generateLecturePage(lecture) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${lecture.title} | Auburn Hills Bhakti Vriksha</title>
    <meta name="description" content="${(lecture.takeaway || '').substring(0, 150)}">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@400;600;700&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    ${getLectureStyles()}
</head>
<body>
    ${getHeader()}
    ${getBreadcrumbs(lecture)}
    
    <div class="container">
        <div class="lecture-header">
            <h1 class="lecture-title">${lecture.title}</h1>
            <div class="lecture-meta">
                ${lecture.date ? `<span class="badge badge-date">📅 ${formatDate(lecture.date)}</span>` : ''}
                ${lecture.primary_verse ? `<span class="badge badge-verse">📖 ${lecture.primary_verse}</span>` : ''}
                ${lecture.speaker?.name || lecture.speaker ? `<span class="badge badge-speaker">🎤 ${lecture.speaker?.name || lecture.speaker}</span>` : ''}
            </div>
        </div>
        
        <div class="lecture-tabs">
            <button class="tab-btn active" data-tab="overview">Overview</button>
            <button class="tab-btn" data-tab="notes">Study Notes</button>
            <button class="tab-btn" data-tab="flashcards">Flashcards</button>
            <button class="tab-btn" data-tab="quiz">Quiz</button>
            <button class="tab-btn" data-tab="transcript">Transcript</button>
        </div>
        
        <div class="tab-content active" id="overview">
            ${getOverviewTab(lecture)}
        </div>
        
        <div class="tab-content" id="notes">
            ${getNotesTab(lecture)}
        </div>
        
        <div class="tab-content" id="flashcards">
            ${getFlashcardsTab(lecture)}
        </div>
        
        <div class="tab-content" id="quiz">
            ${getQuizTab(lecture)}
        </div>
        
        <div class="tab-content" id="transcript">
            ${getTranscriptTab(lecture)}
        </div>
    </div>
    
    ${getLectureScripts(lecture)}
</body>
</html>`;
    
    // Create section folder
    const sectionFolder = path.join(lecture.section);
    if (!fs.existsSync(sectionFolder)) {
        fs.mkdirSync(sectionFolder, { recursive: true });
    }
    
    // Write HTML file
    fs.writeFileSync(
        path.join(sectionFolder, `${lecture.id}.html`),
        html
    );
    
    console.log(`✏️  Generated ${lecture.section}/${lecture.id}.html`);
}

// Get lecture styles
function getLectureStyles() {
    return `<style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Cormorant Garamond', serif;
            background: linear-gradient(135deg, #E8D4A2 0%, #D4C5A0 50%, #C4B598 100%);
            min-height: 100vh;
        }
        
        header {
            background: linear-gradient(135deg, #8B7752 0%, #6B5D42 100%);
            padding: 30px 20px;
            text-align: center;
            color: #E8D4A2;
            border-bottom: 4px solid #3A2F1F;
        }
        
        header h1 {
            font-family: 'Playfair Display', serif;
            font-size: clamp(1.8em, 4vw, 2.5em);
            font-weight: 900;
            margin-bottom: 5px;
        }
        
        header a {
            color: #E8D4A2;
            text-decoration: none;
            transition: opacity 0.3s;
        }
        
        header a:hover { opacity: 0.8; }
        
        .breadcrumbs {
            background: rgba(232, 212, 162, 0.3);
            padding: 15px 20px;
            font-family: 'Montserrat', sans-serif;
            font-size: 0.9em;
        }
        
        .breadcrumbs a {
            color: #5A4D37;
            text-decoration: none;
            font-weight: 600;
        }
        
        .breadcrumbs a:hover { color: #3A2F1F; }
        
        .breadcrumbs span { margin: 0 8px; color: #8B7752; }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .lecture-header {
            background: white;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 20px;
            border: 3px solid rgba(139, 119, 82, 0.2);
            box-shadow: 0 4px 12px rgba(58, 47, 31, 0.1);
        }
        
        .lecture-title {
            font-family: 'Playfair Display', serif;
            font-size: clamp(1.8em, 4vw, 2.8em);
            color: #3A2F1F;
            margin-bottom: 20px;
            font-weight: 700;
            line-height: 1.3;
        }
        
        .lecture-meta {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .badge {
            padding: 8px 16px;
            border-radius: 8px;
            font-family: 'Montserrat', sans-serif;
            font-size: 0.9em;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .badge-date {
            background: rgba(232, 212, 162, 0.4);
            color: #5A4D37;
            border: 2px solid rgba(139, 119, 82, 0.3);
        }
        
        .badge-verse {
            background: rgba(139, 119, 82, 0.2);
            color: #3A2F1F;
            border: 2px solid rgba(139, 119, 82, 0.4);
        }
        
        .badge-speaker {
            background: rgba(196, 30, 58, 0.1);
            color: #8b0000;
            border: 2px solid rgba(196, 30, 58, 0.3);
        }
        
        .lecture-tabs {
            display: flex;
            background: rgba(232, 212, 162, 0.3);
            border-radius: 12px 12px 0 0;
            overflow-x: auto;
            border: 3px solid rgba(139, 119, 82, 0.2);
            border-bottom: none;
        }
        
        .tab-btn {
            flex: 1;
            padding: 18px 24px;
            border: none;
            background: transparent;
            color: #5A4D37;
            font-family: 'Montserrat', sans-serif;
            font-size: clamp(0.85em, 2vw, 1em);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
            border-right: 1px solid rgba(139, 119, 82, 0.2);
        }
        
        .tab-btn:last-child { border-right: none; }
        
        .tab-btn:hover {
            background: rgba(232, 212, 162, 0.5);
            color: #3A2F1F;
        }
        
        .tab-btn.active {
            background: white;
            color: #3A2F1F;
            font-weight: 700;
        }
        
        .tab-content {
            display: none;
            background: white;
            padding: 40px;
            border-radius: 0 0 12px 12px;
            border: 3px solid rgba(139, 119, 82, 0.2);
            border-top: none;
            min-height: 400px;
        }
        
        .tab-content.active { display: block; }
        
        .video-container {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        
        .section-heading {
            font-family: 'Playfair Display', serif;
            font-size: 1.8em;
            color: #3A2F1F;
            margin: 30px 0 20px;
            font-weight: 700;
            padding-bottom: 10px;
            border-bottom: 2px solid rgba(139, 119, 82, 0.2);
        }
        
        .content-text {
            font-size: 1.15em;
            line-height: 1.8;
            color: #5A4D37;
            margin-bottom: 20px;
        }
        
        .theme-card {
            background: rgba(232, 212, 162, 0.2);
            border: 2px solid rgba(139, 119, 82, 0.3);
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 20px;
        }
        
        .theme-title {
            font-family: 'Playfair Display', serif;
            font-size: 1.4em;
            color: #3A2F1F;
            margin-bottom: 15px;
            font-weight: 700;
        }
        
        .flashcard-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .flashcard {
            perspective: 1000px;
            height: 250px;
            cursor: pointer;
        }
        
        .flashcard-inner {
            position: relative;
            width: 100%;
            height: 100%;
            text-align: center;
            transition: transform 0.6s;
            transform-style: preserve-3d;
        }
        
        .flashcard.flipped .flashcard-inner {
            transform: rotateY(180deg);
        }
        
        .flashcard-front, .flashcard-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 12px;
            padding: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2em;
            border: 3px solid rgba(139, 119, 82, 0.3);
        }
        
        .flashcard-front {
            background: linear-gradient(135deg, #8B7752 0%, #6B5D42 100%);
            color: #E8D4A2;
            font-weight: 700;
        }
        
        .flashcard-back {
            background: white;
            color: #3A2F1F;
            transform: rotateY(180deg);
            line-height: 1.6;
        }
        
        .quiz-question {
            background: rgba(232, 212, 162, 0.2);
            border: 2px solid rgba(139, 119, 82, 0.3);
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 25px;
        }
        
        .quiz-options {
            display: grid;
            gap: 12px;
            margin-top: 20px;
        }
        
        .quiz-option {
            padding: 15px 20px;
            border: 2px solid rgba(139, 119, 82, 0.3);
            border-radius: 8px;
            background: white;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 1.1em;
        }
        
        .quiz-option:hover {
            background: rgba(232, 212, 162, 0.3);
            border-color: #8B7752;
        }
        
        .quiz-option.selected {
            background: #8B7752;
            color: #E8D4A2;
            border-color: #3A2F1F;
        }
        
        .transcript-text {
            font-size: 1.15em;
            line-height: 1.9;
            color: #5A4D37;
            white-space: pre-wrap;
        }
        
        @media (max-width: 768px) {
            .lecture-header { padding: 25px; }
            .tab-content { padding: 25px; }
            .tab-btn { padding: 14px 16px; font-size: 0.85em; }
            .flashcard-container { grid-template-columns: 1fr; }
        }
    </style>`;
}

function getHeader() {
    return `<header>
        <h1><a href="../index.html">🕉️ Auburn Hills Bhakti Vriksha</a></h1>
    </header>`;
}

function getBreadcrumbs(lecture) {
    return `<div class="breadcrumbs">
        <a href="../index.html">Home</a>
        <span>›</span>
        <a href="../${lecture.section}.html">${SECTION_TITLES[lecture.section]}</a>
        <span>›</span>
        <span>${lecture.title}</span>
    </div>`;
}

function getOverviewTab(lecture) {
    const videoId = lecture.media?.video?.youtube_id || lecture.stream_metadata?.video_id || '';
    
    return `
        ${videoId ? `<div class="video-container">
            <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
        </div>` : ''}
        
        ${lecture.takeaway ? `
        <h2 class="section-heading">Key Takeaway</h2>
        <p class="content-text">${lecture.takeaway}</p>
        ` : ''}
        
        ${lecture.main_theme ? `
        <h2 class="section-heading">Main Theme</h2>
        <p class="content-text">${lecture.main_theme}</p>
        ` : ''}
        
        ${lecture.summary_short || lecture.summary_medium ? `
        <h2 class="section-heading">Summary</h2>
        <p class="content-text">${lecture.summary_medium || lecture.summary_short}</p>
        ` : ''}
    `;
}

function getNotesTab(lecture) {
    let html = '';
    
    // Themes/Concepts
    if (lecture.themes?.length || lecture.concepts?.length) {
        const themes = lecture.themes || lecture.concepts;
        html += `<h2 class="section-heading">Key Concepts</h2>`;
        themes.forEach(theme => {
            html += `
            <div class="theme-card">
                <h3 class="theme-title">${theme.title || theme.heading}</h3>
                <p class="content-text">${theme.details}</p>
                ${theme.examples?.length ? `
                <p><strong>Examples:</strong></p>
                <ul>${theme.examples.map(ex => `<li class="content-text">${typeof ex === 'string' ? ex : ex.content}</li>`).join('')}</ul>
                ` : ''}
            </div>`;
        });
    }
    
    // Sanskrit Terms
    if (lecture.sanskrit_terms?.length) {
        html += `<h2 class="section-heading">📚 Sanskrit Terms</h2>`;
        lecture.sanskrit_terms.forEach(term => {
            const termObj = typeof term === 'string' ? parseSimpleTerm(term) : term;
            html += `
            <div class="theme-card">
                <h3 class="theme-title">${termObj.term} ${termObj.devanagari ? `(${termObj.devanagari})` : ''}</h3>
                <p class="content-text">${termObj.definition || termObj.definition_short}</p>
            </div>`;
        });
    }
    
    // Life Applications
    if (lecture.life_applications?.length) {
        html += `<h2 class="section-heading">Practical Applications</h2><ul>`;
        lecture.life_applications.forEach(app => {
            html += `<li class="content-text">${typeof app === 'string' ? app : app.principle}</li>`;
        });
        html += `</ul>`;
    }
    
    // Quotes
    if (lecture.quotes?.length) {
        html += `<h2 class="section-heading">Notable Quotes</h2>`;
        lecture.quotes.forEach(quote => {
            const quoteText = typeof quote === 'string' ? quote : quote.text;
            html += `<blockquote class="content-text">"${quoteText}"</blockquote>`;
        });
    }
    
    return html || '<p class="content-text">No study notes available for this lecture.</p>';
}

function getFlashcardsTab(lecture) {
    const flashcards = generateFlashcards(lecture);
    
    if (flashcards.length === 0) {
        return '<p class="content-text">No flashcards available for this lecture.</p>';
    }
    
    return `
        <p class="content-text">Click on a card to flip it!</p>
        <div class="flashcard-container">
            ${flashcards.map((card, i) => `
            <div class="flashcard" onclick="this.classList.toggle('flipped')">
                <div class="flashcard-inner">
                    <div class="flashcard-front">${card.front}</div>
                    <div class="flashcard-back">${card.back}</div>
                </div>
            </div>
            `).join('')}
        </div>
    `;
}

function getQuizTab(lecture) {
    const quiz = lecture.quiz || generateQuizFromQA(lecture);
    
    if (quiz.length === 0) {
        return '<p class="content-text">No quiz available for this lecture.</p>';
    }
    
    return `
        <div id="quizContainer">
            <p class="content-text">Test your knowledge! Results will be saved locally.</p>
            ${quiz.map((q, i) => `
            <div class="quiz-question">
                <p class="content-text"><strong>Question ${i + 1}:</strong> ${q.question}</p>
                <div class="quiz-options">
                    ${q.options.map((opt, j) => `
                    <div class="quiz-option" onclick="selectOption(${i}, ${j}, ${q.correct})">${opt}</div>
                    `).join('')}
                </div>
                <div id="explanation-${i}" style="display:none; margin-top:15px;">
                    <p class="content-text"><strong>Explanation:</strong> ${q.explanation}</p>
                </div>
            </div>
            `).join('')}
        </div>
    `;
}

function getTranscriptTab(lecture) {
    const transcript = lecture.transcript?.full_text || lecture.transcript || '';
    
    if (!transcript) {
        return '<p class="content-text">No transcript available for this lecture.</p>';
    }
    
    return `<div class="transcript-text">${transcript}</div>`;
}

function getLectureScripts(lecture) {
    return `<script>
        mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                document.getElementById(tab).classList.add('active');
            });
        });
        
        // Quiz functionality
        let quizScore = 0;
        let quizTotal = ${(lecture.quiz || []).length};
        
        function selectOption(questionIndex, optionIndex, correctIndex) {
            const options = document.querySelectorAll(\`.quiz-question:nth-child(\${questionIndex + 2}) .quiz-option\`);
            options.forEach(opt => opt.classList.remove('selected'));
            options[optionIndex].classList.add('selected');
            
            document.getElementById(\`explanation-\${questionIndex}\`).style.display = 'block';
            
            if (optionIndex === correctIndex) {
                quizScore++;
                options[optionIndex].style.background = '#4CAF50';
                options[optionIndex].style.color = 'white';
            } else {
                options[optionIndex].style.background = '#f44336';
                options[optionIndex].style.color = 'white';
                options[correctIndex].style.background = '#4CAF50';
                options[correctIndex].style.color = 'white';
            }
            
            // Save to localStorage
            saveQuizResult('${lecture.id}', quizScore, quizTotal);
        }
        
        function saveQuizResult(lectureId, score, total) {
            const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
            results.push({
                lectureId,
                score,
                total,
                date: new Date().toISOString()
            });
            localStorage.setItem('quizResults', JSON.stringify(results));
        }
    </script>`;
}

// Helper functions
function generateFlashcards(lecture) {
    const flashcards = [];
    
    // From Sanskrit terms
    if (lecture.sanskrit_terms?.length) {
        lecture.sanskrit_terms.forEach(term => {
            const termObj = typeof term === 'string' ? parseSimpleTerm(term) : term;
            flashcards.push({
                front: `${termObj.term}${termObj.devanagari ? ` (${termObj.devanagari})` : ''}`,
                back: termObj.definition || termObj.definition_short
            });
        });
    }
    
    // From Q&A
    if (lecture.qa?.length) {
        lecture.qa.forEach(qa => {
            flashcards.push({
                front: qa.question,
                back: qa.answer
            });
        });
    }
    
    // From themes (first 5)
    if (lecture.themes?.length || lecture.concepts?.length) {
        const themes = (lecture.themes || lecture.concepts).slice(0, 5);
        themes.forEach(theme => {
            flashcards.push({
                front: theme.title || theme.heading,
                back: theme.details.substring(0, 200) + '...'
            });
        });
    }
    
    return flashcards;
}

function generateQuizFromQA(lecture) {
    const quiz = [];
    
    if (lecture.qa?.length) {
        lecture.qa.slice(0, 5).forEach(qa => {
            // Create a simple quiz question from Q&A
            quiz.push({
                question: qa.question,
                options: [
                    qa.answer.substring(0, 100),
                    "This is not the correct answer",
                    "This is also incorrect",
                    "This is wrong too"
                ],
                correct: 0,
                explanation: qa.answer
            });
        });
    }
    
    return quiz;
}

function parseSimpleTerm(termString) {
    // Parse "Term: Definition" format
    const parts = termString.split(':');
    return {
        term: parts[0].trim(),
        definition: parts[1]?.trim() || ''
    };
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Run build
build().catch(console.error);