import React, { useState } from 'react';
import './GoogleDriveImporter.css';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const GoogleDriveImporter = ({ onImport, isLoading }) => {
  const [folderUrl, setFolderUrl] = useState('');
  const [isListing, setIsListing] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);

  const extractFolderId = (url) => {
    if (!url) return null;
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

  const handleListFiles = async () => {
    if (!folderUrl.trim()) {
      setError('Please enter a Google Drive folder URL');
      return;
    }

    setIsListing(true);
    setError(null);
    setFiles([]);
    setSelectedFiles([]);

    try {
      const response = await axios.get(`${API_BASE_URL}/drive/list`, {
        params: { folderUrl: folderUrl.trim() }
      });

      if (response.data.success) {
        setFiles(response.data.files || []);
        if (response.data.files.length === 0) {
          setError('No audio files found in this folder');
        }
      }
    } catch (error) {
      console.error('Error listing files:', error);
      setError(
        error.response?.data?.error || 
        'Failed to list files. Make sure the folder is accessible and GOOGLE_API_KEY is configured.'
      );
    } finally {
      setIsListing(false);
    }
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to import');
      return;
    }

    setError(null);
    const fileIds = selectedFiles.map(f => f.id);

    try {
      const response = await axios.post(`${API_BASE_URL}/drive/import`, {
        folderUrl: folderUrl.trim(),
        fileIds: fileIds
      });

      if (response.data.success && response.data.chatMessage) {
        onImport(response.data.chatMessage);
        // Reset state
        setFolderUrl('');
        setFiles([]);
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Error importing files:', error);
      setError(
        error.response?.data?.error || 
        'Failed to import files from Google Drive'
      );
    }
  };

  const toggleFileSelection = (file) => {
    setSelectedFiles(prev => {
      const exists = prev.find(f => f.id === file.id);
      if (exists) {
        return prev.filter(f => f.id !== file.id);
      } else {
        return [...prev, file];
      }
    });
  };

  const selectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles([...files]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="google-drive-importer">
      <h2>Import from Google Drive</h2>
      
      <div className="drive-input-section">
        <input
          type="text"
          value={folderUrl}
          onChange={(e) => setFolderUrl(e.target.value)}
          placeholder="Paste Google Drive folder URL or folder ID"
          className="drive-url-input"
          disabled={isListing || isLoading}
        />
        <button
          onClick={handleListFiles}
          disabled={isListing || isLoading || !folderUrl.trim()}
          className="list-files-button"
        >
          {isListing ? 'Loading...' : 'List Files'}
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {files.length > 0 && (
        <div className="files-selection">
          <div className="selection-header">
            <button onClick={selectAll} className="select-all-button">
              {selectedFiles.length === files.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="selection-count">
              {selectedFiles.length} of {files.length} selected
            </span>
          </div>
          
          <div className="files-list">
            {files.map((file) => {
              const isSelected = selectedFiles.some(f => f.id === file.id);
              return (
                <div
                  key={file.id}
                  className={`file-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleFileSelection(file)}
                >
                  <div className="file-checkbox">
                    {isSelected && '✓'}
                  </div>
                  <div className="file-icon">🎵</div>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-meta">
                      {formatFileSize(file.size)} • {file.mimeType?.split('/')[1]?.toUpperCase() || 'AUDIO'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleImport}
            disabled={selectedFiles.length === 0 || isLoading}
            className="import-button"
          >
            {isLoading ? 'Importing...' : `Import ${selectedFiles.length} File(s)`}
          </button>
        </div>
      )}

      <div className="drive-help">
        <p className="help-text">
          💡 <strong>Tip:</strong> You can paste the full Google Drive folder URL or just the folder ID.
          <br />
          Example: <code>1FO4QKL20jKUZjV9QQhYCOrDH4pAwb6zi</code>
        </p>
      </div>
    </div>
  );
};

export default GoogleDriveImporter;

