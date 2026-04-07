import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useTripDetail, Participant } from '@/hooks/useTripDetail';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft, CalendarDays, MapPin, Users, DollarSign, Heart, ShieldCheck,
  Loader2, Check, X, UserMinus, LogOut, Play, CheckCircle, XCircle, Clock, MessageCircle,
} from 'lucide-react';
import { useStartConversation } from '@/hooks/useMessages';

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  completed: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/30',
  draft: 'bg-muted text-muted-foreground border-border',
};

const participantStatusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  accepted: { icon: CheckCircle, color: 'text-emerald-600', label: 'Accepted' },
  requested: { icon: Clock, color: 'text-amber-600', label: 'Pending' },
  declined: { icon: XCircle, color: 'text-destructive', label: 'Declined' },
  invited: { icon: Clock, color: 'text-blue-600', label: 'Invited' },
};

const ParticipantRow = ({
  p, isCreator, onAccept, onDecline, onRemove, onMessage,
}: {
  p: Participant; isCreator: boolean;
  onAccept: (id: string) => void; onDecline: (id: string) => void; onRemove: (id: string) => void;
  onMessage?: (userId: string) => void;
}) => {
  const cfg = participantStatusConfig[p.status] ?? participantStatusConfig.requested;
  const StatusIcon = cfg.icon;

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={p.profile?.avatarUrl ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {(p.profile?.display_name ?? '?')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground">{p.profile?.display_name ?? 'Unknown'}</span>
            {p.profile?.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <StatusIcon className={`h-3 w-3 ${cfg.color}`} />
            <span className={cfg.color}>{cfg.label}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {onMessage && p.status === 'accepted' && (
          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => onMessage(p.userId)}>
            <MessageCircle className="h-3 w-3" /> Message
          </Button>
        )}
        {isCreator && (
          <>
            {p.status === 'requested' && (
              <>
                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => onAccept(p.id)}>
                  <Check className="h-3 w-3" /> Accept
                </Button>
                <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs text-destructive" onClick={() => onDecline(p.id)}>
                  <X className="h-3 w-3" /> Decline
                </Button>
              </>
            )}
            {p.status === 'accepted' && (
              <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs text-destructive" onClick={() => onRemove(p.id)}>
                <UserMinus className="h-3 w-3" /> Remove
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const TripDetail = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    trip, participants, creatorProfile, loading, isCreator, userParticipation,
    acceptParticipant, declineParticipant, removeParticipant,
    updateTripStatus, requestToJoin, leaveTrip,
  } = useTripDetail(tripId);
  const { startConversation } = useStartConversation();

  const handleMessage = async (otherUserId: string) => {
    const convoId = await startConversation(otherUserId);
    if (convoId) navigate(`/messages?conversation=${convoId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-muted-foreground">Trip not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/trips')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Trips
        </Button>
      </div>
    );
  }

  const accepted = participants.filter((p) => p.status === 'accepted');
  const pending = participants.filter((p) => p.status === 'requested');
  const spotsLeft = trip.maxParticipants - accepted.length;

  return (
    <div className="px-4 pt-4 pb-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-3 -ml-2 gap-1.5 text-muted-foreground" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Hero header */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-accent p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`text-xs border ${statusColors[trip.status]}`}>
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </Badge>
                {trip.femaleOnly && (
                  <Badge className="bg-destructive/90 text-destructive-foreground text-xs border-0">
                    <Heart className="mr-1 h-3 w-3" /> Female Only
                  </Badge>
                )}
              </div>
              <h1 className="text-xl font-bold text-foreground">{trip.title}</h1>
            </div>
          </div>

          {/* Creator info */}
          <div className="flex items-center gap-2 mt-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={creatorProfile?.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-background/50 text-foreground text-xs font-semibold">
                {(creatorProfile?.display_name ?? '?')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-foreground">{creatorProfile?.display_name ?? 'Unknown'}</span>
              {creatorProfile?.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />}
              <span className="text-xs text-muted-foreground ml-1">• Organizer</span>
            </div>
          </div>
        </div>

        {/* Trip details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Trip Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trip.description && <p className="text-sm text-muted-foreground">{trip.description}</p>}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{trip.destination}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span>{format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 shrink-0" />
                <span>{accepted.length + 1}/{trip.maxParticipants} travelers</span>
              </div>
              {(trip.budgetMin || trip.budgetMax) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4 shrink-0" />
                  <span>${trip.budgetMin ?? 0} – ${trip.budgetMax ?? '∞'}</span>
                </div>
              )}
            </div>

            {trip.interests && trip.interests.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-1.5">
                  {trip.interests.map((interest) => (
                    <Badge key={interest} variant="outline" className="text-xs">{interest}</Badge>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Participants */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Travelers ({accepted.length + 1}/{trip.maxParticipants})
              </CardTitle>
              {spotsLeft > 0 && (
                <Badge variant="secondary" className="text-xs">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Creator always shows first */}
            <div className="flex items-center gap-3 py-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={creatorProfile?.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {(creatorProfile?.display_name ?? '?')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-foreground">{creatorProfile?.display_name ?? 'Unknown'}</span>
                  {creatorProfile?.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />}
                </div>
                <span className="text-xs text-primary font-medium">Organizer</span>
              </div>
            </div>

            {accepted.length > 0 && (
              <>
                <Separator />
                {accepted.map((p) => (
                  <ParticipantRow key={p.id} p={p} isCreator={isCreator}
                    onAccept={acceptParticipant} onDecline={declineParticipant} onRemove={removeParticipant}
                    onMessage={isCreator ? handleMessage : undefined} />
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Pending requests (creator only) */}
        {isCreator && pending.length > 0 && (
          <Card className="border-amber-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Pending Requests ({pending.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pending.map((p) => (
                <ParticipantRow key={p.id} p={p} isCreator={isCreator}
                  onAccept={acceptParticipant} onDecline={declineParticipant} onRemove={removeParticipant} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <div className="space-y-2 pt-2">
          {/* Non-creator: Join / Leave */}
          {!isCreator && trip.status === 'active' && !userParticipation && spotsLeft > 0 && (
            <Button className="w-full gap-2" onClick={requestToJoin}>
              <Users className="h-4 w-4" /> Request to Join
            </Button>
          )}
          {!isCreator && userParticipation?.status === 'requested' && (
            <Button variant="outline" className="w-full" disabled>
              <Clock className="h-4 w-4 mr-2" /> Request Pending
            </Button>
          )}
          {!isCreator && userParticipation?.status === 'accepted' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/30">
                  <LogOut className="h-4 w-4" /> Leave Trip
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave this trip?</AlertDialogTitle>
                  <AlertDialogDescription>You can request to rejoin later if spots are still available.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={leaveTrip} className="bg-destructive text-destructive-foreground">Leave</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Creator: Status controls */}
          {isCreator && trip.status === 'active' && (
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex-1 gap-1.5">
                    <CheckCircle className="h-4 w-4" /> Complete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Mark trip as completed?</AlertDialogTitle>
                    <AlertDialogDescription>This will close the trip. No more join requests will be accepted.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => updateTripStatus('completed')}>Complete Trip</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex-1 gap-1.5 text-destructive border-destructive/30">
                    <XCircle className="h-4 w-4" /> Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this trip?</AlertDialogTitle>
                    <AlertDialogDescription>All participants will see the trip as cancelled. This cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => updateTripStatus('cancelled')} className="bg-destructive text-destructive-foreground">Cancel Trip</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {isCreator && trip.status === 'cancelled' && (
            <Button className="w-full gap-2" onClick={() => updateTripStatus('active')}>
              <Play className="h-4 w-4" /> Reactivate Trip
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TripDetail;
