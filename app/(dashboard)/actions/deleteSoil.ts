"use server"
import { API_URL } from "@/app/lib/api/getSoils"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function deleteSoil(id: string): Promise<ReturnType> {
  if (!id) {
    return {
      message: "Please provide a valid soil ID.",
      errors: {id: ["Soil ID is required for deletion"]}
    }
  }

  try {
    const response = await fetch(`${API_URL}/soil/${id}`, {
      method: "DELETE",
      headers: {"Content-Type": "application/json"}
    })

    if (!response.ok) {
      return {message: "Failed to delete soil. Please try again.", errors: {}}
    }
    return { message: "Soil deleted successfully" }

  } catch {
    return {message: "Failed to delete soil. Please try again later.", errors: {}}
  }
}