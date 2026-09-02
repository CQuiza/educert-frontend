export interface AssessmentOption {
  id: number
  option_text: string
}

export interface AssessmentOptionWithCorrect extends AssessmentOption {
  is_correct: boolean
}

export interface AssessmentQuestion {
  id: number
  question_text: string
  question_type: 'multiple_choice' | 'true_false'
  points: number
  order_index: number
  options: AssessmentOption[]
}

export interface ModuleAssessment {
  id: number
  module_id: number
  passing_score: number
  questions: AssessmentQuestion[]
}

export interface AnswerSubmission {
  question_id: number
  selected_option_id: number
}

export interface AnswerResult {
  question_id: number
  question_text: string
  selected_option_id: number
  is_correct: boolean
  correct_option_id: number | null
  selected_option_text?: string | null
  correct_option_text?: string | null
}

export interface AttemptResult {
  attempt_id: number
  score: number
  passed: boolean
  total_points: number
  earned_points: number
  answers: AnswerResult[]
}

export interface TaskProgressItem {
  task_id: number
  task_title: string
  submitted: boolean
  submission_id: number | null
  file_url: string | null
  original_filename: string | null
  submitted_at: string | null
}

export interface ModuleProgressItem {
  module_id: number
  module_title: string
  module_order: number
  total_assessment_questions: number
  attempts_count: number
  last_score: number | null
  passed: boolean
  total_tasks: number
  submitted_tasks: number
  tasks: TaskProgressItem[]
}

export interface CourseProgressSummary {
  course_id: number
  course_title: string
  total_modules: number
  completed_modules: number
  progress_percent: number
  modules: ModuleProgressItem[]
}

export interface AllProgressSummary {
  courses: CourseProgressSummary[]
  overall_percent: number
}
