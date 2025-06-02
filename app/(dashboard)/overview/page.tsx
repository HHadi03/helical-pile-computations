import { getSoils } from "@/lib/getSoils"
import { getProfiles } from "@/lib/getProfiles"
import { getLuminance } from "@/lib/getLuminance"
import { ArrowUp, ArrowDown, FolderOpen, ArrowBigRight} from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import SoilDepthChart from "../visulisation/graph"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Overview | Helical Pile Computations",
  description: "Summary of your soil profiles and pile settings",
}

export default async function OverviewPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  const profilesData = await getProfiles()
  const soilsData = await getSoils()

  if (profilesData.length === 0) {
    return (
      <div className="h-full bg-[#F4F3F2] flex items-center justify-center border-2 border-black px-5">
        <div className="text-center">
          <span className="flex justify-center mb-2"><FolderOpen className="size-10"/></span>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Soil Profiles Found</h3>
          <p className="text-gray-600 mb-4">Head to the configuration page to add your first soil profile</p>
          <Link href="/configuration" prefetch={true} scroll={false}>
            <Button className="w-80 rounded-lg text-white shadow-md hover:shadow-xl"><ArrowBigRight className="size-6!"/>Go to Configuration</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400
     scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">

      <div className="space-y-12 p-6">
        {profilesData.map((profile, index) => {
          let newPileLength: number
          if (profile.pileStickOut > profile.pileLength) {
            newPileLength = 0
          } else {
            newPileLength = profile.pileLength - profile.pileStickOut
          }

          const profileSoils = soilsData.filter((soil) => soil.soilProfileId === profile.id)

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

          const relevantSoils = profileSoils.filter(soil => soil.startDepth < newPileLength)
          const lastLayer = relevantSoils.find(soil => newPileLength <= soil.endDepth)

          const hasCapacityCalculations = relevantSoils.some(soil => soil.shaftCapacity60|| soil.bearingCapacity60)
          const ultimatePulloutCapacity = relevantSoils.reduce((sum, soil) => sum + (soil.shaftCapacity60 ?? 0), 0)
          const bearingCapacity = lastLayer?.bearingCapacity60 ?? 0
          const ultimateBearingCapacity = ultimatePulloutCapacity + bearingCapacity

          return (
            <div key={profile.id} className="border-2 border-gray-300 rounded-lg p-4">
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

              {/* Responsive flex container for graph and soil visualization */}
              <div className="flex flex-col xl:flex-row gap-6">
                
                {/* Soil layers visualization */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    {profileSoils.map((soil, index) => {
                      const isWaterInLayer = soil.startDepth <= profile.waterDepth && profile.waterDepth <= soil.endDepth
                      const isLayerBeyondPile = soil.startDepth >= newPileLength
                      const isBottomLayer = soil.startDepth < newPileLength && soil.endDepth >= newPileLength

                      const backgroundColor = soil.color
                      const isDark = getLuminance(backgroundColor) < 0.5
                      const textColor = isDark ? "text-white" : "text-black"

                      return (
                        <div key={soil.id || index}>
                          <div className={`relative border-x-2 border-b-2 border-stone-500 ${index === 0 ? 'border-t-2' : ''} py-4`}
                            style={{ backgroundColor, width: "100%" }}>

                            <div
                              className={`absolute z-10 right-4 top-0 px-2 py-1 mt-4 shadow text-sm font-semibold 
                              ${isDark ? "text-white bg-gray-700" : "text-black bg-white"}`}>
                              {soil.h!.toFixed(1)} m
                            </div>

                            {isWaterInLayer && (
                              <div className="absolute left-0 right-0 z-10 top-1/2">
                                <div className="w-full border-b-2 border-blue-400 border-dashed"></div>
                                <div className="pl-2 pb-1 absolute bottom-0 flex items-center text-blue-600"> 
                                  <span className="font-semibold"> ▽ Water Table: {profile.waterDepth.toFixed(1)} m</span>
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
                          </div>
                        </div>
                      )
                    })}

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
                </div>

                {/* Graph component */}
                <div className="flex-1 min-w-0">
                  <SoilDepthChart profileSoils={profileSoils} />
                </div>

              </div>
            </div>
          )
        })}
      </div>

    </main>
  )
}