import { TsoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { TsoilSchema } from "@/schemas/soilSchemas"
import { ArrowUp, ArrowDown, Triangle } from "lucide-react"

function getLuminance (color: string) {
  const hex = color.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export function SoilDiagram ({ profileSoils, profile, index}: { profileSoils: TsoilSchema[], profile: TsoilProfileSchema, index: number }) {
  if (profileSoils.length === 0) {
    return (
      <div key={profile.id} className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{profile.profileName ? profile.profileName : `Soil Profile ${index + 1}`}</h2>
        <div className="text-center text-gray-600">
          <p>No soil layers found for this profile.</p>
        </div>
      </div>
    )
  }

  let newPileLength: number
  if (profile.pileStickOut > profile.pileLength) {
    newPileLength = 0
  } 

  else {
    newPileLength = profile.pileLength - profile.pileStickOut
  }
          
  const relevantSoils = profileSoils.filter(soil => soil.startDepth < newPileLength)
  const lastLayer = relevantSoils.find(soil => newPileLength <= soil.endDepth)
  const hasCapacityCalculations = relevantSoils.some(soil => soil.shaftCapacity60|| soil.bearingCapacity60)
  const ultimatePulloutCapacity = relevantSoils.reduce((sum, soil) => sum + (soil.shaftCapacity60 ?? 0), 0)
  const bearingCapacity = lastLayer?.bearingCapacity60 ?? 0
  const ultimateBearingCapacity = ultimatePulloutCapacity + bearingCapacity

  return (
    <div key={profile.id} className="border-2 border-yellow-500 rounded-lg p-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-1">{profile.profileName || `Soil Profile ${index + 1}`}</h2>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Effective Pile Length:</span> {newPileLength} m
        </p>
      </div>

      {hasCapacityCalculations && (
        <div className="flex justify-center flex-wrap gap-4 pb-5">
          <div className="flex items-center gap-2">
            <ArrowUp className="w-6 h-6" />
            <div><span className="font-semibold">Ultimate Pullout Capacity:</span> {ultimatePulloutCapacity.toFixed(2)} kN</div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDown className="w-6 h-6" />
            <div><span className="font-semibold">Ultimate Bearing Capacity:</span> {ultimateBearingCapacity.toFixed(2)} kN</div>
          </div>
        </div>
      )}

      {profileSoils.map((soil, index) => {
        const isWaterInLayer = soil.startDepth <= profile.waterDepth && profile.waterDepth <= soil.endDepth
        const isLayerBeyondPile = soil.startDepth >= newPileLength
        const isBottomLayer = soil.startDepth < newPileLength && soil.endDepth >= newPileLength

        const isDefaultColour = soil.colour === "#000000"
        const backgroundColor = soil.colour
        const isDark = getLuminance(backgroundColor) < 0.5
        const textColor = isDark ? "text-white" : "text-black"

        return (
          <div key={soil.id || index}  className={`relative border-x-2 border-b-2 border-stone-500 py-4 ${index === 0 ? 'border-t-2' : ''} ${isDefaultColour ? 'bg-secondary text-secondary-foreground' : ''}`}
          style={!isDefaultColour ? { backgroundColor } : undefined}>

            <div className={`absolute z-10 right-4 top-4 p-2 shadow text-sm font-semibold ${isDark ? "text-white bg-gray-700" : "bg-white"}`}> {soil.h!.toFixed(1)} m </div>

            {isWaterInLayer && (
              <div className="absolute left-0 right-0 z-10 top-1/2">
                <div className="w-full border-b-2 border-blue-400 border-dashed"></div>
                <div className="pl-2 pb-1 absolute bottom-0 right-2 flex flex-row items-center"> 
                  <div className="font-semibold"> <Triangle className="fill-blue-400 text-muted-foreground rotate-180"/> Water Table: {profile.waterDepth.toFixed(1)} m</div>
                </div>
              </div>
            )}

            <div className="flex h-full">
              <div className="w-[40%] flex px-2">
                <div className="text-base">
                  {!isLayerBeyondPile && (
                    <>
                      <div className={textColor}>
                        <span className="font-semibold">Shaft Capacity @60mm:</span>{" "}
                        {soil.shaftCapacity60 ?? "N/A"} kN
                      </div>
                      <div className={textColor}>
                        <span className="font-semibold">Shaft Capacity @100mm:</span>{" "}
                        {soil.shaftCapacity100 ?? "N/A"} kN
                      </div>

                      {isBottomLayer && (
                        <>
                          <div className={textColor}>
                            <span className="font-semibold">Bearing Capacity @60mm:</span>{" "}
                            {soil.bearingCapacity60 ?? "N/A"} kN
                          </div>
                          <div className={textColor}>
                            <span className="font-semibold">Bearing Capacity @100mm:</span>{" "}
                            {soil.bearingCapacity100 ?? "N/A"} kN
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="w-[10%] flex"></div>

              <div className="w-[50%] flex">
                <div className="flex flex-col gap-5 text-sm leading-snug">
                  <div className="space-y-2">
                    <p className={`font-semibold text-base ${textColor}`}>{soil.soilName || soil.soil}</p>
                    <p className={textColor}><span className="font-semibold">SPT Blow Count (N):</span> {soil.nValue}</p>
                    <p className={textColor}><span className="font-semibold">Unit Weight (Moist):</span> {soil.yMoist} kN/m³</p>
                    <p className={textColor}><span className="font-semibold">Unit Weight (Saturated):</span> {soil.ySat} kN/m³</p>
                    <p className={textColor}><span className="font-semibold">Shear Strength ({soil.soilType === "fine" ? "Su" : "T"}):</span> {soil.soilType === "fine" ? soil.su ?? "N/A" : soil.t ?? "N/A"} kPa</p>
                  </div>

                  {soil.description && (
                    <div>
                      <h1 className={`font-semibold ${textColor}`}>Description</h1>
                      <p className={`text-sm ${textColor}`}>{soil.description}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {newPileLength > 0 && (
              <div
                className="absolute top-0 left-[35%] z-20"
                style={{
                  width: "40px",
                  height: "100%",
                  backgroundImage: `url(60mm-pile.png)`,
                  backgroundSize: "40px auto",
                  backgroundRepeat: "repeat-y",
                  backgroundPosition: "center",
                }}
              />
            )}
            
          </div>
        )
      })}
    </div>
  )
}

