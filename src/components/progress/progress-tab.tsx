import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { match } from 'ts-pattern'
import type { Session } from '../../types'
import type { TacticalPlan } from '../../lib/tactical-engine'
import { SendReadinessGauge } from '../tactical-plan/send-readiness-gauge'
import { getRedpointThreshold } from '../../lib/tactical-engine'

type Props = {
  sessions: readonly Session[]
  plan: TacticalPlan
}

const PHASE_LABELS: Record<string, string> = {
  work_cruxes: 'Working Cruxes',
  establish_rests: 'Establishing Rests',
  link_sections: 'Linking Sections',
  low_points: 'Low Points',
  high_points: 'High Points',
  pre_send_mindset: 'Pre-Send Mindset',
  redpoint: 'Redpoint',
}

const attemptTypeLabel = (type: string): string =>
  match(type)
    .with('working', () => 'Working moves')
    .with('linking', () => 'Linking sections')
    .with('lowpoint', () => 'Low-pointing')
    .with('redpoint', () => 'Redpoint attempts')
    .otherwise(() => type)

const ratingColor = (rating: number): string => {
  if (rating >= 4) return '#38a169'
  if (rating >= 3) return '#d69e2e'
  return '#e53e3e'
}

const SessionRatingChart = ({ sessions }: { sessions: readonly Session[] }) => {
  if (sessions.length === 0) return null

  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
  const w = 300
  const h = 80
  const pad = 12
  const innerW = w - pad * 2
  const innerH = h - pad * 2

  // Build points: x = session index, y = 1–5 rating
  const points = sorted.map((s, i) => ({
    x: pad + (sorted.length === 1 ? innerW / 2 : (i / (sorted.length - 1)) * innerW),
    y: pad + innerH - ((s.sessionRating - 1) / 4) * innerH,
    rating: s.sessionRating,
    date: s.date,
    psyched: s.morePsyched,
  }))

  const pathD =
    points.length === 1
      ? `M ${points[0]!.x} ${points[0]!.y}`
      : points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')

  return (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
        Session Quality
      </Text>
      <Box bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.100" p={2} overflowX="auto">
        <svg width={w} height={h} style={{ display: 'block' }}>
          {/* Grid lines for ratings 1-5 */}
          {[1, 2, 3, 4, 5].map((r) => {
            const y = pad + innerH - ((r - 1) / 4) * innerH
            return (
              <g key={r}>
                <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                <text x={pad - 4} y={y + 4} fontSize="7" fill="#a0aec0" textAnchor="end">
                  {r}
                </text>
              </g>
            )
          })}

          {/* Line */}
          {points.length > 1 && (
            <path d={pathD} fill="none" stroke="#cbd5e0" strokeWidth="1.5" strokeLinejoin="round" />
          )}

          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={ratingColor(p.rating)}
              stroke="white"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </Box>
      <Text fontSize="xs" color="gray.400" mt={1}>
        {sorted.length} session{sorted.length !== 1 ? 's' : ''} — left is oldest
      </Text>
    </Box>
  )
}

export const ProgressTab = ({ sessions, plan }: Props) => {
  const threshold = getRedpointThreshold(plan.gradeGap.category)
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))

  // Days on project
  const firstDate = sorted[0]?.date
  const lastDate = sorted[sorted.length - 1]?.date
  const daysOnProject =
    firstDate && lastDate
      ? Math.round((new Date(lastDate).getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      : null

  // Attempt type counts
  const attemptCounts: Record<string, number> = {}
  for (const session of sessions) {
    for (const attempt of session.attempts) {
      attemptCounts[attempt.type] = (attemptCounts[attempt.type] ?? 0) + 1
    }
  }

  // Send attempts and actual sends
  const redpointAttempts = sessions.flatMap((s) => s.attempts.filter((a) => a.type === 'redpoint'))
  const sends = redpointAttempts.filter((a) => a.type === 'redpoint' && 'sent' in a && a.sent).length

  const currentPhaseLabel = PHASE_LABELS[plan.currentPhase] ?? plan.currentPhase

  return (
    <VStack gap={6} align="stretch">
      {/* Top row: gauge + stats */}
      <Flex gap={4} flexWrap="wrap" align="flex-start">
        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" p={5} flex="1" minW="240px">
          <SendReadinessGauge
            sendReadiness={plan.sendReadiness}
            redpointThreshold={threshold}
            gradeGapCategory={plan.gradeGap.category}
          />
        </Box>

        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" p={5} flex="1" minW="240px">
          <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
            Project Stats
          </Text>
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">Current phase</Text>
              <Text fontSize="sm" fontWeight="medium" color="gray.700">{currentPhaseLabel}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">Sessions</Text>
              <Text fontSize="sm" fontWeight="medium" color="gray.700">{sessions.length}</Text>
            </HStack>
            {daysOnProject !== null && (
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">Days on project</Text>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">{daysOnProject}</Text>
              </HStack>
            )}
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">Redpoint attempts</Text>
              <Text fontSize="sm" fontWeight="medium" color="gray.700">{redpointAttempts.length}</Text>
            </HStack>
            {sends > 0 && (
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">Sends</Text>
                <Text fontSize="sm" fontWeight="bold" color="green.600">{sends}</Text>
              </HStack>
            )}
          </VStack>
        </Box>
      </Flex>

      {/* Session quality chart */}
      {sessions.length > 0 && (
        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" p={5}>
          <SessionRatingChart sessions={sessions} />
        </Box>
      )}

      {/* Attempt breakdown */}
      {Object.keys(attemptCounts).length > 0 && (
        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" p={5}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
            Attempt Breakdown
          </Text>
          <VStack align="stretch" gap={2}>
            {Object.entries(attemptCounts).map(([type, count]) => {
              const total = Object.values(attemptCounts).reduce((a, b) => a + b, 0)
              const pct = Math.round((count / total) * 100)
              return (
                <Box key={type}>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm" color="gray.600">{attemptTypeLabel(type)}</Text>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">{count} ({pct}%)</Text>
                  </HStack>
                  <Box h="6px" bg="gray.100" borderRadius="full" overflow="hidden">
                    <Box h="100%" w={`${pct}%`} bg="blue.400" borderRadius="full" />
                  </Box>
                </Box>
              )
            })}
          </VStack>
        </Box>
      )}

      {/* Empty state */}
      {sessions.length === 0 && (
        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" p={8} textAlign="center">
          <Text color="gray.400">Log your first session to see progress over time.</Text>
        </Box>
      )}
    </VStack>
  )
}
