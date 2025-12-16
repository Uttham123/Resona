# Backend Data Architecture Plan

## Current State
- Notebooks are created in Google Drive (files + folders)
- No database to store metadata
- Frontend uses dummy/hardcoded data
- No way to list or search existing notebooks

## Proposed Solution

### 1. Database Choice: MongoDB
- **Why MongoDB?** 
  - Flexible schema (good for research data that may evolve)
  - Easy to store arrays (researchers, audio files)
  - Good for JSON-like data structures
  - Free tier available (MongoDB Atlas)

### 2. Data Model

```javascript
{
  _id: ObjectId,
  projectName: String,           // Goal/Aim of research
  date: Date,                     // Date of research
  researchers: [String],          // Array of researcher names
  userCohorts: String,
  methodology: String,            // "In-person research" or "Remote research"
  audioFileCount: Number,
  googleDriveFolderId: String,    // Link to Google Drive folder
  googleDriveFolderUrl: String,  // Web view link
  createdAt: Date,                // When notebook was created
  updatedAt: Date,                // Last update time
  insights: [                     // For ExistingResearch page
    {
      id: String,
      text: String,
      timestamp: Date
    }
  ],
  opportunities: [
    {
      id: String,
      text: String,
      timestamp: Date
    }
  ],
  painPoints: [
    {
      id: String,
      text: String,
      timestamp: Date
    }
  ]
}
```

### 3. API Endpoints to Create

#### GET `/api/notebooks`
- List all notebooks
- Query params: `?search=term&limit=10&offset=0`
- Returns: Array of notebook summaries

#### GET `/api/notebooks/:id`
- Get single notebook details
- Returns: Full notebook object

#### POST `/api/notebooks` (Update existing)
- Currently handled by `/api/notebook/create`
- Will also save to database

#### PUT `/api/notebooks/:id/notes`
- Update insights/opportunities/painPoints
- Body: `{ type: 'insights'|'opportunities'|'painPoints', id: string, text: string }`

#### DELETE `/api/notebooks/:id`
- Delete notebook (optional, for future)

### 4. Implementation Steps

1. **Setup MongoDB**
   - Install `mongoose` package
   - Create connection to MongoDB (local or Atlas)
   - Create Notebook model/schema

2. **Update `/api/notebook/create`**
   - After creating in Google Drive, save metadata to MongoDB
   - Return notebook ID from database

3. **Create new endpoints**
   - GET `/api/notebooks` - List all
   - GET `/api/notebooks/:id` - Get one
   - PUT `/api/notebooks/:id/notes` - Update notes

4. **Update Frontend**
   - Replace dummy data with API calls
   - Use `useEffect` to fetch on component mount
   - Add loading states

### 5. Environment Variables Needed

```env
MONGODB_URI=mongodb://localhost:27017/resona
# OR for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resona
```

### 6. File Structure

```
server/
  ├── index.js (main server)
  ├── models/
  │   └── Notebook.js (Mongoose model)
  ├── routes/
  │   └── notebooks.js (notebook routes)
  └── config/
      └── database.js (MongoDB connection)
```

## Next Steps
1. Install MongoDB and mongoose
2. Create database connection
3. Create Notebook model
4. Update notebook creation to save to DB
5. Create GET endpoints
6. Update frontend to fetch real data

