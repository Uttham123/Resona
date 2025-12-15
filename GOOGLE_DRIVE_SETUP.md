# How to Get Google Drive Access Token

You don't need a Client ID! Just follow these steps to get an access token:

## Step 1: Go to OAuth Playground
Visit: https://developers.google.com/oauthplayground/

## Step 2: Select Google Drive API
1. On the left side, scroll down and find **"Drive API v3"**
2. Expand it and check the scope: **`https://www.googleapis.com/auth/drive`**
   - ⚠️ **IMPORTANT:** Use the full "drive" scope (not "drive.file") to access existing folders
   - The "drive.file" scope only works for files you create, not existing folders

## Step 3: Authorize
1. Click the **"Authorize APIs"** button at the top
2. Sign in with your Google account
3. Grant permissions when prompted

## Step 4: Get Access Token
1. Click **"Exchange authorization code for tokens"** button
2. Copy the **"Access token"** (it's a long string)

## Step 5: Use in App
1. Paste the access token in the app's token input field
2. The token is valid for 1 hour
3. If it expires, just get a new one from OAuth Playground

## Important Notes:
- The access token expires after 1 hour
- You need to get a new token if it expires
- No Client ID needed for this method
- The token gives access only to files you create (scope: drive.file)

## Your Drive Folder ID:
Your folder ID is already set: `1MPvOKrcZGnw9lxUp4tb4SlOqTSQWPhbj`

Just paste a valid access token and click "Upload to Google Drive"!

