import { createZodFetcher } from "zod-fetch"
import { soilSchema } from "@/app/lib/schemas/soilSchema"
import { API_URL } from "./getSoils"

const fetchWithZod = createZodFetcher()
export async function getSoil(id: string) {
  try {
    const soil = await fetchWithZod(
      soilSchema,
      `${API_URL}/soil/${id}`,
      {cache: "no-store"}
    )

    return soil

  } catch (error) {
    return null
  }
}

