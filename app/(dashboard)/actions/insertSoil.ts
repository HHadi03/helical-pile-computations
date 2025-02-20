"use server"
import { soilSchema, TsoilSchema } from "@/app/schemas/soilSchema"
import { getSoils } from "@/app/lib/api/getSoils" 
import { API_URL } from "@/app/lib/api/getSoils"
import { revalidatePath } from "next/cache"
import { calculateResultsForFineSoil, calculateResultsForSoils } from "@/app/lib/equations"

type ReturnType = {
    message: string
    errors?: Record<string, string[]>
}

export async function insertSoil(soil: TsoilSchema): Promise<ReturnType> {
    const parsed = soilSchema.safeParse(soil)
    if (!parsed.success) {
        return {
            message: "Please check the highlighted fields and try again.",
            errors: parsed.error.flatten().fieldErrors
        }
    }

    const existingSoils = await getSoils()
    if (existingSoils.length === 0 && soil.startDepth > 0) {
        return {
            message: "The first soil layer must start at depth 0m.",
            errors: {startDepth: ["First soil layer must start at 0m"]}
        }
    }

    const sortedSoils = existingSoils.sort((a, b) => a.startDepth - b.startDepth)
    const lastSoilLayer = sortedSoils[sortedSoils.length - 1]
    if (lastSoilLayer && soil.startDepth !== lastSoilLayer.endDepth) {
        return {
            message: "The start depth must match the end depth of the previous soil layer.",
            errors: {startDepth: [`Start depth must be ${lastSoilLayer.endDepth}m to match the previous layer`]}
        }
    }

    if (soil.soilType === "fine") {soil = { ...soil, ...calculateResultsForFineSoil(soil) }}
    else {soil = { ...soil, ...await calculateResultsForSoils(soil) }}
    
    try {
        const response = await fetch(`${API_URL}/soil`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(soil)
        })

        if (!response.ok) {
            return {message: "Failed to submit soil data. Please try again.", errors: {}}
        }
        revalidatePath('/Configuration')
        return { message: "Soil data submitted successfully 🎉" }

    } catch {
        return {message: "Failed to submit soil data. Please try again later.", errors: {}}
    }
}