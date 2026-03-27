import type { ClimberGradeProfile, ProjectType } from '../../types'
import type { GradeGap, GradeGapCategory } from './types'

// How many universal grade indices = roughly one "grade"
// Universal index uses ~2 steps per grade (e.g. 6a, 6a+, 6b = 3 steps)
const INDICES_PER_GRADE = 2

const getProjectDiscipline = (projectType: ProjectType): 'sport' | 'boulder' =>
  projectType === 'boulder' ? 'boulder' : 'sport'

const getMaxRedpoint = (profile: ClimberGradeProfile, projectType: ProjectType): number | undefined => {
  const discipline = getProjectDiscipline(projectType)
  return profile[discipline].maxRedpoint
}

const getMaxFlash = (profile: ClimberGradeProfile, projectType: ProjectType): number | undefined => {
  const discipline = getProjectDiscipline(projectType)
  return profile[discipline].maxFlash
}

const categoriseGap = (gradesAboveMax: number): GradeGapCategory => {
  if (gradesAboveMax <= 1) {
    return 'greedy'
  }
  if (gradesAboveMax <= 3) {
    return 'moderate'
  }
  return 'patient'
}

export const getRedpointThreshold = (category: GradeGapCategory): number => {
  if (category === 'greedy') {
    return 60
  }
  if (category === 'moderate') {
    return 75
  }
  return 90
}

export const calculateGradeGap = (
  profile: ClimberGradeProfile,
  projectGradeIndex: number,
  projectType: ProjectType
): GradeGap => {
  const maxRedpoint = getMaxRedpoint(profile, projectType)
  const maxFlash = getMaxFlash(profile, projectType)

  // If project is at or below flash grade — treat as greedy regardless
  if (maxFlash !== undefined && projectGradeIndex <= maxFlash) {
    return {
      category: 'greedy',
      gradesAboveMax: 0,
      redpointThreshold: getRedpointThreshold('greedy'),
    }
  }

  if (maxRedpoint === undefined) {
    // No history — assume moderate
    return {
      category: 'moderate',
      gradesAboveMax: 2,
      redpointThreshold: getRedpointThreshold('moderate'),
    }
  }

  const indexDiff = Math.max(0, projectGradeIndex - maxRedpoint)
  const gradesAboveMax = indexDiff / INDICES_PER_GRADE
  const category = categoriseGap(gradesAboveMax)

  return {
    category,
    gradesAboveMax,
    redpointThreshold: getRedpointThreshold(category),
  }
}
