import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle, Trash2, Loader2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface UserData {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
}

const AdminVerifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      // Filter only unverified users
      const pending = (res.data || []).filter((u: UserData) => !u.isVerified);
      setUsers(pending);
    } catch (err) {
      console.error('Failed to fetch verification queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const handleVerify = async (id: string) => {
    try {
      await api.patch(`/admin/users/${id}/verify`, {});
      toast.success('User verified successfully');
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify user');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User rejected and removed');
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-primary" />
          Pending Verifications
        </h1>
        <p className="text-muted-foreground mt-1">
          {users.length} users waiting for identity verification
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u, idx) => (
          <motion.div
            key={u._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border bg-card p-5 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold uppercase shrink-0">
                {u.name?.charAt(0) || <UserCircle />}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-base truncate">{u.name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground truncate">{u.email}</p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Registered: {new Date(u.createdAt).toLocaleDateString()}</p>
              <p className="text-xs mt-1 italic">Awaiting document review (mock)</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button 
                onClick={() => handleVerify(u._id)} 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Approve
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleReject(u._id)} 
                className="flex-none px-3 text-destructive border-destructive/20 hover:bg-destructive/10"
                title="Reject & Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}

        {users.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-12 w-12 text-emerald-500/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">All caught up!</h3>
            <p className="text-muted-foreground mt-1">There are no pending verifications in the queue.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminVerifications;
