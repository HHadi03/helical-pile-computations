"use server"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteProfile(id: string, name: string) {
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
		return { message: `${name} has been successfully deleted`}
	}
	
	catch {
		return { message: `Failed to delete ${name}. please try again later.`, errors: {}}
	}
}