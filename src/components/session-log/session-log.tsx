import { useState } from 'react'
import { Box, Button, Flex, Text, HStack, Badge } from '@chakra-ui/react'
import type { Annotation, Session } from '../../types'
import type { TacticalPhase } from '../../lib/tactical-engine'
import { SessionForm } from './session-form'
import { SessionList } from './session-list'
import { buildAttempt, generateSessionId, attemptTypeLabel, phaseToAttemptType, sessionToFormData } from './utils'
import type { SessionFormData } from './schema'

type Props = {
  sessions: Session[]
  annotations: readonly Annotation[]
  currentPhase: TacticalPhase
  onAddSession: (session: Session) => void
  onUpdateSession: (session: Session) => void
  onDeleteSession: (id: string) => void
}

type FormMode = { type: 'add' } | { type: 'edit'; sessionId: string }

export const SessionLog = ({ sessions, annotations, currentPhase, onAddSession, onUpdateSession, onDeleteSession }: Props) => {
  const [formMode, setFormMode] = useState<FormMode | null>(null)

  const editingSession = formMode?.type === 'edit' ? sessions.find((s) => s.id === formMode.sessionId) : undefined

  const handleSubmit = (data: SessionFormData) => {
    const attempt = buildAttempt(data, [...annotations])

    if (formMode?.type === 'edit' && editingSession) {
      onUpdateSession({
        ...editingSession,
        date: data.date,
        sessionRating: data.sessionRating,
        morePsyched: data.morePsyched,
        attempts: [attempt],
        notes: data.notes,
      })
    } else {
      onAddSession({
        id: generateSessionId(sessions),
        date: data.date,
        sessionRating: data.sessionRating,
        morePsyched: data.morePsyched,
        attempts: [attempt],
        notes: data.notes,
      })
    }
    setFormMode(null)
  }

  const suggestedType = phaseToAttemptType(currentPhase)

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">
            Session Log
          </Text>
          <HStack gap={2} mt={1}>
            <Text fontSize="sm" color="gray.500">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </Text>
            <Text fontSize="sm" color="gray.400">·</Text>
            <Text fontSize="sm" color="gray.500">
              Suggested today:{' '}
              <Badge colorScheme="blue" fontSize="xs">
                {attemptTypeLabel[suggestedType]}
              </Badge>
            </Text>
          </HStack>
        </Box>
        {formMode === null && (
          <Button colorScheme="blue" size="sm" onClick={() => setFormMode({ type: 'add' })}>
            + Log Session
          </Button>
        )}
      </Flex>

      {/* Form (add or edit) */}
      {formMode !== null && (
        <Box mb={4}>
          <SessionForm
            annotations={annotations}
            currentPhase={currentPhase}
            initialValues={editingSession ? sessionToFormData(editingSession) : undefined}
            onSubmit={handleSubmit}
            onCancel={() => setFormMode(null)}
          />
        </Box>
      )}

      {/* List */}
      <SessionList
        sessions={sessions}
        onDelete={onDeleteSession}
        onEdit={(id) => setFormMode({ type: 'edit', sessionId: id })}
      />
    </Box>
  )
}
