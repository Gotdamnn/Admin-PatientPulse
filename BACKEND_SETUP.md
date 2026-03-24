# PatientPulse Backend Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Database Setup](#database-setup)
4. [Configuration](#configuration)
5. [Running the Backend](#running-the-backend)
6. [API Endpoints](#api-endpoints)
7. [Arduino Integration](#arduino-integration)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **PostgreSQL** v13+ ([Download](https://www.postgresql.org/download/))
- **Git** (optional)

### System Requirements
- Windows 10/11, macOS, or Linux
- 2GB RAM minimum
- 500MB disk space

## Installation

### 1. Clone/Download Backend Project
```bash
# If using git
git clone <repository-url> PatientPulse_Backend
cd PatientPulse_Backend

# Or manually download and extract the ZIP file
cd PatientPulse_Backend
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages:
- express (web framework)
- pg (PostgreSQL client)
- jsonwebtoken (JWT authentication)
- bcryptjs (password hashing)
- cors (cross-origin requests)
- dotenv (environment configuration)
- Morgan (HTTP request logger)

## Database Setup

### Step 1: Create Database and User

Open PostgreSQL (use pgAdmin or command line):

```sql
-- Create database
CREATE DATABASE patient_pulse_db;

-- Create user (recommended for security)
CREATE USER patientpulse_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE patient_pulse_db TO patientpulse_user;
```

### Step 2: Load Schema

```bash
# Connect to your database and run the schema
psql -U patientpulse_user -d patient_pulse_db -f database/schema.sql

# Or using pgAdmin:
# 1. Open pgAdmin
# 2. Right-click on your database > Query Tool
# 3. Open database/schema.sql and execute
```

### Step 3: Verify Tables

```sql
-- Connect to the database and check tables
\dt

-- Should show:
-- - users
-- - temperature_readings
-- - employees
-- - incident_reports
-- - feedback
-- - device_config
-- - alert_thresholds
-- - audit_logs
```

## Configuration

### 1. Create .env File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 2. Edit .env with Your Settings

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=patient_pulse_db
DB_USER=patientpulse_user
DB_PASSWORD=your_secure_password

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d

# CORS Configuration (Flutter and Admin URLs)
CORS_ORIGIN=http://localhost:8080,http://localhost:3001

# Arduino Serial Configuration
ARDUINO_PORT=/dev/ttyUSB0
ARDUINO_BAUD_RATE=9600

# Optional: Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# URLs
ADMIN_URL=http://localhost:3001
MOBILE_APP_URL=http://localhost:8080
```

**Windows Users:** Arduino port is usually `COM3` or `COM4`  
**Mac Users:** Arduino port is usually `/dev/tty.usbserial-*`  
**Linux Users:** Arduino port is usually `/dev/ttyUSB0`

## Running the Backend

### Development Mode (with auto-reload)

```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║     PatientPulse Backend Server        ║
╠════════════════════════════════════════╣
║ 🚀 Server running on port 5000         
║ 🌍 Environment: development
║ 📦 Database: patient_pulse_db
╚════════════════════════════════════════╝
```

### Production Mode

```bash
npm start
```

### Verify Server is Running

```bash
# In another terminal, test the health endpoint
curl http://localhost:5000/api/health

# Should return:
# {"status":"OK","timestamp":"2024-03-17T...","uptime":...}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify JWT token

### Temperature Readings
- `POST /api/readings` - Record new temperature
- `GET /api/readings` - Get user's readings (last 7 days)
- `GET /api/readings/latest` - Get latest reading
- `GET /api/readings/summary` - Get 7-day summary
- `GET /api/readings/:id` - Get specific reading

### User Profile
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get user's feedback

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get specific employee

### Health
- `GET /api/health` - Health check

## Arduino Integration

### Hardware Required
- Arduino Board (Uno, Nano, Mega, etc.)
- MLX90614 IR Temperature Sensor
- 128x32 OLED Display
- USB Cable for programming

### Arduino Libraries to Install (via Arduino IDE)

1. **Adafruit MLX90614** - IR Temperature Sensor
   - Sketch > Include Library > Manage Libraries
   - Search "MLX90614" and install Adafruit version

2. **Adafruit SSD1306** - OLED Display Driver
   - Search "SSD1306" and install Adafruit version

3. **Adafruit BusIO** - I2C/SPI communication
   - Install (dependency for other libraries)

### Wiring Diagram

```
MLX90614 Sensor:
- VCC → Arduino 5V
- GND → Arduino GND
- SDA → Arduino A4 (SDA)
- SCL → Arduino A5 (SCL)

OLED Display (128x32):
- VCC → Arduino 5V
- GND → Arduino GND
- SDA → Arduino A4 (SDA)
- SCL → Arduino A5 (SCL)
```

### Uploading Sketch

1. Connect Arduino to computer via USB
2. Open `arduino/PatientPulse_MLX90614.ino` in Arduino IDE
3. Select Tools > Board > Select Your Arduino Board
4. Select Tools > Port > COM3 (or appropriate port)
5. Click Upload button
6. Wait for "Upload complete"

### Testing Arduino

```bash
# Open Arduino IDE Serial Monitor (Ctrl+Shift+M)
# Baud rate should be 9600

# You should see:
# DEVICE_START
# DEVICE_ID:ARDUINO_001
# DEVICE_NAME:PatientPulse Thermometer
# READY
# TEMP_DATA:36.5,25.2,normal,body,1234567...
```

## Connecting Mobile App to Backend

### Update Flutter App Configuration

Edit `lib/config/app_constants.dart`:

```dart
class AppConstants {
  static const String apiBaseUrl = 'http://localhost:5000/api';
  // For Android emulator: http://10.0.2.2:5000/api
  // For physical device: http://<your-machine-ip>:5000/api
}
```

### Network Requests Example

```dart
import 'package:http/http.dart' as http;

// Register
Future<void> register(String email, String password, String fullName) async {
  final response = await http.post(
    Uri.parse('${AppConstants.apiBaseUrl}/auth/register'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'email': email,
      'password': password,
      'fullName': fullName,
    }),
  );
  
  if (response.statusCode == 201) {
    final data = jsonDecode(response.body);
    // Save token: data['token']
  }
}

// Get readings
Future<void> getReadings() async {
  final response = await http.get(
    Uri.parse('${AppConstants.apiBaseUrl}/readings'),
    headers: {
      'Authorization': 'Bearer $token',
    },
  );
  
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    // Use data['readings']
  }
}
```

## Web Admin Panel Setup

Create a separate Next.js project:

```bash
npx create-next-app@latest admin-panel
cd admin-panel

# Install additional dependencies
npm install axios chart.js react-chartjs-2 tailwindcss

# Update .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Issue: "Cannot connect to database"
```bash
# Check PostgreSQL is running
# Windows: Services > PostgreSQL
# Mac: brew services list
# Linux: sudo service postgresql status

# Verify credentials in .env file
# Test connection with psql
psql -h localhost -U patientpulse_user -d patient_pulse_db
```

### Issue: "Port 5000 already in use"
```bash
# Change PORT in .env to another number (e.g., 5001)
# Or kill the process using port 5000

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

### Issue: "Arduino not found"
- Check USB cable connection
- Install Arduino CH340 drivers (for clone boards)
- Verify ARDUINO_PORT in .env
- Check Arduino IDE recognizes the board

### Issue: "MLX90614 not responding"
- Check I2C address (default 0x5A)
- Verify 4.7kΩ pull-up resistors on SDA/SCL
- Test with Arduino IDE I2C scanner

## Next Steps

1. **Create Admin Dashboard** (Next.js)
2. **Update Flutter App** with API integration
3. **Set up Arduino communication** handler
4. **Configure real-time notifications** (WebSockets)
5. **Deploy to cloud** (AWS, Heroku, DigitalOcean)

## Support

For issues or questions:
- Check the logs in terminal
- Review PostgreSQL logs
- Verify all environment variables
- Check network connectivity
