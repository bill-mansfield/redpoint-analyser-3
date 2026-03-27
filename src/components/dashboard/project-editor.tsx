import { useEffect, useRef, useState } from 'react'
import { Box, Button, Flex, HStack, Spinner, VStack, Input, Text, TabsRoot, TabsList, TabsTrigger, TabsContent } from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'

import { RouteCanvas } from '../route-canvas/route-canvas'
import { AnnotationsList } from '../annotations-list/annotations-list'
import { TacticalPlan } from '../tactical-plan/tactical-plan'
import { SessionLog } from '../session-log/session-log'
import { ProjectMetadataBar } from './project-metadata-bar'
import { ProgressTab } from '../progress/progress-tab'
import { ErrorBoundary } from '../error-boundary'
import { useProject, useSettings } from '../../contexts'
import { generateAnnotationId } from '../../utils'
import { computeTacticalPlan } from '../../lib/tactical-engine'
import type { Annotation, CanvasMode, MindsetProgress, Point, Session, ProjectMetadata } from '../../types'
import { defaultMindsetProgress } from '../../lib/tactical-engine/mindset-engine'
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from '../route-canvas/utils'

export const ProjectEditor = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { currentProject, loading, loadProject, saveProject, updateProjectName, clearCurrentProject } = useProject()
  const { settings } = useSettings()

  const [routeLine, setRouteLine] = useState<Point[]>([])
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [metadata, setMetadata] = useState<ProjectMetadata>({ routeLength: 0, difficulty: 0, completionStatus: 'not_started' })
  const [mindsetProgress, setMindsetProgress] = useState<MindsetProgress>(defaultMindsetProgress())
  const [mode, setMode] = useState<CanvasMode>('annotation')
  const [showEnergy, setShowEnergy] = useState(false)
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
    setSessions(currentProject.data.sessions ?? [])
    setMetadata(currentProject.data.metadata)
    setMindsetProgress(currentProject.data.mindsetProgress ?? defaultMindsetProgress())
  }, [currentProject])

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
        sessions,
        metadata,
        mindsetProgress,
      })
      isSavingRef.current = false
    }, 500)
    return () => clearTimeout(timeout)
  }, [routeLine, annotations, sessions, metadata, mindsetProgress, currentProject?.id])

  const handleAddAnnotation = (annotation: Omit<Annotation, 'id'>) => {
    setAnnotations((prev) => [...prev, { ...annotation, id: generateAnnotationId(annotation.type, annotations) }])
  }

  const handleDeleteAnnotation = (annotationId: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== annotationId))
  }

  const handleAddSession = (session: Session) => {
    setSessions((prev) => [...prev, session])
  }

  const handleUpdateSession = (session: Session) => {
    setSessions((prev) => prev.map((s) => (s.id === session.id ? session : s)))
  }

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  const handleMetadataChange = (m: ProjectMetadata) => {
    setMetadata(m)
  }

  const handleToggleDialed = (annotationId: string) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === annotationId ? { ...a, isDialed: !a.isDialed } : a))
    )
  }

  const handleToggleEstablished = (annotationId: string) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === annotationId ? { ...a, isEstablished: !a.isEstablished } : a))
    )
  }

  const handleToggleMindset = (key: keyof MindsetProgress) => {
    setMindsetProgress((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const tacticalPlan = computeTacticalPlan({
    annotations,
    sessions,
    gradeProfile: settings.gradeProfile,
    projectGradeIndex: metadata.difficulty ?? 0,
    projectType: metadata.projectType ?? 'sport',
    mindsetProgress,
  })

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

        {/* Tabs */}
        <TabsRoot defaultValue="route" variant="line">
          <Box bg="white" borderBottom="1px solid" borderColor="gray.200" px={{ base: 3, md: 6 }}>
            <TabsList>
              <TabsTrigger value="route">Route</TabsTrigger>
              <TabsTrigger value="tactics">Tactics</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>
          </Box>

          {/* Route tab */}
          <TabsContent value="route">
            <ProjectMetadataBar
              metadata={metadata}
              preferredRopeSystem={settings.preferredGradingSystem}
              preferredBoulderSystem={settings.preferredBoulderGradingSystem}
              onChange={handleMetadataChange}
            />
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
              {/* Canvas */}
              <Box minW={0}>
                <VStack gap={4} align="stretch">
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
                        {annotations.length > 0 && (
                          <Button
                            size="sm"
                            variant={showEnergy ? 'solid' : 'outline'}
                            colorScheme={showEnergy ? 'orange' : 'gray'}
                            onClick={() => setShowEnergy((v) => !v)}
                          >
                            ⚡ Energy
                          </Button>
                        )}
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
                        energyProfile={tacticalPlan.energyProfile}
                        showEnergy={showEnergy}
                      />
                    </Box>
                  </Box>
                </VStack>
              </Box>

              {/* Annotations list */}
              <Box minW={0}>
                <VStack gap={4} align="stretch">
                  <AnnotationsList annotations={annotations} onDeleteAnnotation={handleDeleteAnnotation} onToggleDialed={handleToggleDialed} onToggleEstablished={handleToggleEstablished} />
                </VStack>
              </Box>
            </Box>
          </TabsContent>

          {/* Tactics tab */}
          <TabsContent value="tactics">
            <Box p={{ base: 3, md: 4 }} maxW="1800px" mx="auto">
              <TacticalPlan
                annotations={annotations}
                plan={tacticalPlan}
                onToggleMindset={handleToggleMindset}
              />
            </Box>
          </TabsContent>

          {/* Sessions tab */}
          <TabsContent value="sessions">
            <Box p={{ base: 3, md: 4 }} maxW="900px" mx="auto">
              <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" p={{ base: 4, md: 6 }}>
                <SessionLog
                  sessions={sessions}
                  annotations={annotations}
                  currentPhase={tacticalPlan.currentPhase}
                  onAddSession={handleAddSession}
                  onUpdateSession={handleUpdateSession}
                  onDeleteSession={handleDeleteSession}
                />
              </Box>
            </Box>
          </TabsContent>

          {/* Progress tab */}
          <TabsContent value="progress">
            <Box p={{ base: 3, md: 4 }} maxW="900px" mx="auto">
              <ProgressTab sessions={sessions} plan={tacticalPlan} />
            </Box>
          </TabsContent>
        </TabsRoot>
      </Box>
    </ErrorBoundary>
  )
}
