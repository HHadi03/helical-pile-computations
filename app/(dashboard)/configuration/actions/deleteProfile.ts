"use server"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function deleteProfile(id: string, name: string): Promise<ReturnType> {

	try {
		const supabase = await createClient()
		const { error } = await supabase
		.from("soil_profiles")
		.delete()
		.eq("id", id)

		if (error) {
			return { message: `Failed to delete ${name}, please try again later.`, errors: {}}
		}

		revalidatePath('/configuration')
		return { message: `${name} has been successfully deleted` }
	}
	
	catch {
		return { message: `Failed to delete ${name}. please try again later.`, errors: {}}
	}
}