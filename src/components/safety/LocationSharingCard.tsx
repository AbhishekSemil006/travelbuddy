import { motion } from 'framer-motion';
import { MapPin, Radio, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocationSharing } from '@/hooks/useSafety';
import { formatDistanceToNow } from 'date-fns';

interface LocationSharingCardProps {
  tripId?: string;
  tripTitle?: string;
}

const LocationSharingCard = ({ tripId, tripTitle }: LocationSharingCardProps) => {
  const { sharing, locations, startSharing, stopSharing } = useLocationSharing(tripId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Live Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tripId ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {sharing ? 'Sharing your location' : 'Location sharing off'}
                </p>
                {tripTitle && (
                  <p className="text-xs text-muted-foreground">Trip: {tripTitle}</p>
                )}
              </div>
              <Button
                variant={sharing ? 'destructive' : 'default'}
                size="sm"
                onClick={sharing ? stopSharing : startSharing}
                className="gap-2"
              >
                {sharing ? (
                  <><WifiOff className="h-4 w-4" /> Stop</>
                ) : (
                  <><Radio className="h-4 w-4" /> Start</>
                )}
              </Button>
            </div>

            {sharing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <motion.span
                  className="h-2 w-2 rounded-full bg-success"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                Live • Visible to trip members
              </motion.div>
            )}

            {locations.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground">Trip members sharing</p>
                {locations.map(loc => (
                  <div key={loc.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      <span className="text-foreground">Member</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(loc.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Join an active trip to share your live location with travel partners</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationSharingCard;
