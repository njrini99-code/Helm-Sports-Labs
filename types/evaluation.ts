export interface Evaluation {
  id: string;
  player_id: string;
  event_id: string | null;
  evaluator_id: string | null;
  evaluator_name: string | null;
  overall_grade: number | null;
  arm_grade: number | null;
  bat_grade: number | null;
  speed_grade: number | null;
  fielding_grade: number | null;
  baseball_iq_grade: number | null;
  tags: string[];
  notes: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  event?: {
    name: string;
    start_time: string;
  } | null;
}
