import { z } from 'zod'

export const soilSchema = z.object({
  id: z.string().optional(),
  soilProfileId: z.string().optional(),
  soilType: z.enum(["coarse", "fine", "manmade"], { message: "Please select a soil type" }),
  density: z.enum(["loose", "dense"], { message: "Please select soil density" }),
  soil: z.string().min(1, { message: "Please select a soil" }),
  soilName: z.string().optional(),
  description: z.string().optional(),
  color: z.string(),
  startDepth: z.coerce.number().gte(0, { message: "Start Depth is required" }),
  endDepth: z.coerce.number().gt(0,{ message: "End Depth is required"}),
  nValue: z.coerce.number().gt(0, { message: "SPT N-Value is required" }),
  yMoist: z.coerce.number().gt(0, { message: "γMoist is required" }),
  ySat: z.coerce.number().gt(0, { message: "γSat is required" }),
  po: z.coerce.number().nullish(),
  ko: z.coerce.number().nullish(),
  angle: z.coerce.number().nullish(),
  t: z.coerce.number().nullish(),
  su: z.coerce.number().nullish(),
  h: z.coerce.number().optional(),
  qult: z.coerce.number().optional(),
  shaftCapacity60: z.coerce.number().optional(),
  shaftCapacity100: z.coerce.number().optional(),
  bearingCapacity60: z.coerce.number().optional(),
  bearingCapacity100: z.coerce.number().optional(),
}).refine(
    (data) => data.endDepth > data.startDepth,
    {
      path: ['endDepth'], 
      message: "End Depth must be greater than Start Depth",
    }
  ).refine(
    (data) => data.soilName === undefined || data.soilName.length <= 15,
    {
      path: ['soilName'],
      message: "Name must be less than 15 characters long"
    }
  )
  .refine(
    (data) => data.description === undefined || data.description.length <= 75,
    {
      path: ['description'],
      message: "Description must be less than 75 characters long"
    }
  )
  .refine(
    (data) => data.su === undefined || data.su === null || data.su > 0,
    {
      path: ['su'],
      message: "Su is required"
    }
  )
  .refine(
    (data) => data.t === undefined || data.t === null || data.t > 0,
    {
      path: ['t'],
      message: "T is required"
    }
  )
  .refine(
    (data) => data.angle === undefined || data.angle === null || data.angle > 0,
    {
      path: ['angle'],
      message: "φ is required"
    }
  )
   .refine(
    (data) => data.qult === undefined || data.qult === null || data.qult > 0,
    {
      path: ['qult'],
      message: "Qult is required"
    }
  )
   
export type TsoilSchema = z.infer<typeof soilSchema>


