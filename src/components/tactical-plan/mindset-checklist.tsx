import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react'
import type { TacticalPhase, PhaseStatus } from '../../lib/tactical-engine'
import type { MindsetProgress } from '../../types'
import { getPhasePrompt } from '../../lib/tactical-engine'

type Props = {
  currentPhase: TacticalPhase
  phaseStatuses: Record<TacticalPhase, PhaseStatus>
  mindsetProgress: MindsetProgress
  onToggle?: (key: keyof MindsetProgress) => void
}

const PRE_SEND_CHECKS: { key: keyof MindsetProgress; label: string }[] = [
  { key: 'hasVisualized', label: 'Visualised a successful send' },
  { key: 'hasBreathingPlan', label: 'Breathing plan for each crux and rest' },
  { key: 'hasSessionGoal', label: 'Clear session goal (send vs. project)' },
  { key: 'hasReviewedBeta', label: 'Reviewed beta video' },
  { key: 'hasPositiveMonologue', label: 'Rehearsed positive internal monologue' },
]

export const MindsetChecklist = ({ currentPhase, phaseStatuses, mindsetProgress, onToggle }: Props) => {
  const prompt = getPhasePrompt(currentPhase)
  const isPreSendPhase = currentPhase === 'pre_send_mindset' || phaseStatuses['pre_send_mindset'] === 'active'

  return (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
        Mindset
      </Text>

      {/* Phase-triggered prompt */}
      {prompt && (
        <Box p={3} bg="purple.50" borderRadius="md" border="1px solid" borderColor="purple.100" mb={3}>
          <Text fontSize="sm" fontWeight="medium" color="purple.700" mb={1}>
            {prompt.question}
          </Text>
          <Text fontSize="xs" color="purple.500">
            {prompt.actionHint}
          </Text>
        </Box>
      )}

      {/* Pre-send checklist — only shown when relevant */}
      {isPreSendPhase && (
        <VStack align="stretch" gap={2}>
          {PRE_SEND_CHECKS.map(({ key, label }) => (
            <HStack
              key={key}
              gap={2}
              cursor={onToggle ? 'pointer' : 'default'}
              onClick={() => onToggle?.(key)}
              _hover={onToggle ? { bg: 'gray.50' } : undefined}
              px={1}
              py={0.5}
              borderRadius="sm"
            >
              <Box
                w={4}
                h={4}
                borderRadius="sm"
                border="1px solid"
                borderColor={mindsetProgress[key] ? 'green.400' : 'gray.300'}
                bg={mindsetProgress[key] ? 'green.400' : 'white'}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                {mindsetProgress[key] && (
                  <Text fontSize="2xs" color="white" fontWeight="bold">✓</Text>
                )}
              </Box>
              <Text fontSize="sm" color={mindsetProgress[key] ? 'gray.700' : 'gray.500'}>
                {label}
              </Text>
            </HStack>
          ))}
          <Box pt={1}>
            <Badge
              colorScheme={Object.values(mindsetProgress).every(Boolean) ? 'green' : 'gray'}
              fontSize="xs"
            >
              {Object.values(mindsetProgress).filter(Boolean).length} / {PRE_SEND_CHECKS.length} complete
            </Badge>
          </Box>
        </VStack>
      )}
    </Box>
  )
}
