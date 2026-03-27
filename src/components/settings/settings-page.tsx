import { useNavigate } from 'react-router-dom'
import { Box, Button, Flex, Heading, Text, VStack, HStack, NativeSelectRoot, NativeSelectField } from '@chakra-ui/react'
import { useSettings } from '../../contexts'
import {
  getGradeOptions,
  getGradingSystemsForDiscipline,
} from '../../utils/grades'
import type { GradingSystemId } from '../../types/grades'

const NO_GRADE = -1

type GradeSelectProps = {
  label: string
  value: number | undefined
  systemId: GradingSystemId
  onChange: (index: number | undefined) => void
}

const GradeSelect = ({ label, value, systemId, onChange }: GradeSelectProps) => {
  const options = getGradeOptions(systemId)
  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
        {label}
      </Text>
      <NativeSelectRoot size="sm" maxW="180px">
        <NativeSelectField
          value={value ?? NO_GRADE}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10)
            onChange(n === NO_GRADE ? undefined : n)
          }}
        >
          <option value={NO_GRADE}>— not set —</option>
          {[...options].reverse().map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </NativeSelectField>
      </NativeSelectRoot>
    </Box>
  )
}

const SystemSelect = ({
  label,
  value,
  discipline,
  onChange,
}: {
  label: string
  value: GradingSystemId
  discipline: 'rope' | 'boulder'
  onChange: (id: GradingSystemId) => void
}) => {
  const systems = getGradingSystemsForDiscipline(discipline)
  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
        {label}
      </Text>
      <NativeSelectRoot size="sm" maxW="220px">
        <NativeSelectField value={value} onChange={(e) => onChange(e.target.value as GradingSystemId)}>
          {systems.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </NativeSelectField>
      </NativeSelectRoot>
    </Box>
  )
}

export const SettingsPage = () => {
  const navigate = useNavigate()
  const { settings, updateGradeProfile, updatePreferredGradingSystem, updatePreferredBoulderGradingSystem } = useSettings()

  const { gradeProfile, preferredGradingSystem, preferredBoulderGradingSystem } = settings

  const updateSport = (field: keyof typeof gradeProfile.sport, value: number | undefined) => {
    updateGradeProfile({
      ...gradeProfile,
      sport: { ...gradeProfile.sport, [field]: value },
    })
  }

  const updateBoulder = (field: keyof typeof gradeProfile.boulder, value: number | undefined) => {
    updateGradeProfile({
      ...gradeProfile,
      boulder: { ...gradeProfile.boulder, [field]: value },
    })
  }

  return (
    <Box maxW="700px" mx="auto" p={{ base: 4, md: 8 }}>
      <Flex align="center" gap={3} mb={8}>
        <Button size="sm" variant="ghost" onClick={() => navigate('/')}>
          ← Projects
        </Button>
        <Heading as="h1" size="lg" color="gray.800">
          Settings
        </Heading>
      </Flex>

      <VStack gap={6} align="stretch">
        {/* Grading systems */}
        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" p={5}>
          <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={4}>
            Grading Systems
          </Text>
          <HStack gap={6} flexWrap="wrap">
            <SystemSelect
              label="Sport / Trad"
              value={preferredGradingSystem}
              discipline="rope"
              onChange={updatePreferredGradingSystem}
            />
            <SystemSelect
              label="Boulder"
              value={preferredBoulderGradingSystem}
              discipline="boulder"
              onChange={updatePreferredBoulderGradingSystem}
            />
          </HStack>
        </Box>

        {/* Sport grade profile */}
        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" p={5}>
          <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={1}>
            Sport / Trad Grade Profile
          </Text>
          <Text fontSize="sm" color="gray.500" mb={4}>
            Used to calculate grade gap and redpoint strategy.
          </Text>
          <VStack gap={4} align="stretch">
            <HStack gap={6} flexWrap="wrap">
              <GradeSelect
                label="Max Redpoint"
                value={gradeProfile.sport.maxRedpoint}
                systemId={preferredGradingSystem}
                onChange={(v) => updateSport('maxRedpoint', v)}
              />
              <GradeSelect
                label="Max Flash"
                value={gradeProfile.sport.maxFlash}
                systemId={preferredGradingSystem}
                onChange={(v) => updateSport('maxFlash', v)}
              />
            </HStack>
            <HStack gap={6} flexWrap="wrap">
              <GradeSelect
                label="Max Onsight"
                value={gradeProfile.sport.maxOnsight}
                systemId={preferredGradingSystem}
                onChange={(v) => updateSport('maxOnsight', v)}
              />
              <GradeSelect
                label="Max Day Send"
                value={gradeProfile.sport.maxDaySend}
                systemId={preferredGradingSystem}
                onChange={(v) => updateSport('maxDaySend', v)}
              />
            </HStack>
          </VStack>
        </Box>

        {/* Boulder grade profile */}
        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" p={5}>
          <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={1}>
            Boulder Grade Profile
          </Text>
          <Text fontSize="sm" color="gray.500" mb={4}>
            Used for boulder project grade gap calculations.
          </Text>
          <HStack gap={6} flexWrap="wrap">
            <GradeSelect
              label="Max Redpoint"
              value={gradeProfile.boulder.maxRedpoint}
              systemId={preferredBoulderGradingSystem}
              onChange={(v) => updateBoulder('maxRedpoint', v)}
            />
            <GradeSelect
              label="Max Flash"
              value={gradeProfile.boulder.maxFlash}
              systemId={preferredBoulderGradingSystem}
              onChange={(v) => updateBoulder('maxFlash', v)}
            />
            <GradeSelect
              label="Max Day Send"
              value={gradeProfile.boulder.maxDaySend}
              systemId={preferredBoulderGradingSystem}
              onChange={(v) => updateBoulder('maxDaySend', v)}
            />
          </HStack>
        </Box>

        {/* How grade gap works */}
        <Box bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.100" p={4}>
          <Text fontSize="sm" fontWeight="semibold" color="blue.700" mb={2}>
            How Grade Gap Works
          </Text>
          <VStack align="stretch" gap={1}>
            <Text fontSize="sm" color="blue.600">
              <strong>Greedy</strong> (0–1 grade above max redpoint) — aggressive approach, 60% readiness to attempt
            </Text>
            <Text fontSize="sm" color="blue.600">
              <strong>Moderate</strong> (2–3 grades above) — systematic but compressible, 75% readiness
            </Text>
            <Text fontSize="sm" color="blue.600">
              <strong>Patient</strong> (4+ grades above) — full tactical discipline, 90% readiness before attempting
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}
