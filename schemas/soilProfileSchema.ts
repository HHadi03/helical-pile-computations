import { z } from 'zod'

export const soilProfileSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  userId: z.string()
})

export type TsoilProfileSchema = z.infer<typeof soilProfileSchema>