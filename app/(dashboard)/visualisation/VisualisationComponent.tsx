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

//why is it posting four times? technical issue here
export function VisualisationComponent({ profilesData, selectionsData }: { profilesData: TconfigSoilProfileSchema[], selectionsData: TselectionsSoilProfileSchema[] }) {
  const [isFetchingData, setIsFetchingData] = useState(false)
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const fetchSoilsData = async () => {
      setIsFetchingData(true)
      
      try {
        const soilsDataPromises = selectionsData.map(async (selection) => {
          const profile = profilesData.find((profile) => profile.id === selection.soil_profile_id)!
          const soilsData = await getSoils(profile.id, selection.pile_diameter)
          
          return {
            selection: {...selection, selection_name: profile.profile_name},
            soilsData
          }
        })
        
        const allData = await Promise.all(soilsDataPromises)
        setChartData(allData)
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

  if (isFetchingData) {
    return (
      <p>Loading</p>
      // create skeleton loader here for graph
    )
  }
  
  return (
    <ResponsiveContainer width="100%" height="75%" className={"border max-w-5xl mx-auto"}>
      <LineChart data={chartData} layout="vertical" margin={{ top: 15, right: 40, left: 0, bottom: 30 }}>
        
        <CartesianGrid 
          strokeDasharray="3 3" stroke={resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)"} strokeOpacity={0.5}
        />
        
        <Legend 
          verticalAlign="top"
          height={36}
          layout="vertical"
          wrapperStyle={{ fontSize: '0.875rem' }}
        />

        <Tooltip
          wrapperStyle={{ fontSize: '0.875rem' }}
          cursor={{ stroke: "oklch(0.55 0.04 257)", strokeWidth: 1 }}
          itemStyle={{ color: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)" }}
          labelStyle={{ color: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)" }}
          contentStyle={{ backgroundColor: resolvedTheme === 'dark' ? "oklch(0.278 0.033 256.848)" : "oklch(0.967 0.003 264.542)", borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.15)',}}
          labelFormatter={(label) => `Depth: ${label} m`}
          formatter={(value) => [`${Number(value).toFixed(2)} kN`, 'Total Capacity']}
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
          dataKey={"shaft_capacity100"}
          type="number"
          domain={[0, 'dataMax']}
          label={{ fill: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)", value: 'Capacity / kN', position: 'insideBottom', offset: -10, fontSize: '0.875rem' }}
          tick={{ fontSize: '0.875rem', fill: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)" }}
          axisLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.92 0.00 49)" : "oklch(0.56 0.00 0)", strokeWidth: 2, strokeOpacity: 0.8}}
          tickLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)", strokeWidth: 0.5}}
        />
        
        <Line 
          type={"monotone"}
          strokeWidth={2.5}
          animationDuration={1200}
          name="Total Capacity"
          activeDot={{ r: 6 }}
        />
        
      </LineChart>
    </ResponsiveContainer>
  )
}

