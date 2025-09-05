"use client"
import { useState } from "react"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { TconfigSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { insertSelections } from "./actions/insertSelections"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from '@/components/ui/alert'

const pileDiameters = ["60", "100"]

export function VisulisationComponent({ profilesData, initialDialogOpen }: { profilesData: TconfigSoilProfileSchema[], initialDialogOpen: boolean }) {
  const [isDialogOpen, setDialogOpen] = useState(initialDialogOpen)
  const [selections, setSelections] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
  
  const handleConfigureChart = async (selections: Set<string>) => {
    setError(null)
    setIsLoading(true)
    
    const result = await insertSelections(Array.from(selections))
    
    if (result.errors) {
      setIsLoading(false)
      setError(result.message)
    }

    else {
      setDialogOpen(false)
      setIsLoading(false)
    }
  }

  return (
    <>
      <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Visualisation</AlertDialogTitle>
            <AlertDialogDescription> Select the soil profiles and pile diameters you wish to visualise.</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-2 border p-3 max-h-60 overflow-y-auto -mt-1">
            {profilesData.map((profile, index) => (
              pileDiameters.map((diameter) => {
                const key = `${profile.id}-${diameter}`
                return (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox id={key} checked={selections.has(key)} onCheckedChange={(checked: boolean) => handleCheckboxToggle(key, checked)}/>
                    <Label htmlFor={key}>{profile.profile_name ? `${profile.profile_name} - ${diameter}mm` : `Soil Profile ${index + 1} - ${diameter}mm`}</Label>
                  </div>
                )
              })
            ))}
          </div>

          <div className="text-sm text-muted-foreground -mt-1 ml-1">
            {selections.size} option(s) selected
          </div>
          
          {error &&
            <Alert variant="destructive" className="p-0 border-none">
              <AlertCircle className="size-4"/>
              <AlertDescription> {error} </AlertDescription>
            </Alert>
          }

          <AlertDialogFooter>
            <AlertDialogCancel onClick={router.back}>Cancel</AlertDialogCancel>
            <Button disabled={selections.size === 0 || isLoading} onClick={() => handleConfigureChart(selections)} className="sm:w-32">
              {isLoading ? <><Loader2 className="animate-spin size-4"/>Configuring...</> : "Configure Chart"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

//call server action to submit selections, for loop to destructure the array and post a row with soil profile id and the id itself, then we come back here and revalidatepath?
//use effect shouldnt open dialog this time, add suspense for the fetching of the graph data, maybe instead of fetching data here can fetch it the visulisationgraph itself