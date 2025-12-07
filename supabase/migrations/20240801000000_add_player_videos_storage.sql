-- ═══════════════════════════════════════════════════════════════════════════
-- Player Videos Migration
-- ═══════════════════════════════════════════════════════════════════════════

-- Create player_videos table if not exists
CREATE TABLE IF NOT EXISTS public.player_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_type TEXT NOT NULL DEFAULT 'other',
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    recorded_date DATE,
    file_size BIGINT,
    duration REAL, -- in seconds
    views_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_player_videos_player_id ON public.player_videos(player_id);
CREATE INDEX IF NOT EXISTS idx_player_videos_video_type ON public.player_videos(video_type);
CREATE INDEX IF NOT EXISTS idx_player_videos_created_at ON public.player_videos(created_at DESC);

-- Enable RLS
ALTER TABLE public.player_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Players can view their own videos
CREATE POLICY "Players can view their own videos"
ON public.player_videos FOR SELECT
USING (
    player_id IN (
        SELECT id FROM public.players WHERE user_id = auth.uid()
    )
);

-- Anyone can view public videos
CREATE POLICY "Anyone can view public videos"
ON public.player_videos FOR SELECT
USING (is_public = TRUE);

-- Players can insert their own videos
CREATE POLICY "Players can insert their own videos"
ON public.player_videos FOR INSERT
WITH CHECK (
    player_id IN (
        SELECT id FROM public.players WHERE user_id = auth.uid()
    )
);

-- Players can update their own videos
CREATE POLICY "Players can update their own videos"
ON public.player_videos FOR UPDATE
USING (
    player_id IN (
        SELECT id FROM public.players WHERE user_id = auth.uid()
    )
);

-- Players can delete their own videos
CREATE POLICY "Players can delete their own videos"
ON public.player_videos FOR DELETE
USING (
    player_id IN (
        SELECT id FROM public.players WHERE user_id = auth.uid()
    )
);

-- Coaches can view all player videos (for recruiting)
CREATE POLICY "Coaches can view all player videos"
ON public.player_videos FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.coaches WHERE user_id = auth.uid()
    )
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Storage Bucket Policies
-- ═══════════════════════════════════════════════════════════════════════════

-- Note: Storage bucket 'player-videos' should be created via Supabase Dashboard
-- with the following settings:
--   - Public bucket: false (for security)
--   - Allowed MIME types: video/mp4, video/quicktime, video/x-msvideo, image/jpeg
--   - Max file size: 100MB

-- Storage policies (run these via Supabase Dashboard SQL Editor)

-- Allow players to upload to their own folder
-- INSERT policy for storage.objects
-- CREATE POLICY "Players can upload videos to their folder"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--     bucket_id = 'player-videos'
--     AND (storage.foldername(name))[1] IN (
--         SELECT id::text FROM public.players WHERE user_id = auth.uid()
--     )
-- );

-- Allow players to update their own videos
-- UPDATE policy for storage.objects
-- CREATE POLICY "Players can update their own videos"
-- ON storage.objects FOR UPDATE
-- USING (
--     bucket_id = 'player-videos'
--     AND (storage.foldername(name))[1] IN (
--         SELECT id::text FROM public.players WHERE user_id = auth.uid()
--     )
-- );

-- Allow players to delete their own videos
-- DELETE policy for storage.objects
-- CREATE POLICY "Players can delete their own videos"
-- ON storage.objects FOR DELETE
-- USING (
--     bucket_id = 'player-videos'
--     AND (storage.foldername(name))[1] IN (
--         SELECT id::text FROM public.players WHERE user_id = auth.uid()
--     )
-- );

-- Public read access for video files
-- SELECT policy for storage.objects
-- CREATE POLICY "Public video access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'player-videos');

-- ═══════════════════════════════════════════════════════════════════════════
-- Update trigger for updated_at
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_player_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_player_videos_updated_at ON public.player_videos;
CREATE TRIGGER trigger_update_player_videos_updated_at
    BEFORE UPDATE ON public.player_videos
    FOR EACH ROW
    EXECUTE FUNCTION update_player_videos_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- Video view tracking function
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION increment_video_views(video_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.player_videos
    SET views_count = views_count + 1
    WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

