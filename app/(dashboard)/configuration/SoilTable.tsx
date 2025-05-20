'use client'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog"
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { TsoilSchema } from "@/schemas/soilSchema"
import { TsoilProfileSchema } from "@/schemas/soilProfileSchema"
import { useToast } from "@/components/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { calculateAll } from "./actions/submitCalculations"
import { deleteSoil } from "./actions/deleteSoil"
import { UseFormContext } from "./FormContext"
import { Calculator, PlusCircle, Trash2, EllipsisVertical, Copy, Pencil, ChevronDown, ChevronRight, TriangleAlert, CheckCircle} from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { deleteProfile } from "./actions/deleteProfile"

const soilTypeNames = {
  'fine': 'Fine Grain',
  'coarse': 'Coarse Grain',
  'manmade': 'Man Made'
}

export default function SoilTable({ soilsData, profileData}: { soilsData: TsoilSchema[], profileData: TsoilProfileSchema[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedSoil, setSelectedSoil] = useState<string | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [isSoilDeleteDialogOpen, setisSoilDeleteDialogOpen] = useState(false)
  const [isProfileDeleteDialogOpen, setIsProfileDeleteDialogOpen] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [collapsedProfiles, setCollapsedProfiles] = useState<Set<string>>(new Set())
  const {isAnyFormEdited, hasCriticalChanges,  isTFieldEdited, resetFormStates} = UseFormContext()
  
  const toggleProfileCollapse = (profileId: string) => {
    setCollapsedProfiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(profileId)) {
        newSet.delete(profileId)
      } else {
        newSet.add(profileId)
      }
      return newSet
    })
  }

  const handleSoilDelete = async () => {
    if (selectedSoil !== null) {
      try {
        const result = await deleteSoil(selectedSoil)
        toast({
          duration: 2000,
          variant: result.errors ? "destructive" : "default",
          description: (
            <div className="flex items-center gap-2">
              {result.errors ? (<TriangleAlert className="text-yellow-500 w-5 h-5" />) : (<CheckCircle className="text-green-500 w-5 h-5" />)}
              <span>{result.message}</span>
            </div>
          ),  
        })
        
        if (!result.errors) {
          setSelectedSoil(null)
          setisSoilDeleteDialogOpen(false)
        }
  
      } catch {
        toast({
          duration: 2000,
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "An unexpected error occurred. Please try again later.",
          action: <ToastAction altText="Try again">Try again</ToastAction>
        })
      }
    }
  }

  const handleProfileDelete = async () => {
    if (selectedProfile !== null) {
      try {
        const result = await deleteProfile(selectedProfile)
        toast({
          duration: 2000,
          variant: result.errors ? "destructive" : "default",
          description: (
            <div className="flex items-center gap-2">
              {result.errors ? (<TriangleAlert className="text-yellow-500 w-5 h-5" />) : (<CheckCircle className="text-green-500 w-5 h-5" />)}
              <span>{result.message}</span>
            </div>
          ),  
        })
        
        if (!result.errors) {
          setSelectedProfile(null)
          setIsProfileDeleteDialogOpen(false)
        }

      } catch {
        toast({
          duration: 2000,
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "An unexpected error occurred. Please try again later.",
          action: <ToastAction altText="Try again">Try again</ToastAction>
        })
      }
    }
  }

  const handleCalculate = async () => {
    setIsCalculating(true)
    try {
      const result = await calculateAll(hasCriticalChanges, isTFieldEdited)
      toast({
        duration: 2000,
        variant: result.errors ? "destructive" : "default",
        description: (
          <div className="flex items-center gap-2">
            {result.errors ? (<TriangleAlert className="text-yellow-500 w-5 h-5" />) : (<CheckCircle className="text-green-500 w-5 h-5" />)}
            <span>{result.message}</span>
          </div>
        ),  
      })
      
      if (!result.errors) {
        resetFormStates()
        setIsCalculating(false) 
      }
  
    } catch {
      toast({
        duration: 2000,
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "An unexpected error occurred. Please try again later.",
        action: <ToastAction altText="Try again">Try again</ToastAction>
      })
    }
  }

  return (
    <div className="space-y-6 px-3 pt-3">
       
      {profileData.map((profile, index) => {
        const profileSoils = soilsData.filter((soil) => soil.soilProfileId === profile.id)
        const isCollapsed = collapsedProfiles.has(profile.id)
        return (
          <div key={profile.id}>
            
            <div className="flex items-center pb-2 pl-1">
              <Button variant="ghost" size="icon" className="h-6 w-6 mr-2" onClick={() => toggleProfileCollapse(profile.id)}>{isCollapsed ? (<ChevronRight/>) : (<ChevronDown/>)}</Button>
              <h2 className="text-xl font-semibold">Soil Profile {index + 1}</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 focus-visible:ring-transparent"><EllipsisVertical/></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem onClick={() => router.push(`/configuration/edit-profile/${profile.id}`)}><Pencil/>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {/* handleDuplicateProfile(profile.id) */}}><Copy/>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {setSelectedProfile(profile.id), setIsProfileDeleteDialogOpen(true)}}><Trash2/>Remove</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* <button onClick={(e) => {e.stopPropagation(), setSelectedProfile(profile.id), setIsProfileDeleteDialogOpen(true)}}>Remove Profile</button> */}
            </div>

            {!isCollapsed && (
              <>
                {profileSoils.length === 0 ? (<p className="pl-1 pt-2 text-gray-500">No soil data available. Please add some entries.</p>)
                : (
                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-gray-200 shadow-md">
                  <Table>
                    <TableHeader className="bg-gray-300">
                      <TableRow>
                        <TableHead className="font-semibold">Layer</TableHead>
                        <TableHead className="whitespace-nowrap font-semibold">Start Depth</TableHead>
                        <TableHead className="whitespace-nowrap font-semibold">End Depth</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className=""></TableHead>
                      </TableRow>
                    </TableHeader>
                  
                    <TableBody>
                      {profileSoils.map((soil, index) => (
                        <TableRow key={soil.id} onDoubleClick={() => router.push(`/configuration/edit-soil/${soil.id}`, { scroll: false })} className={`cursor-pointer hover:bg-slate-50`}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{`${soil.startDepth} m`}</TableCell>
                          <TableCell>{`${soil.endDepth} m`}</TableCell>
                          <TableCell>{soilTypeNames[soil.soilType]}</TableCell>
                          <TableCell>{soil.soilName ? soil.soilName : soil.soil}</TableCell>
                          <TableCell>{soil.description}</TableCell>
                          <TableCell className="text-right"><Button variant="outline" size="icon" className="h-6 w-6" onClick={(e) => {e.stopPropagation(), setSelectedSoil(soil.id!), setisSoilDeleteDialogOpen(true)}}><Trash2 className="text-red-500"/></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                )}

                <div className="pt-2">
                  <Link href={`/configuration/insert-soil/${profile.id}`} prefetch={false} scroll={false}>
                    <Button variant="ghost" className="hover:bg-blue-100">
                      <PlusCircle className="text-blue-500"/> Add Soil Layer
                    </Button>
                  </Link>
                </div>
              </>
            )}

          </div>
        )
      })}

      <AlertDialog open={isProfileDeleteDialogOpen} onOpenChange={setIsProfileDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the selected soil profile and remove it from the table.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsProfileDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleProfileDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isSoilDeleteDialogOpen} onOpenChange={setisSoilDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the selected soil layer and remove it from the table.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setisSoilDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSoilDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

// {isAnyFormEdited && soilsData.length > 0 && (
//   <Button variant="ghost" className="hover:bg-green-100" onClick={() => handleCalculate()} disabled={isCalculating}>
//     {isCalculating ? (
//       <> <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-solid border-green-700 border-t-transparent"></span>Calculating...</>
//     ) : (
//       <> <Calculator className="text-green-700"/> Calculate Changes </>
//     )}
//   </Button>
// )} 

//todo set up soil profile modal with the water depth, stick out, name and pile length paramaters. with insert/edit route
//set up tooltip menu with duplicate, edit, and delete
//remove bearing capacity calculations.
//add options to soiltable, fix edit soil with more 
//fix calculateall logic
//add extra fields to table
//improve config table ui
//improve server actions
//work on overview page
//fix issues in supabse table
//improve caching issues