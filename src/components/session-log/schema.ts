import { z } from 'zod'

export const sessionFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  sessionRating: z.number().min(1).max(5),
  morePsyched: z.boolean(),
  attemptType: z.enum(['working', 'linking', 'lowpoint', 'redpoint']),
  // working attempts
  workedCruxIds: z.array(z.string()).optional(),
  wasProductive: z.boolean().optional(),
  repeatedCruxIds: z.array(z.string()).optional(),
  // linking attempts
  fromAnnotationId: z.string().optional(),
  toAnnotationId: z.string().optional(),
  // lowpoint attempts
  startAnnotationId: z.string().optional(),
  lowpointSuccess: z.boolean().optional(),
  // redpoint attempts
  highestPointId: z.string().optional(),
  perceivedEffort: z.number().min(1).max(10).optional(),
  pumpRating: z.number().min(1).max(10).optional(),
  sent: z.boolean().optional(),
  notes: z.string().optional(),
})

export type SessionFormData = z.infer<typeof sessionFormSchema>
