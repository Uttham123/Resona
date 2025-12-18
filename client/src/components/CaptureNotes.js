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
    observations: '',
    observationFile: null,
    googleToken: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const fileInputRef = useRef(null);
  const observationFileInputRef = useRef(null);
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

  const handleObservationFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Only allow text files or common document formats
      if (file.type.startsWith('text/') || 
          file.type === 'application/pdf' || 
          file.type === 'application/msword' ||
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFormData(prev => ({
          ...prev,
          observationFile: file
        }));
      } else {
        setError('Please upload a text file or document');
      }
    }
  };

  const removeObservationFile = () => {
    setFormData(prev => ({
      ...prev,
      observationFile: null
    }));
    if (observationFileInputRef.current) {
      observationFileInputRef.current.value = '';
    }
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_24_609)">
                  <path d="M7.76807 4.56C8.83807 4.56 9.85807 5.04 10.7881 5.99C11.1081 6.31 11.5481 6.5 11.9981 6.5C12.4481 6.5 12.8881 6.32 13.2081 5.99C14.1381 5.04 15.1581 4.57 16.2281 4.57C17.8281 4.57 19.3781 5.68 20.0781 7.32C20.8081 9.04 20.4081 10.89 18.9681 12.39L12.4181 19.25C12.2681 19.4 12.1081 19.44 11.9981 19.44C11.8881 19.44 11.7281 19.41 11.5781 19.25L5.02807 12.39C3.58807 10.88 3.18807 9.03 3.91807 7.31C4.61807 5.67 6.16807 4.56 7.76807 4.56ZM7.76807 3C3.28807 3 -0.381933 8.98 3.90807 13.47L10.4581 20.33C10.8781 20.78 11.4381 21 11.9981 21C12.5581 21 13.1181 20.78 13.5381 20.33L20.0881 13.47C24.3681 8.99 20.6981 3 16.2181 3C14.8481 3 13.4081 3.56 12.0981 4.89C12.0681 4.92 12.0381 4.93 11.9981 4.93C11.9581 4.93 11.9281 4.92 11.8981 4.89C10.5881 3.56 9.13807 3 7.76807 3Z" fill="#616173"/>
                </g>
                <defs>
                  <clipPath id="clip0_24_609">
                    <rect width="20" height="18" fill="white" transform="translate(2 3)"/>
                  </clipPath>
                </defs>
              </svg>
            </button>
            <button className="icon-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M10.3942 5.02194L11.2517 4.73692L11.4094 3.88146C11.4455 3.68775 11.6508 3.48047 11.9657 3.48047C12.2772 3.48047 12.4826 3.68364 12.5208 3.87571L12.6913 4.72828L13.5519 5.00178C15.4473 5.60472 16.773 7.26792 16.773 9.18735C16.773 9.24164 16.7722 9.29593 16.77 9.34981L16.7692 9.37736V9.40492V13.8537C16.7692 14.6635 17.1468 15.4305 17.7985 15.9463L18.9928 16.8902H5.00784L6.20171 15.9459C6.853 15.4301 7.23019 14.6631 7.23019 13.8541V9.12196L7.23535 9.07877L7.23792 9.02161C7.30967 7.19512 8.5856 5.62322 10.3942 5.02194ZM4.29114 18.3701C3.08351 18.3701 2.5392 16.9224 3.47016 16.1862L5.21608 14.8047C5.51208 14.5703 5.68349 14.2215 5.68349 13.8538V9.10852C5.68349 9.0604 5.6865 9.01269 5.69209 8.9658C5.78961 6.49567 7.51061 4.41337 9.88676 3.62331C10.0569 2.70164 10.923 2 11.9652 2C12.998 2 13.8568 2.68848 14.0389 3.59699C16.5281 4.3887 18.3187 6.59232 18.3187 9.18707C18.3187 9.25987 18.3174 9.33225 18.3144 9.40463V13.8534C18.3144 14.2215 18.4862 14.5703 18.7826 14.8047L20.5294 16.1858C21.4608 16.922 20.9169 18.3701 19.7093 18.3701H4.29114ZM12 20.5206C11.3667 20.5206 10.8001 20 10.8001 19.293H9.25393C9.25393 20.7596 10.4538 22.0008 12 22.0008C13.5457 22.0008 14.7456 20.7596 14.7456 19.293H13.1994C13.1994 20 12.6328 20.5206 12 20.5206Z" fill="#616173"/>
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
            <label className="field-label">
              Goal/ Objective <span className="required-asterisk">*</span>
            </label>
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
            <label className="field-label">
              Date of Research <span className="required-asterisk">*</span>
            </label>
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
            <label className="field-label">
              Researchers <span className="required-asterisk">*</span>
            </label>
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
            <label className="field-label">
              User Cohorts <span className="required-asterisk">*</span>
            </label>
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
            <label className="field-label">
              Research Type <span className="required-asterisk">*</span>
            </label>
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
            <label className="field-label">
              Add Audio Files <span className="required-asterisk">*</span>
            </label>
            <div
              className={`audio-upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="upload-text">Add Audio Files</p>
              <div className="audio-icon-wrapper">
                <svg className="audio-icon-base" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_65_715)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.4709 1.64792V26.3542H13.6593L7.07095 19.7659H2.47064C1.10848 19.7659 0 18.6574 0 17.2953V10.7069C0 9.34475 1.10848 8.23628 2.47064 8.23628H7.07095L13.6593 1.64792H16.4709ZM14.8238 3.295H14.3412L8.23544 9.40075V18.6014L14.3412 24.7071H14.8238V3.29502V3.295ZM24.383 5.26542C26.7153 7.59933 28 10.7008 28 14.0016C28 17.3007 26.7153 20.4022 24.383 22.7361L23.2185 21.5716C25.2411 19.549 26.3529 16.8609 26.3529 14.0016C26.3529 11.1406 25.2411 8.45253 23.2185 6.42991L24.383 5.26542ZM20.8959 8.7617C22.291 10.1765 23.0586 12.0378 23.0586 14.0011C23.0586 15.9644 22.291 17.8256 20.8959 19.2405L19.7216 18.0842C20.8119 16.979 21.4115 15.5296 21.4115 14.0011C21.4115 12.4726 20.8119 11.0232 19.7216 9.91795L20.8959 8.7617ZM6.58836 9.88336H2.47064C2.01768 9.88336 1.64709 10.2523 1.64709 10.7069V17.2953C1.64709 17.7498 2.01768 18.1188 2.47064 18.1188H6.58836V9.88336Z" fill="#D9A6D0"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_65_715">
                      <rect width="28" height="28" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                <div className="audio-icon-badge">
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="4.5" cy="4.5" r="4.5" fill="#9F2089"/>
                    <path d="M4.5 2.5V6.5M2.5 4.5H6.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
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

          {/* Add Observations */}
          <div className="form-field">
            <label className="field-label">Add Observations</label>
            <div className="observations-input-wrapper">
              <input
                type="text"
                className="form-input observations-input"
                placeholder="Type or Upload text notes"
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
              />
              <button
                type="button"
                className="attach-button"
                onClick={() => observationFileInputRef.current?.click()}
                title="Upload text file"
              >
                <svg width="27" height="29" viewBox="0 0 27 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.2194 12.9995L11.9534 17.7952C11.5916 18.2207 11.0766 18.4668 10.5339 18.4735C9.99134 18.4801 9.47102 18.2466 9.09983 17.8301C8.27986 16.9292 8.29363 15.504 9.13084 14.621L14.8605 8.1724C15.4926 7.43191 16.3921 7.00642 17.3379 7.00064C18.2836 6.99485 19.1878 7.4093 19.8279 8.14202C21.1935 9.73009 21.1837 12.1517 19.8055 13.7276L13.7304 20.5587C12.8659 21.472 11.6824 21.9709 10.4578 21.9383C9.23317 21.9058 8.07517 21.3447 7.2555 20.3865C5.38194 18.1625 5.42828 14.802 7.36242 12.6361L13.1006 6.18865" stroke="#616173" strokeWidth="1.68" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <input
                ref={observationFileInputRef}
                type="file"
                accept=".txt,.doc,.docx,.pdf"
                onChange={handleObservationFileSelect}
                style={{ display: 'none' }}
              />
            </div>
            {formData.observationFile && (
              <div className="observation-file-item">
                <span>{formData.observationFile.name}</span>
                <button
                  type="button"
                  onClick={removeObservationFile}
                  className="remove-file"
                >
                  ×
                </button>
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

