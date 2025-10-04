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
})
export type ToverviewSoilSchema = z.infer<typeof overviewSoilSchema>


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
  t: z.number(),
  shaft_capacity60: z.number(),
  shaft_capacity100: z.number(),
  bearing_capacity60: z.number(),
  bearing_capacity100: z.number(),
})
export type TexportSoilSchema = z.infer<typeof exportSoilSchema>


//visualisation soil schema
export const visualisationSoilSchema = z.object({
  end_depth: z.number(),
  shaft_capacity60: z.number().optional(),
  bearing_capacity60: z.number().optional(),
  shaft_capacity100: z.number().optional(),
  bearing_capacity100: z.number().optional(),
})
export type TvisualisationSoilSchema = z.infer<typeof visualisationSoilSchema>


//insert soil schema
export const insertSoilSchema = z.object({
  soil_type: z.enum(["coarse", "fine", "manmade"], { error: "Please select soil type" }),
  density: z.enum(["loose", "dense"], { error: "Please select soil density" }),
  soil: z.string().min(1, { error: "Please select a soil" }),
  soil_name: z.string().optional(),
  description: z.string().optional(),
  colour: z.string(),
  start_depth: z.coerce.number().gte(0, { error: "Start Depth is required" }),
  end_depth: z.coerce.number().positive({ error: "End Depth is required" }).transform((val) => Number(roundToOneDecimal(val))),
  y_moist: z.coerce.number().positive({ error: "Moist Unit Weight is required" }),
  y_sat: z.coerce.number().positive({ error: "Sat Unit Weight is required" }),
  test_type: z.enum(["spt", "cpt"], { error: "Please select a test method" }),
  n_value: z.coerce.number(),
  qc: z.coerce.number(),
  qs: z.coerce.number(),
  ks: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive({ error: "Required" }).default(1)),
  kc: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive({ error: "Required" }).default(0.45)),
  a: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive({ error: "Required" }).default(1)),
  nk: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive({ error: "Required" }).default(15)),
  nc: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive({ error: "Required" }).default(7)),
})

.refine(
  (data) => data.end_depth > data.start_depth,
  {
    path: ['end_depth'], 
    error: "End Depth must be greater than Start Depth",
  }
)

.refine(
  (data) => data.soil_name === undefined || data.soil_name.length <= 30,
  {
    path: ['soil_name'],
    error: "Name must be less than 30 characters long"
  }
)

.refine(
  (data) => data.description === undefined || data.description.length <= 60,
  {
    path: ['description'],
    error: "Description must be less than 60 characters long"
  }
)

.refine(
  (data) => {
    if (data.test_type === "spt") {
      return data.n_value !== undefined && data.n_value > 0
    }
    return true
  },
  {
    path: ['n_value'],
    error: "SPT N-Value is required",
  }
)

.refine(
  (data) => {
    if (data.test_type === "cpt") {
      return data.qc !== undefined && data.qc > 0
    }
    return true
  },
  {
    path: ['qc'],
    error: "Cone Tip Resistance is required",
  }
)

.refine(
  (data) => {
    if (data.test_type === "cpt" && data.soil_type !== "fine") {
      return data.qs !== undefined && data.qs > 0
    }
    return true
  },
  {
    path: ['qs'],
    error: "Cone Sleeve Resistance is required",
  }
)
export type TinsertSoilSchema = z.infer<typeof insertSoilSchema>


//edit soil information schema
export const editSoilInformationSchema = z.object({
  soil_type: z.enum(["coarse", "fine", "manmade"], { error: "Please select a soil type" }),
  density: z.enum(["loose", "dense"], { error: "Please select soil density" }),
  soil: z.string().min(1, { error: "Please select a soil" }),
  soil_name: z.string().optional(),
  description: z.string().optional(),
  colour: z.string(),
  qs: z.number().optional(),
})

.refine(
  (data) => data.soil_name === undefined || data.soil_name.length <= 30,
  {
    path: ['soil_name'],
    error: "Name must be less than 30 characters long"
  }
)

.refine(
  (data) => data.description === undefined || data.description.length <= 60,
  {
    path: ['description'],
    error: "Description must be less than 60 characters long"
  }
)

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
  qs: z.coerce.number(),
  ks: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive({ error: "Required" }).default(1)),
  kc: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive({ error: "Required" }).default(0.45)),
  a: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive({ error: "Required" }).default(1)),
  nk: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive({ error: "Required" }).default(15)),
  nc: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().positive({ error: "Required" }).default(7)),
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
  (data) => {
    if (data.test_type === "spt") {
      return data.n_value !== undefined && data.n_value > 0
    }
    return true
  },
  {
    path: ['n_value'],
    error: "SPT N-Value is required",
  }
)

.refine(
  (data) => {
    if (data.test_type === "cpt") {
      return data.qc !== undefined && data.qc > 0
    }
    return true
  },
  {
    path: ['qc'],
    error: "Cone Tip Resistance is required",
  }
)

.refine(
  (data) => {
    if (data.test_type === "cpt" && data.soil_type !== "fine") {
      return data.qs !== undefined && data.qs > 0
    }
    return true
  },
  {
    path: ['qs'],
    error: "Cone Sleeve Resistance is required",
  }
)

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


//calculations cpt coarse soil schema
export const soilCalculationsCPTSchema = z.object({
  start_depth: z.number(),
  end_depth: z.number(),
  qc: z.number(),
  qs: z.number(),
  ks: z.number(),
  kc: z.number()
})
export type TsoilCalculationsCPTSchema = z.infer<typeof soilCalculationsCPTSchema>


//calculations cpt fine soil schema
export const fineSoilCalculationsCPTSchema = z.object({
  start_depth: z.number(),
  end_depth: z.number(),
  y_moist: z.number(),
  y_sat: z.number(),
  qc: z.number(),
  qs: z.number(),
  nk: z.number(),
  nc: z.number(),
  a: z.number(),
})
export type TfineSoilCalculationsCPTSchema = z.infer<typeof fineSoilCalculationsCPTSchema>
