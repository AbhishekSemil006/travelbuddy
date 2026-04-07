import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { useTrips } from '@/hooks/useTrips';
import { Compass, Shield, Users, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TripCard from '@/components/trips/TripCard';

const features = [
  { icon: Users, title: 'Find Partners', desc: 'Match with verified travelers who share your interests' },
  { icon: Shield, title: 'Travel Safe', desc: 'ID-verified users, SOS alerts & female-safe routing' },
  { icon: MapPin, title: 'Plan Trips', desc: 'Create trips, set budgets & invite travel companions' },
];

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trips, loading, joinTrip } = useTrips();
  const [userInterests, setUserInterests] = useState<string[] | null>(null);

  useEffect(() => {
    if (!user) return;
    setUserInterests(user.interests || []);
  }, [user]);

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
    <div className="px-4 pt-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-sm text-muted-foreground">
          Hello, {user?.fullName || user?.email || 'Traveler'} 👋
        </p>
        <h1 className="text-2xl font-bold text-foreground">Explore</h1>
      </motion.div>

      {/* Search placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/trips')}
          className="flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-accent"
        >
          <Compass className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Where do you want to go?</span>
        </button>
      </motion.div>

      {/* Feature cards */}
      <div className="space-y-3">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="flex items-start gap-4 rounded-xl border bg-card p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <feature.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top Matching Trips */}
      {!loading && topTrips.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Top Trips for You</h2>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => navigate('/trips')}>
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

      {/* Trending destinations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 pb-4"
      >
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Trending Destinations</h2>
        <div className="grid grid-cols-2 gap-3">
          {['Bali', 'Kyoto', 'Lisbon', 'Patagonia'].map((place, i) => (
            <motion.button
              key={place}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.05 }}
              onClick={() => navigate('/trips')}
              className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 to-primary/15 p-4 text-left transition-colors hover:from-primary/10"
            >
              <MapPin className="mb-2 h-4 w-4 text-primary" />
              <p className="font-display text-sm font-semibold text-foreground">{place}</p>
              <p className="text-xs text-muted-foreground">12 travelers</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
