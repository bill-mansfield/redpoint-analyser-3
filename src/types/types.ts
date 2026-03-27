import type { GradingSystemId } from './grades'

export type CanvasMode = 'draw' | 'annotation'

export type Point = {
  x: number
  y: number
}

export type Annotation = {
  id: string
  type: 'crux' | 'rest'
  y: number
  name: string
  sectionName?: string // e.g., "the roof sequence"
  difficultyRating?: number // 1-5, crux only (relative to the route)
  restQuality?: number // 1-5, rest only (1=marginal shake, 5=full recovery)
  holdReference?: string
  isDialed?: boolean // can do 3x in a row
  dialedDate?: string
}

export type CompletionStatus = 'not_started' | 'in_progress' | 'completed'

export type ProjectType = 'sport' | 'trad' | 'boulder'

export type ProjectMetadata = {
  routeLength: number
  difficulty: number
  gradingSystem?: GradingSystemId
  projectType?: ProjectType
  location?: string
  notes?: string
  completionStatus: CompletionStatus
}

// Session logging types
export type RedpointAttempt = {
  type: 'redpoint'
  highestPoint: string // annotation ID (crux/rest)
  detail: string
  perceivedEffort: number // 1-10
  pumpRating: number // 1-10
  sent: boolean
  notes?: string
}

export type LowpointAttempt = {
  type: 'lowpoint'
  startAnnotation: string // annotation ID (crux/rest)
  perceivedEffort: number // 1-10
  pumpRating: number // 1-10
  success: boolean
  notes?: string
}

export type LinkingSectionsAttempt = {
  type: 'linking'
  fromAnnotation: string // annotation ID
  toAnnotation: string // annotation ID
  notes?: string
}

export type WorkingMovesAttempt = {
  type: 'working'
  cruxes: string[] // annotation IDs (cruxes worked on)
  wasProductive: boolean
  repeatedCruxes: string[] // annotation IDs of cruxes that were repeated
  notes?: string
}

export type Attempt = RedpointAttempt | LowpointAttempt | LinkingSectionsAttempt | WorkingMovesAttempt

export type AttemptType = Attempt['type']

// Progress markers — logged per session, not static annotations
export type ProgressMarker = {
  id: string
  type: 'highpoint' | 'lowpoint'
  y: number
  annotationId: string // nearest annotation reference
  date: string // ISO date
  sessionId?: string
}

export type Session = {
  id: string
  date: string // ISO date
  sessionRating: number // 1-5
  morePsyched: boolean
  attempts: Attempt[]
  progressMarkers?: ProgressMarker[]
  notes?: string
}

export type ProjectData = {
  routeLine: Point[]
  annotations: Annotation[]
  metadata: ProjectMetadata
  sessions?: Session[]
}

export type Project = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  data: ProjectData
}

// Climber grade profile for tactical engine
export type DisciplineGrades = {
  maxRedpoint?: number // universal grade index
  maxFlash?: number
  maxDaySend?: number
}

export type RopeDisciplineGrades = DisciplineGrades & {
  maxOnsight?: number // rope only
}

export type ClimberGradeProfile = {
  sport: RopeDisciplineGrades
  boulder: DisciplineGrades
}

export type Settings = {
  preferredGradingSystem: GradingSystemId
  preferredBoulderGradingSystem: GradingSystemId
  name?: string
  country?: string
  dateOfBirth?: string
  gradeProfile: ClimberGradeProfile
}
