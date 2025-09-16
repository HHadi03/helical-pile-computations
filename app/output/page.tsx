"use client"

import { useSearchParams } from 'next/navigation'
import { SoilDiagram } from "../(dashboard)/overview/SoilDiagram"
import { SoilGraph } from "../(dashboard)/overview/SoilGraph"

export default function ExportOutputPage() {
  const searchParams = useSearchParams()

  const soilsData = searchParams.get('soilsData') ? JSON.parse(decodeURIComponent(searchParams.get('soilsData') || '')) : []
  const profileData = searchParams.get('profileData') ? JSON.parse(decodeURIComponent(searchParams.get('profileData') || '')) : null
  const jobNumber = searchParams.get('jobNumber') || ''
  const pileNumber = searchParams.get('pileNumber') || ''
  const jobLocation = searchParams.get('jobLocation') || ''
  const additionalInformation = searchParams.get('additionalInformation') || ''
  const pileDiameter = searchParams.get('pileDiameter') || '100'
  const tensionOutput = searchParams.get('tensionOutput') ? parseFloat(searchParams.get('tensionOutput') || '0') : 0
  const compressionOutput = searchParams.get('compressionOutput') ? parseFloat(searchParams.get('compressionOutput') || '0') : 0
  const appliedLoad = parseFloat(searchParams.get('appliedLoad') ?? '0') || 0

  return (
    <div className="min-h-screen bg-white p-8 print:p-4 max-w-[210mm] mx-auto">
      {/* Your existing JSX remains unchanged */}
      <div className="mb-8 border-b-2 border-gray-300 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Soil Report</h1>
        
        <div className="grid grid-cols-2 gap-6 text-sm">
          {jobNumber && (
            <div>
              <span className="font-semibold text-gray-700">Job Number:</span>
              <span className="ml-2 text-gray-900">{jobNumber}</span>
            </div>
          )}
          
          {pileNumber && (
            <div>
              <span className="font-semibold text-gray-700">Pile Number:</span>
              <span className="ml-2 text-gray-900">{pileNumber}</span>
            </div>
          )}
          
          {jobLocation && (
            <div className="col-span-2">
              <span className="font-semibold text-gray-700">Job Location:</span>
              <span className="ml-2 text-gray-900">{jobLocation}</span>
            </div>
          )}
          
          {additionalInformation && (
            <div className="col-span-2">
              <span className="font-semibold text-gray-700">Additional Information:</span>
              <div className="mt-1 text-gray-900 whitespace-pre-wrap">{additionalInformation}</div>
            </div>
          )}
        </div>
      </div>
      
      {profileData && soilsData.length > 0 && (
        <>
          <div className="mb-8 max-w-3xl">
            <SoilDiagram 
              profile={profileData} 
              profileSoils={soilsData} 
              pileDiameter={pileDiameter} 
              hideBearingCapacity={false}
            />
          </div>

          <div className="max-w-3xl page-break-before">
            <SoilGraph 
              profile={profileData} 
              profileSoils={soilsData} 
              pileDiameter={pileDiameter} 
              hideBearingCapacity={false}
            />
          </div>
        </>
      )}

      <div className="page-break-before mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Safety Design Analysis</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tension Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Maximum Load:</span>
                  <span className="font-medium">{appliedLoad.toFixed(2)} kN</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Tested Load:</span>
                  <span className="font-medium">{tensionOutput.toFixed(2)} kN</span>
                </div>
                <div className="flex items-center justify-center my-2">
                  <div className="text-xl font-light mx-2">{appliedLoad.toFixed(2)} kN</div>
                  <div className="text-xl mx-2">≤</div>
                  <div className="text-xl font-light mx-2">{tensionOutput.toFixed(2)} kN</div>
                </div>
                <div className={`text-center py-2 rounded-md font-medium ${appliedLoad <= tensionOutput ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {appliedLoad <= tensionOutput ? 'PASS' : 'FAIL'}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compression Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Maximum Load:</span>
                  <span className="font-medium">{appliedLoad.toFixed(2)} kN</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Tested Load:</span>
                  <span className="font-medium">{compressionOutput.toFixed(2)} kN</span>
                </div>
                <div className="flex items-center justify-center my-2">
                  <div className="text-xl font-light mx-2">{appliedLoad.toFixed(2)} kN</div>
                  <div className="text-xl mx-2">≤</div>
                  <div className="text-xl font-light mx-2">{compressionOutput.toFixed(2)} kN</div>
                </div>
                <div className={`text-center py-2 rounded-md font-medium ${appliedLoad <= compressionOutput ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {appliedLoad <= compressionOutput ? 'PASS' : 'FAIL'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
       
      <div className="mt-5 pt-6 border-gray-300 text-xs text-gray-500 text-center">
        Generated on {new Date().toLocaleString()} Version No: 1.0.0
      </div>
    </div>
  )
}