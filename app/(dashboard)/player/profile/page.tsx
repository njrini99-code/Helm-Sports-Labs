'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { logError } from '@/lib/utils/errorLogger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  MapPin,
  Ruler,
  Target,
  School,
  Link as LinkIcon,
  Save,
  ArrowLeft,
  Camera,
  Plus,
  Trash2,
  GraduationCap,
} from 'lucide-react';
import {
  glassCardPremium,
  glassPanel as glassPanelEnhanced,
  glassButton as glassButtonEnhanced,
  glassDarkZone as glassDarkZoneEnhanced,
  cn as cnEnhanced,
} from '@/lib/glassmorphism-enhanced';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { useTheme } from '@/lib/theme-context';
import { toast } from 'sonner';
import { POSITIONS, GRAD_YEARS, US_STATES, PLAYER_GOALS } from '@/lib/types';
import type { Player } from '@/lib/types';
import Link from 'next/link';
import { CollegeSearchSelect } from '@/components/colleges/CollegeSearchSelect';
import { 
  getRecruitingInterests, 
  addRecruitingInterest, 
  deleteRecruitingInterest,
  type RecruitingInterest 
} from '@/lib/api/player/recruitingInterests';
import { isDevMode, DEV_ENTITY_IDS, DEV_USER_IDS } from '@/lib/dev-mode';

function ProfileEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'basic';
  const { isDark } = useTheme();
  
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [recruitingInterests, setRecruitingInterests] = useState<RecruitingInterest[]>([]);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    grad_year: '',
    high_school_name: '',
    high_school_city: '',
    high_school_state: '',
    showcase_team_name: '',
    height_feet: '',
    height_inches: '',
    weight_lbs: '',
    primary_position: '',
    secondary_position: '',
    throws: '',
    bats: '',
    about_me: '',
    primary_goal: '',
    perfect_game_url: '',
    twitter_url: '',
    top_schools: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    
    let playerData = null;
    
    if (isDevMode()) {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('id', DEV_ENTITY_IDS.player)
        .single();
      playerData = data;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .single();
      playerData = data;
    }

    if (!playerData) {
      router.push('/onboarding/player');
      return;
    }

    setPlayer(playerData);
    setFormData({
      first_name: playerData.first_name || '',
      last_name: playerData.last_name || '',
      grad_year: playerData.grad_year?.toString() || '',
      high_school_name: playerData.high_school_name || '',
      high_school_city: playerData.high_school_city || '',
      high_school_state: playerData.high_school_state || '',
      showcase_team_name: playerData.showcase_team_name || '',
      height_feet: playerData.height_feet?.toString() || '',
      height_inches: playerData.height_inches?.toString() || '',
      weight_lbs: playerData.weight_lbs?.toString() || '',
      primary_position: playerData.primary_position || '',
      secondary_position: playerData.secondary_position || '',
      throws: playerData.throws || '',
      bats: playerData.bats || '',
      about_me: playerData.about_me || '',
      primary_goal: playerData.primary_goal || '',
      perfect_game_url: playerData.perfect_game_url || '',
      twitter_url: playerData.twitter_url || '',
      top_schools: playerData.top_schools || [],
    });

    // Load recruiting interests
    const interests = await getRecruitingInterests(playerData.id);
    setRecruitingInterests(interests);

    setLoading(false);
  };

  const handleSave = async () => {
    if (!player) return;
    
    setSaving(true);
    try {
      const supabase = createClient();
      
      const updateData = {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        full_name: `${formData.first_name || ''} ${formData.last_name || ''}`.trim() || null,
        grad_year: formData.grad_year ? parseInt(formData.grad_year) : null,
        high_school_name: formData.high_school_name || null,
        high_school_city: formData.high_school_city || null,
        high_school_state: formData.high_school_state || null,
        showcase_team_name: formData.showcase_team_name || null,
        height_feet: formData.height_feet ? parseInt(formData.height_feet) : null,
        height_inches: formData.height_inches ? parseInt(formData.height_inches) : null,
        weight_lbs: formData.weight_lbs ? parseInt(formData.weight_lbs) : null,
        primary_position: formData.primary_position || null,
        secondary_position: formData.secondary_position || null,
        throws: formData.throws || null,
        bats: formData.bats || null,
        about_me: formData.about_me || null,
        primary_goal: formData.primary_goal || null,
        perfect_game_url: formData.perfect_game_url || null,
        twitter_url: formData.twitter_url || null,
        top_schools: formData.top_schools,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', player.id);

      if (error) {
        toast.error('Failed to save profile');
        logError(error, { component: 'ProfileEditContent', action: 'handleSave' });
        return;
      }

      toast.success('Profile saved successfully!');
    } catch (error) {
      logError(error, { component: 'ProfileEditContent', action: 'handleSave', metadata: { unexpected: true } });
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSchool = async (collegeId: string, collegeName: string) => {
    if (!player) return;
    
    const { id, error } = await addRecruitingInterest({
      playerId: player.id,
      collegeId: collegeId,
      schoolName: collegeName,
      status: 'interested',
      interestLevel: 'medium',
    });

    if (error) {
      toast.error('Failed to add school');
      return;
    }

    // Reload interests
    const interests = await getRecruitingInterests(player.id);
    setRecruitingInterests(interests);
    toast.success(`Added ${collegeName} to your interests!`);
  };

  const handleRemoveInterest = async (interestId: string) => {
    const success = await deleteRecruitingInterest(interestId);
    if (success) {
      setRecruitingInterests(prev => prev.filter(i => i.id !== interestId));
      toast.success('Removed from interests');
    }
  };

  // Theme classes
  const theme = {
    bg: isDark ? 'bg-[#0B0D0F]' : 'bg-slate-50',
    cardBg: isDark ? 'bg-[#111315] border-white/5' : 'bg-white border-emerald-100 shadow-sm',
    text: isDark ? 'text-white' : 'text-slate-800',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    accent: isDark ? 'text-emerald-400' : 'text-emerald-600',
    inputBg: isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200',
    tabsBg: isDark ? 'bg-[#111315] border-white/5' : 'bg-slate-100 border-slate-200',
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="w-8 h-8 bg-emerald-400/20 rounded animate-pulse"></div>
      </div>
    );
  }

  const fullName = `${formData.first_name} ${formData.last_name}`.trim() || 'Player';

  return (
    <motion.div 
      className={cnEnhanced(glassDarkZoneEnhanced, "min-h-screen pb-12 relative overflow-hidden")}
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '0s' }}></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s' }}></div>
<div className="max-w-4xl mx-auto px-6 py-8 space-y-6 relative z-10">
        {/* Premium Glass Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <Link href="/player" className={cnEnhanced(
              "p-2 rounded-lg backdrop-blur-lg",
              "bg-white/[0.08] border border-white/[0.15]",
              "hover:bg-white/[0.12] hover:border-white/20",
              "transition-all duration-200 text-white/70 hover:text-white"
            )}>
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1 bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                Edit Profile
              </h1>
              <p className="text-white/70 text-sm">Update your information</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className={cnEnhanced(glassButtonEnhanced.primary, "disabled:opacity-50")}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 bg-white/20 rounded animate-pulse mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" strokeWidth={2} />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      {/* Premium Glass Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className={cnEnhanced(glassPanelEnhanced, "p-6")}>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={(player as any)?.avatar_url} alt={fullName} />
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-300 text-2xl font-bold border border-emerald-400/30">
                    {fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <button className={cnEnhanced(
                  "absolute bottom-0 right-0 p-2 rounded-full backdrop-blur-lg",
                  "bg-white/[0.08] border border-white/[0.15]",
                  "hover:bg-white/[0.12] hover:border-white/20",
                  "transition-all duration-200"
                )}>
                  <Camera className="w-4 h-4 text-emerald-300" strokeWidth={2} />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{fullName}</h2>
                <p className="text-white/70 text-sm">
                  {formData.grad_year && `Class of ${formData.grad_year}`}
                  {formData.primary_position && ` • ${formData.primary_position}`}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={theme.tabsBg}>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="physical">Physical</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="recruiting">Recruiting</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
          </TabsList>
      {/* Basic Info */}
          <TabsContent value="basic">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className={cnEnhanced(glassPanelEnhanced, "p-6")}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-300" strokeWidth={2} />
                    Basic Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/80">First Name</Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">Last Name</Label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      />
                    </div>
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Label className="text-white/80">Graduation Year</Label>
                      <Select value={formData.grad_year} onValueChange={(v) => setFormData({ ...formData, grad_year: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
        <SelectContent>
                        {GRAD_YEARS.map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">High School</Label>
                      <Input
                        value={formData.high_school_name}
                        onChange={(e) => setFormData({ ...formData, high_school_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">City</Label>
                      <Input
                        value={formData.high_school_city}
                        onChange={(e) => setFormData({ ...formData, high_school_city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">State</Label>
                      <Select value={formData.high_school_state} onValueChange={(v) => setFormData({ ...formData, high_school_state: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
        <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white/80">Showcase / Travel Team</Label>
                      <Input
                        value={formData.showcase_team_name}
                        onChange={(e) => setFormData({ ...formData, showcase_team_name: e.target.value })}
                        placeholder="Team name (optional)"
                      />
                    </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        <TabsContent value="physical">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className={cnEnhanced(glassPanelEnhanced, "p-6")}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-emerald-300" strokeWidth={2} />
                    Physical & Position
                  </h3>
                </div>
                <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Height (Feet)</Label>
                    <Select value={formData.height_feet} onValueChange={(v) => setFormData({ ...formData, height_feet: v })}>
                      <SelectTrigger className={theme.inputBg}>
                        <SelectValue placeholder="Feet" />
                      </SelectTrigger>
        <SelectContent>
                        {[4, 5, 6, 7].map((ft) => (
                          <SelectItem key={ft} value={ft.toString()}>{ft}'</SelectItem>
)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/80">Height (Inches)</Label>
                    <Select value={formData.height_inches} onValueChange={(v) => setFormData({ ...formData, height_inches: v })}>
                      <SelectTrigger className={theme.inputBg}>
                        <SelectValue placeholder="Inches" />
                      </SelectTrigger>
        <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>{i}"</SelectItem>
)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (lbs)</Label>
                    <Input
                      type="number"
                      value={formData.weight_lbs}
                      onChange={(e) => setFormData({ ...formData, weight_lbs: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/80">Primary Position</Label>
                    <Select value={formData.primary_position} onValueChange={(v) => setFormData({ ...formData, primary_position: v })}>
                      <SelectTrigger className={theme.inputBg}>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
        <SelectContent>
                        {POSITIONS.map((pos) => (
                          <SelectItem key={pos} value={pos}>{pos}</SelectItem>
)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Position</Label>
                    <Select value={formData.secondary_position} onValueChange={(v) => setFormData({ ...formData, secondary_position: v })}>
                      <SelectTrigger className={theme.inputBg}>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
        <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {POSITIONS.map((pos) => (
                          <SelectItem key={pos} value={pos}>{pos}</SelectItem>
)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/80">Throws</Label>
                    <Select value={formData.throws} onValueChange={(v) => setFormData({ ...formData, throws: v })}>
                      <SelectTrigger className={theme.inputBg}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
        <SelectContent>
                        <SelectItem value="R">Right</SelectItem>
                        <SelectItem value="L">Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bats</Label>
                    <Select value={formData.bats} onValueChange={(v) => setFormData({ ...formData, bats: v })}>
                      <SelectTrigger className={theme.inputBg}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
        <SelectContent>
                        <SelectItem value="R">Right</SelectItem>
                        <SelectItem value="L">Left</SelectItem>
                        <SelectItem value="S">Switch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
      {/* About */}
          <TabsContent value="about">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className={cnEnhanced(glassPanelEnhanced, "p-6")}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-300" strokeWidth={2} />
                    About & Goals
                  </h3>
                </div>
                <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white/80">About Me</Label>
                  <Textarea
                    value={formData.about_me}
                    onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
                    placeholder="Tell coaches about yourself, your passion for the game, and what makes you unique..."
                    className="min-h-[150px]"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-white/80">Primary Goal</Label>
                  <div className="grid gap-2">
                    {PLAYER_GOALS.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => setFormData({ ...formData, primary_goal: goal })}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          formData.primary_goal === goal
                            ? `border-emerald-500 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`
                            : `${isDark ? 'border-white/10 hover:border-white/20' : 'border-slate-200 hover:border-emerald-200'}`
                        }`}
                      >
                        <p className={`text-sm ${formData.primary_goal === goal ? theme.text : theme.textMuted}`}>
                          {goal}
                        </p>
                      </button>
)}
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
      {/* Recruiting */}
          <TabsContent value="recruiting">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className={cnEnhanced(glassPanelEnhanced, "p-6")}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-300" strokeWidth={2} />
                    Recruiting Interests
                  </h3>
                </div>
                <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Add a School</Label>
                  <CollegeSearchSelect
                    onChange={(college) => college && handleAddSchool(college.id, college.name)}
                    placeholder="Search for colleges..."
                  />
                </div>
      {recruitingInterests.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-white/80">Your Interested Schools ({recruitingInterests.length})</Label>
                    <div className="space-y-2">
                      {recruitingInterests.map((interest) => (
                        <div
                          key={interest.id}
                          className={cnEnhanced(
                            "flex items-center justify-between p-3 rounded-lg border backdrop-blur-lg",
                            "bg-white/[0.08] border-white/[0.15]",
                            "hover:bg-white/[0.12] hover:border-white/20",
                            "transition-all duration-200"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cnEnhanced(
                              "w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-lg",
                              "bg-emerald-500/20 border border-emerald-400/30"
                            )}>
                              <School className="w-4 h-4 text-emerald-300" strokeWidth={2} />
                            </div>
                            <div>
                              <p className="font-medium text-white">{interest.school_name}</p>
                              {interest.conference && (
                                <p className="text-xs text-white/60">{interest.conference}</p>
)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveInterest(interest.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={2} />
                          </Button>
                        </div>
)}
                    </div>
                  </div>
)}
                {recruitingInterests.length === 0 && (
                  <p className="text-sm text-white/60">
                    No schools added yet. Search and add schools you're interested in!
                  </p>
)}
              </div>
            </motion.div>
          </TabsContent>
      {/* Links */}
          <TabsContent value="links">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className={cnEnhanced(glassPanelEnhanced, "p-6")}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-emerald-300" strokeWidth={2} />
                    External Links
                  </h3>
                </div>
                <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Perfect Game Profile</Label>
                  <Input
                    type="url"
                    value={formData.perfect_game_url}
                    onChange={(e) => setFormData({ ...formData, perfect_game_url: e.target.value })}
                    placeholder="https://perfectgame.org/..."
                    className={theme.inputBg}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Twitter / X Profile</Label>
                  <Input
                    type="url"
                    value={formData.twitter_url}
                    onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}

export default function PlayerProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0D0F] flex items-center justify-center">
        <div className="w-8 h-8 bg-emerald-400/20 rounded animate-pulse"></div>
      </div>
    }>
      <ProfileEditContent />
    </Suspense>
  );
}
