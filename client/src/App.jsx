import React, { useState, useEffect} from 'react';
import axios from 'axios'

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [loading, setLoading]=useState(false);
  const [error, setError]=useState(null);
  const [transcription, setTranscription] = useState("");
  const [history,setHistory]=useState([]);
  const fetchHistory= async()=>{
 try{
  const response=await axios.get('http://localhost:5000/api/transcriptions');
  setHistory(response.data);
 }
 catch(err){
  console.log("error occured", err);
 }
  }
 useEffect(() => {
  fetchHistory();
}, []);
  // FILE UPLOAD HANDLER
  const handlefile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
    e.target.value = ""; // Reset value so same file can be selected again
  };

  // START VOICE RECORDING
  const startRecording = async () => {
    try {
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
      alert("Microphone permission is required to record audio!");
    }
  };

  // STOP VOICE RECORDING
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };
  const handleTranscribe = async ()=>
  {
    if(!selectedFile)return 
    setLoading(true);
    setError(null);
    setTranscription("");
    try{
      const formData = new FormData();
      formData.append('audio',selectedFile)
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  setTranscription(response.data.transcription.transcriptionText);
  fetchHistory();
    }
    catch(err){
      console.log("cant connect to api", err);
      setError(
      err.response?.data?.error || 
      "Failed to connect to backend. Make sure your server is running on port 5000!"
    );
    }
    finally{
      setLoading(false);
    }
  };
    return (
    <>
      {/* MAIN BACKGROUND */}
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        
        {/* THE CARD */}
        <div className="w-full max-w-xl bg-[#FACC15] border-4 border-black rounded-3xl p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center space-y-8 text-center">
          
          {/* Header Text */}
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-black tracking-tighter uppercase">
              voxscribe
            </h1>
            <p className="text-black font-semibold text-sm opacity-80">
              AI speech-to-text transcription engine
            </p>
          </div>

          {/* BUTTON CONTAINER */}
          <div className="w-full space-y-4">
            
            {/* UPLOAD FILE BUTTON (Solid Black) */}
            <div className="w-full">
              <label 
                htmlFor="audio-input" 
                className="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-8 py-4 font-black text-sm uppercase tracking-wide rounded-xl bg-black text-white hover:bg-neutral-800 transition-all border-2 border-black transform active:translate-x-0.5 active:translate-y-0.5"
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

            {/* RECORD AUDIO BUTTON (Toggles between Record and Stop) */}
            <div className="w-full">
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-8 py-4 font-black text-sm uppercase tracking-wide rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all border-2 border-black transform active:translate-x-0.5 active:translate-y-0.5 animate-pulse"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white mr-1"></span>
                  stop recording
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-8 py-4 font-black text-sm uppercase tracking-wide rounded-xl bg-black text-white hover:bg-neutral-800 transition-all border-2 border-black transform active:translate-x-0.5 active:translate-y-0.5"
                >
                  record live audio
                </button>
              )}
            </div>

            {/* CLEAR FILE BUTTON (Solid Black) */}
            <div className="w-full">
              <button 
                type="button" 
                onClick={() => setSelectedFile(null)}
                className="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-8 py-4 font-black text-sm uppercase tracking-wide rounded-xl bg-black text-white hover:bg-neutral-800 transition-all border-2 border-black transform active:translate-x-0.5 active:translate-y-0.5"
              >
                clear file
              </button>
            </div>

          </div>
{selectedFile && !loading && (
  <div className="w-full">
    <button 
      type="button" 
      onClick={handleTranscribe}
      className="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-8 py-4 font-black text-sm uppercase tracking-wide rounded-xl bg-black text-white hover:bg-neutral-800 transition-all border-2 border-black transform active:translate-x-0.5 active:translate-y-0.5"
    >
     transcribe audio
    </button>
  </div>
)}
{/* 6. ERROR CONTAINER */}
{error && (
  <div className="w-full p-4 border-3 border-black rounded-xl bg-red-500 text-white font-bold text-sm text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
    ⚠️ {error}
  </div>
)}

{/* 7. LOADING BOX (Pulsing Animation) */}
{loading && (
  <div className="w-full p-6 border-3 border-black rounded-2xl bg-white text-black text-left space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
    <div className="flex items-center gap-2 border-b-2 border-black pb-2">
      {/* Spinning refresh wheel */}
      <svg className="w-5 h-5 text-black shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
      <span className="text-xs font-black uppercase tracking-wider text-neutral-500">
        AI transcribing...
      </span>
    </div>
    <p className="text-sm font-semibold text-black italic">
      "Deepgram AI is listening and transcribing your voice. Please wait..."
    </p>
  </div>
)}
          {/* SELECTED FILE DISPLAY */}
          {selectedFile && (
            <div className="w-full p-4 border-3 border-black rounded-xl bg-white text-black font-bold flex items-center justify-center gap-3">
              <svg className="w-5 h-5 text-black shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2Zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2ZM9 10l12-3" />
              </svg>
              <span className="truncate text-sm">
                {selectedFile.name}
              </span>
            </div>
          )}

         {/* 8. AI TRANSCRIPTION CARD */}
{transcription && (
  <div className="w-full p-6 border-3 border-black rounded-2xl bg-white text-black text-left space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
    <div className="flex items-center gap-2 border-b-2 border-black pb-2">
      {/* Speech bubble icon */}
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
          {/* 9. TRANSCRIPTION HISTORY CARDS SECTION */}
          {history.length > 0 && (
            <div className="w-full text-left space-y-4 pt-8 border-t-2 border-black">
              <h2 className="text-xl font-black text-black uppercase tracking-tight">
                transcripts history ({history.length})
              </h2>
              
              {/* Loop through the history array using .map() */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {history.map((item) => (
                  <div 
                    key={item._id} // Mongoose's unique ID serves as our React key!
                    className="p-4 border-2 border-black rounded-xl bg-white text-black text-xs font-semibold leading-relaxed shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {/* Header: Original File Name and formatted Date */}
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                      <span className="font-bold truncate max-w-[220px]">
                        📁 {item.originalName}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {/* Transcribed text */}
                    <p className="italic text-neutral-800 font-semibold">
                      "{item.transcriptionText}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default App;