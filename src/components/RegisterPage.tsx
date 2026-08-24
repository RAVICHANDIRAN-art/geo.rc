import React, { useState } from 'react';
import { MapPin, User, Mail, Lock, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import type { UserProfile } from '../types/auth';
import { registerNewUser, setCurrentUserInStorage } from '../services/authService';

interface RegisterPageProps {
  onRegisterSuccess: (user: UserProfile) => void;
  onGoToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onGoToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !username.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All required fields must be filled.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must meet Firebase Authentication rules (at least 6 characters).');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const newUser = registerNewUser({
          fullName: fullName.trim(),
          username: username.trim(),
          email: email.trim()
        });

        setCurrentUserInStorage(newUser);
        setLoading(false);
        onRegisterSuccess(newUser);
      } catch (err: any) {
        setError(err.message || 'An error occurred during account creation.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-screen bg-[#0B1220] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#111827] border border-[#334155] rounded-3xl p-8 shadow-2xl z-10 relative space-y-5 animate-in fade-in duration-300">
        <button
          onClick={onGoToLogin}
          className="text-xs text-[#94A3B8] hover:text-white flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 p-[2px] shadow-xl flex items-center justify-center">
            <div className="w-full h-full bg-[#0B1220] rounded-[14px] flex items-center justify-center">
              <MapPin className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">
            CREATE ACCOUNT
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Register as a Cadastral Mapper / Surveyor
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5">
          {error && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#94A3B8] block">Full Name</label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-[#94A3B8] absolute left-3" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-[#0B1220] border border-[#334155] focus:border-emerald-500 text-white text-xs font-medium pl-9 pr-3 py-2 rounded-xl focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#94A3B8] block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="john_doe"
                className="w-full bg-[#0B1220] border border-[#334155] focus:border-emerald-500 text-white text-xs font-medium px-3 py-2 rounded-xl focus:outline-none transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#94A3B8] block">Email</label>
              <div className="relative flex items-center">
                <Mail className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-[#0B1220] border border-[#334155] focus:border-emerald-500 text-white text-xs font-medium pl-8 pr-2 py-2 rounded-xl focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#94A3B8] block">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-[#0B1220] border border-[#334155] focus:border-emerald-500 text-white text-xs font-medium pl-9 pr-3 py-2 rounded-xl focus:outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#94A3B8] block">Confirm Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-[#0B1220] border border-[#334155] focus:border-emerald-500 text-white text-xs font-medium pl-9 pr-3 py-2 rounded-xl focus:outline-none transition"
              />
            </div>
          </div>

          <div className="p-2 bg-[#172033] rounded-lg text-[10px] text-[#94A3B8] flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Default Role: <strong className="text-emerald-300">USER</strong> | Status: <strong className="text-emerald-300">ACTIVE</strong></span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition active:scale-98 cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
};
