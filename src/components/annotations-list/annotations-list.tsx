import { useState } from 'react'
import { VStack, HStack, Flex, Box, Heading, Text, Badge, Button } from '@chakra-ui/react'
import * as R from 'remeda'
import type { Annotation } from '../../types'
import { validateAnnotations } from '../../utils'
import { ConfirmDeleteDialog } from '../elements/elements'

type Props = {
  annotations: readonly Annotation[]
  onDeleteAnnotation: (annotationId: string) => void
}

export const AnnotationsList = ({ annotations, onDeleteAnnotation }: Props) => {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const validatedAnnotations = validateAnnotations(annotations)

  const groupedAnnotations = R.pipe(
    validatedAnnotations,
    R.groupBy((annotation) => annotation.type)
  )

  const annotationTypes: { type: Annotation['type']; title: string; color: string }[] = [
    { type: 'crux', title: 'Cruxes', color: 'red' },
    { type: 'rest', title: 'Rests', color: 'green' },
  ]

  const renderAnnotationSection = (type: Annotation['type'], title: string, color: string) => {
    const items = groupedAnnotations[type] || []

    return (
      <Box mb={5}>
        <Heading as="h3" size="md" mb={3} color="gray.600" borderBottom="1px solid" borderColor="gray.200" pb={2}>
          {title}
        </Heading>
        <VStack align="stretch" gap={2}>
          {!items.length ?
            <Text color="gray.500" fontSize="sm" fontStyle="italic" py={2}>
              No {type} annotations
            </Text>
          : items.map((annotation) => (
              <Box
                key={annotation.id}
                p={3}
                bg="white"
                borderRadius="md"
                shadow="sm"
                border="1px solid"
                borderColor="gray.100"
              >
                <Flex justify="space-between" align="center" gap={2} flexWrap="wrap">
                  <HStack flex={1} minW={0}>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.700"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {annotation.name}
                    </Text>
                    {annotation.type === 'crux' && annotation.difficultyRating && (
                      <Badge colorScheme="red" variant="subtle" fontSize="xs">
                        {annotation.difficultyRating}/5
                      </Badge>
                    )}
                    {annotation.type === 'rest' && annotation.restQuality && (
                      <Badge colorScheme="green" variant="subtle" fontSize="xs">
                        {annotation.restQuality}/5
                      </Badge>
                    )}
                    {annotation.isDialed && (
                      <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                        Dialed
                      </Badge>
                    )}
                  </HStack>
                  <HStack flexShrink={0}>
                    <Badge variant="subtle" color={color}>
                      {annotation.type}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => setDeleteTarget({ id: annotation.id, name: annotation.name })}
                      fontSize="xs"
                      px={2}
                    >
                      Delete
                    </Button>
                  </HStack>
                </Flex>
              </Box>
            ))
          }
        </VStack>
      </Box>
    )
  }

  return (
    <VStack
      align="stretch"
      gap={6}
      p={{ base: 3, md: 5 }}
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      shadow="md"
      w="100%"
      minW={0}
      overflow="hidden"
    >
      <Heading as="h2" size="lg" color="gray.700">
        Route Annotations
      </Heading>
      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' } as object}
        gap={4}
        alignItems="start"
      >
        {annotationTypes.map(({ type, title, color }) => (
          <Box key={type}>{renderAnnotationSection(type, title, color)}</Box>
        ))}
      </Box>

      <ConfirmDeleteDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => onDeleteAnnotation(deleteTarget!.id)}
        title="Delete Annotation"
        description={
          <>
            Are you sure you want to delete{' '}
            <Text as="span" fontWeight="600">
              &quot;{deleteTarget?.name}&quot;
            </Text>
            ?
          </>
        }
      />
    </VStack>
  )
}
