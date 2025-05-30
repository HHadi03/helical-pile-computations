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
import { Calculator, PlusCircle, Trash2, EllipsisVertical, Copy, Pencil, ChevronDown, ChevronRight, TriangleAlert, CheckCircle, Layers, Plus, FolderOpen} from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { deleteProfile } from "./actions/deleteProfile"

const soilTypeNames = {
  'fine': 'Fine Grain',
  'coarse': 'Coarse Grain',
  'manmade': 'Man Made'
}

export default function SoilTable({ soilsData, profilesData}: { soilsData: TsoilSchema[], profilesData: TsoilProfileSchema[] }) {
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
    setCollapsedProfiles(prev => {const newSet = new Set(prev)
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

  if (profilesData.length === 0) {
    return (
      <div className="h-full bg-[#F4F3F2] flex items-center justify-center border-2 border-black px-5">
        <div className="text-center">
          <span className="flex justify-center mb-2"><FolderOpen className="size-10"/></span>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Soil Profiles Found</h3>
          <p className="text-gray-600 mb-4">Start by adding a new soil profile to configure soil layers for analysis</p>
          <Link href="/configuration/insert-profile" prefetch={true} scroll={false}>
            <Button className="w-80 rounded-lg text-white shadow-md hover:shadow-xl"><Plus className="!size-6"/>Add Soil Profile</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-3">
    
      {profilesData.length > 0 && (
        <div className="absolute top-0 right-0 pr-4">
          <div className="flex border border-gray-300 shadow-sm rounded-md ">

            <Button variant="ghost" className="w-52 border-r border-gray-300 rounded-none hover:bg-green-100" onClick={() => handleCalculate()} disabled={!isAnyFormEdited || isCalculating}>
              {isCalculating ? (<> <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-solid border-green-700 border-t-transparent"></span>Calculating...</>)
              : (<> <Calculator className="text-green-700"/> Perform Calculations </> )}
            </Button>

            <Link href="/configuration/insert-profile" prefetch={true} scroll={false}>
              <Button variant="ghost" className="w-48 hover:bg-zinc-200 rounded-none"><Plus className="text-zinc-600 !size-5"/>Add Soil Profile</Button>
            </Link>

          </div>
        </div>
      )}
      
      {profilesData.map((profile, index) => {
        const profileSoils = soilsData.filter((soil) => soil.soilProfileId === profile.id)
        const isCollapsed = collapsedProfiles.has(profile.id!)
        return (
          <div key={profile.id}>
            
            <div className="flex items-center pb-2 pl-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleProfileCollapse(profile.id!)}>{isCollapsed ? (<ChevronRight/>) : (<ChevronDown/>)}</Button>
              <h2 className="text-xl font-semibold">{profile.profileName ? profile.profileName : `Soil Profile ${index + 1}`}</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 focus-visible:ring-transparent"><EllipsisVertical/></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem onClick={() => router.push(`/configuration/edit-profile/${profile.id}`)}><Pencil/>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {/* handleDuplicateProfile(profile.id) */}}><Copy/>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {setSelectedProfile(profile.id!), setIsProfileDeleteDialogOpen(true)}}><Trash2/>Remove</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {!isCollapsed && (
              <>
                {profileSoils.length === 0 ? (
                  <div className="flex flex-col items-center rounded-xl border border-gray-300 bg-[#F4F3F2] py-5 shadow-inner">
                    <Layers className="mb-2 h-8 w-8 text-gray-600"/>
                    <h3 className="font-medium text-gray-700">No soil layers detected</h3>
                    <p className="pt-1 text-sm text-gray-500">Add soil layers to begin analysis</p>
                    <Link href={`/configuration/insert-soil/${profile.id}`} prefetch={false} scroll={false}>
                      <Button variant="outline" className="mt-2 border border-gray-300 hover:bg-blue-100">
                        <PlusCircle className="text-blue-500"/>Add Soil Layer</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-gray-200 shadow-md">
                      <Table>
                        <TableHeader className="bg-gray-300">
                          <TableRow>
                            <TableHead className="font-semibold">Layer</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Start Depth</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">End Depth</TableHead>
                            <TableHead className="font-semibold">Type</TableHead>
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">SPT Blow Count</TableHead>
                            <TableHead className="font-semibold">Saturated Weight</TableHead>
                            <TableHead className="font-semibold">Moist Weight</TableHead>
                            <TableHead className="font-semibold">Description</TableHead>
                            <TableHead className=""></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {profileSoils.map((soil, index) => (
                            <TableRow key={soil.id} onDoubleClick={() => router.push(`/configuration/edit-soil/${soil.id}`, { scroll: false })} className="cursor-pointer hover:bg-slate-50">
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{`${soil.startDepth} m`}</TableCell>
                              <TableCell>{`${soil.endDepth} m`}</TableCell>
                              <TableCell>{soilTypeNames[soil.soilType]}</TableCell>
                              <TableCell>{soil.soilName || soil.soil}</TableCell>
                              <TableCell>{soil.nValue}</TableCell>
                              <TableCell>{`${soil.ySat} kN/m³`}</TableCell>
                              <TableCell>{`${soil.yMoist} kN/m³`}</TableCell>
                              <TableCell>{soil.description}</TableCell>
                              <TableCell className="text-right"><Button variant="outline" size="icon" className="h-6 w-6" onClick={(e) => {e.stopPropagation(), setSelectedSoil(soil.id!), setisSoilDeleteDialogOpen(true)}}><Trash2 className="text-red-500"/></Button></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="pt-2">
                      <Link href={`/configuration/insert-soil/${profile.id}`} prefetch={false} scroll={false}>
                        <Button variant="ghost" className="hover:bg-blue-100"><PlusCircle className="text-blue-500"/>Add Soil Layer</Button>
                      </Link>
                    </div>
                    
                  </>
                )}
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


// {profilesData.length > 0 && (
//   <div className="flex bg-white pl-1 sticky top-0 z-10 space-x-3">
//     <Link href="/configuration/safety-factors" prefetch={false} scroll={false}>
//       <Button variant="ghost" className="hover:bg-amber-100"> <ShieldCheck className="h-5 w-5 text-amber-900"/> Define Parameters</Button>
//     </Link>

//     <Link href="/configuration/insert-profile" prefetch={true} scroll={false}>
//       <Button variant="ghost"> Add Soil Profile </Button>
//     </Link>

//     {isAnyFormEdited && soilsData.length > 0 && (
//       <Button variant="ghost" className="hover:bg-green-100" onClick={() => handleCalculate()} disabled={isCalculating}>
//         {isCalculating ? (
//           <> <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-solid border-green-700 border-t-transparent"></span>Calculating...</>
//         ) : (
//           <> <Calculator className="text-green-700"/> Calculate Changes </>
//         )}
//       </Button>
//     )} 
//   </div>
// )}