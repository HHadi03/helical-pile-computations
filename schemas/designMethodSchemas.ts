import { z } from "zod"

export const insertDesignMethodSchema = z.object({
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
})

export type TinsertDesignMethodSchema = z.infer<typeof insertDesignMethodSchema>
