import { useState, useCallback } from 'react'
import type { Annotation } from '../types'

type ContextMenuState = {
  isOpen: boolean
  position: { x: number; y: number }
  yPosition: number
}

type AnnotationFormState = {
  isOpen: boolean
  yPosition: number
}

type UseAnnotationModeProps = {
  mode: 'draw' | 'annotation'
  onAddAnnotation: (annotation: Omit<Annotation, 'id'>) => void
  viewBoxHeight?: number
}

type UseAnnotationModeReturn = {
  contextMenu: {
    isOpen: boolean
    position: { x: number; y: number }
    close: () => void
  }
  annotationForm: {
    isOpen: boolean
    yPosition: number
    close: () => void
  }
  handleRightClick: (event: React.MouseEvent) => void
  handleOpenAnnotationForm: () => void
  handleAddAnnotation: (data: { type: Annotation['type']; name: string; difficultyRating?: number; restQuality?: number }) => void
}

export const useAnnotationMode = ({
  mode,
  onAddAnnotation,
  viewBoxHeight,
}: UseAnnotationModeProps): UseAnnotationModeReturn => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    yPosition: 0,
  })

  const [annotationForm, setAnnotationForm] = useState<AnnotationFormState>({
    isOpen: false,
    yPosition: 0,
  })

  const handleRightClick = useCallback(
    (event: React.MouseEvent) => {
      if (mode === 'draw') {
        return
      }
      event.preventDefault()
      const svgElement = event.currentTarget as SVGElement
      const rect = svgElement.getBoundingClientRect()
      const scaleY = viewBoxHeight && rect.height > 0 ? viewBoxHeight / rect.height : 1
      const yPosition = (event.clientY - rect.top) * scaleY

      setContextMenu({
        isOpen: true,
        position: { x: event.clientX, y: event.clientY },
        yPosition,
      })
    },
    [mode, viewBoxHeight]
  )

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const handleOpenAnnotationForm = useCallback(() => {
    setAnnotationForm({
      isOpen: true,
      yPosition: contextMenu.yPosition,
    })
    closeContextMenu()
  }, [contextMenu.yPosition, closeContextMenu])

  const closeAnnotationForm = useCallback(() => {
    setAnnotationForm({ isOpen: false, yPosition: 0 })
  }, [])

  const handleAddAnnotation = useCallback(
    (data: { type: Annotation['type']; name: string; difficultyRating?: number; restQuality?: number }) => {
      const newAnnotation: Omit<Annotation, 'id'> = {
        type: data.type,
        name: data.name,
        y: annotationForm.yPosition,
        difficultyRating: data.difficultyRating,
        restQuality: data.restQuality,
      }
      onAddAnnotation(newAnnotation)
      closeAnnotationForm()
    },
    [annotationForm.yPosition, onAddAnnotation, closeAnnotationForm]
  )

  return {
    contextMenu: { isOpen: contextMenu.isOpen, position: contextMenu.position, close: closeContextMenu },
    annotationForm: { isOpen: annotationForm.isOpen, yPosition: annotationForm.yPosition, close: closeAnnotationForm },
    handleRightClick,
    handleOpenAnnotationForm,
    handleAddAnnotation,
  }
}
