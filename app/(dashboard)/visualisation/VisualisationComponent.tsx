"use client"
import { TconfigSoilProfileSchema, TselectionsSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { TvisualisationSoilSchema } from "@/schemas/soilSchemas"
import { useState, useEffect } from "react" 
import { getSoils } from "./actions/getSoils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { useTheme } from "next-themes"
import { Toggle } from "@/components/ui/toggle"
import { MoveUp, Download, RotateCcw, SquarePen } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from "@/components/ui/button"
import { resetSelections } from "./actions/resetSelections"

type ChartDataItem = {
  selection: TselectionsSoilProfileSchema & { selection_name?: string }
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
          const soilsData = await getSoils(profile.id, selection.pile_diameter)
          
          return {
            selection: {...selection, selection_name: profile.profile_name ? `${profile.profile_name} - (${selection.pile_diameter} mm)` : `Soil Profile ${profileIndex + 1} - (${selection.pile_diameter} mm)`},
            soilsData
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

  const transformedChartData = chartData.map((item) => {
    const { selection, soilsData } = item
    
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
    
    transformedChartData.forEach((item) => {
      item.soilsData.forEach(soil => {allDepths.add(soil.end_depth)})
    })
    
    return Array.from(allDepths).sort((a, b) => a - b).map(depth => {
      const dataPoint: ChartDataPoint = { end_depth: depth }
      
      transformedChartData.forEach(item => {
        const soilAtDepth = item.soilsData.find(soil => soil.end_depth === depth)
        if (soilAtDepth) {
          const shaftCapacityKey = item.selection.pile_diameter === 60 ? 'shaft_capacity60' : 'shaft_capacity100'
          dataPoint[item.selection.id] = soilAtDepth[shaftCapacityKey]
        }
      })
      
      return dataPoint
    })
  })()

  const handleReset = async () => {
    await resetSelections()
  }

  const handleClick = () => {
    console.log("LINE CLICKED")
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

            {/* <Tooltip
              wrapperStyle={{ fontSize: '0.875rem' }}
              cursor={{ stroke: "oklch(0.55 0.04 257)", strokeWidth: 1 }}
              itemStyle={{ color: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)" }}
              labelStyle={{ color: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)" }}
              contentStyle={{ backgroundColor: resolvedTheme === 'dark' ? "oklch(0.278 0.033 256.848)" : "oklch(0.967 0.003 264.542)", borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.15)',}}
              labelFormatter={(label) => `Depth: ${label} m`}
              formatter={(value, name) => [`${Number(value).toFixed(2)} kN`, `${name} Total Capacity`]}
            /> */}

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
                onClick={handleClick}
                className="clickable-line"
              />
            ))}
            
          </LineChart>
        </ResponsiveContainer>
      </div>
    
      <div className="shrink-0 border p-2 rounded-xl h-fit w-fit flex space-x-2 mx-auto md:mx-0 md:space-y-2 md:flex-col md:space-x-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Toggle variant="outline" pressed={hideBearingCapacity} onPressedChange={setHideBearingCapacity} aria-label="hide bearing capacity" className="w-10.5">
                <MoveUp className="size-6 text-foreground/70"/>
              </Toggle>
            </div>
          </TooltipTrigger>
          <TooltipContent side={isMd ? "top" : "right"}>Toggle Pullout Only</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="w-10.5">
              <Download className="size-6 text-foreground/70" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isMd ? "top" : "right"}>Save as Image</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="w-10.5">
              <SquarePen className="size-6 text-foreground/70"/>
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isMd ? "top" : "right"}>Edit Selections</TooltipContent>
        </Tooltip>
  
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="w-10.5" onClick={handleReset}> 
              <RotateCcw className="size-6 text-destructive"/>
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isMd ? "top" : "right"}>Reset Selections</TooltipContent>
        </Tooltip>
      </div> 
    </div>
  )
}