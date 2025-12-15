import React, { useState, useEffect } from 'react';
import './GoogleDriveUploader.css';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

const GoogleDriveUploader = ({ onUpload, uploadedFiles = [] }) => {
  const [folderId, setFolderId] = useState('1MPvOKrcZGnw9lxUp4tb4SlOqTSQWPhbj'); // Default folder ID
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    // Load Google API script
    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', initGoogleAuth);
      };
      document.body.appendChild(script);
    } else {
      initGoogleAuth();
    }
  }, []);

  const initGoogleAuth = async () => {
    try {
      await window.gapi.load('client:auth2');
      
      // Initialize with minimal scopes - just need to upload files
      if (GOOGLE_CLIENT_ID) {
        await window.gapi.client.init({
          clientId: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file'
        });
      } else {
        // If no client ID, we'll use a simpler approach
        console.log('No Google Client ID configured. Using manual token input.');
      }
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      const token = user.getAuthResponse().access_token;
      setAccessToken(token);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Failed to authenticate with Google. Please try again.');
    }
  };

  const handleManualToken = (token) => {
    if (token && token.trim()) {
      setAccessToken(token.trim());
      setIsAuthenticated(true);
      setError(null);
    }
  };

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

  const handleFolderIdChange = (value) => {
    const extracted = extractFolderId(value);
    setFolderId(extracted || value);
  };

  const handleUpload = async () => {
    if (!folderId) {
      setError('Please enter a Google Drive folder ID');
      return;
    }

    if (!accessToken) {
      setError('Please authenticate with Google Drive first');
      return;
    }

    const filesToUpload = selectedFiles.length > 0 
      ? selectedFiles 
      : uploadedFiles.map(f => f.storedFilename || f.filename);

    if (filesToUpload.length === 0) {
      setError('No files selected to upload');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/drive/upload`, {
        folderId: folderId,
        fileIds: filesToUpload,
        accessToken: accessToken
      });

      if (response.data.success) {
        onUpload(response.data);
        setSelectedFiles([]);
        setError(null);
      }
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      const errorMsg = error.response?.data?.error || 'Failed to upload files to Google Drive';
      const hint = error.response?.data?.hint || '';
      const tip = error.response?.data?.tip || '';
      
      setError(
        `${errorMsg}${hint ? ' ' + hint : ''}${tip ? ' ' + tip : ''}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const toggleFileSelection = (filename) => {
    setSelectedFiles(prev => {
      const exists = prev.includes(filename);
      if (exists) {
        return prev.filter(f => f !== filename);
      } else {
        return [...prev, filename];
      }
    });
  };

  const selectAll = () => {
    if (selectedFiles.length === uploadedFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(uploadedFiles.map(f => f.storedFilename || f.filename));
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
    <div className="google-drive-uploader">
      <h2>Upload to Google Drive</h2>
      
      {!isAuthenticated ? (
        <div className="auth-section">
          {GOOGLE_CLIENT_ID ? (
            <button
              onClick={handleGoogleSignIn}
              className="google-signin-button"
              disabled={!window.gapi}
            >
              <span className="google-icon">🔐</span>
              Sign in with Google
            </button>
          ) : (
            <div className="manual-token-section">
              <p className="token-instruction">
                <strong>📝 Quick Setup (No Client ID needed!):</strong>
                <br />
                1. Go to{' '}
                <a 
                  href="https://developers.google.com/oauthplayground/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  OAuth Playground
                </a>
                <br />
                2. Find <strong>"Drive API v3"</strong> → Check <strong>"https://www.googleapis.com/auth/drive"</strong> scope
                <br />
                <small>⚠️ Use the full "drive" scope (not just "drive.file") to access existing folders</small>
                <br />
                3. Click <strong>"Authorize APIs"</strong> and sign in
                <br />
                4. Click <strong>"Exchange authorization code for tokens"</strong>
                <br />
                5. Copy the <strong>"Access token"</strong> and paste it below
                <br />
                <small>⚠️ Token expires in 1 hour - get a new one if needed</small>
              </p>
              <input
                type="text"
                placeholder="Paste your Google Drive access token here"
                className="token-input"
                onChange={(e) => handleManualToken(e.target.value)}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="authenticated-section">
          <div className="auth-status">
            <span className="auth-badge">✓ Authenticated</span>
            <button 
              onClick={() => {
                setIsAuthenticated(false);
                setAccessToken(null);
              }}
              className="signout-button"
            >
              Sign Out
            </button>
          </div>

          <div className="folder-input-section">
            <label>Google Drive Folder ID:</label>
            <input
              type="text"
              value={folderId}
              onChange={(e) => handleFolderIdChange(e.target.value)}
              placeholder="1MPvOKrcZGnw9lxUp4tb4SlOqTSQWPhbj"
              className="folder-id-input"
              disabled={isUploading}
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="files-selection">
              <div className="selection-header">
                <button onClick={selectAll} className="select-all-button">
                  {selectedFiles.length === uploadedFiles.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="selection-count">
                  {selectedFiles.length || uploadedFiles.length} of {uploadedFiles.length} file(s) will be uploaded
                </span>
              </div>
              
              <div className="files-list">
                {uploadedFiles.map((file, index) => {
                  const filename = file.storedFilename || file.filename;
                  const isSelected = selectedFiles.length === 0 || selectedFiles.includes(filename);
                  return (
                    <div
                      key={index}
                      className={`file-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleFileSelection(filename)}
                    >
                      <div className="file-checkbox">
                        {isSelected && '✓'}
                      </div>
                      <div className="file-icon">🎵</div>
                      <div className="file-info">
                        <div className="file-name">{file.filename}</div>
                        <div className="file-meta">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={isUploading || uploadedFiles.length === 0}
            className="upload-button"
          >
            {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length || uploadedFiles.length} File(s) to Drive`}
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="drive-help">
        <p className="help-text">
          💡 <strong>Tip:</strong> Paste the Google Drive folder URL or just the folder ID.
          <br />
          Example: <code>1MPvOKrcZGnw9lxUp4tb4SlOqTSQWPhbj</code>
        </p>
      </div>
    </div>
  );
};

export default GoogleDriveUploader;

