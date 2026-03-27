import { Box, Text, VStack, HStack, Badge, Button, Flex } from '@chakra-ui/react'
import * as R from 'remeda'
import { match } from 'ts-pattern'
import type { Session, Attempt } from '../../types'

const attemptSummary = (attempt: Attempt): string =>
  match(attempt)
    .with({ type: 'working' }, (a) =>
      a.cruxes.length > 0 ? `Worked ${a.cruxes.length} crux${a.cruxes.length > 1 ? 'es' : ''}` : 'Working moves'
    )
    .with({ type: 'linking' }, () => 'Linking sections')
    .with({ type: 'lowpoint' }, (a) => `Low point — ${a.success ? 'success' : 'fell'}`)
    .with({ type: 'redpoint' }, (a) => (a.sent ? 'Sent! 🎉' : 'Redpoint attempt'))
    .exhaustive()

const attemptColor = (attempt: Attempt): string =>
  match(attempt)
    .with({ type: 'working' }, () => 'gray')
    .with({ type: 'linking' }, () => 'blue')
    .with({ type: 'lowpoint' }, (a) => (a.success ? 'green' : 'orange'))
    .with({ type: 'redpoint' }, (a) => (a.sent ? 'green' : 'red'))
    .exhaustive()

const formatDate = (iso: string): string => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

type SessionCardProps = {
  session: Session
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

const SessionCard = ({ session, onDelete, onEdit }: SessionCardProps) => (
  <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" shadow="sm">
    <Flex justify="space-between" align="flex-start" gap={2}>
      <Box flex={1}>
        <HStack gap={2} mb={2} flexWrap="wrap">
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            {formatDate(session.date)}
          </Text>
          <HStack gap={1}>
            {Array.from({ length: 5 }, (_, i) => (
              <Box
                key={i}
                w={2}
                h={2}
                borderRadius="full"
                bg={i < session.sessionRating ? 'blue.400' : 'gray.200'}
              />
            ))}
          </HStack>
          {!session.morePsyched && (
            <Badge colorScheme="orange" fontSize="xs" variant="subtle">
              Psych dropping
            </Badge>
          )}
        </HStack>

        <HStack gap={2} flexWrap="wrap">
          {session.attempts.map((attempt, i) => (
            <Badge key={i} colorScheme={attemptColor(attempt)} fontSize="xs" variant="subtle">
              {attemptSummary(attempt)}
            </Badge>
          ))}
        </HStack>

        {session.notes && (
          <Text fontSize="xs" color="gray.500" mt={2} fontStyle="italic">
            {session.notes}
          </Text>
        )}
      </Box>
      <HStack gap={1} flexShrink={0}>
        <Button size="xs" variant="ghost" colorScheme="gray" onClick={() => onEdit(session.id)}>
          Edit
        </Button>
        <Button size="xs" variant="ghost" colorScheme="red" onClick={() => onDelete(session.id)}>
          ✕
        </Button>
      </HStack>
    </Flex>
  </Box>
)

type Props = {
  sessions: Session[]
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

export const SessionList = ({ sessions, onDelete, onEdit }: Props) => {
  if (sessions.length === 0) {
    return (
      <Text fontSize="sm" color="gray.400" fontStyle="italic" py={4} textAlign="center">
        No sessions logged yet.
      </Text>
    )
  }

  const sorted = R.pipe(
    sessions,
    R.sortBy([(s) => s.date, 'desc'])
  )

  return (
    <VStack align="stretch" gap={3}>
      {sorted.map((session) => (
        <SessionCard key={session.id} session={session} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </VStack>
  )
}
