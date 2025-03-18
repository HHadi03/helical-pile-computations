import { z } from 'zod'

const soilIdentificationSchema = z.object({
  id: z.string().optional(),
  soilType: z.enum(["coarse", "fine", "manmade"], { message: "Please select a soil type" }),
  density: z.enum(["loose", "dense"], { message: "Please select soil density" }),
  soil: z.string().min(1, { message: "Please select a soil" }),
  soilName: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
})

const soilParametersSchema = z.object({
  startDepth: z.coerce.number().gte(0, { message: "Start depth must be greater than or equal to 0" }).default(0),
  endDepth: z.coerce.number({ message: "End depth is required"}).default(0),
  nValue: z.coerce.number().gte(1, { message: "SPT N-Value is required" }).default(0),
  yMoist: z.coerce.number().gte(1, { message: "YMoist is required" }),
  ySat: z.coerce.number().gte(1, { message: "YSat is required" }),
})

const soilEngineeringPropsSchema = z.object({
  po: z.coerce.number().optional(),
  angle: z.coerce.number().optional(),
  ko: z.coerce.number().optional(),
  t: z.coerce.number().optional(),
  qult: z.coerce.number().optional(),
  su: z.coerce.number().optional(),
  h: z.coerce.number().optional()
})

const soilResultsSchema = z.object({
  shaftCapacity: z.number().optional(),
  bearingCapacity: z.number().optional(),
})

export const soilSchema = soilIdentificationSchema
  .merge(soilParametersSchema)
  .merge(soilEngineeringPropsSchema)
  .merge(soilResultsSchema)
  .refine(
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
    (data) => data.su === undefined || data.su >= 1,
    {
      path: ['Su'],
      message: "Su is required"
    }
  )
  .refine(
    (data) => data.qult === undefined || data.qult >= 1,
    {
      path: ['Qult'],
      message: "Qult is required"
    }
  )
  .refine(
    (data) => data.angle === undefined || data.angle >= 1,
    {
      path: ['Angle'],
      message: "Angle is required"
    }
  )
  .refine(
    (data) => data.t === undefined || data.t >= 1,
    {
      path: ['T'],
      message: "T is required"
    }
  )

export type TsoilSchema = z.infer<typeof soilSchema>


