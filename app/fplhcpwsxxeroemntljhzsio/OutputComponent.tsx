"use client"
import { TexportSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { DynamicParamsType, PileStructureType, BaseParamsType } from "@/schemas/types"
import { TexportSoilSchema } from "@/schemas/soilSchemas"
import { getLuminance, roundToOneDecimal, roundToTwoDecimals } from "@/lib/utils"
import { Triangle, MoveUp } from "lucide-react"
import { OutputSoilGraph } from "./OutputSoilGraph"
import { Arimo } from "next/font/google"
import { Space_Mono } from "next/font/google"

const arimo = Arimo({subsets: ["latin"], weight: ['400', '700']})
const spaceMono = Space_Mono({subsets: ["latin"], weight: ['400', '700'], variable: '--font-space-mono'})

export function OutputComponent({ baseParams, dynamicParams, soilsData, profileData, pileStructure, imageUrl }: { baseParams: BaseParamsType, dynamicParams: DynamicParamsType, pileStructure: PileStructureType, soilsData: TexportSoilSchema[], profileData: TexportSoilProfileSchema, imageUrl: string | null }) {
  
  const ultimatePulloutCapacity = baseParams.pile_diameter === "60" ? soilsData.reduce((sum, soil) => sum + soil.shaft_capacity60, 0) : soilsData.reduce((sum, soil) => sum + soil.shaft_capacity100, 0)
  
  const lastLayer = soilsData.find(soil => soil.start_depth <= profileData.effective_pile_length && profileData.effective_pile_length <= soil.end_depth) || soilsData[soilsData.length - 1]
  
  const rbIndex = soilsData.findIndex(soil => soil.id === lastLayer.id)
  
  const bearingCapacity = baseParams.pile_diameter === "60" ? lastLayer.bearing_capacity60 : lastLayer.bearing_capacity100
  
  const ultimateBearingCapacity = ultimatePulloutCapacity + bearingCapacity
  
  let effectivePileLength = profileData.effective_pile_length
  if (effectivePileLength > lastLayer.end_depth) {effectivePileLength = lastLayer.end_depth}
  
  const totalTensionLoad = dynamicParams.design_method === "method_bs" ? dynamicParams.applied_tension_load : dynamicParams.permanent_tension_load + dynamicParams.variable_tension_load
  const totalCompressionLoad = dynamicParams.design_method === "method_bs" ? dynamicParams.applied_compression_load : dynamicParams.permanent_compression_load + dynamicParams.variable_compression_load
  
  const calculateRowHeight = () => {
    let height = 40
    
    if (baseParams.show_description) height += 25.5
    if (baseParams.show_spt) height += 25.5
    if (baseParams.show_moist) height += 25.5
    if (baseParams.show_sat) height += 25.5
    if (baseParams.show_shear_strength) height += 25.5
    
    return Math.max(60, height)
  }

  const pileHeight = (() => {
    let height = 0

    soilsData.forEach((soil, index) => {
      const rowHeight = calculateRowHeight()
      if (soil.id === lastLayer.id) {
        if (lastLayer.end_depth <= profileData.effective_pile_length) {
          height = (index + 1) * rowHeight
        } else {
          const portionOfLayer =
            (profileData.effective_pile_length - soil.start_depth) /
            (soil.end_depth - soil.start_depth)
          height = (index * rowHeight) + (portionOfLayer * rowHeight)
        }
      }
    })

    return height
  })()

  const secondPileHeight = soilsData.reduce((height, soil, index) => {
    if (soil.id === lastLayer.id) {
      if (lastLayer.end_depth <= profileData.effective_pile_length) {
        return (index + 1) * 89.75
      } else {
        const portionOfLayer = (profileData.effective_pile_length - soil.start_depth) / (soil.end_depth - soil.start_depth)
        return (index * 89.75) + (portionOfLayer * 89.75)
      }
    }
    return height
  }, 0)

  const renderBSDesign = () => {
    if (dynamicParams.design_method !== 'method_bs') return null
    
    const { tension, compression, applied_compression_load, applied_tension_load, global_safety_factor } = dynamicParams
    
    const designedTension = tension / global_safety_factor
    const tensionPass = designedTension >= applied_tension_load

    const designedCompression = compression / global_safety_factor
    const compressionPass = designedCompression >= applied_compression_load
    
    return (
      <div className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-lg border break-inside-avoid">
          <h3 className="text-lg font-semibold mb-2">Tension Check</h3>
          
          <div className="bg-white p-4 rounded-md border">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <p>Designed Load:</p>
                <p className="font-mono">{applied_tension_load} kN</p>
              </div>

              <div className="flex items-center justify-between">
                <p>Designed Resistance:</p>
                <p className="font-mono">{roundToTwoDecimals(designedTension)} kN</p>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <img src="bs-equation.png" alt="loading equation" className="h-10 mx-auto mb-1"/>
                <p className="font-mono text-xs text-center">{applied_tension_load} ≤ ({tension} / {global_safety_factor})</p>
              </div>

              <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm">
                <p>Utilisation Rate:</p>
                <p>{roundToOneDecimal((applied_tension_load / designedTension) * 100)}%</p>
              </div>
            </div>

            <div className={`mt-2 text-center py-2 rounded-md font-semibold ${tensionPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {tensionPass ? 'PASS' : 'FAIL'}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border break-inside-avoid">
          <h3 className="text-lg font-semibold mb-2">Compression Check</h3>
          
          <div className="bg-white p-4 rounded-md border">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <p>Designed Load:</p>
                <p className="font-mono">{applied_compression_load} kN</p>
              </div>

              <div className="flex items-center justify-between">
                <p>Designed Resistance:</p>
                <p className="font-mono">{roundToTwoDecimals(designedCompression)} kN</p>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <img src="bs-equation.png" alt="loading equation" className="h-10 mx-auto mb-1"/>
                <p className="font-mono text-xs text-center">{applied_compression_load} ≤ ({compression} / {global_safety_factor})</p>
              </div>

              <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm mb-2">
                <p>Utilisation Rate:</p>
                <p>{roundToOneDecimal((applied_compression_load / designedCompression) * 100)}%</p>
              </div>
            </div>

            <div className={`mt-2 text-center py-2 rounded-md font-semibold ${compressionPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {compressionPass ? 'PASS' : 'FAIL'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderENOrTestDesign = () => {
    if (dynamicParams.design_method === 'method_bs') return null

    const { permanent_tension_load, variable_tension_load, permanent_compression_load, variable_compression_load, tension, compression } = dynamicParams

    if (dynamicParams.country === 'uk') {
      const compressionCombination1 = (dynamicParams.uk_safety_factor_compression_yg1 * dynamicParams.permanent_compression_load) + (dynamicParams.uk_safety_factor_compression_yq1 * dynamicParams.variable_compression_load)
      const compressionCombination2 = (dynamicParams.uk_safety_factor_compression_yg2 * dynamicParams.permanent_compression_load) + (dynamicParams.uk_safety_factor_compression_yq2 * dynamicParams.variable_compression_load)
      
      const designedCompression1 = compression / dynamicParams.uk_safety_factor_compression_yt1
      const designedCompression2 = compression / dynamicParams.uk_safety_factor_compression_yt2
      
      const compressionPass1 = designedCompression1 >= compressionCombination1
      const compressionPass2 = designedCompression2 >= compressionCombination2

      // Tension values
      const tensionCombination1 = (dynamicParams.uk_safety_factor_tension_yg2 * dynamicParams.permanent_tension_load) + (dynamicParams.uk_safety_factor_tension_yq2 * dynamicParams.variable_tension_load)
      const tensionCombination2 = (dynamicParams.uk_safety_factor_tension_yg1 * dynamicParams.permanent_tension_load) + (dynamicParams.uk_safety_factor_tension_yq1 * dynamicParams.variable_tension_load)
      
      const designedTension1 = tension / dynamicParams.uk_safety_factor_tension_yt1
      const designedTension2 = tension / dynamicParams.uk_safety_factor_tension_yt2

      const tensionPass1 = designedTension1 >= tensionCombination1
      const tensionPass2 = designedTension2 >= tensionCombination2
      return (
        <div className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg border break-inside-avoid">
            <h3 className="text-lg font-semibold mb-2">Tension Check</h3>
            <div className="grid grid-cols-2 gap-6">
              
              {/* Combination 1 */}
              <div className="bg-white p-4 rounded-md border flex flex-col shadow-lg">
                <h4 className="mb-2 font-semibold">Combination 1</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p>Designed Load:</p>
                    <p className="font-mono">{roundToTwoDecimals(tensionCombination1)} kN</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p>Designed Resistance:</p>
                    <p className="font-mono">{roundToTwoDecimals(designedTension1)} kN</p>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <img src="equation-image.png" alt="loading equation" className="h-10 mx-auto mb-1"/>
                    <p className="font-mono text-xs text-center">{`(${dynamicParams.uk_safety_factor_tension_yg1} × ${permanent_tension_load}) + (${dynamicParams.uk_safety_factor_tension_yq1} × ${variable_tension_load}) ≤ (${tension} / ${dynamicParams.uk_safety_factor_tension_yt1})`}</p>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm mb-2">
                    <p>Utilisation Rate:</p>
                    <p>{roundToOneDecimal((tensionCombination1 / designedTension1) * 100)}%</p>
                  </div>
                </div>

                <div className={`mt-auto text-center py-2 rounded-md font-semibold ${tensionPass1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {tensionPass1 ? 'PASS' : 'FAIL'}
                </div>
              </div>

              {/* Combination 2 */}
              <div className="bg-white p-4 rounded-md border flex flex-col shadow-lg">
                <h4 className="mb-2 font-semibold">Combination 2</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p>Designed Load:</p>
                    <p className="font-mono">{roundToTwoDecimals(tensionCombination2)} kN</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p>Designed Resistance:</p>
                    <p className="font-mono">{roundToTwoDecimals(designedTension2)} kN</p>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <img src="equation-image.png" alt="loading equation" className="h-10 mx-auto mb-1"/>
                    <p className="font-mono text-xs text-center">{`(${dynamicParams.uk_safety_factor_tension_yg2} × ${permanent_tension_load}) + (${dynamicParams.uk_safety_factor_tension_yq2} × ${variable_tension_load}) ≤ (${tension} / ${dynamicParams.uk_safety_factor_tension_yt2})`}</p>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm mb-2">
                    <p>Utilisation Rate:</p>
                    <p>{roundToOneDecimal((tensionCombination2 / designedTension2) * 100)}%</p>
                  </div>
                </div>

                <div className={`mt-auto text-center py-2 rounded-md font-semibold ${tensionPass2 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {tensionPass2 ? 'PASS' : 'FAIL'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border break-inside-avoid">
            <h3 className="text-lg font-semibold mb-2">Compression Check</h3>
            <div className="grid grid-cols-2 gap-6">
              
              {/* Combination 1 */}
              <div className="bg-white p-4 rounded-md border flex flex-col shadow-lg">
                <h4 className="mb-2 font-semibold">Combination 1</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p>Designed Load:</p>
                    <p className="font-mono">{roundToTwoDecimals(compressionCombination1)} kN</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p>Designed Resistance:</p>
                    <p className="font-mono">{roundToTwoDecimals(designedCompression1)} kN</p>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <img src="equation-image.png" alt="loading equation" className="h-10 mx-auto mb-1"/>
                    <p className="font-mono text-xs text-center">{`(${dynamicParams.uk_safety_factor_compression_yg1} × ${permanent_compression_load}) + (${dynamicParams.uk_safety_factor_compression_yq1} × ${variable_compression_load}) ≤ (${compression} / ${dynamicParams.uk_safety_factor_compression_yt1})`}</p>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm mb-2">
                    <p>Utilisation Rate:</p>
                    <p>{roundToOneDecimal((compressionCombination1 / designedCompression1) * 100)}%</p>
                  </div>
                </div>

                <div className={`mt-auto text-center py-2 rounded-md font-semibold ${compressionPass1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {compressionPass1 ? 'PASS' : 'FAIL'}
                </div>
              </div>

              {/* Combination 2 */}
              <div className="bg-white p-4 rounded-md border flex flex-col shadow-lg">
                <h4 className="mb-2 font-semibold">Combination 2</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p>Designed Load:</p>
                    <p className="font-mono">{roundToTwoDecimals(compressionCombination2)} kN</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p>Designed Resistance:</p>
                    <p className="font-mono">{roundToTwoDecimals(designedCompression2)} kN</p>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <img src="equation-image.png" alt="loading equation" className="h-10 mx-auto mb-1"/>
                    <p className="font-mono text-xs text-center">{`(${dynamicParams.uk_safety_factor_compression_yg2} × ${permanent_compression_load}) + (${dynamicParams.uk_safety_factor_compression_yq2} × ${variable_compression_load}) ≤ (${compression} / ${dynamicParams.uk_safety_factor_compression_yt2})`}</p>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm mb-2">
                    <p>Utilisation Rate:</p>
                    <p>{roundToOneDecimal((compressionCombination2 / designedCompression2) * 100)}%</p>
                  </div>
                </div>

                <div className={`mt-auto text-center py-2 rounded-md font-semibold ${compressionPass2 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {compressionPass2 ? 'PASS' : 'FAIL'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    else if (dynamicParams.country === 'nl') {
      const tensionCombination = (dynamicParams.nl_safety_factor_tension_yg * dynamicParams.permanent_tension_load) + (dynamicParams.nl_safety_factor_tension_yq * dynamicParams.variable_tension_load)
      const designedTension = tension / dynamicParams.nl_safety_factor_tension_yt
      const tensionPass = designedTension >= tensionCombination

      const compressionCombination = (dynamicParams.nl_safety_factor_compression_yg * dynamicParams.permanent_compression_load) + (dynamicParams.nl_safety_factor_compression_yq * dynamicParams.variable_compression_load)
      const designedCompression = compression / dynamicParams.nl_safety_factor_compression_yt
      const compressionPass = designedCompression >= compressionCombination

      return (
        <div className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg border break-inside-avoid">
            <h3 className="text-lg font-semibold mb-2">Tension Check</h3>
            
            <div className="bg-white p-4 rounded-md border shadow-lg">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <p>Designed Load:</p>
                  <p className="font-mono">{roundToTwoDecimals(tensionCombination)} kN</p>
                </div>

                <div className="flex items-center justify-between">
                  <p>Designed Resistance:</p>
                  <p className="font-mono">{roundToTwoDecimals(designedTension)} kN</p>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <img src="equation-image.png" alt="loading equation" className="h-10 mx-auto mb-1"/>
                  <p className="font-mono text-xs text-center">{`(${dynamicParams.nl_safety_factor_tension_yg} × ${permanent_tension_load}) + (${dynamicParams.nl_safety_factor_tension_yq} × ${variable_tension_load}) ≤ (${tension} / ${dynamicParams.nl_safety_factor_tension_yt})`}</p>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm">
                  <p>Utilisation Rate:</p>
                  <p>{roundToOneDecimal((tensionCombination / designedTension) * 100)}%</p>
                </div>
              </div>

              <div className={`mt-2 text-center py-2 rounded-md font-semibold ${tensionPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {tensionPass ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border break-inside-avoid">
            <h3 className="text-lg font-semibold mb-2">Compression Check</h3>
            
            <div className="bg-white p-4 rounded-md border shadow-lg">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <p>Designed Load:</p>
                  <p className="font-mono">{roundToTwoDecimals(compressionCombination)} kN</p>
                </div>

                <div className="flex items-center justify-between">
                  <p>Designed Resistance:</p>
                  <p className="font-mono">{roundToTwoDecimals(designedCompression)} kN</p>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <img src="equation-image.png" alt="loading equation" className="h-10 mx-auto mb-1"/>
                  <p className="font-mono text-xs text-center">{`(${dynamicParams.nl_safety_factor_compression_yg} × ${permanent_compression_load}) + (${dynamicParams.nl_safety_factor_compression_yq} × ${variable_compression_load}) ≤ (${compression} / ${dynamicParams.nl_safety_factor_compression_yt})`}</p>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm mb-2">
                  <p>Utilisation Rate:</p>
                  <p>{roundToOneDecimal((compressionCombination / designedCompression) * 100)}%</p>
                </div>
              </div>

              <div className={`mt-2 text-center py-2 rounded-md font-semibold ${compressionPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {compressionPass ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>
        </div>
      )
    }

    else {
      const tensionCombination = (dynamicParams.pl_safety_factor_tension_yg * dynamicParams.permanent_tension_load) + (dynamicParams.pl_safety_factor_tension_yq * dynamicParams.variable_tension_load)
      const designedTension = tension / dynamicParams.pl_safety_factor_tension_yt
      const tensionPass = designedTension >= tensionCombination

      const compressionCombination = (dynamicParams.pl_safety_factor_compression_yg * dynamicParams.permanent_compression_load) + (dynamicParams.pl_safety_factor_compression_yq * dynamicParams.variable_compression_load)
      const designedCompression = compression / dynamicParams.pl_safety_factor_compression_yt
      const compressionPass = designedCompression >= compressionCombination
      return (
        <div className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg border break-inside-avoid">
            <h3 className="text-lg font-semibold mb-2">Tension Check</h3>

            <div className="bg-white p-4 rounded-md border shadow-lg">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <p>Designed Load:</p>
                  <p className="font-mono">{roundToTwoDecimals(tensionCombination)} kN</p>
                </div>

                <div className="flex items-center justify-between">
                  <p>Designed Resistance:</p>
                  <p className="font-mono">{roundToTwoDecimals(designedTension)} kN</p>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <img src="equation-image.png" alt="loading equation" className="h-10 mx-auto mb-1"/>
                  <p className="font-mono text-xs text-center">{`(${dynamicParams.pl_safety_factor_tension_yg} × ${permanent_tension_load}) + (${dynamicParams.pl_safety_factor_tension_yq} × ${variable_tension_load}) ≤ (${tension} / ${dynamicParams.pl_safety_factor_tension_yt})`}</p>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm">
                  <p>Utilisation Rate:</p>
                  <p>{roundToOneDecimal((tensionCombination / designedTension) * 100)}%</p>
                </div>
              </div>

              <div className={`mt-2 text-center py-2 rounded-md font-semibold ${tensionPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {tensionPass ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border break-inside-avoid">
            <h3 className="text-lg font-semibold mb-2">Compression Check</h3>

            <div className="bg-white p-4 rounded-md border shadow-lg">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <p>Designed Load:</p>
                  <p className="font-mono">{roundToTwoDecimals(compressionCombination)} kN</p>
                </div>

                <div className="flex items-center justify-between">
                  <p>Designed Resistance:</p>
                  <p className="font-mono">{roundToTwoDecimals(designedCompression)} kN</p>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <img src="equation-image.png" alt="loading equation" className="h-10 mx-auto mb-1"/>
                  <p className="font-mono text-xs text-center">{`(${dynamicParams.pl_safety_factor_compression_yg} × ${permanent_compression_load}) + (${dynamicParams.pl_safety_factor_compression_yq} × ${variable_compression_load}) ≤ (${compression} / ${dynamicParams.pl_safety_factor_compression_yt})`}</p>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm mb-2">
                  <p>Utilisation Rate:</p>
                  <p>{roundToOneDecimal((compressionCombination / designedCompression) * 100)}%</p>
                </div>
              </div>

              <div className={`mt-2 text-center py-2 rounded-md font-semibold ${compressionPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {compressionPass ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  const renderPileStructuralCheck = () => {
    const horizontalLoad = roundToTwoDecimals(pileStructure.horizontal_load * pileStructure.horizontal_load_safety_factor)

    const FtRd = roundToTwoDecimals(pileStructure.k2 * pileStructure.ultimate_tensile_strength_a480 * pileStructure.nominal_stress_area / (pileStructure.partial_safety_factor_2 * 1000))
    const FvRd = roundToTwoDecimals(0.6 * pileStructure.ultimate_tensile_strength_a480 * pileStructure.nominal_stress_area / (pileStructure.partial_safety_factor_2 * 1000))
    const designedShearAndTension = roundToTwoDecimals((horizontalLoad / FvRd) + (totalTensionLoad / (1.4 * FtRd)))

    const FtvRd = roundToTwoDecimals(Math.PI * pileStructure.pitch_diameter * pileStructure.thread_engagement_length / 2 * 0.65 * pileStructure.ultimate_tensile_strength_lm25m / (pileStructure.partial_safety_factor_2 * 1000))
    
    const NoRd = roundToTwoDecimals(pileStructure.pile_gross_area * pileStructure.proof_strength / (pileStructure.partial_safety_factor_1 * 1000))
    const Anet = Math.round(baseParams.pile_diameter === "60" ? pileStructure.pile_gross_area - (3.14 * (12 ** 2) / 4) : pileStructure.pile_gross_area - (3.14 * (20 ** 2) / 4))
    const NuRd = roundToTwoDecimals(0.9 * Anet * pileStructure.ultimate_tensile_strength_lm25m / (pileStructure.partial_safety_factor_2 * 1000))
    const NtRd = Math.min(NoRd, NuRd)
    const isCalc1Selected = NoRd <= NuRd

    const NcRd = roundToTwoDecimals(pileStructure.pile_gross_area * pileStructure.proof_strength / (pileStructure.partial_safety_factor_1 * 1000))

    const NcR =roundToTwoDecimals((Math.PI ** 2 * pileStructure.e * pileStructure.i) / (Math.pow(pileStructure.k * pileStructure.l, 2)) / 1000)
    return (
      <div className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-lg border break-inside-avoid">
          <h3 className="text-lg font-semibold mb-2">Resistance at joints (Eurocode 3)</h3>
          <div className="grid grid-cols-2 gap-6">
            
            {/* Check 1: M20 A4-80 bolt tension resistance */}
            <div className="bg-white p-4 rounded-md border flex flex-col shadow-lg">
              <h4 className="font-semibold mb-2">{baseParams.pile_diameter === "60" ? "M12" : "M20"} A4-80 bolt tension resistance</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <p>Designed Load:</p>
                  <p className="font-mono">{roundToTwoDecimals(totalTensionLoad)} kN</p>
                </div>

                <div className="flex items-center justify-between">
                  <p>Designed Resistance:</p>
                  <p className="font-mono">{FtRd} kN</p>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="font-mono text-sm text-center mb-1">F<sub>t,</sub>E<sub>d</sub> ≤ F<sub>t,</sub>R<sub>d</sub></p>
                  <p className="font-mono text-xs text-center">{`${roundToTwoDecimals(totalTensionLoad)} ≤ (${pileStructure.k2} × ${pileStructure.ultimate_tensile_strength_a480} × ${pileStructure.nominal_stress_area} / ${pileStructure.partial_safety_factor_2})`}</p>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm mb-2">
                  <p>Utilisation Rate:</p>
                  <p className="font-mono">{roundToOneDecimal((totalTensionLoad / FtRd) * 100)}%</p>
                </div>
              </div>

              <div className={`mt-auto text-center py-2 rounded-md font-semibold ${totalTensionLoad <= FtRd ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {totalTensionLoad <= FtRd ? 'PASS' : 'FAIL'}
              </div>  
            </div>

            {/* Shear resistance per bolt */}
            <div className="bg-white p-4 rounded-md border flex flex-col shadow-lg">
              <h4 className="font-semibold mb-2">Shear resistance per bolt</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <p>Designed Load:</p>
                  <p className="font-mono">{horizontalLoad} kN</p>
                </div>

                <div className="flex items-center justify-between">
                  <p>Designed Resistance:</p>
                  <p className="font-mono">{FvRd} kN</p>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="font-mono text-sm text-center mb-1">F<sub>v,</sub>E<sub>d</sub>γ ≤ F<sub>v,</sub>R<sub>d</sub></p>
                  <p className="font-mono text-xs text-center">{`${pileStructure.horizontal_load} × ${pileStructure.horizontal_load_safety_factor} ≤ (0.6 × ${pileStructure.ultimate_tensile_strength_a480} × ${pileStructure.nominal_stress_area} / ${pileStructure.partial_safety_factor_2})`}</p>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm mb-2">
                  <p>Utilisation Rate:</p>
                  <p className="font-mono">{roundToOneDecimal((horizontalLoad / FvRd) * 100)}%</p>
                </div>
              </div>

              <div className={`mt-auto text-center py-2 rounded-md font-semibold ${horizontalLoad < FvRd ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {horizontalLoad <= FvRd ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>

          {/* Combined Shear and Tension */}
          <div className="bg-white p-4 rounded-md border mt-6 shadow-lg">
            <h4 className="font-semibold mb-2">Combined Shear and Tension</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <p>Designed Load:</p>
                <p className="font-mono">N/A</p>
              </div>

              <div className="flex items-center justify-between">
                <p>Designed Resistance:</p>
                <p className="font-mono">N/A</p>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="font-mono text-sm text-center mb-1">F<sub>v,</sub>E<sub>d</sub>γ ≤ F<sub>v,</sub>R<sub>d</sub> + F<sub>t,</sub>E<sub>d</sub> / 1.4F<sub>t,</sub>R<sub>d</sub></p>
                <p className="font-mono text-xs text-center">{`(${pileStructure.horizontal_load} × ${pileStructure.horizontal_load_safety_factor} / ${FvRd}) + [${roundToTwoDecimals(totalTensionLoad)} / (1.4 × ${FtRd})]`}</p>
              </div>

              <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm mb-2">
                <p>Utilisation Rate:</p>
                <p className="font-mono">{roundToOneDecimal((designedShearAndTension / 1.0) * 100)}%</p>
              </div>
            </div>

            <div className={`mt-auto text-center py-2 rounded-md font-semibold ${designedShearAndTension < 1.0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {designedShearAndTension < 1.0 ? 'PASS' : 'FAIL'}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border break-inside-avoid">
          <h3 className="text-lg font-semibold mb-2">Inner thread failure inside Heli Pile</h3>
          
          <div className="bg-white p-4 rounded-md border shadow-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Resistance of the inner thread</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <p>Designed Load:</p>
                <p className="font-mono">{roundToTwoDecimals(totalTensionLoad)} kN</p>
              </div>

              <div className="flex items-center justify-between">
                <p>Designed Resistance:</p>
                <p className="font-mono">{FtvRd} kN</p>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="font-mono text-sm text-center mb-1">F<sub>tv,</sub>E<sub>d</sub> ≤ F<sub>tv,</sub>R<sub>d</sub></p>
                <p className="font-mono text-xs text-center">
                  {`${roundToTwoDecimals(totalTensionLoad)} ≤ (3.14 × ${pileStructure.pitch_diameter} × ${pileStructure.thread_engagement_length} / 2) × (0.65 × ${pileStructure.ultimate_tensile_strength_lm25m} / ${pileStructure.partial_safety_factor_2})`}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm mb-2">
                <p>Utilisation Rate:</p>
                <p className="font-mono">{roundToOneDecimal((totalTensionLoad / FtvRd) * 100)}%</p>
              </div>
            </div>

            <div className={`text-center py-2 rounded-md font-semibold ${totalTensionLoad <= FtvRd ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {totalTensionLoad <= FtvRd ? 'PASS' : 'FAIL'}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border break-inside-avoid">
          <h3 className="text-lg font-semibold mb-2">Resistance along the pile (Eurocode 9)</h3>
          <div className="grid grid-cols-2 gap-6">
            
            {/* Tensile resistance of the pile */}
            <div className="bg-white p-4 rounded-md border flex flex-col shadow-lg">
              <h4 className="font-semibold mb-2">Tensile resistance of the pile</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <p>Designed Load:</p>
                  <p className="font-mono">{roundToTwoDecimals(totalTensionLoad)} kN</p>
                </div>

                <div className="flex items-center justify-between">
                  <p>Designed Resistance:</p>
                  <p className="font-mono">{NtRd} kN</p>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="font-mono text-sm text-center mb-1">N<sub>t,</sub>E<sub>d</sub> ≤ N<sub>t,</sub>R<sub>d</sub></p>
                  <p className="font-mono text-xs text-center">{`${(totalTensionLoad)} ≤ ${isCalc1Selected ? `(${pileStructure.pile_gross_area} × ${pileStructure.proof_strength} / ${pileStructure.partial_safety_factor_1})` : `(0.9 × ${Anet} × ${pileStructure.ultimate_tensile_strength_lm25m} / ${pileStructure.partial_safety_factor_2})`}`}</p>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm mb-2">
                  <p>Utilisation Rate:</p>
                  <p className="font-mono">{roundToOneDecimal((totalTensionLoad / NtRd) * 100)}%</p>
                </div>
              </div>

              <div className={`mt-auto text-center py-2 rounded-md font-semibold ${totalTensionLoad <= NtRd ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {totalTensionLoad <= NtRd ? 'PASS' : 'FAIL'}
              </div>
            </div>

            {/* Compressive resistance of the pile */}
            <div className="bg-white p-4 rounded-md border flex flex-col shadow-lg">
              <h4 className="font-semibold mb-2">Compressive resistance of the pile</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <p>Designed Load:</p>
                  <p className="font-mono">{roundToTwoDecimals(totalCompressionLoad)} kN</p>
                </div>

                <div className="flex items-center justify-between">
                  <p>Designed Resistance:</p>
                  <p className="font-mono">{NcRd} kN</p>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="font-mono text-sm text-center mb-1">N<sub>c,</sub>E<sub>d</sub> ≤ N<sub>c,</sub>R<sub>d</sub></p>
                  <p className="font-mono text-xs text-center">{`${roundToTwoDecimals(totalCompressionLoad)} ≤ (${pileStructure.pile_gross_area} × ${pileStructure.proof_strength} / ${pileStructure.partial_safety_factor_1})`}</p>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm mb-2">
                  <p>Utilisation Rate:</p>
                  <p className="font-mono">{roundToOneDecimal((totalCompressionLoad / NcRd) * 100)}%</p>
                </div>
              </div>

              <div className={`mt-auto text-center py-2 rounded-md font-semibold ${totalCompressionLoad <= NcRd ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {totalCompressionLoad <= NcRd ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>

          {/*Critical Buckling Force of the pile */}
          <div className="bg-white p-4 rounded-md border mt-6 shadow-lg">
            <h4 className="font-semibold mb-2">Critical buckling force of the pile</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <p>Designed Load:</p>
                <p className="font-mono">{roundToTwoDecimals(totalCompressionLoad)} kN</p>
              </div>

              <div className="flex items-center justify-between">
                <p>Designed Resistance:</p>
                <p className="font-mono">{roundToTwoDecimals(NcR)} kN</p>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="font-mono text-sm text-center mb-1">N<sub>c,</sub>E<sub>d</sub> ≤ N<sub>c,</sub>R</p>
                <p className="font-mono text-xs text-center">{roundToTwoDecimals(totalCompressionLoad)} ≤ (3.14<sup>2</sup> × {pileStructure.e} × {pileStructure.i} / ({pileStructure.k} × {pileStructure.l})<sup>2</sup>)</p>
              </div>

              <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-sm mb-2">
                <p>Utilisation Rate:</p>
                <p className="font-mono">{roundToOneDecimal((totalCompressionLoad / NcR) * 100)}%</p>
              </div>

              <div className={`mt-auto text-center py-2 rounded-md font-semibold ${totalCompressionLoad <= NcR ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {totalCompressionLoad <= NcR ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${arimo.className} ${spaceMono.variable} `}>
      {/* --- PAGE 1: Title Page --- */}
      <div className="flex flex-col justify-between h-screen">
        <div className="flex justify-center mr-5 mt-7">
          <img src="/logo.png" alt="Helical Pile Logo" className="h-15"/>
        </div>

        <div className="flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Helical Pile Computations</h1>
          <h2 className="text-2xl mt-3">Design Report</h2>
        </div>

        <div className="flex justify-end mr-20 mb-30">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 text-left text-sm">
            {baseParams.pile_number && (
              <>
                <p className="font-semibold">Pile Number:</p>
                <p>{baseParams.pile_number}</p>
              </>
            )}
            
            {baseParams.job_number && (
              <>
                <p className="font-semibold">Job Number:</p>
                <p>{baseParams.job_number}</p>
              </>
            )}

            {baseParams.job_location && (
              <>
                <p className="font-semibold">Job Location:</p>
                <p>{baseParams.job_location}</p>
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

      {/* --- PAGE 2: Soil Profile Configuration --- */}
      <div>
        <h2 className={`text-2xl font-semibold tracking-tight ${profileData.profile_name || baseParams.soil_notes ? '' : 'ml-13'}`}>Soil Profile Configuration</h2>
        
        <ul className="text-sm space-y-1 mt-2 list-disc list-inside">
          {profileData.profile_name && (
            <li><span className="font-semibold">Soil Profile:</span> {profileData.profile_name}</li>
          )}

          {baseParams.soil_notes && (
            <li><span className="font-semibold">Description:</span> {baseParams.soil_notes}</li>
          )}
        </ul>

        <div className={`scale-85 origin-top ${profileData.profile_name || baseParams.soil_notes ? 'mt-6' : 'mt-2'}`}>
          <div className="p-2 bg-sky-50 dark:bg-sky-900/50 border"> 
            <div className="text-sm justify-between flex">
              <p><span className="font-semibold">Pile Diameter:</span> {baseParams.pile_diameter} mm</p>
              <p><span className="font-semibold">Effective Pile Length:</span> {effectivePileLength} m</p>
            </div>
          </div>
          
          <div className="relative border-x border-b">
            {soilsData.map((soil, index) => {
              const isDefaultColour = soil.colour === "#000000"
              const isDark = getLuminance(soil.colour) < 0.5
              const textColor = isDark ? "text-white" : "text-black"
              
              const rowHeight = calculateRowHeight()
              return (
                <div key={soil.id} className={` break-inside-avoid relative p-2 grid grid-cols-[190px_50px_1fr] whitespace-nowrap ${isDefaultColour && index < soilsData.length - 1 ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-[oklch(0.87_0.01_258)] dark:after:bg-[oklch(1_0_0/25%)]' : ''}`} style={{ backgroundColor: isDefaultColour ? "" : soil.colour, minHeight: `${rowHeight}px`}}>

                  <div className={`mt-auto text-xs ${isDefaultColour ? 'text-foreground' : textColor}`}><span className="font-semibold">Depth:</span> {soil.start_depth} – {soil.end_depth} m</div>
                  
                  <div></div>
                    
                  <div className={`space-y-2 text-sm leading-tight @container ${isDefaultColour ? 'text-foreground' : textColor}`}>
                    <p className="font-semibold uppercase">{soil.soil_name || soil.soil}</p>
                    {baseParams.show_description && <p className="overflow-hidden whitespace-nowrap">Description: {soil.description || "N/A"}</p>}
                    {baseParams.show_spt && <p>{soil.test_type === "spt" ? (<>SPT N-Value: {soil.n_value}</>) : ( <>CPT Values: q<sub>c</sub> = {soil.qc} kPa, α = {soil.a} {soil.id === lastLayer.id && (<>{" || "}q<sub>ca</sub> = {soil.qca} kPa, k<sub>c</sub> = {soil.kc}</>)}</> )}</p>}
                    {baseParams.show_moist && <p>Moist Weight: {soil.y_moist} kN/m³</p>}
                    {baseParams.show_sat && <p>Saturated Weight: {soil.y_sat} kN/m³</p>}
                    {baseParams.show_shear_strength && <p>{soil.soil_type === 'fine' ? 'Undrained Shear Strength:' : 'Shear Strength:'} {soil.soil_type === 'fine' ? soil.su : soil.t} kPa</p>}
                  </div>

                  <div className={`absolute right-2 top-2 text-xs px-2 py-0.5 rounded-sm border font-semibold ${isDefaultColour ? 'border-foreground' : isDark ? 'border-white text-white' : 'border-black text-black'}`}>Layer  {index + 1}</div>

                  {soil.start_depth < profileData.water_depth && profileData.water_depth <= soil.end_depth && (
                    <div className={`absolute left-0 right-0 z-10 border-b-2 border-dashed ${isDefaultColour ? 'border-blue-400 dark:border-blue-800' :  isDark ? 'border-blue-400' : 'border-blue-800'}`} style={{ top: `${Math.max(33, Math.min(100, ((profileData.water_depth - soil.start_depth) / (soil.end_depth - soil.start_depth)) * 100))}%`}}>
                      <div className={`absolute bottom-0.5 right-2 flex flex-row text-xs gap-2 ${isDefaultColour ? 'text-foreground' : textColor}`}>
                        <Triangle className={`text-muted-foreground rotate-180 size-4 ${isDefaultColour ? 'fill-blue-400 dark:fill-blue-800' : isDark ? 'fill-blue-400' : 'fill-blue-800'}`}/><span className="-ml-1 -mr-1">Water Table:</span>{profileData.water_depth} m
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <div className={`absolute z-20 -top-6.25 left-55 transform -translate-x-1/2 ${baseParams.pile_diameter === "60" ? 'w-7.5 bg-size-[30px] bg-[url(/60mm-pile.png)]' : 'w-10 bg-size-[40px] bg-[url(/100mm-pile.png)]'}`} style={{height: `${pileHeight + 25}px`}}/>
          </div>
        </div>
      </div>

      {/* --- PAGE 3: Pile Capacities --- */}
      <div className="break-before-page">
        <h2 className={`text-2xl font-semibold tracking-tight ${profileData.profile_name || baseParams.soil_notes ? '' : 'ml-13'}`}>Helical Pile Capacity</h2>
        
        <ul className="text-sm space-y-1 mt-2 list-disc list-inside">
          {profileData.profile_name && (
            <li><span className="font-semibold">Soil Profile:</span> {profileData.profile_name}</li>
          )}

          {baseParams.soil_notes && (
            <li><span className="font-semibold">Description:</span> {baseParams.soil_notes}</li>
          )}
        </ul>

        <div className={`scale-85 origin-top ${profileData.profile_name || baseParams.soil_notes ? 'mt-6' : 'mt-2'}`}>
          <div className="p-2 bg-sky-50 dark:bg-sky-900/50 border-t border-x relative"> 
            <div className="flex justify-between">
              
              <div className="flex flex-col text-sm">
                <p><span className="font-semibold">Pile Diameter <span className="italic">D</span>: </span> {baseParams.pile_diameter} mm</p>
                <p><span className="font-semibold">External Tension Load:</span> {totalTensionLoad.toFixed(2)} kN</p>
                <p><span className="font-semibold">External Compression Load:</span> {totalCompressionLoad.toFixed(2)} kN</p>
              </div>
            
              <div className="text-right text-sm">
                <p><span className="font-semibold">Effective Pile Length: </span> {effectivePileLength} m</p>
                <p><span className="font-semibold">Ultimate Pullout Capacity <span className="italic">∑R<sub>s</sub></span> = </span> {ultimatePulloutCapacity.toFixed(2)} kN</p>
                <p ><span className="font-semibold">Ultimate Bearing Capacity <span className="italic">∑R<sub>s</sub> + R<sub>b</sub></span> = </span> {ultimateBearingCapacity.toFixed(2)} kN</p>
              </div>

              <div className="size-11.25 bg-[url('/up-down-arrow.png')] bg-contain bg-center bg-no-repeat absolute top-1 transform -translate-x-1/2 left-76.25"/>
              <div className="absolute top-4 left-80 text-sm font-semibold"> {(totalTensionLoad + totalCompressionLoad).toFixed(2)} kN </div>

            </div>
          </div>
          
          <div className="relative border">
            {soilsData.map((soil, index) => {
              const isDefaultColour = soil.colour === "#000000"
              const isDark = getLuminance(soil.colour) < 0.5
              const textColor = isDark ? "text-white" : "text-black"
              
              let soilHeight = roundToOneDecimal(soil.end_depth - soil.start_depth)
              if (effectivePileLength < soil.end_depth) {soilHeight = roundToOneDecimal(effectivePileLength - soil.start_depth)}
            
              const isLayerBeyondPile = soil.start_depth >= profileData.effective_pile_length

              return (
                <div key={soil.id} className={`h-[89.75px] break-inside-avoid relative p-2 grid grid-cols-[275_50px_1fr] whitespace-nowrap ${isDefaultColour && index < soilsData.length - 1 ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-[oklch(0.87_0.01_258)] dark:after:bg-[oklch(1_0_0/25%)]' : ''}`} style={{ backgroundColor: isDefaultColour ? "" : soil.colour}}>

                  <div className={`flex flex-col space-y-2 text-sm leading-snug ${isDefaultColour ? 'text-foreground' : textColor}`}>
                    {!isLayerBeyondPile && (
                      <>
                        <p>q<sub>s,{index + 1}</sub> =  <span className="font-mono">{soil.soil_type === 'fine' ? soil.su : soil.t} kPa</span></p>
                        {soil.id === lastLayer.id && (<p>q<sub>b,{rbIndex + 1}</sub> = <span className="font-mono">{soil.qult} kPa</span></p>)}
                        <div className="mt-auto">h<sub>{index + 1}</sub> = <span className="font-mono">{soilHeight} m</span></div>
                      </>
                    )}
                  </div>

                  <div></div>

                  <div className={`pl-4 space-y-2 text-sm leading-snug ${isDefaultColour ? 'text-foreground' : textColor}`}>
                    <p className="font-semibold uppercase">{soil.soil_name || soil.soil}</p>
                    {!isLayerBeyondPile && (
                      <>
                        <p>R<sub>s,{index + 1}</sub> = q<sub>s,{index + 1}</sub> • h<sub>{index + 1}</sub> • πD = <span className="font-mono">{baseParams.pile_diameter === "60" ? soil.shaft_capacity60 : soil.shaft_capacity100} kN</span></p>
                        {soil.id === lastLayer.id && (<p>R<sub>b,{rbIndex + 1}</sub> = q<sub>b,{rbIndex + 1}</sub> • A<sub>base</sub> = <span className="font-mono">{baseParams.pile_diameter === "60" ? soil.bearing_capacity60 : soil.bearing_capacity100} kN</span></p>)}
                      </>
                    )}
                  </div>

                  <div className={`absolute right-2 top-2 text-xs px-2 py-0.5 rounded-sm border font-semibold ${isDefaultColour ? 'border-foreground' : isDark ? 'border-white text-white' : 'border-black text-black'}`}>Layer  {index + 1}</div>
                </div>
              )
            })}

            <div className={`absolute z-20 -top-6.25 left-76.25 transform -translate-x-1/2 ${baseParams.pile_diameter === "60" ? 'w-7.5 bg-size-[30px] bg-[url(/60mm-pile.png)]' : 'w-10 bg-size-[40px] bg-[url(/100mm-pile.png)]'}`} style={{height: `${secondPileHeight + 25}px`}}/>
            
            <div className="absolute z-20 bottom-0 left-68.75 w-15 h-10" style={{ top: `${secondPileHeight}px` }}>
              <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Base line */}
                <line x1="0" y1="70" x2="100" y2="70" stroke="black" strokeWidth="3"/>
                
                {/* Arrow 1 */}
                <line x1="0" y1="70" x2="0" y2="20" stroke="black" strokeWidth="4"/>
                <polygon points="0,15 -7,28 7,28" fill="black"/>
                
                {/* Arrow 2 */}
                <line x1="25" y1="70" x2="25" y2="20" stroke="black" strokeWidth="4"/>
                <polygon points="25,15 18,28 32,28" fill="black"/>
                
                {/* Arrow 3 */}
                <line x1="50" y1="70" x2="50" y2="20" stroke="black" strokeWidth="4"/>
                <polygon points="50,15 43,28 57,28" fill="black"/>
                
                {/* Arrow 4 */}
                <line x1="75" y1="70" x2="75" y2="20" stroke="black" strokeWidth="4"/>
                <polygon points="75,15 68,28 82,28" fill="black"/>
                
                {/* Arrow 5 */}
                <line x1="100" y1="70" x2="100" y2="20" stroke="black" strokeWidth="4"/>
                <polygon points="100,15 93,28 107,28" fill="black"/>
              </svg>
            </div>
            
            <div className="absolute z-20 flex flex-col gap-4 top-0 left-68.75 transform -translate-x-1/2" style={{height: `${secondPileHeight}px`}}>
              {Array.from({ length: Math.ceil(secondPileHeight / 40) }).map((_, i) => (
                <MoveUp key={`left-${i}`} className="size-6"/>
              ))}
            </div>

            <div className={`absolute z-20 flex flex-col gap-4 top-0 left-83.75 transform -translate-x-1/2`} style={{height: `${secondPileHeight}px`}}>
              {Array.from({ length: Math.ceil(secondPileHeight / 40) }).map((_, i) => (
                <MoveUp key={`right-${i}`} className="size-6"/>
              ))}
            </div>
          </div>

        </div>
      </div>
      
      {/* PAGE 3 Part 2: Pile Capacities */}
      <div className="break-before-page">
        <h2 className={`text-2xl font-semibold tracking-tight ${profileData.profile_name || baseParams.soil_notes ? '' : 'ml-13'}`}>Helical Pile Capacity</h2>

        <ul className="text-sm space-y-1 mt-2 list-disc list-inside">
          {profileData.profile_name && (
            <li><span className="font-semibold">Soil Profile:</span> {profileData.profile_name}</li>
          )}

          {baseParams.soil_notes && (
            <li><span className="font-semibold">Description:</span> {baseParams.soil_notes}</li>
          )}
        </ul>
        <div className={`scale-85 origin-top ${profileData.profile_name || baseParams.soil_notes ? 'mt-6' : 'mt-2'}`}>
          <OutputSoilGraph soilsData={soilsData} effectivePileLength={profileData.effective_pile_length} pileDiameter={baseParams.pile_diameter} />
        </div>
      </div>

      {/* PAGE 4: Ultimate Limit State GEO */}
      <div className="break-before-page">
        <h2 className="text-2xl font-semibold tracking-tight">Ultimate Limit State (GEO)</h2>
        
        <ul className="text-sm space-y-1 mt-2 list-disc list-inside">
          {profileData.profile_name && (
            <li><span className="font-semibold">Soil Profile:</span> {profileData.profile_name}</li>
          )}

          {dynamicParams.design_method === "method_bs" ? (
            <li><span className="font-semibold">Design Method:</span> British Standard (BS 8004:2015)</li>
          ) : dynamicParams.design_method === "method_en" ? (
            <li><span className="font-semibold">Design Method:</span> Eurocode (EN 1997-1)</li>
          ) : dynamicParams.design_method === "method_test" ? (
            <li><span className="font-semibold">Design Method:</span> Design by testing</li>
          ) : null}

          {baseParams.design_notes && (
            <li><span className="font-semibold">Notes:</span> {baseParams.design_notes}</li>
          )}
        </ul>

        <div className="scale-85 origin-top ${profileData.profile_name mt-6">
          {dynamicParams.design_method === "method_bs" ? renderBSDesign() : renderENOrTestDesign()}
        </div>
      </div>

      {/* PAGE 5: Ultimate Limit State STR */}
      <div className="break-before-page">
        <h2 className={`text-2xl font-semibold tracking-tight ${profileData.profile_name || baseParams.pile_notes ? '' : 'ml-13'}`}>Ultimate Limit State (STR)</h2>
        
        <ul className="text-sm space-y-1 mt-2 list-disc list-inside">
          {profileData.profile_name && (
            <li><span className="font-semibold">Soil Profile:</span> {profileData.profile_name}</li>
          )}

          {baseParams.pile_notes && (
            <li><span className="font-semibold">Notes:</span> {baseParams.pile_notes}</li>
          )}
        </ul>

        <div className={`scale-85 origin-top ${profileData.profile_name || baseParams.pile_notes ? 'mt-6' : 'mt-2'}`}>
          {renderPileStructuralCheck()}
        </div>
      </div>
      
      {/* --- APPENDIX: Uploaded Image --- */}
      <div className="break-before-page">
        <div className="text-2xl font-semibold tracking-tight">
          Appendix
        </div>

        <div className="scale-85 origin-top mt-6">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Uploaded appendix image"
              className="max-w-xl rounded-lg shadow"
            />
          ) : (
           null
          )}
        </div>
      </div>
    </div>
  )
}



