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

export async function calculateAll(isSuOrAngleEdited: boolean, isTEdited: boolean, isQultEdited: boolean): Promise<ReturnType> {

  try {
    const profileData = await getProfiles()
    const soilsData = await getSoils()

    const soilsByProfile = Object.groupBy(soilsData, soil => soil.soilProfileId!)
    const profileCalculations = await Promise.all(profileData.map(async (profile) => {
      try {
        // Calculate in ground pile length
        let pileLength: number
        if (profile.pileStickOut > profile.pileLength) {
          pileLength = 0
        } else {
          pileLength = profile.pileLength - profile.pileStickOut
        }

        const profileSoils = soilsByProfile[profile.id!] || []
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
              
              // Condition 1 > If only T is Edited
              if (isTEdited && soil.soilType !== "fine") {
                console.log(soil.soil + "Condition 1")
                shaftCapacity60 = soil.t! * soilHeight * 0.1884
                shaftCapacity100 = soil.t! * soilHeight * 0.314
                bearingCapacity60 = calculatedValues.qult! * 0.001223
                bearingCapacity100 = calculatedValues.qult! * 0.002463
                
                updatedSoil = {
                  shaftCapacity60: roundToTwoDecimals(shaftCapacity60), shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                  bearingCapacity60: roundToTwoDecimals(bearingCapacity60), bearingCapacity100: roundToTwoDecimals(bearingCapacity100),
                }
              } 

              // Condition 3 > If T & Qult is Edited
              else if (isTEdited && isQultEdited && soil.soilType !== "fine") {
                console.log(soil.soil + "condition 2")
                shaftCapacity60 = soil.t! * soilHeight * 0.1884
                shaftCapacity100 = soil.t! * soilHeight * 0.314
                bearingCapacity60 = soil.qult! * 0.001223
                bearingCapacity100 = soil.qult! * 0.002463
                
                updatedSoil = {
                  shaftCapacity60: roundToTwoDecimals(shaftCapacity60), shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                  bearingCapacity60: roundToTwoDecimals(bearingCapacity60), bearingCapacity100: roundToTwoDecimals(bearingCapacity100),
                }
              } 
              
              // Condition 4 > If Su/Angle is Edited
              else if (isSuOrAngleEdited) {
                console.log(soil.soil + "conditon 3")
                if (soil.soilType === "fine") {
                  shaftCapacity60 = soil.su! * soilHeight * 0.1884
                  shaftCapacity100 = soil.su! * soilHeight * 0.314
                  bearingCapacity60 = calculatedValues.qult! * 0.001223
                  bearingCapacity100 = calculatedValues.qult! * 0.002463
                
                  updatedSoil = {
                    shaftCapacity60: roundToTwoDecimals(shaftCapacity60), shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                    bearingCapacity60: roundToTwoDecimals(bearingCapacity60), bearingCapacity100: roundToTwoDecimals(bearingCapacity100),
                  }
                }

                else {
                  const Ko = 0.09 * Math.pow(e, (0.08 * soil.angle!))
                  const newT = Ko * calculatedValues.po! * Math.tan(soil.angle! * TAN)
                  shaftCapacity60 = newT * soilHeight * 0.1884
                  shaftCapacity100 = newT * soilHeight * 0.314
                  bearingCapacity60 = calculatedValues.qult! * 0.001223
                  bearingCapacity100 = calculatedValues.qult! * 0.002463
                 
                  updatedSoil = {
                    ko: roundToTwoDecimals(Ko), t: roundToTwoDecimals(newT),
                    shaftCapacity60: roundToTwoDecimals(shaftCapacity60), shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                    bearingCapacity60: roundToTwoDecimals(bearingCapacity60), bearingCapacity100: roundToTwoDecimals(bearingCapacity100),
                  }
                }
              }
              
              // Condition 5 > If Su/Angle & Qult is Edited
              else if (isSuOrAngleEdited && isQultEdited) {
                if (soil.soilType === "fine") {
                  shaftCapacity60 = soil.su! * soilHeight * 0.1884
                  shaftCapacity100 = soil.su! * soilHeight * 0.314
                  bearingCapacity60 = soil.qult! * 0.001223
                  bearingCapacity100 = soil.qult! * 0.002463
                
                  updatedSoil = {
                    shaftCapacity60: roundToTwoDecimals(shaftCapacity60), shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                    bearingCapacity60: roundToTwoDecimals(bearingCapacity60), bearingCapacity100: roundToTwoDecimals(bearingCapacity100),
                  }
                }

                else {
                  const Ko = 0.09 * Math.pow(e, (0.08 * soil.angle!))
                  const newT = Ko * calculatedValues.po! * Math.tan(soil.angle! * TAN)
                  shaftCapacity60 = newT * soilHeight * 0.1884
                  shaftCapacity100 = newT * soilHeight * 0.314
                  bearingCapacity60 = soil.qult! * 0.001223
                  bearingCapacity100 = soil.qult! * 0.002463
                 
                  updatedSoil = {
                    ko: roundToTwoDecimals(Ko), t: roundToTwoDecimals(newT),
                    shaftCapacity60: roundToTwoDecimals(shaftCapacity60), shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                    bearingCapacity60: roundToTwoDecimals(bearingCapacity60), bearingCapacity100: roundToTwoDecimals(bearingCapacity100),
                  }
                }
              }

              // Condition 6 > No engineered props edited
              else {
                if (soil.soilType === "fine") {
                  shaftCapacity60 = calculatedValues.su! * soilHeight * 0.1884
                  shaftCapacity100 = calculatedValues.su! * soilHeight * 0.314
                  bearingCapacity60 = calculatedValues.qult! * 0.001223
                  bearingCapacity100 = calculatedValues.qult! * 0.002463
                } 
                
                else {
                  shaftCapacity60 = calculatedValues.t! * soilHeight * 0.1884
                  shaftCapacity100 = calculatedValues.t! * soilHeight * 0.314
                  bearingCapacity60 = calculatedValues.qult! * 0.001223
                  bearingCapacity100 = calculatedValues.qult! * 0.002463
                }
                
                updatedSoil = {
                  ...calculatedValues,
                  shaftCapacity60: roundToTwoDecimals(shaftCapacity60), shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                  bearingCapacity60: roundToTwoDecimals(bearingCapacity60), bearingCapacity100: roundToTwoDecimals(bearingCapacity100),
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
            // If soil height is 0, return true for success message (skip this soil)
            return true  
          }

          catch {
            return false
          }
        }))

        // Check if all soil calculations for this profile were successful
        return soilCalculations.every((success: boolean) => success)
      } 
      
      catch {
        return false
      }
    }))

    const allSuccessful = profileCalculations.every((success: boolean) => success)
    if (!allSuccessful) {
     return { message: "Some soil layers failed to calculate, Please try again later.", errors: {}}
    }

    revalidatePath('/configuration')
    return { message: "Soil layers have been successfully calculated" }
  }

  catch {
    return { message: "Failed to calculate all soil layers, please try again later.", errors: {}}
  }
}