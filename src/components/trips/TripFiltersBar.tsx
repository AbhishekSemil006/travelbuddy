import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SlidersHorizontal, Search } from 'lucide-react';

const INTEREST_OPTIONS = [
  'Hiking', 'Beach', 'Culture', 'Food', 'Photography',
  'Adventure', 'History', 'Nightlife', 'Nature', 'Shopping',
];

export interface TripFilters {
  search: string;
  femaleOnly: boolean;
  interests: string[];
  budgetMax: string;
}

interface TripFiltersBarProps {
  filters: TripFilters;
  onChange: (filters: TripFilters) => void;
}

const TripFiltersBar = ({ filters, onChange }: TripFiltersBarProps) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const activeCount = [
    filters.femaleOnly,
    filters.interests.length > 0,
    !!filters.budgetMax,
  ].filter(Boolean).length;

  const applyFilters = () => {
    onChange(localFilters);
  };

  const resetFilters = () => {
    const reset: TripFilters = { search: '', femaleOnly: false, interests: [], budgetMax: '' };
    setLocalFilters(reset);
    onChange(reset);
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search trips or destinations…"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
              {activeCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {activeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Trips</SheetTitle>
            </SheetHeader>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 space-y-6"
            >
              {/* Female-only */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Female-only trips</p>
                  <p className="text-xs text-muted-foreground">Show only female-safe trips</p>
                </div>
                <Switch
                  checked={localFilters.femaleOnly}
                  onCheckedChange={(v) => setLocalFilters({ ...localFilters, femaleOnly: v })}
                />
              </div>

              {/* Budget */}
              <div className="space-y-1.5">
                <Label>Max Budget ($)</Label>
                <Input
                  type="number"
                  placeholder="Any"
                  value={localFilters.budgetMax}
                  onChange={(e) => setLocalFilters({ ...localFilters, budgetMax: e.target.value })}
                  min={0}
                />
              </div>

              {/* Interests */}
              <div className="space-y-1.5">
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((item) => (
                    <Badge
                      key={item}
                      variant={localFilters.interests.includes(item) ? 'default' : 'outline'}
                      className="cursor-pointer transition-colors"
                      onClick={() =>
                        setLocalFilters({
                          ...localFilters,
                          interests: localFilters.interests.includes(item)
                            ? localFilters.interests.filter((i) => i !== item)
                            : [...localFilters.interests, item],
                        })
                      }
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={resetFilters}>
                  Reset
                </Button>
                <Button className="flex-1" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default TripFiltersBar;
