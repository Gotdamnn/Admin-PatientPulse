import sys

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace literal \n (backslash followed by 'n') with actual newlines
content = content.replace('`);\\n            params', '`);\n            params')
content = content.replace('`);\\n            paramIndex', '`);\n            paramIndex')
content = content.replace('};\\n\\n        if', '};\n\n        if')
content = content.replace('params);\\n        const', 'params);\n        const')
content = content.replace('`);\\n        const', '`);\n        const')

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ Fixed literal newline sequences')
