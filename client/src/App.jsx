import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center p-6 selection:bg-indigo-500/30">
      <div className="text-center space-y-6 max-w-lg">

        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-full shadow-lg shadow-indigo-500/10 animate-pulse">
          <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        </div>

        <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
          VoxScribe
        </h1>
        
        <p className="text-gray-400 text-lg">
          Your client app is running with <span className="text-indigo-400 font-semibold">Tailwind CSS v4</span>!
        </p>

        <div className="pt-4">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Day 1 Tasks Completed
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;