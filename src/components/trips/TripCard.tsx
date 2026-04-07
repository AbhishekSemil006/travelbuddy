import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Users, ShieldCheck, DollarSign, Heart } from 'lucide-react';
import type { TripWithCreator } from '@/hooks/useTrips';

interface TripCardProps {
  trip: TripWithCreator;
  index: number;
  onJoin?: (tripId: string) => void;
  isOwnTrip?: boolean;
  matchScore?: number;
}

const TripCard = ({ trip, index, onJoin, isOwnTrip, matchScore }: TripCardProps) => {
  const navigate = useNavigate();
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate(`/trips/${trip.id}`)}>
        {/* Header gradient */}
        <div className="relative h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-accent">
          <div className="absolute inset-0 flex items-end p-4">
            <div className="flex items-center gap-2">
              {trip.femaleOnly && (
              <Badge className="bg-destructive/90 text-destructive-foreground text-xs border-0">
                  <Heart className="mr-1 h-3 w-3" />
                  Female Only
                </Badge>
              )}
              {matchScore !== undefined && matchScore > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {matchScore}% match
                </Badge>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <div>
            <h3 className="font-display text-base font-semibold text-foreground line-clamp-1">
              {trip.title}
            </h3>
            {trip.description && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                {trip.description}
              </p>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {trip.destination}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {format(startDate, 'MMM d')} – {format(endDate, 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Max {trip.maxParticipants}
            </span>
            {(trip.budgetMin || trip.budgetMax) && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                {trip.budgetMin ? `$${trip.budgetMin}` : '$0'} – {trip.budgetMax ? `$${trip.budgetMax}` : '∞'}
              </span>
            )}
          </div>

          {/* Interests */}
          {trip.interests && trip.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {trip.interests.slice(0, 4).map((interest) => (
                <Badge key={interest} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {trip.interests.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{trip.interests.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Creator + Action */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={trip.creator?.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {(trip.creator?.display_name ?? '?')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-foreground">
                  {trip.creator?.display_name ?? 'Unknown'}
                </span>
                {trip.creator?.isVerified && (
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                )}
              </div>
            </div>
            {!isOwnTrip && onJoin && (
              <Button size="sm" onClick={(e) => { e.stopPropagation(); onJoin(trip.id); }}>
                Request to Join
              </Button>
            )}
            {isOwnTrip && (
              <Badge variant="secondary" className="text-xs">Your Trip</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TripCard;
