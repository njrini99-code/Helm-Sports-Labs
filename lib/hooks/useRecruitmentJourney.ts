// ═══════════════════════════════════════════════════════════════════════════
// Recruitment Journey Hook
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { 
  CollegeInterest, 
  RecruitmentEvent, 
  RecruitmentStage 
} from '@/components/player/RecruitmentTimeline';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

interface UseRecruitmentJourneyReturn {
  interests: CollegeInterest[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateStage: (interestId: string, newStage: RecruitmentStage) => Promise<boolean>;
  updateInterest: (interest: CollegeInterest) => Promise<boolean>;
  deleteInterest: (interestId: string) => Promise<boolean>;
  addInterest: (interest: Omit<CollegeInterest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  addEvent: (interestId: string, event: Omit<RecruitmentEvent, 'id'>) => Promise<boolean>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════════════════

export function useRecruitmentJourney(playerId: string | undefined): UseRecruitmentJourneyReturn {
  const [interests, setInterests] = useState<CollegeInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch interests from database
  const refreshData = useCallback(async () => {
    if (!playerId) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      // Fetch recruiting interests with college data
      const { data: interestsData, error: interestsError } = await supabase
        .from('recruiting_interests')
        .select(`
          *,
          college:colleges(id, name, logo_url, division, conference, city, state)
        `)
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });

      if (interestsError) throw interestsError;

      // Fetch events for all interests
      const interestIds = interestsData?.map(i => i.id) || [];
      const { data: eventsData, error: eventsError } = await supabase
        .from('recruitment_events')
        .select('*')
        .in('interest_id', interestIds.length > 0 ? interestIds : ['none'])
        .order('date', { ascending: false });

      if (eventsError) throw eventsError;

      // Map data to our types
      const mappedInterests: CollegeInterest[] = (interestsData || []).map(interest => {
        const collegeData = interest.college as any;
        const interestEvents = (eventsData || [])
          .filter(e => e.interest_id === interest.id)
          .map(e => ({
            id: e.id,
            type: e.event_type,
            title: e.title,
            description: e.description,
            date: e.date,
            isCompleted: e.is_completed,
          }));

        return {
          id: interest.id,
          college: {
            id: collegeData?.id || interest.college_id,
            name: collegeData?.name || interest.college_name || 'Unknown College',
            logoUrl: collegeData?.logo_url,
            division: collegeData?.division,
            conference: collegeData?.conference,
            location: collegeData ? `${collegeData.city || ''}, ${collegeData.state || ''}`.trim() : undefined,
          },
          stage: interest.stage as RecruitmentStage,
          status: interest.status,
          priority: interest.priority,
          contactName: interest.contact_name,
          contactEmail: interest.contact_email,
          contactPhone: interest.contact_phone,
          notes: interest.notes,
          events: interestEvents,
          createdAt: interest.created_at,
          updatedAt: interest.updated_at,
        };
      });

      setInterests(mappedInterests);
    } catch (err) {
      console.error('Error fetching recruitment data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  // Initial fetch
  useEffect(() => {
    if (playerId) {
      refreshData();
    }
  }, [playerId, refreshData]);

  // Update stage
  const updateStage = useCallback(async (interestId: string, newStage: RecruitmentStage): Promise<boolean> => {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('recruiting_interests')
        .update({ 
          stage: newStage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', interestId);

      if (error) throw error;

      // Optimistic update
      setInterests(prev => prev.map(i => 
        i.id === interestId ? { ...i, stage: newStage, updatedAt: new Date().toISOString() } : i
      ));

      return true;
    } catch (err) {
      console.error('Error updating stage:', err);
      toast.error('Failed to update stage');
      return false;
    }
  }, []);

  // Update interest
  const updateInterest = useCallback(async (interest: CollegeInterest): Promise<boolean> => {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('recruiting_interests')
        .update({
          stage: interest.stage,
          status: interest.status,
          priority: interest.priority,
          contact_name: interest.contactName,
          contact_email: interest.contactEmail,
          contact_phone: interest.contactPhone,
          notes: interest.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', interest.id);

      if (error) throw error;

      setInterests(prev => prev.map(i => 
        i.id === interest.id ? { ...interest, updatedAt: new Date().toISOString() } : i
      ));

      return true;
    } catch (err) {
      console.error('Error updating interest:', err);
      toast.error('Failed to update');
      return false;
    }
  }, []);

  // Delete interest
  const deleteInterest = useCallback(async (interestId: string): Promise<boolean> => {
    const supabase = createClient();

    try {
      // Delete events first
      await supabase
        .from('recruitment_events')
        .delete()
        .eq('interest_id', interestId);

      // Delete interest
      const { error } = await supabase
        .from('recruiting_interests')
        .delete()
        .eq('id', interestId);

      if (error) throw error;

      setInterests(prev => prev.filter(i => i.id !== interestId));

      return true;
    } catch (err) {
      console.error('Error deleting interest:', err);
      toast.error('Failed to delete');
      return false;
    }
  }, []);

  // Add interest
  const addInterest = useCallback(async (
    interest: Omit<CollegeInterest, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> => {
    if (!playerId) return false;

    const supabase = createClient();

    try {
      // Check if college exists, create if not
      let collegeId = interest.college.id;
      
      const { data: existingCollege } = await supabase
        .from('colleges')
        .select('id')
        .eq('name', interest.college.name)
        .maybeSingle();

      if (existingCollege) {
        collegeId = existingCollege.id;
      } else {
        // Create new college record
        const { data: newCollege, error: collegeError } = await supabase
          .from('colleges')
          .insert({
            name: interest.college.name,
            division: interest.college.division,
            conference: interest.college.conference,
          })
          .select('id')
          .single();

        if (collegeError) {
          // If college table doesn't exist, continue with just the name
          console.warn('Could not create college record:', collegeError);
        } else {
          collegeId = newCollege.id;
        }
      }

      // Create interest
      const { data, error } = await supabase
        .from('recruiting_interests')
        .insert({
          player_id: playerId,
          college_id: collegeId,
          college_name: interest.college.name,
          stage: interest.stage,
          status: interest.status,
          priority: interest.priority,
          contact_name: interest.contactName,
          contact_email: interest.contactEmail,
          notes: interest.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newInterest: CollegeInterest = {
        ...interest,
        id: data.id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setInterests(prev => [newInterest, ...prev]);

      return true;
    } catch (err) {
      console.error('Error adding interest:', err);
      toast.error('Failed to add school');
      return false;
    }
  }, [playerId]);

  // Add event
  const addEvent = useCallback(async (
    interestId: string, 
    event: Omit<RecruitmentEvent, 'id'>
  ): Promise<boolean> => {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('recruitment_events')
        .insert({
          interest_id: interestId,
          event_type: event.type,
          title: event.title,
          description: event.description,
          date: event.date,
          is_completed: event.isCompleted,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newEvent: RecruitmentEvent = {
        id: data.id,
        type: data.event_type,
        title: data.title,
        description: data.description,
        date: data.date,
        isCompleted: data.is_completed,
      };

      setInterests(prev => prev.map(i => 
        i.id === interestId 
          ? { ...i, events: [...i.events, newEvent] }
          : i
      ));

      return true;
    } catch (err) {
      console.error('Error adding event:', err);
      toast.error('Failed to add event');
      return false;
    }
  }, []);

  return {
    interests,
    loading,
    error,
    refreshData,
    updateStage,
    updateInterest,
    deleteInterest,
    addInterest,
    addEvent,
  };
}

export default useRecruitmentJourney;

