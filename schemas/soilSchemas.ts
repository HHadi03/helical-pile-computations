import * as z from "zod"

//insert soil schema
export const insertSoilSchema = z.object({
  soil_type: z.enum(["coarse", "fine", "manmade"], { message: "Please select soil type" }),
  density: z.enum(["loose", "dense"], { message: "Please select soil density" }),
  soil: z.string().min(1, { message: "Please select a soil" }),
  soil_name: z.string().optional(),
  description: z.string().optional(),
  colour: z.string(),
  start_depth: z.coerce.number().gte(0, { message: "Start Depth is required" }),
  end_depth: z.coerce.number().gt(0,{ message: "End Depth is required"}).transform((val) => Number(val.toFixed(1))),
  n_value: z.coerce.number().gt(0, { message: "SPT N-Value is required" }),
  y_moist: z.coerce.number().gt(0, { message: "Moist Unit Weight is required" }),
  y_sat: z.coerce.number().gt(0, { message: "Sat Unit Weight is required" }),
}).refine(
    (data) => data.end_depth > data.start_depth,
    {
      path: ['end_depth'], 
      message: "End Depth must be greater than Start Depth",
    }
  ).refine(
    (data) => data.soil_name === undefined || data.soil_name.length <= 30,
    {
      path: ['soil_name'],
      message: "Name must be less than 30 characters long"
    }
  )
  .refine(
    (data) => data.description === undefined || data.description.length <= 60,
    {
      path: ['description'],
      message: "Description must be less than 60 characters long"
    }
  )
export type TinsertSoilSchema = z.infer<typeof insertSoilSchema>

//edit soil information schema
export const editSoilInformationSchema = z.object({
  soil_type: z.enum(["coarse", "fine", "manmade"], { message: "Please select a soil type" }),
  density: z.enum(["loose", "dense"], { message: "Please select soil density" }),
  soil: z.string().min(1, { message: "Please select a soil" }),
  soil_name: z.string().optional(),
  description: z.string().optional(),
  colour: z.string(),
}).refine(
    (data) => data.soil_name === undefined || data.soil_name.length <= 30,
    {
      path: ['soil_name'],
      message: "Name must be less than 30 characters long"
    }
  )
  .refine(
    (data) => data.description === undefined || data.description.length <= 60,
    {
      path: ['description'],
      message: "Description must be less than 60 characters long"
    }
  )
export type TeditSoilInformationSchema = z.infer<typeof editSoilInformationSchema>

//edit soil parameters schema
export const editSoilParametersSchema = z.object({
  start_depth: z.coerce.number().gte(0, { message: "Start Depth is required" }),
  end_depth: z.coerce.number().gt(0,{ message: "End Depth is required"}).transform((val) => Number(val.toFixed(1))),
  n_value: z.coerce.number().gt(0, { message: "SPT N-Value is required" }),
  y_moist: z.coerce.number().gt(0, { message: "Moist Unit Weight is required" }),
  y_sat: z.coerce.number().gt(0, { message: "Sat Unit Weight is required" }),
  soil_profile_id: z.uuid().optional(),
  soil_type: z.string().optional(),
  soil: z.string().optional(),
  soil_name: z.string().optional(),
}).refine(
    (data) => data.end_depth > data.start_depth,
    {
      path: ['end_depth'], 
      message: "End Depth must be greater than Start Depth",
    }
  )
export type TeditSoilParametersSchema = z.infer<typeof editSoilParametersSchema>

//edit soil engineered schema
export const editSoilEngineeredSchema = z.object({
  soil_type: z.string().optional(),
  su: z.coerce.number().nullish(),
  t: z.coerce.number().nullish(),
  angle: z.coerce.number().nullish(),
  qult: z.coerce.number().gt(0, { message: "Bearing Pressure is required" })
})
.refine(
  (data) => data.su === undefined || data.su === null || data.su > 0,
  {
    path: ['su'],
    message: "Undrained Shear Soil Strength is required"
  }
)
.refine(
  (data) => data.t === undefined || data.t === null || data.t > 0,
  {
    path: ['t'],
    message: "Shear Soil Strength is required"
  }
)
.refine(
  (data) => data.angle === undefined || data.angle === null || (data.angle > 0 && data.angle < 46),
  {
    path: ['angle'],
    message: "Angle of Internal Friction is required / cannot be greater than 45°"
  }
)
export type TeditSoilEngineeredSchema = z.infer<typeof editSoilEngineeredSchema>

//calculations coarse soil schema
export const soilCalculationsSchema = z.object({
  start_depth: z.number(),
  end_depth: z.number(),
  n_value: z.number(),
  y_moist: z.number(),
  y_sat: z.number(),
})
export type TsoilCalculationsSchema = z.infer<typeof soilCalculationsSchema>

//calculations fine soil schema
export const fineSoilCalculationsSchema = z.object({
  start_depth: z.number(),
  end_depth: z.number(),
  n_value: z.number(),
})
export type TfineSoilCalculationsSchema = z.infer<typeof fineSoilCalculationsSchema>

//configuration page schema
export const configSoilSchema = z.object({
  id: z.uuid(),
  soil_profile_id: z.uuid(),
  soil_type: z.enum(["coarse", "fine", "manmade"]),
  density: z.enum(["loose", "dense"]),
  soil: z.string(),
  soil_name: z.string().optional(),
  description: z.string().optional(),
  start_depth: z.number(),
  end_depth: z.number(),
  n_value: z.number(),
  y_moist: z.number(),
  y_sat: z.number(),
})
export type TconfigSoilSchema = z.infer<typeof configSoilSchema>

//overview page schema
export const overviewSoilSchema = z.object({
  id: z.uuid(),
  soil_profile_id: z.uuid(),
  soil: z.string(),
  soil_name: z.string().optional(),
  description: z.string().optional(),
  soil_type: z.enum(["coarse", "fine", "manmade"]),
  colour: z.string(),
  start_depth: z.number(),
  end_depth: z.number(),
  n_value: z.number(),
  y_moist: z.number(),
  y_sat: z.number(),
  h: z.number(),
  su: z.number(),
  t: z.number(),
  shaft_capacity60: z.number(),
  shaft_capacity100: z.number(),
  bearing_capacity60: z.number(),
  bearing_capacity100: z.number(),
})
export type ToverviewSoilSchema = z.infer<typeof overviewSoilSchema>