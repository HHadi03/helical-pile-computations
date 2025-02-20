import { getPile } from './api/getPile'
import { TsoilSchema } from '../schemas/soilSchema'

const SPT = 6.2
const UNITWEIGHT = 9.8
const TAN = 0.01745
const e = 2.71828183

const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100
}

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
    Po,
    Angle,
    Ko,
    T,
    Qult,
    h
  }
}

export const calculateResultsForFineSoil = (data: TsoilSchema): Partial<TsoilSchema> => {
  const h = roundToTwoDecimals(data.endDepth - data.startDepth)
  const Su = roundToTwoDecimals(data.nValue * SPT)
  const Qult = roundToTwoDecimals(11 * SPT * data.nValue)

  return {
    Su,
    Qult,
    h
  }
} 

 // can do the pilelength check here, if soillayer end depth is smaller than pile length then calculate the pile length, if soillayer end depth is greater than pile length then
    // calculate end depth - pile length, then use this to determine the height of the soil to calculate.


//on calculateall we will run the equations in all instance except a state that declares the engineered props, then we will use these directly in the calculation.

//  const fields: (keyof TsoilSchema)[] = ["nValue", "yMoist", "ySat"]
//   const fieldsChanged = fields.some((field) => soil[field] !== existingSoil[field])

//   let updatedSoil = { ...soil }

//   if (fieldsChanged) {
//     const newCalculations = soil.soilType === "fine" 
//       ? calculateResultsForFineSoil(soil) : await calculateResultsForSoils(soil)

//     updatedSoil = { ...soil, ...Object.fromEntries(Object.entries(newCalculations).map(([key, value]) => [
//     key,soil[key as keyof TsoilSchema] !== existingSoil[key as keyof TsoilSchema] ? soil[key as keyof TsoilSchema]  : value]))}
//   }


              // <FormField
              //   control={form.control}
              //   name="Ko"
              //   render={({ field }) => (
              //     <FormItem>
              //       <FormLabel>Coefficient of Lateral Pressure (Ko)</FormLabel>
              //       <FormControl>
              //         <div className="relative">
              //           <NumberInput 
              //             field={field}
              //             placeholder="Enter Ko"
              //           />
              //           <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
              //             Ko
              //           </span>
              //         </div>
              //       </FormControl>
              //       <FormMessage />
              //     </FormItem>
              //   )}
              // />

              // <FormField
              //   control={form.control}
              //   name="Po"
              //   render={({ field }) => (
              //     <FormItem>
              //       <FormLabel>Effective Overburden Stress (Po)</FormLabel>
              //       <FormControl>
              //         <div className="relative">
              //           <NumberInput 
              //             field={field}
              //             placeholder="Enter Po"
              //           />
              //           <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
              //             kPa
              //           </span>
              //         </div>
              //       </FormControl>
              //       <FormMessage />
              //     </FormItem>
              //   )}
              // />