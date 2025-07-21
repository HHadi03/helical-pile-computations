import { TsoilSchema } from '@/schemas/soilSchema'
import { createClient } from '@/utils/supabase/server'

const SPT = 6.2
const UNITWEIGHT = 9.8
const TAN = 0.01745
const e = 2.71828183
const pileDiameter60 = 0.1884
const pileDiameter100 = 0.314
const pileAreaDiameter60 = 0.001223
const pileAreaDiameter100 = 0.002463

export function roundToTwoDecimals (value: number): number {
  return Math.round(value * 100) / 100
}

//Coarse OR Manmade Soil Algorithm
export async function calculateResultsForSoils (soil: TsoilSchema, profileId: string): Promise<Partial<TsoilSchema>> {

  let shaftCapacity60: number
  let shaftCapacity100: number
  let bearingCapacity60: number
  let bearingCapacity100: number
  let soilHeight: number

  const supabase = await createClient()
  const { data, error } = await supabase
  .from('soil_profiles')
  .select("water_depth, effective_pile_length")
  .eq('id', profileId)
  .single()

  if (error || !data) {
    throw new Error("Unable to fetch Pile Data")
  }
  const pileLength = data.effective_pile_length

  const h = roundToTwoDecimals(soil.endDepth - soil.startDepth)
  const hMoist = Math.max(0, Math.min(data.water_depth, soil.endDepth) - soil.startDepth)
  const hSat = Math.max(0, soil.endDepth - Math.max(data.water_depth, soil.startDepth))
  const po = roundToTwoDecimals((soil.yMoist * hMoist) + (soil.ySat * hSat) - (UNITWEIGHT * hSat))

  let angle = 25 + 28 * (soil.nValue / po)
  if (angle > 45) {
    angle = 45
  }
  angle = roundToTwoDecimals(angle)

  const ko = roundToTwoDecimals(0.09 * Math.pow(e, (0.08 * angle)))
  const t = roundToTwoDecimals(ko * po * Math.tan(angle * TAN))
  const qult = roundToTwoDecimals(12 * SPT * soil.nValue)

  if (soil.endDepth <= pileLength) {
    soilHeight = h
  }

  else if (soil.startDepth < pileLength) {
    soilHeight = pileLength - soil.startDepth
  }

  else {
    soilHeight = 0
  }

  if (soilHeight > 0) {
    shaftCapacity60 = roundToTwoDecimals(t * soilHeight * pileDiameter60)
    shaftCapacity100 = roundToTwoDecimals(t * soilHeight * pileDiameter100)
    bearingCapacity60 = roundToTwoDecimals(qult * pileAreaDiameter60)
    bearingCapacity100 = roundToTwoDecimals(qult * pileAreaDiameter100)
  }

  else {
    shaftCapacity60 = 0
    shaftCapacity100 = 0
    bearingCapacity60 = 0
    bearingCapacity100 = 0 
  }

  return {
    h,
    po,
    angle,
    ko,
    t,
    qult,
    shaftCapacity60,
    shaftCapacity100,
    bearingCapacity60,
    bearingCapacity100
  }
}

//Fine Soil Algorithm
export async function calculateResultsForFineSoil (soil: TsoilSchema, profileId: string): Promise<Partial<TsoilSchema>> {
  
  let shaftCapacity60: number
  let shaftCapacity100: number
  let bearingCapacity60: number
  let bearingCapacity100: number
  let soilHeight: number

  const supabase = await createClient()
  const { data, error } = await supabase
  .from('soil_profiles')
  .select("effective_pile_length")
  .eq('id', profileId)
  .single()

  if (error || !data) {
    throw new Error("Unable to fetch Pile Data")
  }
  const pileLength = data.effective_pile_length
 
  const h = roundToTwoDecimals(soil.endDepth - soil.startDepth)
  const su = roundToTwoDecimals(soil.nValue * SPT)
  const qult = roundToTwoDecimals(11 * SPT * soil.nValue)

  if (soil.endDepth <= pileLength) {
    soilHeight = h
  }

  else if (soil.startDepth < pileLength) {
    soilHeight = pileLength - soil.startDepth
  }

  else {
    soilHeight = 0
  }

  if (soilHeight > 0) {
    shaftCapacity60 = roundToTwoDecimals(su * soilHeight * pileDiameter60)
    shaftCapacity100 = roundToTwoDecimals(su * soilHeight * pileDiameter100)
    bearingCapacity60 = roundToTwoDecimals(qult * pileAreaDiameter60)
    bearingCapacity100 = roundToTwoDecimals(qult * pileAreaDiameter100)
  }

  else {
    shaftCapacity60 = 0
    shaftCapacity100 = 0
    bearingCapacity60 = 0
    bearingCapacity100 = 0 
  }
  
  return {
    h,
    su,
    qult,
    shaftCapacity60,
    shaftCapacity100,
    bearingCapacity60,
    bearingCapacity100
  }
}
