import React, { useState, useEffect } from 'react';
import { 
  X, Mail, Lock, User, Phone, Sparkles, Check, 
  AlertCircle, ArrowRight, ShieldCheck, KeyRound, 
  RotateCw, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    loginWithEmail,
    requestSignupVerification,
    verifySignupCode,
    requestPasswordReset,
    verifyPasswordReset
  } = useAuth();

  // Modes: 'signin', 'signup', 'verify', 'forgot', 'reset_confirm'
  const [mode, setMode] = useState(authModalMode || 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [dispatchedOtp, setDispatchedOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Sync mode with prop
  useEffect(() => {
    if (authModalMode) setMode(authModalMode);
    setError('');
  }, [authModalMode, isAuthModalOpen]);

  // Resend countdown timer
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isAuthModalOpen) return null;

  // Handle Initial Form Submission (Sign In or Request Signup Verification)
  const handlePrimarySubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Sign In Mode
    if (mode === 'signin') {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password');
        return;
      }
      setIsLoading(true);
      try {
        await loginWithEmail(email.trim(), password);
        setIsSuccess(true);
        setSuccessMessage('Welcome back! Logging you in...');
      } catch (err) {
        console.error('Sign-in error:', err);
        setError(err.message || 'Authentication failed. Please verify your credentials.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 2. Sign Up Mode -> Dispatches 6-digit verification code
    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      setIsLoading(true);
      try {
        const res = await requestSignupVerification({
          email: email.trim(),
          password,
          name: name.trim(),
          phone: phone.trim()
        });
        setDispatchedOtp(res.code);
        setOtpCode('');
        setResendTimer(45);
        setMode('verify');
      } catch (err) {
        console.error('Signup verification error:', err);
        setError(err.message || 'Failed to dispatch verification code.');
      } finally {
        setIsLoading(false);
      }
      return;
    }
  };

  // Handle 6-Digit Code Verification for Account Creation
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      await verifySignupCode({
        email: email.trim(),
        code: otpCode.trim()
      });
      setIsSuccess(true);
      setSuccessMessage('Account verified successfully! Welcome to WRON_WAVE.');
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend 6-Digit Code
  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    setError('');
    setIsLoading(true);
    try {
      const res = await requestSignupVerification({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: phone.trim()
      });
      setDispatchedOtp(res.code);
      setResendTimer(45);
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password Request
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter your registered email address');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordReset(email.trim());
      setDispatchedOtp(res.code);
      setOtpCode('');
      setResendTimer(45);
      setMode('reset_confirm');
    } catch (err) {
      console.error('Password reset request error:', err);
      setError(err.message || 'Failed to send password reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Reset Password with Code and New Password
  const handleResetConfirm = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit reset code');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await verifyPasswordReset({
        email: email.trim(),
        code: otpCode.trim(),
        newPassword
      });
      setIsSuccess(true);
      setSuccessMessage('Password updated successfully! Please sign in with your new password.');
      setTimeout(() => {
        setIsSuccess(false);
        setMode('signin');
        setPassword('');
        setOtpCode('');
      }, 2000);
    } catch (err) {
      console.error('Reset confirm error:', err);
      setError(err.message || 'Failed to update password. Please check your code.');
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
            {mode === 'verify' ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            ) : mode === 'forgot' || mode === 'reset_confirm' ? (
              <KeyRound className="w-6 h-6 text-amber-400" />
            ) : (
              <Sparkles className="w-6 h-6 text-amber-400" />
            )}
          </div>
          
          <h3 className="text-xl font-black uppercase tracking-tight text-white">
            {mode === 'verify'
              ? 'Verify Your Email'
              : mode === 'forgot'
              ? 'Reset Password'
              : mode === 'reset_confirm'
              ? 'Enter Reset Code'
              : mode === 'signin'
              ? 'Welcome Back'
              : 'Create Account'}
          </h3>

          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            {mode === 'verify'
              ? 'Enter the unique 6-digit verification number sent to your email'
              : mode === 'forgot'
              ? 'Enter your registered email to receive a 6-digit reset code'
              : mode === 'reset_confirm'
              ? 'Enter the 6-digit reset code sent to your email and set a new password'
              : mode === 'signin' 
              ? 'Sign in with your email to access express checkout' 
              : 'Sign up with your email to create a free customer account'}
          </p>

          {/* Mode Switch Tabs (Sign In vs Create Account) */}
          {(mode === 'signin' || mode === 'signup') && (
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
          )}

          {/* Back Button for other modes */}
          {(mode === 'forgot' || mode === 'reset_confirm' || mode === 'verify') && (
            <div className="mt-3 flex items-center justify-center">
              <button
                type="button"
                onClick={() => { 
                  setMode(mode === 'verify' ? 'signup' : 'signin'); 
                  setError(''); 
                }}
                className="text-xs text-zinc-400 hover:text-white font-mono flex items-center gap-1 transition"
              >
                ← Back to {mode === 'verify' ? 'Edit Details' : 'Sign In'}
              </button>
            </div>
          )}
        </div>

        {/* Modal Form Body */}
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
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage || 'Action completed successfully!'}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* 1. VERIFICATION CODE MODE (mode === 'verify')                   */}
          {/* ============================================================== */}
          {mode === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              
              {/* Recipient Email Badge */}
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center space-y-1">
                <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                  Verification Code Dispatched To
                </span>
                <span className="text-xs font-bold text-amber-400 font-mono block truncate">
                  {email}
                </span>
              </div>

              {/* Check Inbox Instructions (Never displays code on screen) */}
              <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Check Your Email Inbox
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1">
                    We sent a unique 6-digit verification code to:
                  </p>
                  <p className="text-xs font-mono font-bold text-amber-400 mt-0.5 truncate">
                    {email}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                    Open your email inbox (and spam/promotions folder), copy the 6-digit code, and enter it below.
                  </p>
                </div>
              </div>

              {/* 6-Digit Code Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 font-mono text-center">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl py-3 text-center text-2xl font-black font-mono tracking-[0.5em] text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  autoFocus
                />
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="w-full py-3.5 px-4 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-wider rounded-xl transition flex items-center justify-center gap-2 active:scale-98 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span>Verifying Code...</span>
                ) : (
                  <>
                    <span>Verify & Create Account</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend Section */}
              <div className="text-center pt-1">
                {resendTimer > 0 ? (
                  <span className="text-xs text-zinc-500 font-mono">
                    Resend new code in <span className="text-amber-400 font-bold">{resendTimer}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-xs text-amber-400 hover:text-amber-300 font-mono underline inline-flex items-center gap-1 transition"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Resend 6-Digit Code</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* 2. FORGOT PASSWORD MODE (mode === 'forgot')                    */}
          {/* ============================================================== */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-3">
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
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-wider rounded-xl transition flex items-center justify-center gap-2 active:scale-98 shadow-lg mt-2"
              >
                {isLoading ? (
                  <span>Sending Reset Code...</span>
                ) : (
                  <>
                    <span>Send 6-Digit Reset Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ============================================================== */}
          {/* 3. RESET PASSWORD CONFIRM MODE (mode === 'reset_confirm')      */}
          {/* ============================================================== */}
          {mode === 'reset_confirm' && (
            <form onSubmit={handleResetConfirm} className="space-y-3">
              
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center space-y-1">
                <span className="text-[10px] text-zinc-400 block font-mono">Check your inbox for the reset code sent to:</span>
                <span className="text-xs font-bold text-amber-400 font-mono block truncate">{email}</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 font-mono">
                  Enter 6-Digit Reset Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono tracking-widest placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 font-mono">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
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
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <span>Update Password & Sign In</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ============================================================== */}
          {/* 4. PRIMARY SIGN IN / SIGN UP FORMS                            */}
          {/* ============================================================== */}
          {(mode === 'signin' || mode === 'signup') && (
            <form onSubmit={handlePrimarySubmit} className="space-y-3">
              
              {/* Full Name (Sign Up only) */}
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
                      placeholder="e.g. Santhosh"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
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
                    placeholder="your.email@gmail.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); }}
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

              {/* Mobile Phone (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                      Mobile Phone
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">Optional</span>
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-wider rounded-xl transition flex items-center justify-center gap-2 active:scale-98 shadow-lg mt-2"
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : mode === 'signin' ? (
                  <>
                    <span>Sign In with Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Guarantee Badge */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure 6-Digit Email Verification • Zero Demo Bypasses</span>
          </div>

        </div>

      </div>
    </div>
  );
}
