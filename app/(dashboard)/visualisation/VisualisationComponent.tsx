"use client"
import { TconfigSoilProfileSchema, TselectionsSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { TvisualisationSoilSchema } from "@/schemas/soilSchemas"
import { useState, useEffect } from "react" 
import { getSoils } from "./actions/getSoils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useTheme } from "next-themes"

type ChartDataItem = {
  selection: TselectionsSoilProfileSchema & { selection_name?: string }
  soilsData: TvisualisationSoilSchema[]
}

type TransformedSoilData = {
  end_depth: number
  shaft_capacity60?: number
  shaft_capacity100?: number
}

interface ChartDataPoint {
  end_depth: number
  [selectionId: string]: number | undefined
}

export function VisualisationComponent({ profilesData, selectionsData }: { profilesData: TconfigSoilProfileSchema[], selectionsData: TselectionsSoilProfileSchema[] }) {
  const [isFetchingData, setIsFetchingData] = useState(false)
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const { resolvedTheme } = useTheme()
  const showPulloutOnly = false

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

  const transformedChartData = chartData.map(item => {
    const { selection, soilsData } = item
    
    if (soilsData.length === 0) {
      return { 
        selection,
        soilsData:[]
      }
    }
    
    const shaftCapacityKey = selection.pile_diameter === 60 ? 'shaft_capacity60' : 'shaft_capacity100'
    const bearingCapacity = selection.pile_diameter === 60 ? soilsData[soilsData.length - 1].bearing_capacity60 : soilsData[soilsData.length - 1].bearing_capacity100

    const cumulativeData = soilsData.reduce((accumulator: TransformedSoilData[], soil, index) => {
      const prevShaft = index === 0 ? 0 : accumulator[index - 1][shaftCapacityKey]!
      const cumulativeShaft = prevShaft + (soil[shaftCapacityKey] || 0)
      
      accumulator.push({ 
        end_depth: soil.end_depth,
        [shaftCapacityKey]: cumulativeShaft
      })
      
      return accumulator
    }, [])

    const lastCumulativeDataSoil = cumulativeData[cumulativeData.length - 1]

    if (!showPulloutOnly) {
      lastCumulativeDataSoil[shaftCapacityKey] = lastCumulativeDataSoil[shaftCapacityKey]! += bearingCapacity!
    }

    lastCumulativeDataSoil[shaftCapacityKey] = Math.round(lastCumulativeDataSoil[shaftCapacityKey]! * 100) / 100
    
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
  
  return (
    <ResponsiveContainer width="100%" height="75%" className={"max-w-5xl mx-auto"}>
      <LineChart data={chartDisplayData} layout="vertical"  margin={{ top: 15, right: 40, left: 0, bottom: 30 }}>
        
        <CartesianGrid 
          strokeDasharray="3 3" stroke={resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)"} strokeOpacity={0.5}
        />
        
        <Legend 
          verticalAlign="top"
          layout="horizontal"
          wrapperStyle={{ fontSize: '0.875rem'  }}
        />

        <Tooltip
          wrapperStyle={{ fontSize: '0.875rem' }}
          cursor={{ stroke: "oklch(0.55 0.04 257)", strokeWidth: 1 }}
          itemStyle={{ color: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)" }}
          labelStyle={{ color: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)" }}
          contentStyle={{ backgroundColor: resolvedTheme === 'dark' ? "oklch(0.278 0.033 256.848)" : "oklch(0.967 0.003 264.542)", borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.15)',}}
          labelFormatter={(label) => `Depth: ${label} m`}
          formatter={(value, name) => [`${Number(value).toFixed(2)} kN`, `${name} Total Capacity`]}
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
            stroke={item.selection.colour ? item.selection.colour : "#3182bd"}
            strokeWidth={item.selection.stroke_width ? item.selection.stroke_width : 1}
            animationDuration={600}
            name={item.selection.selection_name}
            activeDot={{ r: 6 }}
          />
        ))}
        
      </LineChart>
    </ResponsiveContainer>
  )
}