"use server"
import { getPile } from "@/lib/getPile"
import { getSoils } from "@/lib/getSoils"
import { getProfile } from "@/lib/getProfile"
import { calculateResultsForSoils, calculateResultsForFineSoil, roundToTwoDecimals } from "@/lib/equations"
import { createClient } from "@/utils/supabase/server"
import { camelToSnake } from "@/lib/caseConversion"
import { revalidatePath } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

type UpdatedSoil = {
  shaftCapacity60?: number
  shaftCapacity100?: number
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
    // Get all profiles and soils
    const profilesData = await getProfile()
    const allSoils = await getSoils()
    
    // For tracking success across all profiles
    const profileResults = await Promise.all(profilesData.map(async (profile) => {
      try {
        // Filter soils for this profile
        const profileSoils = allSoils.filter((soil) => soil.soilProfileId === profile.id)
        
        // Get pile data for this profile
        const pileData = await getPile(profile.id)
        if (!pileData) {
          console.error(`Failed to fetch pile data for profile ${profile.id}`)
          return false
        }

        // Process each soil in this profile
        const soilCalculations = await Promise.all(profileSoils.map(async (soil) => {
          try {
            // If soil layer starts below pile length, no need to calculate
            if (soil.startDepth >= pileData.pileLength) {
              return true
            }
            
            // Create a new soil object with calculated values
            const calculatedValues = soil.soilType === "fine" 
              ? await calculateResultsForFineSoil(soil) 
              : await calculateResultsForSoils(soil)
        
            // Determine soil height based on pile length
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
            
            // If soil height is greater than 0, continue with calculations
            if (soilHeight > 0) {
              let shaftCapacity60: number
              let shaftCapacity100: number
              let bearingCapacity: number
              let updatedSoil: UpdatedSoil = {}
              const e = 2.71828183
              const TAN = 0.01745
              
              // Condition 0 > If T and Qult is Edited
              if (isTFieldEdited && hasCriticalChanges && soil.soilType === 'coarse') {
                shaftCapacity60 = soil.t! * soilHeight * 0.1884
                shaftCapacity100 = soil.t! * soilHeight * 0.314
                bearingCapacity = pileData.pileDiameter === "100" 
                  ? soil.qult! * 0.002463
                  : soil.qult! * 0.001223
                  
                updatedSoil = {
                  shaftCapacity60: roundToTwoDecimals(shaftCapacity60),
                  shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                  bearingCapacity: roundToTwoDecimals(bearingCapacity)
                }
              }

              // Condition 1 > If T is Edited
              else if (isTFieldEdited && soil.soilType === 'coarse') {
                shaftCapacity60 = soil.t! * soilHeight * 0.1884
                shaftCapacity100 = soil.t! * soilHeight * 0.314
                bearingCapacity = pileData.pileDiameter === "100" 
                  ? calculatedValues.qult! * 0.002463
                  : calculatedValues.qult! * 0.001223
                  
                updatedSoil = {
                  shaftCapacity60: roundToTwoDecimals(shaftCapacity60),
                  shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                  bearingCapacity: roundToTwoDecimals(bearingCapacity)
                }
              } 
              
              // Condition 2 > If Su/Angle/Qult is Edited
              else if (hasCriticalChanges) {
                if (soil.soilType === "fine") {
                  shaftCapacity60 = soil.su! * soilHeight * 0.1884
                  shaftCapacity100 = soil.su! * soilHeight * 0.314
                  bearingCapacity = pileData.pileDiameter === "100" 
                    ? soil.qult! * 0.002463
                    : soil.qult! * 0.001223
                    
                  updatedSoil = {
                    shaftCapacity60: roundToTwoDecimals(shaftCapacity60),
                    shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                    bearingCapacity: roundToTwoDecimals(bearingCapacity)
                  }
                } else {
                  const Ko = 0.09 * Math.pow(e, (0.08 * soil.angle!))
                  const T = Ko * calculatedValues.po! * Math.tan(soil.angle! * TAN)
                  shaftCapacity60 = T * soilHeight * 0.1884
                  shaftCapacity100 = T * soilHeight * 0.314
                  bearingCapacity = pileData.pileDiameter === "100" 
                    ? soil.qult! * 0.002463
                    : soil.qult! * 0.001223
                    
                  updatedSoil = {
                    ko: roundToTwoDecimals(Ko),
                    t: roundToTwoDecimals(T),
                    shaftCapacity60: roundToTwoDecimals(shaftCapacity60),
                    shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                    bearingCapacity: roundToTwoDecimals(bearingCapacity)
                  }
                }
              }

              // Conditon 3 > No engineered props edited
              else {
                if (soil.soilType === "fine") {
                  shaftCapacity60 = calculatedValues.su! * soilHeight * 0.1884
                  shaftCapacity100 = calculatedValues.su! * soilHeight * 0.314
                } else {
                  shaftCapacity60 = calculatedValues.t! * soilHeight * 0.1884
                  shaftCapacity100 = calculatedValues.t! * soilHeight * 0.314
                }
                
                bearingCapacity = pileData.pileDiameter === "100" 
                  ? calculatedValues.qult! * 0.002463
                  : calculatedValues.qult! * 0.001223
                  
                updatedSoil = {
                  ...calculatedValues,
                  shaftCapacity60: roundToTwoDecimals(shaftCapacity60),
                  shaftCapacity100: roundToTwoDecimals(shaftCapacity100),
                  bearingCapacity: roundToTwoDecimals(bearingCapacity)
                }  
              }
              
              // Update the soil in the database
              const snakeCaseSoil = camelToSnake(updatedSoil)
              const supabase = await createClient()
              const { error } = await supabase
                .from('soils')
                .update(snakeCaseSoil)
                .eq('id', soil.id)

              // If update failed, return false for error message
              if (error) {
                console.error(`Failed to update soil ${soil.id}: ${error.message}`)
                return false
              }
              return true
            }
            // If soil height is 0, return true for success message
            return true
            
          } catch (error) {
            console.error(`Error processing soil ${soil.id}: ${error}`)
            return false
          }
        }))

        // Check if all soil calculations for this profile were successful
        return soilCalculations.every(success => success)
        
      } catch (error) {
        console.error(`Error processing profile ${profile.id}: ${error}`)
        return false
      }
    }))

    // Check if all profile calculations were successful
    const allSuccessful = profileResults.every(success => success)
    if (allSuccessful) {
      revalidatePath('/configuration')
      return { message: "All soil profiles calculated successfully" }
    } else {
      return { message: "Some soil profiles failed to calculate. Please try again.", errors: {}}
    }

  } catch (error) {
    console.error(`Global error in calculateAll: ${error}`)
    return { message: "Failed to calculate soil profiles, please try again later.", errors: {}}
  }
}