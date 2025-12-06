// templates.js - All HTML templates separated from logic

function getSectionPageTemplate(section, sectionTitle, lectures) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sectionTitle} | Auburn Hills Bhakti Vriksha</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@400;600;700&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Cormorant Garamond', serif;
            background: linear-gradient(135deg, #E8D4A2 0%, #D4C5A0 50%, #C4B598 100%);
            min-height: 100vh;
        }
        
        header {
            background: linear-gradient(135deg, #8B7752 0%, #6B5D42 100%);
            padding: 40px 20px;
            text-align: center;
            color: #E8D4A2;
            border-bottom: 4px solid #3A2F1F;
        }
        
        header h1 {
            font-family: 'Playfair Display', serif;
            font-size: clamp(2em, 5vw, 3.5em);
            font-weight: 900;
        }
        
        header a { color: #E8D4A2; text-decoration: none; transition: opacity 0.3s; }
        header a:hover { opacity: 0.8; }
        
        .subtitle {
            font-family: 'Montserrat', sans-serif;
            font-size: clamp(1em, 2.5vw, 1.3em);
            opacity: 0.95;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-weight: 600;
            margin-top: 10px;
        }
        
        .breadcrumbs {
            background: rgba(232, 212, 162, 0.3);
            padding: 15px 20px;
            font-family: 'Montserrat', sans-serif;
            font-size: 0.9em;
        }
        
        .breadcrumbs a { color: #5A4D37; text-decoration: none; font-weight: 600; }
        .breadcrumbs a:hover { color: #3A2F1F; }
        .breadcrumbs span { margin: 0 8px; color: #8B7752; }
        
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        
        .section-header {
            background: white;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 30px;
            border: 3px solid rgba(139, 119, 82, 0.2);
            text-align: center;
        }
        
        .section-header h2 {
            font-family: 'Playfair Display', serif;
            font-size: clamp(2em, 4vw, 3em);
            color: #3A2F1F;
            margin-bottom: 10px;
        }
        
        .count {
            font-family: 'Montserrat', sans-serif;
            font-size: 1.2em;
            color: #8B7752;
            font-weight: 600;
        }
        
        .lectures-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 25px;
        }
        
        .lecture-card {
            background: white;
            border: 3px solid rgba(139, 119, 82, 0.2);
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(58, 47, 31, 0.1);
        }
        
        .lecture-card:hover {
            border-color: #8B7752;
            box-shadow: 0 8px 24px rgba(139, 119, 82, 0.3);
            transform: translateY(-4px);
        }
        
        .lecture-thumbnail {
            position: relative;
            width: 100%;
            padding-bottom: 56.25%;
            background: #000;
            overflow: hidden;
        }
        
        .lecture-thumbnail img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .lecture-body { padding: 20px; }
        
        .lecture-title {
            font-family: 'Playfair Display', serif;
            font-size: 1.3em;
            color: #3A2F1F;
            margin-bottom: 12px;
            font-weight: 700;
            line-height: 1.3;
        }
        
        .lecture-meta { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px; }
        
        .badge {
            padding: 6px 12px;
            border-radius: 6px;
            font-family: 'Montserrat', sans-serif;
            font-size: 0.85em;
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
        
        .lecture-summary {
            font-size: 1em;
            line-height: 1.6;
            color: #5A4D37;
            margin-bottom: 15px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .lecture-link {
            display: inline-block;
            color: #8B7752;
            text-decoration: none;
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
            font-size: 0.95em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.3s;
        }
        
        .lecture-link:hover {
            color: #3A2F1F;
            transform: translateX(5px);
        }
        
        @media (max-width: 768px) {
            .lectures-grid {
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            }
        }
        
        @media (max-width: 640px) {
            .lectures-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <header>
        <h1><a href="index.html">🕉️ Auburn Hills Bhakti Vriksha</a></h1>
        <p class="subtitle">${sectionTitle}</p>
    </header>
    
    <div class="breadcrumbs">
        <a href="index.html">Home</a>
        <span>›</span>
        <span>${sectionTitle}</span>
    </div>
    
    <div class="container">
        <div class="section-header">
            <h2>${sectionTitle}</h2>
            <p class="count">${lectures.length} lecture${lectures.length !== 1 ? 's' : ''}</p>
        </div>
        
        <div class="lectures-grid">
            ${lectures.map(lecture => getLectureCardHTML(lecture, section)).join('\n')}
        </div>
    </div>
</body>
</html>`;
}

function getLectureCardHTML(lecture, section) {
    const videoId = lecture.media?.video?.youtube_id || lecture.stream_metadata?.video_id || '';
    const date = lecture.date ? formatDate(lecture.date) : '';
    const verse = lecture.primary_verse || '';
    const summary = lecture.takeaway || lecture.summary_short || '';
    
    return `
            <div class="lecture-card">
                <div class="lecture-thumbnail">
                    <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" 
                         alt="${lecture.title}"
                         onerror="this.src='https://via.placeholder.com/320x180/8B7752/E8D4A2?text=No+Thumbnail'">
                </div>
                <div class="lecture-body">
                    <h3 class="lecture-title">${lecture.title}</h3>
                    <div class="lecture-meta">
                        ${date ? `<span class="badge badge-date">📅 ${date}</span>` : ''}
                        ${verse ? `<span class="badge badge-verse">📖 ${verse}</span>` : ''}
                    </div>
                    <p class="lecture-summary">${summary}</p>
                    <a href="${section}/${lecture.id}.html" class="lecture-link">Read More →</a>
                </div>
            </div>`;
}

function getLecturePageTemplate(lecture, sectionTitle) {
    const hasMermaid = !!lecture.mermaid_chart;
    const videoId = lecture.media?.video?.youtube_id || lecture.stream_metadata?.video_id || '';
    const date = lecture.date ? formatDate(lecture.date) : '';
    const verse = lecture.primary_verse || '';
    const speaker = lecture.speaker?.name || lecture.speaker || '';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${lecture.title} | Auburn Hills Bhakti Vriksha</title>
    <meta name="description" content="${(lecture.takeaway || '').substring(0, 150)}">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@400;600;700&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    ${getLecturePageStyles()}
</head>
<body>
    <header>
        <h1><a href="../index.html">🕉️ Auburn Hills Bhakti Vriksha</a></h1>
    </header>
    
    <div class="breadcrumbs">
        <a href="../index.html">Home</a>
        <span>›</span>
        <a href="../${lecture.section}.html">${sectionTitle}</a>
        <span>›</span>
        <span>${lecture.title}</span>
    </div>
    
    <div class="container">
        <div class="lecture-header">
            <h1 class="lecture-title">${lecture.title}</h1>
            <div class="lecture-meta">
                ${date ? `<span class="badge badge-date">📅 ${date}</span>` : ''}
                ${verse ? `<span class="badge badge-verse">📖 ${verse}</span>` : ''}
                ${speaker ? `<span class="badge badge-speaker">🎤 ${speaker}</span>` : ''}
            </div>
        </div>
        
        <div class="lecture-tabs">
            <button class="tab-btn active" data-tab="overview">Overview</button>
            ${hasMermaid ? '<button class="tab-btn" data-tab="mindmap">Mind Map</button>' : ''}
            <button class="tab-btn" data-tab="notes">Study Notes</button>
            <button class="tab-btn" data-tab="flashcards">Flashcards</button>
            <button class="tab-btn" data-tab="transcript">Transcript</button>
        </div>
        
        <div class="tab-content active" id="overview">
            ${getOverviewTabHTML(lecture, videoId)}
        </div>
        
        ${hasMermaid ? `<div class="tab-content" id="mindmap">
            ${getMindMapTabHTML(lecture)}
        </div>` : ''}
        
        <div class="tab-content" id="notes">
            ${getNotesTabHTML(lecture)}
        </div>
        
        <div class="tab-content" id="flashcards">
            ${getFlashcardsTabHTML(lecture)}
        </div>
        
        <div class="tab-content" id="transcript">
            ${getTranscriptTabHTML(lecture)}
        </div>
    </div>
    
    ${getLecturePageScripts()}
</body>
</html>`;
}

function getLecturePageStyles() {
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
        }
        
        header a { color: #E8D4A2; text-decoration: none; transition: opacity 0.3s; }
        header a:hover { opacity: 0.8; }
        
        .breadcrumbs {
            background: rgba(232, 212, 162, 0.3);
            padding: 15px 20px;
            font-family: 'Montserrat', sans-serif;
            font-size: 0.9em;
        }
        
        .breadcrumbs a { color: #5A4D37; text-decoration: none; font-weight: 600; }
        .breadcrumbs a:hover { color: #3A2F1F; }
        .breadcrumbs span { margin: 0 8px; color: #8B7752; }
        
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        
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
        
        .lecture-meta { display: flex; gap: 12px; flex-wrap: wrap; }
        
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
        .tab-btn:hover { background: rgba(232, 212, 162, 0.5); color: #3A2F1F; }
        .tab-btn.active { background: white; color: #3A2F1F; font-weight: 700; }
        
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
        
        .mermaid-container {
            background: rgba(232, 212, 162, 0.1);
            padding: 30px;
            border-radius: 12px;
            border: 2px solid rgba(139, 119, 82, 0.2);
            overflow-x: auto;
            margin: 20px 0;
        }
        
        .mermaid {
            display: flex;
            justify-content: center;
            min-height: 400px;
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
        
        @media (max-width: 768px) {
            .lecture-header { padding: 25px; }
            .tab-content { padding: 25px; }
            .tab-btn { padding: 14px 16px; font-size: 0.85em; }
            .flashcard-container { grid-template-columns: 1fr; }
        }
    </style>`;
}

function getOverviewTabHTML(lecture, videoId) {
    let html = '';
    
    if (videoId) {
        html += `<div class="video-container">
            <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
        </div>`;
    }
    
    if (lecture.takeaway) {
        html += `<h2 class="section-heading">Key Takeaway</h2>
        <p class="content-text">${lecture.takeaway}</p>`;
    }
    
    if (lecture.main_theme) {
        html += `<h2 class="section-heading">Main Theme</h2>
        <p class="content-text">${lecture.main_theme}</p>`;
    }
    
    if (lecture.summary_medium || lecture.summary_short) {
        html += `<h2 class="section-heading">Summary</h2>
        <p class="content-text">${lecture.summary_medium || lecture.summary_short}</p>`;
    }
    
    return html || '<p class="content-text">No overview available for this lecture.</p>';
}

function getMindMapTabHTML(lecture) {
    if (!lecture.mermaid_chart) {
        return '<p class="content-text">No mind map available for this lecture.</p>';
    }
    
    return `
        <h2 class="section-heading">Lecture Structure & Flow</h2>
        <div class="mermaid-container">
            <div class="mermaid">
${lecture.mermaid_chart}
            </div>
        </div>
        <p class="content-text" style="margin-top: 20px; font-style: italic;">
            This visual diagram shows the key concepts and their relationships discussed in this lecture.
        </p>
    `;
}


function getNotesTabHTML(lecture) {
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

function getFlashcardsTabHTML(lecture) {
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
    
    // From themes
    if (lecture.themes?.length || lecture.concepts?.length) {
        const themes = (lecture.themes || lecture.concepts).slice(0, 5);
        themes.forEach(theme => {
            flashcards.push({
                front: theme.title || theme.heading,
                back: theme.details.substring(0, 200) + (theme.details.length > 200 ? '...' : '')
            });
        });
    }
    
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

function getTranscriptTabHTML(lecture) {
    const transcript = lecture.transcript?.full_text || lecture.transcript || '';
    
    if (!transcript) {
        return '<p class="content-text">No transcript available for this lecture.</p>';
    }
    
    return `<div class="content-text" style="white-space: pre-wrap;">${transcript}</div>`;
}

function getLecturePageScripts() {
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
    </script>`;
}

// Helper functions
function parseSimpleTerm(termString) {
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

// Export all template functions
module.exports = {
    getSectionPageTemplate,
    getLecturePageTemplate,
    formatDate
};