// fix-mermaid-syntax.js
const fs = require('fs');
const path = require('path');

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

function fixMermaidSyntax(mermaidChart) {
    if (!mermaidChart) return mermaidChart;
    
    // Fix: Replace (text with colon) with [text with colon]
    // This regex finds patterns like (Text: More text) and replaces with [Text: More text]
    let fixed = mermaidChart.replace(/\(([^)]*:[^)]*)\)/g, '[$1]');
    
    return fixed;
}

function fixJsonFile(filePath) {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (!data.mermaid_chart) {
            return { fixed: false, reason: 'No mermaid_chart' };
        }
        
        const original = data.mermaid_chart;
        const fixed = fixMermaidSyntax(original);
        
        if (original === fixed) {
            return { fixed: false, reason: 'No changes needed' };
        }
        
        // Update the mermaid chart
        data.mermaid_chart = fixed;
        
        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        
        return { fixed: true, changes: 'Fixed parentheses with colons' };
        
    } catch (error) {
        return { fixed: false, reason: error.message };
    }
}

function fixAllFiles() {
    console.log('🔧 Fixing Mermaid Syntax in JSON Files...\n');
    
    let totalFixed = 0;
    let totalChecked = 0;
    
    for (const section of SECTIONS) {
        const sectionPath = path.join('data', section);
        
        if (!fs.existsSync(sectionPath)) continue;
        
        const files = fs.readdirSync(sectionPath)
            .filter(f => f.endsWith('.json'));
        
        console.log(`📂 ${section}: ${files.length} files`);
        
        for (const file of files) {
            const filePath = path.join(sectionPath, file);
            totalChecked++;
            
            const result = fixJsonFile(filePath);
            
            if (result.fixed) {
                console.log(`  ✅ Fixed: ${file}`);
                console.log(`     ${result.changes}`);
                totalFixed++;
            }
        }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Files checked: ${totalChecked}`);
    console.log(`   Files fixed: ${totalFixed}`);
    console.log(`   No changes: ${totalChecked - totalFixed}`);
    
    if (totalFixed > 0) {
        console.log('\n✨ Run "node build.js" to regenerate HTML files');
    }
}

// Run
fixAllFiles();