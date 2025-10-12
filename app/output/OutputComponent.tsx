"use client"
import { ToverviewSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { DynamicParamsType, PileStructureType, BaseParamsType } from "@/schemas/types"
import { ToverviewSoilSchema } from "@/schemas/soilSchemas"

export function OutputComponent({ baseParams, dynamicParams, soilsData, profileData, pileStructure }: { baseParams: BaseParamsType, dynamicParams: DynamicParamsType, pileStructure: PileStructureType, soilsData: ToverviewSoilSchema[], profileData: ToverviewSoilProfileSchema }) {

  // const totalTensionLoad = dynamicParams.design_method === "method_bs" ? dynamicParams.applied_tension_load : dynamicParams.permanent_tension_load + dynamicParams.variable_tension_load
  // const totalCompressionLoad = dynamicParams.design_method === "method_bs" ? dynamicParams.applied_compression_load : dynamicParams.permanent_compression_load + dynamicParams.variable_compression_load
  // const totalHorizontalLoad = pileStructure.horizontal_load * pileStructure.horizontal_load_safety_factor

  // const Ftra = roundToTwoDecimals(pileStructure.k2 * pileStructure.ultimate_tensile_strength_a480 * pileStructure.nominal_stress_area / (pileStructure.partial_safety_factor_2 * 1000))
 
  // const Fvra = roundToTwoDecimals(0.6 * pileStructure.ultimate_tensile_strength_a480 * pileStructure.nominal_stress_area / (pileStructure.partial_safety_factor_2 * 1000))

  // const Ftvra = roundToTwoDecimals(Math.PI * pileStructure.pitch_diameter * pileStructure.thread_engagement_length / 2 * 0.65 * pileStructure.ultimate_tensile_strength_lm25m / (pileStructure.partial_safety_factor_2 * 1000))

  // const Ntra = roundToTwoDecimals(Math.min(pileStructure.pile_gross_area * pileStructure.proof_strength / (pileStructure.partial_safety_factor_1 * 1000), 0.9 * 242 * pileStructure.ultimate_tensile_strength_lm25m / (pileStructure.partial_safety_factor_2 * 1000)))

  // const Nura = roundToTwoDecimals(242 * pileStructure.ultimate_tensile_strength_lm25m / (pileStructure.partial_safety_factor_2 * 1000))
  
console.log({baseParams, dynamicParams, soilsData, profileData, pileStructure})
  return (
    <>
      {/* --- PAGE 1: Title Page --- */}
      <div className="h-screen relative">
        <div className="flex flex-col justify-center items-center text-center h-full pb-15">
          <h1 className="text-4xl font-semibold tracking-tight">Helical Pile Computations</h1>
          <h2 className="text-2xl mt-3">Design Report</h2>
        </div>

        <div className="absolute bottom-30 right-20">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 text-left text-sm">
            {baseParams.job_location && (
              <>
                <p className="font-semibold">Job Location:</p>
                <p>{baseParams.job_location}</p>
              </>
            )}

            {baseParams.job_number && (
              <>
                <p className="font-semibold">Job Number:</p>
                <p>{baseParams.job_number}</p>
              </>
            )}

            {baseParams.checked_by && (
              <>
                <p className="font-semibold">Checked By:</p>
                <p>{baseParams.checked_by}</p>
              </>
            )}

            <p className="font-semibold">Generated On:</p>
            <p>{new Date().toLocaleDateString('en-UK', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
          </div>
        </div>
      </div>

      {/* --- PAGE 2: Soil Configuration --- */}
      <div className="page-break-before h-screen">
        <h2 className="text-2xl font-semibold">Soil Configuration</h2>
      </div>

     
    </>
  )
}