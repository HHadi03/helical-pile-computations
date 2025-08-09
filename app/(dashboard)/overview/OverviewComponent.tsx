"use client"

import { useState, useEffect } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Toggle } from "@/components/ui/toggle"
import { SoilDiagram } from "./SoilDiagram"
import { ToverviewSoilSchema } from "@/schemas/soilSchemas"
import { ToverviewSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { SoilGraph } from "./SoilGraph"
import { ChartLine, CircleSlash2 } from "lucide-react"
import { type CarouselApi } from "@/components/ui/carousel"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function OverviewComponent({ soilsData, profilesData}: { soilsData: ToverviewSoilSchema[], profilesData: ToverviewSoilProfileSchema[] }) {
  const [showGraph, setShowGraph] = useState(false)
  const [pileDiameter, setPileDiameter] = useState<60 | 100>(100)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }
 
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  const soilsByProfile = Object.groupBy(soilsData, soil => soil.soil_profile_id)
  return (
    <>
      <div className="flex mx-auto justify-between max-w-3xl mb-2">
        
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Toggle variant="outline" pressed={pileDiameter === 60} onPressedChange={(pressed) => setPileDiameter(pressed ? 60 : 100)} aria-label="Toggle pile diameter" className="w-10.5">
                  <CircleSlash2 className="size-5 text-foreground/70"/>
                </Toggle>
              </div>
            </TooltipTrigger>
            <TooltipContent>Toggle Pile Diameter</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Toggle variant="outline" pressed={showGraph} onPressedChange={setShowGraph} aria-label="Toggle view type" className="w-10.5">
                  <ChartLine className="size-6 text-foreground/70"/> 
                </Toggle>
              </div>
            </TooltipTrigger>
            <TooltipContent>{showGraph ? "Toggle Diagram Overview" : "Toggle Graph Overview"}</TooltipContent>
          </Tooltip>
        </div>
        
        <div className="text-muted-foreground text-sm flex items-end mr-1">Soil Profile {current} of {count}</div>
      </div>
      
      <Carousel className="max-w-3xl mx-auto" setApi={setApi}>
        <CarouselContent>
          {profilesData.map((profile, index) => {
            const profileSoils = soilsByProfile[profile.id] || []
            return (
              <CarouselItem key={profile.id}>
                {showGraph ? (<SoilGraph profileSoils={profileSoils} pileLength={profile.effective_pile_length} pileDiameter={pileDiameter} profileIndex={index} profileName={profile.profile_name} />)
                : (<SoilDiagram profile={profile} profileSoils={profileSoils} profileIndex={index} pileDiameter={pileDiameter}/>)}
              </CarouselItem>
            )
          })} 
        </CarouselContent>
        <CarouselPrevious/>
        <CarouselNext/>
      </Carousel>
    </>
  )
}

