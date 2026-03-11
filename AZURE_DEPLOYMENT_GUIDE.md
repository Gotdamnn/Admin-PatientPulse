# PatientPulse - Microsoft Azure Deployment Guide

## Overview
This guide walks you through deploying the PatientPulse healthcare monitoring system on Microsoft Azure using App Service and Azure Database for PostgreSQL.

## Prerequisites
- Microsoft Azure Account ([Create Free Account](https://azure.microsoft.com/en-us/free))
- Azure CLI installed ([Download](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
- Git installed on your machine
- Node.js 18.x or higher
- Your project already prepared with the latest configuration

## Architecture
```
[Frontend - Static Files] → [Azure App Service (Node.js)] → [Azure Database for PostgreSQL] → [Blob Storage (optional)]
```

## Step 1: Set Up Azure Resources

### 1.1 Create a Resource Group
```bash
az group create --name patientpulse-rg --location eastus
```

### 1.2 Create Azure Database for PostgreSQL
```bash
az postgres server create \
  --resource-group patientpulse-rg \
  --name patientpulse-db \
  --location eastus \
  --admin-user adminuser \
  --admin-password YourSecurePassword123! \
  --sku-name B_Gen5_1 \
  --storage-size 51200 \
  --backup-retention 7 \
  --geo-redundant-backup Disabled \
  --auto-grow Enabled \
  --version 12
```

### 1.3 Configure Database Firewall
```bash
# Allow Azure resources to access database
az postgres server firewall-rule create \
  --resource-group patientpulse-rg \
  --server-name patientpulse-db \
  --name azure-internal \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# (Recommended) Add your IP address for local testing
az postgres server firewall-rule create \
  --resource-group patientpulse-rg \
  --server-name patientpulse-db \
  --name my-ip \
  --start-ip-address YOUR_IP_ADDRESS \
  --end-ip-address YOUR_IP_ADDRESS
```

### 1.4 Create Azure App Service Plan
```bash
az appservice plan create \
  --name patientpulse-plan \
  --resource-group patientpulse-rg \
  --sku B1 \
  --is-linux
```

### 1.5 Create Azure App Service (Node.js)
```bash
az webapp create \
  --resource-group patientpulse-rg \
  --plan patientpulse-plan \
  --name patientpulse-app \
  --runtime "NODE|18-lts"
```

## Step 2: Configure Environment Variables

### 2.1 Set Application Settings in Azure
```bash
az webapp config appsettings set \
  --resource-group patientpulse-rg \
  --name patientpulse-app \
  --settings \
  NODE_ENV=production \
  PORT=8080 \
  DB_HOST=patientpulse-db.postgres.database.azure.com \
  DB_USER=adminuser@patientpulse-db \
  DB_PASSWORD=YourSecurePassword123! \
  DB_NAME=appdevdb \
  DB_PORT=5432 \
  DB_SSL=true \
  LOG_LEVEL=info
```

## Step 3: Deploy Your Application

### Option A: Deploy via Git (Recommended)

#### 3.1 Configure Git Remote
```bash
az webapp deployment user set \
  --user-name your-deployment-username \
  --password your-deployment-password

# Get deployment credentials
az webapp deployment source config-local-git \
  --resource-group patientpulse-rg \
  --name patientpulse-app
```

#### 3.2 Add Azure Git Remote
```bash
# Navigate to your project directory
cd h:\App dev

# Add Azure as remote
git remote add azure https://your-deployment-username@patientpulse-app.scm.azurewebsites.net:443/patientpulse-app.git
```

#### 3.3 Deploy
```bash
git push azure main
# or
git push azure master
```

### Option B: Deploy Using GitHub Actions

#### 3.1 Create GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit - Azure deployment ready"
git push -u origin main
```

#### 3.2 Create `.github/workflows/deploy.yml`
```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm install
      
      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: patientpulse-app
          publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
          package: ./backend
```

## Step 4: Initialize Database

### 4.1 Connect to PostgreSQL
```bash
# Install psql client if not already installed
# Windows: Download from https://www.postgresql.org/download/windows/

psql -h patientpulse-db.postgres.database.azure.com \
     -U adminuser@patientpulse-db \
     -d postgres \
     --password
```

### 4.2 Create Application Database
```sql
CREATE DATABASE appdevdb;
```

### 4.3 Run Database Schema
```bash
# Option 1: Run the SQL schema file
psql -h patientpulse-db.postgres.database.azure.com \
     -U adminuser@patientpulse-db \
     -d appdevdb \
     -f backend/database.sql \
     --password

# Option 2: Use the init-db.js script
node backend/init-db.js
```

## Step 5: Monitoring and Logs

### 5.1 View Real-time Logs
```bash
az webapp log tail \
  --resource-group patientpulse-rg \
  --name patientpulse-app
```

### 5.2 Stream Logs
```bash
az webapp log stream \
  --resource-group patientpulse-rg \
  --name patientpulse-app
```

### 5.3 Enable Application Logging
```bash
az webapp log config \
  --resource-group patientpulse-rg \
  --name patientpulse-app \
  --application-logging true \
  --level verbose \
  --detailed-error-messages true
```

## Step 6: Custom Domain (Optional)

### 6.1 Map Custom Domain
```bash
az webapp config hostname add \
  --resource-group patientpulse-rg \
  --webapp-name patientpulse-app \
  --hostname yourdomain.com
```

### 6.2 Create DNS CNAME Record
In your DNS provider:
```
CNAME record:
Name: @ (or www)
Value: patientpulse-app.azurewebsites.net
```

### 6.3 Add SSL Certificate
```bash
# Using free certificates (if available)
az webapp config ssl bind \
  --resource-group patientpulse-rg \
  --name patientpulse-app \
  --certificate-thumbprint YOUR_CERT_THUMBPRINT \
  --ssl-type SNI
```

## Step 7: Scaling and Performance

### 7.1 Scale Up (Increase Resources)
```bash
az appservice plan update \
  --name patientpulse-plan \
  --resource-group patientpulse-rg \
  --sku S1
```

### 7.2 Enable Auto-Scale
```bash
az monitor autoscale create \
  --resource-group patientpulse-rg \
  --resource-name-type appserviceplans \
  --resource-name patientpulse-plan \
  --min-count 1 \
  --max-count 3 \
  --count 2
```

## Step 8: Backup and Recovery

### 8.1 Create App Backup
```bash
az webapp deployment slot create \
  --resource-group patientpulse-rg \
  --name patientpulse-app \
  --slot staging
```

### 8.2 Database Backups
- Azure Database for PostgreSQL automatically backs up data every 7 days
- Backups are stored in geo-redundant storage for disaster recovery
- Retention period: 35 days (default)

## Step 9: Troubleshooting

### Common Issues

#### Application won't start
```bash
# Check startup logs
az webapp log tail \
  --resource-group patientpulse-rg \
  --name patientpulse-app

# Verify environment variables
az webapp config appsettings list \
  --resource-group patientpulse-rg \
  --name patientpulse-app
```

#### Database Connection Failed
- Verify database server is running: `az postgres server show`
- Check firewall rules allowing App Service to connect
- Test connection string locally before deploying
- Ensure `.env` file is properly configured

#### Port Issues
- Azure App Service uses port 8080 by default
- Set `PORT=8080` in application settings
- The web.config file handles routing on IIS

## Accessing Your Application

After deployment, your application will be available at:
```
https://patientpulse-app.azurewebsites.net
```

Admin Dashboard:
```
https://patientpulse-app.azurewebsites.net/dashboard
```

## Cost Estimation (Monthly)

| Service | SKU | Estimated Cost |
|---------|-----|------------------|
| App Service Plan | Basic (B1) | ~$12 |
| PostgreSQL Database | Basic, Gen5, 1 vCore | ~$35 |
| Storage (if used) | Standard | ~$2 |
| **Total** | | **~$50/month** |

*Costs may vary by region and actual usage*

## Security Best Practices

1. ✅ Use Azure Key Vault for secrets
2. ✅ Enable Managed Identity for app-to-database communication
3. ✅ Use SSL/TLS for all connections (already configured)
4. ✅ Implement network security groups
5. ✅ Enable Azure Web Application Firewall (WAF)
6. ✅ Regular backup and disaster recovery testing
7. ✅ Monitor suspicious activities with Azure Security Center

## Maintenance

### Regular Tasks
- Update Node.js runtime version monthly
- Review and rotate database credentials quarterly
- Check Azure recommendations for optimization
- Monitor application performance metrics
- Keep dependencies updated: `npm audit fix`

### Database Maintenance
```bash
# Optimize databases
vacuum analyze appdevdb;

# Check table sizes
select
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
from pg_tables
order by pg_total_relation_size(schemaname||'.'||tablename) desc;
```

## Next Steps

1. ✅ Complete all deployment steps above
2. ✅ Test the application thoroughly
3. ✅ Set up monitoring and alerting
4. ✅ Configure backup and disaster recovery plan
5. ✅ Document your deployment architecture
6. ✅ Plan for scaling and performance optimization

## Support and Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Database for PostgreSQL](https://docs.microsoft.com/en-us/azure/postgresql/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js on Azure](https://docs.microsoft.com/en-us/azure/developer/nodejs/)

## Deployment Checklist

- [ ] Resource Group created
- [ ] PostgreSQL Database configured
- [ ] App Service Plan created
- [ ] App Service deployed
- [ ] Environment variables set
- [ ] Database initialized with schema
- [ ] Application tested in Azure
- [ ] Domain name configured (if applicable)
- [ ] SSL certificate installed
- [ ] Monitoring enabled
- [ ] Backup configured
- [ ] Team trained on deployment process
