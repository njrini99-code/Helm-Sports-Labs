-- ═══════════════════════════════════════════════════════════════════════════
-- Recruitment Journey Tables Migration
-- ═══════════════════════════════════════════════════════════════════════════

-- Create recruiting_interests table if not exists
CREATE TABLE IF NOT EXISTS public.recruiting_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
    college_name TEXT NOT NULL, -- Fallback if college not in colleges table
    stage TEXT NOT NULL DEFAULT 'prospect' CHECK (stage IN ('prospect', 'contact', 'visit', 'offer', 'commitment')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'declined', 'accepted', 'waitlist')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('dream', 'high', 'medium', 'low')),
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recruiting_interests_player_id ON public.recruiting_interests(player_id);
CREATE INDEX IF NOT EXISTS idx_recruiting_interests_stage ON public.recruiting_interests(stage);
CREATE INDEX IF NOT EXISTS idx_recruiting_interests_college_id ON public.recruiting_interests(college_id);

-- Create recruitment_events table
CREATE TABLE IF NOT EXISTS public.recruitment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interest_id UUID NOT NULL REFERENCES public.recruiting_interests(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL DEFAULT 'other' CHECK (event_type IN ('email', 'call', 'text', 'visit', 'offer', 'camp', 'game', 'meeting', 'commitment', 'other')),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recruitment_events_interest_id ON public.recruitment_events(interest_id);
CREATE INDEX IF NOT EXISTS idx_recruitment_events_date ON public.recruitment_events(date DESC);

-- Enable RLS
ALTER TABLE public.recruiting_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_events ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS Policies for recruiting_interests
-- ═══════════════════════════════════════════════════════════════════════════

-- Players can view their own interests
CREATE POLICY "Players can view their own interests"
ON public.recruiting_interests FOR SELECT
USING (
    player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
);

-- Players can insert their own interests
CREATE POLICY "Players can insert their own interests"
ON public.recruiting_interests FOR INSERT
WITH CHECK (
    player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
);

-- Players can update their own interests
CREATE POLICY "Players can update their own interests"
ON public.recruiting_interests FOR UPDATE
USING (
    player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
);

-- Players can delete their own interests
CREATE POLICY "Players can delete their own interests"
ON public.recruiting_interests FOR DELETE
USING (
    player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
);

-- Coaches can view player interests (for recruiting)
CREATE POLICY "Coaches can view player interests"
ON public.recruiting_interests FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.coaches WHERE user_id = auth.uid())
);

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS Policies for recruitment_events
-- ═══════════════════════════════════════════════════════════════════════════

-- Players can view events for their interests
CREATE POLICY "Players can view their own events"
ON public.recruitment_events FOR SELECT
USING (
    interest_id IN (
        SELECT id FROM public.recruiting_interests 
        WHERE player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
    )
);

-- Players can insert events for their interests
CREATE POLICY "Players can insert their own events"
ON public.recruitment_events FOR INSERT
WITH CHECK (
    interest_id IN (
        SELECT id FROM public.recruiting_interests 
        WHERE player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
    )
);

-- Players can update events for their interests
CREATE POLICY "Players can update their own events"
ON public.recruitment_events FOR UPDATE
USING (
    interest_id IN (
        SELECT id FROM public.recruiting_interests 
        WHERE player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
    )
);

-- Players can delete events for their interests
CREATE POLICY "Players can delete their own events"
ON public.recruitment_events FOR DELETE
USING (
    interest_id IN (
        SELECT id FROM public.recruiting_interests 
        WHERE player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
    )
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Update trigger for updated_at
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_recruiting_interests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_recruiting_interests_updated_at ON public.recruiting_interests;
CREATE TRIGGER trigger_update_recruiting_interests_updated_at
    BEFORE UPDATE ON public.recruiting_interests
    FOR EACH ROW
    EXECUTE FUNCTION update_recruiting_interests_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- Helper function to get recruitment summary for a player
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_player_recruitment_summary(p_player_id UUID)
RETURNS TABLE (
    total_schools INTEGER,
    prospect_count INTEGER,
    contact_count INTEGER,
    visit_count INTEGER,
    offer_count INTEGER,
    commitment_count INTEGER,
    dream_school_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_schools,
        COUNT(*) FILTER (WHERE stage = 'prospect')::INTEGER as prospect_count,
        COUNT(*) FILTER (WHERE stage = 'contact')::INTEGER as contact_count,
        COUNT(*) FILTER (WHERE stage = 'visit')::INTEGER as visit_count,
        COUNT(*) FILTER (WHERE stage = 'offer')::INTEGER as offer_count,
        COUNT(*) FILTER (WHERE stage = 'commitment')::INTEGER as commitment_count,
        COUNT(*) FILTER (WHERE priority = 'dream')::INTEGER as dream_school_count
    FROM public.recruiting_interests
    WHERE player_id = p_player_id AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

