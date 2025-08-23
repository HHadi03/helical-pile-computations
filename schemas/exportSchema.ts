import * as z from "zod"

export const exportFormSchema = z.object({
	job_number: z.string().min(1, "Job Number is required"),
  job_location: z.string().min(1, "Job Location is required"), 
  pile_number: z.string().min(1, "Pile Number is required"),
  soil_profile: z.uuid("Soil Profile is required"),
  pile_diameter: z.string().min(1, "Pile Diameter is required"),
  additional_information: z.string().optional(),
}).refine(
  (data) => data.additional_information === undefined || data.additional_information.length <= 200,
  {
    path: ["additional_information"],
    message: "Additional Information must be less than 200 characters long",
  }
)
export type TexportFormSchema = z.infer<typeof exportFormSchema>
