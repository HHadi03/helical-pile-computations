"use client"
import { TconfigSoilProfileSchema, TselectionsSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { TvisualisationSoilSchema } from "@/schemas/soilSchemas"
import { useState, useEffect } from "react" 
import { createClient } from "@/utils/supabase/client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { useTheme } from "next-themes"
import { Toggle } from "@/components/ui/toggle"
import { MoveUp, Download, RotateCcw, SquarePen, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { resetSelections } from "./actions/resetSelections"
import { toast } from "sonner"


type ChartDataItem = {
  selection: TselectionsSoilProfileSchema & { selection_name: string }
  soilsData: TvisualisationSoilSchema[]
}

type ChartDataPoint = {
  end_depth: number
  [key: string]: number
}

export function VisualisationComponent({ profilesData, selectionsData }: { profilesData: TconfigSoilProfileSchema[], selectionsData: TselectionsSoilProfileSchema[] }) {
  const [isFetchingData, setIsFetchingData] = useState(false)
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [hideBearingCapacity, setHideBearingCapacity] = useState(false)
  const [activeAction, setActiveAction] = useState<null | "reset" | "download">(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectionsToDelete, setSelectionsToDelete] = useState<Set<string>>(new Set())
  const [selectionsToEdit, setselectionsToEdit] = useState<Map<string, { colour?: string, stroke_width?: number }>>(new Map())
  const [isSaving, setIsSaving] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const { resolvedTheme } = useTheme()
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  useEffect(() => {
    const fetchSoilsData = async () => {
      setIsFetchingData(true)
      
      try {
        const result = await Promise.all (selectionsData.map(async (selection) => {
          const profileIndex = profilesData.findIndex((profile) => profile.id === selection.soil_profile_id)
          const profile = profilesData[profileIndex]
          const selectFields = selection.pile_diameter === 60 ? "end_depth, shaft_capacity60, bearing_capacity60" : "end_depth, shaft_capacity100, bearing_capacity100"
          const capacityField = selection.pile_diameter === 60 ? "shaft_capacity60" : "shaft_capacity100"
          
          const supabase = createClient()
          const { data, error } = await supabase
          .from("soils")
          .select(selectFields)
          .order("end_depth", { ascending: true })
          .eq("soil_profile_id", profile.id)
          .gt(capacityField, 0)
          
          if (error) {
            return {
              selection: {...selection, selection_name: profile.profile_name ? `${profile.profile_name} - (${selection.pile_diameter} mm)` : `Soil Profile ${profileIndex + 1} - (${selection.pile_diameter} mm)`},
              soilsData: [],
            }
          }

          return {
            selection: {...selection, selection_name: profile.profile_name ? `${profile.profile_name} - (${selection.pile_diameter} mm)` : `Soil Profile ${profileIndex + 1} - (${selection.pile_diameter} mm)`},
            soilsData: data,
          }
        }))
        
        setChartData(result)
      }

      catch {
        setChartData([])
      }
       
      finally {
        setIsFetchingData(false)
      }
    }

    fetchSoilsData()
  }, [profilesData, selectionsData])

  const transformedChartData = chartData.map(({ selection, soilsData }) => {
    
    if (soilsData.length === 0) {
      return { 
        selection,
        soilsData:[]
      }
    }
    
    const shaftCapacityKey = selection.pile_diameter === 60 ? 'shaft_capacity60' : 'shaft_capacity100'
    const bearingCapacity = selection.pile_diameter === 60 ? soilsData[soilsData.length - 1].bearing_capacity60 : soilsData[soilsData.length - 1].bearing_capacity100

    const cumulativeData = soilsData.reduce((accumulator, soil, index) => {
      const prevShaft = index === 0 ? 0 : accumulator[index - 1][shaftCapacityKey]
      const cumulativeShaft = prevShaft + soil[shaftCapacityKey]!
      
      accumulator.push({ 
        end_depth: soil.end_depth,
        [shaftCapacityKey]: cumulativeShaft
      })
      
      return accumulator
    }, [] as ChartDataPoint[])

    const lastCumulativeDataSoil = cumulativeData[cumulativeData.length - 1]

    if (!hideBearingCapacity) {
      lastCumulativeDataSoil[shaftCapacityKey] = lastCumulativeDataSoil[shaftCapacityKey]! += bearingCapacity!
    }

    lastCumulativeDataSoil[shaftCapacityKey] = Math.round(lastCumulativeDataSoil[shaftCapacityKey] * 100) / 100
    
    cumulativeData.unshift({ end_depth: 0, [shaftCapacityKey]: 0 })

    return {
      selection,
      soilsData: cumulativeData
    }
  })

  const chartDisplayData = (() => {
    const allDepths = new Set<number>()
    
    transformedChartData.forEach(({ soilsData }) => {
      soilsData.forEach(soil => {allDepths.add(soil.end_depth)})
    })
    
    return Array.from(allDepths).sort((a, b) => a - b).map(depth => {
      const dataPoint: ChartDataPoint = { end_depth: depth }
      
      transformedChartData.forEach(({ selection, soilsData }) => {
        const soilAtDepth = soilsData.find(soil => soil.end_depth === depth)
        if (soilAtDepth) {
          const shaftCapacityKey = selection.pile_diameter === 60 ? 'shaft_capacity60' : 'shaft_capacity100'
          dataPoint[selection.id] = soilAtDepth[shaftCapacityKey]
        }
      })
      
      return dataPoint
    })
  })()

  const handleReset = async () => {
    setActiveAction("reset")
    await resetSelections()
  }

  const editSelections = async () => {
    setSelectionsToDelete(new Set())
    setselectionsToEdit(new Map())
    setIsEditDialogOpen(true)
  }

  const handleCheckboxToggle = (key: string, checked: boolean) => {
    const newSelectionsToDelete = new Set(selectionsToDelete)
    if (checked) {
      newSelectionsToDelete.delete(key)
    } else {
      newSelectionsToDelete.add(key)
    }
    setSelectionsToDelete(newSelectionsToDelete)
  }

 

  const handleSaveSelections = async () => {
    
    try {
      setIsSaving (true)
      console.log('Selections to delete:', Array.from(selectionsToDelete))
      console.log('Selections to update:', Array.from(selectionsToEdit.entries()))
      // const result = await editSelections(Array.from(selectionsToDelete, selectionsToEdit))
      // if (result.errors) {
      //   toast.error(result.message)
      // }

      // else {
      //   setIsEditDialogOpen(false)
      //   toast.success(result.message)
      // }

    } catch {
      toast.error("An unexpected error has occurred.", { description: "Please try again later." })

    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false)
    setSelectionsToDelete(new Set())
    setselectionsToEdit(new Map())
  }

  const downloadChart = async () => {
    setActiveAction("download")
    await new Promise(r => setTimeout(r, 1500))
    setActiveAction(null)
  }

  const handleHover = () => {
    console.log("DOT HOVERED")
  }

  if (isFetchingData) {
    return (
      <p>Loading</p>
    )
  }

  if (chartDisplayData.length === 0) {
    return (
      <p>No soil data</p>
    )
  }

  const isMd = windowWidth < 768
  return (
    <>
      <div className="flex flex-col md:flex-row max-w-5xl mx-auto gap-5">
        <div className="flex-auto h-140 border-2 p-5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartDisplayData} layout="vertical" margin={{ top: 5, right: 20, left: -5, bottom: 15 }}>
              
              <CartesianGrid 
                strokeDasharray="3 3"
                stroke={resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)"}
                strokeOpacity={0.5}
              />
              
              <Legend 
                verticalAlign="top"
                align="left"
                layout="horizontal"
                wrapperStyle={{ fontSize: '0.875rem', paddingBottom: '10px', marginLeft: "55px" , paddingRight:"15px" }}
              />

              <YAxis
                dataKey="end_depth" 
                domain={[0, 'dataMax']}
                type="number"
                label={{ fill: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)", value: 'Depth / m', angle: -90, position: 'insideLeft', offset: 20, fontSize: '0.875rem' }}
                tick={{ fontSize: '0.875rem', fill: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)" }}
                axisLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.92 0.00 49)" : "oklch(0.56 0.00 0)", strokeWidth: 2, strokeOpacity: 0.8}}
                tickLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)", strokeWidth: 0.5}}
              />

              <XAxis
                type="number"
                domain={[0, 'dataMax']}
                label={{ fill: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)", value: 'Capacity / kN', position: 'insideBottom', offset: -10, fontSize: '0.875rem' }}
                tick={{ fontSize: '0.875rem', fill: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)" }}
                axisLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.92 0.00 49)" : "oklch(0.56 0.00 0)", strokeWidth: 2, strokeOpacity: 0.8}}
                tickLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)", strokeWidth: 0.5}}
              />
              
              {transformedChartData.map((item) => (
                <Line 
                  key={item.selection.id}
                  type={"monotone"}
                  dataKey={item.selection.id}
                  stroke={item.selection.colour}
                  strokeWidth={item.selection.stroke_width ?? 2}
                  animationDuration={1000}
                  name={item.selection.selection_name}
                  activeDot={{r: 6, onMouseOver: handleHover }}
                />
              ))}
              
            </LineChart>
          </ResponsiveContainer>
        </div>
      
        <div className="shrink-0 border p-2 rounded-xl h-fit w-fit flex space-x-2 mx-auto md:mx-0 md:space-y-2 md:flex-col md:space-x-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={!!activeAction ? "pointer-events-none" : ""}>
                <Toggle variant="outline" pressed={hideBearingCapacity} onPressedChange={setHideBearingCapacity} aria-label="hide bearing capacity" className="w-10.5" disabled={!!activeAction}>
                  <MoveUp className="size-6 text-foreground/70"/>
                </Toggle>
              </div>
            </TooltipTrigger>
            <TooltipContent side={isMd ? "top" : "right"}>Toggle Pullout Only</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="w-10.5" onClick={downloadChart} disabled={!!activeAction}>
                {activeAction === "download" ? <Loader2 className="animate-spin size-6 text-foreground/70"/> : <Download className="size-6 text-foreground/70" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isMd ? "top" : "right"}>Save as Image</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="w-10.5" onClick={editSelections} disabled={!!activeAction}>
                <SquarePen className="size-6 text-foreground/70"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isMd ? "top" : "right"}>Edit Selections</TooltipContent>
          </Tooltip>
    
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="w-10.5" onClick={handleReset} disabled={!!activeAction}> 
                {activeAction === "reset" ? <Loader2 className="animate-spin size-6 text-destructive"/> : <RotateCcw className="size-6 text-destructive"/>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isMd ? "top" : "right"}>Reset Selections</TooltipContent>
          </Tooltip>
        </div> 
      </div>

      <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Visualisation Selections</AlertDialogTitle>
            <AlertDialogDescription>
              Modify your current selections, colours, and stroke widths.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex flex-col gap-3 border p-3 max-h-86 overflow-y-auto -mt-1">
            {chartData.map(({ selection }) => {
              const isSelected = !selectionsToDelete.has(selection.id)
              return (
                <div key={selection.id} className="space-y-3 p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    <Checkbox id={selection.id} checked={isSelected} onCheckedChange={(checked: boolean) => handleCheckboxToggle(selection.id, checked)}/>
                    <Label htmlFor={selection.id}>{selection.selection_name}</Label>
                  </div>
                  
                </div>
              )
            })}
          </div>

          <div className="text-sm text-destructive -mt-1 ml-1">
            {selectionsToDelete.size} selection(s) will be deleted
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelEdit} disabled={isSaving}>Cancel</AlertDialogCancel>
            <Button disabled={isSaving} onClick={handleSaveSelections} className="sm:w-22">
              {isSaving ? <><Loader2 className="animate-spin size-4"/>Saving...</> : "Save"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}