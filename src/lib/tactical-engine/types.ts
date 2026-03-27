import type { Annotation, MindsetProgress } from '../../types'

export type TacticalPhase =
  | 'work_cruxes'
  | 'establish_rests'
  | 'link_sections'
  | 'low_points'
  | 'high_points'
  | 'pre_send_mindset'
  | 'redpoint'

export type PhaseStatus = 'locked' | 'active' | 'completed'

export type GradeGapCategory = 'greedy' | 'moderate' | 'patient'

export type GradeGap = {
  category: GradeGapCategory
  gradesAboveMax: number // how many grades above climber's max redpoint
  redpointThreshold: number // send readiness % needed before attempting redpoint
}

export type CruxProgress = {
  annotationId: string
  name: string
  difficultyRating: number
  isWorkedOut: boolean // can do the move(s) in isolation
  isDialed: boolean // can repeat 3x in a row
}

export type RestProgress = {
  annotationId: string
  name: string
  restQuality: number
  isEstablished: boolean // knows the position and how to use it
}

export type LinkProgress = {
  fromId: string
  fromName: string
  toId: string
  toName: string
  isLinked: boolean
}

export type { MindsetProgress } from '../../types'

export type TacticalPlan = {
  currentPhase: TacticalPhase
  phaseStatuses: Record<TacticalPhase, PhaseStatus>
  gradeGap: GradeGap
  sendReadiness: number // 0-100
  cruxProgress: CruxProgress[]
  restProgress: RestProgress[]
  linkProgress: LinkProgress[]
  mindsetProgress: MindsetProgress
  energyProfile: EnergyPoint[]
}

export type SessionFocusType =
  | 'work_crux'
  | 'establish_rest'
  | 'link_section'
  | 'low_point'
  | 'high_point'
  | 'mindset_prep'
  | 'send_attempt'

export type SessionSuggestion = {
  primary: {
    type: SessionFocusType
    description: string
    targetAnnotation?: Annotation
  }
  secondary?: {
    type: SessionFocusType
    description: string
    targetAnnotation?: Annotation
  }
  phaseContext: string
}

export type EnergyPoint = {
  annotationId: string
  name: string
  type: 'crux' | 'rest'
  energyBefore: number // 0-100, energy arriving at this point
  energyAfter: number // 0-100, energy leaving this point
  isTrueCrux: boolean // hardest move relative to available energy
}
