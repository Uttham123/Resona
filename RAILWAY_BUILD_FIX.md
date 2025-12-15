# Fix Railway Build - Update Commands

## The Problem
Railway is running commands from the root directory, but your `package.json` with the build script is in the `client/` folder.

## The Solution: Update Build Command

### In Railway Dashboard:

1. **Go to Build Section** (you're already there!)

2. **Update "Custom Build Command":**
   Change from:
   ```
   npm install && npm run build
   ```
   
   To:
   ```
   cd client && npm install && npm run build
   ```

3. **Go to Deploy Section** (click "Deploy" in right sidebar)

4. **Set "Custom Start Command":**
   ```
   cd client && npx serve -s build -l $PORT
   ```

---

## Alternative: If Root Directory Option Exists

If you can find a "Root Directory" setting anywhere:
- Set it to: `client`

But the `cd client &&` prefix in commands should work!

