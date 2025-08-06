"use client"

import { useState } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Toggle } from "@/components/ui/toggle"
import { SoilDiagram } from "./SoilDiagram"
import { ToverviewSoilSchema } from "@/schemas/soilSchemas"
import { ToverviewSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { SoilGraph } from "./SoilGraph"
import { ChartArea, RectangleVertical } from "lucide-react"

export function OverviewComponent({ soilsData, profilesData}: { soilsData: ToverviewSoilSchema[], profilesData: ToverviewSoilProfileSchema[] }) {
  const [showGraph, setShowGraph] = useState(false)
  const [pileDiameter, setPileDiameter] = useState<60 | 100>(100)
  
  const soilsByProfile = Object.groupBy(soilsData, soil => soil.soil_profile_id)
  return (
    <>
      <div className="flex mb-2 gap-2 mx-auto justify-end max-w-3xl">
        <Toggle variant="outline" pressed={showGraph} onPressedChange={setShowGraph} aria-label="Toggle view type" className="w-36">
          <ChartArea className="size-4 text-muted-foreground"/> View Graph
        </Toggle>

        <Toggle variant="outline" pressed={pileDiameter === 60} onPressedChange={(pressed) => setPileDiameter(pressed ? 60 : 100)} aria-label="Toggle pile diameter" className="w-36">
          <RectangleVertical className="size-4 text-muted-foreground"/> 60mm Pile
        </Toggle>
      </div>
      
      <Carousel className="max-w-3xl mx-auto">
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

