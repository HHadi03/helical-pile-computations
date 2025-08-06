'use client'

import { useState, useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { SoilGraph } from './SoilGraph'

interface Profile {
  id: string
  profile_name: string | null
  effective_pile_length: number
}

interface VisualizationClientProps {
  profiles: Profile[]
  getSoilsAction: (profileId: string) => Promise<any[]>
}

export function VisulisationComponent({ profiles, getSoilsAction }: VisualizationClientProps) {
  const [showDialog, setShowDialog] = useState(true)
  const [selectedProfile1, setSelectedProfile1] = useState<string>('')
  const [selectedProfile2, setSelectedProfile2] = useState<string>('')
  const [pileDiameter, setPileDiameter] = useState<60 | 100>(60)
  const [profile1Data, setProfile1Data] = useState<any>(null)
  const [profile2Data, setProfile2Data] = useState<any>(null)
  const [profile1Soils, setProfile1Soils] = useState<any[]>([])
  const [profile2Soils, setProfile2Soils] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const getProfileDisplayName = (profile: Profile, index: number) => {
    return profile.profile_name || `Soil Profile ${index + 1}`
  }

  const handleSubmit = async () => {
    if (!selectedProfile1 || !selectedProfile2) return

    setLoading(true)
    try {
      // Find the selected profiles
      const profile1 = profiles.find(p => p.id === selectedProfile1)
      const profile2 = profiles.find(p => p.id === selectedProfile2)

      if (!profile1 || !profile2) return

      // Fetch soils for both profiles
      const [soils1, soils2] = await Promise.all([
        getSoilsAction(selectedProfile1),
        getSoilsAction(selectedProfile2)
      ])

      setProfile1Data(profile1)
      setProfile2Data(profile2)
      setProfile1Soils(soils1)
      setProfile2Soils(soils2)
      setShowDialog(false)
    } catch (error) {
      console.error('Error fetching soil data:', error)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = selectedProfile1 && selectedProfile2 && selectedProfile1 !== selectedProfile2

  if (showDialog) {
    return (
      <AlertDialog open={showDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Select Profiles to Compare</AlertDialogTitle>
            <AlertDialogDescription>
              Choose two soil profiles and pile diameter to visualize and compare their capacities.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="profile1">First Soil Profile</Label>
              <Select value={selectedProfile1} onValueChange={setSelectedProfile1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile, index) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {getProfileDisplayName(profile, index)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="profile2">Second Soil Profile</Label>
              <Select value={selectedProfile2} onValueChange={setSelectedProfile2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile, index) => (
                    <SelectItem 
                      key={profile.id} 
                      value={profile.id}
                      disabled={profile.id === selectedProfile1}
                    >
                      {getProfileDisplayName(profile, index)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pileDiameter">Pile Diameter</Label>
              <Select value={pileDiameter.toString()} onValueChange={(value) => setPileDiameter(parseInt(value) as 60 | 100)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">60mm</SelectItem>
                  <SelectItem value="100">100mm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
            >
              {loading ? 'Loading...' : 'Compare Profiles'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  if (!profile1Data || !profile2Data) {
    return <div>Loading visualization...</div>
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Soil Profile Comparison</h1>
        <p className="text-muted-foreground">
          Comparing {getProfileDisplayName(profile1Data, 0)} vs {getProfileDisplayName(profile2Data, 1)} 
          ({pileDiameter}mm pile)
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-center">
            {getProfileDisplayName(profile1Data, 0)}
          </h2>
          <div className="border rounded-lg p-4">
            <SoilGraph 
              profileSoils={profile1Soils}
              pileDiameter={pileDiameter}
              profile={profile1Data}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-center">
            {getProfileDisplayName(profile2Data, 1)}
          </h2>
          <div className="border rounded-lg p-4">
            <SoilGraph 
              profileSoils={profile2Soils}
              pileDiameter={pileDiameter}
              profile={profile2Data}
            />
          </div>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={() => setShowDialog(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Change Selection
        </button>
      </div>
    </div>
  )
}