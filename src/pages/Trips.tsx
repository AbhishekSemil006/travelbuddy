import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

import { useTrips } from '@/hooks/useTrips';
import type { TripFiltersState } from '@/hooks/useTrips';
import TripFiltersBar from '@/components/trips/TripFiltersBar';
import TripCard from '@/components/trips/TripCard';
import CreateTripDialog from '@/components/trips/CreateTripDialog';

const Trips = () => {
  const { user } = useAuth();
  const { trips, loading, fetchTrips, filterTrips, joinTrip } = useTrips();
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useState<TripFiltersState>({
    search: '',
    femaleOnly: false,
    interests: [],
    budgetMax: '',
  });
  const [userInterests, setUserInterests] = useState<string[] | null>(null);

  useEffect(() => {
    if (!user) return;
    setUserInterests(user.interests || []);
  }, [user]);

  const filtered = filterTrips(trips, filters, { interests: userInterests });

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Trips</h1>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Trip
        </Button>
      </div>

      <TripFiltersBar filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Map className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">No trips found</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {trips.length === 0
              ? 'Create your first trip and find travel partners.'
              : 'Try adjusting your filters to see more trips.'}
          </p>
        </motion.div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((trip, i) => (
            <TripCard
              key={trip.id}
              trip={trip}
              index={i}
              isOwnTrip={trip.creator?._id === user?._id}
              onJoin={joinTrip}
              matchScore={(trip as any)._matchScore}
            />
          ))}
        </div>
      )}

      <CreateTripDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={fetchTrips}
      />
    </div>
  );
};

export default Trips;
