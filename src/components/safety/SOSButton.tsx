import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSOSAlert } from '@/hooks/useSafety';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SOSButton = () => {
  const { activeAlert, triggerSOS, resolveSOS } = useSOSAlert();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResolve, setShowResolve] = useState(false);

  if (activeAlert) {
    return (
      <>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          {/* Pulsing ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl bg-destructive/20"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <div className="relative rounded-2xl border-2 border-destructive bg-destructive/10 p-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.5, repeatDelay: 2 }}
              >
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </motion.div>
              <div className="flex-1">
                <p className="font-semibold text-destructive">SOS Active</p>
                <p className="text-xs text-destructive/80">
                  Emergency contacts have been notified
                  {activeAlert.latitude && ` • Location shared`}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setShowResolve(true)}
              >
                Resolve
              </Button>
            </div>
          </div>
        </motion.div>

        <AlertDialog open={showResolve} onOpenChange={setShowResolve}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Resolve SOS Alert?</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark your emergency as resolved and notify your contacts that you're safe.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Active</AlertDialogCancel>
              <AlertDialogAction onClick={resolveSOS} className="bg-success hover:bg-success/90">
                <ShieldCheck className="h-4 w-4 mr-2" /> I'm Safe
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          variant="destructive"
          size="lg"
          className="w-full h-20 rounded-2xl text-lg font-bold shadow-lg gap-3"
          onClick={() => setShowConfirm(true)}
        >
          <AlertTriangle className="h-7 w-7" />
          SOS Emergency
        </Button>
      </motion.div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Activate Emergency SOS?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately share your location and notify all your emergency contacts.
              Only use this in a real emergency.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => triggerSOS()}
            >
              <AlertTriangle className="h-4 w-4 mr-2" /> Send SOS
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SOSButton;
