const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'appdevdb',
    password: 'Carlzabala@123',
    port: 5432,
});

async function addESP32Devices() {
    try {
        console.log('🔧 Adding ESP32 devices to database...\n');

        const esp32Devices = [
            { name: 'ESP32 Patient Monitor 1', device_id: 'ESP32-001', board_type: 'ESP32', location: 'Ward A - Bed 1', status: 'online', signal_strength: 95 },
            { name: 'ESP32 Patient Monitor 2', device_id: 'ESP32-002', board_type: 'ESP32', location: 'Ward A - Bed 2', status: 'online', signal_strength: 88 },
            { name: 'ESP32 Temperature Sensor', device_id: 'ESP32-003', board_type: 'ESP32', location: 'ICU - Main Entrance', status: 'online', signal_strength: 92 },
            { name: 'ESP32 Humidity Monitor', device_id: 'ESP32-004', board_type: 'ESP32', location: 'Operating Room', status: 'offline', signal_strength: 0 },
            { name: 'ESP32 WiFi Gateway', device_id: 'ESP32-GW-001', board_type: 'ESP32', location: 'Server Room', status: 'online', signal_strength: 100 }
        ];

        for (const device of esp32Devices) {
            try {
                const result = await pool.query(
                    'INSERT INTO devices (name, device_id, board_type, location, status, signal_strength) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (device_id) DO NOTHING RETURNING *',
                    [device.name, device.device_id, device.board_type, device.location, device.status, device.signal_strength]
                );

                if (result.rows.length > 0) {
                    console.log(`✅ Added: ${device.name} (${device.device_id})`);
                } else {
                    console.log(`⚠️  ${device.name} already exists (${device.device_id})`);
                }
            } catch (err) {
                console.error(`❌ Error adding ${device.name}:`, err.message);
            }
        }

        console.log('\n✅ ESP32 devices setup complete!');
        
        // Verify
        const result = await pool.query('SELECT COUNT(*) FROM devices WHERE board_type = $1', ['ESP32']);
        console.log(`📊 Total ESP32 devices: ${result.rows[0].count}`);

        await pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addESP32Devices();
