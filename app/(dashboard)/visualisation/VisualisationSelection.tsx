"use client"
import { useState } from "react"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { TconfigSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { insertSelections } from "./actions/insertSelections"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const pileDiameters = ["60", "100"]

export function VisualisationSelection({ profilesData, initialDialogOpen }: { profilesData: TconfigSoilProfileSchema[], initialDialogOpen: boolean }) {
  const [isDialogOpen, setDialogOpen] = useState(initialDialogOpen)
  const [selections, setSelections] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const handleCheckboxToggle = (key: string, checked: boolean) => {
    setSelections(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(key)
      } 
      
      else {
        newSet.delete(key)
      }
      return newSet
    })
  }
  
  const handleSelectAll = () => {
    const totalPossibleSelections = profilesData.length * pileDiameters.length
    
    if (selections.size === totalPossibleSelections) {
      setSelections(new Set())
    } 
    
    else {
      const allKeys = new Set<string>()
      profilesData.forEach(profile => {
        pileDiameters.forEach(diameter => {
          allKeys.add(`${profile.id}-${diameter}`)
        })
      })
      setSelections(allKeys)
    }
  }

  const handleConfigureChart = async (selections: Set<string>) => {
    try {
      setIsLoading(true)
      
      const result = await insertSelections(Array.from(selections))
      if (result.errors) {
        toast.error(result.message)
      }

      else {
        setDialogOpen(false)
        toast.success(result.message)
      }
    }

    catch {
      toast.error("An unexpected error has occurred.", { description: "Please try again later." })

    } finally {
      setTimeout(() => setIsLoading(false), 150)
    } 
  }

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Visualisation</AlertDialogTitle>
          <AlertDialogDescription> Select the soil profiles and pile diameters you wish to visualise.</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3 border p-3 max-h-86 overflow-y-auto -mt-1">
          <div className="flex items-start gap-2 border-b pb-2">
            <Checkbox id="select-all" checked={selections.size === profilesData.length * pileDiameters.length} onCheckedChange={handleSelectAll}/>
            <Label htmlFor="select-all">Select All</Label>
          </div>

          {profilesData.map((profile, index) => (
            pileDiameters.map((diameter) => {
              const key = `${profile.id}-${diameter}`
              return (
                <div key={key} className="space-y-3 p-3 border rounded-md">
                  <div className="flex items-start gap-2">
                    <Checkbox id={key} checked={selections.has(key)} onCheckedChange={(checked: boolean) => handleCheckboxToggle(key, checked)}/>
                    <Label htmlFor={key}>{profile.profile_name ? `${profile.profile_name} - (${diameter} mm)` : `Soil Profile ${index + 1} - (${diameter} mm)`}</Label>
                  </div>
                </div>
              )
            })
          ))}
        </div>

        <div className="text-sm text-muted-foreground -mt-1 ml-1">
          {selections.size} option(s) selected
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={router.back} disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button disabled={selections.size === 0 || isLoading} onClick={() => handleConfigureChart(selections)} className="sm:w-32">
            {isLoading ? <><Loader2 className="animate-spin size-4"/>Configuring...</> : "Configure Chart"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
