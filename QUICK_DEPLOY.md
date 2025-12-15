# Quick Deployment Guide - Railway (5 minutes)

## Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Step 2: Deploy Backend
1. Go to https://railway.app
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Click on the service → Settings
6. Set **Root Directory** to `server`
7. Add environment variables:
   - `PORT` = `5001`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = (you'll add this after frontend deploys)
8. Copy the backend URL (e.g., `https://resona-backend.railway.app`)

## Step 3: Deploy Frontend
1. In the same Railway project, click "+ New" → "GitHub Repo"
2. Select the same repository
3. Settings:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build -l 3000`
4. Add environment variable:
   - `REACT_APP_API_URL` = `https://your-backend-url.railway.app/api`
5. Copy the frontend URL

## Step 4: Update Backend CORS
1. Go back to backend service
2. Add environment variable:
   - `FRONTEND_URL` = `https://your-frontend-url.railway.app`

## Step 5: Testgi
- Visit your frontend URL
- Try creating a research notebook
- Check that API calls work

## Done! 🎉

Your app is now live and accessible to everyone!

---

## Alternative: One-Click Deploy with Render

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Blueprint"
4. Connect your GitHub repo
5. Render will auto-detect the structure
6. Update environment variables as needed
7. Deploy!

---

## Troubleshooting

**CORS Errors?**
- Make sure `FRONTEND_URL` in backend matches your frontend URL exactly

**Build Fails?**
- Check Node version (should be 18+)
- Make sure all dependencies are in package.json

**API Not Working?**
- Verify `REACT_APP_API_URL` is set correctly
- Check backend logs in Railway dashboard

