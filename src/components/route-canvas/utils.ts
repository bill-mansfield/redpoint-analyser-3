import { match } from 'ts-pattern'
import * as R from 'remeda'
import type { Annotation, CanvasMode, Point } from '../../types'

export const DEFAULT_CANVAS_WIDTH = 400
export const DEFAULT_CANVAS_HEIGHT = 1000

export const calculateAnnotationPosition = (annotation: Annotation, line: readonly Point[]): number => {
  return match(line)
    .with([], () => 50)
    .otherwise((points) => {
      const tolerance = 10
      const nearbyPoints = R.filter(points, (point) => Math.abs(point.y - annotation.y) <= tolerance)

      return match(nearbyPoints)
        .with([], () => {
          const sortedPoints = R.pipe(
            points,
            R.map((point) => ({ point, distance: Math.abs(point.y - annotation.y) })),
            (items) => R.sortBy(items, (item) => item.distance)
          )
          const closestPoint = R.first(sortedPoints)?.point
          return closestPoint ? Math.max(0, Math.min(closestPoint.x, DEFAULT_CANVAS_WIDTH)) : 50
        })
        .otherwise((pts) => {
          const firstPoint = R.first(pts)
          return firstPoint ? Math.max(0, Math.min(firstPoint.x, DEFAULT_CANVAS_WIDTH)) : 50
        })
    })
}

export const createPolylinePoints = (validatedLine: readonly Point[]): string => {
  return R.pipe(
    validatedLine,
    R.map((point) => `${point.x},${point.y}`),
    R.join(' ')
  )
}

export const getModeText = ({ mode, isDrawing }: { mode: CanvasMode; isDrawing: boolean }): string =>
  match([mode, isDrawing])
    .with(['draw', true], () => 'Drawing...')
    .with(['draw', false], () => 'Click to Draw')
    .with(['annotation', false], () => 'Annotation Mode')
    .with(['annotation', true], () => '')
    .exhaustive()
