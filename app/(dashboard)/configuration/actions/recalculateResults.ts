'use server'
import { createClient } from "@/utils/supabase/server"
import { calculateResultsForFineSoil, calculateResultsForSoils, calculateResultsForFineSoilCPT, calculateResultsForSoilsCPT } from "@/lib/equations"
import type { CalculationResult } from "@/schemas/types"

export async function recalculateResults(soilId: string, testType: string, soilType: string): Promise<{ data: CalculationResult; errors: null } | { errors: Record<string, unknown>; data?: never }> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
    .from('soils')
    .select("start_depth, end_depth, y_moist, y_sat, n_value, qca, qc, kc, a, soil_profile_id")
    .eq('id', soilId)
    .single()
    
    if (error || !data) {
      throw new Error()
    }
    
    let result: CalculationResult
    if (testType === "spt") {
      if (soilType === "fine") {
        const calcResult = await calculateResultsForFineSoil(data, data.soil_profile_id)
        result = { ...calcResult, testType: 'spt', soilType: 'fine' } as CalculationResult
      } 
      
      else {
        const calcResult = await calculateResultsForSoils(data, data.soil_profile_id)
        result = { ...calcResult, testType: 'spt', soilType: soilType as 'coarse' | 'manmade'  } as CalculationResult
      }
    } 
  
    else {
      if (soilType === "fine") {
        const calcResult = await calculateResultsForFineSoilCPT(data, data.soil_profile_id)
        result = { ...calcResult, testType: 'cpt', soilType: 'fine' } as CalculationResult
      } 
      
      else {
        const calcResult = await calculateResultsForSoilsCPT(data, data.soil_profile_id)
        result = { ...calcResult, testType: 'cpt', soilType: soilType as 'coarse' | 'manmade' } as CalculationResult
      }
    }

    return { data: result, errors: null }
  }
  
  catch {
    return { errors: {} }
  }
}