# MongoDB Setup Check Guide

## 📍 Where to Check MongoDB Setup

### 1. **Configuration Files**

**Location:** `server/config/database.js`
- This file contains the MongoDB connection code
- Default connection: `mongodb://localhost:27017/resona`
- Checks for `MONGODB_URI` environment variable

**Location:** `server/.env` (create if doesn't exist)
- Add your MongoDB connection string here:
  ```env
  MONGODB_URI=mongodb://localhost:27017/resona
  ```
  OR for MongoDB Atlas:
  ```env
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resona
  ```

### 2. **Check if MongoDB is Installed**

**On macOS:**
```bash
which mongod
# If installed, shows path like: /usr/local/bin/mongod
# If not installed, shows: mongod not found
```

**Check if MongoDB is running:**
```bash
pgrep -l mongod
# If running, shows process ID
# If not running, shows nothing
```

### 3. **Check Server Logs**

When you start the server (`cd server && npm start`), look for:
- ✅ `✓ MongoDB Connected: localhost` (success)
- ❌ `✗ MongoDB connection error: ...` (error)

### 4. **Test Connection**

**Option A: Test via Server**
1. Start server: `cd server && npm start`
2. Check console for MongoDB connection message
3. Test API: `curl http://localhost:5001/api/notebooks`

**Option B: Test MongoDB Directly**
```bash
# If MongoDB is installed locally
mongosh
# OR
mongo
# Then run: show dbs
```

## 🔧 Setup Options

### Option 1: Local MongoDB (Development)

**Install:**
- macOS: `brew install mongodb-community`
- Or download: https://www.mongodb.com/try/download/community

**Start:**
```bash
brew services start mongodb-community
# OR
mongod --config /usr/local/etc/mongod.conf
```

**Verify:**
- Check if running: `pgrep -l mongod`
- Test connection: `mongosh` or `mongo`

### Option 2: MongoDB Atlas (Cloud - Recommended)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (free tier available)
4. Get connection string
5. Add to `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resona
   ```

## ✅ Current Status Check

Run these commands to check your setup:

```bash
# 1. Check if MongoDB is installed
which mongod

# 2. Check if MongoDB is running
pgrep -l mongod

# 3. Check environment variable
cd server && cat .env | grep MONGODB || echo "No MONGODB_URI found"

# 4. Check server connection (start server first)
cd server && npm start
# Look for: "✓ MongoDB Connected" or "✗ MongoDB connection error"
```

## 📝 Quick Setup

**If MongoDB is NOT installed:**

1. **For Local Development:**
   ```bash
   brew install mongodb-community
   brew services start mongodb-community
   ```

2. **For Cloud (Easier):**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Copy connection string
   - Add to `server/.env`:
     ```env
     MONGODB_URI=your_connection_string_here
     ```

**Note:** The app will still work without MongoDB - notebooks will be created in Google Drive, but won't be saved to database for fetching later.

## 🔍 Troubleshooting

**If you see "MongoDB connection error":**
1. Check if MongoDB is running: `pgrep -l mongod`
2. Check connection string in `server/.env`
3. For Atlas: Check if IP is whitelisted
4. Check server logs for detailed error

**If MongoDB is not installed:**
- The app will still work (notebooks saved to Google Drive only)
- You just won't be able to fetch/list notebooks via API
- Install MongoDB or use Atlas to enable full functionality

