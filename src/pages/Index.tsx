import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { useTrips } from '@/hooks/useTrips';
import { Compass, Shield, Users, MapPin, ArrowRight, Sparkles, Plane, Sun, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TripCard from '@/components/trips/TripCard';

const quickActions = [
  { icon: Compass, title: 'Explore Trips', desc: 'Find your next adventure', path: '/trips', gradient: 'from-primary to-rose-500' },
  { icon: Users, title: 'Find Buddies', desc: 'Match with travelers', path: '/trips', gradient: 'from-amber-500 to-orange-500' },
  { icon: Shield, title: 'Safety Center', desc: 'SOS & emergency tools', path: '/safety', gradient: 'from-emerald-500 to-teal-500' },
];

const trendingDestinations = [
  { name: 'Bali', emoji: '🏝️', travelers: 312, color: 'from-emerald-400/20 to-teal-500/20 border-emerald-500/20' },
  { name: 'Kyoto', emoji: '⛩️', travelers: 189, color: 'from-pink-400/20 to-rose-500/20 border-rose-500/20' },
  { name: 'Lisbon', emoji: '🏛️', travelers: 247, color: 'from-amber-400/20 to-orange-500/20 border-orange-500/20' },
  { name: 'Patagonia', emoji: '🏔️', travelers: 156, color: 'from-sky-400/20 to-blue-500/20 border-blue-500/20' },
];

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trips, loading, joinTrip } = useTrips();
  const [userInterests, setUserInterests] = useState<string[] | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (!user) return;
    setUserInterests(user.interests || []);
  }, [user]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Show top 3 trips sorted by match score
  const topTrips = trips
    .filter((t) => t.creator?._id !== user?._id)
    .map((t) => {
      const tripInterests = t.interests ?? [];
      const uInterests = userInterests ?? [];
      const shared = tripInterests.filter((i) => uInterests.includes(i));
      const totalUnique = new Set([...tripInterests, ...uInterests]).size;
      const score = totalUnique > 0 ? Math.round((shared.length / totalUnique) * 100) : 0;
      return { ...t, _matchScore: score };
    })
    .sort((a, b) => b._matchScore - a._matchScore)
    .slice(0, 3);

  return (
    <div className="px-4 pt-4 pb-8">
      {/* ── Welcome Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <div className="flex items-center gap-2 mb-0.5">
          <Sun className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{greeting}</span>
        </div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          {user?.fullName || user?.email || 'Traveler'}{' '}
          <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Ready for your next adventure?</p>
      </motion.div>

      {/* ── Search bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/trips')}
          className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3.5 text-left transition-all hover:shadow-md hover:shadow-primary/5 hover:border-primary/30 group"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/10 to-orange-500/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-orange-500/20 transition-colors">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">Where do you want to go?</span>
          <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground/50 group-hover:text-primary transition-colors" />
        </button>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
              onClick={() => navigate(action.path)}
              className="group flex flex-col items-center text-center rounded-2xl border bg-card p-4 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
            >
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-2.5 shadow-sm group-hover:shadow-md transition-shadow`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-bold text-foreground">{action.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{action.desc}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Top Matching Trips ── */}
      {!loading && topTrips.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Plane className="h-4 w-4 text-primary" />
              Top Trips for You
            </h2>
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary font-semibold hover:text-primary/80" onClick={() => navigate('/trips')}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-3">
            {topTrips.map((trip, i) => (
              <TripCard
                key={trip.id}
                trip={trip}
                index={i}
                onJoin={joinTrip}
                matchScore={trip._matchScore}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Trending Destinations ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="font-display text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Trending Destinations
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {trendingDestinations.map((place, i) => (
            <motion.button
              key={place.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 + i * 0.05 }}
              onClick={() => navigate('/trips')}
              className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${place.color} p-4 text-left transition-all hover:shadow-md hover:-translate-y-0.5 group`}
            >
              <span className="text-2xl mb-2 block">{place.emoji}</span>
              <p className="font-display text-sm font-bold text-foreground">{place.name}</p>
              <p className="text-xs text-muted-foreground">{place.travelers} travelers</p>
              <div className="flex items-center gap-0.5 mt-1.5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Explore CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-rose-500 to-orange-500 p-5 text-center">
          <div className="absolute inset-0 overflow-hidden opacity-20">
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 bg-white rounded-full"
                style={{ left: `${20 + i * 20}%`, top: `${30 + (i % 2) * 30}%` }}
                animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>
          <p className="text-white font-bold text-sm mb-2 relative z-10">Ready to explore? ✈️</p>
          <Button
            size="sm"
            variant="secondary"
            className="font-bold text-xs gap-1 relative z-10 shadow-lg"
            onClick={() => navigate('/trips')}
          >
            Browse All Trips <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
