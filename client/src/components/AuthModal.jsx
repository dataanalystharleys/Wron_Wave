import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Sparkles, Check, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword
  } = useAuth();

  const [mode, setMode] = useState(authModalMode || 'signin'); // 'signin', 'signup', or 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync mode with prop
  React.useEffect(() => {
    if (authModalMode) setMode(authModalMode);
    setError('');
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Please enter your email address');
        return;
      }
      setIsLoading(true);
      try {
        await resetPassword(email.trim());
        setResetSuccess(true);
      } catch (err) {
        console.error('Password reset error:', err);
        setError(err.message || 'Failed to send reset link. Please verify your email.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signin') {
        await loginWithEmail(email.trim(), password);
      } else {
        await registerWithEmail(email.trim(), password, {
          name: name.trim(),
          phone: phone.trim()
        });
      }
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 1000);
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Google Auth error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full text-white shadow-2xl overflow-hidden my-6">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-zinc-850 bg-zinc-900/60 text-center">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-white">
            {mode === 'forgot'
              ? 'Reset Password'
              : mode === 'signin'
              ? 'Welcome Back'
              : 'Join WRON_WAVE'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'forgot'
              ? 'Enter your registered email to receive a 100% free reset link'
              : mode === 'signin' 
              ? 'Sign in to access your orders and express checkout' 
              : 'Create your account with 100% free signup'}
          </p>

          {/* Mode Switch Tabs */}
          {mode !== 'forgot' ? (
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 mt-4">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition font-mono ${
                  mode === 'signin' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition font-mono ${
                  mode === 'signup' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-center">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); setResetSuccess(false); }}
                className="text-xs text-zinc-400 hover:text-white font-mono flex items-center gap-1 transition"
              >
                ← Back to Sign In
              </button>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          
          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Authentication successful!</span>
            </div>
          )}

          {mode === 'forgot' ? (
            /* ================= FORGOT PASSWORD MODE ================= */
            <div className="space-y-4">
              {resetSuccess ? (
                <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Reset Link Sent!
                    </h4>
                    <p className="text-xs text-zinc-300 mt-1">
                      We have sent a 100% free password reset link to:
                    </p>
                    <p className="text-xs font-mono text-amber-400 font-bold mt-1">
                      {email}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                      Please check your email inbox (and spam folder). Click the link in the message to reset your password and log in.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setResetSuccess(false); }}
                    className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition font-mono mt-2"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 font-mono">
                      Your Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-wider rounded-xl transition flex items-center justify-center gap-2 active:scale-98 shadow-lg mt-2"
                  >
                    {isLoading ? (
                      <span>Sending Link...</span>
                    ) : (
                      <>
                        <span>Send Free Reset Link</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setMode('signin'); setError(''); }}
                      className="text-xs text-zinc-400 hover:text-white font-mono transition"
                    >
                      Remember your password? <span className="text-white underline">Sign In</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ================= SIGN IN / SIGN UP MODE ================= */
            <>
              {/* One-Click Google OAuth (100% Free) */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 hover:border-zinc-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-3 transition active:scale-98 shadow-sm"
              >
                {/* Google SVG Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.86c2.26-2.09 3.68-5.17 3.68-9.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.37 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-zinc-800 w-full" />
                <span className="bg-zinc-950 px-3 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                  or with email
                </span>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                
                {mode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 font-mono">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 font-mono">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setError(''); setResetSuccess(false); }}
                        className="text-[10px] text-amber-400 hover:underline font-mono"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                        Mobile Phone
                      </label>
                      <span className="text-[10px] text-amber-400 font-mono">Optional • No SMS OTP required</span>
                    </div>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-wider rounded-xl transition flex items-center justify-center gap-2 active:scale-98 shadow-lg mt-2"
                >
                  {isLoading ? (
                    <span>Processing...</span>
                  ) : mode === 'signin' ? (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Create Free Account</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Free Tier Guarantee Badge */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Free Tier Auth • Zero SMS Charges</span>
          </div>

        </div>

      </div>
    </div>
  );
}
