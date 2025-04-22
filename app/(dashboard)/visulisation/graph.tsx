'use client'
import { TsoilSchema } from "@/schemas/soilSchema";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function SoilDepthChart({ soilsData }: { soilsData: TsoilSchema[] }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Soil Depth vs Shaft Capacity</h2>
      
      {soilsData.length > 0 ? (
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={soilsData}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }} // Increased bottom margin
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="shaftCapacity" 
                name="Shaft Capacity" 
                label={{ value: 'Shaft Capacity', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                dataKey="h" 
                name="Depth (h)" 
                label={{ value: 'Depth (h)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              {/* Modified Legend configuration */}
              <Legend 
                layout="vertical" 
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: 10 }}
              />
              <Line 
                type="monotone" 
                dataKey="shaftCapacity" 
                stroke="#82ca9d" 
                name="Shaft Capacity"
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="h" 
                stroke="#8884d8" 
                name="Soil Depth"
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No soil data available
        </div>
      )}
    </div>
  );
}