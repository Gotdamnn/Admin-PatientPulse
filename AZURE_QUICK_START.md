# PatientPulse - Quick Start Guide for Azure Deployment

## 🚀 5-Minute Quick Start

### Prerequisites
- Azure account (free tier available)
- Azure CLI installed
- Git installed

### Quick Commands

#### 1. Create Azure Resources (10 minutes)
```bash
# Set variables
$resourceGroup = "patientpulse-rg"
$location = "eastus"
$dbName = "patientpulse-db"
$appName = "patientpulse-app"
$dbPassword = "YourSecurePassword123!"

# Create resource group
az group create --name $resourceGroup --location $location

# Create PostgreSQL Database
az postgres server create `
  --resource-group $resourceGroup `
  --name $dbName `
  --location $location `
  --admin-user adminuser `
  --admin-password $dbPassword `
  --sku-name B_Gen5_1

# Create App Service Plan
az appservice plan create `
  --name patientpulse-plan `
  --resource-group $resourceGroup `
  --sku B1 `
  --is-linux

# Create App Service
az webapp create `
  --resource-group $resourceGroup `
  --plan patientpulse-plan `
  --name $appName `
  --runtime "NODE|18-lts"
```

#### 2. Configure Environment Variables
```bash
az webapp config appsettings set `
  --resource-group patientpulse-rg `
  --name patientpulse-app `
  --settings `
  NODE_ENV=production `
  PORT=8080 `
  DB_HOST=patientpulse-db.postgres.database.azure.com `
  DB_USER=adminuser@patientpulse-db `
  DB_PASSWORD=YourSecurePassword123! `
  DB_NAME=appdevdb `
  DB_PORT=5432 `
  DB_SSL=true
```

#### 3. Deploy Application
```bash
# Using Git
git remote add azure https://<username>@patientpulse-app.scm.azurewebsites.net:443/patientpulse-app.git
git push azure main

# Or using ZIP deployment
Compress-Archive -Path . -DestinationPath deploy.zip
az webapp deployment source config-zip -g patientpulse-rg -n patientpulse-app --src deploy.zip
```

#### 4. Initialize Database
```bash
# Connect to database and run schema
psql -h patientpulse-db.postgres.database.azure.com `
     -U adminuser@patientpulse-db `
     -d appdevdb `
     -f backend/database.sql
```

## Access Your App
- **Application URL**: https://patientpulse-app.azurewebsites.net
- **Admin Dashboard**: https://patientpulse-app.azurewebsites.net/dashboard
- **Default Admin**: admin@patientpulse.com / (see database.sql)

## Key Files for Azure

| File | Purpose |
|------|---------|
| `web.config` | IIS routing configuration |
| `.deployment` | Deployment configuration |
| `backend/.env.example` | Environment variables template |
| `.gitignore` | Protects secrets from git |
| `package.json` | Node.js dependencies and scripts |

## Environment Variables

### Required
- `DB_HOST` - PostgreSQL server hostname
- `DB_USER` - Database username  
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DB_PORT` - Database port (5432)

### Optional
- `NODE_ENV` - Set to 'production'
- `PORT` - Set to 8080 for Azure
- `DB_SSL` - Set to 'true' for Azure PostgreSQL
- `LOG_LEVEL` - Logging level (info, debug)

## Verify Deployment

```bash
# Check app status
az webapp show --resource-group patientpulse-rg --name patientpulse-app

# View logs in real-time
az webapp log tail --resource-group patientpulse-rg --name patientpulse-app

# Test API endpoint
curl https://patientpulse-app.azurewebsites.net/api/status
```

## Common Issues & Fixes

### ❌ "Database connection failed"
- Verify DB_HOST, DB_USER, DB_PASSWORD are correct
- Check database firewall allows Azure App Service
- Ensure database has been initialized with schema

### ❌ "Cannot find module 'dotenv'"
```bash
# SSH into App Service and reinstall
npm install
```

### ❌ "Port already in use"
- Azure requires PORT=8080
- Verify PORT is set in Application settings

### ❌ "Cannot read static files"
- Ensure web.config is in backend folder
- Check Admin/css and Admin/js folders exist

## Next Steps

1. **Enable HTTPS**: Azure provides free SSL certificates
2. **Setup Custom Domain**: Map your domain to the app
3. **Configure Monitoring**: Set up Application Insights
4. **Enable Auto-Scaling**: Scale based on demand
5. **Setup DevOps Pipeline**: Automate deployments with GitHub Actions

## Support

- Full guide: [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md)
- Azure Docs: https://docs.microsoft.com/azure/
- Node.js on Azure: https://docs.microsoft.com/azure/nodejs/

## Cost Savings Tips

💰 **To minimize costs:**
- Use "Free Tier" for initial testing
- Start with Basic B1 App Service plan (~$12/month)
- Use Basic Gen5 PostgreSQL (~$35/month)
- Total estimated cost: **~$50/month**

---

**You're ready to go live! 🎉**

Quick check: Do you have all required values?
- [] Azure account
- [] DB password ready
- [] Project in Git repository
- [] .env file created with DB credentials
