'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Star,
  MessageSquare,
  FileText,
  Plus,
  CheckCircle2,
  TrendingUp,
  Video,
  Award,
  School,
  BarChart3,
  Ruler,
  Eye,
  Calendar,
  MapPin,
  Loader2,
  ArrowLeft,
  Edit,
  Download,
  Target
} from 'lucide-react';
import type { Player } from '@/lib/types';
import { toast } from 'sonner';
import Link from 'next/link';

interface PlayerMetric {
  id: string;
  metric_label: string;
  metric_value: string;
  metric_type: string;
  verified_date: string | null;
}

interface PlayerVideo {
  id: string;
  title: string;
  video_type: 'Game' | 'Training';
  video_url: string;
  recorded_date: string | null;
}

interface PlayerAchievement {
  id: string;
  achievement_text: string;
  achievement_date: string | null;
}

export default function CoachPlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;
  
  const [player, setPlayer] = useState<Player | null>(null);
  const [metrics, setMetrics] = useState<PlayerMetric[]>([]);
  const [videos, setVideos] = useState<PlayerVideo[]>([]);
  const [achievements, setAchievements] = useState<PlayerAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluationStatus, setEvaluationStatus] = useState<'not_evaluated' | 'evaluating' | 'evaluated'>('not_evaluated');
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    loadPlayerData();
    checkWatchlist();
  }, [playerId]);

  const loadPlayerData = async () => {
    const supabase = createClient();
    
    // Load player
    const { data: playerData } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (playerData) {
      setPlayer(playerData);
    }

    // Load metrics
    const { data: metricsData } = await supabase
      .from('player_metrics')
      .select('*')
      .eq('player_id', playerId)
      .order('updated_at', { ascending: false });

    if (metricsData) {
      setMetrics(metricsData);
    }

    // Load videos
    const { data: videosData } = await supabase
      .from('player_videos')
      .select('*')
      .eq('player_id', playerId)
      .order('recorded_date', { ascending: false });

    if (videosData) {
      setVideos(videosData);
    }

    // Load achievements
    const { data: achievementsData } = await supabase
      .from('player_achievements')
      .select('*')
      .eq('player_id', playerId)
      .order('achievement_date', { ascending: false });

    if (achievementsData) {
      setAchievements(achievementsData);
    }

    setLoading(false);
  };

  const checkWatchlist = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data: coachData } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!coachData) return;

    const { data } = await supabase
      .from('recruits')
      .select('id')
      .eq('coach_id', coachData.id)
      .eq('player_id', playerId)
      .maybeSingle();

    setInWatchlist(!!data);
  };

  const handleAddToWatchlist = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data: coachData } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!coachData) return;

    const { error } = await supabase
      .from('recruits')
      .upsert({
        coach_id: coachData.id,
        player_id: playerId,
        stage: 'Watchlist',
      }, {
        onConflict: 'coach_id,player_id'
      });

    if (error) {
      toast.error('Failed to add to watchlist');
    } else {
      setInWatchlist(true);
      toast.success('Added to watchlist');
    }
  };

  const handleMarkEvaluated = () => {
    setEvaluationStatus(evaluationStatus === 'evaluated' ? 'not_evaluated' : 'evaluated');
    toast.success(evaluationStatus === 'evaluated' ? 'Marked as not evaluated' : 'Marked as evaluated');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="bg-[#111315] border-white/5">
          <CardContent className="py-20 text-center">
            <p className="text-slate-400">Player not found</p>
            <Link href="/coach/discover">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Discover
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${player.first_name || ''} ${player.last_name || ''}`.trim();
  const initials = `${player.first_name?.[0] || ''}${player.last_name?.[0] || ''}`.toUpperCase();
  const height = player.height_feet && player.height_inches !== null
    ? `${player.height_feet}'${player.height_inches}"`
    : null;

  const gameVideos = videos.filter(v => v.video_type === 'Game');
  const trainingVideos = videos.filter(v => v.video_type === 'Training');

  return (
    <div className="min-h-screen bg-[#0B0D0F]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link href="/coach/discover">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discover
          </Button>
        </Link>

        {/* Recruit Snapshot */}
        <Card className="bg-[#111315] border-white/5 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Left: Player Info */}
              <div className="flex items-center gap-4 flex-1">
                <Avatar className="w-24 h-24 border-4 border-[#161a1f] hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{fullName}</h1>
                  <div className="flex flex-wrap gap-4 text-slate-300">
                    {player.grad_year && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        Class of {player.grad_year}
                      </span>
                    )}
                    {player.primary_position && (
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-emerald-400" />
                        {player.primary_position}
                        {player.secondary_position && ` / ${player.secondary_position}`}
                      </span>
                    )}
                    {height && (
                      <span className="flex items-center gap-1">
                        <Ruler className="w-4 h-4 text-purple-400" />
                        {height}
                        {player.weight_lbs && ` • ${player.weight_lbs} lbs`}
                      </span>
                    )}
                    {player.throws && player.bats && (
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4 text-amber-400" />
                        {player.throws}/{player.bats}
                      </span>
                    )}
                  </div>
                  {player.high_school_name && (
                    <div className="flex items-center gap-1 mt-2 text-slate-400">
                      <MapPin className="w-4 h-4" />
                      {player.high_school_name}
                      {player.high_school_city && player.high_school_state && (
                        <span>, {player.high_school_city}, {player.high_school_state}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  variant={inWatchlist ? 'outline' : 'default'}
                  onClick={handleAddToWatchlist}
                  className="gap-2"
                >
                  <Star className="w-4 h-4" />
                  {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>
                <Button
                  variant={evaluationStatus === 'evaluated' ? 'default' : 'outline'}
                  onClick={handleMarkEvaluated}
                  className="gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {evaluationStatus === 'evaluated' ? 'Evaluated' : 'Mark as Evaluated'}
                </Button>
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message Player
                </Button>
                <Button variant="outline" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Add Note
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="measurables" className="space-y-6">
          <TabsList className="bg-[#111315] border border-white/5 p-1">
            <TabsTrigger value="measurables">Measurables</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="schools">Dream Schools</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Measurables Tab */}
          <TabsContent value="measurables">
            <Card className="bg-[#111315] border-white/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-blue-400" />
                  Measurables Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {metrics.length > 0 ? (
                    metrics.map((metric) => (
                      <div key={metric.id} className="p-4 bg-[#161a1f] rounded-xl border border-white/5">
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-sm text-slate-400">{metric.metric_label}</div>
                          {metric.verified_date && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{metric.metric_value}</div>
                        <div className="text-xs text-slate-500">
                          {metric.verified_date && `Verified ${new Date(metric.verified_date).toLocaleDateString()}`}
                        </div>
                        {/* Sparkline placeholder */}
                        <div className="h-8 mt-2 bg-slate-800/50 rounded"></div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-4 text-center py-12 text-slate-400">
                      <Ruler className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No measurables added yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <Card className="bg-[#111315] border-white/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="w-5 h-5 text-rose-400" />
                  Video Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="game" className="space-y-4">
                  <TabsList className="bg-[#161a1f]">
                    <TabsTrigger value="game">Game Footage</TabsTrigger>
                    <TabsTrigger value="training">Training Footage</TabsTrigger>
                  </TabsList>
                  <TabsContent value="game">
                    {gameVideos.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {gameVideos.map((video) => (
                          <div key={video.id} className="bg-[#161a1f] rounded-xl border border-white/5 overflow-hidden group cursor-pointer">
                            <div className="aspect-video bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                              <Video className="w-12 h-12 text-slate-600" />
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-white mb-1">{video.title}</h3>
                              {video.recorded_date && (
                                <p className="text-xs text-slate-400">
                                  {new Date(video.recorded_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No game videos</p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="training">
                    {trainingVideos.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trainingVideos.map((video) => (
                          <div key={video.id} className="bg-[#161a1f] rounded-xl border border-white/5 overflow-hidden group cursor-pointer">
                            <div className="aspect-video bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                              <Video className="w-12 h-12 text-slate-600" />
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-white mb-1">{video.title}</h3>
                              {video.recorded_date && (
                                <p className="text-xs text-slate-400">
                                  {new Date(video.recorded_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No training videos</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <Card className="bg-[#111315] border-white/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Player Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="hitting" className="space-y-4">
                  <TabsList className="bg-[#161a1f]">
                    <TabsTrigger value="hitting">Hitting</TabsTrigger>
                    <TabsTrigger value="pitching">Pitching</TabsTrigger>
                    <TabsTrigger value="fielding">Fielding</TabsTrigger>
                  </TabsList>
                  <TabsContent value="hitting" className="text-center py-12 text-slate-400">
                    <p>No hitting stats available</p>
                  </TabsContent>
                  <TabsContent value="pitching" className="text-center py-12 text-slate-400">
                    <p>No pitching stats available</p>
                  </TabsContent>
                  <TabsContent value="fielding" className="text-center py-12 text-slate-400">
                    <p>No fielding stats available</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card className="bg-[#111315] border-white/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <div className="space-y-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="p-4 bg-[#161a1f] rounded-xl border border-white/5">
                        <div className="flex items-start gap-3">
                          <Award className="w-5 h-5 text-amber-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-white font-medium">{achievement.achievement_text}</p>
                            {achievement.achievement_date && (
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(achievement.achievement_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No achievements listed</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic">
            <Card className="bg-[#111315] border-white/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <School className="w-5 h-5 text-purple-400" />
                  Academic Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-400">
                  <School className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Academic information not available</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dream Schools Tab */}
          <TabsContent value="schools">
            <Card className="bg-[#111315] border-white/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <School className="w-5 h-5 text-purple-400" />
                  Top Interested Schools
                </CardTitle>
              </CardHeader>
              <CardContent>
                {player.top_schools && player.top_schools.length > 0 ? (
                  <div className="grid md:grid-cols-5 gap-4">
                    {player.top_schools.map((school, i) => (
                      <div key={i} className="bg-[#161a1f] rounded-xl border border-white/5 p-4 text-center hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1 hover:scale-[1.05] transition-all duration-300 ease-out cursor-pointer">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300">
                          {school[0]}
                        </div>
                        <p className="text-white font-medium">{school}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <School className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No dream schools listed</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card className="bg-[#111315] border-white/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Notes & Evaluation Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No notes added yet</p>
                  <Button variant="outline" className="mt-4 gap-2">
                    <Plus className="w-4 h-4" />
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

