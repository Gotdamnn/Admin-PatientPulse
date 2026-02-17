// Setup script for patient_vitals table
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'appdevdb',
    password: 'Carlzabala@123',
    port: 5432,
});

async function setupVitalsTable() {
    const client = await pool.connect();
    
    try {
        console.log('🔧 Setting up patient_vitals table...\n');
        
        // Create patient_vitals table
        await client.query(`
            CREATE TABLE IF NOT EXISTS patient_vitals (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
                device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
                
                -- Vital Signs
                heart_rate INTEGER,                    -- Normal: 60-100 bpm
                blood_pressure_systolic INTEGER,       -- Normal: 90-120 mmHg
                blood_pressure_diastolic INTEGER,      -- Normal: 60-80 mmHg
                body_temperature DECIMAL(4, 1),        -- Normal: 36.1-37.2 °C
                oxygen_saturation INTEGER,             -- Normal: 95-100 %
                respiratory_rate INTEGER,              -- Normal: 12-20 breaths/min
                
                -- Additional data
                notes TEXT,
                recorded_by VARCHAR(100),
                
                -- Timestamps
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created patient_vitals table');
        
        // Create index for faster lookups
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_vitals_patient_id ON patient_vitals(patient_id);
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_vitals_recorded_at ON patient_vitals(recorded_at);
        `);
        console.log('✅ Created indexes');
        
        // Insert sample vital readings
        await client.query(`
            INSERT INTO patient_vitals (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, body_temperature, oxygen_saturation, respiratory_rate, recorded_by)
            SELECT 
                p.id,
                60 + floor(random() * 40)::int,  -- Heart rate 60-100
                100 + floor(random() * 20)::int, -- Systolic 100-120
                65 + floor(random() * 15)::int,  -- Diastolic 65-80
                36.5 + (random() * 0.7)::decimal(3,1), -- Temp 36.5-37.2
                96 + floor(random() * 4)::int,   -- O2 96-100
                14 + floor(random() * 6)::int,   -- Resp rate 14-20
                'System'
            FROM patients p
            LIMIT 5
        `);
        console.log('✅ Inserted sample vital readings');
        
        console.log('\n🎉 Patient vitals table setup complete!');
        console.log('\n📊 Vital Sign Normal Ranges:');
        console.log('   Heart Rate: 60-100 bpm');
        console.log('   Blood Pressure: 90-120 / 60-80 mmHg');
        console.log('   Body Temperature: 36.1-37.2 °C');
        console.log('   Oxygen Saturation: 95-100 %');
        console.log('   Respiratory Rate: 12-20 breaths/min');
        
    } catch (err) {
        console.error('❌ Error setting up table:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

setupVitalsTable();
