"use client"
import { TexportFormSchema } from "@/schemas/exportSchema"
import { ToverviewSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { DynamicParamsType } from "@/schemas/types"
import { ToverviewSoilSchema } from "@/schemas/soilSchemas"
import { SoilDiagram } from "../(dashboard)/overview/SoilDiagram"
import { SoilGraph } from "../(dashboard)/overview/SoilGraph"

export function OutputComponent({ 
  baseParams, 
  dynamicParams, 
  soilsData, 
  profileData 
}: { 
  baseParams: Omit<TexportFormSchema, 'design_method'>, 
  dynamicParams: DynamicParamsType, 
  soilsData: ToverviewSoilSchema[], 
  profileData: ToverviewSoilProfileSchema 
}) {
  
  const renderBSDesign = () => {
    if (dynamicParams.design_method !== 'method_bs') return null
    
    const { tension, compression, applied_load, global_safety_factor } = dynamicParams
    
    const tensionResult = tension / global_safety_factor
    const compressionResult = compression / global_safety_factor
    const tensionPass = applied_load <= tensionResult
    const compressionPass = applied_load <= compressionResult
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tension Analysis</h3>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-md border border-gray-100">
                <p className="text-sm text-gray-600 mb-2">Equation:</p>
                <p className="font-mono text-sm break-all">
                  {applied_load.toFixed(2)} ≤ ({tension.toFixed(2)} / {global_safety_factor.toFixed(2)})
                </p>
                <p className="font-mono text-sm mt-2">
                  {applied_load.toFixed(2)} ≤ {tensionResult.toFixed(2)}
                </p>
              </div>
              <div className={`text-center py-2 rounded-md font-medium ${tensionPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {tensionPass ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compression Analysis</h3>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-md border border-gray-100">
                <p className="text-sm text-gray-600 mb-2">Equation:</p>
                <p className="font-mono text-sm break-all">
                  {applied_load.toFixed(2)} ≤ ({compression.toFixed(2)} / {global_safety_factor.toFixed(2)})
                </p>
                <p className="font-mono text-sm mt-2">
                  {applied_load.toFixed(2)} ≤ {compressionResult.toFixed(2)}
                </p>
              </div>
              <div className={`text-center py-2 rounded-md font-medium ${compressionPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {compressionPass ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderENDesign = () => {
    
    if (dynamicParams.design_method === 'method_bs') return null

    const { tension, compression, permanent_load, variable_load } = dynamicParams
    
   if (dynamicParams.country === 'uk') {
  // Compression values
  const compLoad1 = dynamicParams.uk_safety_factor_compression_yG1 * permanent_load + dynamicParams.uk_safety_factor_compression_yQ1 * variable_load;
  const compRes1 = compression / dynamicParams.uk_safety_factor_compression_yT1;
  const compLoad2 = dynamicParams.uk_safety_factor_compression_yG2 * permanent_load + dynamicParams.uk_safety_factor_compression_yQ2 * variable_load;
  const compRes2 = compression / dynamicParams.uk_safety_factor_compression_yT2;

  const compressionPass1 = compLoad1 <= compRes1;
  const compressionPass2 = compLoad2 <= compRes2;

  // Tension values
  const tensLoad1 = dynamicParams.uk_safety_factor_tension_yG1 * permanent_load + dynamicParams.uk_safety_factor_tension_yQ1 * variable_load;
  const tensRes1 = tension / dynamicParams.uk_safety_factor_tension_yT1;
  const tensLoad2 = dynamicParams.uk_safety_factor_tension_yG2 * permanent_load + dynamicParams.uk_safety_factor_tension_yQ2 * variable_load;
  const tensRes2 = tension / dynamicParams.uk_safety_factor_tension_yT2;

  const tensionPass1 = tensLoad1 <= tensRes1;
  const tensionPass2 = tensLoad2 <= tensRes2;

  return (
    <div className="space-y-8">
      {/* Compression Check */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compression Check</h3>
        <div className="grid grid-cols-2 gap-6">
          {/* Combination 1 */}
          <div className="p-4 bg-white rounded-md border border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-3">Combination 1</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-600">Designed Load:</p>
                  <p className="font-mono text-sm">{compLoad1.toFixed(2)} kN</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-600">Designed Resistance:</p>
                  <p className="font-mono text-sm">{compRes1.toFixed(2)} kN</p>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Equation:</p>
                  <p className="font-mono text-xs break-all">
                    {`(${dynamicParams.uk_safety_factor_compression_yG1} × ${permanent_load}) +
                      (${dynamicParams.uk_safety_factor_compression_yQ1} × ${variable_load}) ≤
                      (${compression} / ${dynamicParams.uk_safety_factor_compression_yT1})`}
                  </p>
                </div>
              </div>
              <div
                className={`text-center py-2 rounded-md font-medium ${
                  compressionPass1
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {compressionPass1 ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>

          {/* Combination 2 */}
          <div className="p-4 bg-white rounded-md border border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-3">Combination 2</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-600">Designed Load:</p>
                  <p className="font-mono text-sm">{compLoad2.toFixed(2)} kN</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-600">Designed Resistance:</p>
                  <p className="font-mono text-sm">{compRes2.toFixed(2)}</p>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Equation:</p>
                  <p className="font-mono text-xs break-all">
                    {`(${dynamicParams.uk_safety_factor_compression_yG2} × ${permanent_load}) + 
                      (${dynamicParams.uk_safety_factor_compression_yQ2} × ${variable_load}) ≤ 
                      (${compression} / ${dynamicParams.uk_safety_factor_compression_yT2})`}
                  </p>
                </div>
              </div>
              <div
                className={`text-center py-2 rounded-md font-medium ${
                  compressionPass2
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {compressionPass2 ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tension Check */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tension Check</h3>
        <div className="grid grid-cols-2 gap-6">
          {/* Combination 1 */}
          <div className="p-4 bg-white rounded-md border border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-3">Combination 1</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-600">Designed Load:</p>
                  <p className="font-mono text-sm">{tensLoad1.toFixed(2)} kN</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-600">Designed Resistance:</p>
                  <p className="font-mono text-sm">{tensRes1.toFixed(2)} kN</p>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Equation:</p>
                  <p className="font-mono text-xs break-all">
                    {`(${dynamicParams.uk_safety_factor_tension_yG1} × ${permanent_load}) + 
                      (${dynamicParams.uk_safety_factor_tension_yQ1} × ${variable_load}) ≤ 
                      (${tension} / ${dynamicParams.uk_safety_factor_tension_yT1})`}
                  </p>
                </div>
              </div>
              <div
                className={`text-center py-2 rounded-md font-medium ${
                  tensionPass1
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {tensionPass1 ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>

          {/* Combination 2 */}
          <div className="p-4 bg-white rounded-md border border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-3">Combination 2</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-600">Designed Load:</p>
                  <p className="font-mono text-sm">{tensLoad2.toFixed(2)} kN</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-600">Designed Resistance:</p>
                  <p className="font-mono text-sm">{tensRes2.toFixed(2)} kN</p>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Equation:</p>
                  <p className="font-mono text-xs break-all">
                    {`(${dynamicParams.uk_safety_factor_tension_yG2} × ${permanent_load}) + 
                      (${dynamicParams.uk_safety_factor_tension_yQ2} × ${variable_load}) ≤ 
                      (${tension} / ${dynamicParams.uk_safety_factor_tension_yT2})`}
                  </p>
                </div>
              </div>
              <div
                className={`text-center py-2 rounded-md font-medium ${
                  tensionPass2
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {tensionPass2 ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} else if (dynamicParams.country === 'nl') {
      const {
        nl_safety_factor_compression_yG,
        nl_safety_factor_compression_yQ,
        nl_safety_factor_compression_yT,
        nl_safety_factor_tension_yG,
        nl_safety_factor_tension_yQ,
        nl_safety_factor_tension_yT,
      } = dynamicParams
      
      const compressionCombination = (nl_safety_factor_compression_yG * permanent_load) + (nl_safety_factor_compression_yQ * variable_load)
      const compressionOutput = compression / nl_safety_factor_compression_yT
      const compressionPass = compressionCombination >= compressionOutput
      
      const tensionCombination = (nl_safety_factor_tension_yG * permanent_load) + (nl_safety_factor_tension_yQ * variable_load)
      const tensionOutput = tension / nl_safety_factor_tension_yT
      const tensionPass = tensionCombination >= tensionOutput
      
      return (
        <div className="space-y-8">
          {/* Compression Analysis */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compression Analysis</h3>
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-white rounded-md border border-gray-100">
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-600 mb-1">Equation:</p>
                    <p className="font-mono text-xs break-all">
                      ({nl_safety_factor_compression_yG.toFixed(2)} × {permanent_load.toFixed(2)}) + ({nl_safety_factor_compression_yQ.toFixed(2)} × {variable_load.toFixed(2)}) ≤ {compression.toFixed(2)} / {nl_safety_factor_compression_yT.toFixed(2)}
                    </p>
                    <p className="font-mono text-xs mt-2">
                      {compressionCombination.toFixed(2)} ≤ {compressionOutput.toFixed(2)}
                    </p>
                  </div>
                  <div className={`text-center py-2 rounded-md font-medium ${compressionPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {compressionPass ? 'PASS' : 'FAIL'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tension Analysis */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tension Analysis</h3>
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-white rounded-md border border-gray-100">
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-600 mb-1">Equation:</p>
                    <p className="font-mono text-xs break-all">
                      ({nl_safety_factor_tension_yG.toFixed(2)} × {permanent_load.toFixed(2)}) + ({nl_safety_factor_tension_yQ.toFixed(2)} × {variable_load.toFixed(2)}) ≤ {tension.toFixed(2)} / {nl_safety_factor_tension_yT.toFixed(2)}
                    </p>
                    <p className="font-mono text-xs mt-2">
                      {tensionCombination.toFixed(2)} ≤ {tensionOutput.toFixed(2)}
                    </p>
                  </div>
                  <div className={`text-center py-2 rounded-md font-medium ${tensionPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {tensionPass ? 'PASS' : 'FAIL'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    } else if (dynamicParams.country === 'pl') {
      const {
        pl_safety_factor_compression_yG,
        pl_safety_factor_compression_yQ,
        pl_safety_factor_compression_yT,
        pl_safety_factor_tension_yG,
        pl_safety_factor_tension_yQ,
        pl_safety_factor_tension_yT,
      } = dynamicParams
      
      const compressionCombination = (pl_safety_factor_compression_yG * permanent_load) + (pl_safety_factor_compression_yQ * variable_load)
      const compressionOutput = compression / pl_safety_factor_compression_yT
      const compressionPass = compressionCombination <= compressionOutput
      
      const tensionCombination = (pl_safety_factor_tension_yG * permanent_load) + (pl_safety_factor_tension_yQ * variable_load)
      const tensionOutput = tension / pl_safety_factor_tension_yT
      const tensionPass = tensionCombination <= tensionOutput
      
      return (
        <div className="space-y-8">
          {/* Compression Analysis */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compression Analysis</h3>
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-white rounded-md border border-gray-100">
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-600 mb-1">Equation:</p>
                    <p className="font-mono text-xs break-all">
                      ({pl_safety_factor_compression_yG.toFixed(2)} × {permanent_load.toFixed(2)}) + ({pl_safety_factor_compression_yQ.toFixed(2)} × {variable_load.toFixed(2)}) ≤ {compression.toFixed(2)} / {pl_safety_factor_compression_yT.toFixed(2)}
                    </p>
                    <p className="font-mono text-xs mt-2">
                      {compressionCombination.toFixed(2)} ≤ {compressionOutput.toFixed(2)}
                    </p>
                  </div>
                  <div className={`text-center py-2 rounded-md font-medium ${compressionPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {compressionPass ? 'PASS' : 'FAIL'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tension Analysis */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tension Analysis</h3>
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-white rounded-md border border-gray-100">
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-600 mb-1">Equation:</p>
                    <p className="font-mono text-xs break-all">
                      ({pl_safety_factor_tension_yG.toFixed(2)} × {permanent_load.toFixed(2)}) + ({pl_safety_factor_tension_yQ.toFixed(2)} × {variable_load.toFixed(2)}) ≤ {tension.toFixed(2)} / {pl_safety_factor_tension_yT.toFixed(2)}
                    </p>
                    <p className="font-mono text-xs mt-2">
                      {tensionCombination.toFixed(2)} ≤ {tensionOutput.toFixed(2)}
                    </p>
                  </div>
                  <div className={`text-center py-2 rounded-md font-medium ${tensionPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {tensionPass ? 'PASS' : 'FAIL'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    return null
  }

  return (
    <div className="min-h-screen bg-white p-8 print:p-4 max-w-[210mm] mx-auto">
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

      <div className="mb-8 max-w-3xl no-break-inside">
        <SoilDiagram 
          profile={profileData} 
          profileSoils={soilsData} 
          pileDiameter={baseParams.pile_diameter} 
          hideBearingCapacity={false} 
          profileIndex={0} 
        />
      </div>

      <div className="max-w-3xl page-break-before no-break-inside">
        <SoilGraph 
          profile={profileData} 
          profileSoils={soilsData} 
          pileDiameter={baseParams.pile_diameter} 
          hideBearingCapacity={false} 
          profileIndex={0} 
        />
      </div>

      <div className="page-break-before no-break-inside mt-10">
  <h2 className="text-2xl font-bold text-gray-900 mb-4">Ultimate Limit State (STR)</h2>

  {/* Design Metadata */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 text-sm text-gray-700">
    <div>
      <span className="font-medium">Soil Profile:</span>{' '}
      {profileData.profile_name ? profileData.profile_name : "1"}
    </div>
    <div>
      <span className="font-medium">Pile Number:</span>{' '}
      {baseParams.pile_number}
    </div>
    <div>
      <span className="font-medium">Design Method:</span>{' '}
      {dynamicParams.design_method === 'method_bs'
        ? 'Design by calculation (BS 8004)'
        : dynamicParams.design_method === 'method_en'
        ? 'Design by calculation (EN 1997-1)'
        : dynamicParams.design_method === 'method_test'
        ? 'Design by testing'
        : '—'}
    </div>
    <div>
      <span className="font-medium">Notes:</span>{' '}
      {baseParams.design_notes}
    </div>
  </div>

  {/* Render design based on method */}
  {dynamicParams.design_method === 'method_bs' && renderBSDesign()}
  {(dynamicParams.design_method === 'method_en' || dynamicParams.design_method === 'method_test') && renderENDesign()}
</div>

<div className="mt-5 pt-6 border-t border-gray-300 text-xs text-gray-500 text-center">
  Generated on {new Date().toLocaleString()} Version No: 1.0.0
</div>
    </div>
  )
}