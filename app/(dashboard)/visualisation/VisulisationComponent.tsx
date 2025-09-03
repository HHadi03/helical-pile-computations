"use client"

import { useState, useEffect } from "react"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

// Type definitions
interface SoilProfile {
  id: string
  profile_name?: string
}

interface SoilData {
  start_depth: number
  end_depth: number
  shaft_capacity60?: number
  bearing_capacity60?: number
  shaft_capacity100?: number
  bearing_capacity100?: number
}

interface ProfilePileCombination {
  profileId: string
  profileName: string
  pileSize: '60mm' | '100mm'
  soilData: SoilData[]
}

interface VisualizationConfig {
  selectedCombinations: ProfilePileCombination[]
  bearingCapacityEnabled: boolean
  configuredAt: string
}

type PileSize = '60mm' | '100mm'

// Initialize Supabase client
const supabase = createClient()


export function VisulisationComponent() {
  const [open, setOpen] = useState(false)
  const [soilProfiles, setSoilProfiles] = useState<SoilProfile[]>([])
  const [selectedCombinations, setSelectedCombinations] = useState<Set<string>>(new Set())
  const [bearingCapacityEnabled, setBearingCapacityEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Generate all possible combinations
  const profilePileCombinations = soilProfiles.flatMap((profile, index) =>
    ['60mm', '100mm'].map(pileSize => ({
      id: `${profile.id}-${pileSize}`,
      profileId: profile.id,
      profileName: profile.profile_name || `Soil Profile ${profile.id}`,
      pileSize: pileSize as PileSize,
      displayName: `${profile.profile_name || `Soil Profile ${index + 1}`} ${pileSize}`
    }))
  )

  useEffect(() => {
      const checkConfigurationAndFetchData = async () => {
    const existing = localStorage.getItem("visualization_config")
    
    if (!existing) {
      // Fetch soil profiles for the configuration dialog
      await fetchSoilProfiles()
      setOpen(true)
    } else {
      // Configuration exists, component is ready
      setOpen(false)
    }
  }
  
  checkConfigurationAndFetchData();
  }, [])



  const fetchSoilProfiles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("soil_profiles")
        .select("profile_name, id")
        .order("created_at", { ascending: true })

      if (error) throw error
      
      setSoilProfiles(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching soil profiles:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSoilData = async (profileId: string, pileSize: PileSize): Promise<SoilData[]> => {
    try {
      const selectFields = pileSize === "60mm" 
        ? "start_depth, end_depth, shaft_capacity60, bearing_capacity60"
        : "start_depth, end_depth, shaft_capacity100, bearing_capacity100"
      
      const capacityField = pileSize === "60mm" ? "shaft_capacity60" : "shaft_capacity100"

      const { data, error } = await supabase
        .from("soils")
        .select(selectFields)
        .order("start_depth", { ascending: true })
        .eq("soil_profile_id", profileId)
        .gt(capacityField, 0)

      if (error) throw error
      
      return data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching soil data:', err)
      return []
    }
  }

  const handleCombinationToggle = (combinationId: string, checked: boolean | 'indeterminate') => {
    const newSelected = new Set(selectedCombinations)
    
    if (checked === true) {
      newSelected.add(combinationId)
    } else {
      newSelected.delete(combinationId)
    }
    
    setSelectedCombinations(newSelected)
  }

  const handleContinue = async () => {
    if (selectedCombinations.size === 0) {
      setError("Please select at least one soil profile and pile size combination")
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Fetch soil data for each selected combination
      const profilePileData: ProfilePileCombination[] = []
      
      for (const combinationId of selectedCombinations) {
        const combination = profilePileCombinations.find(c => c.id === combinationId)
        if (!combination) continue
        
        const soilData = await fetchSoilData(combination.profileId, combination.pileSize)
        
        profilePileData.push({
          profileId: combination.profileId,
          profileName: combination.profileName,
          pileSize: combination.pileSize,
          soilData
        })
      }
      
      // Store configuration and data in localStorage
      const config: VisualizationConfig = {
        selectedCombinations: profilePileData,
        bearingCapacityEnabled,
        configuredAt: new Date().toISOString()
      }
      
      localStorage.setItem("visualization_config", JSON.stringify(config))
      setOpen(false)
      setError(null)
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save configuration'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    router.back()
  }

  const handleBearingCapacityChange = (checked: boolean | 'indeterminate') => {
    setBearingCapacityEnabled(checked === true)
  }

  if (error && !open) {
    return (
      <div className="p-4 text-red-600">
        Error: {error}
      </div>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Configure Visualisation</AlertDialogTitle>
          <AlertDialogDescription>
            Select the soil profiles and pile sizes you want to visualise. This will only show once.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile and Pile Size Combinations */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Select Profile & Pile Size Combinations
            </Label>
            
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
              {profilePileCombinations.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  {loading ? "Loading soil profiles..." : "No soil profiles available"}
                </div>
              ) : (
                profilePileCombinations.map((combination) => (
                  <div key={combination.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={combination.id}
                      checked={selectedCombinations.has(combination.id)}
                      onCheckedChange={(checked) => handleCombinationToggle(combination.id, checked)}
                      disabled={loading}
                    />
                    <Label 
                      htmlFor={combination.id}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {combination.displayName}
                    </Label>
                  </div>
                ))
              )}
            </div>
            
            {selectedCombinations.size > 0 && (
              <div className="text-sm text-gray-600">
                {selectedCombinations.size} combination(s) selected
              </div>
            )}
          </div>

          {/* Bearing Capacity Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bearing-capacity"
              checked={bearingCapacityEnabled}
              onCheckedChange={handleBearingCapacityChange}
              disabled={loading}
            />
            <Label 
              htmlFor="bearing-capacity"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Enable bearing capacity visualisation
            </Label>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleContinue}
            disabled={loading || selectedCombinations.size === 0}
          >
            {loading ? "Configuring..." : `Configure Graph (${selectedCombinations.size} selected)`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}