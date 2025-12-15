import React, { useState, useRef } from 'react';
import './ChatInterface.css';

const ChatInterface = ({ messages, onSendMessage, messagesEndRef }) => {
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>Chat</h2>
        <span className="message-count">{messages.length} messages</span>
      </div>

      <div className="chat-messages" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>No messages yet. Start a conversation or upload audio files!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                {message.type === 'system' && message.files && (
                  <div className="files-preview">
                    <div className="files-header">
                      <span className="files-icon">📁</span>
                      <strong>Uploaded {message.files.length} file(s)</strong>
                    </div>
                    <div className="files-grid">
                      {message.files.map((file) => (
                        <div key={file.id} className="file-card">
                          <div className="file-card-icon">🎵</div>
                          <div className="file-card-info">
                            <div className="file-card-name">{file.filename}</div>
                            <div className="file-card-meta">
                              {formatFileSize(file.size)} • {file.mimetype.split('/')[1].toUpperCase()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {message.content && (
                  <div className="message-text">{message.content}</div>
                )}
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
        />
        <button type="submit" className="send-button" disabled={!inputValue.trim()}>
          <span className="send-icon">➤</span>
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;

