import type { TacticalPhase } from '../../lib/tactical-engine'
import type { SessionFormData } from './schema'
import type { Attempt, Session } from '../../types'

export const phaseToAttemptType = (phase: TacticalPhase): SessionFormData['attemptType'] => {
  switch (phase) {
    case 'work_cruxes':
      return 'working'
    case 'establish_rests':
      return 'working'
    case 'link_sections':
      return 'linking'
    case 'low_points':
      return 'lowpoint'
    case 'high_points':
    case 'pre_send_mindset':
    case 'redpoint':
      return 'redpoint'
  }
}

export const attemptTypeLabel: Record<SessionFormData['attemptType'], string> = {
  working: 'Working Moves',
  linking: 'Linking Sections',
  lowpoint: 'Low Point',
  redpoint: 'Redpoint Attempt',
}

export const buildAttempt = (data: SessionFormData, annotations: { id: string }[]): Attempt => {
  switch (data.attemptType) {
    case 'working':
      return {
        type: 'working',
        cruxes: data.workedCruxIds ?? [],
        wasProductive: data.wasProductive ?? true,
        repeatedCruxes: data.repeatedCruxIds ?? [],
        notes: data.notes,
      }
    case 'linking':
      return {
        type: 'linking',
        fromAnnotation: data.fromAnnotationId ?? annotations[0]?.id ?? '',
        toAnnotation: data.toAnnotationId ?? annotations[annotations.length - 1]?.id ?? '',
        notes: data.notes,
      }
    case 'lowpoint':
      return {
        type: 'lowpoint',
        startAnnotation: data.startAnnotationId ?? annotations[0]?.id ?? '',
        perceivedEffort: data.perceivedEffort ?? 5,
        pumpRating: data.pumpRating ?? 5,
        success: data.lowpointSuccess ?? false,
        notes: data.notes,
      }
    case 'redpoint':
      return {
        type: 'redpoint',
        highestPoint: data.highestPointId ?? annotations[annotations.length - 1]?.id ?? '',
        detail: data.notes ?? '',
        perceivedEffort: data.perceivedEffort ?? 5,
        pumpRating: data.pumpRating ?? 5,
        sent: data.sent ?? false,
        notes: data.notes,
      }
  }
}

export const sessionToFormData = (session: Session): SessionFormData => {
  const attempt = session.attempts[0]
  const base = {
    date: session.date,
    sessionRating: session.sessionRating,
    morePsyched: session.morePsyched,
    notes: session.notes ?? '',
    wasProductive: true,
    sent: false,
    perceivedEffort: 5,
    pumpRating: 5,
    lowpointSuccess: false,
    workedCruxIds: [] as string[],
    repeatedCruxIds: [] as string[],
    fromAnnotationId: undefined as string | undefined,
    toAnnotationId: undefined as string | undefined,
    startAnnotationId: undefined as string | undefined,
    highestPointId: undefined as string | undefined,
  }

  if (!attempt) {
    return { ...base, attemptType: 'working' }
  }

  switch (attempt.type) {
    case 'working':
      return {
        ...base,
        attemptType: 'working',
        workedCruxIds: attempt.cruxes,
        wasProductive: attempt.wasProductive,
        repeatedCruxIds: attempt.repeatedCruxes,
        notes: attempt.notes ?? session.notes ?? '',
      }
    case 'linking':
      return {
        ...base,
        attemptType: 'linking',
        fromAnnotationId: attempt.fromAnnotation,
        toAnnotationId: attempt.toAnnotation,
        notes: attempt.notes ?? session.notes ?? '',
      }
    case 'lowpoint':
      return {
        ...base,
        attemptType: 'lowpoint',
        startAnnotationId: attempt.startAnnotation,
        perceivedEffort: attempt.perceivedEffort,
        pumpRating: attempt.pumpRating,
        lowpointSuccess: attempt.success,
        notes: attempt.notes ?? session.notes ?? '',
      }
    case 'redpoint':
      return {
        ...base,
        attemptType: 'redpoint',
        highestPointId: attempt.highestPoint,
        perceivedEffort: attempt.perceivedEffort,
        pumpRating: attempt.pumpRating,
        sent: attempt.sent,
        notes: attempt.notes ?? session.notes ?? '',
      }
  }
}

export const generateSessionId = (sessions: Session[]): string => {
  const max = sessions.reduce((m, s) => {
    const n = parseInt(s.id.replace('session', ''), 10)
    return isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return `session${max + 1}`
}
