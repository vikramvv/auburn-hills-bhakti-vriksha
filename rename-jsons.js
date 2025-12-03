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

const DRY_RUN = process.argv.includes('--dry-run'); // Test mode, no actual renaming

console.log('🔄 JSON Filename Standardizer\n');
if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No files will be renamed\n');
}

let totalRenamed = 0;
let totalSkipped = 0;
let totalErrors = 0;

// Main function
async function renameAllJsons() {
    for (const section of SECTIONS) {
        const sectionPath = path.join('data', section);
        
        if (!fs.existsSync(sectionPath)) {
            console.log(`⏭️  Skipping ${section} (folder not found)`);
            continue;
        }
        
        console.log(`\n📂 Processing: ${section}`);
        console.log('─'.repeat(60));
        
        const files = fs.readdirSync(sectionPath)
            .filter(f => f.endsWith('.json'));
        
        if (files.length === 0) {
            console.log('   No JSON files found');
            continue;
        }
        
        for (const file of files) {
            await processFile(sectionPath, file);
        }
    }
    
    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Renamed: ${totalRenamed}`);
    console.log(`   ⏭️  Skipped: ${totalSkipped}`);
    console.log(`   ❌ Errors: ${totalErrors}`);
    
    if (DRY_RUN) {
        console.log('\n💡 Run without --dry-run to actually rename files');
    }
}

// Process individual file
async function processFile(sectionPath, filename) {
    try {
        const filePath = path.join(sectionPath, filename);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Generate proper filename
        const newFilename = generateFilename(data);
        
        // Check if already correct
        if (filename === newFilename) {
            console.log(`   ✓ ${filename} (already correct)`);
            totalSkipped++;
            return;
        }
        
        // Check if target already exists
        const newFilePath = path.join(sectionPath, newFilename);
        if (fs.existsSync(newFilePath)) {
            console.log(`   ⚠️  ${filename} → ${newFilename} (target exists, skipping)`);
            totalSkipped++;
            return;
        }
        
        // Rename file
        if (DRY_RUN) {
            console.log(`   🔄 ${filename}\n      → ${newFilename}`);
        } else {
            fs.renameSync(filePath, newFilePath);
            console.log(`   ✅ ${filename}\n      → ${newFilename}`);
        }
        
        totalRenamed++;
        
    } catch (error) {
        console.log(`   ❌ ${filename}: ${error.message}`);
        totalErrors++;
    }
}

// Generate standardized filename from JSON content
function generateFilename(json) {
    // Get date
    let date = json.date || 
               (json.stream_metadata?.published_date || '').split('T')[0];
    
    if (!date) {
        date = 'undated';
    }
    
    // Get verse identifier
    let identifier = '';
    
    if (json.primary_verse) {
        // "BG 9.34" → "bg-9-34"
        // "SB 1.2.6" → "sb-1-2-6"
        // "CC Adi 1.1" → "cc-adi-1-1"
        identifier = json.primary_verse
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/\./g, '-');
    } else if (json.title) {
        // Use title as fallback
        identifier = json.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')  // Remove leading/trailing dashes
            .substring(0, 50);  // Limit length
    } else if (json.id) {
        // Use existing ID
        identifier = json.id.replace(/[^a-z0-9-]/g, '-');
    } else {
        // Last resort: use stream video ID
        identifier = json.stream_metadata?.video_id || 'unknown';
    }
    
    return `${date}-${identifier}.json`;
}

// Utility: Show what would be renamed without actually doing it
function showPreview() {
    console.log('📋 Preview of changes:\n');
    
    for (const section of SECTIONS) {
        const sectionPath = path.join('data', section);
        
        if (!fs.existsSync(sectionPath)) continue;
        
        const files = fs.readdirSync(sectionPath)
            .filter(f => f.endsWith('.json'));
        
        if (files.length === 0) continue;
        
        console.log(`\n${section}:`);
        
        for (const file of files) {
            try {
                const filePath = path.join(sectionPath, file);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const newFilename = generateFilename(data);
                
                if (file !== newFilename) {
                    console.log(`  ${file}`);
                    console.log(`  → ${newFilename}\n`);
                }
            } catch (error) {
                // Skip invalid files
            }
        }
    }
}

// Run with different modes
if (process.argv.includes('--preview')) {
    showPreview();
} else {
    renameAllJsons().catch(console.error);
}

// Export for use in other scripts
module.exports = { generateFilename };