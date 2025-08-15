'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Profile {
  id: string
  profile_name: string | null
  effective_pile_length: number
}

interface SoilGraphProps {
  profileSoils: any[]
  pileDiameter: 60 | 100
  profile: Profile
}

export function SoilGraph({ profileSoils, pileDiameter, profile }: SoilGraphProps) {
  const filteredSoils = profileSoils.filter(soil => soil.end_depth <= profile.effective_pile_length)
  
  const shaftCapacityKey = pileDiameter === 60 ? "shaft_capacity60" : "shaft_capacity100"
  const bearingCapacityKey = pileDiameter === 60 ? "bearing_capacity60" : "bearing_capacity100"
  
  // Transform data for the chart - using start_depth for x-axis
  const chartData = filteredSoils.map(soil => ({
    ...soil,
    depth: soil.start_depth,
    shaftCapacity: soil[shaftCapacityKey],
    bearingCapacity: soil[bearingCapacityKey]
  }))
  
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="depth" 
            name="Depth (m)" 
            label={{ value: 'Depth / m', position: 'insideBottom', offset: -5 }} 
            domain={['dataMin', 'dataMax']}
          />
          <YAxis 
            name="Capacity" 
            label={{ value: 'Capacity / kN', angle: -90, position: 'insideLeft' }} 
            domain={[0, 'dataMax']}
          />
          <Line 
            type="monotone" 
            dataKey="shaftCapacity" 
            stroke="#82ca9d" 
            name="Shaft Capacity" 
            activeDot={{ r: 6 }} 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="bearingCapacity" 
            stroke="#ff0000" 
            name="Bearing Capacity" 
            activeDot={{ r: 6 }} 
            strokeWidth={2}
          /> 
          <Tooltip 
            formatter={(value, name) => [
              `${value} kN`, 
              name === 'shaftCapacity' ? 'Shaft Capacity' : 'Bearing Capacity'
            ]}
            labelFormatter={(label) => `Depth: ${label} m`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}