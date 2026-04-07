import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Camera, ArrowRight, ArrowLeft, Loader2, Check, User, Heart, Globe } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const INTEREST_OPTIONS = ['Hiking', 'Beach', 'Culture', 'Food', 'Photography', 'Adventure', 'History', 'Nightlife', 'Nature', 'Shopping', 'Wellness', 'Road Trips'];
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Hindi', 'Arabic', 'Portuguese', 'Korean', 'Italian', 'Russian'];

const STEPS = [
  { key: 'welcome', icon: User, title: "Let's set up your profile", subtitle: 'Help other travelers get to know you' },
  { key: 'interests', icon: Heart, title: 'What do you love?', subtitle: 'Pick your travel interests (at least 3)' },
  { key: 'languages', icon: Globe, title: 'Languages you speak', subtitle: 'Connect with travelers who speak your language' },
];

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    if (user?.fullName) setDisplayName(user.fullName);
    if (user?.avatarUrl) setAvatarUrl(user.avatarUrl);
  }, [user]);

  const progress = ((step + 1) / STEPS.length) * 100;

  const toggleItem = (item: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    // Stub avatar upload
    toast.success('Photo uploaded!');
  };

  const canContinue = () => {
    if (step === 0) return displayName.trim().length >= 2;
    if (step === 1) return interests.length >= 3;
    if (step === 2) return languages.length >= 1;
    return true;
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Mock submit
      toast.success('Profile created successfully! 🎉');
      navigate('/');
    } catch(err) {
      toast.error('Failed to update profile');
      setSaving(false);
      return;
    }
    toast.success('Welcome back!');
    navigate('/', { replace: true });
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (step === STEPS.length - 1) { handleFinish(); return; }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="px-6 pt-6">
        <Progress value={progress} className="h-1.5" />
        <p className="text-xs text-muted-foreground mt-2">Step {step + 1} of {STEPS.length}</p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-6"
          >
            {/* Step header */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                {(() => { const Icon = STEPS[step].icon; return <Icon className="h-6 w-6 text-primary" />; })()}
              </div>
              <h1 className="text-2xl font-bold text-foreground">{STEPS[step].title}</h1>
              <p className="text-sm text-muted-foreground">{STEPS[step].subtitle}</p>
            </div>

            {/* Step 0: Avatar + Name + Bio */}
            {step === 0 && (
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-primary/20">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                        {displayName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                      <Camera className="h-4 w-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">Tap to add a photo</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Display name *</label>
                  <Input
                    placeholder="What should we call you?"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={50}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Bio</label>
                  <Textarea
                    placeholder="Tell other travelers about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    maxLength={300}
                  />
                  <p className="text-xs text-muted-foreground text-right">{bio.length}/300</p>
                </div>
              </div>
            )}

            {/* Step 1: Interests */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  {INTEREST_OPTIONS.map((item) => (
                    <Badge
                      key={item}
                      variant={interests.includes(item) ? 'default' : 'outline'}
                      className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
                      onClick={() => toggleItem(item, interests, setInterests)}
                    >
                      {interests.includes(item) && <Check className="h-3 w-3 mr-1" />}
                      {item}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {interests.length} selected — {interests.length < 3 ? `pick ${3 - interests.length} more` : 'looking good!'}
                </p>
              </div>
            )}

            {/* Step 2: Languages */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  {LANGUAGE_OPTIONS.map((item) => (
                    <Badge
                      key={item}
                      variant={languages.includes(item) ? 'default' : 'outline'}
                      className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
                      onClick={() => toggleItem(item, languages, setLanguages)}
                    >
                      {languages.includes(item) && <Check className="h-3 w-3 mr-1" />}
                      {item}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {languages.length} selected
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="px-6 pb-8 max-w-md mx-auto w-full flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={goBack} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        )}
        <Button
          className="flex-1 gap-1.5"
          onClick={goNext}
          disabled={!canContinue() || saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : step === STEPS.length - 1 ? (
            <>Complete <Check className="h-4 w-4" /></>
          ) : (
            <>Continue <ArrowRight className="h-4 w-4" /></>
          )}
        </Button>
      </div>

      {/* Skip option */}
      {step < STEPS.length - 1 && (
        <div className="text-center pb-6">
          <button
            onClick={() => navigate('/', { replace: true })}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
