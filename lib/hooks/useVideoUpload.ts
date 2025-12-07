// ═══════════════════════════════════════════════════════════════════════════
// Video Upload Hook
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UploadedVideo, VideoMetadata } from '@/components/player/VideoUpload';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

interface PlayerVideo {
  id: string;
  player_id: string;
  title: string;
  description: string | null;
  video_type: string;
  video_url: string;
  thumbnail_url: string | null;
  recorded_date: string | null;
  file_size: number | null;
  duration: number | null;
  created_at: string;
}

interface UseVideoUploadReturn {
  videos: UploadedVideo[];
  loading: boolean;
  error: string | null;
  fetchVideos: (playerId: string) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<boolean>;
  refreshVideos: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════════════════

export function useVideoUpload(initialPlayerId?: string): UseVideoUploadReturn {
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | undefined>(initialPlayerId);

  const fetchVideos = useCallback(async (pid: string) => {
    setLoading(true);
    setError(null);
    setPlayerId(pid);

    const supabase = createClient();

    try {
      const { data, error: fetchError } = await supabase
        .from('player_videos')
        .select('*')
        .eq('player_id', pid)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedVideos: UploadedVideo[] = (data || []).map((video: PlayerVideo) => ({
        id: video.id,
        url: video.video_url,
        thumbnailUrl: video.thumbnail_url || undefined,
        metadata: {
          title: video.title,
          description: video.description || undefined,
          videoType: video.video_type as any,
          recordedDate: video.recorded_date || undefined,
        },
        size: video.file_size || 0,
        duration: video.duration || undefined,
        uploadedAt: video.created_at,
      }));

      setVideos(mappedVideos);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVideo = useCallback(async (videoId: string): Promise<boolean> => {
    const supabase = createClient();

    try {
      // Get video record first
      const { data: video, error: fetchError } = await supabase
        .from('player_videos')
        .select('video_url, thumbnail_url')
        .eq('id', videoId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      if (video.video_url) {
        const videoPath = video.video_url.split('/player-videos/')[1];
        if (videoPath) {
          await supabase.storage.from('player-videos').remove([videoPath]);
        }
      }

      if (video.thumbnail_url) {
        const thumbPath = video.thumbnail_url.split('/player-videos/')[1];
        if (thumbPath) {
          await supabase.storage.from('player-videos').remove([thumbPath]);
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('player_videos')
        .delete()
        .eq('id', videoId);

      if (deleteError) throw deleteError;

      // Update local state
      setVideos(prev => prev.filter(v => v.id !== videoId));

      return true;
    } catch (err) {
      console.error('Error deleting video:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete video');
      return false;
    }
  }, []);

  const refreshVideos = useCallback(async () => {
    if (playerId) {
      await fetchVideos(playerId);
    }
  }, [playerId, fetchVideos]);

  return {
    videos,
    loading,
    error,
    fetchVideos,
    deleteVideo,
    refreshVideos,
  };
}

export default useVideoUpload;

