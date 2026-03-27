import { calculateSendReadiness } from './send-readiness'
import type { CruxProgress, RestProgress, LinkProgress } from './types'
import type { MindsetProgress } from '../../types'

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

const makeCrux = (overrides: Partial<CruxProgress> = {}): CruxProgress => ({
  annotationId: 'c1',
  name: 'Crux 1',
  difficultyRating: 3,
  isWorkedOut: false,
  isDialed: false,
  ...overrides,
})

const makeRest = (overrides: Partial<RestProgress> = {}): RestProgress => ({
  annotationId: 'r1',
  name: 'Rest 1',
  restQuality: 3,
  isEstablished: false,
  ...overrides,
})

const makeLink = (overrides: Partial<LinkProgress> = {}): LinkProgress => ({
  fromId: 'c1',
  fromName: 'Crux 1',
  toId: 'r1',
  toName: 'Rest 1',
  isLinked: false,
  ...overrides,
})

describe('calculateSendReadiness', () => {
  it('returns 0 when nothing is done', () => {
    const result = calculateSendReadiness({
      cruxProgress: [makeCrux()],
      restProgress: [makeRest()],
      linkProgress: [makeLink()],
      mindsetProgress: emptyMindset,
    })
    expect(result).toBe(0)
  })

  it('returns 100 when everything is complete', () => {
    const result = calculateSendReadiness({
      cruxProgress: [makeCrux({ isDialed: true })],
      restProgress: [makeRest({ isEstablished: true })],
      linkProgress: [makeLink({ isLinked: true })],
      mindsetProgress: fullMindset,
    })
    expect(result).toBe(100)
  })

  it('gives partial credit for worked out (not dialed) cruxes', () => {
    const workedOut = calculateSendReadiness({
      cruxProgress: [makeCrux({ isWorkedOut: true })],
      restProgress: [],
      linkProgress: [],
      mindsetProgress: emptyMindset,
    })
    const dialed = calculateSendReadiness({
      cruxProgress: [makeCrux({ isDialed: true })],
      restProgress: [],
      linkProgress: [],
      mindsetProgress: emptyMindset,
    })
    expect(workedOut).toBeGreaterThan(0)
    expect(dialed).toBeGreaterThan(workedOut)
  })

  it('gives full rest score when no rests exist', () => {
    const result = calculateSendReadiness({
      cruxProgress: [],
      restProgress: [],
      linkProgress: [],
      mindsetProgress: emptyMindset,
    })
    // No cruxes = 0 crux score, no rests = full rest (15), no links = full link (25+15), no mindset = 0
    // 15 (rests) + 25 (links) + 15 (lowPoints) = 55
    expect(result).toBe(55)
  })

  it('weights mindset at 10%', () => {
    const withMindset = calculateSendReadiness({
      cruxProgress: [],
      restProgress: [],
      linkProgress: [],
      mindsetProgress: fullMindset,
    })
    const withoutMindset = calculateSendReadiness({
      cruxProgress: [],
      restProgress: [],
      linkProgress: [],
      mindsetProgress: emptyMindset,
    })
    expect(withMindset - withoutMindset).toBe(10)
  })

  it('result is always between 0 and 100', () => {
    const result = calculateSendReadiness({
      cruxProgress: [makeCrux({ isDialed: true }), makeCrux({ isWorkedOut: true })],
      restProgress: [makeRest({ isEstablished: true }), makeRest()],
      linkProgress: [makeLink({ isLinked: true }), makeLink()],
      mindsetProgress: { ...emptyMindset, hasVisualized: true, hasBreathingPlan: true },
    })
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })
})
