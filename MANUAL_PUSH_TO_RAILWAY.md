# Manual Guide: Push Changes to Railway

## Step-by-Step Instructions

### Step 1: Check Current Status
```bash
cd /Users/utthamudatthu/Desktop/Resona
git status
```

### Step 2: Add All Changes
```bash
# Add all modified files
git add .

# Or add specific files:
git add client/src/components/HomePage.js
git add client/src/components/HomePage.css
git add client/src/components/CaptureNotes.js
git add client/src/components/CaptureNotes.css
git add client/src/components/ExistingResearch.js
git add client/src/components/ExistingResearch.css
```

### Step 3: Commit Changes
```bash
git commit -m "Update icons and fix display issues"
```

### Step 4: Push to GitHub
```bash
git push origin main
```

**If you get authentication error:**
- You'll need to authenticate with GitHub
- Options:
  1. Use GitHub CLI: `gh auth login`
  2. Use Personal Access Token
  3. Use SSH instead of HTTPS

### Step 5: Trigger Railway Deployment

**Option A: Automatic (if connected to GitHub)**
- Railway should automatically detect the push
- Go to Railway dashboard and check if deployment started
- Wait 2-5 minutes for deployment

**Option B: Manual Trigger**
1. Go to: https://railway.app
2. Select your project
3. Go to "Deployments" tab
4. Click "Redeploy" or "Deploy" button
5. Wait for deployment to complete

**Option C: Force Redeploy via Railway CLI**
```bash
# Install Railway CLI (if not installed)
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up
```

## Quick Commands (Copy & Paste)

```bash
# Navigate to project
cd /Users/utthamudatthu/Desktop/Resona

# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Update icons for production"

# Push to GitHub
git push origin main

# Then go to Railway dashboard and trigger redeploy
```

## Troubleshooting

### If "git push" asks for credentials:
1. **Use Personal Access Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` scope
   - Use token as password when pushing

2. **Switch to SSH:**
   ```bash
   git remote set-url origin git@github.com:Uttham123/Resona.git
   git push origin main
   ```

### If Railway doesn't auto-deploy:
1. Check Railway dashboard → Settings → Source
2. Make sure GitHub repo is connected
3. Check "Auto Deploy" is enabled
4. Manually trigger redeploy from Deployments tab

### If icons still don't update:
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check Railway build logs for errors
3. Verify files are in the commit: `git show HEAD --name-only`

## Verify Deployment

1. Check Railway dashboard → Deployments
2. Look for latest deployment (should show your commit message)
3. Wait for "Deploy Successful" status
4. Visit your Railway URL
5. Hard refresh browser (Ctrl+Shift+R)

