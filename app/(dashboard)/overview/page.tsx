import { getSoils } from "@/app/lib/api/getSoils"
import { ArrowUp, ArrowDown, Waves } from "lucide-react"
import { getLuminance } from "@/app/components/GetLuminance"
import { getPile } from "@/app/lib/api/getPile"

export default async function OverviewPage() {
  const soilsData = await getSoils()
  const pileData = await getPile()

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

  const hasCapacityCalculations = soilsData.some((soil) => soil.shaftCapacity != null || soil.bearingCapacity != null)
  
  const ultimatePulloutCapacity = soilsData.reduce((sum, { shaftCapacity = 0 }) => sum + shaftCapacity, 0)
  
  const bearingCapacity = soilsData.at(-1)?.bearingCapacity ?? 0
  
  const ultimateBearingCapacity = ultimatePulloutCapacity + bearingCapacity

  return (
    //possibly look into container for responsive design? limit width? prevent sidebar expansion on smaller screens?
    <main className="h-full px-4 border-2 border-black relative overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">

      {hasCapacityCalculations && (
        <div className="flex justify-center gap-2 py-4  z-30 sticky top-0">
          <ArrowUp className="w-6 h-6 text-blue-600"/>
          <div className="font-semibold">Ultimate Pullout Capacity: <span className="text-blue-600">{ultimatePulloutCapacity.toFixed(2)} kN</span></div>
        </div>
      )}

      {pileData.waterDepth && (
         <div className="absolute left-4 right-4 z-20"style={{top:`250px`,}}>
            <div className="w-full border-b-2 border-blue-400 border-dashed"></div>
            <div className="absolute -top-7 pl-1 flex items-center text-blue-600">
              <Waves className="w-5 h-5 mr-1"/>
              <span className="font-semibold">Water Depth: {pileData.waterDepth.toFixed(1)} m</span>
            </div>  
        </div>
      )}
      
      {soilsData.map((soil, index) => {
        const isLastLayer = index === soilsData.length - 1
        const h = soil.endDepth - soil.startDepth
        const startDepth = soil.startDepth
        const endDepth = soil.endDepth
        const backgroundColor = soil.color || "#e5e5e5"
        const isDark = getLuminance(backgroundColor) < 0.5
        const textColor = isDark ? "text-white" : "text-black"
        let pileLengthDifference = soil.endDepth - pileData.pileLength

        if (pileLengthDifference === 0) {
          pileLengthDifference = h
        }
        const pileHeight = 154 * (Math.abs(pileLengthDifference) / h)
        
        let pileImage = "url('/100mm-pile-edited.png')"
        if (pileData.pileDiameter === "60") {
          pileImage = "url('/60mm-pile.png')"
        }
        
        return (
          <div key={soil.id || index}>
            {soil.endDepth < pileData.pileLength ? (
              <div 
                className="absolute left-1/2 z-10 -ml-10"
                style={{
                  height: `160px`,
                  width: '96px',  
                  backgroundImage: pileImage,
                  backgroundSize: '100% 100%',
                }}
              />
        
            ) : soil.endDepth > pileData.pileLength && soil.startDepth >= pileData.pileLength ?  (
              <div 
                className="absolute left-1/2 z-10 -ml-10"
                style={{
                  height: `0px`,
                  width: '96px',  
                  backgroundImage: pileImage,
                  backgroundSize: '100% 100%',
                }}
              />

            ) : soil.endDepth >= pileData.pileLength ? (
              <div 
                className="absolute left-1/2 z-10 -ml-10"
                style={{
                  height: `${pileHeight}px`,
                  width: '96px',  
                  backgroundImage: pileImage,
                  backgroundSize: '100% 100%',
                }}
              >
                {pileData.pileLength}
              </div>
            ) : null}

            <div className="relative border-2 border-gray-500 my-1" style={{ backgroundColor }}>
              <div className="flex">

                <div className="w-1/2 flex justify-start pl-4">
                  <div className="py-4 flex flex-col gap-2">
                    <div className="text-base font-semibold text-gray-600"> {startDepth.toFixed(1)} m </div>
                    {soil.shaftCapacity !== undefined ? (
                      <div className={textColor}>
                        <span className="font-semibold">Shaft Capacity:</span>{" "}
                        <span className={textColor}>{soil.shaftCapacity.toFixed(2)} kN</span>
                      </div>
                    ) : ( <div className={`${textColor} italic`}>Shaft capacity calculation needed</div> )}

                    {isLastLayer && (
                      soil.bearingCapacity !== undefined ? (
                        <div className={textColor}>
                          <span className="font-semibold">Bearing Capacity:</span>{" "}
                          <span className={textColor}>{soil.bearingCapacity.toFixed(2)} kN</span>
                        </div>
                      ) : (<div className={`${textColor} italic`}>Bearing capacity calculation needed</div>))}
                    
                    {isLastLayer && (<div className="text-base font-semibold text-gray-600">{endDepth.toFixed(1)} m</div>)}
                  </div>
                </div>

                <div className="w-1/2 flex py-4 pl-10">
                  <div className="flex gap-8">
                    <div>
                      <h3 className={`font-semibold ${textColor}`}>{soil.soilName || soil.soil}</h3>
                      <div className="space-y-2 pt-2">
                        <p className={textColor}><span className="font-semibold">Unit Weight (Moist):</span>{" "}{soil.yMoist} kN/m³</p>
                        <p className={textColor}><span className="font-semibold">Unit Weight (Saturated):</span>{" "}{soil.ySat} kN/m³</p>
                        <p className={textColor}><span className="font-semibold">SPT Blow Count (N):</span> {soil.nValue}</p>
                      </div>
                    </div>

                    {soil.description && (
                      <div className="flex-1">
                        <h4 className={`font-semibold ${textColor}`}>Description:</h4>
                        <p className={`text-sm ${textColor}`}>{soil.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`absolute right-4 bottom-0 -translate-y-1/2 px-2 py-1 shadow text-sm font-semibold
                  ${isDark ? "text-white bg-gray-700" : "text-black bg-white"}`}>
                  {h.toFixed(1)} m
                </div> 

              </div>
            </div>

            {/* {isLastLayer && (<div className="text-sm font-semibold text-gray-600 pt-2 border-b border-gray-200">{endDepth.toFixed(1)} m</div>)} */}
            
          </div>
        )
      })}
        
      {hasCapacityCalculations && (
        <div className="flex justify-center gap-2 py-4 z-30 sticky bottom-0">
          <ArrowDown className="w-6 h-6 text-red-600" />
          <div className="font-semibold">Ultimate Bearing Capacity: <span className="text-red-600">{ultimateBearingCapacity.toFixed(2)} kN</span> </div>
        </div>
      )}
      
    </main>
  )
}