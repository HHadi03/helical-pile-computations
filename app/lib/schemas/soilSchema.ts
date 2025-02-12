import { z } from 'zod'

export const soilSchema = z.object({
    id: z.string().optional(),
    soilType: z.enum(["coarse", "fine", "manmade"], { message: "Please select a soil type" }),
    density: z.enum(["loose", "dense"], { message: "Please select soil density" }),
    soil: z.string().min(1, { message: "Please select a soil" }),
    startDepth: z.coerce.number().gte(0, { message: "Start depth must be greater than or equal to 0" }).default(0),
    endDepth: z.coerce.number({ message: "End depth is required"}).default(0),
    nValue: z.coerce.number().gte(1, { message: "SPT N-Value is required" }).default(0),
    yMoist: z.coerce.number().gte(1, { message: "YMoist is required" }),
    ySat: z.coerce.number().gte(1, { message: "YSat is required" }),
    soilName: z.string().optional(),
    description: z.string().optional(),
    color: z.string().optional(),
    shaftCapacity: z.number().optional(),
    bearingCapacity: z.number().optional()
  }).refine(
    (data) => data.endDepth > data.startDepth,
    {
      path: ['endDepth'], 
      message: "End depth must be greater than start depth",
    }
  )
  
export type TsoilSchema = z.infer<typeof soilSchema>

