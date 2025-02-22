"use server"
import { API_URL } from "@/app/lib/api/getSoils"
import { TsoilSchema } from "@/app/schemas/soilSchema"
import { getPile } from "@/app/lib/api/getPile"
import { calculateResultsForFineSoil, calculateResultsForSoils } from "@/app/lib/equations"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function calculateAll(soils: TsoilSchema[], hasCriticalChanges: boolean, isTFieldEdited: boolean): Promise<ReturnType> {
  try {
    const pileData = await getPile()
    const updates = await Promise.all(soils.map(async (soil) => {
      try {
        const calculatedValues = soil.soilType === "fine" ? await calculateResultsForFineSoil(soil) : await calculateResultsForSoils(soil)
        console.log(calculatedValues)
        
        let shaftCapacity: number
        let bearingCapacity: number
        
        //Condition 1 > If T is Edited
        if (isTFieldEdited && soil.soilType === 'coarse') {
          if (pileData!.pileDiameter === "100") {
            shaftCapacity = soil.T! * soil.h! * 0.314
            bearingCapacity = calculatedValues.Qult! * 0.002463
          } else {
            shaftCapacity = soil.T! * soil.h! * 0.1884
            bearingCapacity = calculatedValues.Qult! * 0.001223
          }
        } 
        
        //Condition 2 > If Su/Angle/Qult is Edited
        else if (hasCriticalChanges) {
          if (pileData!.pileDiameter === "100") {
            if (soil.soilType === "fine") {
              shaftCapacity = soil.Su! * soil.h! * 0.314
            } else {
              const Ko = 0.09 * Math.pow(2.71828183, (0.08 * soil.Angle!))
              shaftCapacity = Ko * calculatedValues.Po! * Math.tan(soil.Angle! * 0.01745) * soil.h! * 0.314
            }
            bearingCapacity = soil.Qult! * 0.002463
          } else {
            if (soil.soilType === "fine") {
              shaftCapacity = soil.Su! * soil.h! * 0.1884
            } else {
              const Ko = 0.09 * Math.pow(2.71828183, (0.08 * soil.Angle!))
              shaftCapacity = Ko * calculatedValues.Po! * Math.tan(soil.Angle! * 0.01745) * soil.h! * 0.1884
            }
            bearingCapacity = soil.Qult! * 0.001223
          }
        } 

        //Conditon 3 > No engineered props edited
        else {
          if (pileData!.pileDiameter === "100") {
            shaftCapacity = soil.soilType === "fine" 
              ? calculatedValues.Su! * calculatedValues.h! * 0.314 
              : calculatedValues.T! * calculatedValues.h! * 0.314
            bearingCapacity = calculatedValues.Qult! * 0.002463
          } else {
            shaftCapacity = soil.soilType === "fine" 
              ? calculatedValues.Su! * calculatedValues.h! * 0.1884 
              : calculatedValues.T! * calculatedValues.h! * 0.1884
            bearingCapacity = calculatedValues.Qult! * 0.001223
          }
        }

        const updatedSoil = {
          ...soil,
          shaftCapacity: Math.round(shaftCapacity * 100) / 100,
          bearingCapacity: Math.round(bearingCapacity * 100) / 100
        }

        const response = await fetch(`${API_URL}/soil/${soil.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSoil)
        })

        if (!response.ok) {
          return false
        }
        return true
      } catch {
        return false
      }
    }))

    const allSuccessful = updates.every(success => success)
    if (allSuccessful) {
      return { message: "All soil layers calculated successfully" }
    } else {
      return { message: "Some soil layers failed to calculate. Please try again.", errors: {}}
    }
  } catch {
    return { message: "Failed to calculate all soil layers, please try again later.", errors: {}}
  }
}