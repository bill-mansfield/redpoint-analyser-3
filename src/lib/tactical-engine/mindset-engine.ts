import type { TacticalPhase } from './types'
import type { MindsetProgress } from '../../types'

export type MindsetPrompt = {
  phase: TacticalPhase
  question: string
  actionHint: string
}

// Phase-triggered prompts — mindset woven into the tactical process
export const MINDSET_PROMPTS: MindsetPrompt[] = [
  {
    phase: 'work_cruxes',
    question: 'Have you identified any fear or limiting beliefs about the hard moves?',
    actionHint: 'Notice when you hesitate — the feeling is data, not a verdict.',
  },
  {
    phase: 'establish_rests',
    question: 'Can you actually recover at each rest, or are you just stopping there?',
    actionHint: 'Find the position where your forearms genuinely drain.',
  },
  {
    phase: 'link_sections',
    question: 'Have you visualised the full sequence mentally?',
    actionHint: 'Run the route in your head from first move to chains — feel each hold.',
  },
  {
    phase: 'low_points',
    question: 'Are you starting from the lowest point that truly challenges you?',
    actionHint: 'Low-pointing builds proof. More laps from lower = more conviction.',
  },
  {
    phase: 'high_points',
    question: 'Can you climb past each crux from the ground with confidence?',
    actionHint: 'If you fall at the crux every time, it\'s not dialed — go back to work_cruxes.',
  },
  {
    phase: 'pre_send_mindset',
    question: 'Have you done the five readiness checks?',
    actionHint: 'Visualise, breathe, set a clear goal, review beta, rehearse your monologue.',
  },
  {
    phase: 'redpoint',
    question: 'Do you know exactly what a good send attempt looks like for you today?',
    actionHint: 'Leave the ground with a plan, not a hope.',
  },
]

export const getPhasePrompt = (phase: TacticalPhase): MindsetPrompt | undefined =>
  MINDSET_PROMPTS.find((p) => p.phase === phase)

export const defaultMindsetProgress = (): MindsetProgress => ({
  hasVisualized: false,
  hasBreathingPlan: false,
  hasSessionGoal: false,
  hasReviewedBeta: false,
  hasPositiveMonologue: false,
})
