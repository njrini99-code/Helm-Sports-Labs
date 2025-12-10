import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, MapPin, GraduationCap, Trophy, ExternalLink, Mail } from 'lucide-react';

export default async function PublicProfilePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Fetch public profile data (team/coach profile - no auth required)
  const { data: profile, error } = await supabase
    .from('teams')
    .select(`
      *,
      coach:coaches!teams_coach_id_fkey(
        id,
        full_name,
        coach_type,
        school_name,
        organization_name,
        school_city,
        school_state,
        organization_city,
        organization_state,
        logo_url,
        about
      )
    `)
    .eq('id', id)
    .single();

  if (error || !profile) {
    notFound();
  }

  const coach = Array.isArray(profile.coach) ? profile.coach[0] : profile.coach;
  
  // Get player count separately
  const { count: playerCount } = await supabase
    .from('team_memberships')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', id);
  
  // Get player IDs for this team
  const { data: teamMembers } = await supabase
    .from('team_memberships')
    .select('player_id')
    .eq('team_id', id);
  
  const playerIds = teamMembers?.map(m => m.player_id) || [];
  
  // Get commit count separately (for players on this team)
  const { count: commitCount } = await supabase
    .from('college_interest')
    .select('*', { count: 'exact', head: true })
    .eq('interest_level', 'committed')
    .in('player_id', playerIds.length > 0 ? playerIds : ['00000000-0000-0000-0000-000000000000']);

  const teamName = profile.name || coach?.school_name || coach?.organization_name || 'Team';
  const location = [
    profile.city || coach?.school_city || coach?.organization_city,
    profile.state || coach?.school_state || coach?.organization_state
  ].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="glassmorphism rounded-xl p-8 mb-6">
          <div className="flex items-start gap-6 flex-col md:flex-row">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-white/20 shadow-2xl">
              <AvatarImage src={coach?.logo_url || undefined} />
              <AvatarFallback className="text-3xl font-bold bg-emerald-500 text-white">
                {teamName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                {teamName}
              </h1>
              {coach?.full_name && (
                <p className="text-lg text-muted-foreground mb-2">
                  {coach.full_name} - Head Coach
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-muted-foreground flex-wrap">
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {playerCount} Players
                </span>
                {(commitCount || 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {commitCount || 0} Commits
                  </span>
                )}
              </div>
              
              {coach?.about && (
                <p className="mt-4 text-sm text-muted-foreground max-w-2xl">
                  {coach.about}
                </p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600">
                <Mail className="mr-2 h-4 w-4" />
                Contact Coach
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{playerCount || 0}</p>
              <p className="text-xs text-muted-foreground">Players</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <GraduationCap className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
              <p className="text-2xl font-bold">{commitCount || 0}</p>
              <p className="text-xs text-muted-foreground">College Commits</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold">{profile.level || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">Level</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Building2 className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">{coach?.coach_type?.replace('_', ' ') || 'Team'}</p>
              <p className="text-xs text-muted-foreground">Type</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>About This Program</CardTitle>
          </CardHeader>
          <CardContent>
            {coach?.about ? (
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {coach.about}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No additional information available at this time.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

