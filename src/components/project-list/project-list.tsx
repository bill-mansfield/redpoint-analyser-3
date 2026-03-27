import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Flex, Heading, Text, VStack, HStack, Input, SimpleGrid } from '@chakra-ui/react'
import { useProject, useSettings } from '../../contexts'
import { match } from 'ts-pattern'
import { getGradeLabel } from '../../utils/grades'
import type { Project } from '../../types'

export const ProjectList = () => {
  const { projects, createProject, deleteProject } = useProject()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [newProjectName, setNewProjectName] = useState('')

  const handleCreateProject = () => {
    const name = newProjectName.trim()
    if (!name) {
      return
    }
    const project = createProject(name)
    setNewProjectName('')
    navigate(`/${project.id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateProject()
    }
  }

  const getStatusColor = (status: string) =>
    match(status)
      .with('completed', () => 'green')
      .with('in_progress', () => 'blue')
      .otherwise(() => 'gray')

  const getGradeDisplay = (project: Project) => {
    const { difficulty, gradingSystem, projectType } = project.data.metadata
    if (!difficulty) return null
    const system =
      gradingSystem ??
      (projectType === 'boulder' ? settings.preferredBoulderGradingSystem : settings.preferredGradingSystem)
    return getGradeLabel(difficulty, system)
  }

  return (
    <Box maxW="1200px" mx="auto" p={{ base: 4, md: 8 }}>
      <VStack gap={8} align="stretch">
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Heading as="h1" size="xl" color="gray.800" mb={2}>
              Projects
            </Heading>
            <Text color="gray.500">Your climbing projects</Text>
          </Box>
          <Button size="sm" variant="ghost" colorScheme="gray" onClick={() => navigate('/settings')}>
            ⚙ Settings
          </Button>
        </Flex>

        {/* Create new project */}
        <HStack>
          <Input
            placeholder="New project name (e.g., Action Directe)"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={handleKeyDown}
            maxW="400px"
          />
          <Button colorScheme="blue" onClick={handleCreateProject} disabled={!newProjectName.trim()}>
            Create
          </Button>
        </HStack>

        {/* Project grid */}
        {projects.length === 0 ?
          <Box p={8} textAlign="center" bg="gray.50" borderRadius="lg">
            <Text color="gray.500">No projects yet. Create one to get started.</Text>
          </Box>
        : <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {projects.map((project) => (
              <Box
                key={project.id}
                p={5}
                bg="white"
                borderRadius="lg"
                border="1px solid"
                borderColor="gray.200"
                shadow="sm"
                cursor="pointer"
                onClick={() => navigate(`/${project.id}`)}
                _hover={{ shadow: 'md', borderColor: 'blue.200' }}
                transition="all 0.2s"
              >
                <VStack align="stretch" gap={3}>
                  <HStack justify="space-between">
                    <Heading as="h3" size="md" color="gray.700" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {project.name}
                    </Heading>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteProject(project.id)
                      }}
                    >
                      Delete
                    </Button>
                  </HStack>
                  <HStack gap={2}>
                    <Box
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      bg={`${getStatusColor(project.data.metadata.completionStatus)}.100`}
                      color={`${getStatusColor(project.data.metadata.completionStatus)}.700`}
                      fontSize="xs"
                      fontWeight="medium"
                    >
                      {match(project.data.metadata.completionStatus)
                        .with('completed', () => 'Sent')
                        .with('in_progress', () => 'Projecting')
                        .otherwise(() => 'Not Started')}
                    </Box>
                    {getGradeDisplay(project) && (
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        {getGradeDisplay(project)}
                      </Text>
                    )}
                  </HStack>
                  <Text fontSize="xs" color="gray.400">
                    {project.data.annotations.length} annotations
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        }
      </VStack>
    </Box>
  )
}
