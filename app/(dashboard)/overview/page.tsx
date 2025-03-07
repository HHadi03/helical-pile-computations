import { getSoils } from "@/app/lib/api/getSoils"
import { ArrowUp, ArrowDown} from "lucide-react"
import { getPile } from "@/app/lib/api/getPile"

export default async function OverviewPage() {
  const soilsData = await getSoils()
  const pileData = await getPile()

  const getLuminance = (color: string) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255
  }

  if (!pileData){
    return (
      <div className="h-full bg-[#F4F3F2] flex items-center justify-center border-2 border-black">
        <div className="text-center max-w-md">
          <h3 className="text-xl font-semibold text-gray-800 pb-2">No Pile Data Found</h3>
          <p className="text-gray-600">Configure pile data to visualise the soil profile and pile interaction.</p>
        </div>
      </div>
    )
  }

  if (soilsData.length === 0) {
    return (
      <div className="h-full bg-[#F4F3F2] flex items-center justify-center border-2 border-black">
        <div className="text-center max-w-md">
          <h3 className="text-xl font-semibold text-gray-800 pb-2">No Soil Entries Found</h3>
          <p className="text-gray-600">Add soil data to visualise the soil profile and pile interaction.</p>
        </div>
      </div>
    )
  }
  
  const relevantSoils = soilsData.filter(soil => soil.startDepth < pileData.pileLength)
  const hasCapacityCalculations = relevantSoils.some(soil => soil.shaftCapacity != null || soil.bearingCapacity != null)
  const ultimatePulloutCapacity = relevantSoils.reduce((sum, { shaftCapacity = 0 }) => sum + shaftCapacity, 0)
  
  const lastLayer = soilsData.find(soil => soil.startDepth < pileData.pileLength && pileData.pileLength <= soil.endDepth)
  const bearingCapacity = lastLayer?.bearingCapacity ?? 0
  const ultimateBearingCapacity = ultimatePulloutCapacity + bearingCapacity

  const PX_PER_METER = 200
  const MIN_LAYER_HEIGHT_PX = 350

  return (
    <main className="h-full px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400
     scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">

      {hasCapacityCalculations && (
        <div className="flex justify-center gap-2 pb-5">
          <ArrowUp className="w-6 h-6"/>
          <div><span className="font-semibold">Ultimate Pullout Capacity:</span> {ultimatePulloutCapacity.toFixed(2)} kN</div>
        </div>
      )}

      {soilsData.map((soil, index) => {
        const isLastLayer = soil.startDepth < pileData.pileLength && pileData.pileLength <= soil.endDepth
        const isLayerBeyondPile = soil.startDepth >= pileData.pileLength

        const isWaterInLayer = soil.startDepth <= pileData.waterDepth && pileData.waterDepth <= soil.endDepth
        const layerHeightPx = soil.h! * PX_PER_METER;
        const containerHeight = Math.max(layerHeightPx, MIN_LAYER_HEIGHT_PX);

        const backgroundColor = soil.color || "#e5e5e5"
        const isDark = getLuminance(backgroundColor) < 0.5
        const textColor = isDark ? "text-white" : "text-black"
  
        return (
          <div key={soil.id || index}>
            <div className={`mx-auto relative  border-x-2 border-b-2 border-stone-500 ${index === 0 ? 'border-t-2' : ''}`}
             style={{backgroundColor, height: `${containerHeight}px`, width: "min(70vw)"}}>
              <div className="flex">
                
                {/* Left Side of the Soil Profile */}
                <div className="w-5/12 flex justify-end pt-5 px-3">
                  <div className="flex flex-col gap-2">
                    {!isLayerBeyondPile && (
                      <>
                        {soil.shaftCapacity !== undefined ? (
                          <div className={textColor}>
                            <span className="font-semibold">Shaft Capacity:</span>{" "}
                            <span className={textColor}>{soil.shaftCapacity} kN</span>
                          </div>
                        ) : (<div className={`${textColor} italic`}>Shaft capacity calculation missing.</div>)}

                        {isLastLayer && pileData.showBearingCapacity && (
                          soil.bearingCapacity !== undefined ? (
                            <div className={textColor}>
                              <span className="font-semibold">Bearing Capacity:</span>{" "}
                              <span className={textColor}>{soil.bearingCapacity} kN</span>
                            </div>
                        ) : (<div className={`${textColor} italic`}>Bearing capacity calculation missing.</div>))}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Middle Section of the Soil Profile */}
                <div className="w-1/6 flex justify-center">
                  {!isLayerBeyondPile && (
                    <div
                      className="absolute z-20"
                      style={{
                        backgroundImage: `url(/100mm-pile.png)`,
                        backgroundSize: "auto",
                        backgroundRepeat: "repeat-y",
                        backgroundPosition: "center",
                        height: isLastLayer ? `${((pileData.pileLength - soil.startDepth) / soil.h!) * 100}%` : `${containerHeight}px`,
                        width: "100%",
                      }}
                    />
                  )}
                </div>

                {/* Right Side of the Soil Profile */}
                <div className="w-5/12 flex pt-5 px-3">
                  <div className="flex flex-col gap-5">
                    <div className="space-y-2">
                      <p className={`font-semibold text-lg ${textColor}`}>{soil.soilName || soil.soil}</p>
                      <p className={textColor}><span className="font-semibold">SPT Blow Count (N):</span> {soil.nValue}</p>
                      <p className={textColor}><span className="font-semibold">Unit Weight (Moist):</span> {soil.yMoist} kN/m³</p>
                      <p className={textColor}><span className="font-semibold">Unit Weight (Saturated):</span> {soil.ySat} kN/m³</p>
                      <p className={textColor}><span className="font-semibold">Shear Strength ({soil.soilType === "fine" ? "Su" : "T"}):</span> {soil.soilType === "fine" ? soil.Su! : soil.T!} kPa</p>
                    </div>
                    
                    {soil.description && (
                      <div>
                        <h1 className={`font-semibold ${textColor}`}>Description</h1>
                        <p className={`text-sm ${textColor}`}>{soil.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Absolute Positioned Objects in the Soil Profile */}
                <div
                  className={`absolute z-10 right-4 top-0 px-2 py-1 mt-4 shadow text-sm font-semibold 
                  ${isDark ? "text-white bg-gray-700" : "text-black bg-white"}`}>
                  {soil.h!.toFixed(1)} m
                </div>

                {isWaterInLayer && (
                  <div className="absolute left-0 right-0" style={{top: `${((pileData.waterDepth - soil.startDepth) / soil.h!) * 100}%`,}}>
                    <div className="w-full border-b-2 border-blue-400 border-dashed"></div>
                    <div className="absolute bottom-0 pl-1 flex items-center text-blue-600">
                      <span className="font-semibold"> ▽ Water Depth: {pileData.waterDepth.toFixed(1)} m</span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )
      })}
      
      {hasCapacityCalculations && pileData.showBearingCapacity && (
        <div className="flex justify-center gap-2 pt-5">
          <ArrowDown className="w-6 h-6"/>
          <div><span className="font-semibold">Ultimate Bearing Capacity:</span> {ultimateBearingCapacity.toFixed(2)} kN</div>
        </div>
      )}
      
    </main> 
  )
}

{/* <div className="absolute top-0 left-4 pt-3 text-sm font-semibold text-gray-600"> Start Depth: {soil.startDepth.toFixed(1)} m</div>
<div className="absolute bottom-0 left-4 pb-3 text-sm font-semibold text-gray-600"> End Depth: {soil.endDepth.toFixed(1)} m</div> */}