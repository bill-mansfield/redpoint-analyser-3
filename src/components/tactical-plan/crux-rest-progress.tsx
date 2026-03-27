import { Box, Text, VStack, HStack, Badge, Flex } from '@chakra-ui/react'
import type { CruxProgress, RestProgress, EnergyPoint } from '../../lib/tactical-engine'

type CruxListProps = {
  cruxProgress: CruxProgress[]
  energyProfile: EnergyPoint[]
}

export const CruxProgressList = ({ cruxProgress, energyProfile }: CruxListProps) => {
  if (cruxProgress.length === 0) {
    return (
      <Box>
        <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
          Crux Progress
        </Text>
        <Text fontSize="sm" color="gray.400" fontStyle="italic">
          No cruxes annotated yet. Add crux annotations on the Route tab.
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
        Crux Progress
      </Text>
      <VStack align="stretch" gap={2}>
        {cruxProgress.map((crux) => {
          const energyPoint = energyProfile.find((e) => e.annotationId === crux.annotationId)
          return (
            <Box
              key={crux.annotationId}
              p={3}
              bg="white"
              borderRadius="md"
              border="1px solid"
              borderColor={crux.isDialed ? 'green.200' : crux.isWorkedOut ? 'yellow.200' : 'gray.100'}
              shadow="sm"
            >
              <Flex justify="space-between" align="center" gap={2} flexWrap="wrap">
                <HStack gap={2} flex={1} minW={0}>
                  <Box w={2} h={2} borderRadius="full" bg="red.400" flexShrink={0} />
                  <Text fontSize="sm" fontWeight="medium" color="gray.700" truncate>
                    {crux.name}
                  </Text>
                  {energyPoint?.isTrueCrux && (
                    <Badge colorScheme="red" variant="solid" fontSize="2xs">
                      True Crux
                    </Badge>
                  )}
                </HStack>
                <HStack gap={1} flexShrink={0}>
                  <Badge colorScheme="gray" variant="subtle" fontSize="xs">
                    {crux.difficultyRating}/5
                  </Badge>
                  {crux.isDialed ?
                    <Badge colorScheme="green" fontSize="xs">Dialed</Badge>
                  : crux.isWorkedOut ?
                    <Badge colorScheme="yellow" fontSize="xs">Worked</Badge>
                  : <Badge colorScheme="gray" variant="outline" fontSize="xs">Not started</Badge>
                  }
                </HStack>
              </Flex>
              {energyPoint && (
                <Text fontSize="xs" color="gray.400" mt={1}>
                  Energy on arrival: {Math.round(energyPoint.energyBefore)}%
                </Text>
              )}
            </Box>
          )
        })}
      </VStack>
    </Box>
  )
}

type RestListProps = {
  restProgress: RestProgress[]
  energyProfile: EnergyPoint[]
}

export const RestProgressList = ({ restProgress, energyProfile }: RestListProps) => {
  if (restProgress.length === 0) {
    return (
      <Box>
        <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
          Rest Progress
        </Text>
        <Text fontSize="sm" color="gray.400" fontStyle="italic">
          No rests annotated yet. Add rest annotations on the Route tab.
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
        Rest Progress
      </Text>
      <VStack align="stretch" gap={2}>
        {restProgress.map((rest) => {
          const energyPoint = energyProfile.find((e) => e.annotationId === rest.annotationId)
          return (
            <Box
              key={rest.annotationId}
              p={3}
              bg="white"
              borderRadius="md"
              border="1px solid"
              borderColor={rest.isEstablished ? 'green.200' : 'gray.100'}
              shadow="sm"
            >
              <Flex justify="space-between" align="center" gap={2} flexWrap="wrap">
                <HStack gap={2} flex={1} minW={0}>
                  <Box w={2} h={2} borderRadius="full" bg="green.400" flexShrink={0} />
                  <Text fontSize="sm" fontWeight="medium" color="gray.700" truncate>
                    {rest.name}
                  </Text>
                </HStack>
                <HStack gap={1} flexShrink={0}>
                  <Badge colorScheme="green" variant="subtle" fontSize="xs">
                    Q{rest.restQuality}/5
                  </Badge>
                  {rest.isEstablished ?
                    <Badge colorScheme="green" fontSize="xs">Established</Badge>
                  : <Badge colorScheme="gray" variant="outline" fontSize="xs">Not established</Badge>
                  }
                </HStack>
              </Flex>
              {energyPoint && (
                <Text fontSize="xs" color="gray.400" mt={1}>
                  Recovery: {Math.round(energyPoint.energyAfter - energyPoint.energyBefore > 0 ? energyPoint.energyAfter - energyPoint.energyBefore : 0)}% energy restored
                </Text>
              )}
            </Box>
          )
        })}
      </VStack>
    </Box>
  )
}
