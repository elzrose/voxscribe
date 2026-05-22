const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure the 'uploads' directory exists
// If the folder doesn't exist, our server will create it automatically!
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 1. MULTER STORAGE CONFIGURATION
const storage = multer.diskStorage({
  // Tell Multer to save files inside our 'uploads' folder
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  // Generate a completely unique name for each uploaded file
  // Example: 1716382049821-audio.mp3
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. MULTER FILE FILTER (Security Check)
const fileFilter = (req, file, cb) => {
  // List of allowed audio formats
  const allowedMimeTypes = [
    'audio/mpeg',     // for .mp3
    'audio/wav',      // for .wav
    'audio/x-wav',    // alternate .wav mimetype
    'audio/webm',     // for live browser recordings (.webm)
    'audio/m4a',      // for .m4a
    'audio/x-m4a'     // alternate .m4a mimetype
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    // Reject the file with an error
    cb(new Error('Invalid file type. Only MP3, WAV, and M4A audio files are allowed!'), false);
  }
};

// 3. INITIALIZE MULTER
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Limit files to a maximum of 10MB
});

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'VoxScribe Server is fully operational!' });
});

// 4. POST ROUTE FOR AUDIO FILE UPLOADS
// 'upload.single("audio")' tells Multer to look for a single file named "audio" in the incoming request
app.post('/api/upload', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please select an audio file.' });
    }

    // Return a success response with the saved file details
    res.status(200).json({
      message: 'Audio file uploaded successfully!',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});