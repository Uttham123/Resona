# Frontend Integration Guide

## How to Update HomePage to Use Real Data

Here's how to update `HomePage.js` to fetch real data from the backend:

### Step 1: Add API Base URL

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
```

### Step 2: Add State for Loading and Data

```javascript
const [notebooks, setNotebooks] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

### Step 3: Fetch Data on Component Mount

```javascript
useEffect(() => {
  const fetchNotebooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/notebooks`, {
        params: {
          limit: 50,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });
      
      if (response.data.success) {
        setNotebooks(response.data.notebooks);
      }
    } catch (err) {
      console.error('Error fetching notebooks:', err);
      setError('Failed to load notebooks');
      // Fallback to empty array or show error message
    } finally {
      setLoading(false);
    }
  };

  fetchNotebooks();
}, []);
```

### Step 4: Transform Data for Display

```javascript
// Transform notebooks for "My Notes" section
const allMyNotes = useMemo(() => {
  return notebooks.map(notebook => ({
    id: notebook._id,
    title: notebook.projectName,
    date: new Date(notebook.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    researchers: notebook.researchers
  }));
}, [notebooks]);

// Transform notebooks for "Latest Research" section
const allLatestResearch = useMemo(() => {
  return notebooks.map(notebook => ({
    id: notebook._id,
    title: notebook.projectName,
    description: `Research on ${notebook.userCohorts}`,
    date: new Date(notebook.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    researchers: notebook.researchers
  }));
}, [notebooks]);
```

### Step 5: Add Loading and Error States

```javascript
if (loading) {
  return (
    <div className="home-page">
      <div className="loading-container">
        <p>Loading notebooks...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="home-page">
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    </div>
  );
}
```

### Step 6: Update Navigation to Use Real IDs

```javascript
// In the note card click handler
onClick={() => navigate(`/research/${note.id}`)}
```

## Complete Example

See the updated `HomePage.js` implementation below for a complete example.

## Updating ExistingResearch Component

Similarly, update `ExistingResearch.js` to fetch notebook details:

```javascript
const { id } = useParams();
const [notebook, setNotebook] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchNotebook = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notebooks/${id}`);
      if (response.data.success) {
        setNotebook(response.data.notebook);
      }
    } catch (err) {
      console.error('Error fetching notebook:', err);
    } finally {
      setLoading(false);
    }
  };

  if (id) {
    fetchNotebook();
  }
}, [id]);
```

## Updating Notes (Insights, Opportunities, Pain Points)

When user confirms an edit:

```javascript
const handleSaveNote = async (type, note) => {
  try {
    await axios.put(`${API_BASE_URL}/notebooks/${notebookId}/notes`, {
      type: type,
      noteId: note.id,
      text: editText
    });
    
    // Refresh notebook data
    fetchNotebook();
  } catch (err) {
    console.error('Error updating note:', err);
  }
};
```

