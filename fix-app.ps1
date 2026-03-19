$content = [System.IO.File]::ReadAllText('app.js', [System.Text.Encoding]::UTF8)

# Replace literal \n sequences with real newlines
# The file contains backslash-n as two characters, we need to convert to actual newlines
$content = $content -replace '\);\n\s+params\.push', ");" + [System.Environment]::NewLine + "            params.push"
$content = $content -replace '\);\n\s+paramIndex', ");" + [System.Environment]::NewLine + "            paramIndex"
$content = $content -replace '\};\n\n\s+if', "};" + [System.Environment]::NewLine + [System.Environment]::NewLine + "        if"
$content = $content -replace 'params\);\n\s+const', "params);" + [System.Environment]::NewLine + "        const"

[System.IO.File]::WriteAllText('app.js', $content, [System.Text.Encoding]::UTF8)
Write-Host "✅ Fixed app.js"
