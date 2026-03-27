import { computePhaseStatuses, getCurrentPhase } from './phase-engine'
import type { CruxProgress, RestProgress, LinkProgress, GradeGap } from './types'
import type { Annotation, MindsetProgress, Session } from '../../types'

const emptyMindset: MindsetProgress = {
  hasVisualized: false,
  hasBreathingPlan: false,
  hasSessionGoal: false,
  hasReviewedBeta: false,
  hasPositiveMonologue: false,
}

const fullMindset: MindsetProgress = {
  hasVisualized: true,
  hasBreathingPlan: true,
  hasSessionGoal: true,
  hasReviewedBeta: true,
  hasPositiveMonologue: true,
}

const greedyGap: GradeGap = { category: 'greedy', gradesAboveMax: 0, redpointThreshold: 60 }
const moderateGap: GradeGap = { category: 'moderate', gradesAboveMax: 2, redpointThreshold: 75 }
const patientGap: GradeGap = { category: 'patient', gradesAboveMax: 5, redpointThreshold: 90 }

const cruxWorkedOut: CruxProgress = { annotationId: 'c1', name: 'Crux 1', difficultyRating: 3, isWorkedOut: true, isDialed: false }
const cruxDialed: CruxProgress = { annotationId: 'c1', name: 'Crux 1', difficultyRating: 3, isWorkedOut: true, isDialed: true }
const cruxUnworked: CruxProgress = { annotationId: 'c1', name: 'Crux 1', difficultyRating: 3, isWorkedOut: false, isDialed: false }
const restEstablished: RestProgress = { annotationId: 'r1', name: 'Rest 1', restQuality: 3, isEstablished: true }
const restNotEstablished: RestProgress = { annotationId: 'r1', name: 'Rest 1', restQuality: 3, isEstablished: false }
const linkDone: LinkProgress = { fromId: 'c1', fromName: 'Crux 1', toId: 'r1', toName: 'Rest 1', isLinked: true }
const linkNotDone: LinkProgress = { fromId: 'c1', fromName: 'Crux 1', toId: 'r1', toName: 'Rest 1', isLinked: false }

const cruxAnnotation: Annotation = { id: 'c1', type: 'crux', y: 200, name: 'Crux 1', difficultyRating: 3 }
const restAnnotation: Annotation = { id: 'r1', type: 'rest', y: 400, name: 'Rest 1', restQuality: 3 }

const makeSession = (overrides: Partial<Session> = {}): Session => ({
  id: 'session1',
  date: '2026-01-01',
  sessionRating: 3,
  morePsyched: true,
  attempts: [],
  ...overrides,
})

const baseInputs = {
  cruxProgress: [cruxUnworked],
  restProgress: [restNotEstablished],
  linkProgress: [linkNotDone],
  mindsetProgress: emptyMindset,
  sendReadiness: 0,
  gradeGap: patientGap,
  sessions: [] as Session[],
  annotations: [cruxAnnotation, restAnnotation] as Annotation[],
}

describe('computePhaseStatuses', () => {
  describe('patient (strict sequential)', () => {
    it('only work_cruxes is active when nothing is done', () => {
      const statuses = computePhaseStatuses(baseInputs)
      expect(statuses['work_cruxes']).toBe('active')
      expect(statuses['establish_rests']).toBe('locked')
      expect(statuses['link_sections']).toBe('locked')
    })

    it('unlocks establish_rests when work_cruxes is complete', () => {
      const statuses = computePhaseStatuses({
        ...baseInputs,
        cruxProgress: [cruxWorkedOut],
      })
      expect(statuses['work_cruxes']).toBe('completed')
      expect(statuses['establish_rests']).toBe('active')
      expect(statuses['link_sections']).toBe('locked')
    })

    it('unlocks link_sections when rests are established', () => {
      const statuses = computePhaseStatuses({
        ...baseInputs,
        cruxProgress: [cruxWorkedOut],
        restProgress: [restEstablished],
      })
      expect(statuses['establish_rests']).toBe('completed')
      expect(statuses['link_sections']).toBe('active')
    })
  })

  describe('greedy (all unlocked)', () => {
    it('all phases are unlocked immediately', () => {
      const statuses = computePhaseStatuses({
        ...baseInputs,
        gradeGap: greedyGap,
      })
      expect(statuses['work_cruxes']).toBe('active')
      expect(statuses['establish_rests']).toBe('active')
      expect(statuses['link_sections']).toBe('active')
      expect(statuses['low_points']).toBe('active')
      expect(statuses['high_points']).toBe('active')
      expect(statuses['pre_send_mindset']).toBe('active')
    })
  })

  describe('moderate (paired unlocks)', () => {
    it('cruxes and rests are both active initially', () => {
      const statuses = computePhaseStatuses({
        ...baseInputs,
        gradeGap: moderateGap,
      })
      expect(statuses['work_cruxes']).toBe('active')
      expect(statuses['establish_rests']).toBe('active')
      expect(statuses['link_sections']).toBe('locked')
    })

    it('unlocks link_sections when cruxes are done', () => {
      const statuses = computePhaseStatuses({
        ...baseInputs,
        gradeGap: moderateGap,
        cruxProgress: [cruxWorkedOut],
      })
      expect(statuses['link_sections']).toBe('active')
    })
  })

  describe('low_points phase (session-driven)', () => {
    it('low_points completes when a successful lowpoint session exists', () => {
      const statuses = computePhaseStatuses({
        ...baseInputs,
        gradeGap: greedyGap,
        sessions: [
          makeSession({
            attempts: [{ type: 'lowpoint', startAnnotation: 'c1', perceivedEffort: 5, pumpRating: 5, success: true }],
          }),
        ],
      })
      expect(statuses['low_points']).toBe('completed')
    })

    it('low_points stays active without a successful lowpoint', () => {
      const statuses = computePhaseStatuses({
        ...baseInputs,
        gradeGap: greedyGap,
        sessions: [
          makeSession({
            attempts: [{ type: 'lowpoint', startAnnotation: 'c1', perceivedEffort: 5, pumpRating: 5, success: false }],
          }),
        ],
      })
      expect(statuses['low_points']).toBe('active')
    })
  })

  describe('high_points phase (session-driven)', () => {
    it('high_points completes when redpoint reaches past all cruxes', () => {
      // crux at y=200, redpoint highest point at y=100 (above crux)
      const topAnnotation: Annotation = { id: 'top', type: 'rest', y: 100, name: 'Top Rest' }
      const statuses = computePhaseStatuses({
        ...baseInputs,
        gradeGap: greedyGap,
        annotations: [cruxAnnotation, restAnnotation, topAnnotation],
        sessions: [
          makeSession({
            attempts: [{ type: 'redpoint', highestPoint: 'top', detail: '', perceivedEffort: 7, pumpRating: 8, sent: false }],
          }),
        ],
      })
      expect(statuses['high_points']).toBe('completed')
    })

    it('high_points stays active when redpoint does not reach past crux', () => {
      const statuses = computePhaseStatuses({
        ...baseInputs,
        gradeGap: greedyGap,
        sessions: [
          makeSession({
            attempts: [{ type: 'redpoint', highestPoint: 'r1', detail: '', perceivedEffort: 7, pumpRating: 8, sent: false }],
          }),
        ],
      })
      // r1 is at y=400, crux is at y=200 — r1 is below the crux, so not past it
      expect(statuses['high_points']).toBe('active')
    })
  })
})

describe('getCurrentPhase', () => {
  it('returns the first active phase', () => {
    const statuses = computePhaseStatuses(baseInputs)
    expect(getCurrentPhase(statuses)).toBe('work_cruxes')
  })

  it('returns redpoint when everything is done and readiness is high enough', () => {
    const statuses = computePhaseStatuses({
      ...baseInputs,
      gradeGap: greedyGap,
      cruxProgress: [cruxDialed],
      restProgress: [restEstablished],
      linkProgress: [linkDone],
      mindsetProgress: fullMindset,
      sendReadiness: 100,
      sessions: [
        makeSession({
          attempts: [
            { type: 'lowpoint', startAnnotation: 'c1', perceivedEffort: 5, pumpRating: 5, success: true },
            { type: 'redpoint', highestPoint: 'c1', detail: '', perceivedEffort: 7, pumpRating: 8, sent: false },
          ],
        }),
      ],
    })
    expect(getCurrentPhase(statuses)).toBe('redpoint')
  })
})
