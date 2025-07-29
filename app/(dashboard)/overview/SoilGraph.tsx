'use client'
import { ToverviewSoilSchema } from "@/schemas/soilSchemas";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function SoilGraph({ profileSoils }: { profileSoils: ToverviewSoilSchema[] }) {
  
  return (
    <div className="w-full h-100">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={profileSoils} width={600} height={300} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
          <XAxis dataKey="start_depth" name="Depth (m)" label={{ value: 'Depth / m', position: 'insideBottom', offset: -5 }} domain={['dataMin', 'dataMax']}/>
          <YAxis name="Capacity" label={{ value: 'Capacity / kN', angle: -90, position: 'insideLeft' }} domain={[0, 'dataMax']}/>
          <Line type="monotone"  dataKey="shaft_capacity60" stroke="#82ca9d" name="Shaft Capacity" activeDot={{ r: 6 }} />
          <Line type="monotone"  dataKey="bearing_capacity60" stroke="#ff0000" name="Bearing Capacity" activeDot={{ r: 6 }} /> 
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}