const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Readable, PassThrough } = require('stream');
const { v4: uuidv4 } = require('uuid');
const { google } = require('googleapis');
const axios = require('axios');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept audio files
  const audioMimeTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mp4',
    'audio/m4a',
    'audio/ogg',
    'audio/webm',
    'audio/flac',
    'audio/aac'
  ];
  
  if (audioMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Store chat messages in memory (in production, use a database)
const chatHistory = [];

// Google Drive API setup - using OAuth tokens from client
const getDriveService = (accessToken) => {
  if (!accessToken) {
    return null;
  }
  
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  return google.drive({
    version: 'v3',
    auth: oauth2Client
  });
};

// Extract folder ID from Google Drive URL
const extractFolderId = (url) => {
  if (!url) return null;
  
  // Handle different URL formats
  const patterns = [
    /\/folders\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]+)$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

// Check if file is audio by extension
const isAudioFile = (filename) => {
  const audioExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac', '.webm', '.mp4'];
  const ext = path.extname(filename).toLowerCase();
  return audioExtensions.includes(ext);
};

// Get audio file info helper
const getAudioFileInfo = (filePath) => {
  const stats = fs.statSync(filePath);
  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime
  };
};

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Resona Audio Chat API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat',
      upload: '/api/upload',
      driveUpload: '/api/drive/upload',
      files: '/api/files'
    },
    docs: 'Visit /api/health for server status'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get chat history
app.get('/api/chat', (req, res) => {
  res.json({ messages: chatHistory });
});

// Upload audio files
app.post('/api/upload', upload.array('audioFiles', 50), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No audio files uploaded' });
    }

    const uploadedFiles = req.files.map(file => {
      const fileInfo = getAudioFileInfo(file.path);
      return {
        id: uuidv4(),
        filename: file.originalname,
        storedFilename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: fileInfo.size,
        uploadedAt: new Date().toISOString()
      };
    });

    // Add system message to chat history
    const message = {
      id: uuidv4(),
      type: 'system',
      timestamp: new Date().toISOString(),
      content: `Uploaded ${uploadedFiles.length} audio file(s)`,
      files: uploadedFiles
    };

    chatHistory.push(message);

    res.json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      files: uploadedFiles,
      chatMessage: message
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload files' });
  }
});

// Send chat message
app.post('/api/chat', (req, res) => {
  try {
    const { content, type = 'user' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const message = {
      id: uuidv4(),
      type: type,
      timestamp: new Date().toISOString(),
      content: content
    };

    chatHistory.push(message);

    res.json({ success: true, message: message });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to send message' });
  }
});

// Get uploaded file
app.get('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(filePath);
});

// Get list of all uploaded files
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir).map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename: filename,
        size: stats.size,
        uploadedAt: stats.birthtime
      };
    });

    res.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Delete a file
app.delete('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Upload files to Google Drive folder
app.post('/api/drive/upload', async (req, res) => {
  try {
    const { folderId, fileIds, accessToken } = req.body;
    
    if (!folderId) {
      return res.status(400).json({ error: 'Google Drive folder ID is required' });
    }

    if (!accessToken) {
      return res.status(400).json({ 
        error: 'Access token is required. Please authenticate with Google Drive first.' 
      });
    }

    // Get file IDs to upload (from local uploads)
    let filesToUpload = [];
    
    if (fileIds && fileIds.length > 0) {
      // Upload specific files by their stored filenames
      for (const storedFilename of fileIds) {
        const filePath = path.join(uploadsDir, storedFilename);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          filesToUpload.push({
            path: filePath,
            name: storedFilename.split('-').slice(1).join('-') || storedFilename, // Remove UUID prefix
            size: stats.size
          });
        }
      }
    } else {
      // Upload all files in uploads directory
      const allFiles = fs.readdirSync(uploadsDir);
      filesToUpload = allFiles.map(filename => {
        const filePath = path.join(uploadsDir, filename);
        const stats = fs.statSync(filePath);
        return {
          path: filePath,
          name: filename.split('-').slice(1).join('-') || filename,
          size: stats.size
        };
      }).filter(file => isAudioFile(file.name));
    }

    if (filesToUpload.length === 0) {
      return res.status(404).json({ error: 'No audio files found to upload' });
    }

    const drive = getDriveService(accessToken);
    if (!drive) {
      return res.status(500).json({ error: 'Failed to initialize Google Drive service' });
    }

    // First, verify the folder exists and is accessible
    try {
      const folderCheck = await drive.files.get({
        fileId: folderId,
        fields: 'id,name,mimeType'
      });
      console.log(`Folder verified: ${folderCheck.data.name} (${folderCheck.data.id})`);
    } catch (folderError) {
      console.error('Folder verification failed:', folderError.message);
      if (folderError.code === 404) {
        return res.status(400).json({ 
          error: `Folder not found: ${folderId}`,
          hint: 'Please check that the folder ID is correct and you have access to it.',
          tip: 'Make sure your access token has scope: https://www.googleapis.com/auth/drive'
        });
      } else if (folderError.code === 403) {
        return res.status(403).json({ 
          error: 'Access denied to folder',
          hint: 'The access token does not have permission to access this folder.',
          tip: 'Make sure you own the folder or have been granted access, and use scope: https://www.googleapis.com/auth/drive'
        });
      } else {
        return res.status(500).json({ 
          error: 'Failed to verify folder access',
          details: folderError.message,
          tip: 'Check that your access token is valid and has the correct scope'
        });
      }
    }

    // Upload files to Google Drive
    const uploadedFiles = [];
    const errors = [];
    
    for (const file of filesToUpload) {
      try {
        // Detect MIME type from file extension
        const ext = path.extname(file.name).toLowerCase();
        const mimeTypes = {
          '.mp3': 'audio/mpeg',
          '.wav': 'audio/wav',
          '.m4a': 'audio/mp4',
          '.ogg': 'audio/ogg',
          '.flac': 'audio/flac',
          '.aac': 'audio/aac',
          '.webm': 'audio/webm'
        };
        const mimeType = mimeTypes[ext] || 'audio/mpeg';

        const fileMetadata = {
          name: file.name,
          parents: [folderId]
        };

        const media = {
          mimeType: mimeType,
          body: fs.createReadStream(file.path)
        };

        const response = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id,name,size,webViewLink'
        });

        uploadedFiles.push({
          id: response.data.id,
          name: response.data.name,
          size: response.data.size,
          webViewLink: response.data.webViewLink
        });
        console.log(`Successfully uploaded: ${file.name} -> ${response.data.id}`);
      } catch (error) {
        const errorMsg = error.message || 'Unknown error';
        const errorDetails = error.response?.data || {};
        console.error(`Error uploading file ${file.name}:`, errorMsg);
        console.error('Error details:', JSON.stringify(errorDetails, null, 2));
        errors.push({ file: file.name, error: errorMsg });
        // Continue to next file instead of stopping
      }
    }

    if (uploadedFiles.length === 0) {
      return res.status(500).json({ 
        error: 'Failed to upload any files to Google Drive',
        errors: errors,
        hint: 'Check the errors array for details. Common issues: Invalid token, expired token, or insufficient permissions.',
        tip: 'Make sure your access token has scope: https://www.googleapis.com/auth/drive and is not expired (tokens expire after 1 hour)'
      });
    }
    
    // If some files failed, include warnings
    if (errors.length > 0) {
      console.warn(`${errors.length} file(s) failed to upload, but ${uploadedFiles.length} succeeded`);
    }

    // Add system message to chat history
    const message = {
      id: uuidv4(),
      type: 'system',
      timestamp: new Date().toISOString(),
      content: `Uploaded ${uploadedFiles.length} audio file(s) to Google Drive`,
      files: uploadedFiles.map(f => ({
        id: f.id,
        filename: f.name,
        size: f.size,
        webViewLink: f.webViewLink
      }))
    };

    chatHistory.push(message);

    res.json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} file(s) to Google Drive`,
      files: uploadedFiles,
      chatMessage: message
    });
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    let errorMessage = 'Failed to upload files to Google Drive';
    
    if (error.message && error.message.includes('Invalid Credentials')) {
      errorMessage = 'Invalid or expired access token. Please get a new token from OAuth Playground.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.response?.data || error.message
    });
  }
});

// Store progress for each notebook creation (in production, use Redis or similar)
const notebookProgress = new Map();

// Create research notebook in Google Drive
app.post('/api/notebook/create', async (req, res) => {
  const progressId = uuidv4();
  
  try {
    const { 
      projectName, 
      date, 
      researchers, 
      userCohorts, 
      methodology, 
      audioFileIds, 
      accessToken 
    } = req.body;

    // Initialize progress
    notebookProgress.set(progressId, {
      step: 'starting',
      message: 'Initializing...',
      progress: 0
    });

    // Validation
    if (!projectName || !date || !researchers || !userCohorts || !methodology) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!audioFileIds || audioFileIds.length === 0) {
      return res.status(400).json({ error: 'At least one audio file is required' });
    }

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const drive = getDriveService(accessToken);
    if (!drive) {
      return res.status(500).json({ error: 'Failed to initialize Google Drive service' });
    }

    // Update progress
    notebookProgress.set(progressId, {
      step: 'authenticating',
      message: 'Verifying authentication...',
      progress: 5
    });

    // Verify authentication by checking token validity
    try {
      const aboutResponse = await drive.about.get({
        fields: 'user'
      });
      console.log(`✓ Authenticated as: ${aboutResponse.data.user.emailAddress || 'User'}`);
    } catch (authError) {
      console.error('✗ Authentication verification failed:', authError.message);
      if (authError.code === 401 || authError.message.includes('Invalid Credentials') || authError.message.includes('invalid_grant')) {
        return res.status(401).json({ 
          error: 'Invalid or expired access token',
          hint: 'Please get a new access token from OAuth Playground',
          tip: 'Access tokens expire after 1 hour. Make sure you use scope: https://www.googleapis.com/auth/drive'
        });
      }
      return res.status(401).json({ 
        error: 'Authentication failed',
        details: authError.message,
        hint: 'Please verify your access token is valid and has the correct scope'
      });
    }

    // Default folder ID (where notebooks will be created)
    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1MPvOKrcZGnw9lxUp4tb4SlOqTSQWPhbj';

    // Verify parent folder exists
    try {
      const parentFolder = await drive.files.get({
        fileId: parentFolderId,
        fields: 'id,name'
      });
      console.log(`✓ Parent folder verified: ${parentFolder.data.name}`);
    } catch (folderError) {
      console.error('✗ Parent folder verification failed:', folderError.message);
      return res.status(400).json({ 
        error: 'Parent folder not accessible',
        hint: 'Check that the folder ID is correct and you have access',
        tip: 'Make sure your access token has permission to access this folder'
      });
    }

    // Create project folder
    const folderMetadata = {
      name: projectName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId]
    };

    const folderResponse = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id,name,webViewLink'
    });

    const projectFolderId = folderResponse.data.id;
    console.log(`✓ Created project folder: ${projectName} (${projectFolderId})`);

    // Update progress
    notebookProgress.set(progressId, {
      step: 'creating_files',
      message: 'Creating project files...',
      progress: 20
    });

    // Create PDF file with project info
    console.log('📝 Creating project_info.pdf...');
    const tempFilePath = path.join(uploadsDir, `temp_${uuidv4()}.pdf`);
    
    // Create PDF document
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(tempFilePath);
    doc.pipe(stream);

    // Add content to PDF
    doc.fontSize(20).text('Research Notebook', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(projectName, { align: 'center' });
    doc.moveDown(2);
    
    doc.fontSize(14).text('Project Information', { underline: true });
    doc.moveDown();
    
    doc.fontSize(12);
    doc.text('Goal/Aim of Research:', { continued: false });
    doc.text(projectName, { indent: 20 });
    doc.moveDown();
    
    doc.text('Date of Research:', { continued: false });
    doc.text(date, { indent: 20 });
    doc.moveDown();
    
    doc.text('Researchers:', { continued: false });
    doc.text(researchers, { indent: 20 });
    doc.moveDown();
    
    doc.text('User Cohorts:', { continued: false });
    doc.text(userCohorts, { indent: 20 });
    doc.moveDown();
    
    doc.text('Research Methodology:', { continued: false });
    doc.text(methodology, { indent: 20 });
    doc.moveDown();
    
    doc.text('Number of Audio Files:', { continued: false });
    doc.text(audioFileIds.length.toString(), { indent: 20 });
    doc.moveDown(2);
    
    doc.fontSize(10).text(`Generated on ${new Date().toISOString()}`, { align: 'center' });
    
    // Finalize PDF
    doc.end();
    
    // Wait for PDF to be written
    await new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log(`✓ Written temp PDF file: ${tempFilePath}`);
        resolve();
      });
      stream.on('error', reject);
    });

    try {
      const stats = fs.statSync(tempFilePath);
      console.log(`✓ Temp file size: ${stats.size} bytes`);

      const textMetadata = {
        name: 'project_info.pdf',
        parents: [projectFolderId]
      };

      const textMedia = {
        mimeType: 'application/pdf',
        body: fs.createReadStream(tempFilePath)
      };

      console.log('📤 Uploading project_info.pdf to Google Drive...');
      const textFile = await drive.files.create({
        requestBody: textMetadata,
        media: textMedia,
        fields: 'id,name'
      });
      console.log(`✓ Created project_info.pdf (${textFile.data.id})`);
      
      // Update progress
      notebookProgress.set(progressId, {
        step: 'creating_audio_folder',
        message: 'Creating audio files folder...',
        progress: 40
      });
      
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log('✓ Cleaned up temp file');
      }
    } catch (textError) {
      console.error('✗ Error creating text file:', textError.message);
      // Clean up temp file even on error
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (e) {
          console.error('Could not delete temp file:', e.message);
        }
      }
      // Don't throw - continue with audio files even if text file fails
      console.warn('⚠ Continuing without text file...');
    }

    // Create audio_files subfolder
    console.log('📁 Creating audio_files subfolder...');
    let audioFolderId;
    try {
      const audioFolderMetadata = {
        name: 'audio_files',
        mimeType: 'application/vnd.google-apps.folder',
        parents: [projectFolderId]
      };

      const audioFolderResponse = await drive.files.create({
        requestBody: audioFolderMetadata,
        fields: 'id,name'
      });

      audioFolderId = audioFolderResponse.data.id;
      console.log(`✓ Created audio_files folder (${audioFolderId})`);
      
      // Update progress
      notebookProgress.set(progressId, {
        step: 'uploading_audio',
        message: `Preparing to upload ${audioFileIds.length} audio file(s)...`,
        progress: 50
      });
    } catch (folderError) {
      console.error('✗ Error creating audio_files folder:', folderError.message);
      console.error('✗ Full error:', folderError);
      throw new Error(`Failed to create audio_files folder: ${folderError.message}`);
    }

    // Upload audio files (optimized for Gemini)
    console.log(`📤 Starting upload of ${audioFileIds.length} audio file(s)...`);
    const uploadedAudioFiles = [];
    
    for (let i = 0; i < audioFileIds.length; i++) {
      const storedFilename = audioFileIds[i];
      const filePath = path.join(uploadsDir, storedFilename);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${storedFilename}`);
        continue;
      }

      try {
        // Get original filename (remove UUID prefix)
        const originalName = storedFilename.split('-').slice(1).join('-') || storedFilename;
        
        // Detect MIME type
        const ext = path.extname(originalName).toLowerCase();
        const mimeTypes = {
          '.mp3': 'audio/mpeg',
          '.wav': 'audio/wav',
          '.m4a': 'audio/mp4',
          '.ogg': 'audio/ogg',
          '.flac': 'audio/flac',
          '.aac': 'audio/aac',
          '.webm': 'audio/webm'
        };
        const mimeType = mimeTypes[ext] || 'audio/mpeg';

        // For Gemini, MP3 is optimal. If file is not MP3, we'll upload as-is
        // (In production, you might want to convert to MP3 here)
        const fileMetadata = {
          name: originalName,
          parents: [audioFolderId]
        };

        const media = {
          mimeType: mimeType,
          body: fs.createReadStream(filePath)
        };

        console.log(`  [${i + 1}/${audioFileIds.length}] Uploading: ${originalName}...`);
        
        // Update progress
        const uploadProgress = 50 + Math.floor((i / audioFileIds.length) * 45);
        notebookProgress.set(progressId, {
          step: 'uploading_audio',
          message: `Uploading ${i + 1}/${audioFileIds.length}: ${originalName}`,
          progress: uploadProgress
        });
        
        const fileResponse = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id,name,size,webViewLink'
        });

        uploadedAudioFiles.push({
          id: fileResponse.data.id,
          name: fileResponse.data.name,
          size: fileResponse.data.size,
          webViewLink: fileResponse.data.webViewLink
        });

        console.log(`  ✓ Uploaded: ${originalName} (${fileResponse.data.id})`);
      } catch (error) {
        console.error(`  ✗ Error uploading ${storedFilename}:`, error.message);
        console.error('  Full error:', error);
      }
    }

    console.log(`✓ Completed: ${uploadedAudioFiles.length}/${audioFileIds.length} files uploaded successfully`);

    if (uploadedAudioFiles.length === 0) {
      notebookProgress.delete(progressId);
      return res.status(500).json({ error: 'Failed to upload any audio files' });
    }

    // Final progress update
    notebookProgress.set(progressId, {
      step: 'complete',
      message: 'Notebook created successfully!',
      progress: 100
    });

    const response = {
      success: true,
      message: `Research notebook "${projectName}" created successfully`,
      projectName: projectName,
      date: date,
      methodology: methodology,
      folderId: projectFolderId,
      folderLink: folderResponse.data.webViewLink,
      audioFilesCount: uploadedAudioFiles.length,
      progressId: progressId
    };

    // Clean up progress after 30 seconds
    setTimeout(() => {
      notebookProgress.delete(progressId);
    }, 30000);

    res.json(response);
  } catch (error) {
    console.error('Error creating notebook:', error);
    notebookProgress.delete(progressId);
    res.status(500).json({ 
      error: error.message || 'Failed to create research notebook',
      details: error.response?.data || error.message
    });
  }
});

// Get progress for notebook creation
app.get('/api/notebook/progress/:progressId', (req, res) => {
  const { progressId } = req.params;
  const progress = notebookProgress.get(progressId);
  
  if (!progress) {
    return res.status(404).json({ error: 'Progress not found' });
  }
  
  res.json(progress);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Upload directory: ${uploadsDir}`);
  console.log('Google Drive: Ready (uses OAuth tokens from client)');
});

