const fs = require('fs');

// Read the entire file
const content = fs.readFileSync('app.js', 'utf8');

// Find and replace the corrupted endpoint
// Look for the pattern: );\n            params  where \n is literal backslash-n
const lines = content.split('\n');
let result = [];
let inBadEndpoint = false;
let lineIndex = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is the start of the bad endpoint
    if (line.includes("app.get('/api/feedback-stats'")) {
        inBadEndpoint = true;
    }
    
    // If we're in the bad endpoint and find lines with literal \n, skip them and rebuild
    if (inBadEndpoint && line.includes('\\n')) {
        // Skip lines with literal escape sequences
        continue;
    }
    
    // Check if we're still in the bad endpoint
    if (inBadEndpoint && line.includes('});') && !line.includes("app.get")) {
        // End of endpoint - add it and mark as no longer in bad section
        result.push(line);
        inBadEndpoint = false;
        continue;
    }
    
    // Add normal lines
    if (!inBadEndpoint) {
        result.push(line);
    }
}

// Write the cleaned content
fs.writeFileSync('app.js', result.join('\n'), 'utf8');
console.log('File cleaned');
