'use client'
import { ToverviewSoilSchema } from "@/schemas/soilSchemas"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { useTheme } from "next-themes"

export function SoilGraph({profileSoils, pileLength, pileDiameter, profileIndex, profileName}: { profileSoils: ToverviewSoilSchema[], pileLength: number, pileDiameter: 60 | 100, profileIndex: number, profileName?: string }) {
  const { theme } = useTheme()

  const filteredSoils = profileSoils.filter(soil => soil.start_depth < pileLength)

  const shaftCapacity = pileDiameter === 60 ? "shaft_capacity60" : "shaft_capacity100"
  const bearingCapacity = pileDiameter === 60 ? "bearing_capacity60" : "bearing_capacity100"
  
  if (profileSoils.length === 0) {
    return (
      <div className="border-2 p-2 bg-sky-50 dark:bg-sky-900/50">
        <h1 className="text-xl font-semibold mb-2">{profileName|| `Soil Profile ${profileIndex + 1}`}</h1>
        <p className="text-sm text-muted-foreground">No soil layers detected, add soil layers in configuration to begin analysis.</p>
      </div>
    )
  }
  
  return (
    <>
      <div className="border-2 p-2 bg-sky-50 dark:bg-sky-900/50 whitespace-nowrap">
        <div className="flex justify-between">

          <div className="flex flex-col">
            <h1 className="text-xl font-semibold">{profileName || `Soil Profile ${profileIndex + 1}`}</h1>
            <p className="text-sm mt-auto text-muted-foreground">Pile Diameter: {pileDiameter} mm</p>
          </div>

          <div className="text-right text-sm">
            <p><span className="font-semibold">Maximum Depth:</span> {Math.max(...filteredSoils.map(s => s.end_depth))} m</p>
            <p><span className="font-semibold">Maximum Shaft Capacity:</span> {Math.max(...filteredSoils.map(s => s[shaftCapacity]))} kN</p>
            <p><span className="font-semibold">Maximum Bearing Capacity:</span> {Math.max(...filteredSoils.map(s => s[bearingCapacity]))} kN</p>
          </div>

        </div>
      </div>

      <div className="h-100 border-b border-x">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredSoils} margin={{ top: 15, right: 40, left: 20, bottom: 20 }}>
            <CartesianGrid vertical={false}/>
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '14px' }}/>
            <XAxis dataKey="end_depth" name="End Depth (m)" domain={['dataMin', 'dataMax']} label={{ value: 'End Depth / m', position: 'insideBottom', offset: -3, style: {fontSize: 14} }} tick={{ fontSize: 14 }}/>
            <YAxis name="Capacity / kN" domain={[0, 'dataMax']} label={{ value: 'Capacity / kN', angle: -90, position: 'insideLeft', style: {fontSize: 14} }} tick={{ fontSize: 14 }} />
            <Line type="monotone" dataKey={shaftCapacity} {...theme === 'light' ? { stroke: "oklch(0.6 0.118 184.704)" } : { stroke: "oklch(0.696 0.17 162.48)" }} strokeWidth={2} name="Shaft Capacity" activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey={bearingCapacity} {...theme === 'light' ? { stroke: "oklch(0.646 0.222 41.116)" } : { stroke: "oklch(0.488 0.243 264.376)" }} strokeWidth={2} name="Bearing Capacity" activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}