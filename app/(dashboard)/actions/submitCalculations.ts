"use server"
import { API_URL } from "@/app/lib/api/getSoils"
import { TsoilSchema } from "@/app/schemas/soilSchema"
import { getPile } from "@/app/lib/api/getPile"
import { calculateResultsForSoils, calculateResultsForFineSoil, roundToTwoDecimals } from "@/app/lib/equations"
import { revalidateTag } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function calculateAll(soils: TsoilSchema[], hasCriticalChanges: boolean, isTFieldEdited: boolean): Promise<ReturnType> {
  console.log("is T field edited", isTFieldEdited)
  console.log("has critical changes", hasCriticalChanges)
  try {
    const pileData = await getPile()
    if (!pileData) {throw new Error}

    const calculations = await Promise.all(soils.map(async (soil) => {
      try {

        //If soil layer starts below pile length, no need to calculate, return true for success message
        if (soil.startDepth >= pileData.pileLength) {
          return true
        }
        
        //create a new soil object with calculated values
        const calculatedValues = soil.soilType === "fine" ? await calculateResultsForFineSoil(soil) : await calculateResultsForSoils(soil)

        //determine soil height based on pile length
        let soilHeight: number
        if (soil.endDepth <= pileData.pileLength) {
          soilHeight = soil.h!
        }
        else if (soil.startDepth < pileData.pileLength) {
          soilHeight = pileData.pileLength - soil.startDepth
        }
        else {
          soilHeight = 0
        }
        
        //If soil height is greater than 0, continue with code exection
        if (soilHeight > 0) {
          let shaftCapacity: number
          let bearingCapacity: number
          let updatedSoil: any = {}
          const e = 2.71828183
          const TAN = 0.01745
          
          //Condition 0 > If T and Qult is Edited
          if (isTFieldEdited && hasCriticalChanges && soil.soilType === 'coarse') {
            if (pileData.pileDiameter === "100") {
              shaftCapacity = soil.T! * soilHeight * 0.314
              bearingCapacity = soil.Qult! * 0.002463
            } else {
              shaftCapacity = soil.T! * soilHeight * 0.1884
              bearingCapacity = soil.Qult! * 0.001223
            }
            updatedSoil = {
              shaftCapacity: roundToTwoDecimals(shaftCapacity),
              bearingCapacity: roundToTwoDecimals(bearingCapacity)
            }
          }

          //Condition 1 > If T is Edited
          else if (isTFieldEdited && soil.soilType === 'coarse') {
            if (pileData.pileDiameter === "100") {
              shaftCapacity = soil.T! * soilHeight * 0.314
              bearingCapacity = calculatedValues.Qult! * 0.002463
            } else {
              shaftCapacity = soil.T! * soilHeight * 0.1884
              bearingCapacity = calculatedValues.Qult! * 0.001223
            }
            updatedSoil = {
              shaftCapacity: roundToTwoDecimals(shaftCapacity),
              bearingCapacity: roundToTwoDecimals(bearingCapacity)
            }
          } 
          
          //Condition 2 > If Su/Angle/Qult is Edited
          else if (hasCriticalChanges) {
            if (pileData.pileDiameter === "100") {
              if (soil.soilType === "fine") {
                shaftCapacity = soil.Su! * soilHeight * 0.314
                bearingCapacity = soil.Qult! * 0.002463
                updatedSoil = {
                  shaftCapacity: roundToTwoDecimals(shaftCapacity),
                  bearingCapacity: roundToTwoDecimals(bearingCapacity)
                }
              } else {
                const Ko = 0.09 * Math.pow(e, (0.08 * soil.Angle!))
                const T = Ko * calculatedValues.Po! * Math.tan(soil.Angle! * TAN)
                shaftCapacity = T * soilHeight * 0.314
                bearingCapacity = soil.Qult! * 0.002463
                updatedSoil = {
                  Ko: roundToTwoDecimals(Ko),
                  T: roundToTwoDecimals(T),
                  shaftCapacity: roundToTwoDecimals(shaftCapacity),
                  bearingCapacity: roundToTwoDecimals(bearingCapacity)
                }
              }

            } else {
              if (soil.soilType === "fine") {
                shaftCapacity = soil.Su! * soilHeight * 0.1884
                bearingCapacity = soil.Qult! * 0.001223
                updatedSoil = {
                  shaftCapacity: roundToTwoDecimals(shaftCapacity),
                  bearingCapacity: roundToTwoDecimals(bearingCapacity)
                }
              } else {
                const Ko = 0.09 * Math.pow(e, (0.08 * soil.Angle!))
                const T = Ko * calculatedValues.Po! * Math.tan(soil.Angle! * TAN)
                shaftCapacity = T * soilHeight * 0.1884
                bearingCapacity = soil.Qult! * 0.001223
                updatedSoil = {
                  Ko: roundToTwoDecimals(Ko),
                  T: roundToTwoDecimals(T),
                  shaftCapacity: roundToTwoDecimals(shaftCapacity),
                  bearingCapacity: roundToTwoDecimals(bearingCapacity)
                }
              }
            }
          }

          //Conditon 3 > No engineered props edited
          else {
            if (pileData.pileDiameter === "100") {
              shaftCapacity = soil.soilType === "fine" ? calculatedValues.Su! * soilHeight * 0.314 : calculatedValues.T! * soilHeight * 0.314
              bearingCapacity = calculatedValues.Qult! * 0.002463
            } else {
              shaftCapacity = soil.soilType === "fine" ? calculatedValues.Su! * soilHeight * 0.1884 : calculatedValues.T! * soilHeight * 0.1884
              bearingCapacity = calculatedValues.Qult! * 0.001223
            }
            updatedSoil = {
              ...calculatedValues,
              shaftCapacity: roundToTwoDecimals(shaftCapacity),
              bearingCapacity: roundToTwoDecimals(bearingCapacity)
            }  
          }
        
          const response = await fetch(`${API_URL}/soil/${soil.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedSoil)
          })

          //if response is not ok, return false for error message else return true for success message
          if (!response.ok) {
            return false
          }
          return true
        }
        //If soil height is 0, return true for success message
        return true
        
      } catch {
        return false
      }
    }))

    const allSuccessful = calculations.every(success => success)
    if (allSuccessful) {
      revalidateTag('soils')
      return { message: "All soil layers calculated successfully" }
    } 
    else {
      return { message: "Some soil layers failed to calculate. Please try again.", errors: {}}
    }

  } catch {
    return { message: "Failed to calculate all soil layers, please try again later.", errors: {}}
  }
}