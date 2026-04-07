import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface LocationShare {
  id: string;
  user_id: string;
  trip_id: string | null;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  is_active: boolean;
  updated_at: string;
}

export interface SOSAlert {
  id: string;
  user_id: string;
  trip_id: string | null;
  latitude: number | null;
  longitude: number | null;
  message: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
}

export function useEmergencyContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const loading = false;

  const fetch = useCallback(async () => {
    // Stub
    setContacts([]);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addContact = async (contact: { name: string; phone: string; relationship?: string; is_primary?: boolean }) => {
    toast.success('Emergency contact added (stub)');
    fetch();
  };

  const updateContact = async (id: string, updates: Partial<EmergencyContact>) => {
    toast.success('Contact updated (stub)');
    fetch();
  };

  const deleteContact = async (id: string) => {
    toast.success('Contact removed (stub)');
    fetch();
  };

  return { contacts, loading, addContact, updateContact, deleteContact, refetch: fetch };
}

export function useSOSAlert() {
  const [activeAlert, setActiveAlert] = useState<SOSAlert | null>(null);
  const loading = false;

  const triggerSOS = async (tripId?: string) => {
    toast.success('🚨 SOS alert sent to your emergency contacts (stub)');
    return null;
  };

  const resolveSOS = async () => {
    setActiveAlert(null);
    toast.success('SOS alert resolved (stub)');
  };

  return { activeAlert, loading, triggerSOS, resolveSOS };
}

export function useLocationSharing(tripId?: string) {
  const [sharing, setSharing] = useState(false);
  const [locations, setLocations] = useState<LocationShare[]>([]);

  const startSharing = async () => {
    setSharing(true);
    toast.success('Location sharing started (stub)');
  };

  const stopSharing = async () => {
    setSharing(false);
    toast.success('Location sharing stopped (stub)');
  };

  return { sharing, locations, startSharing, stopSharing };
}
