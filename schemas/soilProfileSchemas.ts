import { z } from 'zod'

//insert soil profile schema
export const insertSoilProfileSchema = z.object({
  profile_name: z.string().optional(),
  pile_stick_out: z.coerce.number().gte(0, { message: "Pile Stick Out is required" }),
  pile_length: z.coerce.number().gt(0, { message: "Pile Length is required" }),
  water_depth: z.coerce.number().gt(0, { message: "Water Depth is required" }),
}).refine(
    (data) => data.profile_name === undefined || data.profile_name.length <= 20,
    {
      path: ['profile_name'],
      message: "Profile Name must be less than 20 characters long"
    }
  ).refine(
    (data) => data.pile_stick_out < data.pile_length,
    {
      path: ['pile_stick_out'], 
      message: "Pile stick out must be less than pile length",
    }
  )
export type TinsertSoilProfileSchema = z.infer<typeof insertSoilProfileSchema>

//configuration page schema
export const configSoilProfileSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  profile_name: z.string().optional(),
})
export type TconfigSoilProfileSchema = z.infer<typeof configSoilProfileSchema>