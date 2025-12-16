# Database Schema Design - Discussion & Analysis

## 📊 Current Schema Structure

### Main Document: `Notebook`

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated
  projectName: String,              // Goal/Aim of research
  date: Date,                       // Date of research
  researchers: [String],            // Array of researcher names
  userCohorts: String,             // User cohorts description
  methodology: String,              // "In-person research" | "Remote research"
  audioFileCount: Number,           // Count of audio files
  googleDriveFolderId: String,     // Google Drive folder ID
  googleDriveFolderUrl: String,    // Google Drive web view URL
  insights: [NoteSchema],          // Array of insight notes
  opportunities: [NoteSchema],     // Array of opportunity notes
  painPoints: [NoteSchema],        // Array of pain point notes
  createdAt: Date,                 // Auto-generated timestamp
  updatedAt: Date                  // Auto-updated timestamp
}
```

### Sub-Document: `NoteSchema` (for insights/opportunities/painPoints)

```javascript
{
  id: String,                       // Unique ID for the note
  text: String,                     // Note content
  timestamp: Date                   // When note was created/updated
}
```

---

## 🤔 Design Decisions & Rationale

### 1. **Why MongoDB (NoSQL) vs SQL Database?**

**My Choice:** MongoDB (NoSQL)

**Pros:**
- ✅ Flexible schema - easy to add new fields later
- ✅ Native array support - perfect for `researchers: [String]` and notes arrays
- ✅ JSON-like structure - matches frontend data structure
- ✅ Easy to scale horizontally
- ✅ Free tier available (Atlas)

**Cons:**
- ❌ No joins (but we don't need them - single document per notebook)
- ❌ Less strict data validation (but Mongoose helps)
- ❌ No transactions across documents (not needed for this use case)

**Alternative:** PostgreSQL/MySQL
- Would need separate tables for notes (insights, opportunities, painPoints)
- Requires JOINs to fetch complete notebook
- More complex queries
- Better for relational data (we don't have much)

**Verdict:** MongoDB is the right choice ✅

---

### 2. **Why Store Notes as Embedded Arrays vs Separate Collection?**

**My Choice:** Embedded arrays (notes inside notebook document)

**Structure:**
```javascript
notebook: {
  insights: [{ id, text, timestamp }],
  opportunities: [{ id, text, timestamp }],
  painPoints: [{ id, text, timestamp }]
}
```

**Pros:**
- ✅ Single query to get all notebook data
- ✅ Atomic updates (update notebook = update all notes)
- ✅ Simpler API (no need to join)
- ✅ Better performance (one database call)

**Cons:**
- ❌ Document size limit (16MB in MongoDB - but notes are small)
- ❌ Can't query notes across notebooks easily
- ❌ If notes grow huge, document becomes large

**Alternative:** Separate `Notes` collection
```javascript
// Notebook collection
notebooks: { _id, projectName, ... }

// Notes collection
notes: { 
  notebookId: ObjectId, 
  type: 'insights'|'opportunities'|'painPoints',
  text: String,
  timestamp: Date
}
```

**Pros:**
- ✅ Can query all notes across notebooks
- ✅ Smaller notebook documents
- ✅ Better for analytics ("show all insights")

**Cons:**
- ❌ Requires JOINs (MongoDB $lookup - slower)
- ❌ More complex queries
- ❌ Two database calls to get full notebook

**Verdict:** Embedded is better for this use case ✅
- Notes are always viewed within a notebook context
- We don't need cross-notebook note queries
- Simpler and faster

---

### 3. **Why Store `audioFileCount` Instead of Audio File Details?**

**My Choice:** Just store count

**Current:**
```javascript
audioFileCount: Number
```

**Alternative:** Store full audio file details
```javascript
audioFiles: [{
  filename: String,
  size: Number,
  duration: Number,
  googleDriveFileId: String,
  uploadedAt: Date
}]
```

**My Reasoning:**
- Audio files are stored in Google Drive
- We have `googleDriveFolderId` - can fetch files from Drive API if needed
- Keeps database document small
- Count is enough for display purposes

**Should We Change?**
- **If you need to:** List audio files, show file names, track uploads
- **Then:** Store full array of audio file objects
- **Trade-off:** Larger documents, but more functionality

**Recommendation:** Keep count for now, can add details later if needed

---

### 4. **Why Store Both `googleDriveFolderId` AND `googleDriveFolderUrl`?**

**My Choice:** Store both

**Current:**
```javascript
googleDriveFolderId: String,    // "1MPvOKrcZGnw9lxUp4tb4SlOqTSQWPhbj"
googleDriveFolderUrl: String    // "https://drive.google.com/..."
```

**Pros:**
- ✅ `folderId` - needed for API operations (upload files, list files)
- ✅ `folderUrl` - needed for user-facing links (click to open in Drive)
- ✅ Avoids string manipulation/construction

**Cons:**
- ❌ Slight duplication (URL can be constructed from ID)
- ❌ If URL format changes, need to update

**Alternative:** Store only ID, construct URL when needed
```javascript
const url = `https://drive.google.com/drive/folders/${folderId}`;
```

**Verdict:** Both is fine - minimal storage, better UX ✅

---

### 5. **Why Use String IDs for Notes Instead of ObjectId?**

**My Choice:** String IDs

**Current:**
```javascript
NoteSchema: {
  id: String,  // "507f1f77bcf86cd799439011"
  text: String,
  timestamp: Date
}
```

**Alternative:** Use MongoDB ObjectId
```javascript
NoteSchema: {
  _id: ObjectId,  // Auto-generated
  text: String,
  timestamp: Date
}
```

**My Reasoning:**
- Frontend uses string IDs (easier to work with in React)
- Consistent with frontend expectations
- Can generate IDs client-side if needed
- Simpler API responses

**Pros of String IDs:**
- ✅ Easier for frontend (no ObjectId conversion)
- ✅ Can generate IDs before saving
- ✅ Consistent with frontend code

**Cons:**
- ❌ Not using MongoDB's native ID system
- ❌ Slightly larger storage (but negligible)

**Verdict:** String IDs are fine for embedded documents ✅

---

### 6. **Why Store `researchers` as Array of Strings?**

**My Choice:** `researchers: [String]`

**Current:**
```javascript
researchers: ['Uttham', 'Vedant', 'Aman']
```

**Alternative:** Store as objects
```javascript
researchers: [{
  name: String,
  email: String,
  role: String,
  avatar: String
}]
```

**My Reasoning:**
- Simple use case - just names for display
- Frontend only shows names
- Can expand later if needed

**Should We Change?**
- **If you need:** Researcher profiles, emails, avatars, roles
- **Then:** Store as objects
- **Trade-off:** More complex, but more features

**Recommendation:** Keep as strings for now, can migrate later

---

### 7. **Indexes - Are They Optimal?**

**Current Indexes:**
```javascript
NotebookSchema.index({ projectName: 'text', userCohorts: 'text' });  // Text search
NotebookSchema.index({ date: -1 });                                  // Sort by date
NotebookSchema.index({ createdAt: -1 });                            // Sort by creation
```

**Analysis:**
- ✅ Text index on `projectName` and `userCohorts` - good for search
- ✅ Date index - good for sorting
- ✅ CreatedAt index - good for "latest first" queries

**Potential Improvements:**
- Add index on `researchers` if we search by researcher name
- Add compound index if we frequently filter by date + methodology

**Verdict:** Current indexes are good for current use case ✅

---

## 🔄 Potential Improvements & Alternatives

### 1. **Add User/Owner Field?**

**Current:** No user/owner tracking

**Should We Add?**
```javascript
ownerId: String,        // User who created the notebook
ownerEmail: String,     // User email
sharedWith: [String]    // Array of user emails with access
```

**Use Case:** Multi-user support, sharing notebooks

**Recommendation:** Add if you plan multi-user features

---

### 2. **Add Status/State Field?**

**Current:** No status tracking

**Should We Add?**
```javascript
status: {
  type: String,
  enum: ['draft', 'in-progress', 'completed', 'archived'],
  default: 'completed'
}
```

**Use Case:** Track notebook lifecycle, filter by status

**Recommendation:** Add if you need draft/archived notebooks

---

### 3. **Add Tags/Categories?**

**Current:** No tagging system

**Should We Add?**
```javascript
tags: [String],         // ['e-commerce', 'checkout', 'mobile']
categories: String      // 'User Research' | 'Product Research'
```

**Use Case:** Better organization, filtering, search

**Recommendation:** Consider adding tags for better organization

---

### 4. **Add Audio File Metadata?**

**Current:** Only count

**Should We Add?**
```javascript
audioFiles: [{
  filename: String,
  size: Number,           // bytes
  duration: Number,       // seconds
  driveFileId: String,
  uploadedAt: Date
}]
```

**Use Case:** Show file list, track uploads, display metadata

**Recommendation:** Add if you need to display/manage audio files

---

### 5. **Add Summary/Description Field?**

**Current:** Only `projectName`

**Should We Add?**
```javascript
description: String,     // Longer description
summary: String,         // Auto-generated summary
keyFindings: String      // Main findings
```

**Use Case:** Better display on homepage, search

**Recommendation:** Consider adding `description` for "Latest Research" section

---

## 📋 Schema Comparison: Current vs Alternative

### Current (Embedded Notes)
```javascript
{
  _id: ObjectId,
  projectName: "Improve Mall Comprehension",
  insights: [
    { id: "1", text: "Users find...", timestamp: Date }
  ],
  // ... rest
}
```

### Alternative (Separate Notes Collection)
```javascript
// Notebooks collection
{
  _id: ObjectId,
  projectName: "Improve Mall Comprehension"
}

// Notes collection
{
  _id: ObjectId,
  notebookId: ObjectId,
  type: "insights",
  text: "Users find...",
  timestamp: Date
}
```

**Query Comparison:**

**Current (Embedded):**
```javascript
// Get notebook with all notes - ONE query
const notebook = await Notebook.findById(id);
```

**Alternative (Separate):**
```javascript
// Get notebook - ONE query
const notebook = await Notebook.findById(id);

// Get notes - SECOND query (or $lookup)
const notes = await Note.find({ notebookId: id });
```

**Verdict:** Embedded is simpler and faster for this use case ✅

---

## 🎯 Recommendations

### Keep As-Is ✅
1. MongoDB (NoSQL) - right choice
2. Embedded notes arrays - simpler and faster
3. String IDs for notes - easier for frontend
4. Both Drive ID and URL - better UX
5. Current indexes - good for current queries

### Consider Adding 🔄
1. **User/Owner field** - if multi-user support needed
2. **Description field** - for better homepage display
3. **Tags array** - for better organization
4. **Status field** - if you need draft/archived notebooks

### Don't Change ❌
1. Don't separate notes into different collection (unless you need cross-notebook queries)
2. Don't change to SQL (MongoDB is perfect for this)
3. Don't use ObjectId for note IDs (strings are easier)

---

## 💬 Discussion Points

1. **Do you need to query notes across multiple notebooks?**
   - If YES → Consider separate Notes collection
   - If NO → Keep embedded (current design)

2. **Do you need detailed audio file information?**
   - If YES → Add `audioFiles` array with metadata
   - If NO → Keep just count (current design)

3. **Do you need multi-user support?**
   - If YES → Add `ownerId`, `sharedWith` fields
   - If NO → Keep current design

4. **Do you need draft/archived notebooks?**
   - If YES → Add `status` field
   - If NO → Keep current design

5. **Do you need better search/filtering?**
   - If YES → Add `tags`, `description`, `categories`
   - If NO → Current search is sufficient

---

## 🚀 Next Steps

1. **Review this document** - Do you agree with the design decisions?
2. **Identify missing features** - What do you need that's not here?
3. **Discuss trade-offs** - Are there any concerns?
4. **Plan additions** - What should we add now vs later?

Let's discuss! What are your thoughts? 🤔

