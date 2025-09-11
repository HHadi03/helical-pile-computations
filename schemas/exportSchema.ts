import * as z from "zod"

export const exportFormSchema = z.object({
	job_number: z.string().optional(),
  job_location: z.string().optional(), 
  pile_number: z.string().optional(),
  soil_profile_id: z.uuid("Soil Profile is required"),
  pile_diameter: z.enum(["60", "100"], { error: "Pile Diameter is required" }),
  additional_information: z.string().optional(),
  safety_design_method: z.enum(["method_bs", "method_en", "method_test"], { error: "Please select a safety design method" }),
  country: z.enum(["uk", "pl", "nl"]).optional(),
  applied_load: z.coerce.number().optional(),
  permanent_actions: z.coerce.number().optional(),
  variable_actions: z.coerce.number().optional(),
  structure_rigid: z.boolean().optional(),
  use_characteristic: z.boolean().optional(),
  number_of_tests: z.coerce.number().optional(),
  mean_rcm: z.coerce.number().optional(),
  min_rcm: z.coerce.number().optional(),
  global_safety_factor: z.coerce.number(),
  uk_safety_factor_tension_yG1: z.coerce.number(),
  uk_safety_factor_tension_yQ1: z.coerce.number(),
  uk_safety_factor_tension_yT1: z.coerce.number(),
  uk_safety_factor_tension_yG2: z.coerce.number(),
  uk_safety_factor_tension_yQ2: z.coerce.number(),
  uk_safety_factor_tension_yT2: z.coerce.number(),
  uk_safety_factor_compression_yG1: z.coerce.number(),
  uk_safety_factor_compression_yQ1: z.coerce.number(),
  uk_safety_factor_compression_yT1: z.coerce.number(),
  uk_safety_factor_compression_yG2: z.coerce.number(),
  uk_safety_factor_compression_yQ2: z.coerce.number(),
  uk_safety_factor_compression_yT2: z.coerce.number(),
  pl_safety_factor_tension_yG: z.coerce.number(),
  pl_safety_factor_tension_yQ: z.coerce.number(),
  pl_safety_factor_tension_yT: z.coerce.number(),
  pl_safety_factor_compression_yG: z.coerce.number(),
  pl_safety_factor_compression_yQ: z.coerce.number(),
  pl_safety_factor_compression_yT: z.coerce.number(),
  nl_safety_factor_tension_yG: z.coerce.number(),
  nl_safety_factor_tension_yQ: z.coerce.number(),
  nl_safety_factor_tension_yT: z.coerce.number(),
  nl_safety_factor_compression_yG: z.coerce.number(),
  nl_safety_factor_compression_yQ: z.coerce.number(),
  nl_safety_factor_compression_yT: z.coerce.number()
}).refine(
  (data) => data.additional_information === undefined || data.additional_information.length <= 200,
  {
    path: ["additional_information"],
    error: "Additional Information must be less than 200 characters long",
  }
)

export type TexportFormSchema = z.infer<typeof exportFormSchema>
