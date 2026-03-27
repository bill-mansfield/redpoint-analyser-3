import type { TacticalPhase, PhaseStatus, CruxProgress, RestProgress, LinkProgress, MindsetProgress, GradeGap } from './types'
import type { Annotation, Session } from '../../types'

type PhaseInputs = {
  cruxProgress: CruxProgress[]
  restProgress: RestProgress[]
  linkProgress: LinkProgress[]
  mindsetProgress: MindsetProgress
  sendReadiness: number
  gradeGap: GradeGap
  sessions: readonly Session[]
  annotations: readonly Annotation[]
}

const allCruxesWorkedOut = (cruxProgress: CruxProgress[]): boolean =>
  cruxProgress.length > 0 && cruxProgress.every((c) => c.isWorkedOut || c.isDialed)

const allRestsEstablished = (restProgress: RestProgress[]): boolean =>
  restProgress.length === 0 || restProgress.every((r) => r.isEstablished)

const allSectionsLinked = (linkProgress: LinkProgress[]): boolean =>
  linkProgress.length === 0 || linkProgress.every((l) => l.isLinked)

const mindsetComplete = (mindset: MindsetProgress): boolean =>
  mindset.hasVisualized &&
  mindset.hasBreathingPlan &&
  mindset.hasSessionGoal &&
  mindset.hasReviewedBeta &&
  mindset.hasPositiveMonologue

const hasSuccessfulLowpoint = (sessions: readonly Session[]): boolean =>
  sessions.some((s) => s.attempts.some((a) => a.type === 'lowpoint' && a.success))

const hasHighPointPastAllCruxes = (sessions: readonly Session[], annotations: readonly Annotation[]): boolean => {
  const cruxes = annotations.filter((a) => a.type === 'crux')
  if (cruxes.length === 0) return true

  // Lowest y among cruxes = highest crux on the route (canvas: low y = top)
  const highestCruxY = Math.min(...cruxes.map((c) => c.y))

  return sessions.some((s) =>
    s.attempts.some((a) => {
      if (a.type !== 'redpoint') return false
      const highestPointAnnotation = annotations.find((ann) => ann.id === a.highestPoint)
      // If the highest point reached is above (lower y) all cruxes, phase is complete
      return highestPointAnnotation !== undefined && highestPointAnnotation.y <= highestCruxY
    })
  )
}

const isPhaseComplete = (phase: TacticalPhase, inputs: PhaseInputs): boolean => {
  const { cruxProgress, restProgress, linkProgress, mindsetProgress, sendReadiness, gradeGap, sessions, annotations } = inputs
  switch (phase) {
    case 'work_cruxes':
      return allCruxesWorkedOut(cruxProgress)
    case 'establish_rests':
      return allRestsEstablished(restProgress)
    case 'link_sections':
      return allSectionsLinked(linkProgress)
    case 'low_points':
      // Complete when at least one successful lowpoint attempt exists
      return hasSuccessfulLowpoint(sessions)
    case 'high_points':
      // Complete when a redpoint attempt has reached past all cruxes
      return hasHighPointPastAllCruxes(sessions, annotations)
    case 'pre_send_mindset':
      return mindsetComplete(mindsetProgress)
    case 'redpoint':
      return sendReadiness >= gradeGap.redpointThreshold
  }
}

const isPhaseUnlocked = (phase: TacticalPhase, inputs: PhaseInputs): boolean => {
  const { gradeGap } = inputs
  // Greedy: all phases unlocked immediately
  if (gradeGap.category === 'greedy') {
    return true
  }
  // Moderate: phases unlock sequentially but with some overlap
  if (gradeGap.category === 'moderate') {
    switch (phase) {
      case 'work_cruxes':
        return true
      case 'establish_rests':
        return true // can work in parallel with cruxes
      case 'link_sections':
        return isPhaseComplete('work_cruxes', inputs)
      case 'low_points':
        return isPhaseComplete('establish_rests', inputs)
      case 'high_points':
        return isPhaseComplete('link_sections', inputs)
      case 'pre_send_mindset':
        return isPhaseComplete('high_points', inputs)
      case 'redpoint':
        return isPhaseComplete('pre_send_mindset', inputs)
    }
  }
  // Patient: strict sequential
  switch (phase) {
    case 'work_cruxes':
      return true
    case 'establish_rests':
      return isPhaseComplete('work_cruxes', inputs)
    case 'link_sections':
      return isPhaseComplete('establish_rests', inputs)
    case 'low_points':
      return isPhaseComplete('link_sections', inputs)
    case 'high_points':
      return isPhaseComplete('low_points', inputs)
    case 'pre_send_mindset':
      return isPhaseComplete('high_points', inputs)
    case 'redpoint':
      return isPhaseComplete('pre_send_mindset', inputs)
  }
}

const PHASES: TacticalPhase[] = [
  'work_cruxes',
  'establish_rests',
  'link_sections',
  'low_points',
  'high_points',
  'pre_send_mindset',
  'redpoint',
]

export const computePhaseStatuses = (inputs: PhaseInputs): Record<TacticalPhase, PhaseStatus> => {
  const statuses = {} as Record<TacticalPhase, PhaseStatus>

  for (const phase of PHASES) {
    if (!isPhaseUnlocked(phase, inputs)) {
      statuses[phase] = 'locked'
    } else if (isPhaseComplete(phase, inputs)) {
      statuses[phase] = 'completed'
    } else {
      statuses[phase] = 'active'
    }
  }

  return statuses
}

export const getCurrentPhase = (statuses: Record<TacticalPhase, PhaseStatus>): TacticalPhase => {
  // Current phase = first active phase, or last completed phase if all done
  for (const phase of PHASES) {
    if (statuses[phase] === 'active') {
      return phase
    }
  }
  // All active phases complete — return the last unlocked one
  for (let i = PHASES.length - 1; i >= 0; i--) {
    const phase = PHASES[i]
    if (phase !== undefined && statuses[phase] !== 'locked') {
      return phase
    }
  }
  return 'work_cruxes'
}
