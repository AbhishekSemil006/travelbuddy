import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Loader2, Plane, Trash2, Edit3, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface TripData {
  _id: string;
  title: string;
  destination: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  status: string;
  visibility: string;
  interests: string[];
  createdAt: string;
  creator?: {
    name: string;
    email: string;
  };
}

const statusBadge: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  draft: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
  completed: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border border-red-500/30',
};

const AdminTrips = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedTrip, setSelectedTrip] = useState<any>(null); // Full trip details
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    destination: '',
    status: '',
    maxParticipants: 4
  });

  const fetchTrips = async () => {
    try {
      const res = await api.get('/admin/trips');
      setTrips(res.data || []);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchTrips();
  }, [user, navigate]);

  const handleOpenTrip = async (id: string) => {
    try {
      const res = await api.get(`/admin/trips/${id}`);
      setSelectedTrip(res.data);
      setEditForm({
        title: res.data.title,
        destination: res.data.destination,
        status: res.data.status,
        maxParticipants: res.data.maxParticipants
      });
      setIsEditMode(false);
      setIsDetailOpen(true);
    } catch (err: any) {
      toast.error('Failed to load trip details');
    }
  };

  const handleUpdateTrip = async () => {
    try {
      await api.patch(`/admin/trips/${selectedTrip._id}`, editForm);
      toast.success('Trip updated successfully');
      setIsDetailOpen(false);
      fetchTrips();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update trip');
    }
  };

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;
    try {
      await api.delete(`/admin/trips/${tripToDelete}`);
      toast.success('Trip deleted');
      setTripToDelete(null);
      setIsDetailOpen(false);
      fetchTrips();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete trip');
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
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <Plane className="h-8 w-8 text-primary" />
          Manage Trips
        </h1>
        <p className="text-muted-foreground mt-1">
          {trips.length} trips on the platform
        </p>
      </motion.div>

      {/* Trip Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip, idx) => (
          <motion.div
            key={trip._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * idx }}
            onClick={() => handleOpenTrip(trip._id)}
            className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer space-y-3 relative group"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-base leading-tight pr-16">{trip.title}</h3>
              <span className={`absolute top-5 right-5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadge[trip.status] || statusBadge.draft}`}>
                {trip.status}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{trip.destination}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>By {trip.creator?.name || 'Unknown'} • Max {trip.maxParticipants}</span>
              </div>
            </div>

            {trip.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-2 bg-muted/50 p-2 rounded">{trip.description}</p>
            )}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t mt-3">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {trips.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">No trips found.</div>
      )}

      {/* Trip Detail/Edit Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between mt-2">
            <div>
              <DialogTitle className="text-xl">
                {isEditMode ? 'Edit Trip Details' : 'Trip Details & Members'}
              </DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Force update trip configuration.' : 'View trip context and participant roster.'}
              </DialogDescription>
            </div>
            {!isEditMode && (
              <div className="flex gap-2 mr-4">
                <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
                  <Edit3 className="h-4 w-4 mr-2" /> Modify Trip
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setTripToDelete(selectedTrip?._id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            )}
          </DialogHeader>

          {selectedTrip && !isEditMode && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Title</p>
                  <p className="font-medium">{selectedTrip.title}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Destination</p>
                  <p className="font-medium">{selectedTrip.destination}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Status</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusBadge[selectedTrip.status] || statusBadge.draft}`}>
                    {selectedTrip.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Budget</p>
                  <p className="font-medium">${selectedTrip.budgetMin || 0} - ${selectedTrip.budgetMax || 'Unknown'}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" /> 
                  Participants ({selectedTrip.participants?.length || 0} / {selectedTrip.maxParticipants})
                </h3>
                
                <div className="space-y-3 mt-4">
                  {/* Creator */}
                  <div className="flex items-center justify-between border-b pb-3 border-border/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary">{selectedTrip.creator?.name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm leading-none">{selectedTrip.creator?.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{selectedTrip.creator?.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">CREATOR</span>
                  </div>

                  {/* Members */}
                  {selectedTrip.participants?.map((p: any) => (
                    <div key={p._id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-muted-foreground">{p.profile?.displayName?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm leading-none">{p.profile?.displayName}</p>
                          <p className="text-xs text-muted-foreground mt-1">Joined {new Date(p.joinedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${p.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600' : p.status === 'declined' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600'}`}>
                        {p.status.toUpperCase()}
                      </span>
                    </div>
                  ))}

                  {selectedTrip.participants?.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No members have requested to join yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedTrip && isEditMode && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Trip Title</Label>
                <Input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Destination</Label>
                <Input value={editForm.destination} onChange={e => setEditForm({...editForm, destination: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Participants</Label>
                  <Input type="number" min="2" value={editForm.maxParticipants} onChange={e => setEditForm({...editForm, maxParticipants: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editForm.status} 
                    onChange={e => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-2 justify-end pt-4">
                <Button variant="ghost" onClick={() => setIsEditMode(false)}>Cancel</Button>
                <Button onClick={handleUpdateTrip}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Trip Dialog */}
      <AlertDialog open={!!tripToDelete} onOpenChange={() => setTripToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip Route?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this trip? This removes it for the creator and all associated participants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTrip} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete Trip</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTrips;
