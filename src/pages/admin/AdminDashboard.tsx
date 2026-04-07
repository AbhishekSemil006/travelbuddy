import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Shield, ShieldCheck, UserCheck, Plane, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface DashboardStats {
  users: number;
  trips: number;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

const statCards = [
  { key: 'users', label: 'Total Users', icon: Users, color: 'from-blue-500 to-cyan-400' },
  { key: 'trips', label: 'Total Trips', icon: Plane, color: 'from-violet-500 to-purple-400' },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/users'),
        ]);
        setStats(statsRes.data || { users: 0, trips: 0 });
        // Show last 5 users
        const allUsers: UserData[] = usersRes.data || [];
        setRecentUsers(allUsers.slice(-5).reverse());
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Platform metrics at a glance.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const value = stats ? stats[card.key as keyof DashboardStats] : 0;

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${card.color} opacity-20 blur-2xl`} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-4xl font-bold tracking-tight">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border bg-card shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Recent Users
          </h2>
          <button
            onClick={() => navigate('/admin/users')}
            className="text-sm text-primary hover:underline"
          >
            View all →
          </button>
        </div>

        <div className="divide-y">
          {recentUsers.map((u, idx) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold uppercase">
                  {u.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium">{u.name || '—'}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'admin'
                      ? 'bg-red-500/15 text-red-400'
                      : u.role === 'moderator'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                  }`}
                >
                  {u.role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : u.role === 'moderator' ? <Shield className="h-3 w-3" /> : null}
                  {u.role}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {recentUsers.length === 0 && (
          <div className="py-10 text-center text-muted-foreground text-sm">
            No users found.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
