// Initial A/B/C program seeded from the user's current routine.
// Slots flagged needsReview are educated guesses — the dashboard surfaces
// these with a copper dot so the user can confirm or edit them in settings.

export const SLOT_TAGS = [
  'compound', 'isolation', 'machine', 'free-weight',
  'hypertrophy', 'strength', 'rehab',
];

export const CONDITIONAL_RULES = [
  { id: 'neck-rotation', label: 'Once or twice per 7 days' },
];

let _id = 0;
const sid = () => `slot_${Date.now().toString(36)}_${(++_id).toString(36)}`;

const ex = (name, slug, tags) => ({ name, slug, tags });

export const SEED_PROGRAM = [
  {
    code: 'A',
    name: 'Pull / Posterior',
    slots: [
      {
        id: sid(),
        sort_order: 1,
        exercise: ex('Deadlift', 'deadlift', ['compound', 'free-weight', 'strength']),
        alternatives: [
          ex('Trap-bar deadlift', 'trap-bar-deadlift', ['compound', 'free-weight', 'strength']),
          ex('Romanian deadlift', 'romanian-deadlift', ['compound', 'free-weight', 'hypertrophy']),
          ex('Block pull', 'block-pull', ['compound', 'free-weight', 'strength']),
        ],
        target: { sets: 3, reps: 5, load_kg: 100 },
        notes: '',
        conditional: false,
        conditional_rule: null,
        needs_review: false,
      },
      {
        id: sid(),
        sort_order: 2,
        exercise: ex('Lat pulldown', 'lat-pulldown', ['compound', 'machine', 'hypertrophy']),
        alternatives: [
          ex('Pull-up', 'pull-up', ['compound', 'free-weight', 'hypertrophy']),
          ex('Chin-up', 'chin-up', ['compound', 'free-weight', 'hypertrophy']),
        ],
        target: { sets: 3, reps: 10, load_kg: null },
        notes: '',
        conditional: false,
        conditional_rule: null,
        needs_review: true,
      },
      {
        id: sid(),
        sort_order: 3,
        exercise: ex('DB row', 'db-row', ['compound', 'free-weight', 'hypertrophy']),
        alternatives: [
          ex('Chest-supported row', 'chest-supported-row', ['compound', 'machine', 'hypertrophy']),
          ex('Cable row', 'cable-row', ['compound', 'machine', 'hypertrophy']),
        ],
        target: { sets: 3, reps: 10, load_kg: null },
        notes: '',
        conditional: false,
        conditional_rule: null,
        needs_review: true,
      },
      {
        id: sid(),
        sort_order: 4,
        exercise: ex('Neck harness', 'neck-harness', ['isolation', 'rehab']),
        alternatives: [
          ex('Plate neck flexion', 'plate-neck-flexion', ['isolation', 'rehab']),
          ex('Banded neck rotation', 'banded-neck-rotation', ['isolation', 'rehab']),
        ],
        target: { sets: 3, reps: 12, load_kg: null },
        notes: 'Rotate flexion and extension across the week',
        conditional: true,
        conditional_rule: 'neck-rotation',
        needs_review: false,
      },
    ],
  },
  {
    code: 'B',
    name: 'Push',
    slots: [
      {
        id: sid(),
        sort_order: 1,
        exercise: ex('DB bench press', 'db-bench-press', ['compound', 'free-weight', 'hypertrophy']),
        alternatives: [
          ex('Barbell bench press', 'barbell-bench-press', ['compound', 'free-weight', 'strength']),
          ex('Machine chest press', 'machine-chest-press', ['compound', 'machine', 'hypertrophy']),
          ex('Push-up', 'push-up', ['compound', 'free-weight', 'hypertrophy']),
        ],
        target: { sets: 3, reps: 8, load_kg: null },
        notes: '',
        conditional: false,
        conditional_rule: null,
        needs_review: true,
      },
      {
        id: sid(),
        sort_order: 2,
        exercise: ex('Overhead press', 'ohp', ['compound', 'free-weight', 'strength']),
        alternatives: [
          ex('DB shoulder press', 'db-shoulder-press', ['compound', 'free-weight', 'hypertrophy']),
          ex('Machine shoulder press', 'machine-shoulder-press', ['compound', 'machine', 'hypertrophy']),
        ],
        target: { sets: 3, reps: 6, load_kg: null },
        notes: '',
        conditional: false,
        conditional_rule: null,
        needs_review: true,
      },
      {
        id: sid(),
        sort_order: 3,
        exercise: ex('DB triceps extension', 'db-triceps-extension', ['isolation', 'free-weight', 'hypertrophy']),
        alternatives: [
          ex('Cable pushdown', 'cable-pushdown', ['isolation', 'machine', 'hypertrophy']),
          ex('Skull crusher', 'skull-crusher', ['isolation', 'free-weight', 'hypertrophy']),
        ],
        target: { sets: 3, reps: 10, load_kg: null },
        notes: '',
        conditional: false,
        conditional_rule: null,
        needs_review: true,
      },
      {
        id: sid(),
        sort_order: 4,
        exercise: ex('Neck harness', 'neck-harness', ['isolation', 'rehab']),
        alternatives: [
          ex('Plate neck extension', 'plate-neck-extension', ['isolation', 'rehab']),
          ex('Banded neck flexion', 'banded-neck-flexion', ['isolation', 'rehab']),
        ],
        target: { sets: 3, reps: 12, load_kg: null },
        notes: '',
        conditional: true,
        conditional_rule: 'neck-rotation',
        needs_review: false,
      },
    ],
  },
  {
    code: 'C',
    name: 'Squat / Mixed',
    slots: [
      {
        id: sid(),
        sort_order: 1,
        exercise: ex('Goblet squat', 'goblet-squat', ['compound', 'free-weight', 'hypertrophy']),
        alternatives: [
          ex('Back squat', 'back-squat', ['compound', 'free-weight', 'strength']),
          ex('Front squat', 'front-squat', ['compound', 'free-weight', 'strength']),
          ex('Leg press', 'leg-press', ['compound', 'machine', 'hypertrophy']),
        ],
        target: { sets: 3, reps: 8, load_kg: null },
        notes: '',
        conditional: false,
        conditional_rule: null,
        needs_review: false,
      },
      {
        id: sid(),
        sort_order: 2,
        exercise: ex('Bulgarian split squat', 'bulgarian-split-squat', ['compound', 'free-weight', 'hypertrophy']),
        alternatives: [
          ex('Reverse lunge', 'reverse-lunge', ['compound', 'free-weight', 'hypertrophy']),
          ex('Step-up', 'step-up', ['compound', 'free-weight', 'hypertrophy']),
        ],
        target: { sets: 3, reps: 8, load_kg: null },
        notes: 'Per leg',
        conditional: false,
        conditional_rule: null,
        needs_review: true,
      },
      {
        id: sid(),
        sort_order: 3,
        exercise: ex('Hanging leg raise', 'hanging-leg-raise', ['isolation', 'free-weight', 'hypertrophy']),
        alternatives: [
          ex('Cable crunch', 'cable-crunch', ['isolation', 'machine', 'hypertrophy']),
          ex('Plank', 'plank', ['isolation', 'free-weight', 'rehab']),
        ],
        target: { sets: 3, reps: 10, load_kg: null },
        notes: '',
        conditional: false,
        conditional_rule: null,
        needs_review: true,
      },
      {
        id: sid(),
        sort_order: 4,
        exercise: ex('Neck harness', 'neck-harness', ['isolation', 'rehab']),
        alternatives: [
          ex('Plate neck flexion', 'plate-neck-flexion', ['isolation', 'rehab']),
          ex('Banded neck rotation', 'banded-neck-rotation', ['isolation', 'rehab']),
        ],
        target: { sets: 3, reps: 12, load_kg: null },
        notes: '',
        conditional: true,
        conditional_rule: 'neck-rotation',
        needs_review: false,
      },
    ],
  },
];

export const slugify = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const newSlotId = () => `slot_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
