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
      throw new Error
    }

    return data
  }

  catch (error) {
    throw new Error("Failed to locate required soil profile data, please try again later.")
  }
}

async function getSoils(profileId: string): Promise<ToverviewSoilSchema[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
    .from('soils')
    .select("id, soil_profile_id, soil, soil_name, soil_type, description, colour, start_depth, end_depth, n_value, y_moist, y_sat, h, su, t, shaft_capacity60, shaft_capacity100, bearing_capacity60, bearing_capacity100")
    .order('start_depth', { ascending: true })
    .eq("soil_profile_id", profileId)

    if (error) {
      throw new Error
    }

    return data 
  }

  catch (error) {
   throw new Error('Please insert soil layers before attempting to export analysis.')
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const body: TexportFormSchema = exportFormSchema.parse(json)
    
    let soilsData: ToverviewSoilSchema[] = [{
      id: '',
      soil_profile_id: '',
      soil: '',
      soil_name: '',
      soil_type: 'coarse',
      description: '',
      colour: '',
      start_depth: 0,
      end_depth: 0,
      n_value: 0,
      y_moist: 0,
      y_sat: 0,
      h: 0,
      su: 0,
      t: 0,
      shaft_capacity60: 0,
      shaft_capacity100: 0,
      bearing_capacity60: 0,
      bearing_capacity100: 0
    }]

    let profileData: TexportSoilProfileSchema = {
      profile_name: 'PLACEHOLDER',
      water_depth: 0,
      effective_pile_length: 0,
      pile_stick_out: 0
    }

    let dynamicParams: Record<string, string> = {
      error: 'NOT_IMPLEMENTED_YET'
    }
    
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
        if (body.use_characteristic) {
          try {
            const supabase = await createClient()
            const { data: soilCapacities, error: capacitiesError } = await supabase
            .from('soils')
            .select('shaft_capacity60, shaft_capacity100, bearing_capacity60, bearing_capacity100, soil_profile_id')
            .order('start_depth', { ascending: true })
            .gt("shaft_capacity60", 0)
            
            if (capacitiesError) {
              throw new Error
            }

            const soilsByProfile = Object.groupBy(soilCapacities, soil => soil.soil_profile_id)
             for (const profileId in soilsByProfile) {
              const soils = soilsByProfile[profileId]!
              const tension = body.pile_diameter === "60" ? soils.reduce((sum, soil) => sum + soil.shaft_capacity60, 0) : soils.reduce((sum, soil) => sum + soil.shaft_capacity100, 0)
              const compression = tension + (body.pile_diameter === "60" ? soils[soils.length - 1].bearing_capacity60 : soils[soils.length - 1].bearing_capacity100)
            }
            
      
          }
          
          catch {

          }
        }

        else {
          soilsData = await getSoils(body.soil_profile_id)
          profileData = await getProfiles(body.soil_profile_id)
          const tension = body.pile_diameter === "60" ? soilsData.reduce((sum, soil) => sum + soil.shaft_capacity60, 0) : soilsData.reduce((sum, soil) => sum + soil.shaft_capacity100, 0)
        
          const lastLayer = soilsData.find(soil => soil.start_depth <= profileData.effective_pile_length && profileData.effective_pile_length <= soil.end_depth) || soilsData[soilsData.length - 1]
          const bearingCapacity = body.pile_diameter === "60" ? lastLayer.bearing_capacity60 : lastLayer.bearing_capacity100
          const compression = tension + bearingCapacity
          
          if (body.country === "uk") {
            const compressionCombination1 = (body.uk_safety_factor_compression_yG1 * body.permanent_actions!) + (body.uk_safety_factor_compression_yQ1 * body.variable_actions!)
            const compressionCombination2 = (body.uk_safety_factor_compression_yG2 * body.permanent_actions!) + (body.uk_safety_factor_compression_yQ2 * body.variable_actions!)
            const compressionOutput1 = compression / body.uk_safety_factor_tension_yT1
            const compressionOutput2 = compression / body.uk_safety_factor_tension_yT2

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
        // Add your logic here
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
    await page.setViewport({ width: 1280, height: 1080, deviceScaleFactor: 1 })
    
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
    
    return new Response(pdf as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="helical-piles-computations-export.pdf"`
      }
    })

  } catch (error) {
    if (error instanceof Error) {
      console.log("FETCH ERROR CAUGHT")
      return new Response(
        JSON.stringify({ message: error.message, errors: {} }),
        {status: 400, headers: { 'Content-Type': 'application/json' }}
      )
    }
    
     console.log("other error CAUGHT")
    return new Response(
      JSON.stringify({message: 'Invalid request', errors: {}}),
      {status: 400, headers: { 'Content-Type': 'application/json' }}
    )
  }
}