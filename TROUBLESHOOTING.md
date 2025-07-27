# 🔧 Troubleshooting Guide

## Problem: "Cannot GET /api/health"

This error means the backend server isn't running. Follow these steps:

### Step 1: Check if MongoDB is Running

\`\`\`bash
# Check MongoDB connection
npm run check-mongodb

# Or manually check
node scripts/check-mongodb.js
\`\`\`

### Step 2: Start MongoDB Service

**Windows:**
\`\`\`cmd
net start MongoDB
\`\`\`

**macOS:**
\`\`\`bash
brew services start mongodb-community
\`\`\`

**Linux:**
\`\`\`bash
sudo systemctl start mongod
sudo systemctl enable mongod
\`\`\`

### Step 3: Test Simple Server

\`\`\`bash
# Start test server first
npm run test-server
\`\`\`

Then visit:
- http://localhost:5000 (should show "API is running")
- http://localhost:5000/api/health (health check)
- http://localhost:5000/api/test-db (database test)

### Step 4: Setup Database (if needed)

\`\`\`bash
# Setup database schema
npm run setup-db

# Add sample data
npm run seed-db
\`\`\`

### Step 5: Start Full Server

\`\`\`bash
# Start the full server
npm run dev-server
\`\`\`

## Common Issues & Solutions

### 1. MongoDB Not Installed
**Error:** `ECONNREFUSED`
**Solution:** Install MongoDB Community Edition from https://www.mongodb.com/try/download/community

### 2. Port Already in Use
**Error:** `EADDRINUSE`
**Solution:**
\`\`\`bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>
\`\`\`

### 3. Permission Denied
**Error:** `EACCES`
**Solution:**
\`\`\`bash
sudo chown -R $USER:$USER ~/.npm
\`\`\`

### 4. Module Not Found
**Error:** `Cannot find module`
**Solution:**
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

### 5. Database Connection Timeout
**Error:** `MongoServerSelectionError`
**Solution:**
- Check if MongoDB service is running
- Verify connection string in .env.local
- Check firewall settings

## Quick Diagnostic Commands

\`\`\`bash
# Check if MongoDB is running
ps aux | grep mongod

# Check port usage
netstat -tulpn | grep :27017
netstat -tulpn | grep :5000

# Test MongoDB connection
mongo --eval "db.adminCommand('ismaster')"

# Check Node.js version
node --version
npm --version
\`\`\`

## Environment Variables Check

Make sure your `.env.local` file contains:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/etrucktransport
JWT_SECRET=your-secure-secret-key
PORT=5000
NODE_ENV=development
\`\`\`

## Step-by-Step Recovery

1. **Stop all processes:**
   \`\`\`bash
   pkill -f node
   \`\`\`

2. **Start MongoDB:**
   \`\`\`bash
   # Your OS-specific command from above
   \`\`\`

3. **Verify MongoDB:**
   \`\`\`bash
   npm run check-mongodb
   \`\`\`

4. **Setup database:**
   \`\`\`bash
   npm run setup-db
   \`\`\`

5. **Test server:**
   \`\`\`bash
   npm run test-server
   \`\`\`

6. **Start full server:**
   \`\`\`bash
   npm run dev-server
   \`\`\`

## Success Indicators

✅ MongoDB running: `npm run check-mongodb` shows "MongoDB connection successful!"
✅ Database setup: Collections listed (users, drivers, trucks, etc.)
✅ Server running: http://localhost:5000/api/health returns JSON
✅ Frontend running: http://localhost:3000 loads the homepage

## Need Help?

If you're still having issues:
1. Check the exact error message
2. Verify your operating system
3. Ensure all prerequisites are installed
4. Try the test server first before the full server
