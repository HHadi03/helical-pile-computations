"use server"
import { soilSchema, TsoilSchema } from "@/app/schemas/soilSchema"
import { API_URL } from "@/app/lib/api/getSoils"
import { revalidateTag } from "next/cache"

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
  
  try {
    const response = await fetch(`${API_URL}/soil/${soil.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(soil)
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
