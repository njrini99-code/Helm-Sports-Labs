'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isDevMode, DEV_ENTITY_IDS, DEV_USER_IDS, getDevRole } from '@/lib/dev-mode';

export interface AuthUser {
  id: string;
  email: string;
  role: 'player' | 'coach';
}

export interface PlayerAuthData {
  userId: string;
  playerId: string;
  playerName: string;
  isDevMode: boolean;
}

export interface CoachAuthData {
  userId: string;
  coachId: string;
  coachName: string;
  coachType: string;
  isDevMode: boolean;
}

export function usePlayerAuth() {
  const [data, setData] = useState<PlayerAuthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAuth() {
      try {
        const supabase = createClient();

        if (isDevMode()) {
          // Dev mode - load player directly
          const { data: player, error: playerError } = await supabase
            .from('players')
            .select('id, full_name, first_name, last_name')
            .eq('id', DEV_ENTITY_IDS.player)
            .single();

          if (playerError) {
            console.warn('Dev mode player not found, using defaults');
          }

          setData({
            userId: DEV_USER_IDS.player,
            playerId: DEV_ENTITY_IDS.player,
            playerName: player?.full_name || 
              `${player?.first_name || ''} ${player?.last_name || ''}`.trim() || 
              'Dev Player',
            isDevMode: true,
          });
          setLoading(false);
          return;
        }

        // Production mode - check auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        const { data: player, error: playerError } = await supabase
          .from('players')
          .select('id, full_name, first_name, last_name')
          .eq('user_id', user.id)
          .single();

        if (playerError || !player) {
          setError('Player not found');
          setLoading(false);
          return;
        }

        setData({
          userId: user.id,
          playerId: player.id,
          playerName: player.full_name || 
            `${player.first_name || ''} ${player.last_name || ''}`.trim() || 
            'Player',
          isDevMode: false,
        });
        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        setError('Authentication failed');
        setLoading(false);
      }
    }

    loadAuth();
  }, []);

  return { data, loading, error };
}

export function useCoachAuth() {
  const [data, setData] = useState<CoachAuthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAuth() {
      try {
        const supabase = createClient();

        if (isDevMode()) {
          // Dev mode - load coach directly
          const { data: coach, error: coachError } = await supabase
            .from('coaches')
            .select('id, full_name, coach_type')
            .eq('id', DEV_ENTITY_IDS.coach)
            .single();

          if (coachError) {
            console.warn('Dev mode coach not found, using defaults');
          }

          // Use the dev role to determine coach type
          const devRole = getDevRole();
          const coachType = devRole === 'college' ? 'college' 
            : devRole === 'high-school' ? 'high_school'
            : devRole === 'showcase' ? 'showcase'
            : devRole === 'juco' ? 'juco'
            : coach?.coach_type || 'college';

          setData({
            userId: DEV_USER_IDS.college,
            coachId: DEV_ENTITY_IDS.coach,
            coachName: coach?.full_name || 'Dev Coach',
            coachType,
            isDevMode: true,
          });
          setLoading(false);
          return;
        }

        // Production mode - check auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        const { data: coach, error: coachError } = await supabase
          .from('coaches')
          .select('id, full_name, coach_type')
          .eq('user_id', user.id)
          .single();

        if (coachError || !coach) {
          setError('Coach not found');
          setLoading(false);
          return;
        }

        setData({
          userId: user.id,
          coachId: coach.id,
          coachName: coach.full_name || 'Coach',
          coachType: coach.coach_type || 'college',
          isDevMode: false,
        });
        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        setError('Authentication failed');
        setLoading(false);
      }
    }

    loadAuth();
  }, []);

  return { data, loading, error };
}

