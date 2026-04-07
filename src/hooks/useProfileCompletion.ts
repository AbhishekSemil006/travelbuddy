import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useProfileCompletion = () => {
  const { user } = useAuth();
  const [isComplete, setIsComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!user) {
      setIsComplete(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Mongoose logic hook mock
    // E.g. assume they are complete for now if they have a name
    const check = async () => {
      setIsComplete(true);
      setLoading(false);
    };

    check();
  }, [user, refreshKey]);

  return { isComplete, loading, refetch };
};
