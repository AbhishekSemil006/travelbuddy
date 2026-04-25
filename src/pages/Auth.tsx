import { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, User, ArrowRight, Loader2, Plane, Globe, Shield, Phone } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '688702959118-75vemdmvec7no7trl0tctm14ju2da6tq.apps.googleusercontent.com';

type AuthMode = 'login' | 'signup' | 'forgot';

const Auth = () => {
  const { user, loading, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Use a ref to always hold the latest callback so Google's GSI never calls a stale closure
  const googleCallbackRef = useRef<(response: any) => void>();

  const handleGoogleCallback = useCallback(async (response: any) => {
    if (!response.credential) {
      toast.error('Google sign-in failed — no credential received');
      return;
    }
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle(response.credential);
      if (error) throw error;
      toast.success('Signed in with Google — enjoy your journey!');
      navigate('/', { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  }, [signInWithGoogle, navigate]);

  // Keep the ref in sync with the latest callback
  useEffect(() => {
    googleCallbackRef.current = handleGoogleCallback;
  }, [handleGoogleCallback]);

  // Load Google Identity Services script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    // Stable wrapper that delegates to the latest callback via ref
    const stableCallback = (response: any) => {
      googleCallbackRef.current?.(response);
    };

    const loadGoogleScript = () => {
      if (document.getElementById('google-gsi-script')) return;
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initializeGoogle();
      document.head.appendChild(script);
    };

    const initializeGoogle = () => {
      if (!(window as any).google?.accounts?.id) return;
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: stableCallback,
        auto_select: false,
      });
      if (googleBtnRef.current) {
        // Clear previous rendered button
        googleBtnRef.current.innerHTML = '';
        (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      }
    };

    if ((window as any).google?.accounts?.id) {
      initializeGoogle();
    } else {
      loadGoogleScript();
    }
  }, [mode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-orange-500/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        toast.success('Password reset email sent! Check your inbox.');
        setMode('login');
      } else if (mode === 'signup') {
        const result = await signUp(email, password, fullName, mobileNo || undefined);
        if (result.error) throw result.error;
        if (result.needsEmailConfirmation) {
          toast.success('Almost there! Check your email to verify your account.');
          setMode('login');
        } else {
          toast.success('You\'re all set — welcome to TravelBuddy!');
          navigate('/', { replace: true });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Hey, good to see you again!');
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* ── Left side — Gradient visual ── */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-gradient-to-br from-primary via-rose-500 to-orange-500 overflow-hidden">
        {/* Animated orbs */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-white/10 -top-32 -left-32 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full bg-orange-300/20 bottom-20 right-10 blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 text-center text-white px-12 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Plane className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-4xl font-display font-black mb-4 leading-tight">
              Your Next Adventure<br />Starts Here
            </h2>
            <p className="text-white/80 text-base leading-relaxed mb-8">
              Join thousands of verified travelers discovering safe, meaningful adventures together.
            </p>

            <div className="flex justify-center gap-6">
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                  <Globe className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold">120+ Countries</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold">ID Verified</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                  <User className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold">10K+ Users</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right side — Auth form ── */}
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-8 relative">
        {/* Subtle gradient background for mobile */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-orange-500/3 lg:hidden" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="mx-auto flex justify-center"
            >
              <img src="/logo.png" alt="TravelBuddy Logo" className="h-28 sm:h-36" />
            </motion.div>
            <h1 className="font-display text-2xl font-black bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              TravelBuddy
            </h1>
          </div>

          {/* Auth Card */}
          <div className="mt-4 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/5 p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="mb-5"
              >
                <h2 className="text-xl font-bold text-foreground">
                  {mode === 'login' && 'Welcome back'}
                  {mode === 'signup' && 'Create account'}
                  {mode === 'forgot' && 'Reset password'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {mode === 'login' && 'Sign in to continue your journey ✈️'}
                  {mode === 'signup' && 'Start your travel adventure 🌍'}
                  {mode === 'forgot' && "We'll send you a reset link 📧"}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="space-y-4">
              {/* Google OAuth */}
              {mode !== 'forgot' && (
                <div className="relative">
                  {googleLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80 rounded-md">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                  {GOOGLE_CLIENT_ID ? (
                    <div ref={googleBtnRef} className="flex justify-center [&>div]:!w-full" />
                  ) : (
                    <Button variant="outline" className="w-full gap-2" type="button" disabled>
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Google Sign-In
                    </Button>
                  )}
                </div>
              )}

              {mode !== 'forgot' && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground">or continue with email</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-semibold">Full name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="Your name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-9 rounded-xl h-11 border-border/60 focus-visible:ring-primary/30"
                        required
                      />
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="mobileNo" className="text-xs font-semibold">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="mobileNo"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={mobileNo}
                        onChange={(e) => setMobileNo(e.target.value)}
                        className="pl-9 rounded-xl h-11 border-border/60 focus-visible:ring-primary/30"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 rounded-xl h-11 border-border/60 focus-visible:ring-primary/30"
                      required
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9 rounded-xl h-11 border-border/60 focus-visible:ring-primary/30"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gap-2 h-11 rounded-xl font-bold bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 border-0 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' && 'Sign in'}
                      {mode === 'signup' && 'Create account'}
                      {mode === 'forgot' && 'Send reset link'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="flex flex-col items-center gap-1.5 pt-2 text-sm">
                {mode === 'login' && (
                  <>
                    <button
                      onClick={() => setMode('forgot')}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Forgot password?
                    </button>
                    <p className="text-muted-foreground">
                      Don't have an account?{' '}
                      <button
                        onClick={() => setMode('signup')}
                        className="font-semibold text-primary hover:underline"
                      >
                        Sign up
                      </button>
                    </p>
                  </>
                )}
                {mode === 'signup' && (
                  <p className="text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="font-semibold text-primary hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                )}
                {mode === 'forgot' && (
                  <button
                    onClick={() => setMode('login')}
                    className="font-semibold text-primary hover:underline"
                  >
                    Back to sign in
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
