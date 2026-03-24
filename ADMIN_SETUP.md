# PatientPulse Admin Dashboard Setup

## Create Next.js Project

```bash
# Create new Next.js project
npx create-next-app@latest patient-pulse-admin --typescript --tailwind

# Navigate to project
cd patient-pulse-admin

# Install additional dependencies
npm install axios chart.js react-chartjs-2 @heroicons/react
```

## Project Structure

```
patient-pulse-admin/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Dashboard home
│   ├── dashboard/          # Dashboard pages
│   │   ├── readings/       # Temperature readings view
│   │   ├── employees/      # Employee management
│   │   ├── feedback/       # User feedback
│   │   └── reports/        # Incident reports
│   ├── api/                # API routes (for backend communication)
│   └── components/         # Reusable components
├── lib/
│   ├── api.ts             # API client configuration
│   └── types.ts           # TypeScript types
├── public/                 # Static assets
├── .env.local             # Environment variables
└── package.json
```

## Environment Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ADMIN_NAME=PatientPulse Admin
```

## Key Admin Features

### 1. Dashboard Overview
- Total users
- Today's readings
- Alerts/Warnings
- System status

### 2. Temperature Readings
- View all user readings
- Filter by date/status
- export as CSV/PDF
- Real-time chart updates

### 3. User Management
- List all users
- View user profiles
- Edit user information
- View user history

### 4. Employee Management
- Employee directory
- Department filtering
- Incident history per employee
- Contact information

### 5. Feedback & Reports
- User feedback submissions
- Incident reports
- Analytics dashboard
- Response management

### 6. Device Management
- Registered Arduino devices
- Sensor calibration
- Device health status
- Connection logs

## Sample API Client (lib/api.ts)

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

## Running Admin Dashboard

```bash
npm run dev

# Access at http://localhost:3001
```

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```
