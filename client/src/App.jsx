import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [history, setHistory] = useState([]);

  // FETCH DATABASE HISTORY
  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transcriptions');
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // FILE UPLOAD HANDLER
  const handlefile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setTranscription("");
    }
    e.target.value = ""; // Reset value so same file can be selected again
  };

  // START VOICE RECORDING
  const startRecording = async () => {
    try {
      setError(null);
      setTranscription("");
      setSelectedFile(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([audioBlob], 'live-recording.webm', { type: 'audio/webm' });
        setSelectedFile(file);
        
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Microphone permission is required to record audio!");
    }
  };

  // STOP VOICE RECORDING
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // API UPLOAD & AI TRANSCRIBE
  const handleTranscribe = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setTranscription("");

    try {
      const formData = new FormData();
      formData.append('audio', selectedFile);

      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setTranscription(response.data.transcription.transcriptionText);
      fetchHistory(); // Refresh the grid list!
    } catch (err) {
      console.error("API Error:", err);
      setError(
        err.response?.data?.error || 
        "Failed to connect to backend. Make sure your server is running on port 5000!"
      );
    } finally {
      setLoading(false);
    }
  };

   return (
    <>
      {/* 1. MAIN BACKGROUND: Crisp stark white */}
      <div className="relative min-h-screen bg-white flex flex-col items-center justify-center p-6 selection:bg-black selection:text-white overflow-hidden">
        
        {/* 🚀 MULTI-LINE NEU-BRUTALIST EQUALIZER BACKGROUND (8 Alternating Moving Lines) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-70">
          {/* Line 1 */}
          <div className="absolute left-[5%] top-[-30px] bottom-[-30px] w-2">
            <div className="h-full border-l-4 border-dotted border-[#FACC15] animate-oscillate-up"></div>
          </div>
          {/* Line 2 */}
          <div className="absolute left-[18%] top-[-30px] bottom-[-30px] w-2">
            <div className="h-full border-l-4 border-dotted border-[#FACC15] animate-oscillate-down"></div>
          </div>
          {/* Line 3 */}
          <div className="absolute left-[31%] top-[-30px] bottom-[-30px] w-2">
            <div className="h-full border-l-4 border-dotted border-[#FACC15] animate-oscillate-up"></div>
          </div>
          {/* Line 4 */}
          <div className="absolute left-[44%] top-[-30px] bottom-[-30px] w-2">
            <div className="h-full border-l-4 border-dotted border-[#FACC15] animate-oscillate-down"></div>
          </div>
          {/* Line 5 */}
          <div className="absolute left-[56%] top-[-30px] bottom-[-30px] w-2">
            <div className="h-full border-l-4 border-dotted border-[#FACC15] animate-oscillate-up"></div>
          </div>
          {/* Line 6 */}
          <div className="absolute left-[69%] top-[-30px] bottom-[-30px] w-2">
            <div className="h-full border-l-4 border-dotted border-[#FACC15] animate-oscillate-down"></div>
          </div>
          {/* Line 7 */}
          <div className="absolute left-[82%] top-[-30px] bottom-[-30px] w-2">
            <div className="h-full border-l-4 border-dotted border-[#FACC15] animate-oscillate-up"></div>
          </div>
          {/* Line 8 */}
          <div className="absolute left-[95%] top-[-30px] bottom-[-30px] w-2">
            <div className="h-full border-l-4 border-dotted border-[#FACC15] animate-oscillate-down"></div>
          </div>
        </div>
        
        {/* 2. MAIN CARD: Broad yellow card (lifted to z-10 to stay on top of the moving background!) */}
        <div className="relative z-10 w-full max-w-2xl bg-[#FACC15] border-4 border-black rounded-3xl p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center space-y-8 text-center">

          
          {/* Header Text */}
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-black tracking-tighter uppercase">
              voxscribe
            </h1>
            <p className="text-black font-bold text-sm tracking-wide uppercase opacity-90">
               AI speech-to-text transcription engine
            </p>
          </div>

          {/* BUTTON CONTAINER */}
          <div className="w-full space-y-4">
            
            {/* UPLOAD FILE BUTTON (Pushes down on hover!) */}
            <div className="w-full">
              <label 
                htmlFor="audio-input" 
                className="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-8 py-4 font-black text-sm uppercase tracking-wide rounded-xl bg-black text-white hover:bg-neutral-900 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-200"
              >
                upload file
              </label>
              <input 
                id="audio-input"
                type="file" 
                accept=".mp3,.wav,.m4a,audio/*"
                className="hidden" 
                onChange={handlefile}
              />
            </div>

            {/* RECORD AUDIO BUTTON (Spring-loaded toggling) */}
            <div className="w-full">
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-8 py-4 font-black text-sm uppercase tracking-wide rounded-xl bg-red-600 text-white hover:bg-red-700 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-200 animate-pulse"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white mr-1"></span>
                  stop recording
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-8 py-4 font-black text-sm uppercase tracking-wide rounded-xl bg-black text-white hover:bg-neutral-900 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-200"
                >
                  record live audio
                </button>
              )}
            </div>

            {/* CLEAR FILE BUTTON (Spring-loaded 3D white button) */}
            <div className="w-full">
              <button 
                type="button" 
                onClick={() => {
                  setSelectedFile(null);
                  setError(null);
                  setTranscription("");
                }}
                className="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-8 py-4 font-black text-sm uppercase tracking-wide rounded-xl bg-white text-black hover:bg-neutral-100 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-200"
              >
                clear file
              </button>
            </div>

            {/* TRANSCRIBE AUDIO ACTION BUTTON */}
            {selectedFile && !loading && (
              <div className="w-full pt-4 border-t-3 border-black">
                <button 
                  type="button" 
                  onClick={handleTranscribe}
                  className="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-8 py-4 font-black text-sm uppercase tracking-wide rounded-xl bg-black text-white hover:bg-neutral-900 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-200"
                >
                 transcribe audio
                </button>
              </div>
            )}

          </div>

          {/* SELECTED FILE DISPLAY */}
          {selectedFile && (
            <div className="w-full p-4 border-3 border-black rounded-xl bg-white text-black font-black flex items-center justify-center gap-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <svg className="w-5 h-5 text-black shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2Zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2ZM9 10l12-3" />
              </svg>
              <span className="truncate text-sm">
                {selectedFile.name}
              </span>
            </div>
          )}

          {/* ERROR ALERT DISPLAY */}
          {error && (
            <div className="w-full p-4 border-3 border-black rounded-xl bg-red-500 text-white font-black text-sm text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              ⚠️ {error}
            </div>
          )}

          {/* LOADING STATE DISPLAY */}
          {loading && (
            <div className="w-full p-6 border-3 border-black rounded-2xl bg-white text-black text-left space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
              <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                <svg className="w-5 h-5 text-black shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span className="text-xs font-black uppercase tracking-wider text-neutral-500">
                  AI transcribing...
                </span>
              </div>
              <p className="text-sm font-semibold text-black italic leading-relaxed">
                "Deepgram AI is listening and transcribing your voice. Please wait..."
              </p>
            </div>
          )}

          {/* REAL AI TRANSCRIPTION DISPLAY */}
          {transcription && (
            <div className="w-full p-6 border-3 border-black rounded-2xl bg-white text-black text-left space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                <svg className="w-5 h-5 text-black shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                <span className="text-xs font-black uppercase tracking-wider text-neutral-500">
                  AI transcription result
                </span>
              </div>
              <p className="text-sm font-semibold leading-relaxed text-black italic">
                "{transcription}"
              </p>
            </div>
          )}

          {/* 9. TRANSCRIPTION HISTORY GRID CARDS SECTION */}
          {history.length > 0 && (
            <div className="w-full text-left space-y-6 pt-8 border-t-4 border-black">
              <h2 className="text-2xl font-black text-black uppercase tracking-tight">
                transcripts history ({history.length})
              </h2>
              
              {/* Responsive 2-column Grid of 3D Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto pr-2">
                {history.map((item) => {
                  // Dynamically extract the file format extension (e.g. mp3, wav, webm)
                  const extension = item.originalName.split('.').pop() || 'audio';
                  
                  return (
                    <div 
                      key={item._id}
                      className="p-5 border-3 border-black rounded-2xl bg-white text-black text-xs font-semibold leading-relaxed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4"
                    >
                      {/* Top Bar: Icon, File Name, and Format Badge */}
                      <div className="flex justify-between items-start gap-2 border-b-2 border-black pb-2">
                        <span className="font-black truncate max-w-[120px] text-xs">
                          📁 {item.originalName}
                        </span>
                        {/* High-contrast format badge */}
                        <span className="px-2 py-0.5 bg-black text-white text-[9px] font-black uppercase rounded-md tracking-wider shrink-0">
                          {extension}
                        </span>
                      </div>
                      
                      {/* Body: Transcription Text */}
                      <p className="italic text-neutral-800 font-semibold flex-grow">
                        "{item.transcriptionText}"
                      </p>
                      
                      {/* Footer: Stamp date */}
                      <div className="text-[9px] text-neutral-500 font-black border-t border-gray-100 pt-2 flex justify-between items-center tracking-wider">
                        <span>CREATED ON:</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default App;