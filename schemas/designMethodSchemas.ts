import { z } from "zod"

export const insertDesignMethodSchema = z.object({
	job_number: z.string().min(1, "Job number is required"),
  job_location: z.string().min(1, "Job location is required"), 
  pile_number: z.string().min(1, "Pile number is required"),
  additional_information: z.string().optional(),
	safety_design_method: z.enum(["method_bs", "method_en", "method_test"], { message: "Please select a safety design method" }),
	soil_configuration: z.string().optional(),
	pile_diameter: z.enum(["60", "100"]).optional(),
	applied_load: z.coerce.number().optional(),
	permanent_actions: z.coerce.number().optional(),
	variable_actions: z.coerce.number().optional(),
	structure_rigid: z.boolean().optional(),
	use_characteristic: z.boolean().optional(),
	number_of_tests: z.coerce.number().optional(),
	mean_rcal: z.coerce.number().optional(),
	min_rcal: z.coerce.number().optional(),
	country: z.enum(["uk", "pl", "nl"]).optional(),
	safety_factor_1: z.coerce.number().optional(),
}).refine((data) => {
  // Add conditional validation based on selected method
  if (data.safety_design_method === "method_bs") {
    return data.soil_configuration && data.pile_diameter && 
           data.applied_load !== undefined && data.safety_factor_1 !== undefined
  }
  if (data.safety_design_method === "method_en") {
    return data.soil_configuration && data.pile_diameter && data.country &&
           data.permanent_actions !== undefined && data.variable_actions !== undefined
  }
  if (data.safety_design_method === "method_test") {
    return data.country && data.number_of_tests !== undefined &&
           data.permanent_actions !== undefined && data.variable_actions !== undefined &&
           data.min_rcal !== undefined && data.mean_rcal !== undefined
  }
  return true
}, {
  message: "Please fill in all required fields for the selected method"
})

export type TinsertDesignMethodSchema = z.infer<typeof insertDesignMethodSchema>

// 12 factors for Uk, 6 for poland, 6 for netherlands. for method 2 and 3. method 1 only 1 safety factor