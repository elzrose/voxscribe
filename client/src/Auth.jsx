import React, { useState } from 'react';
import { supabase } from './supabaseClient';

function Auth({ onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        // Sign up a new user
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
        });
        if (error) throw error;
        
        // Supabase sends a confirmation email link by default
        setMessage("Verification link sent! Check your inbox to confirm registration.");
      } else {
        // Log in an existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        if (error) throw error;
        
        if (data.session) {
          onAuthSuccess(data.session);
        }
      }
    } catch (err) {
      console.error("Authentication Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#FACC15] border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center space-y-6 relative z-10">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-black uppercase tracking-tight">
          {isSignUp ? "Create Account" : "Access Vault"}
        </h1>
        <p className="text-xs font-black uppercase text-black/70 tracking-wider">
          {isSignUp ? "Join VoxScribe Engine" : "Unlock Your Transcriptions"}
        </p>
      </div>

      {/* Login/Signup Tabs */}
      <div className="grid grid-cols-2 border-3 border-black rounded-xl overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
        <button 
          type="button"
          onClick={() => { setIsSignUp(false); setError(null); setMessage(null); }}
          className={`py-3 font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${!isSignUp ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
        >
          Log In
        </button>
        <button 
          type="button"
          onClick={() => { setIsSignUp(true); setError(null); setMessage(null); }}
          className={`py-3 font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${isSignUp ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
        >
          Sign Up
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAuth} className="space-y-4 text-left">
        
        {/* Email Field */}
        <div className="space-y-1">
          <label className="text-xs font-black uppercase text-black tracking-wider">
            Email Address
          </label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="chef@voxscribe.com"
            className="w-full px-4 py-3 border-3 border-black rounded-xl bg-white text-black font-semibold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all duration-150"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label className="text-xs font-black uppercase text-black tracking-wider">
            Password
          </label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 border-3 border-black rounded-xl bg-white text-black font-semibold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all duration-150"
          />
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="p-3 border-3 border-black rounded-xl bg-red-500 text-white font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div className="p-3 border-3 border-black rounded-xl bg-green-500 text-black font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse">
             {message}
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3.5 font-black text-sm uppercase tracking-wider rounded-xl bg-black text-white hover:bg-neutral-900 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "AUTHENTICATING..." : isSignUp ? "REGISTER NOW" : "LOG IN"}
        </button>
      </form>

    </div>
  );
}

export default Auth;