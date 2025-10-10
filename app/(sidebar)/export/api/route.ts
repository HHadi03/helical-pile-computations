import { NextRequest, NextResponse } from 'next/server'
import { exportFormSchema, TexportFormSchema } from '@/schemas/exportSchema'
import { createClient } from '@/utils/supabase/server'
import { TexportSoilProfileSchema } from '@/schemas/soilProfileSchemas'
import { ToverviewSoilSchema } from '@/schemas/soilSchemas'
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
       
        soilsData = await getSoils(body.soil_profile_id)
        profileData = await getProfiles(body.soil_profile_id)

        const tension = body.pile_diameter === "60" ? soilsData.reduce((sum, soil) => sum + soil.shaft_capacity60, 0) : soilsData.reduce((sum, soil) => sum + soil.shaft_capacity100, 0)
        
        const lastLayer = soilsData.find(soil => soil.start_depth <= profileData.effective_pile_length && profileData.effective_pile_length <= soil.end_depth) || soilsData[soilsData.length - 1]
        const bearingCapacity = body.pile_diameter === "60" ? lastLayer.bearing_capacity60 : lastLayer.bearing_capacity100
        const compression = tension + bearingCapacity
          
        if (body.applied_tension_load > (tension / body.global_safety_factor)) {
          throw new Error("Designed tension load is greater than the designed tensile resistance.")
        }
        
        if (body.applied_compression_load > (compression / body.global_safety_factor)) {
          throw new Error("Designed compression load is greater than the designed compressive resistance.")
        }

        dynamicParams = {
          tension: roundToTwoDecimals(tension),
          compression: roundToTwoDecimals(compression),
          applied_tension_load: (body.applied_tension_load),
          applied_compression_load: (body.applied_compression_load),
          global_safety_factor: (body.global_safety_factor)
        }
      break;

      case "method_en":

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
            const compressionCombination1 = (body.uk_safety_factor_compression_yg1 * body.permanent_compression_load) + (body.uk_safety_factor_compression_yq1 * body.variable_compression_load)
            const compressionCombination2 = (body.uk_safety_factor_compression_yg2 * body.permanent_compression_load) + (body.uk_safety_factor_compression_yq2 * body.variable_compression_load)
            const compressionOutput1 = rckCompression / body.uk_safety_factor_compression_yt1
            const compressionOutput2 = rckCompression / body.uk_safety_factor_compression_yt2

            const tensionCombination1 = (body.uk_safety_factor_tension_yg2 * body.permanent_tension_load) + (body.uk_safety_factor_tension_yq2 * body.variable_tension_load)
            const tensionCombination2 = (body.uk_safety_factor_tension_yg1 * body.permanent_tension_load) + (body.uk_safety_factor_tension_yq1 * body.variable_tension_load)
            const tensionOutput1 = rckTension / body.uk_safety_factor_tension_yt1
            const tensionOutput2 = rckTension / body.uk_safety_factor_tension_yt2

            if (compressionCombination1 > compressionOutput1) {
              throw new Error("Designed compression load is greater than the designed compressive resistance.")
            }

            if (compressionCombination2 > compressionOutput2) {
              throw new Error("Designed compression load is greater than the designed compressive resistance.")
            }

            if (tensionCombination1 > tensionOutput1) {
              throw new Error("Designed tension load is greater than the designed tensile resistance.")
            }

            if (tensionCombination2 > tensionOutput2) {
              throw new Error("Designed tension load is greater than the designed tensile resistance.")
            }
            
            dynamicParams = {
              permanent_tension_load: body.permanent_tension_load,
              variable_tension_load: body.variable_tension_load,
              permanent_compression_load: body.permanent_compression_load,
              variable_compression_load: body.variable_compression_load,
              compression: roundToTwoDecimals(rckCompression),
              tension: roundToTwoDecimals(rckTension),
              uk_safety_factor_compression_yg1: body.uk_safety_factor_compression_yg1,
              uk_safety_factor_compression_yq1: body.uk_safety_factor_compression_yq1,
              uk_safety_factor_compression_yt1: body.uk_safety_factor_compression_yt1,
              uk_safety_factor_compression_yg2: body.uk_safety_factor_compression_yg2,
              uk_safety_factor_compression_yq2: body.uk_safety_factor_compression_yq2,
              uk_safety_factor_compression_yt2: body.uk_safety_factor_compression_yt2,
              uk_safety_factor_tension_yg1: body.uk_safety_factor_tension_yg1,
              uk_safety_factor_tension_yq1: body.uk_safety_factor_tension_yq1,
              uk_safety_factor_tension_yt1: body.uk_safety_factor_tension_yt1,
              uk_safety_factor_tension_yg2: body.uk_safety_factor_tension_yg2,
              uk_safety_factor_tension_yq2: body.uk_safety_factor_tension_yq2,
              uk_safety_factor_tension_yt2: body.uk_safety_factor_tension_yt2,
            }
          }

          else if (body.country === "nl") {
            const compressionCombination1 = (body.nl_safety_factor_compression_yg * body.permanent_tension_load) + (body.nl_safety_factor_compression_yq * body.variable_tension_load)
            const compressionOutput1 = rckCompression / body.nl_safety_factor_compression_yt

            const tensionCombination1 = (body.nl_safety_factor_tension_yg * body.permanent_compression_load) + (body.nl_safety_factor_tension_yq * body.variable_tension_load)
            const tensionOutput1 = rckTension / body.nl_safety_factor_tension_yt

            if (compressionCombination1 > compressionOutput1) {
              throw new Error("Designed compression load is greater than the designed compressive resistance.")
            }

            if (tensionCombination1 > tensionOutput1) {
              throw new Error("Designed tension load is greater than the designed tensile resistance.")
            }

            dynamicParams = {
              permanent_tension_load: body.permanent_tension_load,
              variable_tension_load: body.variable_tension_load,
              permanent_compression_load: body.permanent_compression_load,
              variable_compression_load: body.variable_compression_load,
              compression: roundToTwoDecimals(rckCompression),
              tension: roundToTwoDecimals(rckTension),
              nl_safety_factor_compression_yg: body.nl_safety_factor_compression_yg,
              nl_safety_factor_compression_yq: body.nl_safety_factor_compression_yq,
              nl_safety_factor_compression_yt: body.nl_safety_factor_compression_yt,
              nl_safety_factor_tension_yg: body.nl_safety_factor_tension_yg,
              nl_safety_factor_tension_yq: body.nl_safety_factor_tension_yq,
              nl_safety_factor_tension_yt: body.nl_safety_factor_tension_yt,
            }
          }
          
          else {
            const compressionCombination1 = (body.pl_safety_factor_compression_yg * body.permanent_tension_load) + (body.pl_safety_factor_compression_yq * body.variable_tension_load)
            const compressionOutput1 = rckCompression / body.pl_safety_factor_compression_yt

            const tensionCombination1 = (body.pl_safety_factor_tension_yg * body.permanent_compression_load) + (body.pl_safety_factor_tension_yq * body.variable_compression_load)
            const tensionOutput1 = rckTension / body.pl_safety_factor_tension_yt

            if (compressionCombination1 > compressionOutput1) {
              throw new Error("Designed compression load is greater than the designed compressive resistance.")
            }

            if (tensionCombination1 > tensionOutput1) {
              throw new Error("Designed tension load is greater than the designed tensile resistance.")
            }

            dynamicParams = {
              permanent_load: body.permanent_tension_load,
              variable_load: body.variable_tension_load,
              permanent_compression_load: body.permanent_compression_load,
              variable_compression_load: body.variable_compression_load,
              compression: roundToTwoDecimals(rckCompression),
              tension: roundToTwoDecimals(rckTension),
              pl_safety_factor_compression_yg: body.pl_safety_factor_compression_yg,
              pl_safety_factor_compression_yq: body.pl_safety_factor_compression_yq,
              pl_safety_factor_compression_yt: body.pl_safety_factor_compression_yt,
              pl_safety_factor_tension_yg: body.pl_safety_factor_tension_yg,
              pl_safety_factor_tension_yq: body.pl_safety_factor_tension_yq,
              pl_safety_factor_tension_yt: body.pl_safety_factor_tension_yt,
            }
          }
        }

        else {
          const tension = body.pile_diameter === "60" ? soilsData.reduce((sum, soil) => sum + soil.shaft_capacity60, 0) : soilsData.reduce((sum, soil) => sum + soil.shaft_capacity100, 0)
        
          const lastLayer = soilsData.find(soil => soil.start_depth <= profileData.effective_pile_length && profileData.effective_pile_length <= soil.end_depth) || soilsData[soilsData.length - 1]
          const bearingCapacity = body.pile_diameter === "60" ? lastLayer.bearing_capacity60 : lastLayer.bearing_capacity100
          const compression = tension + bearingCapacity
          
          if (body.country === "uk") {
            const compressionCombination1 = (body.uk_safety_factor_compression_yg1 * body.permanent_compression_load) + (body.uk_safety_factor_compression_yq1 * body.variable_compression_load)
            const compressionCombination2 = (body.uk_safety_factor_compression_yg2 * body.permanent_compression_load) + (body.uk_safety_factor_compression_yq2 * body.variable_compression_load)
            const compressionOutput1 = compression / body.uk_safety_factor_compression_yt1
            const compressionOutput2 = compression / body.uk_safety_factor_compression_yt2

            const tensionCombination1 = (body.uk_safety_factor_tension_yg2 * body.permanent_tension_load) + (body.uk_safety_factor_tension_yq2 * body.variable_tension_load)
            const tensionCombination2 = (body.uk_safety_factor_tension_yg1 * body.permanent_tension_load) + (body.uk_safety_factor_tension_yq1 * body.variable_tension_load)
            const tensionOutput1 = tension / body.uk_safety_factor_tension_yt1
            const tensionOutput2 = tension / body.uk_safety_factor_tension_yt2

            if (compressionCombination1 > compressionOutput1) {
              throw new Error("Designed compression load is greater than the designed compressive resistance.")
            }

            if (compressionCombination2 > compressionOutput2) {
              throw new Error("Designed compression load is greater than the designed compressive resistance.")
            }

            if (tensionCombination1 > tensionOutput1) {
              throw new Error("Designed tension load is greater than the designed tensile resistance.")
            }

            if (tensionCombination2 > tensionOutput2) {
              throw new Error("Designed tension load is greater than the designed tensile resistance.")
            }
            
            dynamicParams = {
              permanent_tension_load: body.permanent_tension_load,
              variable_tension_load: body.variable_tension_load,
              permanent_compression_load: body.permanent_compression_load,
              variable_compression_load: body.variable_compression_load,
              compression: roundToTwoDecimals(compression),
              tension: roundToTwoDecimals(tension),
              uk_safety_factor_compression_yg1: body.uk_safety_factor_compression_yg1,
              uk_safety_factor_compression_yq1: body.uk_safety_factor_compression_yq1,
              uk_safety_factor_compression_yt1: body.uk_safety_factor_compression_yt1,
              uk_safety_factor_compression_yg2: body.uk_safety_factor_compression_yg2,
              uk_safety_factor_compression_yq2: body.uk_safety_factor_compression_yq2,
              uk_safety_factor_compression_yt2: body.uk_safety_factor_compression_yt2,
              uk_safety_factor_tension_yg1: body.uk_safety_factor_tension_yg1,
              uk_safety_factor_tension_yq1: body.uk_safety_factor_tension_yq1,
              uk_safety_factor_tension_yt1: body.uk_safety_factor_tension_yt1,
              uk_safety_factor_tension_yg2: body.uk_safety_factor_tension_yg2,
              uk_safety_factor_tension_yq2: body.uk_safety_factor_tension_yq2,
              uk_safety_factor_tension_yt2: body.uk_safety_factor_tension_yt2,
            }
          }

          else if (body.country === "nl") {
            const compressionCombination1 = (body.nl_safety_factor_compression_yg * body.permanent_tension_load) + (body.nl_safety_factor_compression_yq * body.variable_tension_load)
            const compressionOutput1 = compression / body.nl_safety_factor_compression_yt

            const tensionCombination1 = (body.nl_safety_factor_tension_yg * body.permanent_compression_load) + (body.nl_safety_factor_tension_yq * body.variable_tension_load)
            const tensionOutput1 = tension / body.nl_safety_factor_tension_yt

            if (compressionCombination1 > compressionOutput1) {
              throw new Error("Designed compression load is greater than the designed compressive resistance.")
            }

            if (tensionCombination1 > tensionOutput1) {
              throw new Error("Designed tension load is greater than the designed tensile resistance.")
            }

            dynamicParams = {
              permanent_tension_load: body.permanent_tension_load,
              variable_tension_load: body.variable_tension_load,
              permanent_compression_load: body.permanent_compression_load,
              variable_compression_load: body.variable_compression_load,
              compression: roundToTwoDecimals(compression),
              tension: roundToTwoDecimals(tension),
              nl_safety_factor_compression_yg: body.nl_safety_factor_compression_yg,
              nl_safety_factor_compression_yq: body.nl_safety_factor_compression_yq,
              nl_safety_factor_compression_yt: body.nl_safety_factor_compression_yt,
              nl_safety_factor_tension_yg: body.nl_safety_factor_tension_yg,
              nl_safety_factor_tension_yq: body.nl_safety_factor_tension_yq,
              nl_safety_factor_tension_yt: body.nl_safety_factor_tension_yt,
            }
          }
          
          else {
            const compressionCombination1 = (body.pl_safety_factor_compression_yg * body.permanent_tension_load) + (body.pl_safety_factor_compression_yq * body.variable_tension_load)
            const compressionOutput1 = compression / body.pl_safety_factor_compression_yt

            const tensionCombination1 = (body.pl_safety_factor_tension_yg * body.permanent_compression_load) + (body.pl_safety_factor_tension_yq * body.variable_compression_load)
            const tensionOutput1 = tension / body.pl_safety_factor_tension_yt

            if (compressionCombination1 > compressionOutput1) {
              throw new Error("Designed compression load is greater than the designed compressive resistance.")
            }

            if (tensionCombination1 > tensionOutput1) {
              throw new Error("Designed tension load is greater than the designed tensile resistance.")
            }

            dynamicParams = {
              permanent_load: body.permanent_tension_load,
              variable_load: body.variable_tension_load,
              permanent_compression_load: body.permanent_compression_load,
              variable_compression_load: body.variable_compression_load,
              compression: roundToTwoDecimals(compression),
              tension: roundToTwoDecimals(tension),
              pl_safety_factor_compression_yg: body.pl_safety_factor_compression_yg,
              pl_safety_factor_compression_yq: body.pl_safety_factor_compression_yq,
              pl_safety_factor_compression_yt: body.pl_safety_factor_compression_yt,
              pl_safety_factor_tension_yg: body.pl_safety_factor_tension_yg,
              pl_safety_factor_tension_yq: body.pl_safety_factor_tension_yq,
              pl_safety_factor_tension_yt: body.pl_safety_factor_tension_yt,
            }
          }
        }
      break;

      case "method_test":

        soilsData = await getSoils(body.soil_profile_id)
        profileData = await getProfiles(body.soil_profile_id)
        
        if (body.use_characteristic) {
          const numberOfSoilProfiles = body.number_of_tests > 5 ? 5 : body.number_of_tests
          const s1 = nObjectMethodTest[numberOfSoilProfiles].s1
          const s2 = nObjectMethodTest[numberOfSoilProfiles].s2
          const rckTension = Math.min(body.mean_tensile_resistance / s1, body.min_tensile_resistance / s2)
          const rckCompression = Math.min(body.mean_compressive_resistance / s1, body.min_compressive_resistance / s2)

          if (body.country === "uk") {
            const compressionCombination1 = (body.uk_safety_factor_compression_yg1 * body.permanent_compression_load) + (body.uk_safety_factor_compression_yq1 * body.variable_compression_load)
            const compressionCombination2 = (body.uk_safety_factor_compression_yg2 * body.permanent_compression_load) + (body.uk_safety_factor_compression_yq2 * body.variable_compression_load)
            const compressionOutput1 = rckCompression / body.uk_safety_factor_compression_yt1
            const compressionOutput2 = rckCompression / body.uk_safety_factor_compression_yt2

            const tensionCombination1 = (body.uk_safety_factor_tension_yg2 * body.permanent_tension_load) + (body.uk_safety_factor_tension_yq2 * body.variable_tension_load)
            const tensionCombination2 = (body.uk_safety_factor_tension_yg1 * body.permanent_tension_load) + (body.uk_safety_factor_tension_yq1 * body.variable_tension_load)
            const tensionOutput1 = rckTension / body.uk_safety_factor_tension_yt1
            const tensionOutput2 = rckTension / body.uk_safety_factor_tension_yt2

            if (compressionCombination1 > compressionOutput1) {
              console.log({compressionCombination1, compressionOutput1})
              throw new Error("Designed compression load is greater than the designed compressive resistance.")
            }

            if (compressionCombination2 > compressionOutput2) {
              console.log({compressionCombination2, compressionOutput2})
              throw new Error("Designed compression load is greater than the designed compressive resistance.")
            }

            if (tensionCombination1 > tensionOutput1) {
              throw new Error("Designed tension load is greater than the designed tensile resistance.")
            }

            if (tensionCombination2 > tensionOutput2) {
              throw new Error("Designed tension load is greater than the designed tensile resistance.")
            }
            
            dynamicParams = {
              permanent_tension_load: body.permanent_tension_load,
              variable_tension_load: body.variable_tension_load,
              permanent_compression_load: body.permanent_compression_load,
              variable_compression_load: body.variable_compression_load,
              compression: roundToTwoDecimals(rckCompression),
              tension: roundToTwoDecimals(rckTension),
              uk_safety_factor_compression_yg1: body.uk_safety_factor_compression_yg1,
              uk_safety_factor_compression_yq1: body.uk_safety_factor_compression_yq1,
              uk_safety_factor_compression_yt1: body.uk_safety_factor_compression_yt1,
              uk_safety_factor_compression_yg2: body.uk_safety_factor_compression_yg2,
              uk_safety_factor_compression_yq2: body.uk_safety_factor_compression_yq2,
              uk_safety_factor_compression_yt2: body.uk_safety_factor_compression_yt2,
              uk_safety_factor_tension_yg1: body.uk_safety_factor_tension_yg1,
              uk_safety_factor_tension_yq1: body.uk_safety_factor_tension_yq1,
              uk_safety_factor_tension_yt1: body.uk_safety_factor_tension_yt1,
              uk_safety_factor_tension_yg2: body.uk_safety_factor_tension_yg2,
              uk_safety_factor_tension_yq2: body.uk_safety_factor_tension_yq2,
              uk_safety_factor_tension_yt2: body.uk_safety_factor_tension_yt2,
            }
          }

          else if (body.country === "nl") {
            const compressionCombination1 = (body.nl_safety_factor_compression_yg * body.permanent_tension_load) + (body.nl_safety_factor_compression_yq * body.variable_tension_load)
            const compressionOutput1 = rckCompression / body.nl_safety_factor_compression_yt

            const tensionCombination1 = (body.nl_safety_factor_tension_yg * body.permanent_compression_load) + (body.nl_safety_factor_tension_yq * body.variable_tension_load)
            const tensionOutput1 = rckTension / body.nl_safety_factor_tension_yt

            if (compressionCombination1 > compressionOutput1) {
              throw new Error("Designed compression load is greater than the designed compressive resistance.")
            }

            if (tensionCombination1 > tensionOutput1) {
              throw new Error("Designed tension load is greater than the designed tensile resistance.")
            }

            dynamicParams = {
              permanent_tension_load: body.permanent_tension_load,
              variable_tension_load: body.variable_tension_load,
              permanent_compression_load: body.permanent_compression_load,
              variable_compression_load: body.variable_compression_load,
              compression: roundToTwoDecimals(rckCompression),
              tension: roundToTwoDecimals(rckTension),
              nl_safety_factor_compression_yg: body.nl_safety_factor_compression_yg,
              nl_safety_factor_compression_yq: body.nl_safety_factor_compression_yq,
              nl_safety_factor_compression_yt: body.nl_safety_factor_compression_yt,
              nl_safety_factor_tension_yg: body.nl_safety_factor_tension_yg,
              nl_safety_factor_tension_yq: body.nl_safety_factor_tension_yq,
              nl_safety_factor_tension_yt: body.nl_safety_factor_tension_yt,
            }
          }
          
          else {
            const compressionCombination1 = (body.pl_safety_factor_compression_yg * body.permanent_tension_load) + (body.pl_safety_factor_compression_yq * body.variable_tension_load)
            const compressionOutput1 = rckCompression / body.pl_safety_factor_compression_yt

            const tensionCombination1 = (body.pl_safety_factor_tension_yg * body.permanent_compression_load) + (body.pl_safety_factor_tension_yq * body.variable_compression_load)
            const tensionOutput1 = rckTension / body.pl_safety_factor_tension_yt

            if (compressionCombination1 > compressionOutput1) {
              throw new Error("Designed compression load is greater than the designed compressive resistance.")
            }

            if (tensionCombination1 > tensionOutput1) {
              throw new Error("Designed tension load is greater than the designed tensile resistance.")
            }

            dynamicParams = {
              permanent_load: body.permanent_tension_load,
              variable_load: body.variable_tension_load,
              permanent_compression_load: body.permanent_compression_load,
              variable_compression_load: body.variable_compression_load,
              compression: roundToTwoDecimals(rckCompression),
              tension: roundToTwoDecimals(rckTension),
              pl_safety_factor_compression_yg: body.pl_safety_factor_compression_yg,
              pl_safety_factor_compression_yq: body.pl_safety_factor_compression_yq,
              pl_safety_factor_compression_yt: body.pl_safety_factor_compression_yt,
              pl_safety_factor_tension_yg: body.pl_safety_factor_tension_yg,
              pl_safety_factor_tension_yq: body.pl_safety_factor_tension_yq,
              pl_safety_factor_tension_yt: body.pl_safety_factor_tension_yt,
            }
          }
        }

        else {
          const tension = body.standard_tensile_resistance
          const compression = body.standard_compressive_resistance

          if (body.country === "uk") {
            const compressionCombination1 = (body.uk_safety_factor_compression_yg1 * body.permanent_compression_load) + (body.uk_safety_factor_compression_yq1 * body.variable_compression_load)
            const compressionCombination2 = (body.uk_safety_factor_compression_yg2 * body.permanent_compression_load) + (body.uk_safety_factor_compression_yq2 * body.variable_compression_load)
            const compressionOutput1 = compression / body.uk_safety_factor_compression_yt1
            const compressionOutput2 = compression / body.uk_safety_factor_compression_yt2

            const tensionCombination1 = (body.uk_safety_factor_tension_yg2 * body.permanent_tension_load) + (body.uk_safety_factor_tension_yq2 * body.variable_tension_load)
            const tensionCombination2 = (body.uk_safety_factor_tension_yg1 * body.permanent_tension_load) + (body.uk_safety_factor_tension_yq1 * body.variable_tension_load)
            const tensionOutput1 = tension / body.uk_safety_factor_tension_yt1
            const tensionOutput2 = tension / body.uk_safety_factor_tension_yt2

            if (compressionCombination1 > compressionOutput1) {
              throw new Error("Designed compression load is greater than the designed compressive resistance.")
            }

            if (compressionCombination2 > compressionOutput2) {
              throw new Error("Designed compression load is greater than the designed compressive resistance.")
            }

            if (tensionCombination1 > tensionOutput1) {
              throw new Error("Designed tension load is greater than the designed tensile resistance.")
            }

            if (tensionCombination2 > tensionOutput2) {
              throw new Error("Designed tension load is greater than the designed tensile resistance.")
            }
            
            dynamicParams = {
              permanent_tension_load: body.permanent_tension_load,
              variable_tension_load: body.variable_tension_load,
              permanent_compression_load: body.permanent_compression_load,
              variable_compression_load: body.variable_compression_load,
              compression: roundToTwoDecimals(compression),
              tension: roundToTwoDecimals(tension),
              uk_safety_factor_compression_yg1: body.uk_safety_factor_compression_yg1,
              uk_safety_factor_compression_yq1: body.uk_safety_factor_compression_yq1,
              uk_safety_factor_compression_yt1: body.uk_safety_factor_compression_yt1,
              uk_safety_factor_compression_yg2: body.uk_safety_factor_compression_yg2,
              uk_safety_factor_compression_yq2: body.uk_safety_factor_compression_yq2,
              uk_safety_factor_compression_yt2: body.uk_safety_factor_compression_yt2,
              uk_safety_factor_tension_yg1: body.uk_safety_factor_tension_yg1,
              uk_safety_factor_tension_yq1: body.uk_safety_factor_tension_yq1,
              uk_safety_factor_tension_yt1: body.uk_safety_factor_tension_yt1,
              uk_safety_factor_tension_yg2: body.uk_safety_factor_tension_yg2,
              uk_safety_factor_tension_yq2: body.uk_safety_factor_tension_yq2,
              uk_safety_factor_tension_yt2: body.uk_safety_factor_tension_yt2,
            }
          }

          else if (body.country === "nl") {
            const compressionCombination1 = (body.nl_safety_factor_compression_yg * body.permanent_tension_load) + (body.nl_safety_factor_compression_yq * body.variable_tension_load)
            const compressionOutput1 = compression / body.nl_safety_factor_compression_yt

            const tensionCombination1 = (body.nl_safety_factor_tension_yg * body.permanent_compression_load) + (body.nl_safety_factor_tension_yq * body.variable_tension_load)
            const tensionOutput1 = tension / body.nl_safety_factor_tension_yt

            if (compressionCombination1 > compressionOutput1) {
              throw new Error("Designed compression load is greater than the designed compressive resistance.")
            }

            if (tensionCombination1 > tensionOutput1) {
              throw new Error("Designed tension load is greater than the designed tensile resistance.")
            }

            dynamicParams = {
              permanent_tension_load: body.permanent_tension_load,
              variable_tension_load: body.variable_tension_load,
              permanent_compression_load: body.permanent_compression_load,
              variable_compression_load: body.variable_compression_load,
              compression: roundToTwoDecimals(compression),
              tension: roundToTwoDecimals(tension),
              nl_safety_factor_compression_yg: body.nl_safety_factor_compression_yg,
              nl_safety_factor_compression_yq: body.nl_safety_factor_compression_yq,
              nl_safety_factor_compression_yt: body.nl_safety_factor_compression_yt,
              nl_safety_factor_tension_yg: body.nl_safety_factor_tension_yg,
              nl_safety_factor_tension_yq: body.nl_safety_factor_tension_yq,
              nl_safety_factor_tension_yt: body.nl_safety_factor_tension_yt,
            }
          }
          
          else {
            const compressionCombination1 = (body.pl_safety_factor_compression_yg * body.permanent_tension_load) + (body.pl_safety_factor_compression_yq * body.variable_tension_load)
            const compressionOutput1 = compression / body.pl_safety_factor_compression_yt

            const tensionCombination1 = (body.pl_safety_factor_tension_yg * body.permanent_compression_load) + (body.pl_safety_factor_tension_yq * body.variable_compression_load)
            const tensionOutput1 = tension / body.pl_safety_factor_tension_yt

            if (compressionCombination1 > compressionOutput1) {
              throw new Error("Designed compression load is greater than the designed compressive resistance.")
            }

            if (tensionCombination1 > tensionOutput1) {
              throw new Error("Designed tension load is greater than the designed tensile resistance.")
            }

            dynamicParams = {
              permanent_load: body.permanent_tension_load,
              variable_load: body.variable_tension_load,
              permanent_compression_load: body.permanent_compression_load,
              variable_compression_load: body.variable_compression_load,
              compression: roundToTwoDecimals(compression),
              tension: roundToTwoDecimals(tension),
              pl_safety_factor_compression_yg: body.pl_safety_factor_compression_yg,
              pl_safety_factor_compression_yq: body.pl_safety_factor_compression_yq,
              pl_safety_factor_compression_yt: body.pl_safety_factor_compression_yt,
              pl_safety_factor_tension_yg: body.pl_safety_factor_tension_yg,
              pl_safety_factor_tension_yq: body.pl_safety_factor_tension_yq,
              pl_safety_factor_tension_yt: body.pl_safety_factor_tension_yt,
            }
          }
        }
      break;

      default:
      throw new Error(`Unknown safety design method: ${body.design_method}`)
    }

    const fullDynamicParams = {
      design_method: body.design_method,
      country: body.country,
      ...dynamicParams
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
      pile_notes: body.pile_notes || "",
    }

    const pileStructure = {
      nominal_stress_area: body.nominal_stress_area,
      ultimate_tensile_strength_a480: body.ultimate_tensile_strength_a480,
      k2: body.k2,
      ultimate_tensile_strength_lm25m: body.ultimate_tensile_strength_lm25m,
      thread_engagement_length: body.thread_engagement_length,
      pitch_diameter: body.pitch_diameter,
      pile_gross_area: body.pile_gross_area,
      proof_strength: body.proof_strength,
      partial_safety_factor_1: body.partial_safety_factor_1,
      partial_safety_factor_2: body.partial_safety_factor_2,
    }

    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()

    const finalObject = { 
      profile_data: profileData,
      soils_data: soilsData,
      dynamic_params: fullDynamicParams,
      base_params: baseParams,
      pile_structure: pileStructure,
      user_id: data?.claims.sub
    }

    const { error } = await supabase
    .from('exports')
    .upsert(finalObject)

    if (error) {
      throw new Error("Failed to save export data")
    }
    
    
    let puppeteer: any, launchOptions: any = {headless: true}

    const isProduction = process.env.NODE_ENV === 'production' ? true : false

    if (isProduction) {
      const chromium = (await import("@sparticuz/chromium")).default
      puppeteer = await import ("puppeteer-core")
      launchOptions = {
        ...launchOptions,
        args: chromium.args,
        executablePath: await chromium.executablePath(),
      }
    }

    else {
      puppeteer = await import ("puppeteer")
    }


    const cookie = req.cookies.get('sb-kiasruegemqnakhmbels-auth-token')?.value

    const browser = await puppeteer.launch(launchOptions);
    
    const page = await browser.newPage()

    await browser.setCookie({
      name: 'sb-kiasruegemqnakhmbels-auth-token',
      value: cookie ?? '',
      domain: process.env.NODE_ENV === 'production' ? new URL(process.env.NEXT_PUBLIC_SITE_URL!).hostname : 'localhost',
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
