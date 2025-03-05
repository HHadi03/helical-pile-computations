import { getSoils } from "@/app/lib/api/getSoils"
import { ArrowUp, ArrowDown } from "lucide-react"
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

  return (
    <main className="h-full px-4 border-black overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400
     scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">

      {hasCapacityCalculations && (
        <div className="flex justify-center gap-2 z-30 pb-5">
          <ArrowUp className="w-6 h-6"/>
          <div><span className="font-semibold">Ultimate Pullout Capacity:</span> {ultimatePulloutCapacity.toFixed(2)} kN</div>
        </div>
      )}

      {soilsData.map((soil, index) => {
        const isLastLayer = (soil.startDepth < pileData.pileLength) && (pileData.pileLength <= soil.endDepth)
        const isLayerBeyondPile = soil.startDepth >= pileData.pileLength

        const backgroundColor = soil.color || "#e5e5e5"
        const isDark = getLuminance(backgroundColor) < 0.5
        const textColor = isDark ? "text-white" : "text-black"

        let backgroundImage = "url(/100mm-pile-edited.png)"
  
        return (
          <div key={soil.id || index}>
            <div className={`relative border-b border-x ${index === 0 ? 'border-t' : ''} border-slate-900`} style={{backgroundColor}}>

              {!isLayerBeyondPile && (
                <div
                  className={"absolute z-10 -ml-5"}
                  style={{
                    backgroundImage,
                    backgroundSize: "auto",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    height: "14px", 
                    width: "100%",  
                  }}>
                </div>
              )}

              <div className="flex">
                
                <div className="absolute top-0 left-4 pt-3 text-sm font-semibold text-gray-600"> Start Depth: {soil.startDepth.toFixed(1)} m</div>
                <div className="absolute bottom-0 left-4 pb-3 text-sm font-semibold text-gray-600"> End Depth: {soil.endDepth.toFixed(1)} m</div>

                {/* Left Side of the Pile Data */}
                <div className="w-1/2 flex justify-start pl-4">
                  <div className="py-16 flex flex-col gap-2">
                    
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
                
                {/* Right Side of the Pile Data */}
                <div className="w-1/2 flex py-4 pl-10 pr-3 items-center">
                  <div className="flex gap-8">

                    <div>
                      <h1 className={`font-semibold text-lg ${textColor}`}>{soil.soilName || soil.soil}</h1>
                      <div className="space-y-2 pt-2">
                        <p className={textColor}><span className="font-semibold">SPT Blow Count (N):</span> {soil.nValue}</p>
                        <p className={textColor}><span className="font-semibold">Unit Weight (Moist):</span> {soil.yMoist} kN/m³</p>
                        <p className={textColor}><span className="font-semibold">Unit Weight (Saturated):</span> {soil.ySat} kN/m³</p>
                        <p className={textColor}><span className="font-semibold">Shear Strength ({soil.soilType === "fine" ? "Su" : "T"}):</span> {soil.soilType === "fine" ? soil.Su! : soil.T!} kPa</p>
                      </div>
                    </div>

                    {soil.description && (
                      <div className="flex-1">
                        <h1 className={`font-semibold ${textColor}`}>Description</h1>
                        <p className={`text-sm ${textColor}`}>{soil.description}</p>
                      </div>
                    )}

                  </div>
                </div>

                <div
                  className={`absolute right-4 bottom-0 -translate-y-1/2 px-2 py-1 shadow text-sm font-semibold
                  ${isDark ? "text-white bg-gray-700" : "text-black bg-white"}`}>
                  {soil.h!.toFixed(1)} m
                </div>

              </div>
            </div>
          </div>
        )
      })}
      
      {hasCapacityCalculations && pileData.showBearingCapacity && (
        <div className="flex justify-center gap-2 z-30 pt-6">
          <ArrowDown className="w-6 h-6"/>
          <div><span className="font-semibold">Ultimate Bearing Capacity:</span> {ultimateBearingCapacity.toFixed(2)} kN</div>
        </div>
      )}
      
    </main>
  )
}