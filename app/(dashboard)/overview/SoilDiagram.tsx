import { ToverviewSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { ToverviewSoilSchema } from "@/schemas/soilSchemas"
import { Triangle, MoveLeft, MoveRight } from "lucide-react"
import { getLuminance } from "@/lib/utils"

export function SoilDiagram ({ profileSoils, profile, profileIndex, pileDiameter, hideBearingCapacity, showMobileLayout}: { profileSoils: ToverviewSoilSchema[], profile: ToverviewSoilProfileSchema, profileIndex: number, pileDiameter: string, hideBearingCapacity: boolean, showMobileLayout?: boolean }) {
  
  const BASE_HEIGHT = 161 // Base height in pixels
  const SCALE_FACTOR = 50 // Additional pixels per meter of depth
  
  // Calculate height for each layer based on its thickness
  const getLayerHeight = (soil: ToverviewSoilSchema) => {
    const thickness = soil.end_depth - soil.start_depth
    return Math.max(BASE_HEIGHT, BASE_HEIGHT + (thickness * SCALE_FACTOR))
  }
  
  const ultimatePulloutCapacity = pileDiameter === "60" ? profileSoils.reduce((sum, soil) => sum + soil.shaft_capacity60, 0) : profileSoils.reduce((sum, soil) => sum + soil.shaft_capacity100, 0)
  
  const lastLayer = profileSoils.find(soil => soil.start_depth <= profile.effective_pile_length && profile.effective_pile_length <= soil.end_depth) || profileSoils[profileSoils.length - 1]

  const bearingCapacity = pileDiameter === "60" ? lastLayer.bearing_capacity60 : lastLayer.bearing_capacity100

  const ultimateBearingCapacity = ultimatePulloutCapacity + bearingCapacity

  // Calculate pile height with scaled layers
  const pileHeight = profileSoils.reduce((height, soil) => {
    const layerHeight = getLayerHeight(soil)
    
    if (soil.id === lastLayer.id) {
      if (lastLayer.end_depth <= profile.effective_pile_length) {
        // Full layers up to and including the last layer
        return height + layerHeight
      } else {
        // Partial last layer
        const portionOfLayer = (profile.effective_pile_length - soil.start_depth) / (soil.end_depth - soil.start_depth)
        return height + (portionOfLayer * layerHeight)
      }
    } else if (soil.start_depth < profile.effective_pile_length) {
      // Full layer before the last layer
      return height + layerHeight
    }
    return height
  }, 0)

  return (
    <div>
      <div className="p-2 bg-sky-50 dark:bg-sky-900/50 relative border-2"> 
        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0">
          
          <div className="flex flex-col">
            <h2 className="font-semibold line-clamp-1" title={profile.profile_name || `Soil Profile ${profileIndex + 1}`}>{profile.profile_name || `Soil Profile ${profileIndex + 1}`}</h2>
            <p className="text-sm mt-auto text-muted-foreground">Pile Diameter: {pileDiameter} mm</p>
          </div>
        
          <div className="sm:text-right text-sm sm:whitespace-nowrap">
            <p><span className="font-semibold">Effective Pile Length:</span> {profile.effective_pile_length} m</p>
            <p><span className="font-semibold">Ultimate Pullout Capacity:</span> {ultimatePulloutCapacity.toFixed(2)} kN</p> 
            {!hideBearingCapacity && (<p><span className="font-semibold">Ultimate Bearing Capacity:</span> {ultimateBearingCapacity.toFixed(2)} kN</p>)}
          </div>

          <div className="sm:absolute sm:bottom-3 sm:left-61.75">
            <div className="flex flex-row text-xs gap-1 -ml-1">
              {showMobileLayout ? <>Stickout: {profile.pile_stick_out} m <MoveRight className="size-4"/></> : <><MoveLeft className="size-4 rotate-180 sm:rotate-0"/>Stickout: {profile.pile_stick_out} m</>}
            </div>
          </div>
          
        </div>
      </div>
      
      <div className="relative border-b border-x">
        {profileSoils.map((soil, index) => {
          const isDefaultColour = soil.colour === "#000000"
          const isDark = getLuminance(soil.colour) < 0.5
          const textColor = isDark ? "text-white" : "text-black"
          const layerHeight = getLayerHeight(soil)

          return (
            <div key={soil.id} className={`relative p-2 flex flex-col sm:grid sm:grid-cols-[190px_50px_1fr] whitespace-nowrap ${isDefaultColour && index < profileSoils.length - 1 ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-[oklch(0.87_0.01_258)] dark:after:bg-[oklch(1_0_0/25%)]' : ''}`} style={{ backgroundColor: isDefaultColour ? "" : soil.colour, minHeight: `${layerHeight}px` }}>

              <div className={`flex flex-col space-y-2 text-sm leading-snug ${isDefaultColour ? 'text-foreground' : textColor}`}>
                {profile.effective_pile_length > soil.start_depth && (
                  <>
                    <p><span className="font-semibold">Shaft Capacity:</span> {pileDiameter === "60" ? soil.shaft_capacity60 : soil.shaft_capacity100} kN</p>
                    {!hideBearingCapacity && (soil.id === lastLayer.id && (<p><span className="font-semibold">Bearing Capacity:</span> {bearingCapacity} kN</p>))}
                  </>
                )}
                <div className="mt-auto text-xs"><span className="font-semibold">Depth:</span> {soil.start_depth} – {soil.end_depth} m</div>
              </div>

              <div></div>
                
              <div className={`space-y-2 text-sm leading-tight @container ${isDefaultColour ? 'text-foreground' : textColor}`}>
                <p className="font-semibold uppercase">{soil.soil_name || soil.soil}</p>
                <p className="truncate" title={soil.description || "N/A"}>Description: {soil.description || "N/A"}</p>
                <p>SPT N-Value: {soil.test_type === "spt" ? soil.n_value : '—'}</p>
                <p>Moist Weight: {soil.y_moist} kN/m³</p>
                <p>Saturated Weight: {soil.y_sat} kN/m³</p>
                <p>{soil.soil_type === 'fine' ? 'Undrained Shear Strength:' : 'Shear Strength:'} {soil.soil_type === 'fine' ? soil.su : soil.t} kPa</p>
              </div>

              <div className={`absolute right-2 top-2 text-xs px-2 py-0.5 rounded-sm border font-semibold ${isDefaultColour ? 'border-foreground' : isDark ? 'border-white text-white' : 'border-black text-black'}`}>Layer  {index + 1}</div>

              {soil.start_depth < profile.water_depth && profile.water_depth <= soil.end_depth && (
                <div className={`absolute left-0 right-0 z-10 border-b-2 border-dashed ${isDefaultColour ? 'border-blue-400 dark:border-blue-800' :  isDark ? 'border-blue-400' : 'border-blue-800'}`} style={{ top: `${Math.max(42, Math.min(100, ((profile.water_depth - soil.start_depth) / (soil.end_depth - soil.start_depth)) * 100))}%`}}>
                  <div className={`absolute bottom-0.5 right-2 flex flex-row text-xs gap-2 ${isDefaultColour ? 'text-foreground' : textColor}`}>
                    <Triangle className={`text-muted-foreground rotate-180 size-4 ${isDefaultColour ? 'fill-blue-400 dark:fill-blue-800' : isDark ? 'fill-blue-400' : 'fill-blue-800'}`}/><span className="-ml-1 -mr-1">Water Table:</span>{profile.water_depth} m
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <div className={`absolute z-20 -top-6.25 left-55 transform -translate-x-1/2 ${pileDiameter === "60" ? 'w-7.5 bg-size-[30px] bg-[url(/60mm-pile.png)]' : 'w-10 bg-size-[40px] bg-[url(/100mm-pile.png)]'}`} style={{height: `${pileHeight + 25}px`}}/>
      </div> 
    </div>
  )
}