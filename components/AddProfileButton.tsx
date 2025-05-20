"use client"
import { Button } from "./ui/button"
import { insertProfile } from "@/app/(dashboard)/configuration/actions/insertProfile"

export const AddProfileButton = () => {
	return (
		<Button onClick={insertProfile}>Add Profile Button</Button>
	)
    
}