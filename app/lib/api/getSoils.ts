import { createZodFetcher } from "zod-fetch"
import { z } from "zod"
import { soilSchema, TsoilSchema } from "@/app/lib/schemas/soilSchema"
export const API_URL = process.env.API_URL || "http://localhost:3500" //https://dl1kvzlj-3500.uks1.devtunnels.ms

const fetchSoils = createZodFetcher()
export async function getSoils(): Promise<TsoilSchema[]> {

  try {
    const soils = await fetchSoils(
      z.array(soilSchema),
      `${API_URL}/soil`,
      {cache: "no-store"}
    )

    return soils
    
  } catch (error) {
    return []
  }
}