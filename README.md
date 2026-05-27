# 🎙️ VoxScribe — Full-Stack AI Speech-to-Text Engine

VoxScribe is a high-performance, responsive Speech-to-Text web application styled in a vibrant, high-contrast **Neo-brutalist design system** (yellow, black, and white) featuring an animated soundwave equalizer background.

Users can upload audio files or capture live voice recordings directly from their browser microphone, transcribe them utilizing the lightning-fast Deepgram Nova-2 AI engine, and save transcripts securely in their private cloud-synchronized database vaults.

## System Architecture

VoxScribe follows a secure, scalable hybrid-cloud client-server architecture:

     Frontend Layer
    subgraph Frontend [Client: React + Vite + Tailwind CSS]
        UI[Dashboard UI]
        Rec[HTML5 MediaRecorder API]
        Up[Audio File Uploader]
        Auth[Supabase Auth Login/Signup]
    end

    %% Backend Layer
    subgraph Backend [Server: Node.js + Express]
        Router[Express API Router]
        Mlt[Multer File Parser]
        Err[Global Error Handler]
    end

    %% Database & External API Layer
    subgraph Cloud [Cloud & AI Services]
        DB[(MongoDB Atlas)]
        STT_API[Deepgram Nova-2 STT]
        Supa[(Supabase Auth Identity)]
    end

    %% Flow arrows
    Auth -->|Authenticate User| Supa
    UI -->|Record Voice| Rec
    UI -->|Select Local File| Up
    Rec -->|Send Audio Formdata + userId| Router
    Up -->|Upload Audio Formdata + userId| Router
    Router -->|Parse File Upload| Mlt
    Router -->|Stream Audio Chunks| STT_API
    STT_API -->|Return Punctuated Text JSON| Router
    Router -->|Store Metadata linked to userId| DB
    Router -->|Error Catching| Err

# Day 1

Explained MERN stack & Speech-to-Text APIs.
Chose Deepgram as the STT API.
Initialized a Git repository.
Created a React app using Vite.
Installed & configured Tailwind CSS v4.

# Day 2

Accepts the file via the POST route.
Performs a security check (making sure it's actually an approved audio file, not a dangerous script).
Generates a unique name for it.
Saves it physically on your computer in the uploads/ folder.

# Day 3

Set up MongoDB with Mongoose.
Create a schema for storing uploaded audio and transcriptions.

# Day 4

Created a free Deepgram account and secured an AI Speech-to-Text API key.
Added the API key to the server's environment variables.
Installed and imported the brand-new Deepgram v5 SDK.
Piped the uploaded audio file as a Node.js stream to the Deepgram Nova-2 AI engine.
Extracted the real voice-to-text transcription and saved it directly in MongoDB.

# Day 5

Created a React Ul with:
A file upload button.
A record audio button using MediaRecorder.
A section to display transcriptions.
Used Tailwind CSS for styling.

# Day 6

Used Axios or Fetch API to send audio files from React to Express.
Showed loading states while the transcription is being generated.
Displayed the transcription result on the frontend.

# Day 7

Modified backend to save transcriptions in Supabase/MongoDB.
Fetched previous transcriptions from the database and display them on the frontend.

# Day 8

Improved Ul with better typography, button designs, and animations.
Displayed history of transcriptions in a card format.

# Day 9

Handled errors such as invalid file types and API failures.
Showed proper error messages.

# Day 10

Added user authentication with Supabase Auth.
Allowed users to save and retrieve their transcriptions.

# Day 11

Deployed Express.js backend on Render/Vercel.
Ensured the database is accessible from the deployed backend.

# Day 12

Deployed React app on Vercel.
Ensured frontend and backend work seamlessly together.

# Day 13

Tested the project for Ul bugs, API errors, and database issues.
Fixed any remaining problems before final submission.

# Day 14

Wrote a README.md explaining the project setup, API usage, and deployment steps.
Cleaned up unnecessary console logs and improve code structure.
