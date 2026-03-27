import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, VStack, Input, Text, Box, HStack, NativeSelectRoot, NativeSelectField } from '@chakra-ui/react'
import type { Annotation } from '../../types'
import { generateAnnotationId } from '../../utils'
import { match } from 'ts-pattern'
import { generateDefaultName } from './utils'
import { formSchema, type FormData } from './schema'

type AnnotationFormProps = {
  isOpen: boolean
  yPosition: number
  onClose: () => void
  onSubmit: (annotation: { type: Annotation['type']; name: string; difficultyRating?: number; restQuality?: number }) => void
  existingAnnotations: readonly Annotation[]
}

export const AnnotationForm = ({ isOpen, yPosition, onClose, onSubmit, existingAnnotations }: AnnotationFormProps) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      type: 'crux',
      name: 'Crux 1',
      difficultyRating: 3,
      restQuality: undefined,
    },
  })

  const watchedType = watch('type')
  const watchedName = watch('name')

  // Update default name when type changes
  useEffect(() => {
    if (!isOpen) {
      return
    }
    const id = generateAnnotationId(watchedType, existingAnnotations)
    const name = generateDefaultName(watchedType, id)
    setValue('name', name, { shouldValidate: true, shouldDirty: true })

    // Reset ratings when type changes
    if (watchedType === 'crux') {
      setValue('difficultyRating', 3, { shouldValidate: true })
      setValue('restQuality', undefined, { shouldValidate: true })
    } else {
      setValue('difficultyRating', undefined, { shouldValidate: true })
      setValue('restQuality', 3, { shouldValidate: true })
    }
  }, [isOpen, watchedType, existingAnnotations, setValue])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const id = generateAnnotationId('crux', existingAnnotations)
      const defaultName = generateDefaultName('crux', id)
      reset({
        type: 'crux',
        name: defaultName,
        difficultyRating: 3,
        restQuality: undefined,
      })
    }
  }, [isOpen, reset, existingAnnotations])

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      type: data.type,
      name: data.name.trim(),
      difficultyRating: data.difficultyRating,
      restQuality: data.restQuality,
    })
    handleClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const getTypeColor = (type: Annotation['type'] | undefined) =>
    match(type)
      .with('crux', () => 'red.500')
      .with('rest', () => 'green.500')
      .with(undefined, () => 'gray.500')
      .exhaustive()

  if (!isOpen) {
    return null
  }

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="blackAlpha.600"
      zIndex="modal"
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={handleOverlayClick}
    >
      <Box bg="white" borderRadius="lg" shadow="xl" maxW="md" w="full" mx={4} onClick={(e) => e.stopPropagation()}>
        <Box p={6} pb={4} borderBottom="1px solid" borderColor="gray.200">
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Add Annotation
            </Text>
            <Button variant="ghost" size="sm" onClick={handleClose} aria-label="Close" _hover={{ bg: 'gray.100' }}>
              ✕
            </Button>
          </HStack>
        </Box>

        <Box p={6}>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <VStack gap={4} align="stretch">
              {/* Type selection */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Type
                </Text>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <NativeSelectRoot size="md">
                      <NativeSelectField {...field} data-testid="annotation-type-select">
                        <option value="crux">Crux</option>
                        <option value="rest">Rest</option>
                      </NativeSelectField>
                    </NativeSelectRoot>
                  )}
                />
              </Box>

              {/* Name */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Name
                </Text>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter annotation name"
                      data-testid="annotation-name-input"
                      borderColor={errors.name ? 'red.300' : 'gray.200'}
                    />
                  )}
                />
                {errors.name && (
                  <Text fontSize="sm" color="red.500" mt={1}>
                    {errors.name.message}
                  </Text>
                )}
              </Box>

              {/* Difficulty Rating (crux only) */}
              {watchedType === 'crux' && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Difficulty (relative to route)
                  </Text>
                  <Controller
                    name="difficultyRating"
                    control={control}
                    render={({ field }) => (
                      <HStack gap={2}>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            size="sm"
                            variant={field.value === rating ? 'solid' : 'outline'}
                            colorScheme={field.value === rating ? 'red' : 'gray'}
                            onClick={() => field.onChange(rating)}
                          >
                            {rating}
                          </Button>
                        ))}
                      </HStack>
                    )}
                  />
                  {errors.difficultyRating && (
                    <Text fontSize="sm" color="red.500" mt={1}>
                      {errors.difficultyRating.message}
                    </Text>
                  )}
                </Box>
              )}

              {/* Rest Quality (rest only) */}
              {watchedType === 'rest' && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Rest Quality (1=marginal, 5=full recovery)
                  </Text>
                  <Controller
                    name="restQuality"
                    control={control}
                    render={({ field }) => (
                      <HStack gap={2}>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            size="sm"
                            variant={field.value === rating ? 'solid' : 'outline'}
                            colorScheme={field.value === rating ? 'green' : 'gray'}
                            onClick={() => field.onChange(rating)}
                          >
                            {rating}
                          </Button>
                        ))}
                      </HStack>
                    )}
                  />
                  {errors.restQuality && (
                    <Text fontSize="sm" color="red.500" mt={1}>
                      {errors.restQuality.message}
                    </Text>
                  )}
                </Box>
              )}

              {/* Preview */}
              <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Preview:
                </Text>
                <HStack gap={2}>
                  <Box w={3} h={3} borderRadius="full" bg={getTypeColor(watchedType)} />
                  <Text fontSize="sm" fontWeight="medium">
                    {watchedName || 'Unnamed annotation'}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Position: {Math.round(yPosition)}px
                </Text>
              </Box>

              {/* Footer */}
              <Box pt={4} borderTop="1px solid" borderColor="gray.200">
                <HStack justify="flex-end" gap={3}>
                  <Button variant="ghost" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" colorScheme="blue" disabled={!isValid} data-testid="annotation-form-submit">
                    Add Annotation
                  </Button>
                </HStack>
              </Box>
            </VStack>
          </form>
        </Box>
      </Box>
    </Box>
  )
}
