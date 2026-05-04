// Initial A/B/C program seeded from Michael's actual current routine.
// All slots are confirmed (needs_review:false) — no copper review-dots.
//
// Bump SEED_VERSION when this file changes meaningfully so cached
// localStorage copies get invalidated and re-fetched from Supabase.
// store.js reads this and clears mp.trainer.program if the cached
// version doesn't match.

export const SEED_VERSION = '2026-05-04';

export const SLOT_TAGS = [
  'compound', 'isolation', 'machine', 'free-weight',
  'hypertrophy', 'strength', 'rehab',
];

export const CONDITIONAL_RULES = [
  { id: 'neck-rotation', label: 'Once or twice per 7 days' },
];

const ex = (name, slug, tags) => ({ name, slug, tags });

export const SEED_CARDIO = [
  {
    code: 'N4x4',
    name: 'Norwegian 4×4',
    session_kind: 'cardio',
    slots: [{
      kind: 'intervals',
      blocks: [
        { id: 'b1', label: 'Warmup',  target_duration_s: 600, target_hr: 130 },
        { id: 'b2', label: 'Work 1',  target_duration_s: 240, target_hr: 178 },
        { id: 'b3', label: 'Rest 1',  target_duration_s: 180, target_hr: 145 },
        { id: 'b4', label: 'Work 2',  target_duration_s: 240, target_hr: 178 },
        { id: 'b5', label: 'Rest 2',  target_duration_s: 180, target_hr: 145 },
        { id: 'b6', label: 'Work 3',  target_duration_s: 240, target_hr: 178 },
        { id: 'b7', label: 'Rest 3',  target_duration_s: 180, target_hr: 145 },
        { id: 'b8', label: 'Work 4',  target_duration_s: 240, target_hr: 178 },
        { id: 'b9', label: 'Cooldown', target_duration_s: 300, target_hr: 120 },
      ],
      notes: 'Work HR 90–95% max, rest HR ~70%.',
    }],
  },
  {
    code: 'Z2',
    name: 'Zone 2 base',
    session_kind: 'cardio',
    slots: [{
      kind: 'steady',
      target_duration_s: 2700,
      target_hr: 128,
      ceiling_hr: 130,
      notes: 'Karvonen ceiling, nasal-breathing test.',
    }],
  },
];

// ─── Strength A ─── Foundation & Posture (Pull Dominant)
const SESSION_A_SLOTS = [
  {
    id: 'slot_a_1', sort_order: 1,
    exercise: ex('Dead bugs + Bird dogs', 'dead-bugs-bird-dogs', ['rehab']),
    alternatives: [
      ex('Cat-cow', 'cat-cow', ['rehab']),
      ex('Glute bridges', 'glute-bridges', ['rehab', 'isolation']),
    ],
    target: { sets: 2, reps: 20, load_kg: 0 },
    notes: '20 each side; alternate dead bugs and bird dogs. 3-sec eccentric on every rep this session; 60–90s rest, 2–3 min on heavy compounds.',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_a_2', sort_order: 2,
    exercise: ex('Passive hang', 'passive-hang', ['rehab']),
    alternatives: [
      ex('Scapular pull-ups', 'scapular-pull-ups', ['rehab', 'isolation']),
    ],
    target: { sets: 2, reps: 60, load_kg: 0 },
    notes: 'Seconds per hold; 2 min total accumulated.',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_a_3', sort_order: 3,
    exercise: ex('Lat pulldown (long curved bar)', 'lat-pulldown-curved-bar', ['compound', 'machine', 'hypertrophy']),
    alternatives: [
      ex('Pull-ups', 'pull-ups', ['compound', 'free-weight', 'hypertrophy']),
      ex('Neutral-grip pulldown', 'neutral-grip-pulldown', ['compound', 'machine', 'hypertrophy']),
    ],
    target: { sets: 3, reps: 10, load_kg: 59 },
    notes: '',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_a_4', sort_order: 4,
    exercise: ex('Seated row', 'seated-row', ['compound', 'machine', 'hypertrophy']),
    alternatives: [
      ex('T-bar row', 't-bar-row', ['compound', 'free-weight', 'hypertrophy']),
      ex('Chest-supported DB row', 'chest-supported-db-row', ['compound', 'free-weight', 'hypertrophy']),
      ex('Machine row', 'machine-row', ['compound', 'machine', 'hypertrophy']),
    ],
    target: { sets: 3, reps: 8, load_kg: 66 },
    notes: '',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_a_5', sort_order: 5,
    exercise: ex('Cable pull-through', 'cable-pull-through', ['compound', 'hypertrophy']),
    alternatives: [
      ex('Hip thrust machine', 'hip-thrust-machine', ['compound', 'machine', 'hypertrophy']),
      ex('Machine RDL', 'machine-rdl', ['compound', 'machine', 'hypertrophy']),
      ex('Glute kickback machine', 'glute-kickback-machine', ['isolation', 'machine', 'hypertrophy']),
    ],
    target: { sets: 3, reps: 10, load_kg: 50 },
    notes: '',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_a_6', sort_order: 6,
    exercise: ex('Face pulls (eye level)', 'face-pulls-eye-level', ['isolation', 'hypertrophy', 'rehab']),
    alternatives: [
      ex('Reverse pec deck', 'reverse-pec-deck', ['isolation', 'machine', 'hypertrophy']),
      ex('Rear delt fly machine', 'rear-delt-fly-machine', ['isolation', 'machine', 'hypertrophy']),
    ],
    target: { sets: 3, reps: 15, load_kg: 18 },
    notes: '',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_a_7', sort_order: 7,
    exercise: ex("Farmer's carries", 'farmers-carries', ['compound', 'free-weight']),
    alternatives: [
      ex('Trap bar carry', 'trap-bar-carry', ['compound', 'free-weight']),
      ex('Suitcase carry', 'suitcase-carry', ['compound', 'free-weight']),
    ],
    target: { sets: 3, reps: 40, load_kg: 30 },
    notes: '40 steps per set.',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_a_8', sort_order: 8,
    exercise: ex('Cool down — legs up the wall', 'cooldown-legs-up-wall', ['rehab']),
    alternatives: [
      ex('Pigeon pose', 'pigeon-pose', ['rehab']),
      ex('Supine twist', 'supine-twist', ['rehab']),
    ],
    target: { sets: 1, reps: 300, load_kg: 0 },
    notes: '5 minutes; legs up the wall.',
    conditional: false, conditional_rule: null, needs_review: false,
  },
];

// ─── Strength B ─── Power & Presence (Push & Squat)
const SESSION_B_SLOTS = [
  {
    id: 'slot_b_1', sort_order: 1,
    exercise: ex('Cat-cow + Dead bugs', 'cat-cow-dead-bugs', ['rehab']),
    alternatives: [
      ex('Bird dogs', 'bird-dogs', ['rehab']),
      ex('Glute bridges', 'glute-bridges', ['rehab', 'isolation']),
    ],
    target: { sets: 1, reps: 10, load_kg: 0 },
    notes: '10 cat-cow + 10 dead bugs.',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_b_2', sort_order: 2,
    exercise: ex('Goblet squat', 'goblet-squat', ['compound', 'free-weight']),
    alternatives: [
      ex('Leg press', 'leg-press', ['compound', 'machine', 'hypertrophy']),
      ex('Hack squat machine', 'hack-squat-machine', ['compound', 'machine', 'hypertrophy']),
      ex('Bulgarian split squat', 'bulgarian-split-squat', ['compound', 'free-weight', 'hypertrophy']),
    ],
    target: { sets: 3, reps: 10, load_kg: 30 },
    notes: '',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_b_3', sort_order: 3,
    exercise: ex('Standing DB overhead press', 'standing-db-ohp', ['compound', 'free-weight', 'strength']),
    alternatives: [
      ex('Machine shoulder press', 'machine-shoulder-press', ['compound', 'machine', 'hypertrophy']),
      ex('Seated DB OHP', 'seated-db-ohp', ['compound', 'free-weight', 'hypertrophy']),
    ],
    target: { sets: 3, reps: 8, load_kg: 20 },
    notes: '',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_b_4', sort_order: 4,
    exercise: ex('DB bench press', 'db-bench-press', ['compound', 'free-weight', 'hypertrophy']),
    alternatives: [
      ex('Machine chest press', 'machine-chest-press', ['compound', 'machine', 'hypertrophy']),
      ex('Incline DB bench', 'incline-db-bench', ['compound', 'free-weight', 'hypertrophy']),
      ex('Cable crossover', 'cable-crossover', ['isolation', 'machine', 'hypertrophy']),
    ],
    target: { sets: 3, reps: 8, load_kg: 27.5 },
    notes: '',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_b_5', sort_order: 5,
    exercise: ex('Plank with leg lifts', 'plank-with-leg-lifts', ['isolation', 'rehab']),
    alternatives: [
      ex('Hollow body hold', 'hollow-body-hold', ['isolation', 'rehab']),
      ex('Dead bug', 'dead-bug', ['rehab']),
    ],
    target: { sets: 3, reps: 45, load_kg: 0 },
    notes: 'Seconds, not reps.',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_b_6', sort_order: 6,
    exercise: ex('Calf raises', 'calf-raises', ['isolation', 'hypertrophy']),
    alternatives: [
      ex('Seated calf raise machine', 'seated-calf-raise-machine', ['isolation', 'machine', 'hypertrophy']),
      ex('Leg press calf raise', 'leg-press-calf-raise', ['isolation', 'machine', 'hypertrophy']),
    ],
    target: { sets: 3, reps: 15, load_kg: 0 },
    notes: 'Bodyweight or light DB.',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_b_7', sort_order: 7,
    exercise: ex("Cool down — Child's pose", 'cooldown-childs-pose', ['rehab']),
    alternatives: [
      ex('Pigeon pose', 'pigeon-pose', ['rehab']),
      ex('Deep squat hold', 'deep-squat-hold', ['rehab']),
    ],
    target: { sets: 1, reps: 300, load_kg: 0 },
    notes: "5 minutes; child's pose.",
    conditional: false, conditional_rule: null, needs_review: false,
  },
];

// ─── Strength C ─── Integrated Hypertrophy
const SESSION_C_SLOTS = [
  {
    id: 'slot_c_1', sort_order: 1,
    exercise: ex('Deadlift (Olympic bar)', 'deadlift-olympic-bar', ['compound', 'free-weight', 'strength']),
    alternatives: [
      ex('Trap-bar deadlift', 'trap-bar-deadlift', ['compound', 'free-weight', 'strength']),
      ex('Romanian deadlift', 'romanian-deadlift', ['compound', 'free-weight', 'hypertrophy']),
    ],
    target: { sets: 3, reps: 5, load_kg: 100 },
    notes: '',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_c_2', sort_order: 2,
    exercise: ex('Incline DB press', 'incline-db-press', ['compound', 'free-weight', 'hypertrophy']),
    alternatives: [
      ex('Incline machine press', 'incline-machine-press', ['compound', 'machine', 'hypertrophy']),
      ex('Pec deck', 'pec-deck', ['isolation', 'machine', 'hypertrophy']),
      ex('Smith incline', 'smith-incline', ['compound', 'machine', 'hypertrophy']),
    ],
    target: { sets: 3, reps: 8, load_kg: 27.5 },
    notes: '',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_c_3', sort_order: 3,
    exercise: ex('Lat pulldown', 'lat-pulldown', ['compound', 'machine', 'hypertrophy']),
    alternatives: [
      ex('Pull-ups', 'pull-ups', ['compound', 'free-weight', 'hypertrophy']),
      ex('Neutral-grip pulldown', 'neutral-grip-pulldown', ['compound', 'machine', 'hypertrophy']),
    ],
    target: { sets: 3, reps: 8, load_kg: 59 },
    notes: '',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_c_4', sort_order: 4,
    exercise: ex('DB bicep curls', 'db-bicep-curls', ['isolation', 'free-weight', 'hypertrophy']),
    alternatives: [
      ex('Preacher curl machine', 'preacher-curl-machine', ['isolation', 'machine', 'hypertrophy']),
      ex('Hammer curl', 'hammer-curl', ['isolation', 'free-weight', 'hypertrophy']),
      ex('Cable curl', 'cable-curl', ['isolation', 'machine', 'hypertrophy']),
    ],
    target: { sets: 3, reps: 8, load_kg: 12.5 },
    notes: '',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_c_5', sort_order: 5,
    exercise: ex('Cable rope pushdown', 'cable-rope-pushdown', ['isolation', 'machine', 'hypertrophy']),
    alternatives: [
      ex('Overhead DB tricep extension', 'overhead-db-tricep-extension', ['isolation', 'free-weight', 'hypertrophy']),
      ex('Skull crushers', 'skull-crushers', ['isolation', 'free-weight', 'hypertrophy']),
    ],
    target: { sets: 3, reps: 12, load_kg: 27 },
    notes: '',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_c_6', sort_order: 6,
    exercise: ex('Lateral raises', 'lateral-raises', ['isolation', 'free-weight', 'hypertrophy']),
    alternatives: [
      ex('Machine lateral raise', 'machine-lateral-raise', ['isolation', 'machine', 'hypertrophy']),
      ex('Cable lateral raise', 'cable-lateral-raise', ['isolation', 'machine', 'hypertrophy']),
    ],
    target: { sets: 3, reps: 8, load_kg: 9 },
    notes: '',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_c_7', sort_order: 7,
    exercise: ex('DB shrugs', 'db-shrugs', ['isolation', 'hypertrophy']),
    alternatives: [
      ex('Barbell shrugs', 'barbell-shrugs', ['isolation', 'free-weight', 'hypertrophy']),
      ex('Trap-bar shrugs', 'trap-bar-shrugs', ['isolation', 'free-weight', 'hypertrophy']),
      ex('Machine shrugs', 'machine-shrugs', ['isolation', 'machine', 'hypertrophy']),
    ],
    target: { sets: 3, reps: 12, load_kg: 30 },
    notes: '1–2 sec hold at top, no rolling. Deliberately at end of session.',
    conditional: false, conditional_rule: null, needs_review: false,
  },
  {
    id: 'slot_c_8', sort_order: 8,
    exercise: ex('Cool down — somatic shaking', 'cooldown-somatic-shaking', ['rehab']),
    alternatives: [
      ex('Light walking', 'light-walking', ['rehab']),
      ex("Child's pose", 'childs-pose', ['rehab']),
    ],
    target: { sets: 1, reps: 300, load_kg: 0 },
    notes: '5 minutes; somatic shaking.',
    conditional: false, conditional_rule: null, needs_review: false,
  },
];

export const SEED_PROGRAM = [
  { code: 'A', name: 'Foundation & Posture',  session_kind: 'strength', slots: SESSION_A_SLOTS },
  { code: 'B', name: 'Power & Presence',      session_kind: 'strength', slots: SESSION_B_SLOTS },
  { code: 'C', name: 'Integrated Hypertrophy', session_kind: 'strength', slots: SESSION_C_SLOTS },
];

export const slugify = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const newSlotId = () => `slot_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
