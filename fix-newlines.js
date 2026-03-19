const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace literal \n escape sequences with actual newlines in the problematic section
// This regex finds the pattern with literal \n and converts it to real newlines
content = content.replace(/`\);\\\n\s*params\.push/g, '`);\n            params.push');
content = content.replace(/`\);\\\n\s*paramIndex\+\+;\\\n\s*}\\\n/g, '`);\n            paramIndex++;\n        }\n\n');

// Also handle the query lines with literal \n
content = content.replace(/params\);\\\n\s*const/g, 'params);\n        const');

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed literal \\n escape sequences in app.js');
