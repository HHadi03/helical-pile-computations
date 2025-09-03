// app/internal/pdf-export/[token]/page.tsx
import { SoilGraph } from '@/app/(dashboard)/overview/SoilGraph'
import { SoilDiagram } from '@/app/(dashboard)/overview/SoilDiagram'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{
    token: string
  }>
  searchParams: Promise<{
    data?: string
  }>
}

export default async function PDFExportPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  console.log('🎯 PDF page - Token:', resolvedParams.token)
  console.log('🎯 PDF page - Has data param:', !!resolvedSearchParams.data)
  
  // Basic token validation
  if (!resolvedParams.token || resolvedParams.token.length < 10) {
    console.error('❌ Invalid token')
    notFound()
  }
  
  if (!resolvedSearchParams.data) {
    console.error('❌ No data parameter provided')
    return (
      <div className="p-8 text-red-600">
        <h1>Error: No data provided</h1>
        <p>The PDF export data was not found.</p>
      </div>
    )
  }
  
  // Decode and parse the data that was fetched in the route handler
  let exportData
  try {
    const decodedData = Buffer.from(resolvedSearchParams.data, 'base64').toString('utf-8')
    exportData = JSON.parse(decodedData)
    console.log('✅ Successfully parsed export data')
    console.log('📊 Profile name:', exportData.profile?.profile_name)
    console.log('📊 Soils count:', exportData.profileSoils?.length || 0)
  } catch (error) {
    console.error('❌ Failed to parse export data:', error)
    return (
      <div className="p-8 text-red-600">
        <h1>Error: Invalid data format</h1>
        <p>The export data could not be parsed.</p>
      </div>
    )
  }
  
  const { formData, profile, profileSoils } = exportData
  
  if (!profile) {
    console.error('❌ No profile in export data')
    return (
      <div className="p-8 text-red-600">
        <h1>Error: Profile not found</h1>
        <p>The specified soil profile could not be found.</p>
      </div>
    )
  }
  
  const pileDiameter = parseInt(formData.pile_diameter) || 100
  const hideBearingCapacity = false
  const profileIndex = 0
  
  console.log('🎯 Rendering PDF with profile:', profile.profile_name)
  
  return (
    <div className="min-h-screen bg-white p-8 print:p-4 max-w-[210mm] mx-auto">
      {/* Header Information */}
      <div className="mb-8 border-b-2 border-gray-300 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Soil Report</h1>
        
        <div className="grid grid-cols-2 gap-6 text-sm">
          {formData.job_number && (
            <div>
              <span className="font-semibold text-gray-700">Job Number:</span>
              <span className="ml-2 text-gray-900">{formData.job_number}</span>
            </div>
          )}
          
          {formData.pile_number && (
            <div>
              <span className="font-semibold text-gray-700">Pile Number:</span>
              <span className="ml-2 text-gray-900">{formData.pile_number}</span>
            </div>
          )}
          
          {formData.job_location && (
            <div className="col-span-2">
              <span className="font-semibold text-gray-700">Job Location:</span>
              <span className="ml-2 text-gray-900">{formData.job_location}</span>
            </div>
          )}
          
          <div>
            <span className="font-semibold text-gray-700">Pile Diameter:</span>
            <span className="ml-2 text-gray-900">{pileDiameter} mm</span>
          </div>
          
          <div>
            <span className="font-semibold text-gray-700">Profile Name:</span>
            <span className="ml-2 text-gray-900">{profile.profile_name}</span>
          </div>
          
          {formData.additional_information && (
            <div className="col-span-2">
              <span className="font-semibold text-gray-700">Additional Information:</span>
              <div className="mt-1 text-gray-900 whitespace-pre-wrap">{formData.additional_information}</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Soil Graph */}
      <div className="mb-12 max-w-3xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Soil Graph</h2>
        <SoilGraph 
          profile={profile} 
          profileSoils={profileSoils} 
          profileIndex={profileIndex} 
          pileDiameter={pileDiameter} 
          hideBearingCapacity={hideBearingCapacity}
        />
      </div>
      
      {/* Soil Diagram - Force to new page and scale down */}
      <div className="mb-8 max-w-3xl page-break-before">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Soil Diagram</h2>
        <div 
          className="diagram-container overflow-hidden"
          style={{ 
            transform: 'scale(0.8)',
            transformOrigin: 'top left',
            width: '125%', // Compensate for the scale to maintain container width
            marginBottom: '-20%' // Reduce bottom margin to account for scaling
          }}
        >
          <SoilDiagram 
            profile={profile} 
            profileSoils={profileSoils} 
            profileIndex={profileIndex} 
            pileDiameter={pileDiameter} 
            hideBearingCapacity={hideBearingCapacity}
          />
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-12 pt-6 border-gray-300 text-xs text-gray-500 text-center">
        Generated on {new Date().toLocaleString()}
      </div>
    </div>
  )
}