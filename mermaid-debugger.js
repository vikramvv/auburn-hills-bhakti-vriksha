// mermaid-debugger.js
// Run this to see what's wrong with your mermaid charts

const fs = require('fs');
const path = require('path');

function debugMermaidChart(jsonFile) {
    try {
        const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        
        if (!data.mermaid_chart) {
            console.log('❌ No mermaid_chart field found');
            return;
        }
        
        const chart = data.mermaid_chart;
        
        console.log('\n📊 MERMAID CHART DEBUG');
        console.log('='.repeat(80));
        console.log(`File: ${jsonFile}`);
        console.log(`Length: ${chart.length} characters`);
        console.log(`Type: ${typeof chart}`);
        console.log('\n📝 First 200 characters:');
        console.log(chart.substring(0, 200));
        console.log('\n📝 Full content:');
        console.log('---START---');
        console.log(chart);
        console.log('---END---');
        
        // Check for common issues
        console.log('\n🔍 DIAGNOSTICS:');
        
        const issues = [];
        
        // Check for literal \n
        if (chart.includes('\\n')) {
            issues.push('⚠️  Contains literal \\n characters (should be actual newlines)');
        }
        
        // Check if it starts with 'graph'
        if (!chart.trim().startsWith('graph')) {
            issues.push('⚠️  Does not start with "graph" keyword');
        }
        
        // Check for balanced brackets
        const openBrackets = (chart.match(/\[/g) || []).length;
        const closeBrackets = (chart.match(/\]/g) || []).length;
        if (openBrackets !== closeBrackets) {
            issues.push(`⚠️  Unbalanced brackets: ${openBrackets} open, ${closeBrackets} close`);
        }
        
        // Check for balanced braces
        const openBraces = (chart.match(/\{/g) || []).length;
        const closeBraces = (chart.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
            issues.push(`⚠️  Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
        }
        
        // Check for balanced parentheses
        const openParens = (chart.match(/\(/g) || []).length;
        const closeParens = (chart.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            issues.push(`⚠️  Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
        }
        
        if (issues.length === 0) {
            console.log('✅ No obvious syntax issues detected');
        } else {
            issues.forEach(issue => console.log(issue));
        }
        
        // Output cleaned version
        console.log('\n🔧 CLEANED VERSION (copy this):');
        console.log('---START---');
        const cleaned = chart
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
        console.log(cleaned);
        console.log('---END---');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Usage
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log('Usage: node mermaid-debugger.js <path-to-json-file>');
    console.log('Example: node mermaid-debugger.js data/bg-lectures/bg-6-5.json');
} else {
    debugMermaidChart(args[0]);
}