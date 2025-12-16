# MongoDB Connection Test

## ✅ .env File Created!

Your `.env` file has been created at: `server/.env`

**Contents:**
- ✅ MongoDB connection string configured
- ✅ Database name: `resona`
- ✅ Username: `utthamudatthu_db_user`
- ✅ Google Drive folder ID configured
- ✅ Server port: 5001

## 🧪 Test the Connection

### Step 1: Start the Server

```bash
cd /Users/utthamudatthu/Desktop/Resona/server
npm start
```

### Step 2: Look for Success Message

You should see:
```
✓ MongoDB Connected: cluster0-shard-00-00.8fe57o1.mongodb.net
Server is running on port 5001
```

### Step 3: If You See an Error

**Common errors and fixes:**

1. **"Authentication failed"**
   - Double-check username and password in `.env`
   - Make sure no extra spaces

2. **"IP not whitelisted"**
   - Go to MongoDB Atlas → Network Access
   - Add `0.0.0.0/0` (allow from anywhere)

3. **"Connection timeout"**
   - Wait a few minutes (cluster might still be creating)
   - Check internet connection

## ✅ Next Steps After Connection Works

1. **Create a test notebook** through your app
2. **Check if it's saved to MongoDB**:
   ```bash
   curl http://localhost:5001/api/notebooks
   ```
3. **You should see your notebook data!**

## 🎉 Success Indicators

- ✅ Server starts without errors
- ✅ See "✓ MongoDB Connected" message
- ✅ Can create notebooks
- ✅ Can fetch notebooks via API

## 📝 For Railway Deployment

When deploying to Railway, add the `MONGODB_URI` environment variable in Railway dashboard:
1. Go to Railway project
2. Settings → Variables
3. Add: `MONGODB_URI` = `mongodb+srv://utthamudatthu_db_user:7UKnOX2Wqj64sejm@cluster0.8fe57o1.mongodb.net/resona?retryWrites=true&w=majority`

**⚠️ Important:** Don't commit `.env` to GitHub (it's already in `.gitignore`)

