import { z } from "zod"

export const pileSchema = z.object({
  id: z.coerce.number().int().positive(),
  pileDiameter: z.enum(["60", "100"], { message: "Please select a pile diameter" }),
  pileLength: z.coerce.number().min(1, { message: "Pile length must be at least 1m" }),
  stickUp: z.coerce.number().min(0, { message: "Stick up must be greater than or equal to 0" }),
  waterDepth: z.coerce.number().min(0, { message: "Water depth must be greater than or equal to 0" }),
})

export type TpileSchema = z.infer<typeof pileSchema>
