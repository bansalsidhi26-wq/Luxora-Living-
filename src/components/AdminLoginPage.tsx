import { FormEvent, useState } from 'react';
import {
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';

interface AdminLoginPageProps {
  currentUser: User | null;
  isAuthorizedAdmin: boolean;
  onExitAdmin: () => void;
}

function mapAuthError(err: unknown): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code?: unknown }).code)
      : '';
  const msg = err instanceof Error ? err.message : '';

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Invalid administrator email or password. Please verify your credentials and try again.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many failed attempts. Please wait a few minutes or reset your password.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Email/Password sign-in is not yet enabled in Firebase Console → Authentication → Sign-in method. You can enable it there or sign in with Google below.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in popup was closed before completion.';
  }
  return msg || 'Authentication failed. Please try again.';
}

export function AdminLoginPage({
  currentUser,
  isAuthorizedAdmin,
  onExitAdmin,
}: AdminLoginPageProps) {
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your administrator email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setErrorMsg(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setErrorMsg(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const targetEmail = resetEmail.trim() || email.trim();
    if (!targetEmail) {
      setErrorMsg('Please enter your administrator email address.');
      return;
    }
    setSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setResetSent(true);
    } catch (err) {
      setErrorMsg(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendVerification = async () => {
    if (!currentUser) return;
    setErrorMsg('');
    try {
      await sendEmailVerification(currentUser);
      setVerificationSent(true);
    } catch (err) {
      setErrorMsg(mapAuthError(err));
    }
  };

  const handleSignOut = async () => {
    setErrorMsg('');
    await signOut(auth);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-5 py-12 bg-[#F5F1EA] dark:bg-[#141412] text-[#252522] dark:text-[#F5F1EA]">
      <div className="w-full max-w-md mx-auto rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/70 dark:border-[#F5F1EA]/12 p-7 sm:p-10 shadow-xl space-y-6">
        <div className="space-y-3 text-center">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 text-xs text-[#5A5851] dark:text-[#B8B2A6] hover:text-[#C6A15B] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Studio</span>
            </button>
          </div>

          <div className="pt-1">
            <div className="font-serif text-3xl tracking-[0.15em]">LUXORA LIVING</div>
            <p className="text-xs tracking-[0.16em] uppercase text-[#A8843F] dark:text-[#C6A15B] mt-1">
              Studio Administration Portal
            </p>
          </div>
        </div>

        {/* Signed in but unverified email or non-admin */}
        {currentUser && !isAuthorizedAdmin ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-start gap-3 text-xs text-red-900 dark:text-red-200">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="font-semibold">
                  {!currentUser.emailVerified
                    ? 'Email Verification Required'
                    : 'Administrator Access Restricted'}
                </p>
                <p className="leading-relaxed">
                  {!currentUser.emailVerified ? (
                    <>
                      Your account <strong>{currentUser.email}</strong> must verify its email address before accessing protected studio data.
                    </>
                  ) : (
                    <>
                      The account <strong>{currentUser.email}</strong> does not have studio administrator privileges.
                    </>
                  )}
                </p>
              </div>
            </div>

            {!currentUser.emailVerified && (
              <div className="space-y-2">
                {verificationSent ? (
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5 text-center">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verification email dispatched. Refresh after confirming.</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    className="w-full py-2.5 rounded-full border border-[#C6A15B] text-[#A8843F] dark:text-[#C6A15B] text-xs font-medium hover:bg-[#C6A15B]/10 transition-colors"
                  >
                    Send Verification Email
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-3 rounded-full bg-[#252522] dark:bg-[#C6A15B] text-[#F5F1EA] dark:text-[#141412] text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Sign Out &amp; Switch Account
            </button>
          </div>
        ) : mode === 'forgot' ? (
          <div className="space-y-5">
            <div className="space-y-1 text-center">
              <h1 className="font-serif text-2xl">Reset Administrator Password</h1>
              <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed">
                Enter your authorized studio email address and we will send a secure password reset link.
              </p>
            </div>

            {resetSent ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Reset Link Sent</span>
                </div>
                <p>
                  If an administrator account exists for <strong>{resetEmail || email}</strong>, check your inbox for instructions.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium">Administrator Email</span>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8C887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="admin@luxoraliving.studio"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>
                </label>

                {errorMsg && (
                  <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed text-center">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-full bg-[#C6A15B] text-[#141412] text-sm font-medium hover:bg-[#b5904b] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Sending Reset Email...' : 'Send Password Reset Link'}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setResetSent(false);
                setErrorMsg('');
              }}
              className="w-full text-center text-xs text-[#5A5851] dark:text-[#B8B2A6] hover:text-[#C6A15B] transition-colors"
            >
              Back to Administrator Sign In
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-1 text-center">
              <h1 className="font-serif text-2xl">Administrator Sign In</h1>
              <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed">
                Protected access for authorized studio administrators to manage products, orders, customers, and website content.
              </p>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <label className="block space-y-1.5 text-xs">
                <span className="font-medium">Email Address</span>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="bansalsidhi26@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>
              </label>

              <label className="block space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Password</span>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setMode('forgot');
                      setErrorMsg('');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-[#A8843F] dark:text-[#C6A15B] hover:underline"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Forgot password?</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#5A5851] dark:text-[#B8B2A6] hover:text-[#C6A15B] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </label>

              {errorMsg && (
                <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-lg px-3 py-2">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-full bg-[#C6A15B] text-[#141412] text-sm font-medium hover:bg-[#b5904b] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Signing In...' : 'Sign In to Dashboard'}
              </button>
            </form>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10" />
              <span className="shrink-0 mx-3 text-[11px] uppercase tracking-wider text-[#5A5851] dark:text-[#B8B2A6]">
                Or
              </span>
              <div className="flex-grow border-t border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10" />
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleGoogleLogin}
              className="w-full py-3 rounded-full border border-[#D8C7B0] dark:border-[#F5F1EA]/20 text-xs font-medium hover:border-[#C6A15B] transition-colors disabled:opacity-50"
            >
              Continue with Authorized Google Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
