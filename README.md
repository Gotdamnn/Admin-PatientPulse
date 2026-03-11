# PatientPulse: Arduino-Based IoT Healthcare Monitoring System

## 🚀 **DEPLOYMENT: Ready for Microsoft Azure!**

Your project has been configured for **Microsoft Azure** deployment. 

**Quick Links:**
- 📖 [Azure Deployment Guide](./AZURE_DEPLOYMENT_GUIDE.md) - Complete step-by-step instructions
- ⚡ [Quick Start (5 minutes)](./AZURE_QUICK_START.md) - Fast deployment commands
- ✅ [Pre-Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Everything you need to verify

**Key Changes for Azure:**
- ✅ Environment variables configuration (`.env` file)
- ✅ `web.config` for IIS routing
- ✅ Updated `server.js` to use environment variables
- ✅ `.gitignore` to protect sensitive data
- ✅ `dotenv` package added for configuration management

**Next Steps:**
1. Copy `backend/.env.example` to `backend/.env` and fill in your values
2. Follow [AZURE_QUICK_START.md](./AZURE_QUICK_START.md) for deployment
3. Reference [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md) for detailed steps

---

## Project Description:

PatientPulse is a mobile and web-based IoT healthcare monitoring system designed to track and monitor vital signs such as body temperature and heart rate in real time. The system uses Arduino connected to health sensors to collect patient data and transmit it to a cloud-based backend. The data is then displayed on an Android mobile application and a web admin dashboard.

The main purpose of the application is to enable remote patient monitoring, improve early detection of abnormal health conditions, and provide healthcare providers with real-time access to patient data.

## Technologies Used:

Flask – for building the cross-platform mobile application

Dart – programming language for Flutter

Arduino (Uno / ESP32) – IoT hardware device

Sensors – LM35 / DS18B20 (Temperature), MAX30100 (Heart Rate)

PostgreSQL – relational database

Node.js + Express.js – backend API server

Cloud Computing Platform:

Microsoft Azure (Backend Hosting) with Azure Database for PostgreSQL

## Features:

PatientPulse is a mobile and web-based IoT healthcare monitoring system designed to track and monitor vital signs such as body temperature and heart rate in real time. The system uses Arduino connected to health sensors to collect patient data and transmit it to a cloud-based backend. The data is then displayed on an Android mobile application and a web admin dashboard.

The main purpose of the application is to enable remote patient monitoring, improve early detection of abnormal health conditions, and provide healthcare providers with real-time access to patient data.

Technologies Used:

Flutter – for building the cross-platform mobile application

Dart – programming language for Flutter

Arduino (Uno / ESP32) – IoT hardware device

Sensors – LM35 / DS18B20 (Temperature), MAX30100 (Heart Rate)

PostgreSQL – relational database

Node.js + Express.js – backend API server

Cloud Computing Platform:

Example: Render / Railway / AWS / Firebase Hosting
(Choose one depending on what you plan to use)

Example final format if using PostgreSQL + Render:

Cloud Platform: Render (Backend Hosting) with PostgreSQL Database

Features:
👤 User Features (Mobile App)

User registration and login authentication

Real-time temperature monitoring

Real-time heart rate monitoring

Live device connection status (Wi-Fi/Bluetooth)

Historical data visualization (charts & graphs)

Alerts and notifications for abnormal readings

🧑‍💼 Admin Features (Web Dashboard)

Admin login authentication

Manage patient accounts

Monitor connected Arduino devices

View system-wide alerts

View patient health trends

Mark alerts as resolved
