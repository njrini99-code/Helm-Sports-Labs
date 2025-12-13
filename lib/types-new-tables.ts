/**
 * TypeScript Interfaces for New Database Tables
 *
 * Created from migration 035_add_missing_tables.sql
 *
 * Add these to lib/types.ts after database migrations are applied
 */

// ============================================================================
// SCHOLARSHIP OFFERS
// ============================================================================

export type ScholarshipOfferType =
  | 'full_scholarship'
  | 'partial_scholarship'
  | 'walk_on'
  | 'preferred_walk_on';

export type ScholarshipOfferStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'withdrawn'
  | 'expired';

export interface ScholarshipOffer {
  id: string;

  // Relationships
  player_id: string;
  coach_id: string;
  program_id: string | null;

  // Offer details
  offer_type: ScholarshipOfferType;

  // Financial details
  scholarship_percentage: number | null; // 0-100
  scholarship_amount: number | null; // Dollar amount
  scholarship_years: number | null; // Number of years

  // Dates
  offer_date: string; // Date string
  expiration_date: string | null;
  decision_deadline: string | null;

  // Status
  status: ScholarshipOfferStatus;
  decision_date: string | null;

  // Additional terms
  conditions: string | null; // Academic/performance requirements
  notes: string | null;

  // Metadata
  created_at: string;
  updated_at: string;
}

// For creating new offers
export interface CreateScholarshipOffer {
  player_id: string;
  coach_id: string;
  program_id?: string;
  offer_type: ScholarshipOfferType;
  scholarship_percentage?: number;
  scholarship_amount?: number;
  scholarship_years?: number;
  offer_date: string;
  expiration_date?: string;
  decision_deadline?: string;
  conditions?: string;
  notes?: string;
}

// ============================================================================
// CAMPUS VISITS
// ============================================================================

export type CampusVisitType =
  | 'official'
  | 'unofficial'
  | 'junior_day'
  | 'camp_visit'
  | 'game_day';

export type CampusVisitStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface CampusVisit {
  id: string;

  // Relationships
  player_id: string;
  coach_id: string | null;
  program_id: string | null;

  // Visit details
  visit_type: CampusVisitType;
  visit_date: string;
  visit_end_date: string | null;

  // Status
  status: CampusVisitStatus;

  // Visit details
  itinerary: Record<string, any> | null; // JSONB
  attendees: string[] | null; // Family members, coaches, etc.

  // Outcomes
  player_rating: number | null; // 1-5
  player_notes: string | null;
  coach_rating: number | null; // 1-5
  coach_notes: string | null;

  // Follow-up
  follow_up_required: boolean;
  follow_up_date: string | null;

  // Metadata
  created_at: string;
  updated_at: string;
}

// For scheduling visits
export interface CreateCampusVisit {
  player_id: string;
  coach_id?: string;
  program_id?: string;
  visit_type: CampusVisitType;
  visit_date: string;
  visit_end_date?: string;
  itinerary?: Record<string, any>;
  attendees?: string[];
}

// ============================================================================
// CONTACT LOG (NCAA Compliance)
// ============================================================================

export type ContactLogType =
  | 'phone_call'
  | 'text_message'
  | 'email'
  | 'in_person'
  | 'social_media'
  | 'video_call'
  | 'mail'
  | 'other';

export type ContactInitiator =
  | 'coach'
  | 'player'
  | 'parent'
  | 'high_school_coach';

export type RecruitingPeriod =
  | 'contact'
  | 'evaluation'
  | 'quiet'
  | 'dead';

export interface ContactLog {
  id: string;

  // Relationships
  player_id: string;
  coach_id: string;

  // Contact details
  contact_type: ContactLogType;
  contact_date: string; // TIMESTAMPTZ
  duration_minutes: number | null; // For calls/meetings

  // Contact direction
  initiated_by: ContactInitiator;

  // Content
  subject: string | null;
  notes: string | null;

  // NCAA compliance
  recruiting_period: RecruitingPeriod | null;
  compliance_approved: boolean;
  compliance_notes: string | null;

  // Follow-up
  follow_up_required: boolean;
  follow_up_date: string | null;

  // Metadata
  created_at: string;
  updated_at: string;
}

// For logging contact
export interface CreateContactLog {
  player_id: string;
  coach_id: string;
  contact_type: ContactLogType;
  contact_date?: string; // Defaults to NOW()
  duration_minutes?: number;
  initiated_by: ContactInitiator;
  subject?: string;
  notes?: string;
  recruiting_period?: RecruitingPeriod;
  compliance_approved?: boolean;
  compliance_notes?: string;
  follow_up_required?: boolean;
  follow_up_date?: string;
}

// ============================================================================
// PLAYER DOCUMENTS
// ============================================================================

export type PlayerDocumentType =
  | 'transcript'
  | 'test_scores'
  | 'medical_clearance'
  | 'birth_certificate'
  | 'academic_eligibility'
  | 'athletic_eligibility'
  | 'recommendation'
  | 'resume'
  | 'highlight_reel'
  | 'other';

export type AcademicTerm = 'fall' | 'spring' | 'summer' | 'annual';

export interface PlayerDocument {
  id: string;

  // Relationships
  player_id: string;
  uploaded_by: string | null; // user_id

  // Document details
  document_type: PlayerDocumentType;
  document_name: string;
  file_path: string; // Path in Supabase Storage
  file_size: number | null; // Bytes
  mime_type: string | null;

  // Academic year/term (for transcripts)
  academic_year: string | null; // e.g., "2024-2025"
  term: AcademicTerm | null;

  // Verification
  verified: boolean;
  verified_by: string | null; // coach_id
  verified_at: string | null;

  // Expiration (for medical clearances, etc.)
  expiration_date: string | null;

  // Notes
  notes: string | null;

  // Metadata
  created_at: string;
  updated_at: string;
}

// For uploading documents
export interface CreatePlayerDocument {
  player_id: string;
  uploaded_by?: string;
  document_type: PlayerDocumentType;
  document_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  academic_year?: string;
  term?: AcademicTerm;
  notes?: string;
  expiration_date?: string;
}

// ============================================================================
// ELIGIBILITY TRACKING
// ============================================================================

export type ClearinghouseStatus =
  | 'not_submitted'
  | 'pending'
  | 'certified'
  | 'not_certified';

export interface EligibilityTracking {
  id: string;

  // Relationships
  player_id: string;

  // Academic period
  academic_year: string; // e.g., "2024-2025"
  term: 'fall' | 'spring' | 'summer';

  // Academic eligibility
  gpa: number | null; // 0.0-4.0
  credits_completed: number | null;
  credits_required: number | null;
  academic_eligible: boolean | null;
  academic_notes: string | null;

  // Test scores
  sat_score: number | null; // 400-1600
  act_score: number | null; // 1-36

  // Athletic eligibility
  athletic_eligible: boolean | null;
  clearinghouse_status: ClearinghouseStatus | null;

  // Medical
  medical_clearance: boolean | null;
  medical_clearance_date: string | null;
  medical_expiration_date: string | null;

  // Notes
  notes: string | null;

  // Metadata
  created_at: string;
  updated_at: string;
}

// For creating eligibility records
export interface CreateEligibilityTracking {
  player_id: string;
  academic_year: string;
  term: 'fall' | 'spring' | 'summer';
  gpa?: number;
  credits_completed?: number;
  credits_required?: number;
  academic_eligible?: boolean;
  academic_notes?: string;
  sat_score?: number;
  act_score?: number;
  athletic_eligible?: boolean;
  clearinghouse_status?: ClearinghouseStatus;
  medical_clearance?: boolean;
  medical_clearance_date?: string;
  medical_expiration_date?: string;
  notes?: string;
}

// ============================================================================
// HELPER TYPES FOR JOINS
// ============================================================================

// Scholarship offer with player details
export interface ScholarshipOfferWithPlayer extends ScholarshipOffer {
  player: {
    id: string;
    full_name: string;
    grad_year: number;
    primary_position: string;
    avatar_url: string | null;
  };
}

// Campus visit with player and coach details
export interface CampusVisitWithDetails extends CampusVisit {
  player: {
    id: string;
    full_name: string;
    grad_year: number;
    avatar_url: string | null;
  };
  coach: {
    id: string;
    full_name: string;
    school_name: string | null;
  } | null;
}

// Contact log with player details
export interface ContactLogWithPlayer extends ContactLog {
  player: {
    id: string;
    full_name: string;
    grad_year: number;
    avatar_url: string | null;
  };
}

// Player document with uploader details
export interface PlayerDocumentWithUploader extends PlayerDocument {
  uploader: {
    id: string;
    email: string;
  } | null;
}

// Eligibility tracking with player details
export interface EligibilityTrackingWithPlayer extends EligibilityTracking {
  player: {
    id: string;
    full_name: string;
    grad_year: number;
    avatar_url: string | null;
  };
}
