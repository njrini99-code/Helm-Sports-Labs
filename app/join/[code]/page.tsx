'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Building2, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface InvitationData {
  code: string;
  team: {
    id: string;
    name: string;
    team_type: string;
    logo_url: string | null;
    school_name: string | null;
    city: string | null;
    state: string | null;
  };
  coach: {
    id: string;
    full_name: string | null;
    school_name: string | null;
  };
  expires_at: string | null;
}

export default function JoinTeamPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [code]);

  const loadInvitation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teams/join/${code}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid invitation code');
        setLoading(false);
        return;
      }

      setInvitation(data.invitation);
    } catch (err) {
      console.error('Error loading invitation:', err);
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    try {
      setJoining(true);
      const response = await fetch(`/api/teams/join/${code}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to join team');
        return;
      }

      setJoined(true);
      toast.success('Successfully joined team!');
      
      // Redirect to player dashboard after 2 seconds
      setTimeout(() => {
        router.push('/player/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error joining team:', err);
      toast.error('Failed to join team');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-slate-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Invalid Invitation
              </h2>
              <p className="text-slate-600 mb-6">
                {error || 'This invitation link is invalid or has expired.'}
              </p>
              <Link href="/auth/login">
                <Button>Go to Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Welcome to the Team!
              </h2>
              <p className="text-slate-600 mb-6">
                You've successfully joined {invitation.team.name}
              </p>
              <p className="text-sm text-slate-500">
                Redirecting to your dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const team = invitation.team;
  const coach = invitation.coach;
  const location = [team.city, team.state].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Avatar className="h-20 w-20 ring-4 ring-blue-100">
              <AvatarImage src={team.logo_url || undefined} alt={team.name} />
              <AvatarFallback className="bg-blue-600 text-white text-2xl">
                {team.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl mb-2">{team.name}</CardTitle>
          {team.school_name && (
            <p className="text-slate-600 flex items-center justify-center gap-1">
              <Building2 className="w-4 h-4" />
              {team.school_name}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {coach.full_name && (
              <div className="flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-sm">
                  <span className="font-medium">Coach:</span> {coach.full_name}
                </span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-sm">{location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {team.team_type.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-slate-600 text-center mb-4">
              You've been invited to join this team. Click below to accept the invitation.
            </p>
            <Button
              onClick={handleJoinTeam}
              disabled={joining}
              className="w-full"
              size="lg"
            >
              {joining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining Team...
                </>
              ) : (
                'Join Team'
              )}
            </Button>
          </div>

          {invitation.expires_at && (
            <p className="text-xs text-slate-500 text-center">
              This invitation expires on{' '}
              {new Date(invitation.expires_at).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

