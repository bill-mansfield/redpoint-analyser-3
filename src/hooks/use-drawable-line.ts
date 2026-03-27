import { useState, useCallback } from 'react'
import * as R from 'remeda'
import type { Point } from '../types'

type DrawableLineHook = {
  readonly isDrawing: boolean
  readonly handleMouseDown: (event: React.MouseEvent) => void
  readonly handleMouseMove: (event: React.MouseEvent) => void
  readonly handleMouseUp: () => void
}

type UseDrawableLineProps = {
  line: Point[]
  setLine: (points: Point[]) => void
  viewBoxWidth?: number
  viewBoxHeight?: number
}

const isValidCoordinate = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

export const useDrawableLine = ({ line, setLine, viewBoxWidth, viewBoxHeight }: UseDrawableLineProps): DrawableLineHook => {
  const [isDrawing, setIsDrawing] = useState(false)

  const clampCoordinates = (x: number, y: number, clampWidth: number, clampHeight: number): Point | null => {
    if (!isValidCoordinate(x) || !isValidCoordinate(y)) {
      return null
    }
    return {
      x: R.pipe(x, (val) => Math.max(0, Math.min(val, clampWidth))),
      y: R.pipe(y, (val) => Math.max(0, Math.min(val, clampHeight))),
    }
  }

  const extractCoordinates = (
    event: React.MouseEvent
  ): { x: number; y: number; clampWidth: number; clampHeight: number } | null => {
    const rect = event.currentTarget.getBoundingClientRect()
    const scaleX = viewBoxWidth && rect.width > 0 ? viewBoxWidth / rect.width : 1
    const scaleY = viewBoxHeight && rect.height > 0 ? viewBoxHeight / rect.height : 1
    const rawX = (event.clientX - rect.left) * scaleX
    const rawY = (event.clientY - rect.top) * scaleY

    if (!isValidCoordinate(rawX) || !isValidCoordinate(rawY)) {
      return null
    }

    return { x: rawX, y: rawY, clampWidth: viewBoxWidth ?? rect.width, clampHeight: viewBoxHeight ?? rect.height }
  }

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      const coordinates = extractCoordinates(event)
      if (!coordinates) {
        return
      }
      const clampedPoint = clampCoordinates(coordinates.x, coordinates.y, coordinates.clampWidth, coordinates.clampHeight)
      if (!clampedPoint) {
        return
      }
      setIsDrawing(true)
      setLine(R.concat(line, [clampedPoint]))
    },
    [line, setLine]
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isDrawing) {
        return
      }
      const coordinates = extractCoordinates(event)
      if (!coordinates) {
        setIsDrawing(false)
        return
      }
      const clampedPoint = clampCoordinates(coordinates.x, coordinates.y, coordinates.clampWidth, coordinates.clampHeight)
      if (!clampedPoint) {
        setIsDrawing(false)
        return
      }
      setLine(R.concat(line, [clampedPoint]))
    },
    [isDrawing, line, setLine]
  )

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false)
  }, [])

  return { isDrawing, handleMouseDown, handleMouseMove, handleMouseUp }
}
