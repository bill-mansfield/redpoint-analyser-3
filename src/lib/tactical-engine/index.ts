import type { Annotation, ClimberGradeProfile, MindsetProgress, ProjectType, Session } from '../../types'
import type { TacticalPlan, CruxProgress, RestProgress, LinkProgress } from './types'
import { calculateGradeGap } from './grade-gap'
import { calculateSendReadiness } from './send-readiness'
import { computePhaseStatuses, getCurrentPhase } from './phase-engine'
import { computeEnergyProfile } from './energy-model'
import { defaultMindsetProgress } from './mindset-engine'

export { suggestSessionFocus } from './session-suggestion'
export { getPhasePrompt, MINDSET_PROMPTS } from './mindset-engine'
export { getRedpointThreshold } from './grade-gap'
export type * from './types'

// Derive which crux IDs have been worked out or dialed from session history
const deriveCruxSessionProgress = (sessions: readonly Session[]): { workedOut: Set<string>; dialed: Set<string> } => {
  const workedOut = new Set<string>()
  const dialedCounts = new Map<string, Set<string>>() // cruxId → set of session IDs where it was in repeatedCruxes

  for (const session of sessions) {
    for (const attempt of session.attempts) {
      if (attempt.type === 'working') {
        for (const id of attempt.cruxes) {
          workedOut.add(id)
        }
        for (const id of attempt.repeatedCruxes) {
          if (!dialedCounts.has(id)) dialedCounts.set(id, new Set())
          dialedCounts.get(id)!.add(session.id)
        }
      }
    }
  }

  // Dialed = appeared in repeatedCruxes in 3+ distinct sessions
  const dialed = new Set<string>()
  for (const [id, sessionIds] of dialedCounts) {
    if (sessionIds.size >= 3) dialed.add(id)
  }

  return { workedOut, dialed }
}

// Derive which link pairs have been completed from session history
const deriveLinkSessionProgress = (sessions: readonly Session[]): Set<string> => {
  const linked = new Set<string>()
  for (const session of sessions) {
    for (const attempt of session.attempts) {
      if (attempt.type === 'linking') {
        linked.add(`${attempt.fromAnnotation}→${attempt.toAnnotation}`)
      }
    }
  }
  return linked
}

const buildCruxProgress = (
  annotations: readonly Annotation[],
  workedOut: Set<string>,
  dialed: Set<string>
): CruxProgress[] =>
  annotations
    .filter((a) => a.type === 'crux')
    .sort((a, b) => a.y - b.y)
    .map((a) => ({
      annotationId: a.id,
      name: a.name,
      difficultyRating: a.difficultyRating ?? 3,
      isWorkedOut: workedOut.has(a.id) || (a.isDialed ?? false),
      isDialed: (a.isDialed ?? false) || dialed.has(a.id),
    }))

const buildRestProgress = (annotations: readonly Annotation[], linked: Set<string>): RestProgress[] =>
  annotations
    .filter((a) => a.type === 'rest')
    .sort((a, b) => a.y - b.y)
    .map((a) => {
      // Established if manually marked, or if a linking session passes through this rest
      const linkedThrough = [...linked].some((pair) => pair.includes(a.id))
      return {
        annotationId: a.id,
        name: a.name,
        restQuality: a.restQuality ?? 3,
        isEstablished: (a.isEstablished ?? false) || linkedThrough,
      }
    })

const buildLinkProgress = (annotations: readonly Annotation[], linked: Set<string>): LinkProgress[] => {
  const sorted = [...annotations].sort((a, b) => a.y - b.y)
  const links: LinkProgress[] = []

  for (let i = 0; i < sorted.length - 1; i++) {
    const from = sorted[i]
    const to = sorted[i + 1]
    if (from === undefined || to === undefined) {
      continue
    }
    links.push({
      fromId: from.id,
      fromName: from.name,
      toId: to.id,
      toName: to.name,
      isLinked: linked.has(`${from.id}→${to.id}`),
    })
  }

  return links
}

type ComputePlanOptions = {
  annotations: readonly Annotation[]
  sessions: readonly Session[]
  gradeProfile: ClimberGradeProfile
  projectGradeIndex: number
  projectType: ProjectType
  mindsetProgress?: MindsetProgress
}

export const computeTacticalPlan = ({
  annotations,
  sessions,
  gradeProfile,
  projectGradeIndex,
  projectType,
  mindsetProgress: savedMindset,
}: ComputePlanOptions): TacticalPlan => {
  const { workedOut, dialed } = deriveCruxSessionProgress(sessions)
  const linked = deriveLinkSessionProgress(sessions)

  const cruxProgress = buildCruxProgress(annotations, workedOut, dialed)
  const restProgress = buildRestProgress(annotations, linked)
  const linkProgress = buildLinkProgress(annotations, linked)
  const mindsetProgress = savedMindset ?? defaultMindsetProgress()
  const gradeGap = calculateGradeGap(gradeProfile, projectGradeIndex, projectType)
  const energyProfile = computeEnergyProfile(annotations)

  const sendReadiness = calculateSendReadiness({
    cruxProgress,
    restProgress,
    linkProgress,
    mindsetProgress,
  })

  const phaseStatuses = computePhaseStatuses({
    cruxProgress,
    restProgress,
    linkProgress,
    mindsetProgress,
    sendReadiness,
    gradeGap,
    sessions,
    annotations,
  })

  const currentPhase = getCurrentPhase(phaseStatuses)

  return {
    currentPhase,
    phaseStatuses,
    gradeGap,
    sendReadiness,
    cruxProgress,
    restProgress,
    linkProgress,
    mindsetProgress,
    energyProfile,
  }
}
