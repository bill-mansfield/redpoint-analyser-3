import type { Annotation } from '../../types'
import type { EnergyPoint } from './types'

// How much energy a crux costs (scales with difficulty rating)
const cruxEnergyCost = (difficultyRating: number): number => {
  // rating 1 → -8, rating 5 → -25
  return 8 + (difficultyRating - 1) * 4.25
}

// How much energy a rest recovers (scales with rest quality)
const restEnergyGain = (restQuality: number): number => {
  // quality 1 → +5, quality 5 → +30
  return 5 + (restQuality - 1) * 6.25
}

export const computeEnergyProfile = (annotations: readonly Annotation[]): EnergyPoint[] => {
  // Sort by y DESCENDING — bottom of canvas = start of route (high y = ground level)
  const sorted = [...annotations].sort((a, b) => b.y - a.y)

  let energy = 100
  const points: EnergyPoint[] = []

  for (const annotation of sorted) {
    const energyBefore = energy

    if (annotation.type === 'crux') {
      const cost = cruxEnergyCost(annotation.difficultyRating ?? 3)
      energy = Math.max(0, energy - cost)
    } else {
      const gain = restEnergyGain(annotation.restQuality ?? 3)
      energy = Math.min(100, energy + gain)
    }

    points.push({
      annotationId: annotation.id,
      name: annotation.name,
      type: annotation.type,
      energyBefore,
      energyAfter: energy,
      isTrueCrux: false, // set below
    })
  }

  // True crux = crux with the worst energy-adjusted difficulty
  // (high difficulty at low energy = truly hardest point on the route)
  let worstScore = -Infinity
  let trueCruxId: string | null = null

  for (const point of points) {
    if (point.type !== 'crux') {
      continue
    }
    const annotation = annotations.find((a) => a.id === point.annotationId)
    const difficulty = annotation?.difficultyRating ?? 3
    // Score: difficulty scaled by how pumped the climber is (lower energy = harder)
    const pumpFactor = (100 - point.energyBefore) / 100
    const score = difficulty * (1 + pumpFactor)
    if (score > worstScore) {
      worstScore = score
      trueCruxId = point.annotationId
    }
  }

  return points.map((p) => ({ ...p, isTrueCrux: p.annotationId === trueCruxId }))
}
