# Deployment Guide for Resona

## Option 1: Railway (Recommended - Easiest)

### Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)

### Steps:

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy Backend to Railway**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will detect it's a Node.js app
   - Set Root Directory to `server`
   - Add environment variables:
     - `PORT` = `5001` (or let Railway auto-assign)
     - `NODE_ENV` = `production`
     - Add any other env vars you need

3. **Deploy Frontend to Railway**
   - Add another service in the same project
   - Select your repo again
   - Set Root Directory to `client`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s build -l 3000`
   - Add environment variable:
     - `REACT_APP_API_URL` = `https://your-backend-url.railway.app/api`

4. **Update CORS in backend**
   - Make sure your backend allows requests from your frontend URL

---

## Option 2: Render

### Backend Setup:
1. Go to https://render.com
2. Create new "Web Service"
3. Connect GitHub repo
4. Settings:
   - **Name**: `resona-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Port**: `5001`
5. Add environment variables in Render dashboard

### Frontend Setup:
1. Create new "Static Site"
2. Connect GitHub repo
3. Settings:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. Add environment variable:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`

---

## Option 3: Vercel (Frontend) + Railway/Render (Backend)

### Frontend on Vercel:
1. Go to https://vercel.com
2. Import your GitHub repo
3. Settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Create React App`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add environment variable:
   - `REACT_APP_API_URL` = `https://your-backend-url/api`

### Backend on Railway/Render:
- Follow steps from Option 1 or 2 for backend

---

## Important Configuration Steps

### 1. Update CORS in Backend
Edit `server/index.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### 2. Environment Variables Needed

**Backend (.env):**
```
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

**Frontend (.env):**
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

### 3. Update API URLs
Make sure `client/src/components/CaptureNotes.js` uses:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
```

### 4. Google Drive API
- Make sure your Google OAuth credentials allow your production domain
- Update authorized redirect URIs in Google Cloud Console

---

## Quick Start: Railway (Recommended)

1. **Install Railway CLI** (optional but helpful):
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Deploy Backend**:
   ```bash
   cd server
   railway init
   railway up
   ```

3. **Deploy Frontend**:
   ```bash
   cd client
   railway init
   railway up
   ```

4. **Set Environment Variables**:
   ```bash
   railway variables set PORT=5001
   railway variables set NODE_ENV=production
   ```

---

## Cost Comparison

| Platform | Free Tier | Paid Starts At |
|----------|-----------|----------------|
| Railway  | $5/month credit | $5/month |
| Render   | Free (with limits) | $7/month |
| Vercel   | Free (generous) | $20/month |
| DigitalOcean | $4/month | $4/month |

**Recommendation**: Start with Railway or Render for easiest full-stack deployment.

---

## Troubleshooting

### CORS Issues
- Make sure backend CORS allows your frontend URL
- Check environment variables are set correctly

### Build Failures
- Ensure all dependencies are in `package.json`
- Check Node version compatibility (use Node 18+)

### File Upload Issues
- Railway/Render have file size limits
- Consider using cloud storage (AWS S3, Cloudinary) for production

### Google Drive API
- Update OAuth consent screen with production URLs
- Add authorized domains in Google Cloud Console

