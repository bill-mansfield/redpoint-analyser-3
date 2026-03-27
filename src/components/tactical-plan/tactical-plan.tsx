import { Box, Text, VStack, Grid } from '@chakra-ui/react'
import type { Annotation, MindsetProgress } from '../../types'
import type { TacticalPlan as TacticalPlanType } from '../../lib/tactical-engine'
import { suggestSessionFocus } from '../../lib/tactical-engine'
import { PhaseStepper } from './phase-stepper'
import { SendReadinessGauge } from './send-readiness-gauge'
import { SessionSuggestionCard } from './session-suggestion-card'
import { CruxProgressList, RestProgressList } from './crux-rest-progress'
import { MindsetChecklist } from './mindset-checklist'

type Props = {
  annotations: readonly Annotation[]
  plan: TacticalPlanType
  onToggleMindset?: (key: keyof MindsetProgress) => void
}

export const TacticalPlan = ({ annotations, plan, onToggleMindset }: Props) => {
  if (annotations.length === 0) {
    return (
      <Box p={8} textAlign="center" bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm">
        <Text fontSize="xl" fontWeight="semibold" color="gray.600" mb={2}>
          No annotations yet
        </Text>
        <Text color="gray.400">
          Go to the Route tab, right-click the canvas in Annotation Mode, and add cruxes and rests.
        </Text>
      </Box>
    )
  }

  const suggestion = suggestSessionFocus({
    currentPhase: plan.currentPhase,
    cruxProgress: plan.cruxProgress,
    restProgress: plan.restProgress,
    linkProgress: plan.linkProgress,
    annotations,
  })

  return (
    <VStack align="stretch" gap={5}>
      {/* Phase stepper — full width */}
      <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" p={5}>
        <PhaseStepper phaseStatuses={plan.phaseStatuses} currentPhase={plan.currentPhase} />
      </Box>

      {/* Send readiness + Session suggestion */}
      <Grid gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' } as object} gap={4}>
        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" p={5}>
          <SendReadinessGauge
            sendReadiness={plan.sendReadiness}
            redpointThreshold={plan.gradeGap.redpointThreshold}
            gradeGapCategory={plan.gradeGap.category}
          />
        </Box>
        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" p={5}>
          <SessionSuggestionCard suggestion={suggestion} />
        </Box>
      </Grid>

      {/* Crux + Rest progress */}
      <Grid gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' } as object} gap={4}>
        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" p={5}>
          <CruxProgressList cruxProgress={plan.cruxProgress} energyProfile={plan.energyProfile} />
        </Box>
        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" p={5}>
          <RestProgressList restProgress={plan.restProgress} energyProfile={plan.energyProfile} />
        </Box>
      </Grid>

      {/* Mindset */}
      <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm" p={5}>
        <MindsetChecklist
          currentPhase={plan.currentPhase}
          phaseStatuses={plan.phaseStatuses}
          mindsetProgress={plan.mindsetProgress}
          onToggle={onToggleMindset}
        />
      </Box>
    </VStack>
  )
}
