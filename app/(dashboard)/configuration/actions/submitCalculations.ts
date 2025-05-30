"use server"
import { getSoils } from "@/lib/getSoils"
import { calculateResultsForSoils, calculateResultsForFineSoil, roundToTwoDecimals } from "@/lib/equations"
import { createClient } from "@/utils/supabase/server"
import { camelToSnake } from "@/lib/caseConversion"
import { revalidatePath } from "next/cache"
import { getProfiles } from "@/lib/getProfiles"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

type UpdatedSoil = {
  shaftCapacity60?: number
  shaftCapacity100?: number
  bearingCapacity60?: number
  bearingCapacity100?: number
  po?: number | null
  angle?: number | null
  ko?: number | null
  t?: number | null
  su?: number | null
}

export async function calculateAll(hasCriticalChanges: boolean, isTFieldEdited: boolean): Promise<ReturnType> {
  
  try {
    const profileData = await getProfiles()
    const soilsData = await getSoils()

    const profileCalculations = await Promise.all(profileData.map(async (profile) => {
      try {
        //Calculate Pile Length
        let pileLength: number
        if (profile.pileStickOut > profile.pileLength) {
          pileLength = 0
        } else {
          pileLength = profile.pileLength - profile.pileStickOut
        }

        // Get soils for this profile
        const profileSoils = soilsData.filter((soil) => soil.soilProfileId === profile.id)

        // Process each soil layer in this profile
        const soilCalculations = await Promise.all(profileSoils.map(async (soil) => {
          try {
            // If soil layer starts below pile length, no need to calculate, return true for success message
            if (soil.startDepth >= pileLength) {
              return true
            }
            
            // Create a new soil object with calculated values
            const calculatedValues = soil.soilType === "fine" ? await calculateResultsForFineSoil(soil) : await calculateResultsForSoils(soil, profile.waterDepth)
        
            // Determine soil height based on pile length
            let soilHeight: number
            if (soil.endDepth <= pileLength) {
              soilHeight = soil.h!
            }
            else if (soil.startDepth < pileLength) {
              soilHeight = pileLength - soil.startDepth
            }
            else {
              soilHeight = 0
            }
            
            // If soil height is greater than 0, continue with code execution
            if (soilHeight > 0) {
              let shaftCapacity60: number
              let shaftCapacity100: number
              let bearingCapacity60: number
              let bearingCapacity100: number
              let updatedSoil: UpdatedSoil = {}
              const e = 2.71828183
              const TAN = 0.01745
              
              // Condition 0 > If T and Qult is Edited
              if (isTFieldEdited && hasCriticalChanges && soil.soilType === 'coarse') {
                shaftCapacity60 = soil.t! * soilHeight * 0.1884
                shaftCapacity100 = soil.t! * soilHeight * 0.314
                bearingCapacity60 = soil.qult! * 0.001223
                bearingCapacity100 = soil.qult! * 0.002463
                
                updatedSoil = {
                  shaftCapacity60: roundToTwoDecimals(shaftCapacity60),
                  shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                  bearingCapacity60: roundToTwoDecimals(bearingCapacity60),
                  bearingCapacity100: roundToTwoDecimals(bearingCapacity100),
                }
              }

              // Condition 1 > If T is Edited
              else if (isTFieldEdited && soil.soilType === 'coarse') {
                shaftCapacity60 = soil.t! * soilHeight * 0.1884
                shaftCapacity100 = soil.t! * soilHeight * 0.314
                bearingCapacity60 = calculatedValues.qult! * 0.001223
                bearingCapacity100 = calculatedValues.qult! * 0.002463
                
                updatedSoil = {
                  shaftCapacity60: roundToTwoDecimals(shaftCapacity60),
                  shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                  bearingCapacity60: roundToTwoDecimals(bearingCapacity60),
                  bearingCapacity100: roundToTwoDecimals(bearingCapacity100),
                }
              } 
              
              // Condition 2 > If Su/Angle/Qult is Edited
              else if (hasCriticalChanges) {
                if (soil.soilType === "fine") {
                  shaftCapacity60 = soil.su! * soilHeight * 0.1884
                  shaftCapacity100 = soil.su! * soilHeight * 0.314
                  bearingCapacity60 = soil.qult! * 0.001223
                  bearingCapacity100 = soil.qult! * 0.002463
                
                  updatedSoil = {
                    shaftCapacity60: roundToTwoDecimals(shaftCapacity60),
                    shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                    bearingCapacity60: roundToTwoDecimals(bearingCapacity60),
                    bearingCapacity100: roundToTwoDecimals(bearingCapacity100),
                  }
                } else {
                  const Ko = 0.09 * Math.pow(e, (0.08 * soil.angle!))
                  const T = Ko * calculatedValues.po! * Math.tan(soil.angle! * TAN)
                  shaftCapacity60 = T * soilHeight * 0.1884
                  shaftCapacity100 = T * soilHeight * 0.314
                  bearingCapacity60 = calculatedValues.qult! * 0.001223
                  bearingCapacity100 = calculatedValues.qult! * 0.002463
                 
                  updatedSoil = {
                    ko: roundToTwoDecimals(Ko),
                    t: roundToTwoDecimals(T),
                    shaftCapacity60: roundToTwoDecimals(shaftCapacity60),
                    shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                    bearingCapacity60: roundToTwoDecimals(bearingCapacity60),
                    bearingCapacity100: roundToTwoDecimals(bearingCapacity100),
                  }
                }
              }

              // Condition 3 > No engineered props edited
              else {
                if (soil.soilType === "fine") {
                  shaftCapacity60 = calculatedValues.su! * soilHeight * 0.1884
                  shaftCapacity100 = calculatedValues.su! * soilHeight * 0.314
                  bearingCapacity60 = calculatedValues.qult! * 0.001223
                  bearingCapacity100 = calculatedValues.qult! * 0.002463
                } else {
                  shaftCapacity60 = calculatedValues.t! * soilHeight * 0.1884
                  shaftCapacity100 = calculatedValues.t! * soilHeight * 0.314
                  bearingCapacity60 = calculatedValues.qult! * 0.001223
                  bearingCapacity100 = calculatedValues.qult! * 0.002463
                }
                
                updatedSoil = {
                  ...calculatedValues,
                  shaftCapacity60: roundToTwoDecimals(shaftCapacity60),
                  shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                  bearingCapacity60: roundToTwoDecimals(bearingCapacity60),
                  bearingCapacity100: roundToTwoDecimals(bearingCapacity100),
                }  
              }
              
              const snakeCaseSoil = camelToSnake(updatedSoil)
              const supabase = await createClient()
              const { error } = await supabase
                .from('soils')
                .update(snakeCaseSoil)
                .eq('id', soil.id)

              // If update failed, return false for error message else return true for success message
              if (error) {
                return false
              }
              return true
            }
            // If soil height is 0, return true for success message
            return true
            
          } catch {
            return false
          }
        }))

        // Check if all soil calculations for this profile were successful
        return soilCalculations.every((success: boolean) => success)
        
      } catch {
        return false
      }
    }))

    const allSuccessful = profileCalculations.every((success: boolean) => success)
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