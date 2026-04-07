import { motion } from 'framer-motion';
import { Shield, History, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SOSButton from '@/components/safety/SOSButton';
import EmergencyContactsCard from '@/components/safety/EmergencyContactsCard';
import LocationSharingCard from '@/components/safety/LocationSharingCard';

import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { SOSAlert } from '@/hooks/useSafety';

const Safety = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<SOSAlert[]>([]);

  useEffect(() => {
    if (!user) return;
    setHistory([]);
  }, [user]);

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <Shield className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Safety</h1>
            <p className="text-sm text-muted-foreground">Your emergency tools</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <SOSButton />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <EmergencyContactsCard />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <LocationSharingCard />
      </motion.div>

      {/* SOS History */}
      {history.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                SOS History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {history.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(alert.created_at), 'MMM d, yyyy HH:mm')}
                      </p>
                      {alert.latitude && (
                        <p className="text-xs text-muted-foreground">
                          Location: {alert.latitude.toFixed(4)}, {alert.longitude?.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={alert.status === 'active' ? 'destructive' : 'secondary'}
                    className="text-[10px]"
                  >
                    {alert.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Safety;
