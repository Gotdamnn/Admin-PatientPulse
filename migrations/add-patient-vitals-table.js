import 'dotenv/config.js';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'appdevdb',
  password: process.env.DB_PASSWORD || 'Carlzabala@123',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function createPatientVitalsTable() {
  const client = await pool.connect();
  try {
    console.log('Creating patient_vitals table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS patient_vitals (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
        body_temperature DECIMAL(5, 2) NOT NULL,
        location VARCHAR(255),
        device_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT check_patient_temperature CHECK (body_temperature >= 30 AND body_temperature <= 45)
      );
    `);
    
    console.log('✅ patient_vitals table created');
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_patient_vitals_patient_id ON patient_vitals(patient_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_patient_vitals_created_at ON patient_vitals(created_at DESC);
    `);
    
    console.log('✅ Indexes created');
  } catch (err) {
    console.error('❌ Error creating patient_vitals table:', err.message);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

createPatientVitalsTable();
