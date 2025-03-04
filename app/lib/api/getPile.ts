import { createZodFetcher } from "zod-fetch"
import { pileSchema } from "@/app/schemas/pileSchema"
import { API_URL } from "./getSoils"

const fetchPile = createZodFetcher()
export async function getPile() {
  try {
    const pile = await fetchPile(
      pileSchema, 
      `${API_URL}/pile/1`,
      {next: {tags: ['pile']}}
    )

    return pile

  } catch {
    return null
  }
}