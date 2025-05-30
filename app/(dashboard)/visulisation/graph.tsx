'use client'
import { TsoilSchema } from "@/schemas/soilSchema";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function SoilDepthChart({ profileSoils }: { profileSoils: TsoilSchema[] }) {
  const maxDepth = profileSoils.length > 0 ? Math.max(...profileSoils.map(soil => soil.endDepth)) : 10

  return (
    <div className="border rounded-lg">
      
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={profileSoils}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="endDepth" 
              name="Depth (h)" 
              label={{ value: 'Depth / m', position: 'insideBottom', offset: -5 }}
              domain={[0, maxDepth]}
            />
            <YAxis 
              name="Capacity" 
              label={{ value: 'Capacity / kN', angle: -90, position: 'insideLeft' }}
              domain={[0, 'dataMax']}
              reversed
            />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="shaftCapacity100" 
              stroke="#82ca9d" 
              name="Shaft Capacity @ 100mm"
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="shaftCapacity60" 
              stroke="#8884d8" 
              name="Shaft Capacity @ 60mm Pile"
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="bearingCapacity60" 
              stroke="#ff7300" 
              name="Bearing Capacity @ 60mm Pile"
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="bearingCapacity100" 
              stroke="#ff0000" 
              name="Bearing Capacity @ 100mm Pile"
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}