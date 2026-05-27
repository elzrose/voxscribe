const mongoose = require('mongoose');

const TranscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'Owner User ID is required to save transcriptions']
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original name is required']
  },
  size: {
    type: Number,
    required: true
  },
  transcriptionText: {
    type: String,
    default: 'Processing transcription...' 
  },
  createdAt: {
    type: Date,
    default: Date.now 
  }
});

module.exports = mongoose.model('Transcription', TranscriptionSchema);