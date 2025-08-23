import { ToverviewSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { ToverviewSoilSchema } from "@/schemas/soilSchemas"
import { Triangle, MoveLeft } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

function getLuminance (color: string) {
  const hex = color.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export function SoilDiagram ({ profileSoils, profile, profileIndex, pileDiameter, hideBearingCapacity, windowWidth}: { profileSoils: ToverviewSoilSchema[], profile: ToverviewSoilProfileSchema, profileIndex: number, pileDiameter: number, hideBearingCapacity: boolean, windowWidth?: number }) {

  const needsHorizontalScroll = windowWidth != undefined && windowWidth < 760
  
  if (profileSoils.length === 0) {
    return (
      <ScrollArea className="overflow-x-auto overflow-y-clip grid grid-cols-1 border-2">
        <div className="p-2 bg-sky-50 dark:bg-sky-900/50 whitespace-nowrap"> 
          <h1 className="text-base font-semibold mb-2">{profile.profile_name || `Soil Profile ${profileIndex + 1}`}</h1>
          <p className="text-sm text-muted-foreground">No soil layers detected, add soil layers in configuration to begin analysis.</p>
        </div>
        <ScrollBar orientation="horizontal" className="h-2"/>
      </ScrollArea>
    )
  }

  const ultimatePulloutCapacity = pileDiameter === 60 ? profileSoils.reduce((sum, soil) => sum + soil.shaft_capacity60, 0) : profileSoils.reduce((sum, soil) => sum + soil.shaft_capacity100, 0)
  
  const lastLayer = profileSoils.find(soil => soil.start_depth <= profile.effective_pile_length && profile.effective_pile_length <= soil.end_depth) || profileSoils[profileSoils.length - 1]

  const bearingCapacity = pileDiameter === 60 ? lastLayer.bearing_capacity60 : lastLayer.bearing_capacity100

  const ultimateBearingCapacity = ultimatePulloutCapacity + bearingCapacity

  let pileHeight = 0
  return (
    <ScrollArea id="SoilDiagram" className={`overflow-x-auto overflow-y-clip grid grid-cols-1 ${needsHorizontalScroll ? 'border' : ''}`}>
      <div className="min-w-[634px]">
        
        <div className={`p-2 bg-sky-50 dark:bg-sky-900/50 relative whitespace-nowrap ${needsHorizontalScroll ? '' : 'border-2'}`}> 
          <div className="flex justify-between">
            
            <div className="flex flex-col">
              <h1 className="text-base font-semibold">{profile.profile_name || `Soil Profile ${profileIndex + 1}`}</h1>
              <p className="text-sm mt-auto text-muted-foreground">Pile Diameter: {pileDiameter} mm</p>
            </div>
          
            <div className="text-right text-sm">
              <p><span className="font-semibold">Effective Pile Length:</span> {profile.effective_pile_length} m</p>
              <p><span className="font-semibold">Ultimate Pullout Capacity:</span> {ultimatePulloutCapacity.toFixed(2)} kN</p> 
              {!hideBearingCapacity && (
                <p><span className="font-semibold">Ultimate Bearing Capacity:</span> {ultimateBearingCapacity.toFixed(2)} kN</p>
              )}
            </div>

            <div className="absolute bottom-3 left-[253px]">
              <div className="flex flex-row text-xs gap-2">
                <MoveLeft className="size-4"/><span className="font-semibold -ml-1 -mr-1">Stickout: </span> {profile.pile_stick_out} m
              </div>
            </div>
            
          </div>
        </div>
        
        <div className={`relative ${needsHorizontalScroll ? '' : 'border-b border-x'}`}>
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
                const portionOfLayer = (profile.effective_pile_length - soil.start_depth) / soil.h
                pileHeight = (index * 171.5) + (portionOfLayer * 171.5)
              }
            }

            return (
              <div key={soil.id} className={`relative p-2 grid grid-cols-[190px_60px_1fr] whitespace-nowrap ${isDefaultColour && index < profileSoils.length - 1 ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-[oklch(0.87_0.01_258)] dark:after:bg-[oklch(1_0_0_/_25%)]' : ''} ${isDefaultColour && index === 0 && needsHorizontalScroll ? 'before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-[oklch(0.87_0.01_258)] dark:before:bg-[oklch(1_0_0_/_25%)]' : ''}`} style={{ backgroundColor: isDefaultColour ? "" : soil.colour}}>

                <div className={`flex flex-col space-y-2 text-sm leading-snug ${isDefaultColour ? 'text-foreground' : textColor}`}>
                  {!isLayerBeyondPile && (
                    <>
                      <p><span className="font-semibold">Shaft Capacity:</span> {pileDiameter === 60 ? soil.shaft_capacity60 : soil.shaft_capacity100} kN</p>
                      {!hideBearingCapacity && (
                        soil.id === lastLayer.id && (<p><span className="font-semibold">Bearing Capacity:</span> {bearingCapacity} kN</p>)
                      )}
                    </>
                  )}
                  <div className={`mt-auto text-xs ${isDefaultColour ? 'text-foreground/70' : textColor}`}><span className="font-semibold">Depth:</span> {soil.start_depth} – {soil.end_depth} m</div>
                </div>

                <div></div>
                  
                <div className={`space-y-2 text-sm leading-snug @container ${isDefaultColour ? 'text-foreground' : textColor}`}>
                  <p className="font-semibold">{soil.soil_name || soil.soil}</p>
                  <p><span className="font-semibold">SPT N-Value:</span> {soil.n_value}</p>
                  <p><span className="font-semibold">Moist Unit Weight:</span> {soil.y_moist} kN/m³</p>
                  <p><span className="font-semibold">Sat Unit Weight:</span> {soil.y_sat} kN/m³</p>
                  <p><span className="font-semibold">{soil.soil_type === 'fine' ? 'Undrained Shear Strength:' : 'Shear Strength:'}</span> {soil.soil_type === 'fine' ? soil.su : soil.t} kPa</p>
                  <p className="truncate"><span className="font-semibold">Description:</span> {soil.description || "N/A"}</p>
                </div>

                <div className={`absolute right-2 top-2 text-xs px-2 py-1 rounded-sm border ${isDefaultColour ? 'border-black dark:border-white' : isDark ? 'bg-black text-white border-white' : 'bg-white text-black border-black'}`}><span className="font-semibold">Layer No:</span> {index + 1}</div>

                {isWaterInLayer && (
                  <div className={`absolute left-0 right-0 z-10 border-b-2 border-dashed ${isDefaultColour ? 'border-blue-400 dark:border-blue-800' :  isDark ? 'border-blue-400' : 'border-blue-800'}`} style={{ top: `${Math.max(33, Math.min(100, ((profile.water_depth - soil.start_depth) / (soil.end_depth - soil.start_depth)) * 94))}%`}}>
                    <div className={`absolute bottom-0.5 right-2 flex flex-row text-xs gap-2 ${isDefaultColour ? 'text-foreground' : textColor}`}>
                      <Triangle className={`text-muted-foreground rotate-180 size-4 ${isDefaultColour ? 'fill-blue-400 dark:fill-blue-800' : isDark ? 'fill-blue-400' : 'fill-blue-800'}`}/><span className="-ml-1 -mr-1 font-semibold">Water Table:</span>{profile.water_depth} m
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <div 
            className="absolute top-0 z-20 transition-all duration-300 ease-in-out"
            style={{
              top: "-25px",
              left: "225px",
              transform: "translateX(-50%)",
              height: `${pileHeight + 25}px`,
              width: `${pileDiameter === 60 ? '40px' : '50px'}`, 
              backgroundImage: `url(/${pileDiameter}mm-pile.png)`,
              backgroundSize: `${pileDiameter === 60 ? '40px auto' : '50px auto'}`,
            }}
          />
        </div>
        
      </div>
      <ScrollBar orientation="horizontal" className="h-2"/>
    </ScrollArea>
  )
}