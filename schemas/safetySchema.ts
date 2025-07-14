import { z } from "zod"

export const safetySchema = z.object({
	id: z.string().optional(),
	permanentActions: z.coerce.number().gt(0, { message: "Permanent actions must be greater than 0" }),
	variableActions: z.coerce.number().gt(0, { message: "Variable actions must be greater than 0" }),
	gammaG1: z.coerce.number().gt(0, { message: "Safety factor (yG) must be at least 0.1kN" }),
	gammaQ1: z.coerce.number().gt(0, { message: "Safety factor (yQ) must be at least 0.1kN" }),
	gammaS1: z.coerce.number().gt(0, { message: "Safety factor (yS) must be at least 0.1kN" }),
	gammaB1: z.coerce.number().gt(0, { message: "Safety factor (yB) must be at least 0.1kN" }),
	gammaG2: z.coerce.number().gt(0, { message: "Safety factor (yG) must be at least 0.1kN" }),
	gammaQ2: z.coerce.number().gt(0, { message: "Safety factor (yQ) must be at least 0.1kN" }),
	gammaS2: z.coerce.number().gt(0, { message: "Safety factor (yS) must be at least 0.1kN" }),
	gammaB2: z.coerce.number().gt(0, { message: "Safety factor (yB) must be at least 0.1kN" }),
	combination1: z.coerce.number().nullish(),
	combination2: z.coerce.number().nullish(),
})

export type TsafetySchema = z.infer<typeof safetySchema>
