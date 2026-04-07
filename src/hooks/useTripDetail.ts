import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ParticipantProfile {
  _id: string;
  id?: string;
  display_name: string | null;
  avatarUrl: string | null;
  isVerified: boolean | null;
}

export interface Participant {
  _id: string;
  id: string;
  userId: string;
  tripId: string;
  status: 'invited' | 'requested' | 'accepted' | 'declined' | 'pending';
  joinedAt: string;
  profile?: ParticipantProfile;
}

export interface TripDetail {
  _id: string;
  id: string;
  creator: any;
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

export const useTripDetail = (tripId: string | undefined) => {
  const { user } = useAuth();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [creatorProfile, setCreatorProfile] = useState<ParticipantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userParticipation, setUserParticipation] = useState<Participant | null>(null);

  const fetchTripDetail = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);

    try {
      const res = await api.get(`/trips/${tripId}`);
      if (res && res.data) {
        const tripData = {
          ...res.data.trip,
          id: res.data.trip._id,
        };
        setTrip(tripData);
        setCreatorProfile(tripData.creator);

        // Parse participants from response
        const parts: Participant[] = (res.data.participants || []).map((p: any) => ({
          ...p,
          id: p._id || p.id,
          // Map 'pending' to 'requested' for frontend display
          status: p.status === 'pending' ? 'requested' : p.status,
        }));
        setParticipants(parts);

        // Find current user's participation
        if (user) {
          const myEntry = parts.find((p) => p.userId === user._id);
          setUserParticipation(myEntry || null);
        } else {
          setUserParticipation(null);
        }
      } else {
        toast.error('Trip not found');
      }
    } catch (error) {
      toast.error('Trip not found');
    } finally {
      setLoading(false);
    }
  }, [tripId, user]);

  useEffect(() => {
    fetchTripDetail();
  }, [fetchTripDetail]);

  const isCreator =
    !!(user && trip && trip.creator &&
      (user._id === trip.creator._id?.toString() || user._id === trip.creator._id));

  const acceptParticipant = async (participantId: string) => {
    if (!tripId) return;
    // participantId here is the participant's subdoc _id, but we need the userId
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) return;
    try {
      await api.patch(`/trips/${tripId}/participants/${participant.userId}/accept`, {});
      toast.success('Participant accepted!');
      fetchTripDetail();
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept');
    }
  };

  const declineParticipant = async (participantId: string) => {
    if (!tripId) return;
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) return;
    try {
      await api.patch(`/trips/${tripId}/participants/${participant.userId}/decline`, {});
      toast.success('Request declined');
      fetchTripDetail();
    } catch (error: any) {
      toast.error(error.message || 'Failed to decline');
    }
  };

  const removeParticipant = async (participantId: string) => {
    if (!tripId) return;
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) return;
    try {
      await api.delete(`/trips/${tripId}/participants/${participant.userId}`);
      toast.success('Participant removed');
      fetchTripDetail();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove');
    }
  };

  const updateTripStatus = async (status: 'active' | 'completed' | 'cancelled') => {
    if (!tripId) return;
    try {
      await api.patch(`/trips/${tripId}`, { status });
      toast.success(`Trip marked as ${status}`);
      fetchTripDetail();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const requestToJoin = async () => {
    if (!user || !tripId) return;
    try {
      await api.post(`/trips/${tripId}/join`, {});
      toast.success('Join request sent!');
      fetchTripDetail();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send request');
    }
  };

  const leaveTrip = async () => {
    if (!tripId) return;
    try {
      await api.delete(`/trips/${tripId}/leave`);
      toast.success('You left the trip');
      fetchTripDetail();
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave trip');
    }
  };

  return {
    trip,
    participants,
    creatorProfile,
    loading,
    isCreator,
    userParticipation,
    acceptParticipant,
    declineParticipant,
    removeParticipant,
    updateTripStatus,
    requestToJoin,
    leaveTrip,
    refetch: fetchTripDetail,
  };
};
