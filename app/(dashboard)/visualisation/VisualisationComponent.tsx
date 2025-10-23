"use client"
import { TconfigSoilProfileSchema, TvisualisationSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { TvisualisationSoilSchema } from "@/schemas/soilSchemas"
import { useState, useEffect } from "react" 
import { createClient } from "@/utils/supabase/client"
import { LineChart, Tooltip as RechartsTooltip, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
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
import { Skeleton } from "@/components/ui/skeleton"
import { modifySelections } from "./actions/modifySelections"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChromePicker } from "react-color"
import html2canvas from 'html2canvas-pro'
import { roundToTwoDecimals } from "@/lib/utils"

type ChartDataItem = {
  selection: TvisualisationSoilProfileSchema & { selection_name: string }
  soilsData: TvisualisationSoilSchema[]
}

type ChartDataPoint = {
  end_depth: number
  [key: string]: number
}

export function VisualisationComponent({ profilesData, selectionsData }: { profilesData: TconfigSoilProfileSchema[], selectionsData: TvisualisationSoilProfileSchema[] }) {
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
    let lastRun = 0
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const handleResize = () => {
      const now = Date.now()
      const remaining = 200 - (now - lastRun)

      if (remaining <= 0) {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        lastRun = now
        setWindowWidth(window.innerWidth)
      } 
      
      else if (!timeoutId) {
        timeoutId = setTimeout(() => {
          lastRun = Date.now()
          timeoutId = null
          setWindowWidth(window.innerWidth)
        }, remaining)
      }
    }

    handleResize()

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (timeoutId) {clearTimeout(timeoutId)}
    }
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

    const baseChartData = soilsData.reduce((accumulator, soil, index) => {
      const prevShaft = index === 0 ? 0 : accumulator[index - 1][shaftCapacityKey]
      const cumulativeShaft = prevShaft + soil[shaftCapacityKey]!
      
      accumulator.push({ 
        end_depth: soil.end_depth,
        [shaftCapacityKey]: cumulativeShaft
      })
      
      return accumulator
    }, [] as ChartDataPoint[])

    const lastBaseChartEntry = baseChartData[baseChartData.length - 1]
    if (!hideBearingCapacity) {lastBaseChartEntry[shaftCapacityKey] = lastBaseChartEntry[shaftCapacityKey] += bearingCapacity!}
    lastBaseChartEntry[shaftCapacityKey] = roundToTwoDecimals(lastBaseChartEntry[shaftCapacityKey])
    
    const interpolateCapacity = (targetDepth: number): number => {
      for (let i = 0; i < baseChartData.length; i++) {
        const currentLayer = baseChartData[i]
        
        const prevDepth = i === 0 ? 0 : baseChartData[i - 1].end_depth
        const prevCapacity = i === 0 ? 0 : baseChartData[i - 1][shaftCapacityKey]
        
        if (targetDepth <= currentLayer.end_depth) {
          const depthRange = currentLayer.end_depth - prevDepth
          const capacityRange = currentLayer[shaftCapacityKey] - prevCapacity
          const progress = (targetDepth - prevDepth) / depthRange
          
          return prevCapacity + (capacityRange * progress)
        }
      }
      
      return lastBaseChartEntry[shaftCapacityKey]
    }

    const createDenseChartData = () => {
      const denseData = []
      const step = 0.1 
      
      denseData.push({ end_depth: 0, [shaftCapacityKey]: 0 })

      const maxDepth = lastBaseChartEntry.end_depth

      let i = 1
      while (i * step < maxDepth) {
        const depth = roundToTwoDecimals(i * step)
        denseData.push({ end_depth: depth, [shaftCapacityKey]: roundToTwoDecimals(interpolateCapacity(depth)) })
        i++
      }

      denseData.push({ end_depth: roundToTwoDecimals(maxDepth), [shaftCapacityKey]: roundToTwoDecimals(interpolateCapacity(maxDepth)) })

      return denseData
    }
    
    const cumulativeData = createDenseChartData()

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

  //edit selection handlers
  const editSelections = () => {
    setSelectionsToDelete(new Set())
    setselectionsToEdit(new Map())
    setIsEditDialogOpen(true)
  }

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false)
    setSelectionsToDelete(new Set())
    setselectionsToEdit(new Map())
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

  const handleColorChange = (selectionId: string, color: string) => {
    const newEditedSelections = new Map(selectionsToEdit)
    const currentEdit = newEditedSelections.get(selectionId)
    newEditedSelections.set(selectionId, { ...currentEdit, colour: color })
    setselectionsToEdit(newEditedSelections)
  }

  const handleStrokeWidthChange = (selectionId: string, strokeWidth: number[]) => {
    const newEditedSelections = new Map(selectionsToEdit)
    const currentEdit = newEditedSelections.get(selectionId)
    newEditedSelections.set(selectionId, { ...currentEdit, stroke_width: strokeWidth[0] })
    setselectionsToEdit(newEditedSelections)
  }

  const handleSaveSelections = async () => {
    try {
      setIsSaving (true)
      const result = await modifySelections(Array.from(selectionsToDelete), Array.from(selectionsToEdit.entries()))
      if (result.errors) {
        toast.error(result.message)
      }

      else {
        setIsEditDialogOpen(false)
        toast.success(result.message)
      }

    } catch {
      toast.error("An unexpected error has occurred.", { description: "Please try again later." })

    } finally {
      setTimeout(() => setIsSaving(false), 150)
    }
  }
  //edit selection handlers

  const downloadChart = async () => {
    setActiveAction("download")
    
    try {
      const element = document.getElementById("VisualisationGraph")
      
      if (!element) {throw Error()}

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: resolvedTheme === "dark" ? "#11111a" : "#ffffff",
        logging: false, 
        x: -20,  
        y: -20,  
        width: element.offsetWidth + 40,  
        height: element.offsetHeight + 40, 
      })

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = "helical-pile-capacities-chart.png"
          
          document.body.appendChild(link)
          link.click()
          
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }, 'image/png', 1.0)

    } catch {
      toast.error("An unexpected error has occurred.", { description: "Please try again later." })

    } finally {
      setActiveAction(null)
    }
  }

  const handleReset = async () => {
    setActiveAction("reset")
    await resetSelections()
  }

  if (isFetchingData) {
    return (
      <div className="flex flex-col md:flex-row max-w-5xl mx-auto gap-5">
        <div className="flex-auto h-140 border-2 p-5 relative">
          <Skeleton className="h-4 w-auto mx-10"/>
          <Skeleton className="absolute inset-15"/>
          <Skeleton className="h-4 w-18 absolute left-2 top-1/2 -translate-y-1/2 -rotate-90"/>
          <Skeleton className="h-4 w-30 absolute left-1/2 -translate-x-1/2 bottom-5"/>  
        </div>

        <div className="shrink-0 border p-2 rounded-xl h-fit w-fit flex space-x-2 mx-auto md:mx-0 md:space-y-2 md:flex-col md:space-x-0">
          <Skeleton className="size-10.5 rounded-md" />
          <Skeleton className="size-10.5 rounded-md" />
          <Skeleton className="size-10.5 rounded-md" />
          <Skeleton className="size-10.5 rounded-md" />
        </div>
      </div>
    )
  }

  const isMediumScreen = windowWidth < 768
  return (
    <>
      <div className="flex flex-col md:flex-row max-w-5xl mx-auto gap-5">
        <div className="flex-auto h-110 sm:h-140 border-2 p-5" id="VisualisationGraph">
          <LineChart data={chartDisplayData} layout="vertical" responsive width="100%" height="100%" margin={{ top: 5, right: 20, left: -5, bottom: 15 }}>
            
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
              domain={['dataMin', 'dataMax']}
              type="number"
              label={{ fill: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)", value: 'Pile Depth (m)', angle: -91, position: 'insideLeft', offset: 15, fontSize: '0.875rem' }}
              tick={{ fontSize: '0.875rem', fill: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)" }}
              axisLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.92 0.00 49)" : "oklch(0.56 0.00 0)", strokeWidth: 2, strokeOpacity: 0.8}}
              tickLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)", strokeWidth: 0.5}}
            />

            <XAxis
              type="number"
              domain={['dataMin', 'dataMax']}
              label={{ fill: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)", value: 'Pile Capacity (kN)', position: 'insideBottom', offset: -10, fontSize: '0.875rem' }}
              tick={{ fontSize: '0.875rem', fill: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)" }}
              axisLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.92 0.00 49)" : "oklch(0.56 0.00 0)", strokeWidth: 2, strokeOpacity: 0.8}}
              tickLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)", strokeWidth: 0.5}}
            />
            
            {transformedChartData.map((item) => (
              <Line 
                key={item.selection.id}
                type={"linear"}
                dataKey={item.selection.id}
                stroke={item.selection.colour}
                strokeWidth={item.selection.stroke_width}
                animationDuration={1200}
                name={item.selection.selection_name}
                activeDot={{ r: 4 }}
                dot={false}
              />
            ))}

            <RechartsTooltip
              cursor={{ stroke: "oklch(0.55 0.04 257)", strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const { end_depth } = payload[0].payload
                return (
                  <div className="bg-secondary text-primary p-3 rounded border border-foreground/30 text-sm">
                    {payload.map((entry, idx) => (
                      <div key={idx} style={{ color: entry.color }}>
                        Pile Capacity: {entry.value.toFixed(2)} kN
                      </div>
                    ))}
                    <div className="mt-1 pt-1 border-t">
                      Pile Depth: {end_depth} m
                    </div>
                  </div>
                )
              }}
            />

            {chartDisplayData.length === 0 && (
              <text x="50%" y="50%" textAnchor="middle" fill={resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)"} className="text-xs sm:text-sm">
                {windowWidth >= 490 ? <tspan x="50%" dy="0">No soil layers detected</tspan> : <tspan x="60%" dy="1.2em">No soil layers detected.</tspan>}
                {windowWidth >= 490 && <tspan x="50%" dy="1.2em">Add soil layers in configuration to begin analysis.</tspan>}
              </text>
            )}
            
          </LineChart>
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
            <TooltipContent side={isMediumScreen ? "top" : "right"}>Toggle Pullout Only</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="w-10.5" onClick={downloadChart} disabled={!!activeAction || chartDisplayData.length === 0}>
                {activeAction === "download" ? <Loader2 className="animate-spin size-6 text-foreground/70"/> : <Download className="size-6 text-foreground/70" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isMediumScreen ? "top" : "right"}>Save as Image</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="w-10.5" onClick={editSelections} disabled={!!activeAction}>
                <SquarePen className="size-6 text-foreground/70"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isMediumScreen ? "top" : "right"}>Edit Selections</TooltipContent>
          </Tooltip>
    
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="w-10.5" onClick={handleReset} disabled={!!activeAction}> 
                {activeAction === "reset" ? <Loader2 className="animate-spin size-6 text-destructive"/> : <RotateCcw className="size-6 text-destructive"/>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isMediumScreen ? "top" : "right"}>Reset Selections</TooltipContent>
          </Tooltip>
        </div> 
      </div>

      <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Selections</AlertDialogTitle>
            <AlertDialogDescription>
              Modify your current selections line colour and width.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex flex-col gap-3 border p-3 max-h-86 overflow-y-auto -mt-1">
            {chartData.map(({ selection }) => {
              const isSelected = !selectionsToDelete.has(selection.id)
              const currentEdits = selectionsToEdit.get(selection.id) || {}
              const displayColor = currentEdits.colour || selection.colour
              const displayStrokeWidth = currentEdits.stroke_width || selection.stroke_width
              return (
                <div key={selection.id} className="space-y-3 p-3 border rounded-md">
                  
                  <div className="flex items-center gap-2">
                    <Checkbox id={selection.id} checked={isSelected} onCheckedChange={(checked: boolean) => handleCheckboxToggle(selection.id, checked)}/>
                    <Label htmlFor={selection.id}>{selection.selection_name}</Label>
                  </div>
                  
                  {isSelected && (
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="color-picker" className="text-muted-foreground">Line Colour:</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button id="color-picker" variant="outline" className="size-6 p-0 rounded-full" style={{ backgroundColor: displayColor }}></Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 w-auto rounded-sm" align="center" side="right">
                            <ChromePicker color={displayColor} onChangeComplete={(color) => handleColorChange(selection.id, color.hex)} className="text-black" disableAlpha={true}/>
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-muted-foreground text-sm">Line Width:</span>
                        <Slider  value={[displayStrokeWidth]} onValueChange={(value) => handleStrokeWidthChange(selection.id, value)} max={10} min={1} step={1} className="flex-1 max-w-[66%]"/>
                        <span className="text-sm text-muted-foreground">{displayStrokeWidth}</span>
                      </div>
                    </div>
                  )}

                </div>
              )
            })}
          </div>

          <div className="text-sm text-destructive -mt-1 ml-1">
            {selectionsToDelete.size} selection(s) will be deleted
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelEdit} disabled={isSaving}>Cancel</AlertDialogCancel>
            <Button disabled={isSaving  || (selectionsToDelete.size === 0  && selectionsToEdit.size === 0)} onClick={handleSaveSelections} className="sm:w-25">
              {isSaving ? <><Loader2 className="animate-spin size-4"/>Saving...</> : "Save"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}