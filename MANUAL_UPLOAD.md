# Simplest Way to Upload to GitHub

## Method 1: GitHub Desktop (Easiest - No Commands!)

1. **Download GitHub Desktop**: https://desktop.github.com/
2. **Install and sign in** with your GitHub account
3. **Add the repository**:
   - Click "File" → "Add Local Repository"
   - Browse to: `/Users/utthamudatthu/Desktop/Resona`
   - Click "Add Repository"
4. **Commit and Push**:
   - You'll see all your files
   - Write a commit message: "Initial commit"
   - Click "Commit to main"
   - Click "Push origin" button at the top
   - Done! ✅

---

## Method 2: Upload via GitHub Website (Also Easy!)

1. Go to: https://github.com/Uttham123/Resona
2. Click "uploading an existing file" link (or just drag and drop)
3. **Drag your entire Resona folder** into the browser
4. Scroll down, write commit message: "Initial commit"
5. Click "Commit changes"
6. Done! ✅

**Note**: You might need to upload folder by folder (client/, server/, etc.) if drag-drop doesn't work.

---

## Method 3: Simple Command (If you have GitHub CLI)

If you install GitHub CLI, it's just:
```bash
gh auth login
gh repo create Uttham123/Resona --source=. --push
```

But Method 1 (GitHub Desktop) is the easiest! 🎯

