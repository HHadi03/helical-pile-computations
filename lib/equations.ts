import { TsoilCalculationsSchema, TfineSoilCalculationsSchema, TsoilCalculationsCPTSchema } from '@/schemas/soilSchemas'
import { createClient } from '@/utils/supabase/server'
import { roundToTwoDecimals, calculateSoilHeight, roundToOneDecimal } from './utils'

const SPT = 6.2
const UNITWEIGHT = 9.8
export const pileDiameter60 = 0.1884
export const pileDiameter100 = 0.314
export const pileAreaDiameter60 = 0.001223
export const pileAreaDiameter100 = 0.002463

//Coarse OR Manmade Soil Algorithm
export async function calculateResultsForSoils (soil: TsoilCalculationsSchema, profileId: string) {

  let shaft_capacity60: number
  let shaft_capacity100: number
  let bearing_capacity60: number
  let bearing_capacity100: number

  const supabase = await createClient()
  const { data, error } = await supabase
  .from('soil_profiles')
  .select("water_depth, effective_pile_length")
  .eq('id', profileId)
  .single()

  if (error) {
    throw new Error("Unable to fetch pile data")
  }

  const h = roundToOneDecimal(soil.end_depth - soil.start_depth)
  const hMoist = Math.max(0, Math.min(data.water_depth, soil.end_depth) - soil.start_depth)
  const hSat = Math.max(0, soil.end_depth - Math.max(data.water_depth, soil.start_depth))
  const po = roundToTwoDecimals((soil.y_moist * hMoist) + (soil.y_sat * hSat) - (UNITWEIGHT * hSat))
  
  let angle = 25 + 28 * (soil.n_value / po)
  if (angle > 45) {
    angle = 45
  }
  angle = roundToTwoDecimals(angle)

  const ko = roundToTwoDecimals(0.09 * Math.pow(Math.E, (0.08 * angle)))
  const t = roundToTwoDecimals(ko * po * Math.tan(angle * (Math.PI / 180)))
  const qult = roundToTwoDecimals(12 * SPT * soil.n_value)

  const soilHeight = calculateSoilHeight(soil.start_depth, soil.end_depth, h, data.effective_pile_length)

  if (soilHeight > 0) {
    shaft_capacity60 = roundToTwoDecimals(t * soilHeight * pileDiameter60)
    shaft_capacity100 = roundToTwoDecimals(t * soilHeight * pileDiameter100)
    bearing_capacity60 = roundToTwoDecimals(qult * pileAreaDiameter60)
    bearing_capacity100 = roundToTwoDecimals(qult * pileAreaDiameter100)
  }

  else {
    shaft_capacity60 = 0
    shaft_capacity100 = 0
    bearing_capacity60 = 0
    bearing_capacity100 = 0 
  }

  return {
    po,
    angle,
    t,
    qult,
    shaft_capacity60,
    shaft_capacity100,
    bearing_capacity60,
    bearing_capacity100
  }
}

//Fine Soil Algorithm
export async function calculateResultsForFineSoil (soil: TfineSoilCalculationsSchema, profileId: string) {
  
  let shaft_capacity60: number
  let shaft_capacity100: number
  let bearing_capacity60: number
  let bearing_capacity100: number

  const supabase = await createClient()
  const { data, error } = await supabase
  .from('soil_profiles')
  .select("effective_pile_length")
  .eq('id', profileId)
  .single()

  if (error || !data) {
    throw new Error("Unable to fetch Pile Data")
  }
  
  const h = roundToOneDecimal(soil.end_depth - soil.start_depth)
  const su = roundToTwoDecimals(soil.n_value * SPT)
  const qult = roundToTwoDecimals(11 * SPT * soil.n_value)

  const soilHeight = calculateSoilHeight(soil.start_depth, soil.end_depth, h, data.effective_pile_length)
  if (soilHeight > 0) {
    shaft_capacity60 = roundToTwoDecimals(su * soilHeight * pileDiameter60)
    shaft_capacity100 = roundToTwoDecimals(su * soilHeight * pileDiameter100)
    bearing_capacity60 = roundToTwoDecimals(qult * pileAreaDiameter60)
    bearing_capacity100 = roundToTwoDecimals(qult * pileAreaDiameter100)
  }

  else {
    shaft_capacity60 = 0
    shaft_capacity100 = 0
    bearing_capacity60 = 0
    bearing_capacity100 = 0 
  }
  
  return {
    su,
    qult,
    shaft_capacity60,
    shaft_capacity100,
    bearing_capacity60,
    bearing_capacity100
  }
}

//Coarse OR Manmade Soil Algorithm - NO FETCH
export async function calculateResultsForSoilsNoFetch (soil: TsoilCalculationsSchema, pileLength: number, waterDepth: number) {
  
  let shaft_capacity60: number
  let shaft_capacity100: number
  let bearing_capacity60: number
  let bearing_capacity100: number

  const h = roundToOneDecimal(soil.end_depth - soil.start_depth)
  const hMoist = Math.max(0, Math.min(waterDepth, soil.end_depth) - soil.start_depth)
  const hSat = Math.max(0, soil.end_depth - Math.max(waterDepth, soil.start_depth))
  const po = roundToTwoDecimals((soil.y_moist * hMoist) + (soil.y_sat * hSat) - (UNITWEIGHT * hSat))
  
  let angle = 25 + 28 * (soil.n_value / po)
  if (angle > 45) {
    angle = 45
  }
  angle = roundToTwoDecimals(angle)

  const ko = roundToTwoDecimals(0.09 * Math.pow(Math.E, (0.08 * angle)))
  const t = roundToTwoDecimals(ko * po * Math.tan(angle * (Math.PI / 180)))
  const qult = roundToTwoDecimals(12 * SPT * soil.n_value)

  const soilHeight = calculateSoilHeight(soil.start_depth, soil.end_depth, h, pileLength)
  if (soilHeight > 0) {
    shaft_capacity60 = roundToTwoDecimals(t * soilHeight * pileDiameter60)
    shaft_capacity100 = roundToTwoDecimals(t * soilHeight * pileDiameter100)
    bearing_capacity60 = roundToTwoDecimals(qult * pileAreaDiameter60)
    bearing_capacity100 = roundToTwoDecimals(qult * pileAreaDiameter100)
  }

  else {
    shaft_capacity60 = 0
    shaft_capacity100 = 0
    bearing_capacity60 = 0
    bearing_capacity100 = 0 
  }

  return {
    po,
    angle,
    t,
    qult,
    shaft_capacity60,
    shaft_capacity100,
    bearing_capacity60,
    bearing_capacity100
  }
}

//Fine Soil Algorithm - NO FETCH
export async function calculateResultsForFineSoilNoFetch (soil: TfineSoilCalculationsSchema, pileLength: number) {
  
  let shaft_capacity60: number
  let shaft_capacity100: number
  let bearing_capacity60: number
  let bearing_capacity100: number

  const h = roundToOneDecimal(soil.end_depth - soil.start_depth)
  const su = roundToTwoDecimals(soil.n_value * SPT)
  const qult = roundToTwoDecimals(11 * SPT * soil.n_value)

  const soilHeight = calculateSoilHeight(soil.start_depth, soil.end_depth, h, pileLength)
  if (soilHeight > 0) {
    shaft_capacity60 = roundToTwoDecimals(su * soilHeight * pileDiameter60)
    shaft_capacity100 = roundToTwoDecimals(su * soilHeight * pileDiameter100)
    bearing_capacity60 = roundToTwoDecimals(qult * pileAreaDiameter60)
    bearing_capacity100 = roundToTwoDecimals(qult * pileAreaDiameter100)
  }

  else {
    shaft_capacity60 = 0
    shaft_capacity100 = 0
    bearing_capacity60 = 0
    bearing_capacity100 = 0 
  }
  
  return {
    su,
    qult,
    shaft_capacity60,
    shaft_capacity100,
    bearing_capacity60,
    bearing_capacity100
  }
}

// Coarse OR Manmade Soil Algorithm CPT
export async function calculateResultsForSoilsCPT(soil: TsoilCalculationsCPTSchema, profileId: string) {
  
  let shaft_capacity60 = 0
  let shaft_capacity100 = 0
  let bearing_capacity60 = 0
  let bearing_capacity100 = 0

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('soil_profiles')
    .select("effective_pile_length")
    .eq('id', profileId)
    .single()

  if (error || !data) {
    throw new Error("Unable to fetch pile data")
  }

  const h = roundToOneDecimal(soil.end_depth - soil.start_depth)

  const t = roundToTwoDecimals(soil.qc * soil.a)
  const qult = roundToTwoDecimals(soil.qca * soil.kc)

  const soilHeight = calculateSoilHeight(soil.start_depth, soil.end_depth, h, data.effective_pile_length)

  if (soilHeight > 0) {
    shaft_capacity60 = roundToTwoDecimals(t * soilHeight * pileDiameter60)
    shaft_capacity100 = roundToTwoDecimals(t * soilHeight * pileDiameter100)
    bearing_capacity60 = roundToTwoDecimals(qult * pileAreaDiameter60)
    bearing_capacity100 = roundToTwoDecimals(qult * pileAreaDiameter100)
  }

  return {
    t,
    qult,
    shaft_capacity60,
    shaft_capacity100,
    bearing_capacity60,
    bearing_capacity100
  }
}

// Fine Soil Algorithm CPT
export async function calculateResultsForFineSoilCPT(soil: TsoilCalculationsCPTSchema, profileId: string) {

  let shaft_capacity60 = 0
  let shaft_capacity100 = 0
  let bearing_capacity60 = 0
  let bearing_capacity100 = 0

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('soil_profiles')
    .select("effective_pile_length")
    .eq('id', profileId)
    .single()

  if (error || !data) {
    throw new Error("Unable to fetch pile data")
  }

  const h = roundToOneDecimal(soil.end_depth - soil.start_depth)

  const su = roundToTwoDecimals(soil.qc * soil.a)
  const qult = roundToTwoDecimals(soil.qca * soil.kc)

  const soilHeight = calculateSoilHeight(soil.start_depth, soil.end_depth, h, data.effective_pile_length)

  if (soilHeight > 0) {
    shaft_capacity60 = roundToTwoDecimals(su * soilHeight * pileDiameter60)
    shaft_capacity100 = roundToTwoDecimals(su * soilHeight * pileDiameter100)
    bearing_capacity60 = roundToTwoDecimals(qult * pileAreaDiameter60)
    bearing_capacity100 = roundToTwoDecimals(qult * pileAreaDiameter100)
  }

  return {
    su,
    qult,
    shaft_capacity60,
    shaft_capacity100,
    bearing_capacity60,
    bearing_capacity100
  }
}

//Coarse OR Manmade Soil Algorithm CPT - NO FETCH
export async function calculateResultsForSoilsCPTNoFetch (soil: TsoilCalculationsCPTSchema, pileLength: number) {
 
  let shaft_capacity60: number
  let shaft_capacity100: number
  let bearing_capacity60: number
  let bearing_capacity100: number

  const h = roundToOneDecimal(soil.end_depth - soil.start_depth)
  const t = roundToTwoDecimals(soil.qc * soil.a)
  const qult = roundToTwoDecimals(soil.qca * soil.kc)

  const soilHeight = calculateSoilHeight(soil.start_depth, soil.end_depth, h, pileLength)
  if (soilHeight > 0) {
    shaft_capacity60 = roundToTwoDecimals(t * soilHeight * pileDiameter60)
    shaft_capacity100 = roundToTwoDecimals(t * soilHeight * pileDiameter100)
    bearing_capacity60 = roundToTwoDecimals(qult * pileAreaDiameter60)
    bearing_capacity100 = roundToTwoDecimals(qult * pileAreaDiameter100)
  }

  else {
    shaft_capacity60 = 0
    shaft_capacity100 = 0
    bearing_capacity60 = 0
    bearing_capacity100 = 0 
  }

  return {
    t,
    qult,
    shaft_capacity60,
    shaft_capacity100,
    bearing_capacity60,
    bearing_capacity100
  }
}

//Fine Soil Algorithm CPT - NO FETCH
export async function calculateResultsForFineSoilCPTNoFetch (soil: TsoilCalculationsCPTSchema, pileLength: number) {
  
  let shaft_capacity60: number
  let shaft_capacity100: number
  let bearing_capacity60: number
  let bearing_capacity100: number

  const h = roundToOneDecimal(soil.end_depth - soil.start_depth)
   // NEW equations
  const su = roundToTwoDecimals(soil.qc * soil.a)
  const qult = roundToTwoDecimals(soil.qca * soil.kc)

  const soilHeight = calculateSoilHeight(soil.start_depth, soil.end_depth, h, pileLength)
  if (soilHeight > 0) {
    shaft_capacity60 = roundToTwoDecimals(su * soilHeight * pileDiameter60)
    shaft_capacity100 = roundToTwoDecimals(su * soilHeight * pileDiameter100)
    bearing_capacity60 = roundToTwoDecimals(qult * pileAreaDiameter60)
    bearing_capacity100 = roundToTwoDecimals(qult * pileAreaDiameter100)
  }

  else {
    shaft_capacity60 = 0
    shaft_capacity100 = 0
    bearing_capacity60 = 0
    bearing_capacity100 = 0 
  }
  
  return {
    su,
    qult,
    shaft_capacity60,
    shaft_capacity100,
    bearing_capacity60,
    bearing_capacity100
  }
}