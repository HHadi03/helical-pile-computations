import { TsoilCalculationsSchema, TfineSoilCalculationsSchema } from '@/schemas/soilSchemas'
import { createClient } from '@/utils/supabase/server'
import { roundToTwoDecimals } from './utils'

const SPT = 6.2
const UNITWEIGHT = 9.8
const pileDiameter60 = 0.1884
const pileDiameter100 = 0.314
const pileAreaDiameter60 = 0.001223
const pileAreaDiameter100 = 0.002463

export function calculateSoilHeight(start_depth: number, end_depth: number, h: number, effective_pile_length: number): number {
  if (end_depth <= effective_pile_length) {
    return h
  } 
  
  else if (start_depth < effective_pile_length) {
    return effective_pile_length - start_depth
  } 
  
  else {
    return 0
  }
}

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

  const h = roundToTwoDecimals(soil.end_depth - soil.start_depth)
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
    h,
    po,
    angle,
    ko,
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
  
  const h = roundToTwoDecimals(soil.end_depth - soil.start_depth)
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
    h,
    su,
    qult,
    shaft_capacity60,
    shaft_capacity100,
    bearing_capacity60,
    bearing_capacity100
  }
}


export async function calculateResultsForSoilsNoFetch (soil: TsoilCalculationsSchema, pileLength: number, waterDepth: number) {
  
  let shaft_capacity60: number
  let shaft_capacity100: number
  let bearing_capacity60: number
  let bearing_capacity100: number

  const h = roundToTwoDecimals(soil.end_depth - soil.start_depth)
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
    h,
    po,
    angle,
    ko,
    t,
    qult,
    shaft_capacity60,
    shaft_capacity100,
    bearing_capacity60,
    bearing_capacity100
  }
}

//Fine Soil Algorithm
export async function calculateResultsForFineSoilNoFetch (soil: TfineSoilCalculationsSchema, pileLength: number) {
  
  let shaft_capacity60: number
  let shaft_capacity100: number
  let bearing_capacity60: number
  let bearing_capacity100: number

  const h = roundToTwoDecimals(soil.end_depth - soil.start_depth)
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
    h,
    su,
    qult,
    shaft_capacity60,
    shaft_capacity100,
    bearing_capacity60,
    bearing_capacity100
  }
}