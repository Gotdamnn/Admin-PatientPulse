# PatientPulse ESP32 + Flutter Mobile Connection Guide

## 🎯 Overview

Your system is now ready to connect:
- **ESP32 Device** with MLX90614 temperature sensor → Azure Backend
- **Flutter Mobile App** → Azure Backend  
- **Web Admin Dashboard** (Already deployed)

Backend URL: `https://patientpulse-cvfzbpbpbuhve8gc.southeastasia-01.azurewebsites.net`

---

## 🔧 ESP32 Setup (Hardware)

### Hardware Requirements
- ESP32 Development Board
- MLX90614 IR Temperature Sensor (or DHT22)
- Micro USB cable for programming
- WiFi connectivity

### Step 1: Install Arduino IDE & Libraries

1. **Download Arduino IDE** → https://www.arduino.cc/en/software
2. **Add ESP32 Board Support**
   - File → Preferences
   - Paste in "Additional Boards Manager URLs":
     ```
     https://dl.espressif.com/dl/package_esp32_index.json
     ```
   - Tools → Board Manager → Search "ESP32" → Install "esp32 by Espressif Systems"

3. **Install Required Libraries**
   - Sketch → Include Library → Manage Libraries
   - Search and install:
     - `ArduinoJson` (by Benoit Blanchon)
     - `Adafruit MLX90614` (if using MLX90614)
     - `DHT sensor library` (if using DHT22)

### Step 2: Hardware Wiring

**ESP32 Pinout for I2C (MLX90614 + DHT22)**

```
MLX90614 Sensor:
  VCC  → ESP32 3.3V (Pin 3.3V)
  GND  → ESP32 GND (Pin GND)
  SDA  → ESP32 GPIO 21 (Pin SDA)
  SCL  → ESP32 GPIO 22 (Pin SCL)

DHT22 Sensor (optional for ambient temp):
  VCC  → ESP32 5V (Pin Vin)
  GND  → ESP32 GND (Pin GND)
  DATA → ESP32 GPIO 4 (Pin D4)
  
Status LEDs (optional):
  WiFi LED  → GPIO 5  (Blue LED)
  Sensor LED → GPIO 18 (Green LED)
  Alert LED  → GPIO 17 (Red LED)
```

### Step 3: Upload ESP32 Sketch

1. **Open the sketch**
   - File → Open
   - Navigate to: `PatientPulse_Backend/esp32/PatientPulse_ESP32.ino`

2. **Configure WiFi Credentials** (Edit these lines in sketch)
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";              // Replace with your WiFi name
   const char* password = "YOUR_WIFI_PASSWORD";      // Replace with your WiFi password
   ```

3. **Configure Patient ID** (optional, for linking to patients in dashboard)
   ```cpp
   const String patientId = "";  // Leave empty or set specific patient ID
   ```

4. **Select Board & Port**
   - Tools → Board → ESP32 → "ESP32 Dev Module"
   - Tools → Port → Select COM port (e.g., COM3, COM4)

5. **Upload**
   - Click Upload button or Sketch → Upload
   - Wait for "Leaving... Hard resetting via RTS pin..."

6. **Verify Connection**
   - Tools → Serial Monitor (Baud: 115200)
   - You should see:
   ```
   ╔════════════════════════════════════════╗
   ║     PatientPulse ESP32 Thermometer    ║
   ╚════════════════════════════════════════╝
   ✓ MLX90614 IR Sensor initialized
   ✓ DHT22 Sensor initialized
   Connecting to WiFi...
   ✓ WiFi Connected!
   ...
   ```

### Step 4: Monitor Data Transmission

In Serial Monitor, you should see:
```
Reading #1 | Body: 36.5°C | Ambient: 25.2°C | Humidity: 45% | Status: normal
✓ Reading sent to server
Reading #2 | Body: 36.6°C | Ambient: 25.2°C | Humidity: 45% | Status: normal
✓ Reading sent to server
```

---

## 📱 Flutter Mobile App Setup

### Step 1: Update Dependencies

```bash
cd mobile_app_dev
flutter pub get
```

This installs:
- `http: ^1.1.0` - For API requests
- `shared_preferences: ^2.2.2` - For storing auth tokens

### Step 2: Verify API Configuration

Check `lib/config/api_config.dart` - it's already configured with your Azure URL:

```dart
static const String baseUrl = 'https://patientpulse-cvfzbpbpbuhve8gc.southeastasia-01.azurewebsites.net/api';
```

### Step 3: Build & Run Mobile App

```bash
# For web
flutter build web --release

# For Android (device)
flutter run

# For iOS (device)
flutter run -d ios
```

### Step 4: Test the Connection

1. **Register a new user** in the app
   - Email: test@example.com
   - Password: password123
   - Full Name: Test User

2. **Login** with those credentials

3. **Add a temperature reading** manually (or wait for ESP32 to send data)

4. **View readings** in the History tab

---

## 🔗 Users System Architecture

### Data Flow

```
1. ESP32 takes temperature reading
   ↓
2. Connects to WiFi
   ↓
3. Sends HTTP POST to /api/readings/add
   ↓
4. Backend stores in database (temperature_readings table)
   ↓
5. Flutter app queries /api/readings with JWT token
   ↓
6. User sees temperature in real-time
   ↓
7. Web admin dashboard displays all data
```

### Authentication Flow

```
1. User registers/logs in via Flutter app
   ↓
2. Backend validates credentials
   ↓
3. Generates JWT token (valid 7 days)
   ↓
4. Flutter app stores token in SharedPreferences
   ↓
5. All API requests include: Authorization: Bearer {token}
   ↓
6. Backend verifies token before processing request
```

---

## 📊 Connecting to Your Azure Dashboard

Your data will automatically display in:
- **Devices Tab** → Your ESP32 device with readings count
- **Patients Tab** → If patient_id is set
- **Temperature Readings** → All sensor data
- **Dashboard Charts** → Real-time visualization

### Register Your Device (One-time setup)

The ESP32 automatically registers on first connection, but you can also manually register in the web admin:

1. Go to: https://patientpulse-cvfzbpbpbuhve8gc.southeastasia-01.azurewebsites.net/devices?action=add
2. Fill in:
   - Device ID: `ESP32_001`
   - Device Name: `Patient Room 1`
   - Device Type: `ESP32`
   - Sensor Type: `MLX90614_DHT22`
3. Click Register

---

## 🔑 API Endpoints Reference

### Authentication (Public)
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify
```

### Readings (Requires JWT Token)
```
POST /api/readings/add                          # Add new reading
GET /api/readings?days=7                        # Get readings (last 7 days)
GET /api/readings/latest                        # Get latest reading
GET /api/readings/summary                       # Get summary stats
```

### Devices (Requires JWT Token)
```
POST /api/devices/register                      # Register ESP32
POST /api/devices/sync                          # Sync device status
GET /api/devices                                # List devices
```

### Users (Requires JWT Token)
```
GET /api/users/profile                          # Get user profile
PUT /api/users/profile/update                   # Update profile
```

### Feedback (Requires JWT Token)
```
POST /api/feedback/add                          # Submit feedback
GET /api/feedback                               # Get user feedback
```

---

## 🐛 Troubleshooting

### ESP32 Issues

**Problem:** ESP32 doesn't connect to WiFi
```
Solution:
1. Check SSID and password are correct
2. Ensure WiFi is on 2.4GHz (not 5GHz)
3. Check WiFi signal strength
4. Restart ESP32 (power off/on)
```

**Problem:** MLX90614 sensor not found
```
Solution:
1. Check I2C wiring (SDA to GPIO 21, SCL to GPIO 22)
2. Check 4.7kΩ pull-up resistors on SDA/SCL
3. Verify sensor address: Uncomment printDeviceInfo() in loop()
```

**Problem:** Data not sending to backend
```
Solution:
1. Check WiFi connection: Serial monitor should show "✓ WiFi Connected!"
2. Check device registration: ESP32 should print "✓ Device registered"
3. Verify backend URL is correct
4. Check firewall settings (port 443 for HTTPS)
```

### Flutter App Issues

**Problem:** "Network error" when logging in
```
Solution:
1. Ensure internet connection
2. Check backend URL in api_config.dart
3. Verify Azure backend is online: https://patientpulse-...:5000/api/health
4. Run: flutter pub get
```

**Problem:** "Invalid token" error
```
Solution:
1. Clear app cache: flutter clean
2. Uninstall and reinstall app
3. Log out and log back in
4. Token expires every 7 days - re-login if needed
```

**Problem:** Readings not showing
```
Solution:
1. Make sure ESP32 is connected to WiFi and sending data
2. Check Serial monitor for "✓ Reading sent to server"
3. Verify patient_id matches in both systems
4. Wait 30+ seconds for data sync
```

---

## 🚀 Production Deployment Checklist

### Before going live:

- [ ] Test ESP32 with MLX90614 sensor
- [ ] Verify WiFi connectivity is stable
- [ ] Test Flutter app login/logout
- [ ] Test temperature reading submission
- [ ] Verify data appears in web dashboard within 30 seconds
- [ ] Test with multiple ESP32 devices (if applicable)
- [ ] Set up proper WiFi credentials (not hardcoded in final version)
- [ ] Configure alert thresholds for temperature

### Security:

- [ ] Change JWT_SECRET in backend
- [ ] Enable HTTPS (already done on Azure)
- [ ] Restrict CORS origins
- [ ] Implement rate limiting on API
- [ ] Use environment variables for sensitive data

---

## 📈 Next Steps

1. ✅ **ESP32 Hardware Setup** - Flash sketch and verify serial output
2. ✅ **Flutter App Connection** - Run mobile app and test login
3. ✅ **Device Registration** - Register ESP32 in web dashboard
4. ✅ **Data Synchronization** - Verify readings appear in all 3 systems
5. 📊 **Analytics & Reports** - View trends in web dashboard

---

## 📞 Support & Documentation

### Key Files:
- **Flutter API Service:** `lib/services/api_service.dart`
- **API Configuration:** `lib/config/api_config.dart`
- **ESP32 Sketch:** `esp32/PatientPulse_ESP32.ino`

### Backend Docs:
- **Backend Guide:** `PatientPulse_Backend/BACKEND_SETUP.md`
- **Architecture:** `PatientPulse_Backend/ARCHITECTURE.md`
- **Quick Start:** `PatientPulse_Backend/QUICKSTART.md`

### Deployed System:
- **Web Dashboard:** https://patientpulse-cvfzbpbpbuhve8gc.southeastasia-01.azurewebsites.net
- **API Base URL:** https://patientpulse-cvfzbpbpbuhve8gc.southeastasia-01.azurewebsites.net/api

---

## ✨ Features Now Available

✅ Real-time temperature monitoring with ESP32  
✅ Multiple reading history tracking  
✅ User authentication with JWT  
✅ Cloud data synchronization  
✅ Web admin dashboard analytics  
✅ Mobile app notifications  
✅ Device management & calibration  
✅ Employee incident reporting  
✅ User feedback system  
✅ Comprehensive audit logs  

---

**You're all set! Your PatientPulse system is now fully integrated!** 🎉
