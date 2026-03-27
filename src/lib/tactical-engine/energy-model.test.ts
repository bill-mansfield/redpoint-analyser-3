import * as fc from 'fast-check'
import { computeEnergyProfile } from './energy-model'
import type { Annotation } from '../../types'

const crux = (id: string, y: number, difficultyRating = 3): Annotation => ({
  id,
  type: 'crux',
  y,
  name: `Crux ${id}`,
  difficultyRating,
})

const rest = (id: string, y: number, restQuality = 3): Annotation => ({
  id,
  type: 'rest',
  y,
  name: `Rest ${id}`,
  restQuality,
})

describe('computeEnergyProfile', () => {
  it('returns empty array for no annotations', () => {
    expect(computeEnergyProfile([])).toEqual([])
  })

  it('starts at 100 energy for first annotation', () => {
    const result = computeEnergyProfile([crux('c1', 500)])
    expect(result[0]?.energyBefore).toBe(100)
  })

  it('drains energy at cruxes', () => {
    const result = computeEnergyProfile([crux('c1', 500, 3)])
    expect(result[0]?.energyAfter).toBeLessThan(100)
  })

  it('recovers energy at rests', () => {
    const annotations = [crux('c1', 500, 3), rest('r1', 400, 3)]
    const result = computeEnergyProfile(annotations)
    // After crux, energy drops. After rest, it should recover.
    const cruxPoint = result.find((p) => p.annotationId === 'c1')
    const restPoint = result.find((p) => p.annotationId === 'r1')
    expect(restPoint!.energyAfter).toBeGreaterThan(cruxPoint!.energyAfter)
  })

  it('processes bottom-to-top (high y first)', () => {
    const annotations = [crux('c1', 100), crux('c2', 500)]
    const result = computeEnergyProfile(annotations)
    // c2 (y=500, bottom) should be processed first
    expect(result[0]?.annotationId).toBe('c2')
    expect(result[1]?.annotationId).toBe('c1')
  })

  it('identifies the true crux based on difficulty × pump factor', () => {
    // Easy crux at bottom (full energy), hard crux at top (low energy)
    const annotations = [
      crux('easy', 500, 2), // processed first, full energy
      rest('r1', 400, 1), // poor rest
      crux('hard', 100, 4), // processed last, pumped
    ]
    const result = computeEnergyProfile(annotations)
    const trueCrux = result.find((p) => p.isTrueCrux)
    expect(trueCrux?.annotationId).toBe('hard')
  })

  it('energy never goes below 0', () => {
    // Stack 5 max-difficulty cruxes with no rests
    const annotations = Array.from({ length: 5 }, (_, i) => crux(`c${i}`, 500 - i * 100, 5))
    const result = computeEnergyProfile(annotations)
    for (const point of result) {
      expect(point.energyAfter).toBeGreaterThanOrEqual(0)
    }
  })

  it('energy never exceeds 100', () => {
    const annotations = [rest('r1', 500, 5), rest('r2', 400, 5), rest('r3', 300, 5)]
    const result = computeEnergyProfile(annotations)
    for (const point of result) {
      expect(point.energyAfter).toBeLessThanOrEqual(100)
    }
  })

  // Property-based: energy is always within [0, 100]
  it('property: energy is always within [0, 100]', () => {
    const annotationArb = fc.record({
      id: fc.uuid(),
      type: fc.constantFrom('crux' as const, 'rest' as const),
      y: fc.integer({ min: 0, max: 1000 }),
      name: fc.string(),
      difficultyRating: fc.integer({ min: 1, max: 5 }),
      restQuality: fc.integer({ min: 1, max: 5 }),
    })

    fc.assert(
      fc.property(fc.array(annotationArb, { minLength: 0, maxLength: 20 }), (annotations) => {
        const result = computeEnergyProfile(annotations)
        return result.every(
          (p) =>
            p.energyBefore >= 0 &&
            p.energyBefore <= 100 &&
            p.energyAfter >= 0 &&
            p.energyAfter <= 100
        )
      }),
      { numRuns: 100 }
    )
  })

  // Property-based: exactly one true crux when cruxes exist
  it('property: exactly one true crux when cruxes exist', () => {
    const annotationArb = fc.record({
      id: fc.uuid(),
      type: fc.constantFrom('crux' as const, 'rest' as const),
      y: fc.integer({ min: 0, max: 1000 }),
      name: fc.string(),
      difficultyRating: fc.integer({ min: 1, max: 5 }),
      restQuality: fc.integer({ min: 1, max: 5 }),
    })

    fc.assert(
      fc.property(fc.array(annotationArb, { minLength: 1, maxLength: 20 }), (annotations) => {
        const result = computeEnergyProfile(annotations)
        const hasCruxes = annotations.some((a) => a.type === 'crux')
        const trueCruxCount = result.filter((p) => p.isTrueCrux).length
        if (hasCruxes) {
          return trueCruxCount === 1
        }
        return trueCruxCount === 0
      }),
      { numRuns: 100 }
    )
  })
})
