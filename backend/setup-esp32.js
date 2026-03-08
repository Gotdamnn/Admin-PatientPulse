const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

const esp32Devices = [
    {
        name: 'ESP32 Patient Monitor 1',
        device_id: 'ESP32-001',
        board_type: 'ESP32',
        location: 'Ward A - Bed 1',
        status: 'online',
        signal_strength: 95
    },
    {
        name: 'ESP32 Patient Monitor 2',
        device_id: 'ESP32-002',
        board_type: 'ESP32',
        location: 'Ward A - Bed 2',
        status: 'online',
        signal_strength: 88
    },
    {
        name: 'ESP32 Temperature Sensor',
        device_id: 'ESP32-003',
        board_type: 'ESP32',
        location: 'ICU - Main Entrance',
        status: 'online',
        signal_strength: 92
    },
    {
        name: 'ESP32 Humidity Monitor',
        device_id: 'ESP32-004',
        board_type: 'ESP32',
        location: 'Operating Room',
        status: 'offline',
        signal_strength: 0
    },
    {
        name: 'ESP32 WiFi Gateway',
        device_id: 'ESP32-GW-001',
        board_type: 'ESP32',
        location: 'Server Room',
        status: 'online',
        signal_strength: 100
    }
];

async function addESP32Devices() {
    console.log('🔧 Adding ESP32 devices to database...\n');

    for (const device of esp32Devices) {
        try {
            const response = await fetch(`${API_BASE}/devices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(device)
            });

            if (!response.ok) {
                const error = await response.json();
                console.log(`⚠️  ${device.name}: ${error.error}`);
                continue;
            }

            const result = await response.json();
            console.log(`✅ Added: ${device.name} (${device.device_id})`);
        } catch (err) {
            console.error(`❌ Error adding ${device.name}:`, err.message);
        }
    }

    console.log('\n✅ ESP32 devices setup complete!');
}

// Wait a moment for server to be ready, then add devices
setTimeout(addESP32Devices, 2000);
