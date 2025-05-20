import { z } from "zod"

export const pileSchema = z.object({
  id: z.string().optional(),
  pileDiameter: z.enum(["60", "100"], { message: "Please select a pile diameter" }),
  pileLength: z.coerce.number().min(0.1, { message: "Pile length must be at least 0.1m" }),
  pileStickout: z.coerce.number().min(0, { message: "Pile stick out must be at least 0m" }),
  waterDepth: z.coerce.number().gt(0, { message: "Water depth must be greater than 0" }),
  showBearingCapacity: z.boolean().default(true),
})

export type TpileSchema = z.infer<typeof pileSchema>
