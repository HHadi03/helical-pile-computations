import { ToverviewSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { ToverviewSoilSchema } from "@/schemas/soilSchemas"
import { Triangle } from "lucide-react"

function getLuminance (color: string) {
  const hex = color.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export function SoilDiagram ({ profileSoils, profile, profileIndex}: { profileSoils: ToverviewSoilSchema[], profile: ToverviewSoilProfileSchema, profileIndex: number }) {
  
  if (profileSoils.length === 0) {
    return (
      <div className="border-x border-t border-b-2 p-2 bg-secondary">
        <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold">{profile.profile_name || `Soil Profile ${profileIndex + 1}`}</h1>
        <p className="text-sm"><span className="font-semibold">Effective Pile Length:</span> {profile.effective_pile_length} m</p>
       </div>
        <p className="text-sm text-muted-foreground">No soil layers detected, add soil layers in configuration to begin analysis.</p>
      </div>
    )
  }

  const pileDiameter = 60
  const ultimatePulloutCapacity = pileDiameter === 60 ? profileSoils.reduce((sum, soil) => sum + soil.shaft_capacity60, 0) : profileSoils.reduce((sum, soil) => sum + soil.shaft_capacity100, 0)
  
  const lastLayer = profileSoils.find(soil => soil.start_depth <= profile.effective_pile_length && profile.effective_pile_length <= soil.end_depth) || profileSoils[profileSoils.length - 1]

  const bearingCapacity = pileDiameter === 60 ? lastLayer.bearing_capacity60 : lastLayer.bearing_capacity100

  const ultimateBearingCapacity = ultimatePulloutCapacity + bearingCapacity

  return (
    <div>

      <div className="border-x border-t border-b-2 p-2 bg-secondary">
        <div className="flex justify-between">
          
          <h1 className="text-xl font-semibold">{profile.profile_name || `Soil Profile ${profileIndex + 1}`}</h1>
        
          <div className="text-right text-sm">
            <p><span className="font-semibold">Effective Pile Length:</span> {profile.effective_pile_length} m</p>
            <p><span className="font-semibold">Ultimate Pullout Capacity:</span> {ultimatePulloutCapacity.toFixed(2)} kN</p> 
            <p><span className="font-semibold">Ultimate Bearing Capacity:</span> {ultimateBearingCapacity.toFixed(2)} kN</p>
          </div>

        </div>
      </div>
    
      {profileSoils.map((soil, index) => {
        const isDefaultColour = soil.colour === "#000000"
        const isDark = getLuminance(soil.colour) < 0.5
        const textColor = isDark ? "text-white" : "text-black"

        const isLayerBeyondPile = soil.start_depth >= profile.effective_pile_length
        
        const isWaterInLayer = soil.start_depth <= profile.water_depth && profile.water_depth <= soil.end_depth
       
        return (
          <div key={soil.id} className="relative px-2 border-b" style={{ backgroundColor: isDefaultColour ? "transparent" : soil.colour }}>
            
            <div className="flex">
              
              {/* left of the pile in the soil diagram */}
              <div className={`w-1/4 space-y-2 py-2 text-sm leading-snug ${isDefaultColour ? 'text-foreground' : textColor}`}>
                {!isLayerBeyondPile && (
                  <>
                    <p><span className="font-semibold">Shaft Capacity:</span> {pileDiameter === 60 ? soil.shaft_capacity60 : soil.shaft_capacity100} kN</p>
                    {lastLayer && soil.id === lastLayer.id && (
                      <p><span className="font-semibold">Bearing Capacity:</span> {pileDiameter === 60 ? lastLayer.bearing_capacity60 : lastLayer.bearing_capacity100} kN</p>
                    )}
                  </>
                )}
              </div>

              {/* empty pile placeholder */}
              <div className="w-1/4"></div>

              {/* right of the pile in the soil diagram */}      
              <div className={`w-2/4 space-y-2 py-2 text-sm leading-snug ${isDefaultColour ? 'text-foreground' : textColor}`}>
                <p className="font-semibold">{soil.soil_name || soil.soil}</p>
                <p><span className="font-semibold">SPT N-Value:</span> {soil.n_value}</p>
                <p><span className="font-semibold">Moist Unit Weight:</span> {soil.y_moist} kN/m³</p>
                <p><span className="font-semibold">Sat Unit Weight:</span> {soil.y_sat} kN/m³</p>
                <p><span className="font-semibold">{soil.soil_type === 'fine' ? 'Undrained Shear Strength:' : 'Shear Strength:'}</span> {soil.soil_type === 'fine' ? soil.su : soil.t} kPa</p>
                <p><span className="font-semibold">Description:</span> {soil.description || "N/A"}</p>
              </div>

            </div>

            {/* Absolute positioned elements*/}
            <div className={`absolute right-2 top-2 text-xs px-2 py-1 rounded-sm border ${isDefaultColour ? 'bg-secondary border-secondary-foreground' : isDark ? 'bg-black text-white border-white' : 'bg-white text-black border-black'}`}><span className="font-semibold">Layer No:</span> {index + 1}</div>
            
            <div className={`absolute left-2 bottom-1 text-xs ${isDefaultColour ? 'text-foreground/70' : textColor}`}><span className="font-semibold">Depth:</span> {soil.start_depth} – {soil.end_depth} m</div>
            
            {isWaterInLayer && (
              <div className="absolute left-0 right-0 z-10 border-b-2 border-blue-300 dark:border-blue-800 border-dashed" style={{ top: `${Math.max(0, Math.min(100, ((profile.water_depth - soil.start_depth) / (soil.end_depth - soil.start_depth)) * 100))}%`}}>
                <div className={`absolute bottom-0.5 right-2 flex flex-row gap-2 text-xs ${isDefaultColour ? 'text-foreground' : textColor}`}>
                  <Triangle className="fill-blue-300 dark:fill-blue-800 text-muted-foreground rotate-180 size-4"/>Water Table: {profile.water_depth} m
                </div>
              </div>
            )}

          </div>
        )
      })}
    </div>
  )
}


               
