import { z } from 'zod'

export const soilProfileSchema = z.object({
  id: z.string().optional(),
  createdAt: z.string().optional(),
  profileName: z.string().optional(),
  pileStickOut: z.coerce.number().gte(0, { message: "Pile stick out must be greater than or equal to 0m" }),
  pileLength: z.coerce.number().gt(0, { message: "Pile length must be greater than 0m" }),
  waterDepth: z.coerce.number().gt(0, { message: "Water depth must be greater than 0m" }),
})

export type TsoilProfileSchema = z.infer<typeof soilProfileSchema>