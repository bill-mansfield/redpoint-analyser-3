import { Box, Text, Flex } from '@chakra-ui/react'
import type { GradeGapCategory } from '../../lib/tactical-engine'

const getColor = (score: number): string => {
  if (score >= 80) return '#38a169' // green
  if (score >= 50) return '#d69e2e' // yellow
  return '#e53e3e' // red
}

const getLabel = (score: number, threshold: number): string => {
  if (score >= threshold) return 'Ready to send'
  if (score >= threshold * 0.8) return 'Almost ready'
  if (score >= 50) return 'Making progress'
  return 'Early stages'
}

const gapLabel: Record<GradeGapCategory, string> = {
  greedy: 'Greedy project',
  moderate: 'Moderate project',
  patient: 'Patient project',
}

type Props = {
  sendReadiness: number
  redpointThreshold: number
  gradeGapCategory: GradeGapCategory
}

export const SendReadinessGauge = ({ sendReadiness, redpointThreshold, gradeGapCategory }: Props) => {
  const color = getColor(sendReadiness)
  const circumference = 2 * Math.PI * 40
  const progress = (sendReadiness / 100) * circumference
  const thresholdAngle = (redpointThreshold / 100) * 360
  const thresholdRad = ((thresholdAngle - 90) * Math.PI) / 180
  const thresholdX = 50 + 40 * Math.cos(thresholdRad)
  const thresholdY = 50 + 40 * Math.sin(thresholdRad)

  return (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
        Send Readiness
      </Text>
      <Flex align="center" gap={6}>
        {/* Circular gauge */}
        <Box flexShrink={0} position="relative" w="100px" h="100px">
          <svg width="100" height="100" viewBox="0 0 100 100">
            {/* Background track */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
            {/* Progress arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={`${progress} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
            {/* Threshold marker */}
            <circle cx={thresholdX} cy={thresholdY} r="3" fill="#718096" />
            {/* Score text */}
            <text x="50" y="46" textAnchor="middle" fontSize="20" fontWeight="bold" fill={color}>
              {sendReadiness}
            </text>
            <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#718096">
              / 100
            </text>
          </svg>
        </Box>

        {/* Labels */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" color={color}>
            {getLabel(sendReadiness, redpointThreshold)}
          </Text>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Threshold: {redpointThreshold}% to redpoint
          </Text>
          <Box mt={2} px={2} py={1} bg="gray.100" borderRadius="md" display="inline-block">
            <Text fontSize="xs" color="gray.600" fontWeight="medium">
              {gapLabel[gradeGapCategory]}
            </Text>
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}
