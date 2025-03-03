import { createZodFetcher } from "zod-fetch"
import { pileSchema } from "@/app/schemas/pileSchema"
import { API_URL } from "./getSoils"

const fetchWithZod = createZodFetcher()
export async function getPile() {
  try {
    const pile = await fetchWithZod(
      pileSchema, 
      `${API_URL}/pile/1`,
      {next: {tags: ['pile']}}
    )

    return pile

  } catch {
    return null
  }
}