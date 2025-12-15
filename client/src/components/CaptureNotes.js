import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CaptureNotes.css';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const CaptureNotes = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    goal: '',
    date: '',
    researchers: [],
    researcherInput: '',
    userCohorts: '',
    researchType: '',
    audioFiles: [],
    googleToken: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResearcherKeyDown = (e) => {
    if (e.key === 'Enter' && formData.researcherInput.trim() && formData.researchers.length < 8) {
      e.preventDefault();
      const newResearcher = formData.researcherInput.trim();
      if (!formData.researchers.includes(newResearcher)) {
        setFormData(prev => ({
          ...prev,
          researchers: [...prev.researchers, newResearcher],
          researcherInput: ''
        }));
      }
    }
  };

  const removeResearcher = (index) => {
    setFormData(prev => ({
      ...prev,
      researchers: prev.researchers.filter((_, i) => i !== index)
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files);
    }
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      audioFiles: prev.audioFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.goal.trim()) {
      setError('Goal/Objective is required');
      return;
    }
    if (!formData.date) {
      setError('Date of Research is required');
      return;
    }
    if (formData.researchers.length === 0) {
      setError('At least one researcher is required');
      return;
    }
    if (!formData.userCohorts.trim()) {
      setError('User Cohorts are required');
      return;
    }
    if (!formData.researchType) {
      setError('Research Type is required');
      return;
    }
    if (formData.audioFiles.length === 0) {
      setError('At least one audio file is required');
      return;
    }
    if (!formData.googleToken.trim()) {
      setError('Google Authentication token is required');
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

      // Map researchType to methodology
      const methodologyMap = {
        'In-person research': 'In-person research',
        'Remote research': 'Remote research'
      };
      const methodology = methodologyMap[formData.researchType] || formData.researchType;

      // Now create the notebook in Google Drive
      const notebookResponse = await axios.post(`${API_BASE_URL}/notebook/create`, {
        projectName: formData.goal.trim(),
        date: formData.date,
        researchers: formData.researchers.join(', '),
        userCohorts: formData.userCohorts.trim(),
        methodology: methodology,
        audioFileIds: uploadResponse.data.files.map(f => f.storedFilename),
        accessToken: formData.googleToken.trim()
      });

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

            if (progressData.step === 'complete' || progressData.progress >= 100) {
              clearInterval(progressInterval);
              progressInterval = null;
              setTimeout(() => {
                navigate('/');
              }, 500);
            }
          } catch (err) {
            if (err.response?.status === 404) {
              clearInterval(progressInterval);
              progressInterval = null;
              if (notebookResponse.data.success) {
                setProgress({ step: 'complete', message: 'Notebook created successfully!', progress: 100 });
                setTimeout(() => {
                  navigate('/');
                }, 500);
              }
            }
          }
        }, 500);

        setTimeout(() => {
          if (progressInterval) {
            clearInterval(progressInterval);
          }
        }, 300000);
      } else {
        if (notebookResponse.data.success) {
          setProgress({ step: 'complete', message: 'Notebook created successfully!', progress: 100 });
          setTimeout(() => {
            navigate('/');
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

  return (
    <div className="capture-notes">
      {/* Header */}
      <div className="capture-header">
        <div className="header-content">
          <div className="user-section">
            <div className="user-profile">
              <div className="user-avatar">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" 
                  alt="User" 
                  className="avatar-image"
                />
              </div>
              <div className="user-info">
                <p className="user-name">Uttham Udatthu</p>
                <div className="user-badges">
                  <span className="badge badge-yellow">VSKU</span>
                  <span className="badge badge-yellow">Gen-AI Research</span>
                </div>
              </div>
            </div>
          </div>
          <div className="action-icons">
            <button className="icon-button">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 2L13.09 8.26L20 9.27L14 13.14L15.18 20.02L11 16.77L6.82 20.02L8 13.14L2 9.27L8.91 8.26L11 2Z" stroke="#333" strokeWidth="1.5" fill="none"/>
              </svg>
            </button>
            <button className="icon-button">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.7258 7.34056C12.1397 7.32632 12.4638 6.97919 12.4495 6.56522C12.4353 6.15125 12.0882 5.8272 11.6742 5.84144L11.7258 7.34056ZM7.15843 11.562L6.40879 11.585C6.40906 11.5938 6.40948 11.6026 6.41006 11.6114L7.15843 11.562ZM5.87826 14.979L6.36787 15.5471C6.38128 15.5356 6.39428 15.5236 6.40684 15.5111L5.87826 14.979ZM5.43951 15.342L5.88007 15.949C5.89245 15.94 5.90455 15.9306 5.91636 15.9209L5.43951 15.342ZM9.74998 17.75C10.1642 17.75 10.5 17.4142 10.5 17C10.5 16.5858 10.1642 16.25 9.74998 16.25V17.75ZM11.7258 5.84144C11.3118 5.8272 10.9647 6.15125 10.9504 6.56522C10.9362 6.97919 11.2602 7.32632 11.6742 7.34056L11.7258 5.84144ZM16.2415 11.562L16.9899 11.6113C16.9905 11.6025 16.9909 11.5938 16.9912 11.585L16.2415 11.562ZM17.5217 14.978L16.9931 15.5101C17.0057 15.5225 17.0187 15.5346 17.0321 15.5461L17.5217 14.978ZM17.9605 15.341L17.4836 15.9199C17.4952 15.9294 17.507 15.9386 17.5191 15.9474L17.9605 15.341ZM13.65 16.25C13.2358 16.25 12.9 16.5858 12.9 17C12.9 17.4142 13.2358 17.75 13.65 17.75V16.25ZM10.95 6.591C10.95 7.00521 11.2858 7.341 11.7 7.341C12.1142 7.341 12.45 7.00521 12.45 6.591H10.95ZM12.45 5C12.45 4.58579 12.1142 4.25 11.7 4.25C11.2858 4.25 10.95 4.58579 10.95 5H12.45ZM9.74998 16.25C9.33577 16.25 8.99998 16.5858 8.99998 17C8.99998 17.4142 9.33577 17.75 9.74998 17.75V16.25ZM13.65 17.75C14.0642 17.75 14.4 17.4142 14.4 17C14.4 16.5858 14.0642 16.25 13.65 16.25V17.75ZM10.5 17C10.5 16.5858 10.1642 16.25 9.74998 16.25C9.33577 16.25 8.99998 16.5858 8.99998 17H10.5ZM14.4 17C14.4 16.5858 14.0642 16.25 13.65 16.25C13.2358 16.25 12.9 16.5858 12.9 17H14.4ZM11.6742 5.84144C8.65236 5.94538 6.31509 8.53201 6.40879 11.585L7.90808 11.539C7.83863 9.27613 9.56498 7.41488 11.7258 7.34056L11.6742 5.84144ZM6.41006 11.6114C6.48029 12.6748 6.08967 13.7118 5.34968 14.4469L6.40684 15.5111C7.45921 14.4656 8.00521 13.0026 7.9068 11.5126L6.41006 11.6114ZM5.38865 14.4109C5.23196 14.5459 5.10026 14.6498 4.96265 14.7631L5.91636 15.9209C6.0264 15.8302 6.195 15.6961 6.36787 15.5471L5.38865 14.4109ZM4.99895 14.735C4.77969 14.8942 4.58045 15.1216 4.43193 15.3617C4.28525 15.5987 4.14491 15.9178 4.12693 16.2708C4.10726 16.6569 4.24026 17.0863 4.63537 17.3884C4.98885 17.6588 5.45464 17.75 5.94748 17.75V16.25C5.78415 16.25 5.67611 16.234 5.60983 16.2171C5.54411 16.2004 5.53242 16.1861 5.54658 16.1969C5.56492 16.211 5.59211 16.2408 5.61004 16.2837C5.62632 16.3228 5.62492 16.3484 5.62499 16.3472C5.62513 16.3443 5.62712 16.3233 5.6414 16.2839C5.65535 16.2454 5.67733 16.1997 5.70749 16.151C5.73748 16.1025 5.77159 16.0574 5.80538 16.0198C5.84013 15.981 5.86714 15.9583 5.88007 15.949L4.99895 14.735ZM5.94748 17.75H9.74998V16.25H5.94748V17.75ZM11.6742 7.34056C13.835 7.41488 15.5613 9.27613 15.4919 11.539L16.9912 11.585C17.0849 8.53201 14.7476 5.94538 11.7258 5.84144L11.6742 7.34056ZM15.4932 11.5127C15.3951 13.0024 15.9411 14.4649 16.9931 15.5101L18.0503 14.4459C17.3105 13.711 16.9199 12.6744 16.9899 11.6113L15.4932 11.5127ZM17.0321 15.5461C17.205 15.6951 17.3736 15.8292 17.4836 15.9199L18.4373 14.7621C18.2997 14.6488 18.168 14.5449 18.0113 14.4099L17.0321 15.5461ZM17.5191 15.9474C17.5325 15.9571 17.5599 15.9802 17.5949 16.0193C17.629 16.0573 17.6634 16.1026 17.6937 16.1514C17.7241 16.2004 17.7463 16.2463 17.7604 16.285C17.7748 16.3246 17.7769 16.3457 17.777 16.3485C17.7771 16.3497 17.7756 16.3238 17.792 16.2844C17.81 16.241 17.8375 16.211 17.856 16.1968C17.8702 16.1859 17.8585 16.2002 17.7925 16.217C17.7259 16.234 17.6174 16.25 17.4535 16.25V17.75C17.9468 17.75 18.4132 17.6589 18.7669 17.3885C19.1628 17.0859 19.2954 16.6557 19.2749 16.2693C19.2562 15.9161 19.1151 15.5972 18.9682 15.3604C18.8194 15.1206 18.6202 14.8936 18.4018 14.7346L17.5191 15.9474ZM17.4535 16.25H13.65V17.75H17.4535V16.25ZM12.45 6.591V5H10.95V6.591H12.45ZM9.74998 17.75H13.65V16.25H9.74998V17.75ZM8.99998 17C8.99998 18.5008 10.191 19.75 11.7 19.75V18.25C11.055 18.25 10.5 17.7084 10.5 17H8.99998ZM11.7 19.75C13.2089 19.75 14.4 18.5008 14.4 17H12.9C12.9 17.7084 12.3449 18.25 11.7 18.25V19.75Z" fill="#333"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="capture-form">
        <h1 className="form-title">New Notes</h1>

        <form onSubmit={handleSubmit}>
          {/* Goal/Objective */}
          <div className="form-field">
            <label className="field-label">Goal/ Objective</label>
            <input
              type="text"
              className="form-input"
              placeholder="Goal of the Research"
              value={formData.goal}
              onChange={(e) => handleInputChange('goal', e.target.value)}
            />
          </div>

          {/* Date of Research */}
          <div className="form-field">
            <label className="field-label">Date of Research</label>
            <div className="date-input-wrapper">
              <input
                type="date"
                className="form-input"
                placeholder="Date.."
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
              <svg className="calendar-icon" width="20" height="18" viewBox="0 0 20 18" fill="none">
                <path d="M16 2H4C2.89543 2 2 2.89543 2 4V16C2 17.1046 2.89543 18 4 18H16C17.1046 18 18 17.1046 18 16V4C18 2.89543 17.1046 2 16 2Z" stroke="#8B8BA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 6H18" stroke="#8B8BA3" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M6 1V4" stroke="#8B8BA3" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M14 1V4" stroke="#8B8BA3" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Researchers */}
          <div className="form-field">
            <label className="field-label">Researchers</label>
            <div className="researchers-input-wrapper">
              {formData.researchers.map((researcher, index) => (
                <span key={index} className="researcher-chip">
                  {researcher}
                  <button
                    type="button"
                    onClick={() => removeResearcher(index)}
                    className="chip-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
              {formData.researchers.length < 8 && (
                <input
                  type="text"
                  className="form-input researchers-input"
                  placeholder={formData.researchers.length === 0 ? "Researchers' names.." : "Add another researcher"}
                  value={formData.researcherInput}
                  onChange={(e) => handleInputChange('researcherInput', e.target.value)}
                  onKeyDown={handleResearcherKeyDown}
                />
              )}
            </div>
            {formData.researchers.length >= 8 && (
              <p className="chip-limit-message">Maximum 8 researchers allowed</p>
            )}
          </div>

          {/* User Cohorts */}
          <div className="form-field">
            <label className="field-label">User Cohorts</label>
            <input
              type="text"
              className="form-input"
              placeholder="Type of users"
              value={formData.userCohorts}
              onChange={(e) => handleInputChange('userCohorts', e.target.value)}
            />
          </div>

          {/* Research Type */}
          <div className="form-field">
            <label className="field-label">Research Type</label>
            <div className="select-wrapper">
              <select
                className="form-input form-select"
                value={formData.researchType}
                onChange={(e) => handleInputChange('researchType', e.target.value)}
              >
                <option value="">Type of research</option>
                <option value="In-person research">In-person research</option>
                <option value="Remote research">Remote research</option>
              </select>
              <svg className="select-arrow" width="12" height="7" viewBox="0 0 12 7" fill="none">
                <path d="M1 1L6 6L11 1" stroke="#8B8BA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Audio Files */}
          <div className="form-field">
            <label className="field-label">Audio Files</label>
            <div
              className={`audio-upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="upload-text">Add Audio Files</p>
              <svg className="upload-icon" width="26" height="20" viewBox="0 0 26 20" fill="none">
                <rect width="26" height="20" rx="2" fill="#9F2089" fillOpacity="0.1"/>
                <path d="M13 6V14M9 10L13 6L17 10" stroke="#9F2089" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="audio/*"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
            {formData.audioFiles.length > 0 && (
              <div className="file-list">
                {formData.audioFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="remove-file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Google Authentication token */}
          <div className="form-field">
            <label className="field-label">Google Authentication token</label>
            <input
              type="text"
              className="form-input"
              placeholder="Google aunthentication token"
              value={formData.googleToken}
              onChange={(e) => handleInputChange('googleToken', e.target.value)}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">{error}</div>
          )}

          {/* Loading Screen Overlay */}
          {(isUploading || progress) && (
            <div className="loading-overlay">
              <div className="loading-background">
                <div className="animated-circle circle-1"></div>
                <div className="animated-circle circle-2"></div>
                <div className="animated-circle circle-3"></div>
              </div>
              <div className="loading-content">
                <div className="voice-waves">
                  <div className="wave-bar wave-1"></div>
                  <div className="wave-bar wave-2"></div>
                  <div className="wave-bar wave-3"></div>
                  <div className="wave-bar wave-4"></div>
                  <div className="wave-bar wave-5"></div>
                  <div className="wave-bar wave-6"></div>
                  <div className="wave-bar wave-7"></div>
                </div>
                <p className="loading-message">{progress?.message || 'Analyzing audio files...'}</p>
                {progress && (
                  <div className="progress-bar-mini">
                    <div 
                      className="progress-fill-mini" 
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-bar">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/')}
              disabled={isUploading}
            >
              Go Back
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUploading}
            >
              Proceed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaptureNotes;

