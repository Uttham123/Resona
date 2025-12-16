# MongoDB Atlas Setup - Step by Step

## ✅ Step 1: Create a Cluster (You're Here!)

1. **On the Atlas Dashboard**, you should see "Clusters" section
2. **Click "Create cluster"** button (green button)
3. **Choose Free Tier (M0)**:
   - Select "M0 Sandbox" (FREE)
   - This gives you 512MB storage (plenty for development)
4. **Choose Cloud Provider & Region**:
   - Pick the region closest to you (or where Railway is deployed)
   - For Railway, AWS regions work well
5. **Name your cluster** (optional):
   - Default name is "Cluster0" (that's fine)
6. **Click "Create Cluster"**
   - ⏱️ This takes 3-5 minutes to create

---

## ✅ Step 2: Create Database User

While cluster is creating, set up a database user:

1. **Click "Database Access"** in the left sidebar (or Security → Database Access)
2. **Click "Add New Database User"**
3. **Choose "Password" authentication**
4. **Set Username**: `resona-user` (or any name you like)
5. **Set Password**: 
   - Click "Autogenerate Secure Password" (recommended)
   - **IMPORTANT**: Copy and save this password! You'll need it.
   - Or create your own strong password
6. **Database User Privileges**: Leave as "Atlas admin" (default)
7. **Click "Add User"**

**⚠️ SAVE YOUR PASSWORD!** You'll need it for the connection string.

---

## ✅ Step 3: Whitelist IP Address

1. **Click "Network Access"** in the left sidebar (or Security → Network Access)
2. **Click "Add IP Address"**
3. **For Development**: 
   - Click "Allow Access from Anywhere"
   - This adds `0.0.0.0/0` (allows from anywhere)
   - ⚠️ This is OK for development, but for production you should restrict IPs
4. **Click "Confirm"**

---

## ✅ Step 4: Get Connection String

1. **Go back to "Database"** (or "Overview")
2. **Click "Connect"** button (green button next to your cluster)
3. **Choose "Connect your application"**
4. **Driver**: Select "Node.js"
5. **Version**: Select latest (usually 5.5 or higher)
6. **Copy the connection string** - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## ✅ Step 5: Update Connection String

Replace the placeholders in the connection string:

1. Replace `<username>` with your database username (e.g., `resona-user`)
2. Replace `<password>` with your database password (the one you saved!)
3. Add database name at the end: `?retryWrites=true&w=majority` → `?retryWrites=true&w=majority` (or add `/resona` before the `?`)

**Final connection string should look like:**
```
mongodb+srv://resona-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/resona?retryWrites=true&w=majority
```

---

## ✅ Step 6: Add to Your Project

1. **Create/Edit `.env` file** in `server/` directory:
   ```bash
   cd /Users/utthamudatthu/Desktop/Resona/server
   ```

2. **Create `.env` file** (if it doesn't exist):
   ```bash
   touch .env
   ```

3. **Add MongoDB connection string**:
   ```env
   MONGODB_URI=mongodb+srv://resona-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/resona?retryWrites=true&w=majority
   ```

   **Replace:**
   - `resona-user` with your actual username
   - `YOUR_PASSWORD` with your actual password
   - `cluster0.xxxxx.mongodb.net` with your actual cluster URL

4. **Save the file**

---

## ✅ Step 7: Test the Connection

1. **Start your server**:
   ```bash
   cd /Users/utthamudatthu/Desktop/Resona/server
   npm start
   ```

2. **Look for this message**:
   ```
   ✓ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
   ```

3. **If you see an error**, check:
   - Password is correct (no extra spaces)
   - Username is correct
   - IP is whitelisted
   - Connection string format is correct

---

## ✅ Step 8: Test with API

1. **Create a notebook** through your app
2. **Check if it's saved to database**:
   ```bash
   curl http://localhost:5001/api/notebooks
   ```

3. **You should see your notebook data!**

---

## 🎯 Quick Checklist

- [ ] Cluster created (M0 Free tier)
- [ ] Database user created (username + password saved)
- [ ] IP whitelisted (0.0.0.0/0 for development)
- [ ] Connection string copied
- [ ] Connection string updated with username/password
- [ ] Added to `server/.env` file
- [ ] Server started and connection successful
- [ ] Tested by creating a notebook

---

## 🚨 Common Issues

### "Authentication failed"
- Check username and password are correct
- Make sure no extra spaces in connection string
- Verify user exists in Database Access

### "IP not whitelisted"
- Go to Network Access
- Add `0.0.0.0/0` (allow from anywhere)

### "Connection timeout"
- Check cluster is fully created (wait 5 minutes)
- Verify connection string format
- Check internet connection

---

## 📝 Example .env File

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://resona-user:MySecurePassword123@cluster0.abc123.mongodb.net/resona?retryWrites=true&w=majority

# Google Drive (existing)
GOOGLE_DRIVE_FOLDER_ID=1MPvOKrcZGnw9lxUp4tb4SlOqTSQWPhbj

# Server Port
PORT=5001
```

---

## 🎉 You're Done!

Once you see "✓ MongoDB Connected" in your server logs, you're all set! Every notebook you create will now be saved to MongoDB and you can fetch them via the API.
