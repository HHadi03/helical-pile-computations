import { roundToOneDecimal } from "@/lib/utils"
import * as z from "zod"

//configuration soil schema
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
  test_type: z.string(),
  n_value: z.number(),
  y_moist: z.number(),
  y_sat: z.number(),
  kc: z.number(),
  qc: z.number(),
  qca: z.number(),
  a: z.number(),
})
export type TconfigSoilSchema = z.infer<typeof configSoilSchema>


//overview soil schema
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
  test_type: z.string(),
  n_value: z.number(),
  y_moist: z.number(),
  y_sat: z.number(),
  su: z.number(),
  t: z.number(),
  shaft_capacity60: z.number(),
  shaft_capacity100: z.number(),
  bearing_capacity60: z.number(),
  bearing_capacity100: z.number(),
  kc: z.number(),
  qc: z.number(),
  qca: z.number(),
  a: z.number(),
})
export type ToverviewSoilSchema = z.infer<typeof overviewSoilSchema>


//visualisation soil schema
export const visualisationSoilSchema = z.object({
  end_depth: z.number(),
  shaft_capacity60: z.number().optional(),
  bearing_capacity60: z.number().optional(),
  shaft_capacity100: z.number().optional(),
  bearing_capacity100: z.number().optional(),
})
export type TvisualisationSoilSchema = z.infer<typeof visualisationSoilSchema>


//export soil schema
export const exportSoilSchema = z.object({
  id: z.uuid(),
  soil: z.string(),
  soil_name: z.string().optional(),
  description: z.string().optional(),
  soil_type: z.enum(["coarse", "fine", "manmade"]),
  colour: z.string(),
  start_depth: z.number(),
  end_depth: z.number(),
  test_type: z.string(),
  n_value: z.number(),
  y_moist: z.number(),
  y_sat: z.number(),
  su: z.number(),
  qult: z.number(),
  t: z.number(),
  shaft_capacity60: z.number(),
  shaft_capacity100: z.number(),
  bearing_capacity60: z.number(),
  bearing_capacity100: z.number(),
  kc: z.number(),
  qc: z.number(),
  qca: z.number(),
  a: z.number(),
})
export type TexportSoilSchema = z.infer<typeof exportSoilSchema>


//insert soil schema
export const insertSoilSchema = z.object({
  soil_type: z.enum(["coarse", "fine", "manmade"], { error: "Please select soil type" }),
  density: z.enum(["loose", "dense"], { error: "Please select soil density" }),
  soil: z.string().min(1, { error: "Please select a soil" }),
  soil_name: z.string().max(30, { error: "Name must be less than 30 characters long" }).optional(),
  description: z.string().max(60, { error: "Description must be less than 60 characters long" }).optional(),
  colour: z.string(),
  start_depth: z.coerce.number().gte(0, { error: "Start Depth is required" }),
  end_depth: z.coerce.number().positive({ error: "End Depth is required" }).transform((val) => Number(roundToOneDecimal(val))),
  y_moist: z.coerce.number().positive({ error: "Moist Unit Weight is required" }),
  y_sat: z.coerce.number().positive({ error: "Sat Unit Weight is required" }),
  test_type: z.enum(["spt", "cpt"], { error: "Please select a test method" }),
  n_value: z.coerce.number(),
  qc: z.coerce.number(),
  a: z.coerce.number(),
  qca: z.coerce.number(),
  kc:z.coerce.number(),
})

.refine(
  (data) => data.end_depth > data.start_depth,
  {
    path: ['end_depth'], 
    error: "End Depth must be greater than Start Depth",
  }
)

.refine(
  (data) =>  data.test_type !== "spt" || data.n_value > 0,
  {
    path: ['n_value'],
    error: "SPT N-Value is required",
  }
)

.refine(
  (data) => data.test_type !== "cpt" || data.qc > 0,
  {
    path: ['qc'],
    error: "Cone Tip Resistance is required",
  }
)

.refine(
  (data) => data.test_type !== "cpt" || data.a > 0,
  {
    path: ['a'],
    error: "Alpha Required",
  }
)

// .refine(
//   (data) => data.test_type !== "cpt" || data.qca > 0,
//   {
//     path: ['qca'],
//     error: "Cone Tip Resistance is required",
//   }
// )

// .refine(
//   (data) => data.test_type !== "cpt" || data.kc > 0,
//   {
//     path: ['kc'],
//     error: "Bearing Required",
//   }
// )
export type TinsertSoilSchema = z.infer<typeof insertSoilSchema>


//edit soil information schema
export const editSoilInformationSchema = z.object({
  soil_type: z.enum(["coarse", "fine", "manmade"], { error: "Please select a soil type" }),
  density: z.enum(["loose", "dense"], { error: "Please select soil density" }),
  soil: z.string().min(1, { error: "Please select a soil" }),
  soil_name: z.string().max(30, { error: "Name must be less than 30 characters long" }).optional(),
  description: z.string().max(60, { error: "Description must be less than 60 characters long" }).optional(),
  colour: z.string(),
})
export type TeditSoilInformationSchema = z.infer<typeof editSoilInformationSchema>


//edit soil parameters schema
export const editSoilParametersSchema = z.object({
  start_depth: z.coerce.number().gte(0, { error: "Start Depth is required" }),
  end_depth: z.coerce.number().positive({ error: "End Depth is required"}).transform((val) => Number(roundToOneDecimal(val))),
  y_moist: z.coerce.number().positive({ error: "Moist Unit Weight is required" }),
  y_sat: z.coerce.number().positive({ error: "Sat Unit Weight is required" }),
  test_type: z.enum(["spt", "cpt"], { error: "Please select a test method" }),
  n_value: z.coerce.number(),
  qc: z.coerce.number(),
  qca: z.coerce.number(),
  kc: z.coerce.number(),
  a: z.coerce.number(),
  soil_profile_id: z.uuid(),
  soil_type: z.string(),
  soil: z.string(),
  soil_name: z.string().optional(),
})

.refine(
  (data) => data.end_depth > data.start_depth,
  {
    path: ['end_depth'], 
    error: "End Depth must be greater than Start Depth",
  }
)

.refine(
  (data) =>  data.test_type !== "spt" || data.n_value > 0,
  {
    path: ['n_value'],
    error: "SPT N-Value is required",
  }
)

.refine(
  (data) => data.test_type !== "cpt" || data.qc > 0,
  {
    path: ['qc'],
    error: "Cone Tip Resistance is required",
  }
)

.refine(
  (data) => data.test_type !== "cpt" || data.a > 0,
  {
    path: ['a'],
    error: "Alpha Required",
  }
)

// .refine(
//   (data) => data.test_type !== "cpt" || data.qca > 0,
//   {
//     path: ['qca'],
//     error: "Cone Tip Resistance is required",
//   }
// )

// .refine(
//   (data) => data.test_type !== "cpt" || data.kc > 0,
//   {
//     path: ['kc'],
//     error: "Bearing Required",
//   }
// )
export type TeditSoilParametersSchema = z.infer<typeof editSoilParametersSchema>


//edit soil engineered schema
export const editSoilEngineeredSchema = z.object({
  test_type: z.enum(["spt", "cpt"]),
  soil_type: z.string(),
  su: z.coerce.number().nullish(),
  t: z.coerce.number().nullish(),
  angle: z.coerce.number().nullish(),
  qult: z.coerce.number().positive({ error: "Bearing Pressure is required" })
})

.refine(
  (data) => data.su === undefined || data.su === null || data.su > 0,
  {
    path: ['su'],
    error: "Undrained Shear Soil Strength is required"
  }
)

.refine(
  (data) => data.t === undefined || data.t === null || data.t > 0,
  {
    path: ['t'],
    error: "Shear Soil Strength is required"
  }
)

.refine(
  (data) => data.angle === undefined || data.angle === null || data.angle > 0,
  {
    path: ['angle'],
    error: "Angle of Internal Friction is required"
  }
)

.refine(
  (data) => data.angle === undefined || data.angle === null || data.angle < 46,
  {
    path: ['angle'],
    error: "Angle of Internal Friction cannot be greater than 45°"
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


//calculations cpt soil schema
export const soilCalculationsCPTSchema = z.object({
  start_depth: z.number(),
  end_depth: z.number(),
  qc: z.number(),
  qca: z.number(),
  a: z.number(),
  kc: z.number()
})
export type TsoilCalculationsCPTSchema = z.infer<typeof soilCalculationsCPTSchema>

//full soil schema for saving/loading
export const fullSoilSchema = z.object({
  id: z.uuid(),
  soil_profile_id: z.uuid(),
  user_id: z.uuid(),
  soil_type: z.enum(["coarse", "fine", "manmade"]),
  density: z.enum(["loose", "dense"]),
  soil: z.string(),
  soil_name: z.string().optional(),
  description: z.string().optional(),
  colour: z.string(),
  start_depth: z.coerce.number(),
  end_depth: z.coerce.number(),
  n_value: z.coerce.number(),
  y_moist: z.coerce.number(),
  y_sat: z.coerce.number(),
  test_type: z.enum(["spt", "cpt"]),
  po: z.coerce.number().nullish(),
  angle: z.coerce.number().nullish(),
  t: z.coerce.number().nullish(),
  su: z.coerce.number().nullish(),
  qult: z.coerce.number(),
  shaft_capacity60: z.coerce.number(),
  shaft_capacity100: z.coerce.number(),
  bearing_capacity60: z.coerce.number(),
  bearing_capacity100: z.coerce.number(),
  kc: z.coerce.number(),
  qc: z.coerce.number(),
  qca: z.coerce.number(),
  a: z.coerce.number(),
})
export type TfullSoilSchema = z.infer<typeof fullSoilSchema>