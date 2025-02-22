"use server"
import { soilSchema, TsoilSchema } from "@/app/schemas/soilSchema"
import { API_URL } from "@/app/lib/api/getSoils"
import { revalidateTag } from "next/cache"
import { calculateResultsForFineSoil, calculateResultsForSoils } from "@/app/lib/equations"
import { getSoil } from "@/app/lib/api/getSoil"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function updateSoil(soil: TsoilSchema): Promise<ReturnType> {
  const parsed = soilSchema.safeParse(soil)
  if (!parsed.success) {
    return {
      message: "Please check the highlighted fields and try again.",
      errors: parsed.error.flatten().fieldErrors
    }
  }
  
  // Server Validation
  const existingSoil = await getSoil(soil.id!)
  if (!existingSoil) {
    return { message: "Failed to update soil data. Please try again.", errors: {}}
  }

  const fields: (keyof TsoilSchema)[] = ["nValue", "yMoist", "ySat"]
  const fieldsChanged = fields.some((field) => soil[field] !== existingSoil[field])
  const angleChanged = soil.Angle !== existingSoil.Angle

  let updatedSoil = { ...soil }

  if (angleChanged) {
    const Ko = Number((0.09 * Math.pow(2.71828183, (0.08 * soil.Angle!))).toFixed(2))
    const T = Number((Ko * soil.Po! * Math.tan(soil.Angle! * 0.01745)).toFixed(2))
    updatedSoil = { ...updatedSoil, Ko, T }
  }

  if (fieldsChanged) {const newCalculations = soil.soilType === "fine" ? calculateResultsForFineSoil(soil) : await calculateResultsForSoils(soil)

    updatedSoil = { ...updatedSoil, ...Object.fromEntries(Object.entries(newCalculations).map(([key, value]) => [
    key,soil[key as keyof TsoilSchema] !== existingSoil[key as keyof TsoilSchema] ? soil[key as keyof TsoilSchema]  : value]))}
  }
  // End of Server Validation

  try {
    const response = await fetch(`${API_URL}/soil/${soil.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSoil)
    })

    if (!response.ok) {
      return { message: "Failed to update soil data. Please try again.", errors: {} }
    }
    revalidateTag('soil')
    return { message: "Soil data updated successfully" }

  } catch {
    return { message: "Failed to update soil data. Please try again later.", errors: {} }
  }
}
