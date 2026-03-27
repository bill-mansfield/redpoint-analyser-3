import { z } from 'zod'

export const formSchema = z
  .object({
    type: z.enum(['crux', 'rest']),
    name: z
      .string()
      .min(1, 'Name is required')
      .max(50, 'Name must be 50 characters or less')
      .refine((val) => val.trim().length > 0, 'Name is required'),
    sectionName: z.string().max(50, 'Section name must be 50 characters or less').optional(),
    difficultyRating: z.number().min(1).max(5).optional(),
    restQuality: z.number().min(1).max(5).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'crux' && (data.difficultyRating === undefined || data.difficultyRating === null)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Difficulty rating is required for cruxes',
        path: ['difficultyRating'],
      })
    }
    if (data.type === 'rest' && (data.restQuality === undefined || data.restQuality === null)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Rest quality is required for rests',
        path: ['restQuality'],
      })
    }
  })

export type FormData = z.infer<typeof formSchema>
