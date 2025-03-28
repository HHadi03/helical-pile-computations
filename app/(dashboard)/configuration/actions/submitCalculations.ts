"use server"
import { getPile } from "@/lib/getPile"
import { getSoils } from "@/lib/getSoils"
import { calculateResultsForSoils, calculateResultsForFineSoil, roundToTwoDecimals } from "@/lib/equations"
import { createClient } from "@/utils/supabase/server"
import { camelToSnake } from "@/lib/caseConversion"
import { revalidatePath } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

type UpdatedSoil = {
  shaftCapacity?: number
  bearingCapacity?: number
  po?: number | null
  angle?: number | null
  ko?: number | null
  t?: number | null
  su?: number | null
  qult?: number
  h?: number
}

export async function calculateAll(hasCriticalChanges: boolean, isTFieldEdited: boolean): Promise<ReturnType> {
  try {
    const soilsData = await getSoils()

    const pileData = await getPile()
    if (!pileData) {
      return { message: "Failed to fetch pile data. Please try again.", errors: {}}
    }

    const calculations = await Promise.all(soilsData.map(async (soil) => {
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
          let updatedSoil: UpdatedSoil = {}
          const e = 2.71828183
          const TAN = 0.01745
          
          //Condition 0 > If T and Qult is Edited
          if (isTFieldEdited && hasCriticalChanges && soil.soilType === 'coarse') {
            if (pileData.pileDiameter === "100") {
              shaftCapacity = soil.t! * soilHeight * 0.314
              bearingCapacity = soil.qult! * 0.002463
            } else {
              shaftCapacity = soil.t! * soilHeight * 0.1884
              bearingCapacity = soil.qult! * 0.001223
            }
            updatedSoil = {
              shaftCapacity: roundToTwoDecimals(shaftCapacity),
              bearingCapacity: roundToTwoDecimals(bearingCapacity)
            }
          }

          //Condition 1 > If T is Edited
          else if (isTFieldEdited && soil.soilType === 'coarse') {
            if (pileData.pileDiameter === "100") {
              shaftCapacity = soil.t! * soilHeight * 0.314
              bearingCapacity = calculatedValues.qult! * 0.002463
            } else {
              shaftCapacity = soil.t! * soilHeight * 0.1884
              bearingCapacity = calculatedValues.qult! * 0.001223
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
                shaftCapacity = soil.su! * soilHeight * 0.314
                bearingCapacity = soil.qult! * 0.002463
                updatedSoil = {
                  shaftCapacity: roundToTwoDecimals(shaftCapacity),
                  bearingCapacity: roundToTwoDecimals(bearingCapacity)
                }
              } else {
                const Ko = 0.09 * Math.pow(e, (0.08 * soil.angle!))
                const T = Ko * calculatedValues.po! * Math.tan(soil.angle! * TAN)
                shaftCapacity = T * soilHeight * 0.314
                bearingCapacity = soil.qult! * 0.002463
                updatedSoil = {
                  ko: roundToTwoDecimals(Ko),
                  t: roundToTwoDecimals(T),
                  shaftCapacity: roundToTwoDecimals(shaftCapacity),
                  bearingCapacity: roundToTwoDecimals(bearingCapacity)
                }
              }

            } else {
              if (soil.soilType === "fine") {
                shaftCapacity = soil.su! * soilHeight * 0.1884
                bearingCapacity = soil.qult! * 0.001223
                updatedSoil = {
                  shaftCapacity: roundToTwoDecimals(shaftCapacity),
                  bearingCapacity: roundToTwoDecimals(bearingCapacity)
                }
              } else {
                const Ko = 0.09 * Math.pow(e, (0.08 * soil.angle!))
                const T = Ko * calculatedValues.po! * Math.tan(soil.angle! * TAN)
                shaftCapacity = T * soilHeight * 0.1884
                bearingCapacity = soil.qult! * 0.001223
                updatedSoil = {
                  ko: roundToTwoDecimals(Ko),
                  t: roundToTwoDecimals(T),
                  shaftCapacity: roundToTwoDecimals(shaftCapacity),
                  bearingCapacity: roundToTwoDecimals(bearingCapacity)
                }
              }
            }
          }

          //Conditon 3 > No engineered props edited
          else {
            if (pileData.pileDiameter === "100") {
              shaftCapacity = soil.soilType === "fine" ? calculatedValues.su! * soilHeight * 0.314 : calculatedValues.t! * soilHeight * 0.314
              bearingCapacity = calculatedValues.qult! * 0.002463
            } else {
              shaftCapacity = soil.soilType === "fine" ? calculatedValues.su! * soilHeight * 0.1884 : calculatedValues.t! * soilHeight * 0.1884
              bearingCapacity = calculatedValues.qult! * 0.001223
            }
            updatedSoil = {
              ...calculatedValues,
              shaftCapacity: roundToTwoDecimals(shaftCapacity),
              bearingCapacity: roundToTwoDecimals(bearingCapacity)
            }  
          }
          
          const snakeCaseSoil = camelToSnake(updatedSoil)
          const supabase = await createClient()
          const { error } = await supabase
          .from('soils')
          .update(snakeCaseSoil)
          .eq('id', soil.id)

          //if update failed, return false for error message else return true for success message
          if (error) {
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
      revalidatePath('/configuration')
      return { message: "All soil layers calculated successfully" }
    } 
    else {
      return { message: "Some soil layers failed to calculate. Please try again.", errors: {}}
    }

  } catch {
    return { message: "Failed to calculate all soil layers, please try again later.", errors: {}}
  }
}