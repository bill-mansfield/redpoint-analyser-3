import { Box, Text, VStack, Badge } from '@chakra-ui/react'
import { match } from 'ts-pattern'
import type { SessionSuggestion, SessionFocusType } from '../../lib/tactical-engine'

const focusLabel: Record<SessionFocusType, string> = {
  work_crux: 'Work Crux',
  establish_rest: 'Establish Rest',
  link_section: 'Link Section',
  low_point: 'Low Point',
  high_point: 'High Point',
  mindset_prep: 'Mindset Prep',
  send_attempt: 'Send Attempt',
}

const focusColor = (type: SessionFocusType): string =>
  match(type)
    .with('work_crux', () => 'red')
    .with('establish_rest', () => 'green')
    .with('link_section', () => 'blue')
    .with('low_point', () => 'purple')
    .with('high_point', () => 'orange')
    .with('mindset_prep', () => 'teal')
    .with('send_attempt', () => 'yellow')
    .exhaustive()

type Props = {
  suggestion: SessionSuggestion
}

export const SessionSuggestionCard = ({ suggestion }: Props) => (
  <Box>
    <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
      Today's Focus
    </Text>
    <VStack align="stretch" gap={3}>
      {/* Primary focus */}
      <Box
        p={4}
        bg="blue.50"
        borderRadius="lg"
        border="1px solid"
        borderColor="blue.100"
        borderLeft="4px solid"
        borderLeftColor="blue.400"
      >
        <Badge colorScheme={focusColor(suggestion.primary.type)} mb={2} fontSize="xs">
          {focusLabel[suggestion.primary.type]}
          {suggestion.primary.targetAnnotation && ` — ${suggestion.primary.targetAnnotation.name}`}
        </Badge>
        <Text fontSize="sm" color="gray.700" fontWeight="medium">
          {suggestion.primary.description}
        </Text>
      </Box>

      {/* Secondary focus */}
      {suggestion.secondary && (
        <Box
          p={3}
          bg="gray.50"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
        >
          <Badge colorScheme={focusColor(suggestion.secondary.type)} mb={1} fontSize="xs" variant="subtle">
            Secondary — {focusLabel[suggestion.secondary.type]}
          </Badge>
          <Text fontSize="sm" color="gray.600">
            {suggestion.secondary.description}
          </Text>
        </Box>
      )}

      {/* Phase context */}
      <Text fontSize="xs" color="gray.500" fontStyle="italic">
        {suggestion.phaseContext}
      </Text>
    </VStack>
  </Box>
)
