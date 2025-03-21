import { z } from "zod"

export const safetySchema = z.object({
	id: z.coerce.number().int().positive(),
	permanentActions: z.coerce.number().gt(0, { message: "Permanent actions must be greater than 0" }),
	variableActions: z.coerce.number().gt(0, { message: "Variable actions must be greater than 0" }),

	gammaG1: z.coerce.number().min(0.1, { message: "Safety factor (yG) must be at least 0.1kN" }).default(1.35),
	gammaQ1: z.coerce.number().min(0.1, { message: "Safety factor (yQ) must be at least 0.1kN" }).default(1.5),
	gammaS1: z.coerce.number().min(0.1, { message: "Safety factor (yS) must be at least 0.1kN" }).default(1.0),
	gammaB1: z.coerce.number().min(0.1, { message: "Safety factor (yB) must be at least 0.1kN" }).default(1.0),
	
	gammaG2: z.coerce.number().min(0.1, { message: "Safety factor (yG) must be at least 0.1kN" }).default(1.10),
	gammaQ2: z.coerce.number().min(0.1, { message: "Safety factor (yQ) must be at least 0.1kN" }).default(1.10),
	gammaS2: z.coerce.number().min(0.1, { message: "Safety factor (yS) must be at least 0.1kN" }).default(1.5),
	gammaB2: z.coerce.number().min(0.1, { message: "Safety factor (yB) must be at least 0.1kN" }).default(1.3),

	combination1: z.coerce.number().optional(),
	combination2: z.coerce.number().optional(),
})

export type TsafetySchema = z.infer<typeof safetySchema>
