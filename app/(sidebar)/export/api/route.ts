import { NextRequest, NextResponse } from 'next/server'
import { exportFormSchema, TexportFormSchema } from '@/schemas/exportSchema'
import { createClient } from '@/utils/supabase/server'
import { TexportSoilProfileSchema } from '@/schemas/soilProfileSchemas'
import { ToverviewSoilSchema } from '@/schemas/soilSchemas'
import puppeteer from 'puppeteer'
import { roundToTwoDecimals } from '@/lib/utils'

async function getProfiles(profileId: string): Promise<TexportSoilProfileSchema> {
  try {
    const supabase = await createClient()
    const {data, error} = await supabase
    .from("soil_profiles")
    .select("profile_name, water_depth, effective_pile_length, pile_stick_out")
    .eq("id", profileId)
    .single()

    if (error) {
      throw new Error()
    }

    return data
  }

  catch {
    throw new Error("Failed to fetch neccessary soil profile data, please try again later.")
  }
}

async function getSoils(profileId: string): Promise<ToverviewSoilSchema[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
    .from('soils')
    .select("id, soil, soil_name, soil_type, soil_profile_id, description, test_type, colour, start_depth, end_depth, n_value, y_moist, y_sat, su, t, shaft_capacity60, shaft_capacity100, bearing_capacity60, bearing_capacity100")
    .order('start_depth', { ascending: true })
    .eq("soil_profile_id", profileId)

    if (error || data.length === 0) {
      throw new Error()
    }
 
    return data 
  }

  catch {
   throw new Error('Please insert soil layers before attempting to export analysis.')
  }
}

const nObjectUKPL: { [key: number]: { s3: number; s4: number } } = {
  1:  {s3: 1.40, s4: 1.40},
  2:  {s3: 1.35, s4: 1.27},
  3:  {s3: 1.33, s4: 1.23},
  4:  {s3: 1.31, s4: 1.20},
  5:  {s3: 1.29, s4: 1.15},
} 

const nObjectNLRigid: { [key: number]: { s3: number; s4: number } } = {
  1: {s3: 1.26, s4: 1.26},
  2: {s3: 1.20, s4: 0.96},
  3: {s3: 1.18, s4: 0.94},
  4: {s3: 1.17, s4: 0.93},
  5: {s3: 1.17, s4: 0.93},
}

const nObjectNLNonRigid: { [key: number]: { s3: number; s4: number } } = {
  1: {s3: 1.39, s4: 1.39},
  2: {s3: 1.32, s4: 1.32},
  3: {s3: 1.30, s4: 1.30},
  4: {s3: 1.28, s4: 1.03},
  5: {s3: 1.28, s4: 1.03},
}

const nObjectMethodTest: { [key: number]: { s1: number; s2: number } } = {
  1: {s1: 1.40, s2: 1.40},
  2: {s1: 1.30, s2: 1.20},
  3: {s1: 1.20, s2: 1.105},
  4: {s1: 1.10, s2: 1.00},
  5: {s1: 1.00, s2: 1.00},
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const body: TexportFormSchema = exportFormSchema.parse(json)

    let soilsData: ToverviewSoilSchema[]
    let profileData: TexportSoilProfileSchema 
    let dynamicParams
    
    switch (body.design_method) {
      case "method_bs":
        
        if (!body.applied_load) {
          throw new Error("Applied Load is required for this design method.")
        }
      
        soilsData = await getSoils(body.soil_profile_id)
        profileData = await getProfiles(body.soil_profile_id)

        const tension = body.pile_diameter === "60" ? soilsData.reduce((sum, soil) => sum + soil.shaft_capacity60, 0) : soilsData.reduce((sum, soil) => sum + soil.shaft_capacity100, 0)
        
        const lastLayer = soilsData.find(soil => soil.start_depth <= profileData.effective_pile_length && profileData.effective_pile_length <= soil.end_depth) || soilsData[soilsData.length - 1]
        const bearingCapacity = body.pile_diameter === "60" ? lastLayer.bearing_capacity60 : lastLayer.bearing_capacity100
        const compression = tension + bearingCapacity
        
        if (body.applied_load <= (tension / body.global_safety_factor)) {
          throw new Error("Applied Load is less than the calculated tension.")
        }
        
        if (body.applied_load <= (compression / body.global_safety_factor)) {
          throw new Error("Applied Load is less than the calculated compression.")
        }

        dynamicParams = {
          tension: roundToTwoDecimals(tension),
          compression: roundToTwoDecimals(compression),
          applied_load: (body.applied_load),
          global_safety_factor: (body.global_safety_factor)
        }
      break;

      case "method_en":

        if (!body.permanent_load || !body.variable_load || !body.country) {
          throw new Error("Permanent Load, Variable Load and Country are required for this design method.")
        }

        soilsData = await getSoils(body.soil_profile_id)
        profileData = await getProfiles(body.soil_profile_id)

        if (body.use_characteristic) {
          const supabase = await createClient()
          const { data, error } = await supabase
          .from('soils')
          .select('shaft_capacity60, shaft_capacity100, bearing_capacity60, bearing_capacity100, soil_profile_id')
          .order('start_depth', { ascending: true })
          .gt("shaft_capacity60", 0)
          
          if (error) {
            throw new Error("Failed to fetch necessary soil data, please try again later.")
          }

          const soilsByProfile = Object.groupBy(data, soil => soil.soil_profile_id)

          const allTensions: number[] = []
          const allCompressions: number[] = []

          for (const profileId in soilsByProfile) {
            const soils = soilsByProfile[profileId]!
            const tension = body.pile_diameter === "60" ? soils.reduce((sum, soil) => sum + soil.shaft_capacity60, 0) : soils.reduce((sum, soil) => sum + soil.shaft_capacity100, 0)
            const compression = tension + (body.pile_diameter === "60" ? soils[soils.length - 1].bearing_capacity60 : soils[soils.length - 1].bearing_capacity100)

            allTensions.push(tension)
            allCompressions.push(compression)
          }
          
          const meanTension = allTensions.reduce((sum, tension) => sum + tension, 0) / allTensions.length
          const minTension = Math.min(...allTensions)
        
          const meanCompression = allCompressions.reduce((sum, compression) => sum + compression, 0) / allCompressions.length
          const minCompression = Math.min(...allCompressions)
          
          const numberOfSoilProfiles = data.length > 5 ? 5 : data.length
          
          let s3: number
          let s4: number

          if (body.country === "nl") {
            if (body.structure_rigid) {
              s3 = nObjectNLRigid[numberOfSoilProfiles].s3
              s4 = nObjectNLRigid[numberOfSoilProfiles].s4
            }

            else {
              s3 = nObjectNLNonRigid[numberOfSoilProfiles].s3
              s4 = nObjectNLNonRigid[numberOfSoilProfiles].s4
            }
          }

          else {
            if (body.structure_rigid) {
              s3 = nObjectUKPL[numberOfSoilProfiles].s3
              s4 = nObjectUKPL[numberOfSoilProfiles].s4
            }

            else {
              s3 = nObjectUKPL[numberOfSoilProfiles].s3 * 0.9
              s4 = nObjectUKPL[numberOfSoilProfiles].s4 * 0.9
            }
          }

          const rckTension = Math.min(meanTension / s3, minTension / s4)
          const rckCompression = Math.min(meanCompression / s3, minCompression / s4)

          if (body.country === "uk") {
            const compressionCombination1 = (body.uk_safety_factor_compression_yG1 * body.permanent_load) + (body.uk_safety_factor_compression_yQ1 * body.variable_load)
            const compressionCombination2 = (body.uk_safety_factor_compression_yG2 * body.permanent_load) + (body.uk_safety_factor_compression_yQ2 * body.variable_load)
            const compressionOutput1 = rckCompression / body.uk_safety_factor_compression_yT1
            const compressionOutput2 = rckCompression / body.uk_safety_factor_compression_yT2

            const tensionCombination1 = (body.uk_safety_factor_tension_yG2 * body.permanent_load) + (body.uk_safety_factor_tension_yQ2 * body.variable_load)
            const tensionCombination2 = (body.uk_safety_factor_tension_yG1 * body.permanent_load) + (body.uk_safety_factor_tension_yQ1 * body.variable_load)
            const tensionOutput1 = rckTension / body.uk_safety_factor_tension_yT1
            const tensionOutput2 = rckTension / body.uk_safety_factor_tension_yT2

            if (compressionCombination1 <= compressionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated compression.")
            }

            if (compressionCombination2 <= compressionOutput2) {
              throw new Error("Permanent and Variable Load combination 2 is less than the calculated compression.")
            }

            if (tensionCombination1 <= tensionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated tension.")
            }

            if (tensionCombination2 <= tensionOutput2) {
              throw new Error("Permanent and Variable Load combination 2 is less than the calculated tension.")
            }

            dynamicParams = {
              permanent_load: body.permanent_load,
              variable_load: body.variable_load,
              compression: roundToTwoDecimals(rckCompression),
              tension: roundToTwoDecimals(rckTension),
              uk_safety_factor_compression_yG1: body.uk_safety_factor_compression_yG1,
              uk_safety_factor_compression_yQ1: body.uk_safety_factor_compression_yQ1,
              uk_safety_factor_compression_yT1: body.uk_safety_factor_compression_yT1,
              uk_safety_factor_compression_yG2: body.uk_safety_factor_compression_yG2,
              uk_safety_factor_compression_yQ2: body.uk_safety_factor_compression_yQ2,
              uk_safety_factor_compression_yT2: body.uk_safety_factor_compression_yT2,
              uk_safety_factor_tension_yG1: body.uk_safety_factor_tension_yG1,
              uk_safety_factor_tension_yQ1: body.uk_safety_factor_tension_yQ1,
              uk_safety_factor_tension_yT1: body.uk_safety_factor_tension_yT1,
              uk_safety_factor_tension_yG2: body.uk_safety_factor_tension_yG2,
              uk_safety_factor_tension_yQ2: body.uk_safety_factor_tension_yQ2,
              uk_safety_factor_tension_yT2: body.uk_safety_factor_tension_yT2
            }
          }

          else if (body.country === "nl") {
            const compressionCombination1 = (body.nl_safety_factor_compression_yG * body.permanent_load) + (body.nl_safety_factor_compression_yQ * body.variable_load)
            const compressionOutput1 = rckCompression / body.nl_safety_factor_compression_yT

            const tensionCombination1 = (body.nl_safety_factor_tension_yG * body.permanent_load) + (body.nl_safety_factor_tension_yQ * body.variable_load)
            const tensionOutput1 = rckTension / body.nl_safety_factor_tension_yT

            if (compressionCombination1 <= compressionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated compression.")
            }

            if (tensionCombination1 <= tensionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated tension.")
            }

            dynamicParams = {
              permanent_load: body.permanent_load,
              variable_load: body.variable_load,
              compression: roundToTwoDecimals(rckCompression),
              tension: roundToTwoDecimals(rckTension),
              nl_safety_factor_compression_yG: body.nl_safety_factor_compression_yG,
              nl_safety_factor_compression_yQ: body.nl_safety_factor_compression_yQ,
              nl_safety_factor_compression_yT: body.nl_safety_factor_compression_yT,
              nl_safety_factor_tension_yG: body.nl_safety_factor_tension_yG,
              nl_safety_factor_tension_yQ: body.nl_safety_factor_tension_yQ,
              nl_safety_factor_tension_yT: body.nl_safety_factor_tension_yT
            }
          }
        
          else {
            const compressionCombination1 = (body.pl_safety_factor_compression_yG * body.permanent_load) + (body.pl_safety_factor_compression_yQ * body.variable_load)
            const compressionOutput1 = rckCompression / body.pl_safety_factor_compression_yT

            const tensionCombination1 = (body.pl_safety_factor_tension_yG * body.permanent_load) + (body.pl_safety_factor_tension_yQ * body.variable_load)
            const tensionOutput1 = rckTension / body.pl_safety_factor_tension_yT

            if (compressionCombination1 <= compressionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated compression.")
            }

            if (tensionCombination1 <= tensionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated tension.")
            }

            dynamicParams = {
              permanent_load: body.permanent_load,
              variable_load: body.variable_load,
              compression: roundToTwoDecimals(rckCompression),
              tension: roundToTwoDecimals(rckTension),
              pl_safety_factor_compression_yG: body.pl_safety_factor_compression_yG,
              pl_safety_factor_compression_yQ: body.pl_safety_factor_compression_yQ,
              pl_safety_factor_compression_yT: body.pl_safety_factor_compression_yT,
              pl_safety_factor_tension_yG: body.pl_safety_factor_tension_yG,
              pl_safety_factor_tension_yQ: body.pl_safety_factor_tension_yQ,
              pl_safety_factor_tension_yT: body.pl_safety_factor_tension_yT
            }
          }
        }

        else {
          const tension = body.pile_diameter === "60" ? soilsData.reduce((sum, soil) => sum + soil.shaft_capacity60, 0) : soilsData.reduce((sum, soil) => sum + soil.shaft_capacity100, 0)
        
          const lastLayer = soilsData.find(soil => soil.start_depth <= profileData.effective_pile_length && profileData.effective_pile_length <= soil.end_depth) || soilsData[soilsData.length - 1]
          const bearingCapacity = body.pile_diameter === "60" ? lastLayer.bearing_capacity60 : lastLayer.bearing_capacity100
          const compression = tension + bearingCapacity
          
          if (body.country === "uk") {
            const compressionCombination1 = (body.uk_safety_factor_compression_yG1 * body.permanent_load) + (body.uk_safety_factor_compression_yQ1 * body.variable_load)
            const compressionCombination2 = (body.uk_safety_factor_compression_yG2 * body.permanent_load) + (body.uk_safety_factor_compression_yQ2 * body.variable_load)
            const compressionOutput1 = compression / body.uk_safety_factor_compression_yT1
            const compressionOutput2 = compression / body.uk_safety_factor_compression_yT2

            const tensionCombination1 = (body.uk_safety_factor_tension_yG2 * body.permanent_load) + (body.uk_safety_factor_tension_yQ2 * body.variable_load)
            const tensionCombination2 = (body.uk_safety_factor_tension_yG1 * body.permanent_load) + (body.uk_safety_factor_tension_yQ1 * body.variable_load)
            const tensionOutput1 = tension / body.uk_safety_factor_tension_yT1
            const tensionOutput2 = tension / body.uk_safety_factor_tension_yT2

            if (compressionCombination1 <= compressionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated compression.")
            }

            if (compressionCombination2 <= compressionOutput2) {
              throw new Error("Permanent and Variable Load combination 2 is less than the calculated compression.")
            }

            if (tensionCombination1 <= tensionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated tension.")
            }

            if (tensionCombination2 <= tensionOutput2) {
              throw new Error("Permanent and Variable Load combination 2 is less than the calculated tension.")
            }
            
            dynamicParams = {
              permanent_load: body.permanent_load,
              variable_load: body.variable_load,
              compression: roundToTwoDecimals(compression),
              tension: roundToTwoDecimals(tension),
              uk_safety_factor_compression_yG1: body.uk_safety_factor_compression_yG1,
              uk_safety_factor_compression_yQ1: body.uk_safety_factor_compression_yQ1,
              uk_safety_factor_compression_yT1: body.uk_safety_factor_compression_yT1,
              uk_safety_factor_compression_yG2: body.uk_safety_factor_compression_yG2,
              uk_safety_factor_compression_yQ2: body.uk_safety_factor_compression_yQ2,
              uk_safety_factor_compression_yT2: body.uk_safety_factor_compression_yT2,
              uk_safety_factor_tension_yG1: body.uk_safety_factor_tension_yG1,
              uk_safety_factor_tension_yQ1: body.uk_safety_factor_tension_yQ1,
              uk_safety_factor_tension_yT1: body.uk_safety_factor_tension_yT1,
              uk_safety_factor_tension_yG2: body.uk_safety_factor_tension_yG2,
              uk_safety_factor_tension_yQ2: body.uk_safety_factor_tension_yQ2,
              uk_safety_factor_tension_yT2: body.uk_safety_factor_tension_yT2,
            }
          }

          else if (body.country === "nl") {
            const compressionCombination1 = (body.nl_safety_factor_compression_yG * body.permanent_load) + (body.nl_safety_factor_compression_yQ * body.variable_load)
            const compressionOutput1 = compression / body.nl_safety_factor_compression_yT

            const tensionCombination1 = (body.nl_safety_factor_tension_yG * body.permanent_load) + (body.nl_safety_factor_tension_yQ * body.variable_load)
            const tensionOutput1 = tension / body.nl_safety_factor_tension_yT
            
            if (compressionCombination1 <= compressionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated compression.")
            }

            if (tensionCombination1 <= tensionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated tension.")
            }

            dynamicParams = {
              permanent_load: body.permanent_load,
              variable_load: body.variable_load,
              compression: roundToTwoDecimals(compression),
              tension: roundToTwoDecimals(tension),
              nl_safety_factor_compression_yG: body.nl_safety_factor_compression_yG,
              nl_safety_factor_compression_yQ: body.nl_safety_factor_compression_yQ,
              nl_safety_factor_compression_yT: body.nl_safety_factor_compression_yT,
              nl_safety_factor_tension_yG: body.nl_safety_factor_tension_yG,
              nl_safety_factor_tension_yQ: body.nl_safety_factor_tension_yQ,
              nl_safety_factor_tension_yT: body.nl_safety_factor_tension_yT,
            }
          }
          
          else {
            const compressionCombination1 = (body.pl_safety_factor_compression_yG * body.permanent_load) + (body.pl_safety_factor_compression_yQ * body.variable_load)
            const compressionOutput1 = compression / body.pl_safety_factor_compression_yT

            const tensionCombination1 = (body.pl_safety_factor_tension_yG * body.permanent_load) + (body.pl_safety_factor_tension_yQ * body.variable_load)
            const tensionOutput1 = tension / body.pl_safety_factor_tension_yT

            if (compressionCombination1 <= compressionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated compression.")
            }

            if (tensionCombination1 <= tensionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated tension.")
            }

            dynamicParams = {
              permanent_load: body.permanent_load,
              variable_load: body.variable_load,
              compression: roundToTwoDecimals(compression),
              tension: roundToTwoDecimals(tension),
              pl_safety_factor_compression_yG: body.pl_safety_factor_compression_yG,
              pl_safety_factor_compression_yQ: body.pl_safety_factor_compression_yQ,
              pl_safety_factor_compression_yT: body.pl_safety_factor_compression_yT,
              pl_safety_factor_tension_yG: body.pl_safety_factor_tension_yG,
              pl_safety_factor_tension_yQ: body.pl_safety_factor_tension_yQ,
              pl_safety_factor_tension_yT: body.pl_safety_factor_tension_yT,
            }
          }
        }
      break;

      case "method_test":

        if (!body.permanent_load || !body.variable_load || !body.country) {
          throw new Error("Permanent Load, Variable Load and Country are required for this design method.")
        }

        soilsData = await getSoils(body.soil_profile_id)
        profileData = await getProfiles(body.soil_profile_id)
        
        if (body.use_characteristic) {
          if (!body.number_of_tests || !body.mean_tensile_rcm || !body.min_tensile_rcm || !body.mean_compression_rcm || !body.min_compression_rcm) {
            throw new Error("Number of Tests, Mean Tensile Capacity, Minimum Tensile Capacity, Mean Compression Capacity and Minimum Compression Capacity are required when using characteristic values.")
          }

          const numberOfSoilProfiles = body.number_of_tests > 5 ? 5 : body.number_of_tests
          const s1 = nObjectMethodTest[numberOfSoilProfiles].s1
          const s2 = nObjectMethodTest[numberOfSoilProfiles].s2
          const rckTension = Math.min(body.mean_tensile_rcm / s1, body.min_tensile_rcm / s2)
          const rckCompression = Math.min(body.mean_compression_rcm / s1, body.min_compression_rcm / s2)

          if (body.country === "uk") {
            const compressionCombination1 = (body.uk_safety_factor_compression_yG1 * body.permanent_load) + (body.uk_safety_factor_compression_yQ1 * body.variable_load)
            const compressionCombination2 = (body.uk_safety_factor_compression_yG2 * body.permanent_load) + (body.uk_safety_factor_compression_yQ2 * body.variable_load)
            const compressionOutput1 = rckCompression / body.uk_safety_factor_compression_yT1
            const compressionOutput2 = rckCompression / body.uk_safety_factor_compression_yT2

            const tensionCombination1 = (body.uk_safety_factor_tension_yG2 * body.permanent_load) + (body.uk_safety_factor_tension_yQ2 * body.variable_load)
            const tensionCombination2 = (body.uk_safety_factor_tension_yG1 * body.permanent_load) + (body.uk_safety_factor_tension_yQ1 * body.variable_load)
            const tensionOutput1 = rckTension / body.uk_safety_factor_tension_yT1
            const tensionOutput2 = rckTension / body.uk_safety_factor_tension_yT2

            if (compressionCombination1 <= compressionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated compression.")
            }

            if (compressionCombination2 <= compressionOutput2) {
              throw new Error("Permanent and Variable Load combination 2 is less than the calculated compression.")
            }

            if (tensionCombination1 <= tensionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated tension.")
            }

            if (tensionCombination2 <= tensionOutput2) {
              throw new Error("Permanent and Variable Load combination 2 is less than the calculated tension.")
            }

            dynamicParams = {
              permanent_load: body.permanent_load,
              variable_load: body.variable_load,
              tension: roundToTwoDecimals(rckTension),
              compression: roundToTwoDecimals(rckCompression),
              body_uk_safety_factor_compression_yG1: body.uk_safety_factor_compression_yG1,
              body_uk_safety_factor_compression_yQ1: body.uk_safety_factor_compression_yQ1,
              body_uk_safety_factor_compression_yT1: body.uk_safety_factor_compression_yT1,
              body_uk_safety_factor_compression_yG2: body.uk_safety_factor_compression_yG2,
              body_uk_safety_factor_compression_yQ2: body.uk_safety_factor_compression_yQ2,
              body_uk_safety_factor_compression_yT2: body.uk_safety_factor_compression_yT2,
              body_uk_safety_factor_tension_yG1: body.uk_safety_factor_tension_yG1,
              body_uk_safety_factor_tension_yQ1: body.uk_safety_factor_tension_yQ1,
              body_uk_safety_factor_tension_yT1: body.uk_safety_factor_tension_yT1,
              body_uk_safety_factor_tension_yG2: body.uk_safety_factor_tension_yG2,
              body_uk_safety_factor_tension_yQ2: body.uk_safety_factor_tension_yQ2,
              body_uk_safety_factor_tension_yT2: body.uk_safety_factor_tension_yT2,
            }
          }

          else if (body.country === "nl") {
            const compressionCombination1 = (body.nl_safety_factor_compression_yG * body.permanent_load) + (body.nl_safety_factor_compression_yQ * body.variable_load)
            const compressionOutput1 = rckCompression / body.nl_safety_factor_compression_yT

            const tensionCombination1 = (body.nl_safety_factor_tension_yG * body.permanent_load) + (body.nl_safety_factor_tension_yQ * body.variable_load)
            const tensionOutput1 = rckTension / body.nl_safety_factor_tension_yT

            if (compressionCombination1 <= compressionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated compression.")
            }

            if (tensionCombination1 <= tensionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated tension.")
            }

            dynamicParams = {
              permanent_load: body.permanent_load,
              variable_load: body.variable_load,
              compression: roundToTwoDecimals(rckCompression),
              tension: roundToTwoDecimals(rckTension),
              nl_safety_factor_compression_yG: body.nl_safety_factor_compression_yG,
              nl_safety_factor_compression_yQ: body.nl_safety_factor_compression_yQ,
              nl_safety_factor_compression_yT: body.nl_safety_factor_compression_yT,
              nl_safety_factor_tension_yG: body.nl_safety_factor_tension_yG,
              nl_safety_factor_tension_yQ: body.nl_safety_factor_tension_yQ,
              nl_safety_factor_tension_yT: body.nl_safety_factor_tension_yT,
            }
          }
        
          else {
            const compressionCombination1 = (body.pl_safety_factor_compression_yG * body.permanent_load) + (body.pl_safety_factor_compression_yQ * body.variable_load)
            const compressionOutput1 = rckCompression / body.pl_safety_factor_compression_yT

            const tensionCombination1 = (body.pl_safety_factor_tension_yG * body.permanent_load) + (body.pl_safety_factor_tension_yQ * body.variable_load)
            const tensionOutput1 = rckTension / body.pl_safety_factor_tension_yT

            if (compressionCombination1 <= compressionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated compression.")
            }

            if (tensionCombination1 <= tensionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated tension.")
            }

            dynamicParams = {
              permanent_load: body.permanent_load,
              variable_load: body.variable_load,
              compression: roundToTwoDecimals(rckCompression),
              tension: roundToTwoDecimals(rckTension),
              pl_safety_factor_compression_yG: body.pl_safety_factor_compression_yG,
              pl_safety_factor_compression_yQ: body.pl_safety_factor_compression_yQ,
              pl_safety_factor_compression_yT: body.pl_safety_factor_compression_yT,
              pl_safety_factor_tension_yG: body.pl_safety_factor_tension_yG,
              pl_safety_factor_tension_yQ: body.pl_safety_factor_tension_yQ,
              pl_safety_factor_tension_yT: body.pl_safety_factor_tension_yT,
            }
          }
        }

        else {
          if (!body.standardTension || !body.standardCompression) {
            throw new Error("Standard Tension and Standard Compression are required when not using characteristic values.")
          }

          const tension = body.standardTension
          const compression = body.standardCompression

          if (body.country === "uk") {
            const compressionCombination1 = (body.uk_safety_factor_compression_yG1 * body.permanent_load) + (body.uk_safety_factor_compression_yQ1 * body.variable_load)
            const compressionCombination2 = (body.uk_safety_factor_compression_yG2 * body.permanent_load) + (body.uk_safety_factor_compression_yQ2 * body.variable_load)
            const compressionOutput1 = compression / body.uk_safety_factor_compression_yT1
            const compressionOutput2 = compression / body.uk_safety_factor_compression_yT2

            const tensionCombination1 = (body.uk_safety_factor_tension_yG2 * body.permanent_load) + (body.uk_safety_factor_tension_yQ2 * body.variable_load)
            const tensionCombination2 = (body.uk_safety_factor_tension_yG1 * body.permanent_load) + (body.uk_safety_factor_tension_yQ1 * body.variable_load)
            const tensionOutput1 = tension / body.uk_safety_factor_tension_yT1
            const tensionOutput2 = tension / body.uk_safety_factor_tension_yT2

            if (compressionCombination1 <= compressionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated compression.")
            }

            if (compressionCombination2 <= compressionOutput2) {
              throw new Error("Permanent and Variable Load combination 2 is less than the calculated compression.")
            }

            if (tensionCombination1 <= tensionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated tension.")
            }

            if (tensionCombination2 <= tensionOutput2) {
              throw new Error("Permanent and Variable Load combination 2 is less than the calculated tension.")
            }

            dynamicParams = {
              permanent_load: body.permanent_load,
              variable_load: body.variable_load,
              compression: roundToTwoDecimals(compression),
              tension: roundToTwoDecimals(tension),
              uk_safety_factor_compression_yG1: body.uk_safety_factor_compression_yG1,
              uk_safety_factor_compression_yQ1: body.uk_safety_factor_compression_yQ1,
              uk_safety_factor_compression_yT1: body.uk_safety_factor_compression_yT1,
              uk_safety_factor_compression_yG2: body.uk_safety_factor_compression_yG2,
              uk_safety_factor_compression_yQ2: body.uk_safety_factor_compression_yQ2,
              uk_safety_factor_compression_yT2: body.uk_safety_factor_compression_yT2,
              uk_safety_factor_tension_yG1: body.uk_safety_factor_tension_yG1,
              uk_safety_factor_tension_yQ1: body.uk_safety_factor_tension_yQ1,
              uk_safety_factor_tension_yT1: body.uk_safety_factor_tension_yT1,
              uk_safety_factor_tension_yG2: body.uk_safety_factor_tension_yG2,
              uk_safety_factor_tension_yQ2: body.uk_safety_factor_tension_yQ2,
              uk_safety_factor_tension_yT2: body.uk_safety_factor_tension_yT2,
            }
          }

          else if (body.country === "nl") {
            const compressionCombination1 = (body.nl_safety_factor_compression_yG * body.permanent_load) + (body.nl_safety_factor_compression_yQ * body.variable_load)
            const compressionOutput1 = compression / body.nl_safety_factor_compression_yT

            const tensionCombination1 = (body.nl_safety_factor_tension_yG * body.permanent_load) + (body.nl_safety_factor_tension_yQ * body.variable_load)
            const tensionOutput1 = tension / body.nl_safety_factor_tension_yT
            
            if (compressionCombination1 <= compressionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated compression.")
            }

            if (tensionCombination1 <= tensionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated tension.")
            }

            dynamicParams = {
              permanent_load: body.permanent_load,
              variable_load: body.variable_load,
              compression: roundToTwoDecimals(compression),
              tension: roundToTwoDecimals(tension),
              nl_safety_factor_compression_yG: body.nl_safety_factor_compression_yG,
              nl_safety_factor_compression_yQ: body.nl_safety_factor_compression_yQ,
              nl_safety_factor_compression_yT: body.nl_safety_factor_compression_yT,
              nl_safety_factor_tension_yG: body.nl_safety_factor_tension_yG,
              nl_safety_factor_tension_yQ: body.nl_safety_factor_tension_yQ,
              nl_safety_factor_tension_yT: body.nl_safety_factor_tension_yT,
            }
          }
          
          else {
            const compressionCombination1 = (body.pl_safety_factor_compression_yG * body.permanent_load) + (body.pl_safety_factor_compression_yQ * body.variable_load)
            const compressionOutput1 = compression / body.pl_safety_factor_compression_yT

            const tensionCombination1 = (body.pl_safety_factor_tension_yG * body.permanent_load) + (body.pl_safety_factor_tension_yQ * body.variable_load)
            const tensionOutput1 = tension / body.pl_safety_factor_tension_yT

            if (compressionCombination1 <= compressionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated compression.")
            }

            if (tensionCombination1 <= tensionOutput1) {
              throw new Error("Permanent and Variable Load combination 1 is less than the calculated tension.")
            }

            dynamicParams = {
              permanent_load: body.permanent_load,
              variable_load: body.variable_load,
              compression: roundToTwoDecimals(compression),
              tension: roundToTwoDecimals(tension),
              pl_safety_factor_compression_yG: body.pl_safety_factor_compression_yG,
              pl_safety_factor_compression_yQ: body.pl_safety_factor_compression_yQ,
              pl_safety_factor_compression_yT: body.pl_safety_factor_compression_yT,
              pl_safety_factor_tension_yG: body.pl_safety_factor_tension_yG,
              pl_safety_factor_tension_yQ: body.pl_safety_factor_tension_yQ,
              pl_safety_factor_tension_yT: body.pl_safety_factor_tension_yT,
            }
          }
        }
      break;

      default:
      throw new Error(`Unknown safety design method: ${body.design_method}`)
    }
    
    const baseParams = {
      pile_diameter: body.pile_diameter, 
      job_number: body.job_number,
      pile_number: body.pile_number,
      job_location: body.job_location,
      checked_by: body.checked_by,

      show_description: body.show_description,
      show_spt: body.show_spt,
      show_moist: body.show_moist,
      show_sat: body.show_sat,
      show_shear_strength: body.show_shear_strength,
      soil_notes: body.soil_notes || "",
      
      design_notes: body.design_notes || "",
    }

    const fullDynamicParams = {design_method: body.design_method, country: body.country, ...dynamicParams}
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()

    const finalObject = { 
      profile_data: profileData,
      soils_data: soilsData,
      dynamic_params: fullDynamicParams,
      base_params: baseParams,
      user_id: data?.claims.sub
    }

    const { error } = await supabase
    .from('exports')
    .upsert(finalObject)

    if (error) {
      throw new Error("Failed to save export data")
    }
    
    const cookie = req.cookies.get('sb-kiasruegemqnakhmbels-auth-token')?.value

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()

    await browser.setCookie({
      name: 'sb-kiasruegemqnakhmbels-auth-token',
      value: cookie ?? '',
      domain: process.env.NODE_ENV === 'production'
        ? new URL(process.env.NEXT_PUBLIC_SITE_URL!).hostname
        : 'localhost',
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    })

    await page.setViewport({ 
      width: 1280, height: 1080, 
      deviceScaleFactor: 1
    })
    
    const baseUrl = process.env.NODE_ENV === 'production' ? process.env.VERCEL_URL || process.env.NEXT_PUBLIC_SITE_URL : 'http://localhost:3000'
    await page.goto(`${baseUrl}/output`, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    })
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      displayHeaderFooter: true,
      headerTemplate: `<div>My Header</div>`,
      footerTemplate: `<div style="font-size:8px; width:100%; text-align:center; margin-bottom:5px;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
    })
    
    await browser.close()
    
    return new NextResponse(new Uint8Array(pdf), {headers: {'Content-Type': 'application/pdf'}})
  }
  
  catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Invalid Request" }, { status: 500 })
  }
}

