// This contains all of the interfaces for models throughout the app.

export interface StringMap {
  [key: string]: string | number;
}

export interface LoginInfo {
  user_id: string;
  course_id: string;
  logged_in: boolean;
  permission: number;
}

export interface UserPassword {
  user_id: string;
  password: string;
  course_id: string;
}

export interface Problem {
  att_to_open_children: string;
  counts_parent_grade: string[];
  flags: string;
  max_attempts: number;
  prCount: string;
  prPeriod: string;
  problem_id: number;
  problem_source: string;
  set_id: string;
  showMeAnother: string;
  showMeAnotherCount: number;
  source_file: string;
  value: number;
}

export interface UserProblem {
  user_id: string;
  set_id: string;
  problem_id: number;
  source_file: string;
  value: number;
  max_attempts: number;
  showMeAnother: number;
  showMeAnotherCount: number;
  prPeriod: number;
  prCount: number;
  problem_seed: number;
  status: number;
  attempted: number;
  last_answer: string;
  num_correct: number;
  num_incorrect: number;
  att_to_open_children: number;
  counts_parent_grade: number;
  sub_status: number;
  flags: string;
}

export interface ProblemSet {
  set_id: string;
  assigned_users: string[];
  problems: Problem[];
  set_header: string;
  hardcopy_header: string;
  open_date: number;
  due_date: number;
  answer_date: number;
  reduced_scoring_date: number;
  visible: boolean;
  enable_reduced_scoring: boolean;
  assignment_type: string;
  description: string;
  restricted_release: string;
  restricted_status: number;
  attempts_per_version: number;
  time_interval: number;
  versions_per_interval: number;
  version_time_limit: number;
  version_creation_time: number;
  problem_randorder: boolean;
  version_last_attempt_time: number;
  problems_per_page: number;
  hide_score: string;
  hide_score_by_problem: string;
  hide_work: string;
  time_limit_cap: number;
  restrict_ip: string;
  relax_restrict_ip: string;
  restricted_login_proctor: string;
  hide_hint: boolean;
  restrict_prob_progression: boolean;
  email_instructor: boolean;
  [key: string]: string | number | boolean | Problem[] | string[];
}

export interface ScoreType {
  status: number;
}

export interface UserSet {
  set_id: string;
  set_header: string;
  hardcopy_header: string;
  open_date: number;
  due_date: number;
  answer_date: number;
  reduced_scoring_date: number;
  visible: boolean;
  enable_reduced_scoring: boolean;
  assignment_type: string;
  description: string;
  restricted_release: string;
  restricted_status: number;
  attempts_per_version: number;
  time_interval: number;
  versions_per_interval: number;
  version_time_limit: number;
  version_creation_time: number;
  problem_randorder: boolean;
  version_last_attempt_time: number;
  problems_per_page: number;
  hide_score: string;
  hide_score_by_problem: string;
  hide_work: string;
  time_limit_cap: number;
  restrict_ip: string;
  relax_restrict_ip: string;
  restricted_login_proctor: string;
  hide_hint: boolean;
  restrict_prob_progression: boolean;
  email_instructor: boolean;
  lis_source_did: string;
  scores: ScoreType[];
  problems: UserProblem[];
  [key: string]:
    | string
    | number
    | boolean
    | UserProblem[]
    | string[]
    | ScoreType[];
}

export type ProblemSetList = Map<string, ProblemSet>;
export type UserSetList = Map<string, UserSet>;

export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  status: string;
  comment: string;
  useMathView: boolean;
  permission: number;
  recitation: string;
  student_id: string;
  lis_source_did: string;
  email_address: string;
  displayMode: string;
  section: string;
  showOldAnswers: boolean;
  useWirisEditor: boolean;
  [key: string]: string | boolean | number;
}

export type UserList = Map<string, User>;

export interface Setting {
  var: string;
  type: string;
  doc: string;
  category: string;
  value: string | number | string[];
  doc2: string;
  hashVar: object;
  values: string[];
  labels: string[];
  min: number;
  width: number;
}

export interface Message {
  id: number;
  long: string;
  short: string;
}

export interface FileInfo {
  name: string;
  type: string;
}

export interface FlagType {
  ANSWER_ENTRY_ORDER: string[];
  [key: string]: string | string[];
}

export interface RenderedProblem {
  WARNINGS: string;
  answers: StringMap;
  debug_messages: string[];
  errors: string;
  flags: FlagType;
  header_text: string;
  internal_debug_messages: string[];
  problem_result: StringMap;
  problem_state: StringMap;
  text: string;
  warning_messages: string[];
}

export interface UserSetScore {
  user_id: string;
  set_id: string;
  scores: {
    problem_id: number;
    status: number;
  }[];
}

export interface AnswerType {
  ans_label: string;
  ans_message: string;
  ans_name: string;
  correct_ans: string;
  correct_ans_latex_string: string;
  correct_value: string;
  done: boolean;
  error_flag: string;
  error_message: string;
  ignoreInfinity: boolean;
  ignoreStrings: boolean;
  original_student_ans: string;
  preview_latex_string: string;
  preview_text_string: string;
  score: number;
  showDomainErrors: boolean;
  showEqualErrors: boolean;
  showTypeWarnings: boolean;
  showUnionReduceWarnings: boolean;
  student_ans: string;
  studentsMustReduceUnions: boolean;
  type: string;
  upToConstant: boolean;
}
