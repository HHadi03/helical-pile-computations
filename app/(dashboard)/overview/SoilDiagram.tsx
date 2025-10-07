import { ToverviewSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { ToverviewSoilSchema } from "@/schemas/soilSchemas"
import { Triangle, MoveLeft, MoveRight } from "lucide-react"
import { getLuminance } from "@/lib/utils"

export function SoilDiagram ({ profileSoils, profile, profileIndex, pileDiameter, hideBearingCapacity, showMobileLayout}: { profileSoils: ToverviewSoilSchema[], profile: ToverviewSoilProfileSchema, profileIndex: number, pileDiameter: string, hideBearingCapacity: boolean, showMobileLayout?: boolean }) {
  
  const ultimatePulloutCapacity = pileDiameter === "60" ? profileSoils.reduce((sum, soil) => sum + soil.shaft_capacity60, 0) : profileSoils.reduce((sum, soil) => sum + soil.shaft_capacity100, 0)
  
  const lastLayer = profileSoils.find(soil => soil.start_depth <= profile.effective_pile_length && profile.effective_pile_length <= soil.end_depth) || profileSoils[profileSoils.length - 1]

  const bearingCapacity = pileDiameter === "60" ? lastLayer.bearing_capacity60 : lastLayer.bearing_capacity100

  const ultimateBearingCapacity = ultimatePulloutCapacity + bearingCapacity

  let pileHeight = 0
  return (
    <div className="border">
      <div className="p-2 bg-sky-50 dark:bg-sky-900/50 relative border"> 
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

          <div className="sm:absolute sm:bottom-3 sm:left-[253px]">
            <div className="flex flex-row text-xs gap-2 -ml-1">
              {showMobileLayout ? <>Stickout: {profile.pile_stick_out} m <MoveRight className="size-4"/></> : <><MoveLeft className="size-4 rotate-180 sm:rotate-0"/>Stickout: {profile.pile_stick_out} m</>}
            </div>
          </div>
          
        </div>
      </div>
      
      <div className="relative border-t">
        {profileSoils.map((soil, index) => {
          const isDefaultColour = soil.colour === "#000000"
          const isDark = getLuminance(soil.colour) < 0.5
          const textColor = isDark ? "text-white" : "text-black"
          
          const isLayerBeyondPile = soil.start_depth >= profile.effective_pile_length
          
          const isWaterInLayer = soil.start_depth <= profile.water_depth && profile.water_depth < soil.end_depth
          
          if (soil.id === lastLayer.id) {
            if (lastLayer.end_depth <= profile.effective_pile_length) {
              pileHeight = (index + 1) * 171.5
            } else {
              const portionOfLayer = (profile.effective_pile_length - soil.start_depth) / (soil.end_depth - soil.start_depth)
              pileHeight = (index * 171.5) + (portionOfLayer * 171.5)
            }
          }

          return (
            <div key={soil.id} className={`relative p-2 grid sm:grid-cols-[190px_50px_1fr] whitespace-nowrap ${isDefaultColour && index < profileSoils.length - 1 ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-[oklch(0.87_0.01_258)] dark:after:bg-[oklch(1_0_0_/_25%)]' : ''} ${isDefaultColour && index === 0 }`} style={{ backgroundColor: isDefaultColour ? "" : soil.colour}}>

              <div className={`flex flex-col space-y-2 text-sm leading-snug ${isDefaultColour ? 'text-foreground' : textColor}`}>
                {!isLayerBeyondPile && (
                  <>
                    <p><span className="font-semibold">Shaft Capacity:</span> {pileDiameter === "60" ? soil.shaft_capacity60 : soil.shaft_capacity100} kN</p>
                    {!hideBearingCapacity && (soil.id === lastLayer.id && (<p><span className="font-semibold">Bearing Capacity:</span> {bearingCapacity} kN</p>))}
                  </>
                )}
                <div className={`mt-auto text-xs ${isDefaultColour ? 'text-foreground/70' : textColor}`}><span className="font-semibold">Depth:</span> {soil.start_depth} – {soil.end_depth} m</div>
              </div>

              <div className="hidden sm:block"></div>
                
              <div className={`space-y-2 text-sm leading-snug @container ${isDefaultColour ? 'text-foreground' : textColor}`}>
                <p className="font-semibold uppercase">{soil.soil_name || soil.soil}</p>
                <p className="truncate" title={soil.description || "N/A"}>Description: {soil.description || "N/A"}</p>
                <p>SPT N-Value: {soil.test_type === "spt" ? soil.n_value : '—'}</p>
                <p>Moist Weight: {soil.y_moist} kN/m³</p>
                <p>Saturated Weight: {soil.y_sat} kN/m³</p>
                <p>{soil.soil_type === 'fine' ? 'Undrained Shear Strength:' : 'Shear Strength:'} {soil.soil_type === 'fine' ? soil.su : soil.t} kPa</p>
              </div>

              <div className={`absolute right-2 top-2 text-xs px-2 py-1 rounded-sm border ${isDefaultColour ? 'border-black dark:border-white' : isDark ? 'bg-black text-white border-white' : 'bg-white text-black border-black'}`}><span className="font-semibold">Layer No:</span> {index + 1}</div>

              {isWaterInLayer && (
                <div className={`absolute left-0 right-0 z-10 border-b-2 border-dashed ${isDefaultColour ? 'border-blue-400 dark:border-blue-800' :  isDark ? 'border-blue-400' : 'border-blue-800'}`} style={{ top: `${Math.max(42, Math.min(100, ((profile.water_depth - soil.start_depth) / (soil.end_depth - soil.start_depth)) * 100))}%`}}>
                  <div className={`absolute bottom-0.5 right-2 flex flex-row text-xs gap-2 ${isDefaultColour ? 'text-foreground' : textColor}`}>
                    <Triangle className={`text-muted-foreground rotate-180 size-4 ${isDefaultColour ? 'fill-blue-400 dark:fill-blue-800' : isDark ? 'fill-blue-400' : 'fill-blue-800'}`}/><span className="-ml-1 -mr-1">Water Table:</span>{profile.water_depth} m
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <>
          <div 
            className={`absolute top-0 z-20 ${pileDiameter === "60" ? 'block' : 'hidden'}`}
            style={{
              top: "-25px",
              left: "220px",
              transform: "translateX(-50%)",
              height: `${pileHeight + 25}px`,
              width: '30px',
              backgroundImage: 'url(/60mm-pile.png)',
              backgroundSize: '30px',
            }}
          />
          
          <div 
            className={`absolute top-0 z-20 ${pileDiameter === "100" ? 'block' : 'hidden'}`}
            style={{
              top: "-25px",
              left: "220px",
              transform: "translateX(-50%)",
              height: `${pileHeight + 25}px`,
              width: '40px',
              backgroundImage: 'url(/100mm-pile.png)',
              backgroundSize: '40px',
            }}
          />
        </>
      </div>
    </div>
  )
}