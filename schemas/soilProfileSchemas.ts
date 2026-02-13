import * as z from "zod"
import { roundToOneDecimal } from "@/lib/utils"

//configuration soil profile schema
export const configSoilProfileSchema = z.object({
  id: z.uuid(),
  profile_name: z.string().optional(),
})
export type TconfigSoilProfileSchema = z.infer<typeof configSoilProfileSchema>


//overview soil profile schema
export const overviewSoilProfileSchema = z.object({
  id: z.uuid(),
  profile_name: z.string().optional(),
  pile_stick_out: z.number(),
  effective_pile_length: z.number(),
  water_depth: z.number(),
})
export type ToverviewSoilProfileSchema = z.infer<typeof overviewSoilProfileSchema>


//visualisation soil profile schema
export const visualisationSoilProfileSchema = z.object({
  id: z.uuid(),
  profile_name: z.string().optional(),
  effective_pile_length: z.number(),
})
export type TvisualisationSoilProfileSchema = z.infer<typeof visualisationSoilProfileSchema>


//selections soil profile schema
export const selectionsSchema = z.object({
  id: z.uuid(),
  soil_profile_id: z.uuid(),
  pile_diameter: z.number(),
  colour: z.string(),
  stroke_width: z.number(),
})
export type TselectionsSchema = z.infer<typeof selectionsSchema>


//export soil profile schema
export const exportSoilProfileSchema = z.object({
  id: z.uuid(),
  profile_name: z.string().optional(),
  effective_pile_length: z.number(),
  water_depth: z.number(),
  pile_stick_out: z.number(),
})
export type TexportSoilProfileSchema = z.infer<typeof exportSoilProfileSchema>


//insert soil profile schema
export const insertSoilProfileSchema = z.object({
  profile_name: z.string().max(45, { error: "Name must be less than 45 characters long" }).optional(),
  pile_stick_out: z.preprocess((val) => val === "" ? undefined : val, z.coerce.number().min(0.05, { error: "Pile Stick Out is required" }).transform((val) => Number(roundToOneDecimal(val))).default(0.1)),
  pile_length: z.coerce.number().min(0.05, { error: "Pile Length is required" }).transform((val) => Number(roundToOneDecimal(val))),
  water_depth: z.coerce.number().min(0.05, { error: "Water Depth is required" }).transform((val) => Number(roundToOneDecimal(val))),
})
.refine(
  (data) => data.pile_stick_out < data.pile_length,
  {
    path: ['pile_stick_out'],
    error: "Pile Stick Out must be less than Pile Length",
  }
)
export type TinsertSoilProfileSchema = z.infer<typeof insertSoilProfileSchema>
