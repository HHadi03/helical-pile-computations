import { getPile } from './getPile'
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
  const po = roundToTwoDecimals((data.yMoist * hMoist) + (data.ySat * hSat) - (UNITWEIGHT * hSat))

  let angle = 25 + 28 * (data.nValue / po)
  if (angle > 45) {
      angle = 45
  }
  angle = roundToTwoDecimals(angle)

  const ko = roundToTwoDecimals(0.09 * Math.pow(e, (0.08 * angle)))
  const t = roundToTwoDecimals(ko * po * Math.tan(angle * TAN))
  const qult = roundToTwoDecimals(12 * SPT * data.nValue)

  return {
    h,
    po,
    angle,
    ko,
    t,
    qult,
  }
}

//Fine Soil Algorithm
export const calculateResultsForFineSoil = async (data: TsoilSchema): Promise<Partial<TsoilSchema>> => {
  const h = roundToTwoDecimals(data.endDepth - data.startDepth)
  const su = roundToTwoDecimals(data.nValue * SPT)
  const qult = roundToTwoDecimals(11 * SPT * data.nValue)

  return {
    h,
    su,
    qult,
  }
}
