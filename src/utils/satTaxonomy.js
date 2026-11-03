/**
 * SAT Domains, Topics, Error Categories, and Standard Review Workflows.
 * Aligned with the official Digital SAT Suite of Assessments specifications.
 */

export const SAT_SECTIONS = ['Math', 'Reading & Writing'];

export const SAT_MODULES = ['Module 1', 'Module 2'];

export const SAT_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const SAT_DOMAINS = {
  Math: [
    {
      name: 'Algebra',
      topics: [
        'Linear equations in one variable',
        'Linear equations in two variables',
        'Linear functions',
        'Systems of two linear equations in two variables',
        'Linear inequalities in one or two variables',
      ],
    },
    {
      name: 'Advanced Math',
      topics: [
        'Equivalent expressions & polynomial factoring',
        'Nonlinear equations in one variable & systems',
        'Nonlinear functions (Quadratic, Exponential)',
        'Polynomial, rational, radical, and absolute value expressions',
      ],
    },
    {
      name: 'Problem-Solving and Data Analysis',
      topics: [
        'Ratios, rates, proportional relationships, and units',
        'Percentages & percent change',
        'One-variable data: distributions & measures of center/spread',
        'Two-variable data: models & scatterplots',
        'Probability and conditional probability',
        'Inference from sample statistics & margin of error',
        'Evaluating statistical claims & observational studies',
      ],
    },
    {
      name: 'Geometry and Trigonometry',
      topics: [
        'Area and volume formulas',
        'Lines, angles, and triangles (similarity & congruence)',
        'Right triangles & trigonometry (sin, cos, tan, unit circle)',
        'Circles (arc length, sector area, circle equation)',
      ],
    },
  ],
  'Reading & Writing': [
    {
      name: 'Craft and Structure',
      topics: [
        'Words in Context (Vocabulary)',
        'Text Structure and Purpose',
        'Cross-Text Connections (Paired passages)',
      ],
    },
    {
      name: 'Information and Ideas',
      topics: [
        'Central Ideas and Details',
        'Command of Evidence (Textual)',
        'Command of Evidence (Quantitative / Data graphics)',
        'Inferences (Logical conclusions)',
      ],
    },
    {
      name: 'Standard English Conventions',
      topics: [
        'Boundaries (Punctuation, comma splices, run-ons)',
        'Form, Structure, and Sense (Subject-verb, pronoun-antecedent)',
        'Verb tense, aspect, and mood',
        'Modifiers and parallel structure',
      ],
    },
    {
      name: 'Expression of Ideas',
      topics: [
        'Rhetorical Synthesis (Bullet-point goal-oriented notes)',
        'Transitions (Logical connective words)',
      ],
    },
  ],
};

/**
 * The 8 standard SAT Error Categories specified for deep root cause analysis.
 */
export const ERROR_CATEGORIES = [
  {
    name: 'Knowledge Gap',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: "Didn't know the mathematical formula, grammar rule, or vocabulary word.",
  },
  {
    name: 'Application Error',
    color: 'blue',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    description: 'Knew the underlying rule/concept, but failed to apply it correctly to this specific scenario.',
  },
  {
    name: 'Misreading',
    color: 'purple',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    description: 'Missed a key constraint in the prompt (e.g. solved for x instead of 2x+1, missed "not", overlooked units).',
  },
  {
    name: 'Calculation Error',
    color: 'amber',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    description: 'Arithmetic, sign error (+/-), algebraic manipulation slip, or miskeyed calculator value.',
  },
  {
    name: 'Time Management',
    color: 'rose',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    description: 'Rushed through the question due to low time, or spent too long earlier causing panic.',
  },
  {
    name: 'Careless Execution',
    color: 'orange',
    badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    description: 'Understood everything, but selected the wrong bubble or made an unforced attention lapse.',
  },
  {
    name: 'Guessing',
    color: 'cyan',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    description: 'Had no clear approach or ran out of time and picked an answer at random.',
  },
  {
    name: 'Conceptual Misunderstanding',
    color: 'red',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
    description: 'Held a fundamentally flawed mental model of how the concept works.',
  },
];

/**
 * Smart Review Lifecycle Statuses.
 * A mistake only becomes "Fixed" after independent re-test success!
 */
export const REVIEW_STATUSES = [
  {
    id: 'New Mistake',
    label: 'New Mistake',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    step: 1,
    description: 'Recorded but not yet thoroughly analyzed.',
  },
  {
    id: 'Analyzed',
    label: 'Analyzed',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    step: 2,
    description: 'Root cause and takeaways identified by AI or student.',
  },
  {
    id: 'Learning in Progress',
    label: 'Learning in Progress',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    step: 3,
    description: 'Studying rules, reviewing flashcards or similar drills.',
  },
  {
    id: 'Ready for Retest',
    label: 'Ready for Retest',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    step: 4,
    description: 'Queued for independent timed re-testing in Retest Studio.',
  },
  {
    id: 'Fixed',
    label: 'Fixed ✓',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    step: 5,
    description: 'Successfully re-solved independently with correct reasoning.',
  },
  {
    id: 'Repeated Mistake',
    label: 'Repeated Mistake ⚠',
    badgeClass: 'bg-red-500/25 text-red-300 border-red-500/50 font-bold',
    step: 0,
    description: 'Mistake was made again during retest or subsequent tests. High priority focus.',
  },
];
