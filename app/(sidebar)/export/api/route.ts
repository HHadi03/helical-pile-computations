import { NextRequest, NextResponse } from 'next/server'
import { exportFormSchema, TexportFormSchema } from '@/schemas/exportSchema'
import { createClient } from '@/utils/supabase/server'
import { TexportSoilProfileSchema } from '@/schemas/soilProfileSchemas'
import { ToverviewSoilSchema } from '@/schemas/soilSchemas'
import puppeteer from 'puppeteer'

async function getProfiles(profileId: string): Promise<TexportSoilProfileSchema>{
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
    throw new Error("Failed to locate required soil profile data, please try again later.")
  }
}

async function getSoils(profileId: string): Promise<ToverviewSoilSchema[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
    .from('soils')
    .select("id, soil_profile_id, soil, soil_name, soil_type, description, test_type, colour, start_depth, end_depth, n_value, y_moist, y_sat, h, su, t, shaft_capacity60, shaft_capacity100, bearing_capacity60, bearing_capacity100")
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
    let dynamicParams: Record<string, string>
    
    switch (body.safety_design_method) {
      case "method_bs":
        soilsData = await getSoils(body.soil_profile_id)
        profileData = await getProfiles(body.soil_profile_id)

        const tension = body.pile_diameter === "60" ? soilsData.reduce((sum, soil) => sum + soil.shaft_capacity60, 0) : soilsData.reduce((sum, soil) => sum + soil.shaft_capacity100, 0)
        
        const lastLayer = soilsData.find(soil => soil.start_depth <= profileData.effective_pile_length && profileData.effective_pile_length <= soil.end_depth) || soilsData[soilsData.length - 1]
        const bearingCapacity = body.pile_diameter === "60" ? lastLayer.bearing_capacity60 : lastLayer.bearing_capacity100
        const compression = tension + bearingCapacity

        const tensionOutput = tension / body.global_safety_factor
        const compressionOutput = compression / body.global_safety_factor
        
        dynamicParams = {
          tensionOutput: tensionOutput.toString(),
          compressionOutput: compressionOutput.toString(),
          appliedLoad: body.applied_load!.toString()
        }
      break;

      case "method_en":
        soilsData = await getSoils(body.soil_profile_id)
        profileData = await getProfiles(body.soil_profile_id)

        if (body.use_characteristic) {
          try {
            const supabase = await createClient()
            const { data: soilCapacities, error: capacitiesError } = await supabase
            .from('soils')
            .select('shaft_capacity60, shaft_capacity100, bearing_capacity60, bearing_capacity100, soil_profile_id')
            .order('start_depth', { ascending: true })
            .gt("shaft_capacity60", 0)
            
            if (capacitiesError) {
              throw new Error()
            }

            const soilsByProfile = Object.groupBy(soilCapacities, soil => soil.soil_profile_id)

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
            
            const numberOfSoilProfiles = soilCapacities.length > 5 ? 5 : soilCapacities.length
            
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
              const compressionCombination1 = (body.uk_safety_factor_compression_yG1 * body.permanent_actions!) + (body.uk_safety_factor_compression_yQ1 * body.variable_actions!)
              const compressionCombination2 = (body.uk_safety_factor_compression_yG2 * body.permanent_actions!) + (body.uk_safety_factor_compression_yQ2 * body.variable_actions!)
              const compressionOutput1 = rckCompression / body.uk_safety_factor_compression_yT1
              const compressionOutput2 = rckCompression / body.uk_safety_factor_compression_yT2

              const tensionCombination1 = (body.uk_safety_factor_tension_yG2 * body.permanent_actions!) + (body.uk_safety_factor_tension_yQ2 * body.variable_actions!)
              const tensionCombination2 = (body.uk_safety_factor_tension_yG1 * body.permanent_actions!) + (body.uk_safety_factor_tension_yQ1 * body.variable_actions!)
              const tensionOutput1 = rckTension / body.uk_safety_factor_tension_yT1
              const tensionOutput2 = rckTension / body.uk_safety_factor_tension_yT2

              dynamicParams = {
                compressionCombination1: compressionCombination1.toString(),
                compressionCombination2: compressionCombination2.toString(),
                compressionOutput1: compressionOutput1.toString(),
                compressionOutput2: compressionOutput2.toString(),
                tensionCombination1: tensionCombination1.toString(),
                tensionCombination2: tensionCombination2.toString(),
                tensionOutput1: tensionOutput1.toString(),
                tensionOutput2: tensionOutput2.toString()
              }
            }

            else if (body.country === "nl") {
              const compressionCombination1 = (body.nl_safety_factor_compression_yG * body.permanent_actions!) + (body.nl_safety_factor_compression_yQ * body.variable_actions!)
              const compressionOutput1 = rckCompression / body.nl_safety_factor_compression_yT

              const tensionCombination1 = (body.nl_safety_factor_tension_yG * body.permanent_actions!) + (body.nl_safety_factor_tension_yQ * body.variable_actions!)
              const tensionOutput1 = rckTension / body.nl_safety_factor_tension_yT

              dynamicParams = {
                compressionCombination1: compressionCombination1.toString(),
                compressionOutput1: compressionOutput1.toString(),
                tensionCombination1: tensionCombination1.toString(),
                tensionOutput1: tensionOutput1.toString()
              }
            }
          
            else {
              const compressionCombination1 = (body.pl_safety_factor_compression_yG * body.permanent_actions!) + (body.pl_safety_factor_compression_yQ * body.variable_actions!)
              const compressionOutput1 = rckCompression / body.pl_safety_factor_compression_yT

              const tensionCombination1 = (body.pl_safety_factor_tension_yG * body.permanent_actions!) + (body.pl_safety_factor_tension_yQ * body.variable_actions!)
              const tensionOutput1 = rckTension / body.pl_safety_factor_tension_yT

              dynamicParams = {
                compressionCombination1: compressionCombination1.toString(),
                compressionOutput1: compressionOutput1.toString(),
                tensionCombination1: tensionCombination1.toString(),
                tensionOutput1: tensionOutput1.toString()
              }
            }
          }
          
          catch {
            throw new Error("Failed to calculate use characteristic values, please try again later.")
          }
        }

        else {
          const tension = body.pile_diameter === "60" ? soilsData.reduce((sum, soil) => sum + soil.shaft_capacity60, 0) : soilsData.reduce((sum, soil) => sum + soil.shaft_capacity100, 0)
        
          const lastLayer = soilsData.find(soil => soil.start_depth <= profileData.effective_pile_length && profileData.effective_pile_length <= soil.end_depth) || soilsData[soilsData.length - 1]
          const bearingCapacity = body.pile_diameter === "60" ? lastLayer.bearing_capacity60 : lastLayer.bearing_capacity100
          const compression = tension + bearingCapacity
          
          if (body.country === "uk") {
            const compressionCombination1 = (body.uk_safety_factor_compression_yG1 * body.permanent_actions!) + (body.uk_safety_factor_compression_yQ1 * body.variable_actions!)
            const compressionCombination2 = (body.uk_safety_factor_compression_yG2 * body.permanent_actions!) + (body.uk_safety_factor_compression_yQ2 * body.variable_actions!)
            const compressionOutput1 = compression / body.uk_safety_factor_compression_yT1
            const compressionOutput2 = compression / body.uk_safety_factor_compression_yT2

            const tensionCombination1 = (body.uk_safety_factor_tension_yG2 * body.permanent_actions!) + (body.uk_safety_factor_tension_yQ2 * body.variable_actions!)
            const tensionCombination2 = (body.uk_safety_factor_tension_yG1 * body.permanent_actions!) + (body.uk_safety_factor_tension_yQ1 * body.variable_actions!)
            const tensionOutput1 = tension / body.uk_safety_factor_tension_yT1
            const tensionOutput2 = tension / body.uk_safety_factor_tension_yT2

            dynamicParams = {
              compressionCombination1: compressionCombination1.toString(),
              compressionCombination2: compressionCombination2.toString(),
              compressionOutput1: compressionOutput1.toString(),
              compressionOutput2: compressionOutput2.toString(),
              tensionCombination1: tensionCombination1.toString(),
              tensionCombination2: tensionCombination2.toString(),
              tensionOutput1: tensionOutput1.toString(),
              tensionOutput2: tensionOutput2.toString()
            }
          }

          else if (body.country === "nl") {
            const compressionCombination1 = (body.nl_safety_factor_compression_yG * body.permanent_actions!) + (body.nl_safety_factor_compression_yQ * body.variable_actions!)
            const compressionOutput1 = compression / body.nl_safety_factor_compression_yT

            const tensionCombination1 = (body.nl_safety_factor_tension_yG * body.permanent_actions!) + (body.nl_safety_factor_tension_yQ * body.variable_actions!)
            const tensionOutput1 = tension / body.nl_safety_factor_tension_yT

            dynamicParams = {
              compressionCombination1: compressionCombination1.toString(),
              compressionOutput1: compressionOutput1.toString(),
              tensionCombination1: tensionCombination1.toString(),
              tensionOutput1: tensionOutput1.toString()
            }
          }
          
          else {
            const compressionCombination1 = (body.pl_safety_factor_compression_yG * body.permanent_actions!) + (body.pl_safety_factor_compression_yQ * body.variable_actions!)
            const compressionOutput1 = compression / body.pl_safety_factor_compression_yT

            const tensionCombination1 = (body.pl_safety_factor_tension_yG * body.permanent_actions!) + (body.pl_safety_factor_tension_yQ * body.variable_actions!)
            const tensionOutput1 = tension / body.pl_safety_factor_tension_yT

            dynamicParams = {
              compressionCombination1: compressionCombination1.toString(),
              compressionOutput1: compressionOutput1.toString(),
              tensionCombination1: tensionCombination1.toString(),
              tensionOutput1: tensionOutput1.toString()
            }
          }
        }
      break;

      case "method_test":
        soilsData = await getSoils(body.soil_profile_id)
        profileData = await getProfiles(body.soil_profile_id)
        
        if (body.use_characteristic) {
          const numberOfSoilProfiles = body.number_of_tests! > 5 ? 5 : body.number_of_tests!
          const s1 = nObjectMethodTest[numberOfSoilProfiles].s1
          const s2 = nObjectMethodTest[numberOfSoilProfiles].s2
          const rckTension = Math.min(body.mean_tensile_rcm! / s1, body.min_tensile_rcm! / s2)
          const rckCompression = Math.min(body.mean_compression_rcm! / s1, body.min_compression_rcm! / s2)

          if (body.country === "uk") {
            const compressionCombination1 = (body.uk_safety_factor_compression_yG1 * body.permanent_actions!) + (body.uk_safety_factor_compression_yQ1 * body.variable_actions!)
            const compressionCombination2 = (body.uk_safety_factor_compression_yG2 * body.permanent_actions!) + (body.uk_safety_factor_compression_yQ2 * body.variable_actions!)
            const compressionOutput1 = rckCompression / body.uk_safety_factor_compression_yT1
            const compressionOutput2 = rckCompression / body.uk_safety_factor_compression_yT2

            const tensionCombination1 = (body.uk_safety_factor_tension_yG2 * body.permanent_actions!) + (body.uk_safety_factor_tension_yQ2 * body.variable_actions!)
            const tensionCombination2 = (body.uk_safety_factor_tension_yG1 * body.permanent_actions!) + (body.uk_safety_factor_tension_yQ1 * body.variable_actions!)
            const tensionOutput1 = rckTension / body.uk_safety_factor_tension_yT1
            const tensionOutput2 = rckTension / body.uk_safety_factor_tension_yT2

            dynamicParams = {
              compressionCombination1: compressionCombination1.toString(),
              compressionCombination2: compressionCombination2.toString(),
              compressionOutput1: compressionOutput1.toString(),
              compressionOutput2: compressionOutput2.toString(),
              tensionCombination1: tensionCombination1.toString(),
              tensionCombination2: tensionCombination2.toString(),
              tensionOutput1: tensionOutput1.toString(),
              tensionOutput2: tensionOutput2.toString()
            }
          }

          else if (body.country === "nl") {
            const compressionCombination1 = (body.nl_safety_factor_compression_yG * body.permanent_actions!) + (body.nl_safety_factor_compression_yQ * body.variable_actions!)
            const compressionOutput1 = rckCompression / body.nl_safety_factor_compression_yT

            const tensionCombination1 = (body.nl_safety_factor_tension_yG * body.permanent_actions!) + (body.nl_safety_factor_tension_yQ * body.variable_actions!)
            const tensionOutput1 = rckTension / body.nl_safety_factor_tension_yT

            dynamicParams = {
              compressionCombination1: compressionCombination1.toString(),
              compressionOutput1: compressionOutput1.toString(),
              tensionCombination1: tensionCombination1.toString(),
              tensionOutput1: tensionOutput1.toString()
            }
          }
        
          else {
            const compressionCombination1 = (body.pl_safety_factor_compression_yG * body.permanent_actions!) + (body.pl_safety_factor_compression_yQ * body.variable_actions!)
            const compressionOutput1 = rckCompression / body.pl_safety_factor_compression_yT

            const tensionCombination1 = (body.pl_safety_factor_tension_yG * body.permanent_actions!) + (body.pl_safety_factor_tension_yQ * body.variable_actions!)
            const tensionOutput1 = rckTension / body.pl_safety_factor_tension_yT

            dynamicParams = {
              compressionCombination1: compressionCombination1.toString(),
              compressionOutput1: compressionOutput1.toString(),
              tensionCombination1: tensionCombination1.toString(),
              tensionOutput1: tensionOutput1.toString()
            }
          }
        }

        else {
          const tension = body.standardTension!
          const compression = body.standardCompression!

          if (body.country === "uk") {
            const compressionCombination1 = (body.uk_safety_factor_compression_yG1 * body.permanent_actions!) + (body.uk_safety_factor_compression_yQ1 * body.variable_actions!)
            const compressionCombination2 = (body.uk_safety_factor_compression_yG2 * body.permanent_actions!) + (body.uk_safety_factor_compression_yQ2 * body.variable_actions!)
            const compressionOutput1 = compression / body.uk_safety_factor_compression_yT1
            const compressionOutput2 = compression / body.uk_safety_factor_compression_yT2

            const tensionCombination1 = (body.uk_safety_factor_tension_yG2 * body.permanent_actions!) + (body.uk_safety_factor_tension_yQ2 * body.variable_actions!)
            const tensionCombination2 = (body.uk_safety_factor_tension_yG1 * body.permanent_actions!) + (body.uk_safety_factor_tension_yQ1 * body.variable_actions!)
            const tensionOutput1 = tension / body.uk_safety_factor_tension_yT1
            const tensionOutput2 = tension / body.uk_safety_factor_tension_yT2

            dynamicParams = {
              compressionCombination1: compressionCombination1.toString(),
              compressionCombination2: compressionCombination2.toString(),
              compressionOutput1: compressionOutput1.toString(),
              compressionOutput2: compressionOutput2.toString(),
              tensionCombination1: tensionCombination1.toString(),
              tensionCombination2: tensionCombination2.toString(),
              tensionOutput1: tensionOutput1.toString(),
              tensionOutput2: tensionOutput2.toString()
            }
          }

          else if (body.country === "nl") {
            const compressionCombination1 = (body.nl_safety_factor_compression_yG * body.permanent_actions!) + (body.nl_safety_factor_compression_yQ * body.variable_actions!)
            const compressionOutput1 = compression / body.nl_safety_factor_compression_yT

            const tensionCombination1 = (body.nl_safety_factor_tension_yG * body.permanent_actions!) + (body.nl_safety_factor_tension_yQ * body.variable_actions!)
            const tensionOutput1 = tension / body.nl_safety_factor_tension_yT

            dynamicParams = {
              compressionCombination1: compressionCombination1.toString(),
              compressionOutput1: compressionOutput1.toString(),
              tensionCombination1: tensionCombination1.toString(),
              tensionOutput1: tensionOutput1.toString()
            }
          }
          
          else {
            const compressionCombination1 = (body.pl_safety_factor_compression_yG * body.permanent_actions!) + (body.pl_safety_factor_compression_yQ * body.variable_actions!)
            const compressionOutput1 = compression / body.pl_safety_factor_compression_yT

            const tensionCombination1 = (body.pl_safety_factor_tension_yG * body.permanent_actions!) + (body.pl_safety_factor_tension_yQ * body.variable_actions!)
            const tensionOutput1 = tension / body.pl_safety_factor_tension_yT

            dynamicParams = {
              compressionCombination1: compressionCombination1.toString(),
              compressionOutput1: compressionOutput1.toString(),
              tensionCombination1: tensionCombination1.toString(),
              tensionOutput1: tensionOutput1.toString()
            }
          }
        }
      break;

      default:
      throw new Error(`Unknown safety design method: ${body.safety_design_method}`)
    }
    
    const baseParams: Record<string, string> = {
      soilsData: JSON.stringify(soilsData),
      profileData: JSON.stringify(profileData),
      jobNumber: body.job_number || '',
      pileNumber: body.pile_number || '',
      jobLocation: body.job_location || '',
      additionalInformation: body.additional_information || '',
      pileDiameter: body.pile_diameter,
      safetyDesignMethod: body.safety_design_method
    }

    const finalParams = { ...baseParams, ...dynamicParams }
    const params = new URLSearchParams(finalParams)

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.setViewport({ 
      width: 1280, height: 1080, 
      deviceScaleFactor: 1
    })
    
    const baseUrl = process.env.NODE_ENV === 'production' ? process.env.VERCEL_URL || process.env.NEXT_PUBLIC_SITE_URL : 'http://localhost:3000'
    await page.goto(`${baseUrl}/output?${params.toString()}`, { 
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
      }
    })
    
    await browser.close()
    
    return new NextResponse(pdf as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
      }
    })

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Invalid Request" }, { status: 500 })
  }
}