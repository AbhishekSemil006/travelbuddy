import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, MapPin, MessageCircle, ArrowRight,
  Sparkles, Globe, Heart, Mail, Plane, Star, ChevronRight,
  CheckCircle, Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const features = [
  {
    icon: Users,
    title: 'Smart Matching',
    desc: 'Our algorithm pairs you with verified travelers who share your interests, budget, and travel style.',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    icon: Shield,
    title: 'Safety First',
    desc: 'ID-verified users, real-time SOS alerts, live location sharing, and female-only trip options.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: MapPin,
    title: 'Trip Planning',
    desc: 'Create trips, set budgets, pick destinations, and invite compatible travel companions.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: MessageCircle,
    title: 'Real-time Chat',
    desc: 'Message your travel partners with read receipts, typing indicators, and instant notifications.',
    gradient: 'from-violet-500 to-purple-500',
  },
];

const stats = [
  { value: '10K+', label: 'Happy Travelers', icon: '✈️' },
  { value: '2.5K+', label: 'Trips Created', icon: '🗺️' },
  { value: '98%', label: 'Safety Score', icon: '🛡️' },
  { value: '120+', label: 'Countries', icon: '🌍' },
];

const destinations = [
  { name: 'Bali', travelers: 312, emoji: '🏝️', color: 'from-emerald-400 to-teal-500' },
  { name: 'Kyoto', travelers: 189, emoji: '⛩️', color: 'from-pink-400 to-rose-500' },
  { name: 'Lisbon', travelers: 247, emoji: '🏛️', color: 'from-amber-400 to-orange-500' },
  { name: 'Patagonia', travelers: 156, emoji: '🏔️', color: 'from-sky-400 to-blue-500' },
  { name: 'Santorini', travelers: 203, emoji: '🏖️', color: 'from-blue-400 to-indigo-500' },
  { name: 'Marrakech', travelers: 178, emoji: '🕌', color: 'from-red-400 to-rose-500' },
];

const testimonials = [
  { name: 'Priya M.', text: 'Found the most amazing travel group to Bali. Felt safe and connected!', avatar: '🧑‍🦱' },
  { name: 'James L.', text: 'The matching algorithm is insane — met people who love the exact same hikes.', avatar: '👨‍🦰' },
  { name: 'Aiko T.', text: 'Female-only mode made me feel so comfortable exploring solo for the first time.', avatar: '👩' },
];

const SHARE_URL = 'https://travelbuddy-sandy.vercel.app/landing';
const SHARE_TEXT = 'Check out TravelBuddy — find your perfect travel companion! 🌍✈️';

const Landing = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { toast } = useToast();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleShare = async () => {
    const shareData = {
      title: 'TravelBuddy',
      text: SHARE_TEXT,
      url: SHARE_URL,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${SHARE_TEXT}\n${SHARE_URL}`);
        toast({ title: 'Link copied!', description: 'Share it with your friends 🎉' });
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        await navigator.clipboard.writeText(`${SHARE_TEXT}\n${SHARE_URL}`);
        toast({ title: 'Link copied!', description: 'Share it with your friends 🎉' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ══ Navbar ══ */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="TravelBuddy Logo" className="h-9 w-9 object-contain" />
            <span className="font-display text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              TravelBuddy
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="font-medium">
              Log in
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 border-0 shadow-lg shadow-primary/25 font-semibold"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* ══ Hero Section ══ */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="glow-orb w-[500px] h-[500px] bg-primary/30 -top-20 -left-20"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="glow-orb w-[400px] h-[400px] bg-orange-400/25 top-1/3 right-0"
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="glow-orb w-[300px] h-[300px] bg-violet-400/20 bottom-0 left-1/3"
            animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 w-full">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 md:items-center md:py-16">
            {/* Left — Copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-semibold text-primary"
              >
                <Sparkles className="h-4 w-4" />
                #1 Travel Companion Platform
              </motion.div>
              <h1 className="mb-5 font-display text-4xl font-black leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
                Find Your Perfect{' '}
                <span className="bg-gradient-to-r from-primary via-rose-500 to-orange-500 bg-clip-text text-transparent animate-gradient">
                  Travel Buddy
                </span>
              </h1>
              <p className="mb-8 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                Join thousands of verified travelers exploring the world together — safely matched
                by interests, budget & vibes. Your next adventure starts here.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="gap-2 text-base font-bold bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 border-0 shadow-xl shadow-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02]"
                >
                  Start Exploring <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base font-semibold backdrop-blur-sm"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  How It Works
                </Button>
              </div>

              {/* Social proof */}
              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['🧑‍🦱', '👩‍🦰', '👨', '👩‍🦳', '🧑'].map((e, i) => (
                    <div key={i} className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-orange-200 border-2 border-background flex items-center justify-center text-sm">
                      {e}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Loved by 10,000+ travelers</p>
                </div>
              </div>
            </motion.div>

            {/* Right — Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/30 via-orange-400/20 to-violet-400/20 blur-3xl" />
                <img
                  src="/hero-bg.png"
                  alt="Travelers exploring together"
                  className="relative w-full max-w-md rounded-[1.5rem] border border-white/20 shadow-2xl shadow-primary/15 object-cover"
                  loading="eager"
                />
                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute -bottom-4 -left-4 rounded-2xl bg-card/95 backdrop-blur-lg border shadow-xl px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">100% Verified</p>
                      <p className="text-[10px] text-muted-foreground">ID-checked travelers</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="absolute -top-3 -right-3 rounded-2xl bg-card/95 backdrop-blur-lg border shadow-xl px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Globe className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">120+ Countries</p>
                      <p className="text-[10px] text-muted-foreground">Worldwide community</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ══ Stats Marquee ══ */}
      <section className="relative border-y bg-gradient-to-r from-primary/5 via-orange-500/5 to-violet-500/5">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <span className="text-2xl mb-1 block">{stat.icon}</span>
              <p className="font-display text-3xl font-black bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ Features ══ */}
      <section id="features" className="scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary uppercase tracking-widest mb-3">
              <Plane className="h-4 w-4" /> How it works
            </span>
            <h2 className="mb-3 font-display text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                Travel Safely
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-base">
              From finding the perfect travel partner to built-in safety features — TravelBuddy has you covered.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-2xl border bg-card p-7 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-[4rem] bg-gradient-to-bl from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-2 font-display text-xl font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Trending Destinations ══ */}
      <section className="relative border-t bg-gradient-to-b from-secondary/50 to-background">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary uppercase tracking-widest mb-3">
              <Globe className="h-4 w-4" /> Trending now
            </span>
            <h2 className="mb-3 font-display text-3xl font-black text-foreground sm:text-4xl">
              Destinations Our Travelers Love
            </h2>
            <p className="text-muted-foreground">Join travelers heading to these popular spots</p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {destinations.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group cursor-pointer rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                onClick={() => navigate('/auth')}
              >
                <div className={`mb-3 h-12 w-12 rounded-xl bg-gradient-to-br ${dest.color} flex items-center justify-center text-xl shadow-sm`}>
                  {dest.emoji}
                </div>
                <p className="font-display text-lg font-bold text-foreground">{dest.name}</p>
                <p className="text-xs text-muted-foreground">{dest.travelers} travelers</p>
                <div className="mt-2 flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-semibold">Explore</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Testimonials ══ */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 font-display text-3xl font-black text-foreground sm:text-4xl">
              What Travelers Say
            </h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border bg-card p-6 relative"
              >
                <div className="absolute top-4 right-4 text-4xl opacity-10 font-serif">"</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/20 to-orange-200 border-2 border-background flex items-center justify-center text-xl">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t.name}</p>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-rose-500 to-orange-500 p-10 text-center sm:p-16"
          >
            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
                  animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
                />
              ))}
            </div>
            <div className="relative z-10">
              <Plane className="mx-auto mb-4 h-10 w-10 text-white/80" />
              <h2 className="mb-4 font-display text-3xl font-black text-white sm:text-4xl lg:text-5xl">
                Ready for Your Next Adventure?
              </h2>
              <p className="mx-auto mb-8 max-w-lg text-white/80 text-base sm:text-lg">
                Join thousands of verified travelers discovering safe, meaningful adventures together.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 text-base font-bold shadow-xl hover:scale-[1.03] transition-transform"
                onClick={() => navigate('/auth')}
              >
                Create Free Account <ArrowRight className="h-5 w-5" />
              </Button>
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-white/70 text-sm">
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" />Free forever</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" />No credit card</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" />Verified community</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ Developer Card ══ */}
      <section className="border-t bg-secondary/30 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="group relative w-full max-w-md overflow-hidden rounded-3xl border bg-card p-8 text-center shadow-sm transition-all duration-300 hover:shadow-xl sm:p-10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-primary/20 to-orange-400/20 shadow-lg">
                  <span className="font-display text-4xl font-bold bg-gradient-to-br from-primary to-orange-500 bg-clip-text text-transparent">AS</span>
                </div>
                <h3 className="mb-1 font-display text-2xl font-bold text-foreground">
                  Abhishek Semil
                </h3>
                <p className="mb-4 text-sm font-semibold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  Full Stack Developer
                </p>
                <p className="mb-8 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                  Crafted with <Heart className="h-4 w-4 fill-primary text-primary" /> for travelers
                </p>
                <div className="flex justify-center gap-4">
                  <a
                    href="https://github.com/AbhishekSemil006"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:scale-110"
                    aria-label="GitHub"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:scale-110"
                    aria-label="LinkedIn"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                  </a>
                  <a
                    href="abhisheksemil700@gmail.com"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:scale-110"
                    aria-label="Email"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ Footer ══ */}
      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="TravelBuddy Logo" className="h-6 w-6 object-contain" />
            <span className="font-display text-sm font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              TravelBuddy
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TravelBuddy. Travel safe, travel together. ✈️
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
