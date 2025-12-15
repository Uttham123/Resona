import React, { useState, useRef } from 'react';
import './ResearchNotebookForm.css';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const ResearchNotebookForm = ({ onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    goal: '',
    date: '',
    researchers: '',
    userCohorts: '',
    methodology: '',
    audioFiles: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (files) => {
    const audioFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/')
    );
    setFormData(prev => ({
      ...prev,
      audioFiles: [...prev.audioFiles, ...audioFiles]
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      audioFiles: prev.audioFiles.filter((_, i) => i !== index)
    }));
  };

  const handleManualToken = (token) => {
    if (token && token.trim()) {
      setAccessToken(token.trim());
      setIsAuthenticated(true);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.goal.trim()) {
      setError('Goal/Aim of research is required');
      return;
    }
    if (!formData.date) {
      setError('Date of research is required');
      return;
    }
    if (!formData.researchers.trim()) {
      setError('Researchers field is required');
      return;
    }
    if (!formData.userCohorts.trim()) {
      setError('User cohorts field is required');
      return;
    }
    if (!formData.methodology) {
      setError('Research methodology is required');
      return;
    }
    if (formData.audioFiles.length === 0) {
      setError('At least one audio file is required');
      return;
    }
    if (!accessToken) {
      setError('Please authenticate with Google Drive first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress({ step: 'uploading', message: 'Uploading audio files to server...', progress: 0 });

    try {
      // First upload audio files to server
      const formDataToSend = new FormData();
      formData.audioFiles.forEach(file => {
        formDataToSend.append('audioFiles', file);
      });

      setProgress({ step: 'uploading', message: 'Uploading audio files...', progress: 10 });

      const uploadResponse = await axios.post(`${API_BASE_URL}/upload`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResponse.data.files || uploadResponse.data.files.length === 0) {
        throw new Error('Failed to upload audio files');
      }

      setProgress({ step: 'creating', message: 'Creating project folder in Google Drive...', progress: 30 });

      // Now create the notebook in Google Drive (this is async, so we start it and poll for progress)
      const notebookResponse = await axios.post(`${API_BASE_URL}/notebook/create`, {
        projectName: formData.goal.trim(),
        date: formData.date,
        researchers: formData.researchers.trim(),
        userCohorts: formData.userCohorts.trim(),
        methodology: formData.methodology,
        audioFileIds: uploadResponse.data.files.map(f => f.storedFilename),
        accessToken: accessToken
      });

      // Check if request failed immediately
      if (!notebookResponse.data.success && !notebookResponse.data.progressId) {
        throw new Error(notebookResponse.data.error || 'Failed to create notebook');
      }

      // Start polling for progress updates
      const progressId = notebookResponse.data.progressId;
      if (progressId) {
        let progressInterval = setInterval(async () => {
          try {
            const progressResponse = await axios.get(`${API_BASE_URL}/notebook/progress/${progressId}`);
            const progressData = progressResponse.data;
            setProgress({
              step: progressData.step,
              message: progressData.message,
              progress: progressData.progress
            });

            // Stop polling when complete
            if (progressData.step === 'complete' || progressData.progress >= 100) {
              clearInterval(progressInterval);
              progressInterval = null;
              setTimeout(() => {
                onSuccess(notebookResponse.data);
              }, 500);
            }
          } catch (err) {
            // If progress not found, might be complete or error
            if (err.response?.status === 404) {
              clearInterval(progressInterval);
              progressInterval = null;
              // Assume it completed
              if (notebookResponse.data.success) {
                setProgress({ step: 'complete', message: 'Notebook created successfully!', progress: 100 });
                setTimeout(() => {
                  onSuccess(notebookResponse.data);
                }, 500);
              }
            } else {
              console.error('Error fetching progress:', err);
              // Continue polling even if one request fails
            }
          }
        }, 500); // Poll every 500ms for real-time updates

        // Set a timeout to stop polling after 5 minutes (safety)
        setTimeout(() => {
          if (progressInterval) {
            clearInterval(progressInterval);
          }
        }, 300000);
      } else {
        // Fallback if no progressId (shouldn't happen, but handle gracefully)
        if (notebookResponse.data.success) {
          setProgress({ step: 'complete', message: 'Notebook created successfully!', progress: 100 });
          setTimeout(() => {
            onSuccess(notebookResponse.data);
          }, 500);
        } else {
          throw new Error(notebookResponse.data.error || 'Failed to create notebook');
        }
      }
    } catch (error) {
      console.error('Error creating notebook:', error);
      setProgress(null);
      setError(
        error.response?.data?.error || 
        error.message || 
        'Failed to create research notebook'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="research-notebook-form">
      <div className="form-header">
        <h2>Create New Research Notebook</h2>
        <button onClick={onCancel} className="cancel-button">Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="notebook-form">
        {/* Goal/Aim */}
        <div className="form-group">
          <label htmlFor="goal">
            Goal/Aim of the Research <span className="required">*</span>
          </label>
          <textarea
            id="goal"
            value={formData.goal}
            onChange={(e) => handleInputChange('goal', e.target.value)}
            placeholder="Enter the goal or aim of your research..."
            rows={3}
            required
          />
          <small>This will be used as the project name</small>
        </div>

        {/* Date */}
        <div className="form-group">
          <label htmlFor="date">
            Date of the Research <span className="required">*</span>
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
          />
        </div>

        {/* Researchers */}
        <div className="form-group">
          <label htmlFor="researchers">
            Researchers <span className="required">*</span>
          </label>
          <input
            type="text"
            id="researchers"
            value={formData.researchers}
            onChange={(e) => handleInputChange('researchers', e.target.value)}
            placeholder="Enter researcher names (comma-separated)"
            required
          />
        </div>

        {/* User Cohorts */}
        <div className="form-group">
          <label htmlFor="userCohorts">
            User Cohorts <span className="required">*</span>
          </label>
          <input
            type="text"
            id="userCohorts"
            value={formData.userCohorts}
            onChange={(e) => handleInputChange('userCohorts', e.target.value)}
            placeholder="Describe the user cohorts"
            required
          />
        </div>

        {/* Research Methodology */}
        <div className="form-group">
          <label htmlFor="methodology">
            Research Methodology <span className="required">*</span>
          </label>
          <select
            id="methodology"
            value={formData.methodology}
            onChange={(e) => handleInputChange('methodology', e.target.value)}
            required
          >
            <option value="">Select methodology</option>
            <option value="In-person research">In-person research</option>
            <option value="Remote research">Remote research</option>
          </select>
        </div>

        {/* Audio Files */}
        <div className="form-group">
          <label>
            Audio Files <span className="required">*</span>
          </label>
          <div
            className={`audio-upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <div className="upload-icon">🎵</div>
              <p>Drag & drop audio files here, or click to browse</p>
              <small>Supports MP3, WAV, M4A, OGG, FLAC, and more</small>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="audio/*"
              onChange={handleFileInput}
              className="file-input"
            />
          </div>

          {formData.audioFiles.length > 0 && (
            <div className="selected-files-list">
              {formData.audioFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-icon">🎧</span>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{formatFileSize(file.size)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="remove-file-button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Google Drive Authentication */}
        <div className="form-group">
          <label>Google Drive Authentication</label>
          {!isAuthenticated ? (
            <div className="auth-section">
              {GOOGLE_CLIENT_ID ? (
                <button
                  type="button"
                  className="google-signin-button"
                  disabled
                >
                  <span className="google-icon">🔐</span>
                  Sign in with Google
                </button>
              ) : (
                <div className="manual-token-section">
                  <p className="token-instruction">
                    Get an access token from{' '}
                    <a 
                      href="https://developers.google.com/oauthplayground/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      OAuth Playground
                    </a>
                    {' '}(select Drive API v3, scope: https://www.googleapis.com/auth/drive)
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
            <div className="auth-status">
              <span className="auth-badge">✓ Authenticated</span>
              <button 
                type="button"
                onClick={() => {
                  setIsAuthenticated(false);
                  setAccessToken(null);
                }}
                className="signout-button"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {progress && (
          <div className="progress-section">
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${progress.progress}%` }}
              ></div>
            </div>
            <p className="progress-message">{progress.message}</p>
          </div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={isUploading || !isAuthenticated}
            className="submit-button"
          >
            {isUploading ? 'Creating Notebook...' : 'Create Research Notebook'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResearchNotebookForm;

