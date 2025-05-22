import { TsoilSchema } from '@/schemas/soilSchema'

const SPT = 6.2
const UNITWEIGHT = 9.8
const TAN = 0.01745
const e = 2.71828183

export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100
}

//Coarse OR Manmade Soil Algorithm
export const calculateResultsForSoils = async (soil: TsoilSchema, waterDepth: number): Promise<Partial<TsoilSchema>> => {
  const h = roundToTwoDecimals(soil.endDepth - soil.startDepth)
  const hMoist = Math.max(0, Math.min(waterDepth, soil.endDepth) - soil.startDepth)
  const hSat = Math.max(0, soil.endDepth - Math.max(waterDepth, soil.startDepth))
  const po = roundToTwoDecimals((soil.yMoist * hMoist) + (soil.ySat * hSat) - (UNITWEIGHT * hSat))

  let angle = 25 + 28 * (soil.nValue / po)
  if (angle > 45) {
      angle = 45
  }
  angle = roundToTwoDecimals(angle)

  const ko = roundToTwoDecimals(0.09 * Math.pow(e, (0.08 * angle)))
  const t = roundToTwoDecimals(ko * po * Math.tan(angle * TAN))
 
  return {
    h,
    po,
    angle,
    ko,
    t,
  }
}

//Fine Soil Algorithm
export const calculateResultsForFineSoil = async (soil: TsoilSchema): Promise<Partial<TsoilSchema>> => {
  const h = roundToTwoDecimals(soil.endDepth - soil.startDepth)
  const su = roundToTwoDecimals(soil.nValue * SPT)

  return {
    h,
    su,
  }
}
