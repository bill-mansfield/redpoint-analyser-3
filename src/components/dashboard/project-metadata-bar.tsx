import { Box, HStack, Text, NativeSelectRoot, NativeSelectField, Badge } from '@chakra-ui/react'
import { match } from 'ts-pattern'
import type { ProjectMetadata, ProjectType, CompletionStatus } from '../../types'
import type { GradingSystemId } from '../../types/grades'
import { getGradeOptions, getGradingSystemsForDiscipline } from '../../utils/grades'

type Props = {
  metadata: ProjectMetadata
  preferredRopeSystem: GradingSystemId
  preferredBoulderSystem: GradingSystemId
  onChange: (metadata: ProjectMetadata) => void
}

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'sport', label: 'Sport' },
  { value: 'trad', label: 'Trad' },
  { value: 'boulder', label: 'Boulder' },
]

const STATUS_OPTIONS: { value: CompletionStatus; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'Projecting' },
  { value: 'completed', label: 'Sent' },
]

const statusColor = (status: CompletionStatus): string =>
  match(status)
    .with('completed', () => 'green')
    .with('in_progress', () => 'blue')
    .otherwise(() => 'gray')

export const ProjectMetadataBar = ({ metadata, preferredRopeSystem, preferredBoulderSystem, onChange }: Props) => {
  const projectType = metadata.projectType ?? 'sport'
  const isBoulder = projectType === 'boulder'
  const activeSystem = metadata.gradingSystem ?? (isBoulder ? preferredBoulderSystem : preferredRopeSystem)
  const gradeOptions = getGradeOptions(activeSystem)

  const handleTypeChange = (type: ProjectType) => {
    const newSystem = type === 'boulder' ? preferredBoulderSystem : preferredRopeSystem
    onChange({ ...metadata, projectType: type, gradingSystem: newSystem, difficulty: 0 })
  }

  const handleSystemChange = (system: GradingSystemId) => {
    onChange({ ...metadata, gradingSystem: system, difficulty: 0 })
  }

  const handleGradeChange = (index: number) => {
    onChange({ ...metadata, gradingSystem: activeSystem, difficulty: index })
  }

  const handleStatusChange = (status: CompletionStatus) => {
    onChange({ ...metadata, completionStatus: status })
  }

  const gradingSystems = getGradingSystemsForDiscipline(isBoulder ? 'boulder' : 'rope')

  return (
    <Box px={{ base: 3, md: 4 }} py={2} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
      <HStack gap={4} flexWrap="wrap" align="center">
        <Text fontSize="xs" fontWeight="medium" color="gray.500" flexShrink={0}>
          Project
        </Text>

        {/* Type */}
        <NativeSelectRoot size="xs" maxW="100px">
          <NativeSelectField
            value={projectType}
            onChange={(e) => handleTypeChange(e.target.value as ProjectType)}
          >
            {PROJECT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </NativeSelectField>
        </NativeSelectRoot>

        {/* Grading system */}
        <NativeSelectRoot size="xs" maxW="160px">
          <NativeSelectField
            value={activeSystem}
            onChange={(e) => handleSystemChange(e.target.value as GradingSystemId)}
          >
            {gradingSystems.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </NativeSelectField>
        </NativeSelectRoot>

        {/* Grade */}
        <NativeSelectRoot size="xs" maxW="100px">
          <NativeSelectField
            value={metadata.difficulty ?? 0}
            onChange={(e) => handleGradeChange(parseInt(e.target.value, 10))}
          >
            <option value={0}>— grade —</option>
            {[...gradeOptions].reverse().map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </NativeSelectField>
        </NativeSelectRoot>

        {/* Status */}
        <NativeSelectRoot size="xs" maxW="120px">
          <NativeSelectField
            value={metadata.completionStatus}
            onChange={(e) => handleStatusChange(e.target.value as CompletionStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </NativeSelectField>
        </NativeSelectRoot>

        {/* Live status badge */}
        <Badge colorScheme={statusColor(metadata.completionStatus)} fontSize="xs" flexShrink={0}>
          {STATUS_OPTIONS.find((s) => s.value === metadata.completionStatus)?.label}
        </Badge>
      </HStack>
    </Box>
  )
}
