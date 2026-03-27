import * as fc from 'fast-check'
import { calculateGradeGap, getRedpointThreshold } from './grade-gap'
import type { ClimberGradeProfile } from '../../types'

const makeProfile = (overrides: Partial<ClimberGradeProfile> = {}): ClimberGradeProfile => ({
  sport: { maxRedpoint: undefined, maxFlash: undefined, maxOnsight: undefined, maxDaySend: undefined, ...overrides.sport },
  boulder: { maxRedpoint: undefined, maxFlash: undefined, maxDaySend: undefined, ...overrides.boulder },
})

describe('getRedpointThreshold', () => {
  it('returns 60 for greedy', () => {
    expect(getRedpointThreshold('greedy')).toBe(60)
  })

  it('returns 75 for moderate', () => {
    expect(getRedpointThreshold('moderate')).toBe(75)
  })

  it('returns 90 for patient', () => {
    expect(getRedpointThreshold('patient')).toBe(90)
  })
})

describe('calculateGradeGap', () => {
  it('returns moderate when no max redpoint is set', () => {
    const profile = makeProfile()
    const result = calculateGradeGap(profile, 30, 'sport')
    expect(result.category).toBe('moderate')
    expect(result.gradesAboveMax).toBe(2)
  })

  it('returns greedy when project is at or below flash grade', () => {
    const profile = makeProfile({ sport: { maxRedpoint: 30, maxFlash: 28 } })
    const result = calculateGradeGap(profile, 25, 'sport')
    expect(result.category).toBe('greedy')
    expect(result.gradesAboveMax).toBe(0)
  })

  it('returns greedy when gap is 0-1 grades', () => {
    const profile = makeProfile({ sport: { maxRedpoint: 30 } })
    // Same grade = 0 gap
    expect(calculateGradeGap(profile, 30, 'sport').category).toBe('greedy')
    // 1 index above = 0.5 grades (below 1) = greedy
    expect(calculateGradeGap(profile, 31, 'sport').category).toBe('greedy')
    // 2 indices = 1 grade exactly = greedy
    expect(calculateGradeGap(profile, 32, 'sport').category).toBe('greedy')
  })

  it('returns moderate when gap is 2-3 grades', () => {
    const profile = makeProfile({ sport: { maxRedpoint: 30 } })
    // 5 indices = 2.5 grades = moderate
    expect(calculateGradeGap(profile, 35, 'sport').category).toBe('moderate')
  })

  it('returns patient when gap is 4+ grades', () => {
    const profile = makeProfile({ sport: { maxRedpoint: 30 } })
    // 10 indices = 5 grades = patient
    expect(calculateGradeGap(profile, 40, 'sport').category).toBe('patient')
  })

  it('uses boulder profile for boulder projects', () => {
    const profile = makeProfile({
      sport: { maxRedpoint: 40 },
      boulder: { maxRedpoint: 25 },
    })
    // Boulder project at index 35 — gap from boulder max (25) = 10 indices = 5 grades = patient
    const result = calculateGradeGap(profile, 35, 'boulder')
    expect(result.category).toBe('patient')
  })

  it('uses sport profile for trad projects', () => {
    const profile = makeProfile({ sport: { maxRedpoint: 30 } })
    const result = calculateGradeGap(profile, 30, 'trad')
    expect(result.category).toBe('greedy')
  })

  it('clamps gradesAboveMax to 0 when project is below max', () => {
    const profile = makeProfile({ sport: { maxRedpoint: 35 } })
    const result = calculateGradeGap(profile, 30, 'sport')
    expect(result.gradesAboveMax).toBe(0)
  })

  // Property-based: threshold is always one of the 3 valid values
  it('property: threshold is always 60, 75, or 90', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 54 }),
        fc.integer({ min: 1, max: 54 }),
        (projectIndex, maxRedpoint) => {
          const profile = makeProfile({ sport: { maxRedpoint } })
          const result = calculateGradeGap(profile, projectIndex, 'sport')
          return [60, 75, 90].includes(result.redpointThreshold)
        }
      ),
      { numRuns: 100 }
    )
  })

  // Property-based: gradesAboveMax is always >= 0
  it('property: gradesAboveMax is never negative', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 54 }),
        fc.integer({ min: 1, max: 54 }),
        (projectIndex, maxRedpoint) => {
          const profile = makeProfile({ sport: { maxRedpoint } })
          const result = calculateGradeGap(profile, projectIndex, 'sport')
          return result.gradesAboveMax >= 0
        }
      ),
      { numRuns: 100 }
    )
  })
})
