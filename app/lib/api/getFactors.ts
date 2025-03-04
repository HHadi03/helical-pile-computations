import { createZodFetcher } from "zod-fetch"
import { safetySchema } from "@/app/schemas/safetyFactorsSchema"
import { API_URL } from "./getSoils"

const fetchFactors = createZodFetcher()
export async function getFactors(){
  try {
    const factors = await fetchFactors(
      safetySchema,
      `${API_URL}/factors/1`,
      { cache: 'no-store' },
    )

    return factors

  } catch {
    return null
  }
}
