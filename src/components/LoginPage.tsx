import React, { useState } from 'react';
import { MapPin, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import type { UserProfile } from '../types/auth';
import { getAllUsers, setCurrentUserInStorage } from '../services/authService';
import { logUserActivity } from '../services/activityService';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onGoToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onGoToRegister }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!emailOrUsername.trim() || !password) {
      setError('Please enter your email/username and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const users = getAllUsers();
      // Check Admin demo account shortcut (Ravi / admin@urbanparcel.com / 12345 or 123456)
      const input = emailOrUsername.trim().toLowerCase();
      let matchedUser = users.find(
        (u) => u.username.toLowerCase() === input || u.email.toLowerCase() === input
      );

      if (!matchedUser) {
        // Create demo user account if logging in with new credentials
        if (input.includes('admin') || input === 'ravi') {
          matchedUser = users[0]; // Ravi Admin
        } else {
          setError('Invalid email/username or password. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Password length check
      if (password.length < 5) {
        setError('Password does not meet the required security rules.');
        setLoading(false);
        return;
      }

      const updatedUser: UserProfile = {
        ...matchedUser,
        lastLogin: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        status: 'ACTIVE'
      };

      setCurrentUserInStorage(updatedUser);
      logUserActivity(updatedUser, 'LOGIN', 'User logged in to console.');
      setLoading(false);
      onLoginSuccess(updatedUser);
    }, 600);
  };

  return (
    <div className="min-h-screen w-screen bg-[#0B1220] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden select-none">
      {/* Background GIS Visual Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#111827] border border-[#334155] rounded-3xl p-8 shadow-2xl z-10 relative space-y-6 animate-in fade-in duration-300">
        {/* Brand Title Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[2px] shadow-xl flex items-center justify-center">
            <div className="w-full h-full bg-[#0B1220] rounded-[14px] flex items-center justify-center">
              <MapPin className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            URBAN PARCEL MAPPER
          </h1>
          <p className="text-xs text-[#94A3B8] font-medium">
            AI-Powered GIS & Cadastral Analysis
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#94A3B8] block">Username or Email</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3" />
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Ravi or admin@urbanparcel.com"
                className="w-full bg-[#0B1220] border border-[#334155] focus:border-indigo-500 text-white text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl focus:outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-[#94A3B8]">Password</label>
              <button
                type="button"
                onClick={() => alert('Demo Reset: Admin password is 12345 or 123456. Standard account passwords can be reset via Firebase Auth Console.')}
                className="text-[11px] text-indigo-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B1220] border border-[#334155] focus:border-indigo-500 text-white text-xs font-medium pl-9 pr-3 py-2.5 rounded-xl focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'LOGIN'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Create Account Link */}
        <div className="text-center pt-2 border-t border-[#1E293B]">
          <p className="text-xs text-[#94A3B8]">
            Don't have an account?{' '}
            <button
              onClick={onGoToRegister}
              className="text-emerald-400 hover:underline font-bold"
            >
              CREATE ACCOUNT
            </button>
          </p>
        </div>

        {/* Demo Admin Info Note */}
        <div className="p-3 bg-[#172033] border border-[#1E293B] rounded-xl text-[11px] text-[#94A3B8] flex items-center justify-between font-mono">
          <span className="flex items-center gap-1.5 text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Admin Demo:
          </span>
          <span className="text-white font-bold">Ravi / admin@urbanparcel.com</span>
        </div>
      </div>
    </div>
  );
};
