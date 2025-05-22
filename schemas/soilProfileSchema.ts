import { z } from 'zod'

export const soilProfileSchema = z.object({
  id: z.string().optional(),
  createdAt: z.string().optional(),
  profileName: z.string().optional(),
  pileLength: z.coerce.number().min(1, { message: "Pile length must be greater than 0m" }),
  pileStickOut: z.coerce.number().min(0, { message: "Pile stick out must be greater than or equal to 0m" }),
  waterDepth: z.coerce.number().min(1, { message: "Water depth must be greater than 0m" }),
})

export type TsoilProfileSchema = z.infer<typeof soilProfileSchema>