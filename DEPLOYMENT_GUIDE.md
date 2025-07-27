# E-Truck Transport System - Deployment Guide

## 🚀 Complete Setup & Deployment Instructions

### 1. Prerequisites
- Node.js (v16 or higher)
- MongoDB installed locally OR MongoDB Atlas account
- Git

### 2. Local Development Setup

#### Step 1: Install Dependencies
\`\`\`bash
npm install
\`\`\`

#### Step 2: Setup Environment Variables
Create `.env.local` file in root directory:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/etrucktransport
JWT_SECRET=your-super-secure-jwt-secret-key
PORT=5000
NODE_ENV=development
\`\`\`

#### Step 3: Setup MongoDB Database
\`\`\`bash
# Start MongoDB service (if installed locally)
mongod

# Setup database schema and collections
npm run setup-db

# Add sample data for testing
npm run seed-db
\`\`\`

#### Step 4: Start Development Servers
\`\`\`bash
# Terminal 1: Start Next.js frontend
npm run dev

# Terminal 2: Start Express backend
npm run dev-server
\`\`\`

### 3. Production Deployment Options

#### Option A: Deploy to Vercel + MongoDB Atlas

1. **Setup MongoDB Atlas:**
   - Go to https://cloud.mongodb.com
   - Create free cluster
   - Get connection string
   - Update MONGODB_URI in environment variables

2. **Deploy Frontend to Vercel:**
   \`\`\`bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   \`\`\`

3. **Deploy Backend to Railway/Render:**
   - Push code to GitHub
   - Connect Railway/Render to your repo
   - Set environment variables
   - Deploy

#### Option B: Deploy to VPS/Cloud Server

1. **Server Setup:**
   \`\`\`bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   
   # Start MongoDB
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # Install PM2 for process management
   sudo npm install -g pm2
   \`\`\`

2. **Deploy Application:**
   \`\`\`bash
   # Clone repository
   git clone <your-repo-url>
   cd e-truck-transport-system
   
   # Install dependencies
   npm install
   
   # Setup database
   npm run setup-db
   npm run seed-db
   
   # Build Next.js app
   npm run build
   
   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   \`\`\`

3. **Setup Nginx (Optional):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   \`\`\`

### 4. Environment Variables for Production

\`\`\`env
# Production Environment Variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/etrucktransport
JWT_SECRET=your-super-secure-production-jwt-secret
PORT=5000
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-api-domain.com
\`\`\`

### 5. Database Backup & Maintenance

\`\`\`bash
# Backup database
mongodump --uri="mongodb://localhost:27017/etrucktransport" --out=./backup

# Restore database
mongorestore --uri="mongodb://localhost:27017/etrucktransport" ./backup/etrucktransport

# Monitor database
mongo
use etrucktransport
db.stats()
\`\`\`

### 6. Testing the Deployment

1. **Health Check:**
   \`\`\`bash
   curl http://your-domain.com/api/health
   \`\`\`

2. **Test Login:**
   \`\`\`bash
   curl -X POST http://your-domain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john.driver@example.com","password":"driver123"}'
   \`\`\`

### 7. Monitoring & Logs

\`\`\`bash
# View PM2 logs
pm2 logs

# Monitor processes
pm2 monit

# Restart application
pm2 restart all
\`\`\`

### 8. Security Checklist

- [ ] Change default JWT secret
- [ ] Enable MongoDB authentication
- [ ] Setup SSL/HTTPS
- [ ] Configure firewall
- [ ] Regular security updates
- [ ] Database backups
- [ ] Rate limiting
- [ ] Input validation

### 9. Troubleshooting

**Common Issues:**

1. **MongoDB Connection Failed:**
   - Check MongoDB service status
   - Verify connection string
   - Check network connectivity

2. **Port Already in Use:**
   \`\`\`bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   \`\`\`

3. **Permission Denied:**
   \`\`\`bash
   sudo chown -R $USER:$USER /path/to/project
   \`\`\`

### 10. Sample Login Credentials

After running the seed script:
- **Driver:** john.driver@example.com / driver123
- **Border Agent:** sarah.agent@border.gov.zm / agent123
- **Admin:** michael.admin@transport.gov.zm / admin123
