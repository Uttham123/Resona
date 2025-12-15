import React, { useRef, useState } from 'react';
import './AudioUploader.css';

const AudioUploader = ({ onUpload, isLoading }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

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
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('audio/')
      );
      handleFiles(files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files) => {
    setSelectedFiles(files);
    onUpload(files);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    <div className="audio-uploader">
      <h2>Upload Audio Files</h2>
      
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${isLoading ? 'loading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">🎵</div>
          {isLoading ? (
            <p className="upload-text">Uploading...</p>
          ) : (
            <>
              <p className="upload-text">
                Drag & drop audio files here, or click to browse
              </p>
              <p className="upload-hint">
                Supports MP3, WAV, M4A, OGG, FLAC, and more
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileInput}
          className="file-input"
          disabled={isLoading}
        />
      </div>

      {selectedFiles.length > 0 && !isLoading && (
        <div className="selected-files">
          <h3>Selected Files ({selectedFiles.length})</h3>
          <div className="files-list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <span className="file-icon">🎧</span>
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{formatFileSize(file.size)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;

