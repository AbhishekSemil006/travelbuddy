import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface TripCreator {
  _id?: string;
  email?: string;
  display_name?: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean | null;
  gender?: string | null;
  interests?: string[] | null;
}

export interface TripWithCreator {
  _id: string;
  id: string; // fallback if needed
  creator: TripCreator;
  title: string;
  description: string | null;
  destination: string;
  startDate: string;
  endDate: string;
  budgetMin: number | null;
  budgetMax: number | null;
  maxParticipants: number;
  visibility: string;
  status: string;
  femaleOnly: boolean;
  interests: string[] | null;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TripFiltersState {
  search: string;
  femaleOnly: boolean;
  interests: string[];
  budgetMax: string;
}

export const useTrips = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripWithCreator[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/trips');
      if (res && res.data && res.data.trips) {
        // Map _id over to id so frontend doesn't break
        const mappedTrips = res.data.trips.map((t: any) => ({
          ...t,
          id: t._id,
        }));
        setTrips(mappedTrips);
      } else {
        setTrips([]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const filterTrips = (
    allTrips: TripWithCreator[],
    filters: TripFiltersState,
    userProfile?: { interests: string[] | null }
  ) => {
    let filtered = [...allTrips];

    // Search
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          t.destination.toLowerCase().includes(s) ||
          (t.description ?? '').toLowerCase().includes(s)
      );
    }

    // Female-only
    if (filters.femaleOnly) {
      filtered = filtered.filter((t) => t.femaleOnly);
    }

    // Interests
    if (filters.interests.length > 0) {
      filtered = filtered.filter((t) =>
        t.interests?.some((i) => filters.interests.includes(i))
      );
    }

    // Budget
    if (filters.budgetMax) {
      const max = parseFloat(filters.budgetMax);
      filtered = filtered.filter(
        (t) => !t.budgetMax || t.budgetMax <= max
      );
    }

    // Compute match scores based on shared interests
    if (userProfile?.interests && userProfile.interests.length > 0) {
      filtered = filtered.map((t) => {
        const tripInterests = t.interests ?? [];
        const shared = tripInterests.filter((i) =>
          userProfile.interests!.includes(i)
        );
        const totalUnique = new Set([...tripInterests, ...userProfile.interests!]).size;
        const score = totalUnique > 0 ? Math.round((shared.length / totalUnique) * 100) : 0;
        return { ...t, _matchScore: score };
      });

      // Sort by match score desc, then by date
      filtered.sort((a, b) => {
        const sa = (a as any)._matchScore ?? 0;
        const sb = (b as any)._matchScore ?? 0;
        return sb - sa || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return filtered;
  };

  const joinTrip = async (tripId: string) => {
    if (!user) return;
    try {
      await api.post(`/trips/${tripId}/join`, {});
      toast.success('Join request sent!');
      fetchTrips();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send join request');
    }
  };

  return { trips, loading, fetchTrips, filterTrips, joinTrip };
};
