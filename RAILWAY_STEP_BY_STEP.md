# Railway Settings - Step by Step

## Finding Root Directory Setting

### Step 1: Go to Build Section
1. In the **Settings** page (where you are now)
2. Look at the **right sidebar** - you'll see:
   - Source (you're here)
   - Networking
   - **Build** ← Click this!
   - Deploy
   - Config-as-code
   - Danger

### Step 2: Click "Build" in the Right Sidebar
- This will show the Build settings

### Step 3: Find Root Directory
- Scroll down in the Build section
- You'll see "Root Directory" option
- Set it to: `client`

### Step 4: Set Build Command
- In the same Build section
- Find "Build Command"
- Set it to: `npm install && npm run build`

### Step 5: Go to Deploy Section
- Click "Deploy" in the right sidebar

### Step 6: Set Start Command
- Find "Start Command"
- Set it to: `npx serve -s build -l $PORT`

---

## Alternative: Use the Search Bar

At the top of Settings, there's a **"Filter Settings..."** search bar.

1. Type: `root directory`
2. It should show you the option directly!

---

## Quick Navigation:
**Right Sidebar → Build → Root Directory = `client`**
**Right Sidebar → Deploy → Start Command = `npx serve -s build -l $PORT`**

