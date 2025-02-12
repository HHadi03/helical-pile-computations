"use server"
import { API_URL } from "@/app/lib/api/getSoils"
import { TcalculateSchema, calculateResultsForFineSoil, calculateResultsForSoils } from "@/app/lib/schemas/calculateSchema"
import { TsoilSchema } from "@/app/lib/schemas/soilSchema"
import { getPile } from "@/app/lib/api/getPile"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function submitCalculations(values: Partial<TcalculateSchema>, soil: TsoilSchema, h: number): Promise<ReturnType> {
  if (values.Su === 0) {
    return {
      message: "Undrained Soil Shear Strength must be greater than 0.",
      errors: { Su: ["Su must be greater than 0"] }
    }
  }

  if (values.Angle === 0) {
    return {
      message: "Internal Friction Angle must be greater than 0.",
      errors: { Angle: ["φ must be greater than 0"] }
    }
  }

  if (!soil.id) {
    return {
      message: "Soil ID is required for updates.",
      errors: { soil: ["Soil ID is missing"] }
    }
  }

  try {
    const pileData = await getPile()
    let shaftCapacity: number
    let bearingCapacity: number

    if (pileData!.pileDiameter === "100") {
      shaftCapacity = soil.soilType === "fine" ? values.Su! * h * 0.314 : values.T! * h * 0.314
      bearingCapacity = values.Qult! * 0.002463

    } else {
      shaftCapacity = soil.soilType === "fine" ? values.Su! * h * 0.1884 : values.T! * h * 0.1884
      bearingCapacity = values.Qult! * 0.001223
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
      return { message: "Failed to calculate soil layer. Please try again.", errors: {}}
      }
    return { message: "Soil data calculated successfully" }

  } catch {
    return {message: "Failed to calculate soil layer. Please try again later.", errors: {}}
  }
}

export async function submitAllCalculations(soils: TsoilSchema[]): Promise<ReturnType> {
  try {
    const pileData = await getPile()
    const updates = await Promise.all(soils.map(async (soil) => {
      try {
        const calculatedValues = soil.soilType === "fine" ? calculateResultsForFineSoil(soil) : await calculateResultsForSoils(soil)

        let shaftCapacity: number
        let bearingCapacity: number

        if (pileData!.pileDiameter === "100") {
          shaftCapacity = soil.soilType === "fine" ? calculatedValues.Su! * calculatedValues.h! * 0.314 : calculatedValues.T! * calculatedValues.h! * 0.314
          bearingCapacity = calculatedValues.Qult! * 0.002463 

        } else {
          shaftCapacity = soil.soilType === "fine" ? calculatedValues.Su! * calculatedValues.h! * 0.1884 : calculatedValues.T! * calculatedValues.h! * 0.1884
          bearingCapacity = calculatedValues.Qult! * 0.001223
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


