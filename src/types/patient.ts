export interface Patient {
  id: string
  user_id: string
  full_name: string
  birth_date: string | null
  current_weight: number | null
  goal_weight: number | null
  sex: string | null
  phone: string | null
  allergies: string | null
  diseases: string | null
  supplements: string | null
  disliked_foods: string | null
  daily_calories: number | null
  target_calories: number | null
  exercise_type: string | null
  exercise_intensity: string | null
  exercise_hours: number | null
  exercise_days: number | null
  created_at: string
  updated_at: string
}