# Backend Data Setup Guide

## Overview
The backend now supports storing and fetching notebook data from MongoDB. Here's how to set it up:

## 1. MongoDB Setup

### Option A: Local MongoDB (Development)
1. Install MongoDB locally: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. No connection string needed - defaults to `mongodb://localhost:27017/resona`

### Option B: MongoDB Atlas (Recommended for Production)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string
4. Add it to `.env` file

## 2. Environment Variables

Add to `server/.env`:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/resona
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resona?retryWrites=true&w=majority
```

## 3. API Endpoints

### GET `/api/notebooks`
List all notebooks with optional search and pagination.

**Query Parameters:**
- `search` - Search term (searches in projectName, userCohorts, researchers)
- `limit` - Number of results (default: 50)
- `offset` - Skip results (default: 0)
- `sortBy` - Field to sort by (default: 'createdAt')
- `sortOrder` - 'asc' or 'desc' (default: 'desc')

**Example:**
```
GET /api/notebooks?search=mall&limit=10&offset=0
```

**Response:**
```json
{
  "success": true,
  "notebooks": [
    {
      "_id": "...",
      "projectName": "Improve Mall Comprehension",
      "date": "2025-12-12T00:00:00.000Z",
      "researchers": ["Uttham", "Vedant"],
      "userCohorts": "...",
      "methodology": "In-person research",
      "audioFileCount": 3,
      "googleDriveFolderId": "...",
      "googleDriveFolderUrl": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 10,
  "limit": 10,
  "offset": 0
}
```

### GET `/api/notebooks/:id`
Get a single notebook with all details including notes.

**Response:**
```json
{
  "success": true,
  "notebook": {
    "_id": "...",
    "projectName": "...",
    "insights": [
      {
        "id": "...",
        "text": "...",
        "timestamp": "..."
      }
    ],
    "opportunities": [...],
    "painPoints": [...]
  }
}
```

### PUT `/api/notebooks/:id/notes`
Update an existing note.

**Body:**
```json
{
  "type": "insights",  // or "opportunities" or "painPoints"
  "noteId": "note-id-here",
  "text": "Updated note text"
}
```

### POST `/api/notebooks/:id/notes`
Add a new note.

**Body:**
```json
{
  "type": "insights",  // or "opportunities" or "painPoints"
  "text": "New note text"
}
```

## 4. Frontend Integration

See `FRONTEND_INTEGRATION.md` for details on updating the React components.

## 5. Testing

1. Start MongoDB (if local)
2. Start the server: `cd server && npm start`
3. Create a notebook (it will be saved to DB automatically)
4. Test endpoints:
   ```bash
   # List all notebooks
   curl http://localhost:5001/api/notebooks
   
   # Get single notebook
   curl http://localhost:5001/api/notebooks/NOTEBOOK_ID
   ```

## 6. Data Flow

1. User creates notebook → `/api/notebook/create`
2. Backend creates folder in Google Drive
3. Backend saves metadata to MongoDB
4. Frontend fetches notebooks → `/api/notebooks`
5. Frontend displays real data instead of dummy data

## Notes

- If MongoDB is not available, the app will still work (notebooks created in Google Drive)
- Database errors are logged but don't break the notebook creation flow
- All notebooks are automatically saved to DB when created

