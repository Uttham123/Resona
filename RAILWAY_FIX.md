# Fix Railway Deployment

## The Problem
Railway is trying to run `npm run build` but can't find the build script because it's running from the wrong directory.

## The Solution

### For Frontend Service (resona-frontend):

1. **Go to Railway Dashboard**
   - Click on `resona-frontend` service

2. **Go to Settings Tab**

3. **Set Root Directory:**
   - Find "Root Directory" setting
   - Set it to: `client`
   - Save

4. **Set Build Command:**
   - Find "Build Command" 
   - Set it to: `npm install && npm run build`
   - Save

5. **Set Start Command:**
   - Find "Start Command"
   - Set it to: `npx serve -s build -l $PORT`
   - Save

6. **Redeploy:**
   - Go to "Deployments" tab
   - Click "Redeploy" or wait for auto-deploy

---

### For Backend Service (resona-backend):

1. **Go to Railway Dashboard**
   - Click on `resona-backend` service

2. **Go to Settings Tab**

3. **Set Root Directory:**
   - Find "Root Directory" setting
   - Set it to: `server`
   - Save

4. **Set Start Command:**
   - Find "Start Command"
   - Should be: `npm start`
   - Save

5. **Add Environment Variables:**
   - Go to "Variables" tab
   - Add:
     - `NODE_ENV` = `production`
     - `PORT` = (leave empty, Railway will auto-assign)
     - `FRONTEND_URL` = `https://your-frontend-url.railway.app` (add after frontend deploys)

---

## Quick Fix Steps:

1. **Frontend Settings:**
   ```
   Root Directory: client
   Build Command: npm install && npm run build
   Start Command: npx serve -s build -l $PORT
   ```

2. **Backend Settings:**
   ```
   Root Directory: server
   Start Command: npm start
   ```

3. **After fixing, Railway will auto-redeploy!**

---

## Alternative: Use nixpacks.toml

If the above doesn't work, I can create a `nixpacks.toml` file in each directory for Railway to detect automatically.

