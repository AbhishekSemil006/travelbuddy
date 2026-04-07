import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CalendarIcon, Loader2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const INTEREST_OPTIONS = [
  'Hiking', 'Beach', 'Culture', 'Food', 'Photography',
  'Adventure', 'History', 'Nightlife', 'Nature', 'Shopping',
];

interface CreateTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const CreateTripDialog = ({ open, onOpenChange, onCreated }: CreateTripDialogProps) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('4');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [femaleOnly, setFemaleOnly] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDestination('');
    setStartDate(undefined);
    setEndDate(undefined);
    setBudgetMin('');
    setBudgetMax('');
    setMaxParticipants('4');
    setVisibility('public');
    setFemaleOnly(false);
    setInterests([]);
  };

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!title.trim() || !destination.trim() || !startDate || !endDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (endDate < startDate) {
      toast.error('End date must be after start date');
      return;
    }

    setSaving(true);
    try {
      await api.post('/trips', {
        title: title.trim(),
        description: description.trim() || null,
        destination: destination.trim(),
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        budgetMin: budgetMin ? parseFloat(budgetMin) : null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        maxParticipants: parseInt(maxParticipants) || 4,
        visibility,
        femaleOnly: femaleOnly,
        interests,
      });
      toast.success('Trip created!');
      resetForm();
      onOpenChange(false);
      onCreated();
    } catch(error) {
      toast.error('Failed to create trip');
    }


    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a Trip</DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Title & Destination */}
          <div className="space-y-1.5">
            <Label htmlFor="trip-title">Trip Title *</Label>
            <Input
              id="trip-title"
              placeholder="e.g. Backpacking through Southeast Asia"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="trip-dest">Destination *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="trip-dest"
                placeholder="e.g. Bali, Indonesia"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-9"
                maxLength={100}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="trip-desc">Description</Label>
            <Textarea
              id="trip-desc"
              placeholder="Tell others about your trip plans…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(d) => d < new Date()}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'MMM d, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(d) => d < (startDate ?? new Date())}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="budget-min">Budget Min ($)</Label>
              <Input
                id="budget-min"
                type="number"
                placeholder="0"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                min={0}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget-max">Budget Max ($)</Label>
              <Input
                id="budget-max"
                type="number"
                placeholder="5000"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                min={0}
              />
            </div>
          </div>

          {/* Max participants & Visibility */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Max Participants</Label>
              <Select value={maxParticipants} onValueChange={setMaxParticipants}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} people
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as 'public' | 'private')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Female-only toggle */}
          <div className="flex items-center justify-between rounded-lg border bg-card p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Female-only trip</p>
              <p className="text-xs text-muted-foreground">Only verified female travelers can join</p>
            </div>
            <Switch checked={femaleOnly} onCheckedChange={setFemaleOnly} />
          </div>

          {/* Interests */}
          <div className="space-y-1.5">
            <Label>Trip Interests</Label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((item) => (
                <Badge
                  key={item}
                  variant={interests.includes(item) ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleInterest(item)}
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button className="w-full" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Create Trip
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTripDialog;
