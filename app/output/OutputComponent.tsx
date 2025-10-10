"use client"
import { ToverviewSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { DynamicParamsType, PileStructureType, BaseParamsType } from "@/schemas/types"
import { ToverviewSoilSchema } from "@/schemas/soilSchemas"
import { SoilDiagram } from "../(dashboard)/overview/SoilDiagram"
import { SoilGraph } from "../(dashboard)/overview/SoilGraph"

// const ft_ra = body.k2 * body.ultimate_tensile_strength_a480 * (body.nominal_stress_area / body.partial_safety_factor_2)

export function OutputComponent({ baseParams, dynamicParams, soilsData, profileData }: { baseParams: BaseParamsType, dynamicParams: DynamicParamsType, pileStructure: PileStructureType, soilsData: ToverviewSoilSchema[], profileData: ToverviewSoilProfileSchema }) {
  
  return (
    <div className="min-h-screen bg-white p-8 print:p-4 max-w-3xl mx-auto overflow-auto">
      <div className="mb-8 border-b-2 border-gray-300 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Heli Pile Foundation</h1>
        <div className="grid grid-cols-2 gap-6 text-sm">
          {baseParams.job_number && (
            <div>
              <span className="font-semibold text-gray-700">Job Number:</span>
              <span className="ml-2 text-gray-900">{baseParams.job_number}</span>
            </div>
          )}
          {baseParams.pile_number && (
            <div>
              <span className="font-semibold text-gray-700">Pile Number:</span>
              <span className="ml-2 text-gray-900">{baseParams.pile_number}</span>
            </div>
          )}
          {baseParams.job_location && (
            <div className="col-span-2">
              <span className="font-semibold text-gray-700">Job Location:</span>
              <span className="ml-2 text-gray-900">{baseParams.job_location}</span>
            </div>
          )}
          {baseParams.design_notes && (
            <div className="col-span-2">
              <span className="font-semibold text-gray-700">Additional Information:</span>
              <div className="mt-1 text-gray-900 whitespace-pre-wrap">{baseParams.design_notes}</div>
            </div>
          )}
        </div>
      </div>

      <div className="scale-70 mb-8 no-break-inside">
        <SoilDiagram 
          profile={profileData} 
          profileSoils={soilsData} 
          pileDiameter={baseParams.pile_diameter} 
          hideBearingCapacity={false} 
          profileIndex={0} 
        />
      </div>

      <div className="page-break-before no-break-inside">
        <SoilGraph 
          profile={profileData} 
          profileSoils={soilsData} 
          pileDiameter={baseParams.pile_diameter} 
          hideBearingCapacity={false} 
          profileIndex={0} 
        />
      </div>

      <div>
        {dynamicParams.design_method === "method_bs" && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">BS 8004 Design Method</h2>
          </div>
        )}
      </div>

      <div className="mt-5 pt-6 border-t border-gray-300 text-xs text-gray-500 text-center">
        Generated on {new Date().toLocaleString()} Version No: 1.0.0
      </div>
    </div>
  )
}