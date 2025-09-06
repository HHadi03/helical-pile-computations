"use server"
import { revalidatePath } from "next/cache"

export async function revalidateVisualisation() {
  revalidatePath("/visualisation")
}