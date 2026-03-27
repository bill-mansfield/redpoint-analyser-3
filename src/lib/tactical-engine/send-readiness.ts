import type { CruxProgress, RestProgress, LinkProgress, MindsetProgress } from './types'

type ReadinessInputs = {
  cruxProgress: CruxProgress[]
  restProgress: RestProgress[]
  linkProgress: LinkProgress[]
  mindsetProgress: MindsetProgress
}

// Weights must sum to 100
const WEIGHTS = {
  cruxes: 35,
  rests: 15,
  links: 25,
  lowPoints: 15,
  mindset: 10,
} as const

const cruxScore = (cruxProgress: CruxProgress[]): number => {
  if (cruxProgress.length === 0) {
    return 0
  }
  const total = cruxProgress.reduce((sum, c) => {
    if (c.isDialed) {
      return sum + 1
    }
    if (c.isWorkedOut) {
      return sum + 0.5
    }
    return sum
  }, 0)
  return total / cruxProgress.length
}

const restScore = (restProgress: RestProgress[]): number => {
  if (restProgress.length === 0) {
    return 1 // no rests = full score
  }
  const total = restProgress.reduce((sum, r) => sum + (r.isEstablished ? 1 : 0), 0)
  return total / restProgress.length
}

const linkScore = (linkProgress: LinkProgress[]): number => {
  if (linkProgress.length === 0) {
    return 1 // no sections to link = full score
  }
  const total = linkProgress.reduce((sum, l) => sum + (l.isLinked ? 1 : 0), 0)
  return total / linkProgress.length
}

const mindsetScore = (mindset: MindsetProgress): number => {
  const checks = [
    mindset.hasVisualized,
    mindset.hasBreathingPlan,
    mindset.hasSessionGoal,
    mindset.hasReviewedBeta,
    mindset.hasPositiveMonologue,
  ]
  const completed = checks.filter(Boolean).length
  return completed / checks.length
}

// Low points score derived from link progress — completing all links implies low-pointing
// In practice this will be driven by session data in Phase 5; for now it mirrors links
const lowPointScore = (linkProgress: LinkProgress[]): number => linkScore(linkProgress)

export const calculateSendReadiness = ({
  cruxProgress,
  restProgress,
  linkProgress,
  mindsetProgress,
}: ReadinessInputs): number => {
  const score =
    cruxScore(cruxProgress) * WEIGHTS.cruxes +
    restScore(restProgress) * WEIGHTS.rests +
    linkScore(linkProgress) * WEIGHTS.links +
    lowPointScore(linkProgress) * WEIGHTS.lowPoints +
    mindsetScore(mindsetProgress) * WEIGHTS.mindset

  return Math.round(score)
}
