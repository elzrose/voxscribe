const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Node to use Google's Public DNS
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose'); // 1. Import Mongoose
require('dotenv').config();

// Import our new Transcription model blueprint
const Transcription = require('./models/Transcription'); // 2. Import Model

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 3. CONNECT TO MONGOOSE ATLAS
// Connects our Express server to the MongoDB database in the cloud!
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🔌 Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error('❌ Database connection error:', err));

// MULTER CONFIGURATION
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'audio/mpeg', 'audio/wav', 'audio/x-wav', 
    'audio/webm', 'audio/m4a', 'audio/x-m4a'
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP3, WAV, and M4A audio files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'VoxScribe Server is fully operational!' });
});

// 4. GET ROUTE: Fetch Transcription History
// Returns all historical transcripts saved in our database, newest first
app.get('/api/transcriptions', async (req, res) => {
  try {
    // Find all records and sort them by 'createdAt' in descending order (-1)
    const history = await Transcription.find().sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. POST ROUTE: Handle Audio Uploads & Save to Database
// Note: We added the 'async' keyword to the function so we can use 'await' inside!
app.post('/api/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please select an audio file.' });
    }

    // A placeholder transcription text for Day 3. 
    // On Day 4, we will send this file to Deepgram to get the REAL text!
    const placeholderText = "This is a placeholder transcript for Day 3! Audio received and stored successfully.";

    // Save the file metadata & transcript to our MongoDB Database!
    const newRecord = await Transcription.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      transcriptionText: placeholderText
    });

    // Return the saved database document back to the client!
    res.status(200).json({
      message: 'Audio file uploaded and saved to database successfully!',
      transcription: newRecord
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});