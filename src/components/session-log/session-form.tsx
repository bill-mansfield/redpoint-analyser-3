import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, VStack, HStack, Text, Input, Textarea, NativeSelectRoot, NativeSelectField, Badge } from '@chakra-ui/react'
import type { Annotation } from '../../types'
import type { TacticalPhase } from '../../lib/tactical-engine'
import { sessionFormSchema, type SessionFormData } from './schema'
import { phaseToAttemptType, attemptTypeLabel } from './utils'

type Props = {
  annotations: readonly Annotation[]
  currentPhase: TacticalPhase
  initialValues?: SessionFormData
  onSubmit: (data: SessionFormData) => void
  onCancel: () => void
}

const today = () => new Date().toISOString().split('T')[0] ?? ''

const RatingButtons = ({
  value,
  onChange,
  max,
  colorScheme,
}: {
  value: number | undefined
  onChange: (v: number) => void
  max: number
  colorScheme: string
}) => (
  <HStack gap={1}>
    {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
      <Button
        key={n}
        size="sm"
        variant={value === n ? 'solid' : 'outline'}
        colorScheme={value === n ? colorScheme : 'gray'}
        onClick={() => onChange(n)}
        minW={8}
      >
        {n}
      </Button>
    ))}
  </HStack>
)

export const SessionForm = ({ annotations, currentPhase, initialValues, onSubmit, onCancel }: Props) => {
  const cruxAnnotations = annotations.filter((a) => a.type === 'crux')
  const isEditing = initialValues !== undefined

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionFormSchema),
    mode: 'onChange',
    defaultValues: initialValues ?? {
      date: today(),
      sessionRating: 3,
      morePsyched: true,
      attemptType: phaseToAttemptType(currentPhase),
      wasProductive: true,
      workedCruxIds: [],
      repeatedCruxIds: [],
      sent: false,
      perceivedEffort: 5,
      pumpRating: 5,
      lowpointSuccess: false,
    },
  })

  const attemptType = watch('attemptType')
  const sent = watch('sent')
  const workedCruxIds = watch('workedCruxIds') ?? []
  const sortedAnnotations = [...annotations].sort((a, b) => a.y - b.y)

  return (
    <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="md" p={6}>
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        {isEditing ? 'Edit Session' : 'Log Session'}
      </Text>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={4} align="stretch">
          {/* Date + Rating row */}
          <HStack gap={4} align="flex-start" flexWrap="wrap">
            <Box flex={1} minW="140px">
              <Text fontSize="sm" fontWeight="medium" mb={2}>Date</Text>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <Input type="date" {...field} borderColor={errors.date ? 'red.300' : 'gray.200'} />
                )}
              />
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Session Rating</Text>
              <Controller
                name="sessionRating"
                control={control}
                render={({ field }) => (
                  <RatingButtons value={field.value} onChange={field.onChange} max={5} colorScheme="blue" />
                )}
              />
            </Box>
          </HStack>

          {/* More psyched */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>Still psyched on this project?</Text>
            <Controller
              name="morePsyched"
              control={control}
              render={({ field }) => (
                <HStack gap={2}>
                  <Button size="sm" variant={field.value ? 'solid' : 'outline'} colorScheme={field.value ? 'green' : 'gray'} onClick={() => field.onChange(true)}>
                    Yes
                  </Button>
                  <Button size="sm" variant={!field.value ? 'solid' : 'outline'} colorScheme={!field.value ? 'red' : 'gray'} onClick={() => field.onChange(false)}>
                    No
                  </Button>
                </HStack>
              )}
            />
          </Box>

          {/* Attempt type */}
          <Box>
            <HStack mb={2}>
              <Text fontSize="sm" fontWeight="medium">Attempt Type</Text>
              <Badge colorScheme="blue" fontSize="xs">Phase suggestion: {attemptTypeLabel[phaseToAttemptType(currentPhase)]}</Badge>
            </HStack>
            <Controller
              name="attemptType"
              control={control}
              render={({ field }) => (
                <NativeSelectRoot size="md">
                  <NativeSelectField {...field}>
                    {(Object.entries(attemptTypeLabel) as [SessionFormData['attemptType'], string][]).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </NativeSelectField>
                </NativeSelectRoot>
              )}
            />
          </Box>

          {/* Working moves fields */}
          {attemptType === 'working' && cruxAnnotations.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Cruxes worked on</Text>
              <Controller
                name="workedCruxIds"
                control={control}
                render={({ field }) => (
                  <HStack flexWrap="wrap" gap={2}>
                    {cruxAnnotations.map((a) => {
                      const selected = (field.value ?? []).includes(a.id)
                      return (
                        <Button
                          key={a.id}
                          size="sm"
                          variant={selected ? 'solid' : 'outline'}
                          colorScheme={selected ? 'red' : 'gray'}
                          onClick={() => {
                            const next = selected ? (field.value ?? []).filter((id) => id !== a.id) : [...(field.value ?? []), a.id]
                            field.onChange(next)
                          }}
                        >
                          {a.name}
                        </Button>
                      )
                    })}
                  </HStack>
                )}
              />
            </Box>
          )}

          {/* Working: repeated cruxes (only cruxes that were worked on) */}
          {attemptType === 'working' && workedCruxIds.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Repeated cruxes (can do 3x in a row?)</Text>
              <Controller
                name="repeatedCruxIds"
                control={control}
                render={({ field }) => (
                  <HStack flexWrap="wrap" gap={2}>
                    {cruxAnnotations
                      .filter((a) => workedCruxIds.includes(a.id))
                      .map((a) => {
                        const selected = (field.value ?? []).includes(a.id)
                        return (
                          <Button
                            key={a.id}
                            size="sm"
                            variant={selected ? 'solid' : 'outline'}
                            colorScheme={selected ? 'green' : 'gray'}
                            onClick={() => {
                              const next = selected ? (field.value ?? []).filter((id) => id !== a.id) : [...(field.value ?? []), a.id]
                              field.onChange(next)
                            }}
                          >
                            {a.name}
                          </Button>
                        )
                      })}
                  </HStack>
                )}
              />
            </Box>
          )}

          {/* Working: was productive */}
          {attemptType === 'working' && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Was the session productive?</Text>
              <Controller
                name="wasProductive"
                control={control}
                render={({ field }) => (
                  <HStack gap={2}>
                    <Button size="sm" variant={field.value ? 'solid' : 'outline'} colorScheme={field.value ? 'green' : 'gray'} onClick={() => field.onChange(true)}>
                      Yes
                    </Button>
                    <Button size="sm" variant={!field.value ? 'solid' : 'outline'} colorScheme={!field.value ? 'red' : 'gray'} onClick={() => field.onChange(false)}>
                      No
                    </Button>
                  </HStack>
                )}
              />
            </Box>
          )}

          {/* Linking: from/to annotation selects */}
          {attemptType === 'linking' && sortedAnnotations.length >= 2 && (
            <HStack gap={4} align="flex-start" flexWrap="wrap">
              <Box flex={1} minW="140px">
                <Text fontSize="sm" fontWeight="medium" mb={2}>From</Text>
                <Controller
                  name="fromAnnotationId"
                  control={control}
                  render={({ field }) => (
                    <NativeSelectRoot size="md">
                      <NativeSelectField value={field.value ?? ''} onChange={field.onChange}>
                        <option value="">Select annotation</option>
                        {sortedAnnotations.map((a) => (
                          <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                        ))}
                      </NativeSelectField>
                    </NativeSelectRoot>
                  )}
                />
              </Box>
              <Box flex={1} minW="140px">
                <Text fontSize="sm" fontWeight="medium" mb={2}>To</Text>
                <Controller
                  name="toAnnotationId"
                  control={control}
                  render={({ field }) => (
                    <NativeSelectRoot size="md">
                      <NativeSelectField value={field.value ?? ''} onChange={field.onChange}>
                        <option value="">Select annotation</option>
                        {sortedAnnotations.map((a) => (
                          <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                        ))}
                      </NativeSelectField>
                    </NativeSelectRoot>
                  )}
                />
              </Box>
            </HStack>
          )}

          {/* Lowpoint: start annotation + success */}
          {attemptType === 'lowpoint' && (
            <>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>Starting from</Text>
                <Controller
                  name="startAnnotationId"
                  control={control}
                  render={({ field }) => (
                    <NativeSelectRoot size="md">
                      <NativeSelectField value={field.value ?? ''} onChange={field.onChange}>
                        <option value="">Select annotation</option>
                        {sortedAnnotations.map((a) => (
                          <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                        ))}
                      </NativeSelectField>
                    </NativeSelectRoot>
                  )}
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>Successful low-point?</Text>
                <Controller
                  name="lowpointSuccess"
                  control={control}
                  render={({ field }) => (
                    <HStack gap={2}>
                      <Button size="sm" variant={field.value ? 'solid' : 'outline'} colorScheme={field.value ? 'green' : 'gray'} onClick={() => field.onChange(true)}>
                        Yes
                      </Button>
                      <Button size="sm" variant={!field.value ? 'solid' : 'outline'} colorScheme={!field.value ? 'red' : 'gray'} onClick={() => field.onChange(false)}>
                        No
                      </Button>
                    </HStack>
                  )}
                />
              </Box>
            </>
          )}

          {/* Redpoint/lowpoint effort fields */}
          {(attemptType === 'redpoint' || attemptType === 'lowpoint') && (
            <HStack gap={4} align="flex-start" flexWrap="wrap">
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>Effort (1-10)</Text>
                <Controller
                  name="perceivedEffort"
                  control={control}
                  render={({ field }) => (
                    <RatingButtons value={field.value} onChange={field.onChange} max={10} colorScheme="orange" />
                  )}
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>Pump (1-10)</Text>
                <Controller
                  name="pumpRating"
                  control={control}
                  render={({ field }) => (
                    <RatingButtons value={field.value} onChange={field.onChange} max={10} colorScheme="red" />
                  )}
                />
              </Box>
            </HStack>
          )}

          {/* Redpoint: highest point reached */}
          {attemptType === 'redpoint' && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Highest point reached</Text>
              <Controller
                name="highestPointId"
                control={control}
                render={({ field }) => (
                  <NativeSelectRoot size="md">
                    <NativeSelectField value={field.value ?? ''} onChange={field.onChange}>
                      <option value="">Select annotation</option>
                      {sortedAnnotations.map((a) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                )}
              />
            </Box>
          )}

          {/* Sent? */}
          {attemptType === 'redpoint' && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Did you send?</Text>
              <Controller
                name="sent"
                control={control}
                render={({ field }) => (
                  <HStack gap={2}>
                    <Button size="sm" variant={field.value ? 'solid' : 'outline'} colorScheme={field.value ? 'green' : 'gray'} onClick={() => field.onChange(true)}>
                      Yes! 🎉
                    </Button>
                    <Button size="sm" variant={!field.value ? 'solid' : 'outline'} colorScheme={!field.value ? 'gray' : 'gray'} onClick={() => field.onChange(false)}>
                      Not yet
                    </Button>
                  </HStack>
                )}
              />
              {sent && (
                <Box mt={2} p={3} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                  <Text fontSize="sm" color="green.700" fontWeight="medium">
                    Congratulations on the send!
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {/* Notes */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>Notes</Text>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea {...field} placeholder="What did you learn? What felt different?" rows={3} />
              )}
            />
          </Box>

          <HStack justify="flex-end" gap={3} pt={2}>
            <Button variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit" colorScheme="blue" disabled={!isValid}>
              {isEditing ? 'Update Session' : 'Save Session'}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  )
}
