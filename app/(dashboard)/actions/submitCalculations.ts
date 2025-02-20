"use server"
import { API_URL } from "@/app/lib/api/getSoils"
import { TsoilSchema } from "@/app/schemas/soilSchema"
import { getPile } from "@/app/lib/api/getPile"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}
export async function calculateAll(soils: TsoilSchema[]): Promise<ReturnType> {
  try {
    const pileData = await getPile()
    const updates = await Promise.all(soils.map(async (soil) => {
      try {
        
        let shaftCapacity: number
        let bearingCapacity: number

        if (pileData!.pileDiameter === "100") {
          shaftCapacity = soil.soilType === "fine" ? soil.Su! * soil.h! * 0.314 : (soil.Ko! * soil.Po! * Math.tan(soil.Angle! * 0.01745))  * soil.h! * 0.314
          bearingCapacity = soil.Qult! * 0.002463 

        } else {
          shaftCapacity = soil.soilType === "fine" ? soil.Su! * soil.h! * 0.1884 : (soil.Ko! * soil.Po! * Math.tan(soil.Angle! * 0.01745)) * soil.h! * 0.1884
          bearingCapacity = soil.Qult! * 0.001223
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
      return { message: "Some soil layers failed to calculate. Please try again.", errors: {}}}

  } catch {
      return {message: "Failed to calculate all soil layers, please try again later.", errors: {}}
    }
}


