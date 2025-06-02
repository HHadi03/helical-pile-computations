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
  startDepth: z.coerce.number().gte(0, { message: "Start depth must be greater than or equal to 0m" }).default(0),
  endDepth: z.coerce.number({ message: "End depth is required"}).default(0),
  nValue: z.coerce.number().gte(1, { message: "SPT N-Value is required" }).default(0),
  yMoist: z.coerce.number().gte(1, { message: "YMoist is required" }),
  ySat: z.coerce.number().gte(1, { message: "YSat is required" }),
  po: z.coerce.number().nullish(),
  ko: z.coerce.number().nullish(),
  angle: z.coerce.number().nullish(),
  t: z.coerce.number().nullish(),
  su: z.coerce.number().nullish(),
  h: z.coerce.number().optional(),
  qult: z.coerce.number().optional(),
  shaftCapacity60: z.coerce.number().nullish(),
  shaftCapacity100: z.coerce.number().nullish(),
  bearingCapacity60: z.coerce.number().nullish(),
  bearingCapacity100: z.coerce.number().nullish(),
}).refine(
    (data) => data.endDepth > data.startDepth,
    {
      path: ['endDepth'], 
      message: "End depth must be greater than start depth",
    }
  )
  .refine(
    (data) => data.description === undefined || data.description.length <= 125,
    {
      path: ['description'],
      message: "Description must be less than 125 characters long"
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
      message: "Angle is required"
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


