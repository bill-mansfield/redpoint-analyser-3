import { Box, Text } from '@chakra-ui/react'
import * as R from 'remeda'
import type { Point, Annotation } from '../../types'
import type { EnergyPoint } from '../../lib/tactical-engine'
import { useDrawableLine } from '../../hooks/use-drawable-line'
import { useAnnotationMode } from '../../hooks/use-annotation-mode'
import { Annotation as AnnotationComponent } from '../annotations/annotation'
import { AddAnnotationButton } from '../annotation-form/add-annotation-button'
import { AnnotationForm } from '../annotation-form/annotation-form'
import { EnergyOverlay } from './energy-overlay'
import { validateAnnotations, validatePoints } from '../../utils'
import { ErrorBoundary } from '../error-boundary'
import { calculateAnnotationPosition, createPolylinePoints, getModeText } from './utils'
import { match } from 'ts-pattern'

type Props = {
  canvasWidth: number
  canvasHeight: number
  line: readonly Point[]
  setLine: (points: Point[]) => void
  annotations: readonly Annotation[]
  mode: 'draw' | 'annotation'
  onAddAnnotation: (annotation: Omit<Annotation, 'id'>) => void
  energyProfile?: EnergyPoint[]
  showEnergy?: boolean
}

export const RouteCanvas = ({
  canvasWidth,
  canvasHeight,
  line,
  setLine,
  annotations,
  mode,
  onAddAnnotation,
  energyProfile = [],
  showEnergy = false,
}: Props) => {
  const validatedLine = validatePoints(line)
  const validatedAnnotations = validateAnnotations(annotations)

  const { isDrawing, handleMouseDown, handleMouseMove, handleMouseUp } = useDrawableLine({
    line: [...validatedLine],
    setLine: (points: Point[]) => setLine([...validatePoints(points)]),
    viewBoxWidth: canvasWidth,
    viewBoxHeight: canvasHeight,
  })

  const { contextMenu, annotationForm, handleRightClick, handleOpenAnnotationForm, handleAddAnnotation } =
    useAnnotationMode({
      mode,
      onAddAnnotation,
      viewBoxHeight: canvasHeight,
    })

  const handleMouseEvent = (event: React.MouseEvent, type: 'down' | 'move' | 'up') => {
    if (mode !== 'draw') {
      return
    }
    match(type)
      .with('down', () => handleMouseDown(event))
      .with('move', () => handleMouseMove(event))
      .with('up', () => handleMouseUp())
      .exhaustive()
  }

  return (
    <ErrorBoundary
      fallback={
        <Box p={4} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
          <Text fontSize="lg" fontWeight="bold" color="red.600">
            Canvas Error
          </Text>
          <Text color="red.500">The drawing canvas encountered an error. Please refresh the page.</Text>
        </Box>
      }
    >
      <Box
        w="100%"
        position="relative"
        borderRadius="lg"
        overflow="hidden"
        shadow="canvas"
        style={{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }}
      >
        <Box
          p={2}
          position="absolute"
          top={2}
          left={2}
          zIndex={1}
          borderRadius="md"
          bg="rgba(0, 0, 0, 0.55)"
          backdropFilter="blur(6px)"
          boxShadow="md"
        >
          <Text fontSize="sm" fontWeight="medium" color="white" whiteSpace="nowrap">
            {getModeText({ mode, isDrawing })}
          </Text>
        </Box>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          style={{
            cursor: mode === 'draw' ? 'crosshair' : 'context-menu',
            background: 'transparent',
            border: '2px solid #dee2e6',
          }}
          onMouseDown={(e) => handleMouseEvent(e, 'down')}
          onMouseMove={(e) => handleMouseEvent(e, 'move')}
          onMouseUp={(e) => handleMouseEvent(e, 'up')}
          onMouseLeave={mode === 'draw' ? handleMouseUp : undefined}
          onContextMenu={handleRightClick}
        >
          {validatedLine.length > 1 && (
            <polyline
              points={createPolylinePoints(validatedLine)}
              fill="none"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {R.isEmpty(validatedLine) && (
            <text x={canvasWidth / 2} y={canvasHeight / 2} textAnchor="middle" fill="#666" fontSize="14">
              Click edit line to draw a route line
            </text>
          )}

          {R.pipe(
            validatedAnnotations,
            R.map((annotation) => (
              <AnnotationComponent
                key={annotation.id}
                x={calculateAnnotationPosition(annotation, validatedLine)}
                y={Math.max(0, Math.min(annotation.y, canvasHeight))}
                type={annotation.type}
                name={annotation.name}
                rating={annotation.type === 'crux' ? annotation.difficultyRating : annotation.restQuality}
              />
            ))
          )}

          {showEnergy && energyProfile.length > 0 && (
            <EnergyOverlay
              energyProfile={energyProfile}
              annotations={validatedAnnotations}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
          )}
        </svg>

        <AddAnnotationButton
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          onClose={contextMenu.close}
          onAddAnnotation={handleOpenAnnotationForm}
        />

        <AnnotationForm
          isOpen={annotationForm.isOpen}
          yPosition={annotationForm.yPosition}
          onClose={annotationForm.close}
          onSubmit={handleAddAnnotation}
          existingAnnotations={validatedAnnotations}
        />
      </Box>
    </ErrorBoundary>
  )
}
