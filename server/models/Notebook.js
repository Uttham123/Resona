const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const NotebookSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  researchers: {
    type: [String],
    required: true,
    default: []
  },
  userCohorts: {
    type: String,
    required: true,
    trim: true
  },
  methodology: {
    type: String,
    required: true,
    enum: ['In-person research', 'Remote research'],
    trim: true
  },
  audioFileCount: {
    type: Number,
    required: true,
    default: 0
  },
  googleDriveFolderId: {
    type: String,
    required: true
  },
  googleDriveFolderUrl: {
    type: String,
    required: true
  },
  insights: {
    type: [NoteSchema],
    default: []
  },
  opportunities: {
    type: [NoteSchema],
    default: []
  },
  painPoints: {
    type: [NoteSchema],
    default: []
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for faster searches
NotebookSchema.index({ projectName: 'text', userCohorts: 'text' });
NotebookSchema.index({ date: -1 }); // For sorting by date
NotebookSchema.index({ createdAt: -1 }); // For sorting by creation time

const Notebook = mongoose.model('Notebook', NotebookSchema);

module.exports = Notebook;

