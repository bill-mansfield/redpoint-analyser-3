import { Box, Flex, Text } from '@chakra-ui/react'
import { match } from 'ts-pattern'
import type { TacticalPhase, PhaseStatus } from '../../lib/tactical-engine'

type PhaseConfig = {
  phase: TacticalPhase
  label: string
  shortLabel: string
}

const PHASES: PhaseConfig[] = [
  { phase: 'work_cruxes', label: 'Work Cruxes', shortLabel: 'Cruxes' },
  { phase: 'establish_rests', label: 'Establish Rests', shortLabel: 'Rests' },
  { phase: 'link_sections', label: 'Link Sections', shortLabel: 'Links' },
  { phase: 'low_points', label: 'Low Points', shortLabel: 'Low' },
  { phase: 'high_points', label: 'High Points', shortLabel: 'High' },
  { phase: 'pre_send_mindset', label: 'Mindset', shortLabel: 'Mind' },
  { phase: 'redpoint', label: 'Redpoint', shortLabel: 'Send' },
]

type StepProps = {
  config: PhaseConfig
  status: PhaseStatus
  isCurrent: boolean
  isLast: boolean
}

const Step = ({ config, status, isCurrent, isLast }: StepProps) => {
  const { bg, border, textColor, numberColor } = match({ status, isCurrent })
    .with({ status: 'completed' }, () => ({
      bg: 'green.500',
      border: 'green.500',
      textColor: 'white',
      numberColor: 'white',
    }))
    .with({ isCurrent: true }, () => ({
      bg: 'blue.500',
      border: 'blue.500',
      textColor: 'white',
      numberColor: 'white',
    }))
    .with({ status: 'active' }, () => ({
      bg: 'white',
      border: 'blue.400',
      textColor: 'blue.600',
      numberColor: 'blue.500',
    }))
    .otherwise(() => ({
      bg: 'gray.100',
      border: 'gray.200',
      textColor: 'gray.400',
      numberColor: 'gray.400',
    }))

  const stepIndex = PHASES.findIndex((p) => p.phase === config.phase)

  return (
    <Flex flex={1} align="center" minW={0}>
      <Flex direction="column" align="center" flex={1} minW={0} gap={1}>
        <Box
          w={8}
          h={8}
          borderRadius="full"
          bg={bg}
          border="2px solid"
          borderColor={border}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          {status === 'completed' ?
            <Text fontSize="xs" fontWeight="bold" color={numberColor}>
              ✓
            </Text>
          : <Text fontSize="xs" fontWeight="bold" color={numberColor}>
              {stepIndex + 1}
            </Text>
          }
        </Box>
        <Text
          fontSize="2xs"
          fontWeight={isCurrent ? 'semibold' : 'normal'}
          color={textColor === 'white' ? (status === 'completed' ? 'green.600' : 'blue.600') : textColor}
          textAlign="center"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          maxW="100%"
        >
          {config.shortLabel}
        </Text>
      </Flex>
      {!isLast && (
        <Box
          h="2px"
          flex={1}
          bg={status === 'completed' ? 'green.300' : 'gray.200'}
          mx={1}
          flexShrink={0}
          maxW={8}
        />
      )}
    </Flex>
  )
}

type Props = {
  phaseStatuses: Record<TacticalPhase, PhaseStatus>
  currentPhase: TacticalPhase
}

export const PhaseStepper = ({ phaseStatuses, currentPhase }: Props) => (
  <Box>
    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
      Phase Progress
    </Text>
    <Flex align="flex-start" gap={0}>
      {PHASES.map((config, i) => (
        <Step
          key={config.phase}
          config={config}
          status={phaseStatuses[config.phase]}
          isCurrent={config.phase === currentPhase}
          isLast={i === PHASES.length - 1}
        />
      ))}
    </Flex>
  </Box>
)
