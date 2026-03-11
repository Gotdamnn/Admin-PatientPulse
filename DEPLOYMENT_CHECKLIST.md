# Pre-Azure Deployment Checklist

## Security & Configuration
- [ ] **Environment Variables**: All sensitive data removed from source code
  - [ ] Database password not in server.js
  - [ ] API keys stored in .env only
  - [ ] .env file added to .gitignore
  
- [ ] **.env.example**: Created with template values
  - Location: `backend/.env.example`
  - Contains placeholders for all required variables
  
- [ ] **.gitignore**: Properly configured
  - [ ] Excludes .env files
  - [ ] Excludes node_modules
  - [ ] Excludes sensitive directories

## Code & Dependencies
- [ ] **package.json**: Updated with all required dependencies
  - [ ] dotenv added
  - [ ] Scripts configured for dev and prod
  - [ ] No unused dependencies
  
- [ ] **server.js**: Updated to use environment variables
  - [ ] `require('dotenv').config()` at the top
  - [ ] Database credentials from process.env
  - [ ] PORT from environment variable
  
- [ ] **Database connection**: Properly configured
  - [ ] SSL enabled for remote connections
  - [ ] Connection pooling configured
  - [ ] Connection timeouts set

## Azure Configuration
- [ ] **web.config**: IIS configuration for Azure App Service
  - Location: `backend/web.config`
  - Included in git repository
  
- [ ] **.deployment**: Deployment script configuration
  - Location: `backend/.deployment`
  - Runs npm install on deployment
  
- [ ] **Error Handling**: Production-ready error handling
  - [ ] Database connection errors handled
  - [ ] API error responses include meaningful messages
  - [ ] Logging configured

## Frontend Assets
- [ ] **Static files path**: Correct in server.js
  - [ ] Admin/css served correctly
  - [ ] Admin/js served correctly
  - [ ] Images folder accessible
  
- [ ] **EJS views**: EJS engine configured
  - [ ] routings/ directory properly referenced
  - [ ] View files have .ejs extension

## Database
- [ ] **database.sql**: Ready for Azure PostgreSQL
  - [ ] No local-specific database drivers
  - [ ] SQL syntax compatible with PostgreSQL 12+
  - [ ] Migration scripts prepared
  
- [ ] **init-db.js**: Tested and working
  - [ ] Can connect to remote databases
  - [ ] Runs without manual intervention

## Testing
- [ ] **Local Testing**: Verify locally first
  - [ ] Create local .env file with test database
  - [ ] Run `npm start` successfully
  - [ ] Access dashboard at http://localhost:3001/dashboard
  - [ ] Test API endpoints
  - [ ] Check static files load correctly
  
- [ ] **Dependencies Installed**: 
  - [ ] Run `npm install` in backend folder
  - [ ] No installation errors
  
- [ ] **Port Configuration**: 
  - [ ] Server listens on process.env.PORT
  - [ ] Defaults to 8080 for testing Azure locally

## Git & Version Control
- [ ] **Git History**: Clean and meaningful
  - [ ] Sensitive files never committed
  - [ ] .gitignore is comprehensive
  - [ ] No large files (>50MB) in history
  
- [ ] **Remote Repository**: Set up and ready
  - [ ] GitHub/GitLab/Bitbucket account ready
  - [ ] Repository is public or has proper access
  - [ ] Main/master branch is production-ready

## Documentation
- [ ] **README.md**: Updated with deployment info
  - [ ] Local setup instructions included
  - [ ] Azure deployment link provided
  - [ ] Troubleshooting section included
  
- [ ] **AZURE_DEPLOYMENT_GUIDE.md**: Complete and comprehensive
  - [ ] All steps documented
  - [ ] Screenshots or examples included
  - [ ] Troubleshooting section present
  
- [ ] **AZURE_QUICK_START.md**: Quick reference available
  - [ ] Command examples provided
  - [ ] Environment variables listed

## Pre-Deployment Verification (Day Before)

### 1. Code Review
```bash
# Check for hardcoded credentials
grep -r "password:" . --include="*.js" --include="*.json" --exclude-dir=node_modules
grep -r "DATABASE_URL" . --include="*.js" --include="*.json"
grep -r "localhost" . --include="*.js" --include="*.json"
```

### 2. Dependency Audit
```bash
# Check for vulnerabilities
npm audit
# Fix if needed
npm audit fix
```

### 3. Build Size Check
```bash
# Check total project size
du -sh .
# Check node_modules size (should not be committed)
du -sh node_modules/
```

### 4. Configuration Test
```bash
# Test with production environment
set NODE_ENV=production
npm start
# Should start without errors
```

## Azure Deployment Readiness: Final Sign-Off

- [ ] **Backup**: Local database backed up
- [ ] **DNS Records**: Prepared (if using custom domain)
- [ ] **HTTPS Certificate**: Understood (Azure provides free SSL)
- [ ] **Scaling Plan**: Capacity requirements documented
- [ ] **Monitoring Plan**: Alerts and logging configured
- [ ] **Disaster Recovery**: Backup and restore plan documented
- [ ] **Support Contact**: Team members trained and informed

## Post-Deployment (After Going Live)

- [ ] Monitor application logs for 24 hours
- [ ] Test critical user flows
- [ ] Verify database backups are working
- [ ] Set up monitoring alerts
- [ ] Document any issues encountered
- [ ] Plan regular maintenance windows

## Deployment Command Reference

```bash
# Deployment via Git
git push azure main

# View deployment logs
az webapp log tail --resource-group patientpulse-rg --name patientpulse-app

# Restart application
az webapp restart --resource-group patientpulse-rg --name patientpulse-app

# Stop application
az webapp stop --resource-group patientpulse-rg --name patientpulse-app

# Start application
az webapp start --resource-group patientpulse-rg --name patientpulse-app
```

## Emergency Contacts & Resources

- **Azure Support**: https://portal.azure.com/#blade/Microsoft_Azure_Support
- **Azure Status**: https://status.azure.com/
- **Node.js Documentation**: https://nodejs.org/en/docs/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Express.js Documentation**: https://expressjs.com/

---

## Summary

✅ **Your project is Azure-ready when all checkboxes above are checked!**

Total items: 50+
Estimated time to completion: 2-4 hours

**Start Date**: _______________
**Completion Date**: _______________
**Deployed Date**: _______________

Status: ⏳ In Progress
