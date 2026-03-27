import { pipe, filter, map } from 'remeda'
import type { GradingSystemId, GradingSystem, GradingSystemDiscipline } from '../types/grades'
import type { ProjectType } from '../types/types'

// Universal index range: 1-54 (Font boulder 9C+ is the longest, reaching index 54)
const MIN_INDEX = 1
const MAX_INDEX = 54

// All grading systems with index-aligned grade arrays.
// grades[0] is unused (placeholder), grades[1] corresponds to universal index 1, etc.
// null means the system has no grade at that difficulty level.
//
// Boulder anchor: index 35 = Font 6C = V5 (user-confirmed: V5 = 6c)
// Rope anchor:    index 35 = Ewbank 35 = French 6c (same universal index)
export const GRADING_SYSTEMS: Record<GradingSystemId, GradingSystem> = {
  // ── Rope climbing systems ─────────────────────────────────────────────────
  ewbanks: {
    id: 'ewbanks',
    name: 'Australian Ewbank',
    shortName: 'Ewbank',
    discipline: 'rope',
    grades: [
      null, // 0 (unused)
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
      '21',
      '22',
      '23',
      '24',
      '25',
      '26',
      '27',
      '28',
      '29',
      '30',
      '31',
      '32',
      '33',
      '34',
      '35',
      '36',
      '37',
      '38',
      '39',
    ],
  },
  yds: {
    id: 'yds',
    name: 'Yosemite Decimal System',
    shortName: 'YDS',
    discipline: 'rope',
    grades: [
      null, // 0
      null,
      null,
      null,
      null,
      null, // 1-5: no YDS equivalent
      '5.0',
      '5.1',
      '5.2',
      '5.3',
      '5.4',
      '5.5',
      '5.6',
      '5.7',
      '5.8',
      '5.9',
      '5.10a',
      '5.10b',
      '5.10c',
      '5.10d',
      '5.11a',
      '5.11b',
      '5.11c',
      '5.11d',
      '5.12a',
      '5.12b',
      '5.12c',
      '5.12d',
      '5.13a',
      '5.13b',
      '5.13c',
      '5.13d',
      '5.14a',
      '5.14b',
      '5.14c',
      '5.14d',
      '5.15a',
      '5.15b',
      '5.15c',
      '5.15d',
    ],
  },
  french: {
    id: 'french',
    name: 'French',
    shortName: 'French',
    discipline: 'rope',
    grades: [
      null, // 0
      '1a',
      '1a+',
      '1b',
      '1b+',
      '1c',
      '1c+',
      '2a',
      '2a+',
      '2b',
      '2b+',
      '2c',
      '2c+',
      '3a',
      '3a+',
      '3b',
      '3b+',
      '3c',
      '3c+',
      '4a',
      '4a+',
      '4b',
      '4b+',
      '4c',
      '4c+',
      '5a',
      '5a+',
      '5b',
      '5b+',
      '5c',
      '5c+',
      '6a',
      '6a+',
      '6b',
      '6b+',
      '6c', // index 35 — rope anchor
      '6c+',
      '7a',
      '7a+',
      '7b',
      '7b+',
      '7c',
      '7c+',
      '8a',
      '8a+',
      '8b',
      '8b+',
      '8c',
      '8c+',
      '9a',
      '9a+',
      '9b',
      '9b+',
      '9c',
    ],
  },
  british_tech: {
    id: 'british_tech',
    name: 'British Technical',
    shortName: 'British',
    discipline: 'rope',
    grades: [
      null, // 0
      '1a',
      '1b',
      '1c',
      '2a',
      '2b',
      '2c',
      '3a',
      '3b',
      '3c',
      '4a',
      '4b',
      '4c',
      '5a',
      '5b',
      '5c',
      '6a',
      '6b',
      '6c',
      '7a',
      '7b',
      '7c',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
  },

  // ── Boulder-specific systems ───────────────────────────────────────────────
  font_boulder: {
    id: 'font_boulder',
    name: 'Fontainebleau Boulder',
    shortName: 'Font',
    discipline: 'boulder',
    grades: [
      null, // 0 (unused)
      '1A',
      '1A+',
      '1B',
      '1B+',
      '1C',
      '1C+',
      '2A',
      '2A+',
      '2B',
      '2B+',
      '2C',
      '2C+',
      '3A',
      '3A+',
      '3B',
      '3B+',
      '3C',
      '3C+',
      '4A',
      '4A+',
      '4B',
      '4B+',
      '4C',
      '4C+',
      '5A',
      '5A+',
      '5B',
      '5B+',
      '5C',
      '5C+',
      '6A',
      '6A+',
      '6B',
      '6B+',
      '6C', // index 35 — boulder anchor (= V5)
      '6C+',
      '7A',
      '7A+',
      '7B',
      '7B+',
      '7C',
      '7C+',
      '8A',
      '8A+',
      '8B',
      '8B+',
      '8C',
      '8C+',
      '9A',
      '9A+',
      '9B',
      '9B+',
      '9C',
      '9C+',
    ],
  },

  // V-Scale: VB- at index 25, V5 at index 35, V17 at index 47
  v_scale: {
    id: 'v_scale',
    name: 'V-Scale (Hueco)',
    shortName: 'V',
    discipline: 'boulder',
    grades: [
      null, // 0
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null, // 1-10
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null, // 11-20
      null,
      null,
      null,
      null, // 21-24
      'VB-', // 25
      'VB', // 26
      'VB+', // 27
      'V0-', // 28
      'V0', // 29
      'V0+', // 30
      'V1', // 31
      'V2', // 32
      'V3', // 33
      'V4', // 34
      'V5', // 35 — anchor
      'V6', // 36
      'V7', // 37
      'V8', // 38
      'V9', // 39
      'V10', // 40
      'V11', // 41
      'V12', // 42
      'V13', // 43
      'V14', // 44
      'V15', // 45
      'V16', // 46
      'V17', // 47
    ],
  },
}

export const DEFAULT_GRADING_SYSTEM: GradingSystemId = 'ewbanks'
export const DEFAULT_BOULDER_GRADING_SYSTEM: GradingSystemId = 'v_scale'

export const PROJECT_TYPE_OPTIONS: ReadonlyArray<{ value: ProjectType; label: string }> = [
  { value: 'sport', label: 'Sport' },
  { value: 'trad', label: 'Trad' },
  { value: 'boulder', label: 'Boulder' },
]

export const isGradingSystemId = (value: unknown): value is GradingSystemId =>
  typeof value === 'string' && value in GRADING_SYSTEMS

export const isProjectType = (value: unknown): value is ProjectType =>
  value === 'sport' || value === 'trad' || value === 'boulder'

export const getDisciplineForProjectType = (projectType: ProjectType | undefined): GradingSystemDiscipline =>
  projectType === 'boulder' ? 'boulder' : 'rope'

export const getGradingSystemsForDiscipline = (
  discipline: GradingSystemDiscipline
): ReadonlyArray<{ value: GradingSystemId; label: string }> =>
  pipe(
    Object.values(GRADING_SYSTEMS),
    filter((system) => system.discipline === discipline),
    map((system) => ({ value: system.id, label: system.name }))
  )

export const getDefaultGradingSystemForProjectType = (
  projectType: ProjectType | undefined,
  preferredRope: GradingSystemId,
  preferredBoulder: GradingSystemId = DEFAULT_BOULDER_GRADING_SYSTEM
): GradingSystemId => (projectType === 'boulder' ? preferredBoulder : preferredRope)

export const getGradeLabel = (index: number, systemId: GradingSystemId): string | null => {
  const system = GRADING_SYSTEMS[systemId]
  if (index < 0 || index >= system.grades.length) {
    return null
  }
  return system.grades[index] ?? null
}

export const getGradeOptions = (systemId: GradingSystemId): ReadonlyArray<{ value: number; label: string }> => {
  const system = GRADING_SYSTEMS[systemId]
  return pipe(
    system.grades,
    map((grade, index) => (grade !== null ? { value: index, label: grade } : null)),
    filter((entry): entry is { value: number; label: string } => entry !== null)
  )
}

export const getValidIndexRange = (): { min: number; max: number } => ({
  min: MIN_INDEX,
  max: MAX_INDEX,
})
