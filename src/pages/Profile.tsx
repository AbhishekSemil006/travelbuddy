import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { toast } from 'sonner';
import { LogOut, Camera, Shield, Loader2, Save, Settings, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const INTEREST_OPTIONS = ['Hiking', 'Beach', 'Culture', 'Food', 'Photography', 'Adventure', 'History', 'Nightlife', 'Nature', 'Shopping', 'Wellness', 'Road Trips'];
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Hindi', 'Arabic', 'Portuguese', 'Korean', 'Italian', 'Russian'];
const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

const verificationBadge = {
  approved: { icon: CheckCircle, label: 'Verified', variant: 'default' as const, color: 'text-emerald-500' },
  pending: { icon: Clock, label: 'Pending Review', variant: 'secondary' as const, color: 'text-amber-500' },
  rejected: { icon: XCircle, label: 'Rejected', variant: 'destructive' as const, color: 'text-destructive' },
  none: { icon: Shield, label: 'Unverified', variant: 'outline' as const, color: 'text-muted-foreground' },
};

const Profile = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminRole();
  const navigate = useNavigate();
  
// 🔒 Protect route
  if (!user) {
   return <Navigate to="/auth" replace />;
  }
 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('none');
  const [uploadingId, setUploadingId] = useState(false);

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
          setInterests(p.interests || []);
          setLanguages(p.languages || []);
          setAvatarUrl(p.avatarUrl || null);
        }
        if (res?.data?.user) {
          const u = res.data.user;
          if (u.isVerified) {
            setVerificationStatus('approved');
          } else if (u.governmentId) {
            setVerificationStatus('pending');
          } else {
            setVerificationStatus('none');
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

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
        interests,
        languages,
      });
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }

    toast.success('Avatar updated! (stub)');
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit ID document');
    } finally {
      setUploadingId(false);
    }
  };

  const toggleItem = (item: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const vBadge = verificationBadge[verificationStatus as keyof typeof verificationBadge] ?? verificationBadge.none;
  const VIcon = vBadge.icon;

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="gap-1.5">
              <Settings className="h-4 w-4" /> Admin
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-muted-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Avatar + Verification */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
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
          <div className="flex items-center gap-1.5">
            <VIcon className={`h-3.5 w-3.5 ${vBadge.color}`} />
            <Badge variant={vBadge.variant} className="text-xs">{vBadge.label}</Badge>
          </div>
        </div>

        {/* Basic info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name *</Label>
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} />
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
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((item) => (
                <Badge
                  key={item}
                  variant={interests.includes(item) ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleItem(item, interests, setInterests)}
                >
                  {item}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((item) => (
                <Badge
                  key={item}
                  variant={languages.includes(item) ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleItem(item, languages, setLanguages)}
                >
                  {item}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ID Verification */}
        {verificationStatus !== 'approved' && (
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> ID Verification
              </CardTitle>
              <CardDescription>
                {verificationStatus === 'pending'
                  ? 'Your ID is being reviewed. This usually takes 24–48 hours.'
                  : verificationStatus === 'rejected'
                  ? 'Your previous submission was rejected. Please upload a clearer document.'
                  : 'Verify your identity to build trust with other travelers.'}
              </CardDescription>
            </CardHeader>
            {verificationStatus !== 'pending' && (
              <CardContent>
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
                <p className="text-xs text-muted-foreground mt-2 text-center">Accepted: passport, driver's license, or national ID (max 10 MB)</p>
              </CardContent>
            )}
          </Card>
        )}

        <Button className="w-full gap-2" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Profile</>}
        </Button>
      </motion.div>
    </div>
  );
};

export default Profile;
