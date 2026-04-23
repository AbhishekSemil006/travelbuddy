import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  LogOut, Camera, Shield, Loader2, Save, Settings, Upload, CheckCircle, Clock, XCircle,
  MapPin, Calendar, AlertTriangle, Mail, HelpCircle, Flag, ChevronRight, Globe, Heart, Cake,
  User as UserIcon, Phone, Lock, Edit3, Briefcase, MessageSquare, FileText,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

/* ──────────────────────────── Constants ──────────────────────────── */

const INTEREST_OPTIONS = ['Hiking', 'Beach', 'Culture', 'Food', 'Photography', 'Adventure', 'History', 'Nightlife', 'Nature', 'Shopping', 'Wellness', 'Road Trips'];
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Hindi', 'Arabic', 'Portuguese', 'Korean', 'Italian', 'Russian'];
const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

const REPORT_CATEGORIES = [
  { value: 'bug', label: 'Bug' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'other', label: 'Other' },
] as const;

const FAQ_ITEMS = [
  {
    q: 'How do I find travel partners?',
    a: 'Browse the Explore page to discover trips created by other travelers. You can filter by destination, interests, and budget. When you find a trip that interests you, tap "Join" to send a request to the trip creator.',
  },
  {
    q: 'Is my personal information safe?',
    a: 'Yes! We take privacy seriously. Your personal data is encrypted and never shared with third parties. You can control what information is visible to other travelers in your profile settings.',
  },
  {
    q: 'How does ID verification work?',
    a: 'Upload a government-issued ID (passport, driver\'s license, or national ID) from your profile. Our team reviews submissions within 24–48 hours. Verified users receive a badge that builds trust with other travelers.',
  },
  {
    q: 'Can I cancel or leave a trip?',
    a: 'Yes. Navigate to the trip details page and tap "Leave Trip." If you\'re the trip creator, you can cancel the entire trip, which will notify all participants.',
  },
  {
    q: 'How are trip costs split?',
    a: 'Budget details are set by the trip creator during trip creation. We recommend discussing cost-splitting arrangements with your travel group via the in-app messaging feature before the trip.',
  },
];

const verificationBadge = {
  approved: { icon: CheckCircle, label: 'Verified', variant: 'default' as const, color: 'text-emerald-500' },
  pending: { icon: Clock, label: 'Pending Review', variant: 'secondary' as const, color: 'text-amber-500' },
  rejected: { icon: XCircle, label: 'Rejected', variant: 'destructive' as const, color: 'text-destructive' },
  none: { icon: Shield, label: 'Unverified', variant: 'outline' as const, color: 'text-muted-foreground' },
};

/* ──────────────────────────── Types ──────────────────────────── */

type MenuSection = 'account' | 'edit' | 'trips' | 'interests' | 'languages' | 'verification' | 'faq' | 'support' | 'report';

interface UserTrip {
  _id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface MenuItem {
  key: MenuSection;
  label: string;
  icon: React.ElementType;
  description: string;
}

const MENU_ITEMS: MenuItem[] = [
  { key: 'account', label: 'Account Info', icon: UserIcon, description: 'View your account details' },
  { key: 'edit', label: 'Edit Profile', icon: Edit3, description: 'Modify your profile information' },
  { key: 'trips', label: 'My Trips', icon: MapPin, description: 'View your created trips' },
  { key: 'interests', label: 'Interests', icon: Heart, description: 'Manage your travel interests' },
  { key: 'languages', label: 'Languages', icon: Globe, description: 'Set the languages you speak' },
  { key: 'verification', label: 'ID Verification', icon: Shield, description: 'Verify your identity' },
  { key: 'faq', label: 'FAQ', icon: HelpCircle, description: 'Frequently asked questions' },
  { key: 'support', label: 'Support', icon: MessageSquare, description: 'Get help from our team' },
  { key: 'report', label: 'Report Issue', icon: Flag, description: 'Report a problem' },
];

/* ──────────────────────────── Section heading helper ──────────────────────────── */

const SectionHeading = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
  </div>
);

/* ──────────────────────────── Profile component ──────────────────────────── */

const Profile = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminRole();
  const navigate = useNavigate();

  /* active menu */
  const [activeSection, setActiveSection] = useState<MenuSection>('account');

  /* profile state */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('none');
  const [uploadingId, setUploadingId] = useState(false);

  /* user account data (non-editable) */
  const [userEmail, setUserEmail] = useState('');
  const [userMobileNo, setUserMobileNo] = useState('');

  /* trips state */
  const [myTrips, setMyTrips] = useState<UserTrip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);

  /* report modal state */
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  /* support form state */
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitting, setSupportSubmitting] = useState(false);

  /* ── Fetch profile ── */
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/users/me');
        if (res?.data?.profile) {
          const p = res.data.profile;
          setDisplayName(p.displayName || '');
          setBio(p.bio || '');
          setGender(p.gender || '');
          setDateOfBirth(p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '');
          setInterests(p.interests || []);
          setLanguages(p.languages || []);
          setAvatarUrl(p.avatarUrl || null);
        }
        if (res?.data?.user) {
          const u = res.data.user;
          setUserEmail(u.email || '');
          setUserMobileNo(u.mobileNo || '');
          // Use the verificationStatus field from backend for accurate state
          if (u.verificationStatus) {
            setVerificationStatus(u.verificationStatus);
          } else if (u.isVerified) {
            setVerificationStatus('approved');
          } else if (u.governmentId) {
            setVerificationStatus('pending');
          } else {
            setVerificationStatus('none');
          }
          if (u.email) setSupportEmail(u.email);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  /* ── Fetch user's trips ── */
  useEffect(() => {
    if (!user) return;
    const fetchMyTrips = async () => {
      setTripsLoading(true);
      try {
        const res = await api.get('/trips');
        if (res?.data?.trips) {
          const all = res.data.trips as any[];
          const mine = all.filter(
            (t) => t.creator?._id === user._id || t.creator === user._id
          );
          setMyTrips(
            mine.map((t) => ({
              _id: t._id,
              title: t.title,
              destination: t.destination,
              startDate: t.startDate,
              endDate: t.endDate,
              status: t.status || 'upcoming',
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch trips:', err);
      } finally {
        setTripsLoading(false);
      }
    };
    fetchMyTrips();
  }, [user]);

  /* ── Handlers ── */

  const handleSave = async () => {
    if (!user || !displayName.trim()) {
      toast.error('Display name is required');
      return;
    }
    setSaving(true);
    try {
      await api.patch('/users/me', {
        displayName,
        bio,
        gender,
        dateOfBirth: dateOfBirth || undefined,
        interests,
        languages,
      });
      toast.success('Profile updated successfully!');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.postForm('/users/me/upload-avatar', formData);
      if (res?.data?.avatarUrl) {
        setAvatarUrl(res.data.avatarUrl);
      }
      toast.success('Avatar updated successfully!');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to upload avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Document must be under 10 MB'); return; }

    setUploadingId(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.postForm('/users/me/upload-id', formData);
      toast.success('ID submitted successfully for verification!');
      setVerificationStatus('pending');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to submit ID document');
    } finally {
      setUploadingId(false);
    }
  };

  const toggleItem = (item: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleReportSubmit = useCallback(async () => {
    if (!reportCategory) { toast.error('Please select a category'); return; }
    if (!reportDescription.trim()) { toast.error('Please describe the issue'); return; }
    setReportSubmitting(true);
    try {
      // In production this would hit an actual endpoint
      await new Promise((r) => setTimeout(r, 800));
      toast.success('Report submitted. Thank you!');
      setReportOpen(false);
      setReportCategory('');
      setReportDescription('');
    } catch {
      toast.error('Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  }, [reportCategory, reportDescription]);

  const handleSupportSubmit = useCallback(async () => {
    if (!supportEmail.trim()) { toast.error('Please enter your email'); return; }
    if (!supportMessage.trim()) { toast.error('Please describe your issue'); return; }
    setSupportSubmitting(true);
    try {
      // In production this would hit an actual endpoint
      await new Promise((r) => setTimeout(r, 800));
      toast.success('Support request sent! We\'ll get back to you shortly.');
      setSupportMessage('');
    } catch {
      toast.error('Failed to send support request');
    } finally {
      setSupportSubmitting(false);
    }
  }, [supportEmail, supportMessage]);

  /* ── Guards ── */

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const vBadge = verificationBadge[verificationStatus as keyof typeof verificationBadge] ?? verificationBadge.none;
  const VIcon = vBadge.icon;

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  const tripStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  /* ────────────────── Render Content Sections ────────────────── */

  const renderAccountInfo = () => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card>
        <CardHeader className="pb-3">
          <SectionHeading icon={UserIcon} title="Account Information" />
          <CardDescription>Your account details. Email and mobile number cannot be changed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-orange-500/5 border border-border/50">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-md">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {displayName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                <Camera className="h-3.5 w-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">{displayName || 'User'}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <VIcon className={`h-3.5 w-3.5 ${vBadge.color}`} />
                <Badge variant={vBadge.variant} className="text-xs">{vBadge.label}</Badge>
              </div>
            </div>
          </div>

          {/* Email - Read only */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
              <Lock className="h-3 w-3 text-muted-foreground ml-auto" />
            </Label>
            <div className="relative">
              <Input
                value={userEmail}
                disabled
                className="bg-muted/50 cursor-not-allowed text-muted-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground">Email address cannot be modified</p>
          </div>

          {/* Mobile No - Read only */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Mobile Number
              <Lock className="h-3 w-3 text-muted-foreground ml-auto" />
            </Label>
            <div className="relative">
              <Input
                value={userMobileNo || 'Not provided'}
                disabled
                className="bg-muted/50 cursor-not-allowed text-muted-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground">Mobile number cannot be modified</p>
          </div>

          {/* Display Name - Read only preview */}
          <div className="space-y-1.5">
            <Label className="text-sm">Display Name</Label>
            <Input value={displayName || '—'} disabled className="bg-muted/50 cursor-not-allowed" />
          </div>

          {/* Bio - Read only preview */}
          <div className="space-y-1.5">
            <Label className="text-sm">Bio</Label>
            <div className="p-3 rounded-lg bg-muted/50 min-h-[60px] text-sm text-muted-foreground">
              {bio || 'No bio set'}
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <Label className="text-sm">Gender</Label>
            <Input
              value={GENDER_OPTIONS.find(g => g.value === gender)?.label || 'Not specified'}
              disabled
              className="bg-muted/50 cursor-not-allowed"
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              <Cake className="h-3.5 w-3.5 text-muted-foreground" /> Date of Birth
            </Label>
            <Input
              value={dateOfBirth ? formatDate(dateOfBirth) : 'Not specified'}
              disabled
              className="bg-muted/50 cursor-not-allowed"
            />
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setActiveSection('edit')}
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderEditProfile = () => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card>
        <CardHeader className="pb-3">
          <SectionHeading icon={Edit3} title="Edit Profile" />
          <CardDescription>Update your profile details. Email and mobile number cannot be changed here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-md">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {displayName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
          </div>

          {/* Non-editable fields shown as disabled */}
          <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
            <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              Email and mobile number cannot be modified for security reasons.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold">
                <Mail className="h-3 w-3" /> Email <Lock className="h-2.5 w-2.5 ml-1 text-muted-foreground" />
              </Label>
              <Input value={userEmail} disabled className="bg-muted/50 cursor-not-allowed text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold">
                <Phone className="h-3 w-3" /> Mobile <Lock className="h-2.5 w-2.5 ml-1 text-muted-foreground" />
              </Label>
              <Input value={userMobileNo || 'Not provided'} disabled className="bg-muted/50 cursor-not-allowed text-muted-foreground" />
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Display Name *</Label>
            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} placeholder="Your display name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell other travelers about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/300</p>
          </div>
          <div className="space-y-1.5">
            <Label>Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dob" className="flex items-center gap-1.5">
              <Cake className="h-3.5 w-3.5" /> Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
            />
          </div>

          {/* Save */}
          <Button className="w-full gap-2 mt-2" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Changes</>}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderTrips = () => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card>
        <CardHeader className="pb-3">
          <SectionHeading icon={MapPin} title="My Trips" />
        </CardHeader>
        <CardContent>
          {tripsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : myTrips.length === 0 ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">You haven't created any trips yet.</p>
              <Button variant="outline" size="sm" onClick={() => navigate('/trips')} className="gap-1.5">
                Explore Trips <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {myTrips.slice(0, 5).map((trip) => (
                <div
                  key={trip._id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/trips/${trip._id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{trip.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${tripStatusColor(trip.status)}`}>
                      {trip.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
              {myTrips.length > 5 && (
                <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/trips')}>
                  View all {myTrips.length} trips
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderInterests = () => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card>
        <CardHeader className="pb-3">
          <SectionHeading icon={Heart} title="Interests" />
          <CardDescription>Select interests to help find like-minded travel partners.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((item) => (
              <Badge
                key={item}
                variant={interests.includes(item) ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:shadow-sm hover:scale-105"
                onClick={() => toggleItem(item, interests, setInterests)}
              >
                {item}
              </Badge>
            ))}
          </div>
          <Button className="w-full gap-2 mt-4" onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Interests</>}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderLanguages = () => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card>
        <CardHeader className="pb-3">
          <SectionHeading icon={Globe} title="Languages" />
          <CardDescription>Select the languages you speak to connect with more travelers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((item) => (
              <Badge
                key={item}
                variant={languages.includes(item) ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:shadow-sm hover:scale-105"
                onClick={() => toggleItem(item, languages, setLanguages)}
              >
                {item}
              </Badge>
            ))}
          </div>
          <Button className="w-full gap-2 mt-4" onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Languages</>}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderVerification = () => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> ID Verification
          </CardTitle>
          <CardDescription>
            {verificationStatus === 'approved'
              ? 'Your identity has been verified! You now have a verified badge.'
              : verificationStatus === 'pending'
                ? 'Your ID is being reviewed. This usually takes 24–48 hours.'
                : verificationStatus === 'rejected'
                  ? 'Your previous submission was rejected. Please upload a clearer document.'
                  : 'Verify your identity to build trust with other travelers.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Current status badge */}
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-muted/50">
            <VIcon className={`h-5 w-5 ${vBadge.color}`} />
            <div>
              <p className="text-sm font-medium">Status: {vBadge.label}</p>
              <p className="text-xs text-muted-foreground">
                {verificationStatus === 'approved' && 'Your ID has been verified by our team.'}
                {verificationStatus === 'pending' && 'We are reviewing your document.'}
                {verificationStatus === 'rejected' && 'Please re-upload a clearer document.'}
                {verificationStatus === 'none' && 'Upload a government ID to get verified.'}
              </p>
            </div>
          </div>

          {verificationStatus !== 'approved' && verificationStatus !== 'pending' && (
            <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:border-primary/50 transition-colors">
              {uploadingId ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <>
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload government-issued ID</span>
                </>
              )}
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleIdUpload} disabled={uploadingId} />
            </label>
          )}
          {verificationStatus !== 'approved' && verificationStatus !== 'pending' && (
            <p className="text-xs text-muted-foreground mt-2 text-center">Accepted: passport, driver's license, or national ID (max 10 MB)</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderFAQ = () => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card>
        <CardHeader className="pb-3">
          <SectionHeading icon={HelpCircle} title="Frequently Asked Questions" />
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger className="text-sm text-left">{faq.q}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderSupport = () => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card>
        <CardHeader className="pb-3">
          <SectionHeading icon={MessageSquare} title="Customer Support" />
          <CardDescription>Have a question or need help? Send us a message and we'll get back to you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="support-email">Your Email</Label>
            <Input
              id="support-email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="support-message">Message</Label>
            <Textarea
              id="support-message"
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              placeholder="Describe your issue or question..."
              rows={4}
            />
          </div>
          <Button
            className="w-full gap-2"
            variant="outline"
            onClick={handleSupportSubmit}
            disabled={supportSubmitting}
          >
            {supportSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Mail className="h-4 w-4" /> Send Support Request
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderReport = () => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card>
        <CardHeader className="pb-3">
          <SectionHeading icon={Flag} title="Report an Issue" />
          <CardDescription>Let us know what happened. We'll review your report and take appropriate action.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={reportCategory} onValueChange={setReportCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="report-desc">Description</Label>
            <Textarea
              id="report-desc"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Please describe the issue in detail..."
              rows={4}
            />
          </div>
          <Button
            className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white"
            onClick={handleReportSubmit}
            disabled={reportSubmitting}
          >
            {reportSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Submit Report</>}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const contentMap: Record<MenuSection, () => React.ReactNode> = {
    account: renderAccountInfo,
    edit: renderEditProfile,
    trips: renderTrips,
    interests: renderInterests,
    languages: renderLanguages,
    verification: renderVerification,
    faq: renderFAQ,
    support: renderSupport,
    report: renderReport,
  };

  /* ────────────────── Render ────────────────── */

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="gap-1.5">
              <Settings className="h-4 w-4" /> Admin
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ───────── User Menu Sidebar ───────── */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:w-72 shrink-0"
        >
          <Card className="sticky top-6">
            {/* Mini profile card in the menu */}
            <CardContent className="pt-5 pb-3">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
                <Avatar className="h-12 w-12 border border-primary/20">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{displayName || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>
              </div>

              {/* Menu items */}
              <nav className="space-y-1">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveSection(item.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                      <span className="truncate">{item.label}</span>
                      {item.key === 'verification' && (
                        <Badge
                          variant={vBadge.variant}
                          className="ml-auto text-[10px] px-1.5 py-0"
                        >
                          {vBadge.label}
                        </Badge>
                      )}
                      {isActive && (
                        <ChevronRight className="h-3.5 w-3.5 ml-auto shrink-0" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Sign out */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <Button
                  className="w-full gap-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700 border-0"
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ───────── Content Area ───────── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection}>
              {contentMap[activeSection]()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ───────── Report Modal (legacy support) ───────── */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Report an Issue
            </DialogTitle>
            <DialogDescription>
              Let us know what happened. We'll review your report and take appropriate action.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={reportCategory} onValueChange={setReportCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="report-desc-modal">Description</Label>
              <Textarea
                id="report-desc-modal"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Please describe the issue in detail..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button
              className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleReportSubmit}
              disabled={reportSubmitting}
            >
              {reportSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Submit Report</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
