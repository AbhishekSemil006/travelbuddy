import { useAuth } from '@/contexts/AuthContext';

export const useAdminRole = () => {
  const { user, loading } = useAuth();
  
  // Calculate synchronously to avoid first-render flash of !isAdmin
  const isAdmin = user?.role === 'admin';

  return { isAdmin, loading };
};
