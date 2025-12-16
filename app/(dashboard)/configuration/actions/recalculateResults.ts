'use server'
import { createClient } from "@/utils/supabase/server"
import { calculateResultsForFineSoil, calculateResultsForSoils, calculateResultsForFineSoilCPT, calculateResultsForSoilsCPT } from "@/lib/equations"

type CalculationResult = 
| {
    testType: 'spt'
    soilType: 'fine'
    su: number
    qult: number
    shaft_capacity60: number
    shaft_capacity100: number
    bearing_capacity60: number
    bearing_capacity100: number
  }
| {
    testType: 'spt'
    soilType: 'coarse' | 'manmade'
    angle: number
    t: number
    qult: number
    shaft_capacity60: number
    shaft_capacity100: number
    bearing_capacity60: number
    bearing_capacity100: number
  }
| {
    testType: 'cpt'
    soilType: 'fine'
    su: number
    qult: number
    shaft_capacity60: number
    shaft_capacity100: number
    bearing_capacity60: number
    bearing_capacity100: number
  }
| {
    testType: 'cpt'
    soilType: 'coarse' | 'manmade'
    t: number
    qult: number
    shaft_capacity60: number
    shaft_capacity100: number
    bearing_capacity60: number
    bearing_capacity100: number
  }

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