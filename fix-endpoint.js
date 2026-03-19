const fs = require('fs');

const content = fs.readFileSync('app.js', 'utf8');

// Find the boundaries of the broken endpoint
const startIdx = content.indexOf("// Get feedback statistics");
const endIdx = content.indexOf("// ===== DEBUG/TEST ENDPOINTS");

if (startIdx < 0 || endIdx < 0) {
    console.log('Could not find endpoint markers');
    process.exit(1);
}

const before = content.substring(0, startIdx);
const after = content.substring(endIdx);

const cleanEndpoint = `// Get feedback statistics with optional filtering
app.get('/api/feedback-stats', async (req, res) => {
    try {
        const { search, status, type, rating } = req.query;
        
        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        // Apply filters
        if (search) {
            whereClause += \` AND (subject ILIKE \${paramIndex} OR message ILIKE \${paramIndex} OR user_email ILIKE \${paramIndex})\`;
            params.push(\`%\${search}%\`);
            paramIndex++;
        }

        if (status) {
            whereClause += \` AND status = \${paramIndex}\`;
            params.push(status);
            paramIndex++;
        }

        if (type) {
            whereClause += \` AND feedback_type = \${paramIndex}\`;
            params.push(type);
            paramIndex++;
        }

        if (rating) {
            whereClause += \` AND app_rating = \${paramIndex}\`;
            params.push(parseInt(rating));
            paramIndex++;
        }

        // Build queries with filters
        const totalResult = await pool.query(\`SELECT COUNT(*) as count FROM feedback \${whereClause}\`, params);
        const openResult = await pool.query(\`SELECT COUNT(*) as count FROM feedback \${whereClause} AND status = 'Open'\`, params);
        const resolvedResult = await pool.query(\`SELECT COUNT(*) as count FROM feedback \${whereClause} AND status = 'Resolved'\`, params);
        const ratingResult = await pool.query(\`SELECT AVG(app_rating) as avg_rating FROM feedback \${whereClause} AND app_rating IS NOT NULL\`, params);

        const stats = {
            total: parseInt(totalResult.rows[0].count) || 0,
            open: parseInt(openResult.rows[0].count) || 0,
            resolved: parseInt(resolvedResult.rows[0].count) || 0,
            avgRating: parseFloat(ratingResult.rows[0].avg_rating) || 0
        };

        console.log('📊 Feedback stats:', stats);

        res.json({ success: true, stats });
    } catch (err) {
        console.error('❌ Error fetching feedback statistics:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

`;

const newContent = before + cleanEndpoint + after;
fs.writeFileSync('app.js', newContent, 'utf8');

console.log('✅ Endpoint fixed successfully');
