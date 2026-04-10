import { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Shield, ShieldCheck, UserCircle, Loader2, MoreVertical, Ban, Trash2, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  status: string;
  fineAmount: number;
  createdAt: string;
}

const roleBadge: Record<string, string> = {
  admin: 'bg-red-500/15 text-red-500 border-red-500/30',
  moderator: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  user: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
};

const roleIcon: Record<string, ReactNode> = {
  admin: <ShieldCheck className="h-3.5 w-3.5" />,
  moderator: <Shield className="h-3.5 w-3.5" />,
  user: <UserCircle className="h-3.5 w-3.5" />,
};

const AdminUsers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals state
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [userToFine, setUserToFine] = useState<UserData | null>(null);
  const [fineAmount, setFineAmount] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
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

  const handleToggleBlock = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/block`, {});
      toast.success('User status updated');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status');
    }
  };

  const handleToggleVerify = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/verify`, {});
      toast.success('User verification updated');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update verification');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/admin/users/${userToDelete._id}`);
      toast.success('User permanently deleted');
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const handleFineUser = async () => {
    if (!userToFine || !fineAmount) return;
    const amount = parseInt(fineAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await api.patch(`/admin/users/${userToFine._id}/fine`, { amount });
      toast.success(`User fined $${amount}`);
      setUserToFine(null);
      setFineAmount('');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to fine user');
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          Manage Users
        </h1>
        <p className="text-muted-foreground mt-1">
          {users.length} total users on the platform
        </p>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="user">User</option>
        </select>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border bg-card overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">User</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">Status / Fines</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">Role</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">Verified</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * idx }}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold uppercase shrink-0">
                        {u.name?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{u.name || '—'}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${u.status === 'blocked' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {u.status || 'active'}
                      </span>
                      {(u.fineAmount || 0) > 0 && (
                        <span className="text-xs font-medium text-amber-600">
                          Fines: ${u.fineAmount}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleBadge[u.role] || roleBadge.user}`}>
                      {roleIcon[u.role] || roleIcon.user}
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {u.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                        <CheckCircle className="h-4 w-4" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <XCircle className="h-4 w-4" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleVerify(u._id)}>
                          {u.isVerified ? 'Remove Verification' : 'Verify User'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setUserToFine(u)}>
                          <DollarSign className="mr-2 h-4 w-4" /> Issue Fine
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleToggleBlock(u._id)}
                          className={u.status === 'blocked' ? 'text-emerald-600' : 'text-amber-600'}
                        >
                          <Ban className="mr-2 h-4 w-4" /> {u.status === 'blocked' ? 'Unblock User' : 'Block User'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setUserToDelete(u)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No users found matching your criteria.
          </div>
        )}
      </motion.div>

      {/* Delete User Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user <strong>{userToDelete?.name}</strong>, their profile, and all trips they have created. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fine User Dialog */}
      <Dialog open={!!userToFine} onOpenChange={() => setUserToFine(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Fine</DialogTitle>
            <DialogDescription>
              This will add a monetary fine to <strong>{userToFine?.name}</strong>'s account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-medium text-muted-foreground">$</span>
              <Input 
                type="number"
                min="1"
                placeholder="0.00"
                value={fineAmount}
                onChange={(e) => setFineAmount(e.target.value)}
                className="text-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToFine(null)}>Cancel</Button>
            <Button onClick={handleFineUser} className="bg-amber-600 hover:bg-amber-700 text-white">Apply Fine</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
