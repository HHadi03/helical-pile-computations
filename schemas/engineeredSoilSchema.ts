import { z } from 'zod'

export const engineeredSoilSchema = z.object({
  id: z.string().optional(),
  soilProfileId: z.string().optional(),
  soilType: z.enum(["coarse", "fine", "manmade"]).optional(),
  soil: z.string().optional(),
  soilName: z.string().optional(),
  startDepth: z.coerce.number().optional(),
  endDepth: z.coerce.number().optional(),
  h: z.coerce.number().optional(),
  su: z.coerce.number().nullish(),
  t: z.coerce.number().nullish(),
  po: z.coerce.number().nullish(),
  angle: z.coerce.number().nullish(),
  qult: z.coerce.number().gt(0, { message: "Bearing Pressure is required" })
})
.refine(
  (data) => data.su === undefined || data.su === null || data.su > 0,
  {
    path: ['su'],
    message: "Undrained Shear Soil Strength is required"
  }
)
.refine(
  (data) => data.t === undefined || data.t === null || data.t > 0,
  {
    path: ['t'],
    message: "Shear Soil Strength is required"
  }
)
.refine(
  (data) => data.angle === undefined || data.angle === null || data.angle > 0,
  {
    path: ['angle'],
    message: "Angle of Internal Friction is required"
  }
)

export type TEngineeredSoilSchema = z.infer<typeof engineeredSoilSchema>

