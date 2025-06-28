import { z } from 'zod'

export const soilProfileSchema = z.object({
  id: z.string().optional(),
  createdAt: z.string().optional(),
  profileName: z.string().optional(),
  pileStickOut: z.coerce.number().gte(0, { message: "Pile Stick Out is required" }),
  pileLength: z.coerce.number().gt(0, { message: "Pile Length is required" }),
  waterDepth: z.coerce.number().gt(0, { message: "Water Depth is required" }),
}).refine(
    (data) => data.profileName === undefined || data.profileName.length <= 20,
    {
      path: ['profileName'],
      message: "Name must be less than 20 characters long"
    }
  )

export type TsoilProfileSchema = z.infer<typeof soilProfileSchema>