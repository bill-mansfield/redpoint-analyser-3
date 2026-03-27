import { useEffect, useRef, useState } from 'react'
import { Box, Button, Flex, HStack, Spinner, VStack, Input, Text } from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'

import { RouteCanvas } from '../route-canvas/route-canvas'
import { AnnotationsList } from '../annotations-list/annotations-list'
import { ErrorBoundary } from '../error-boundary'
import { useProject } from '../../contexts'
import { generateAnnotationId } from '../../utils'
import type { Annotation, CanvasMode, Point } from '../../types'
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from '../route-canvas/utils'

export const ProjectEditor = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { currentProject, loading, loadProject, saveProject, updateProjectName, clearCurrentProject } = useProject()

  const [routeLine, setRouteLine] = useState<Point[]>([])
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [mode, setMode] = useState<CanvasMode>('annotation')
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (projectId && projectId !== currentProject?.id) {
      loadProject(projectId)
    }
    return () => {
      clearCurrentProject()
    }
  }, [projectId])

  useEffect(() => {
    if (!currentProject) {
      return
    }
    setRouteLine(currentProject.data.routeLine ?? [])
    setAnnotations(currentProject.data.annotations ?? [])
  }, [currentProject])

  // Auto-save debounced
  useEffect(() => {
    if (!currentProject || isSavingRef.current) {
      return
    }
    const timeout = setTimeout(() => {
      isSavingRef.current = true
      saveProject({
        ...currentProject.data,
        routeLine,
        annotations,
      })
      isSavingRef.current = false
    }, 500)
    return () => clearTimeout(timeout)
  }, [routeLine, annotations, currentProject?.id])

  const handleAddAnnotation = (annotation: Omit<Annotation, 'id'>) => {
    setAnnotations((prev) => [...prev, { ...annotation, id: generateAnnotationId(annotation.type, annotations) }])
  }

  const handleDeleteAnnotation = (annotationId: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== annotationId))
  }

  const handleNameSubmit = () => {
    const trimmed = editName.trim()
    if (trimmed) {
      updateProjectName(trimmed)
    }
    setIsEditingName(false)
  }

  if (!currentProject && loading) {
    return (
      <Box minH="60vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="lg" />
      </Box>
    )
  }

  if (!currentProject && !loading) {
    return (
      <Box minH="60vh" display="flex" alignItems="center" justifyContent="center">
        <Button onClick={() => navigate('/')}>Back to Projects</Button>
      </Box>
    )
  }

  return (
    <ErrorBoundary>
      <Box minH="100vh" bg="gray.50" overflowX="hidden">
        {/* Project header */}
        <Box bg="white" borderBottom="1px solid" borderColor="gray.200" px={{ base: 3, md: 6 }} py={3}>
          <Flex align="center" justify="space-between">
            <HStack gap={3}>
              <Button size="sm" variant="ghost" onClick={() => navigate('/')}>
                ← Projects
              </Button>
              {isEditingName ?
                <Input
                  size="sm"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleNameSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                  autoFocus
                  maxW="300px"
                />
              : <Text
                  fontSize="lg"
                  fontWeight="bold"
                  cursor="pointer"
                  onClick={() => {
                    setEditName(currentProject?.name ?? '')
                    setIsEditingName(true)
                  }}
                >
                  {currentProject?.name}
                </Text>
              }
              {loading && <Spinner size="xs" />}
            </HStack>
          </Flex>
        </Box>

        {/* Main layout */}
        <Box
          display={{ base: 'flex', md: 'grid' } as object}
          flexDirection="column"
          gridTemplateColumns={{ md: '1fr 1fr' } as object}
          gap={4}
          p={{ base: 3, md: 4 }}
          maxW="1800px"
          mx="auto"
          overflowX="hidden"
        >
          {/* Left: Canvas */}
          <Box minW={0}>
            <VStack gap={4} align="stretch">
              {/* Canvas toolbar */}
              <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" overflow="hidden">
                <Flex px={{ base: 3, md: 4 }} py={3} gap={2} flexWrap="wrap" align="center" borderBottom="1px solid" borderColor="gray.100">
                  <Box flex={1} />
                  <HStack gap={2}>
                    <Button
                      size="sm"
                      variant={mode === 'draw' ? 'solid' : 'outline'}
                      colorScheme={mode === 'draw' ? 'blue' : 'gray'}
                      onClick={() => setMode('draw')}
                    >
                      Edit Line
                    </Button>
                    <Button
                      size="sm"
                      variant={mode === 'annotation' ? 'solid' : 'outline'}
                      colorScheme={mode === 'annotation' ? 'blue' : 'gray'}
                      onClick={() => setMode('annotation')}
                    >
                      Freeze Line
                    </Button>
                    <Button size="sm" variant="ghost" colorScheme="red" onClick={() => setRouteLine([])}>
                      Reset
                    </Button>
                  </HStack>
                </Flex>

                <Box w="100%" bg="gray.50" p={4}>
                  <RouteCanvas
                    canvasWidth={DEFAULT_CANVAS_WIDTH}
                    canvasHeight={DEFAULT_CANVAS_HEIGHT}
                    line={routeLine}
                    setLine={setRouteLine}
                    annotations={annotations}
                    mode={mode}
                    onAddAnnotation={handleAddAnnotation}
                  />
                </Box>
              </Box>
            </VStack>
          </Box>

          {/* Right: Annotations */}
          <Box minW={0}>
            <VStack gap={4} align="stretch">
              <AnnotationsList annotations={annotations} onDeleteAnnotation={handleDeleteAnnotation} />
            </VStack>
          </Box>
        </Box>
      </Box>
    </ErrorBoundary>
  )
}
