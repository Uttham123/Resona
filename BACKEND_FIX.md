# Backend Health Check Fix

## The Problem
Backend is failing health checks - Railway can't reach `/api/health` endpoint.

## Possible Causes:
1. Backend not starting properly
2. Wrong PORT configuration
3. Dependencies not installing
4. Start command issue

## Fix Steps:

### Step 1: Check Backend Settings in Railway

1. **Go to `resona-backend` service**
2. **Click "Settings" tab**
3. **Go to "Build" section** (right sidebar)
4. **Check "Custom Build Command":**
   Should be: `cd server && npm install`
   OR just: `npm install` (if Root Directory is set to `server`)

5. **Go to "Deploy" section**
6. **Check "Custom Start Command":**
   Should be: `cd server && npm start`
   OR just: `npm start` (if Root Directory is set to `server`)

### Step 2: Set Root Directory (if available)

If you see "Root Directory" option:
- Set it to: `server`

### Step 3: Check Environment Variables

1. **Go to "Variables" tab**
2. **Make sure these are set:**
   - `NODE_ENV` = `production`
   - `PORT` = (leave empty - Railway auto-assigns)
   - `FRONTEND_URL` = `https://your-frontend-url.railway.app` (set after frontend works)

### Step 4: Check Build Logs

1. **Go to "Deployments" tab**
2. **Click on the failed deployment**
3. **Check "Build Logs"** - look for errors
4. **Common issues:**
   - Missing dependencies
   - Build errors
   - Port conflicts

### Step 5: Check Deploy Logs

1. **In the same deployment, check "Deploy Logs"**
2. **Look for:**
   - "Server is running on port XXXX"
   - Any error messages
   - Startup failures

---

## Quick Fix Commands:

If Root Directory is NOT set:
- **Build Command:** `cd server && npm install`
- **Start Command:** `cd server && npm start`

If Root Directory IS set to `server`:
- **Build Command:** `npm install`
- **Start Command:** `npm start`

---

## Common Issues:

1. **"Cannot find module"** → Dependencies not installed
   - Fix: Make sure build command runs `npm install`

2. **"Port already in use"** → Port conflict
   - Fix: Remove PORT from environment variables (let Railway assign)

3. **"EADDRINUSE"** → Port issue
   - Fix: Same as above

4. **Health check fails** → Server not starting
   - Check deploy logs to see why server isn't starting

