const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Node to use Google's Public DNS

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose');
const { DeepgramClient } = require('@deepgram/sdk'); // 1. Import Deepgram SDK v5
require('dotenv').config();

// Import our Mongoose Model
const Transcription = require('./models/Transcription');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Deepgram Client using your secret .env key
const deepgram = new DeepgramClient(process.env.DEEPGRAM_API_KEY); // 2. Initialize Deepgram v5
// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// CONNECT TO MONGOOSE ATLAS
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


// ==========================================
// 6. ROUTES & API ENDPOINTS
// ==========================================

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'VoxScribe Server is fully operational!' });
});

// GET ROUTE: Fetch Transcription History (Restricted by User ID)
app.get('/api/transcriptions', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required to fetch history.' });
    }
    
    // Fetch only the records belonging to this specific user!
    const history = await Transcription.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST ROUTE: Handle Audio Uploads, Perform STT & Link to Supabase Owner!
app.post('/api/upload', upload.single('audio'), async (req, res) => {
  try {
    // 1. Extract the secure Supabase owner stamp
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required to link transcriptions.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please select an audio file.' });
    }

    console.log(`🎙️ Audio received from User ${userId}! Starting transcription for: ${req.file.originalname}`);

    // 2. CREATE FILE STREAM
    const audioStream = fs.createReadStream(req.file.path);

    // 3. SEND TO DEEPGRAM AI
    const response = await deepgram.listen.v1.media.transcribeFile(
      audioStream,
      {
        model: 'nova-2',     
        smart_format: true,  
        language: 'en-US'    
      }
    );

    // 4. EXTRACT THE AI TEXT
    const transcriptText = response.results.channels[0].alternatives[0].transcript || "No speech detected.";
    console.log(`✨ AI Transcription completed! Result: "${transcriptText}"`);

    // 5. SAVE TRANSCRIBED METADATA TO DATABASE (Stamped with the owner's userId!)
    const newRecord = await Transcription.create({
      userId: userId, // Securely lock to the owner!
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      transcriptionText: transcriptText 
    });

    res.status(200).json({
      message: 'Audio file transcribed and saved successfully!',
      transcription: newRecord
    });

  } catch (error) {
    console.error('❌ Transcription error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7. GLOBAL EXPRESS ERROR-HANDLING MIDDLEWARE
// ==========================================
app.use((err, req, res, next) => {
  console.error('🚨 Global Error Handler Caught:', err.message);

  // Catch Multer-specific limits (like oversized files)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large! Maximum limit is 10MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } 
  
  // Catch custom format errors from fileFilter
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  
  next();
});

// ==========================================
// 8. START SERVER
// ==========================================
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});

// ==========================================
// 9. WEB SOCKET SERVER FOR LIVE STREAMING
// ==========================================
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('🔌 Client connected to Live WebSocket proxy!');
  let deepgramLive = null;

  try {
    // Initialize Deepgram Live Connection
    deepgramLive = deepgram.listen.live.createConnection({
      model: 'nova-2',
      smart_format: true,
      language: 'en-US',
      interim_results: true // Enable real-time interim guessing!
    });

    // 1. Hook up Deepgram Live Connection Listeners
    deepgramLive.on('open', () => {
      console.log('✨ Connected to Deepgram Live Streaming API!');
    });

    deepgramLive.on('transcript', (data) => {
      const transcriptText = data.channel.alternatives[0].transcript;
      const isFinal = data.is_final;
      
      if (transcriptText) {
        // Forward the live transcript text and finality stamp back to the client!
        ws.send(JSON.stringify({
          transcript: transcriptText,
          isFinal: isFinal
        }));
      }
    });

    deepgramLive.on('close', () => {
      console.log('❌ Deepgram Live connection closed.');
    });

    deepgramLive.on('error', (err) => {
      console.error('🚨 Deepgram Live Error:', err.message);
    });

  } catch (error) {
    console.error('🚨 Failed to initialize Deepgram Live connection:', error.message);
    ws.close();
    return;
  }

  // 2. Receive binary audio data from React and pipe it to Deepgram
  ws.on('message', (message) => {
    if (deepgramLive && deepgramLive.getReadyState() === 1) {
      deepgramLive.send(message);
    }
  });

  // 3. Close connections cleanly when the client disconnects
  ws.on('close', () => {
    console.log('🔌 Client disconnected from Live WebSocket proxy.');
    if (deepgramLive) {
      deepgramLive.finish(); // Finalize stream gracefully
      deepgramLive = null;
    }
  });

  ws.on('error', (err) => {
    console.error('🚨 Client WebSocket Proxy Error:', err.message);
  });
});