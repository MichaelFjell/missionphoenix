// All coaching-portal copy and labels live here so wording can be edited
// without touching components.

export const PORTAL = {
  title: 'Client Portal',
  loginTitle: 'Client login',
  loginLede: 'For active coaching clients. Log in with the email your invite was sent to.',
  emailLabel: 'Email',
  passwordLabel: 'Password',
  loginButton: 'Log in',
  forgotLink: 'Forgot your password?',
  noPortal: 'This account has no coaching portal. If you are a coaching client, log in with the email your invite was sent to.',
  logout: 'Log out',
  tabs: { today: 'Today', history: 'History', intake: 'Intake' },
  dayCounter: (day, total) => `Day ${day} of ${total}`,
  streakLabel: 'streak',
  programEnded: 'Your 30 days are complete. Your history stays available here.',
  programNotStarted: (date) => `Your program starts on ${date}. Complete your intake before day one.`,
};

export const CHECKIN = {
  title: "Today's check-in",
  savedNote: 'Saved. You can edit until midnight your time.',
  alreadyDone: 'Checked in for today.',
  urgeLabel: 'Urge intensity today',
  urgeLow: 'none',
  urgeHigh: 'overwhelming',
  actedOutLabel: 'Did you act out today?',
  actedOutYes: 'Yes',
  actedOutNo: 'No',
  actedOutNote: 'Honesty is the whole point. A relapse reported is a relapse we can work with. No punishment.',
  triggersLabel: 'Triggers encountered today',
  triggersOtherPlaceholder: 'Anything else that triggered you… (optional)',
  noTriggersYet: 'Michael will set up your personal trigger list after your intake.',
  sleepLabel: 'Hours of sleep last night',
  movementLabel: 'Did you move your body today?',
  movementPlaceholder: 'What did you do? (walk, run, lifted, yoga…)',
  protocolLabel: 'Your protocol today',
  noProtocolYet: 'Your protocol checklist appears here once Michael sets up your plan.',
  winLabel: 'One win today',
  winPlaceholder: 'Small counts. What went right?',
  focusLabel: "Tomorrow's focus",
  focusPlaceholder: 'One thing. Keep it concrete.',
  submitButton: 'Send check-in',
  updateButton: 'Update check-in',
  submitting: 'Saving…',
  errorGeneric: 'Could not save. Check your connection and try again.',
};

export const HISTORY = {
  title: 'Your 30 days',
  legendDone: 'Checked in',
  legendMissed: 'Missed',
  legendToday: 'Today',
  urgeChartTitle: 'Urge intensity over time',
  noCheckins: 'No check-ins yet. Your first one is today.',
  coachReplyLabel: 'Michael:',
  actedOutTag: 'acted out',
  movedTag: 'moved',
  sleepTag: (h) => `${h}h sleep`,
};

export const INTAKE = {
  title: 'Intake',
  lede: 'This is what your personal plan gets built from. Take your time and be honest — nothing here is used against you, ever. About 10 minutes.',
  saveDraft: 'Save draft',
  draftSaved: 'Draft saved.',
  submit: 'Submit intake',
  submitConfirm: 'Submit your intake? You will not be able to edit it afterwards.',
  submittedTitle: 'Intake submitted',
  submittedNote: 'Michael builds your week-one plan from this. You can read your answers below.',
  errorGeneric: 'Could not save. Check your connection and try again.',
};

// Answers are stored as jsonb keyed by these ids — edit labels freely,
// but do not change ids once a client has started answering.
export const INTAKE_QUESTIONS = [
  { id: 'history', label: 'Your history with porn', hint: 'When it started, how it developed, how much time it takes now.' },
  { id: 'attempts', label: 'Previous quit attempts', hint: 'What have you tried before, and why do you think it failed?' },
  { id: 'triggers', label: 'Known triggers', hint: 'Situations, feelings, times of day, places, apps.' },
  { id: 'schedule', label: 'Your typical day', hint: 'Work or school hours, commute, evenings, weekends.' },
  { id: 'sleep', label: 'Sleep baseline', hint: 'When do you go to bed and wake up? How many hours do you actually sleep?' },
  { id: 'exercise', label: 'Exercise baseline', hint: 'What movement do you currently do — honestly?' },
  { id: 'health', label: 'Health notes', hint: 'Any health issues, medication or diagnoses Michael should know about.' },
  { id: 'support', label: 'Support system', hint: 'Who knows you are doing this? Who can you call on a bad night?' },
  { id: 'success', label: 'A successful 30 days', hint: 'What does success look like, in your own words?' },
  { id: 'strengths', label: 'Your strengths', hint: 'What do you have going for you?' },
  { id: 'weaknesses', label: 'Your weaknesses', hint: 'Where do you usually break?' },
];

export const WELCOME = {
  title: 'Welcome',
  lede: (name) => `Hi ${name}. Set a password to open your coaching portal.`,
  invalidToken: 'This invite link is invalid or has already been used. If you think this is a mistake, contact Michael.',
  passwordLabel: 'Choose a password',
  passwordConfirmLabel: 'Repeat password',
  passwordHint: 'At least 8 characters.',
  passwordMismatch: 'Passwords do not match.',
  submitButton: 'Create my portal',
  submitting: 'Setting up…',
  errorExists: 'An account with this email already exists. Try logging in instead, or use the password reset.',
  errorGeneric: 'Something went wrong. Try again, or contact Michael.',
};

export const RESET = {
  requestTitle: 'Reset password',
  requestLede: 'Enter the email your invite was sent to. If it has a portal account, you will get a reset link.',
  requestButton: 'Send reset link',
  requestSent: 'If that email has a portal account, a reset link is on its way. It is valid for one hour.',
  newTitle: 'Set a new password',
  newButton: 'Save new password',
  invalidToken: 'This reset link is invalid or has expired. Request a new one below.',
  done: 'Password updated. You can log in now.',
  goLogin: 'Go to login',
};

export const PRIVACY = {
  title: 'Your data',
  paragraphs: [
    'Coaching clients get a private portal where daily check-ins, intake answers and progress are stored. This is sensitive personal data and it is treated that way: it is visible only to you and to Michael, it is never shared with anyone else, and it is never used for anything except your coaching.',
    'You can request deletion of your account and all of your data at any time — during or after the 30 days — by sending one email. Deletion is complete and permanent.',
  ],
};

export const ADMIN = {
  tab: 'Clients',
  createTitle: 'New client',
  createButton: 'Create & send invite',
  createNote: 'The client gets an invite email with a personal setup link. Until the missionphoenix.life domain is verified in Resend, invite emails only deliver to your own address.',
  rosterEmpty: 'No clients yet.',
  checkedToday: 'checked in',
  notCheckedToday: 'not yet today',
  statusLabels: { invited: 'invited', active: 'active', completed: 'completed', archived: 'archived' },
  resendInvite: 'Resend invite',
  deleteConfirm: (name) => `Delete ${name} and ALL their data (check-ins, intake, notes, login)?\nThis cannot be undone.`,
  deleteButton: 'Delete client & all data',
  notesTitle: 'Private notes',
  notesPlaceholder: 'Your coaching notes. The client can never see this.',
  notesSave: 'Save notes',
  triggersTitle: 'Trigger list',
  triggersNote: 'These appear as checkboxes in the client’s daily check-in.',
  protocolTitle: 'Protocol checklist',
  protocolNote: 'Daily habit items. Set a start date to sequence habits in (week 2, week 3…). Empty = from day one.',
  intakeTitle: 'Intake answers',
  intakeNotSubmitted: 'Intake not submitted yet.',
  replyPlaceholder: 'Reply to this check-in… (client sees this)',
  replySave: 'Save reply',
  triggerFreqTitle: 'Most frequent triggers',
};
