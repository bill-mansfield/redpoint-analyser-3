import * as R from 'remeda'
import type { Annotation, Point } from '../types'

/**
 * Generate a unique ID for a new annotation based on type and existing annotations
 */
export const generateAnnotationId = (type: Annotation['type'], existingAnnotations: readonly Annotation[]): string => {
  const existingIds = existingAnnotations.map((a) => a.id)
  const existingNumbers = existingIds
    .filter((id) => id.startsWith(type))
    .map((id) => parseInt(id.replace(type, ''), 10))
    .filter((num) => !isNaN(num))

  let nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1

  let candidateId = `${type}${nextNumber}`
  while (existingIds.includes(candidateId)) {
    nextNumber++
    candidateId = `${type}${nextNumber}`
  }

  return candidateId
}

const isValidAnnotationType = (type: unknown): type is Annotation['type'] => {
  return typeof type === 'string' && ['crux', 'rest'].includes(type)
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const isValidString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0
}

const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

export const validateAnnotation = (annotation: unknown): Annotation | null => {
  try {
    if (!isRecord(annotation)) {
      return null
    }

    const { id, type, y, name } = annotation

    if (!isValidString(id)) {
      return null
    }
    if (!isValidAnnotationType(type)) {
      return null
    }
    if (!isValidNumber(y)) {
      return null
    }
    if (!isValidString(name)) {
      return null
    }

    const clampedY = R.pipe(
      y,
      (value) => Math.max(0, value),
      (value) => Math.min(value, 2000)
    )

    const validatedAnnotation: Annotation = {
      id: id.trim(),
      type,
      y: clampedY,
      name: name.trim(),
    }

    return validatedAnnotation
  } catch {
    return null
  }
}

export const validateAnnotations = (annotations: unknown): readonly Annotation[] => {
  if (!Array.isArray(annotations)) {
    return []
  }

  return R.pipe(annotations, R.map(validateAnnotation), R.filter(R.isNonNull))
}

export const validatePoint = (point: unknown): Point | null => {
  try {
    if (!isRecord(point)) {
      return null
    }

    const { x, y } = point

    if (!isValidNumber(x) || !isValidNumber(y)) {
      return null
    }

    return {
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
    }
  } catch {
    return null
  }
}

export const validatePoints = (points: unknown): readonly Point[] => {
  if (!Array.isArray(points)) {
    return []
  }

  return R.pipe(points, R.map(validatePoint), R.filter(R.isNonNull))
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
