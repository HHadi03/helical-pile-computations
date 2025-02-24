import { getPile } from './api/getPile'
import { TsoilSchema } from '../schemas/soilSchema'

const SPT = 6.2
const UNITWEIGHT = 9.8
const TAN = 0.01745
const e = 2.71828183

export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100
}

//Coarse OR Manmade Soil Algorithm
export const calculateResultsForSoils = async (data: TsoilSchema): Promise<Partial<TsoilSchema>> => {
  const pileData = await getPile()
  if (!pileData) {throw new Error}

  const h = roundToTwoDecimals(data.endDepth - data.startDepth)
  
  const hMoist = Math.max(0, Math.min(pileData.waterDepth, data.endDepth) - data.startDepth)
  const hSat = Math.max(0, data.endDepth - Math.max(pileData.waterDepth, data.startDepth))
  const Po = roundToTwoDecimals((data.yMoist * hMoist) + (data.ySat * hSat) - (UNITWEIGHT * hSat))

  let Angle = 25 + 28 * (data.nValue / Po)
  if (Angle > 45) {
      Angle = 45
  }
  Angle = roundToTwoDecimals(Angle)

  const Ko = roundToTwoDecimals(0.09 * Math.pow(e, (0.08 * Angle)))
  const T = roundToTwoDecimals(Ko * Po * Math.tan(Angle * TAN))
  const Qult = roundToTwoDecimals(12 * SPT * data.nValue)

  return {
    h,
    Po,
    Angle,
    Ko,
    T,
    Qult,
  }
}

//Fine Soil Algorithm
export const calculateResultsForFineSoil = async (data: TsoilSchema): Promise<Partial<TsoilSchema>> => {
  const h = roundToTwoDecimals(data.endDepth - data.startDepth)
  const Su = roundToTwoDecimals(data.nValue * SPT)
  const Qult = roundToTwoDecimals(11 * SPT * data.nValue)

  return {
    h,
    Su,
    Qult,
  }
}
