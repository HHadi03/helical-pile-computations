import * as z from "zod"

//insert soil profile schema
export const insertSoilProfileSchema = z.object({
  profile_name: z.string().optional(),
  pile_stick_out: z.coerce.number().gt(0, { error: "Pile Stick Out is required" }).transform((val) => Number(val.toFixed(1))),
  pile_length: z.coerce.number().gt(0, { error: "Pile Length is required" }).transform((val) => Number(val.toFixed(1))),
  water_depth: z.coerce.number().gt(0, { error: "Water Depth is required" }).transform((val) => Number(val.toFixed(1))),
}).refine(
    (data) => data.profile_name === undefined || data.profile_name.length <= 45,
    {
      path: ['profile_name'],
      error: "Name must be less than 45 characters long"
    }
  ).refine(
    (data) => data.pile_stick_out < data.pile_length,
    {
      path: ['pile_stick_out'],
      error: "Pile Stick Out must be less than Pile Length",
    }
  )
export type TinsertSoilProfileSchema = z.infer<typeof insertSoilProfileSchema>

//configuration page schema
export const configSoilProfileSchema = z.object({
  id: z.uuid(),
  profile_name: z.string().optional(),
})
export type TconfigSoilProfileSchema = z.infer<typeof configSoilProfileSchema>

//overview page schema
export const overviewSoilProfileSchema = z.object({
  id: z.uuid(),
  profile_name: z.string().optional(),
  pile_stick_out: z.number(),
  effective_pile_length: z.number(),
  water_depth: z.number(),
})
export type ToverviewSoilProfileSchema = z.infer<typeof overviewSoilProfileSchema>

//selections soil profile schema
export const selectionsSoilProfileSchema = z.object({
  id: z.uuid(),
  soil_profile_id: z.uuid(),
  pile_diameter: z.number(),
  colour: z.string().optional(),
  stroke_width: z.number().optional(),
})
export type TselectionsSoilProfileSchema = z.infer<typeof selectionsSoilProfileSchema>
