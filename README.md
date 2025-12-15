# Resona - Chat-based Audio File Interface

A modern web application that provides a chat-based interface for uploading and managing multiple audio files. Built with React and Node.js/Express.

## Features

- 🎵 **Multiple Audio File Upload**: Drag & drop or browse to upload multiple audio files at once
- 💬 **Chat Interface**: Interactive chat interface to communicate about your audio files
- 📁 **File Management**: View uploaded files with metadata (size, type, upload time)
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations
- ⚡ **Real-time Updates**: Instant feedback on file uploads and chat messages
- ☁️ **Google Drive Integration**: Upload audio files directly to Google Drive folders

## Supported Audio Formats

- MP3
- WAV
- M4A
- OGG
- FLAC
- AAC
- WebM
- And more audio formats

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
cd Resona
```

2. Install all dependencies (root, server, and client):
```bash
npm run install-all
```

Or install manually:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

## Running the Application

### Development Mode (Recommended)

Run both server and client concurrently:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

### Run Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## Project Structure

```
Resona/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioUploader.js
│   │   │   ├── AudioUploader.css
│   │   │   ├── ChatInterface.js
│   │   │   └── ChatInterface.css
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── server/                 # Express backend
│   ├── uploads/            # Uploaded audio files (created automatically)
│   ├── index.js
│   └── package.json
├── package.json
└── README.md
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/chat` - Get chat history
- `POST /api/chat` - Send a chat message
- `POST /api/upload` - Upload audio files (multipart/form-data)
- `GET /api/files` - List all uploaded files
- `GET /api/files/:filename` - Download a specific file
- `DELETE /api/files/:filename` - Delete a file
- `POST /api/drive/upload` - Upload audio files to a Google Drive folder

## Configuration

### Server Configuration

Create a `.env` file in the `server/` directory:

```bash
PORT=5001
GOOGLE_API_KEY=your_google_api_key_here
```

You can configure the backend port by setting the `PORT` environment variable:
```bash
PORT=5001 npm run server
```

### Google Drive Integration

The application can upload files to Google Drive. **No server-side API key is required!** Users authenticate themselves using OAuth.

**Option 1: Automatic OAuth (Recommended)**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Drive API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"
4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins (e.g., `http://localhost:3000`)
   - Copy the Client ID
5. Add the Client ID to your `client/.env` file:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
   ```

**Option 2: Manual Token (Quick Test)**
1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Select "Drive API v3" and scope: `https://www.googleapis.com/auth/drive.file`
3. Click "Authorize APIs" and sign in
4. Click "Exchange authorization code for tokens"
5. Copy the "Access token"
6. Paste it in the app's token input field

The default folder ID is pre-filled: `1FO4QKL20jKUZjV9QQhYCOrDH4pAwb6zi`

### Frontend Configuration

For the frontend, set `REACT_APP_API_URL` to point to your backend:
```bash
REACT_APP_API_URL=http://localhost:5001/api npm start
```

## File Upload Limits

- Maximum file size: 100MB per file
- Maximum files per upload: 50 files
- Files are stored in `server/uploads/` directory

## Development

The application uses:
- **Frontend**: React 18 with modern hooks
- **Backend**: Express.js with Multer for file uploads
- **Styling**: Custom CSS with modern design patterns

## License

MIT

