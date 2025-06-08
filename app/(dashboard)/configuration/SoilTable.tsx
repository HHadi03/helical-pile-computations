'use client'
import Link from 'next/link'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog"
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { TsoilSchema } from "@/schemas/soilSchema"
import { TsoilProfileSchema } from "@/schemas/soilProfileSchema"
import { toast } from "sonner"
import { calculateAll } from "./actions/submitCalculations"
import { deleteSoil } from "./actions/deleteSoil"
import { UseFormContext } from "./FormContext"
import { Calculator, PlusCircle, Trash2, EllipsisVertical, Copy, Pencil, Layers, Plus, FolderOpen} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { deleteProfile } from "./actions/deleteProfile"

const soilTypeCapitalisation = {
  'fine': 'Fine Grain',
  'coarse': 'Coarse Grain',
  'manmade': 'Man Made'
}

const soilDensityCapitalisation = {
  'loose' : 'Loose',
  'dense' : 'Dense'
}

export function SoilTable({ soilsData, profilesData}: { soilsData: TsoilSchema[], profilesData: TsoilProfileSchema[] }) {
  const router = useRouter()
  const [selectedSoil, setSelectedSoil] = useState<string | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [isSoilDeleteDialogOpen, setisSoilDeleteDialogOpen] = useState(false)
  const [isProfileDeleteDialogOpen, setIsProfileDeleteDialogOpen] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const {isAnyFormEdited, hasCriticalChanges,  isTFieldEdited, resetFormStates} = UseFormContext()

  const handleSoilDelete = async () => {
    if (selectedSoil !== null) {
      try {
        const result = await deleteSoil(selectedSoil)
        if (result.errors) {
          toast.error(result.message)
        }
        
        else {
          setSelectedSoil(null)
          toast.success(result.message)
        }
       
      } catch {
       toast.error("An unexpected error has occurred.", {description: "Please try again later."})
      }
    }
  }

  const handleProfileDelete = async () => {
    if (selectedProfile !== null) {
      try {
        const result = await deleteProfile(selectedProfile)
        if (result.errors) {
          toast.error(result.message)
        }

        else {
          setSelectedProfile(null)
          toast.success(result.message)
        }

      } catch {
        toast.error("An unexpected error has occurred.", { description: "Please try again later." })
      }
    }
  }

  const handleCalculate = async () => {
    setIsCalculating(true)
    try {
      const result = await calculateAll(hasCriticalChanges, isTFieldEdited)
      if (result.errors) {
        toast.error(result.message)
      }

      else {
        resetFormStates()
        setIsCalculating(false)
        toast.success(result.message)
      }

    } catch {
      toast.error("An unexpected error has occurred.", { description: "Please try again later." })
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
            <Button className="w-80 rounded-lg text-white shadow-md hover:shadow-xl"><Plus className="size-6"/>Add Soil Profile</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-3">
      {profilesData.length > 0 && (
        <div className="flex justify-end mb-3">
          <div className="flex flex-row border border-gray-300 shadow-xs rounded-md">
            <Button variant="ghost" className="w-52 border-r border-gray-300 rounded-none hover:bg-green-100" onClick={() => handleCalculate()} disabled={!isAnyFormEdited || soilsData.length === 0 || isCalculating}>
              {isCalculating ? (<> <span className="pr-2 h-5 w-5 animate-spin rounded-full border-2 border-solid border-green-700 border-t-transparent"></span>Calculating...</>)
              : (<> <Calculator className="text-green-700"/> Perform Calculations </> )}
            </Button>
            <Button asChild variant="ghost" className="w-48 hover:bg-zinc-200 rounded-none">
              <Link href="/configuration/insert-profile" prefetch={true} scroll={false}><Plus className="text-zinc-600 size-5"/>Add Soil Profile</Link>
            </Button>
          </div>
        </div>
      )}
      
      <Accordion type="multiple" className="space-y-6">
        {profilesData.map((profile, index) => {
          const profileSoils = soilsData.filter((soil) => soil.soilProfileId === profile.id)
          return (
            <AccordionItem key={profile.id} value={profile.id!}>
            
              <AccordionTrigger className="border-2 border-gray-300 pl-2 pr-5 bg-[#f7f7f7] shadow-inner">
                <h2 className="text-xl font-semibold"> {profile.profileName ? profile.profileName : `Soil Profile ${index + 1}`}</h2>
              </AccordionTrigger>
              
              <AccordionContent>
                {profileSoils.length === 0 ? (
                  <div className="flex flex-col items-center border-x border-b border-gray-300 bg-[#f7f7f7] py-5">
                    <Layers className="mb-2 h-8 w-8 text-gray-600"/>
                    <h3 className="font-medium text-gray-700">No soil layers detected</h3>
                    <p className="mt-1 text-sm text-gray-500">Add soil layers to begin analysis</p>
                    <Button asChild variant="outline" className="mt-2 border border-gray-300 hover:bg-blue-100">
                      <Link href={`/configuration/insert-soil/${profile.id}`} prefetch={false} scroll={false}> <PlusCircle className="text-blue-500"/>Add Soil Layer </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                  {/* Soil Layer Entries Here? */}
                    <Table className="border-b border-x border-gray-300">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Layer</TableHead>
                          <TableHead className="font-semibold whitespace-nowrap">Type</TableHead>
                          <TableHead className="font-semibold whitespace-nowrap">Density</TableHead>
                          <TableHead className="font-semibold whitespace-nowrap">Name</TableHead>
                          <TableHead className="font-semibold whitespace-nowrap">Start Depth</TableHead>
                          <TableHead className="font-semibold whitespace-nowrap">End Depth</TableHead>
                          <TableHead className="font-semibold whitespace-nowrap ">Sat Unit Weight</TableHead>
                          <TableHead className="font-semibold whitespace-nowrap ">Moist Unit Weight</TableHead>
                          <TableHead className="font-semibold whitespace-nowrap ">SPT N-value</TableHead>
                          <TableHead className="font-semibold">Description</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profileSoils.map((soil, index) => (
                          <TableRow key={soil.id} onDoubleClick={() => router.push(`/configuration/edit-soil/${soil.id}`, { scroll: false })} className="cursor-pointer hover:bg-slate-100">
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{soilTypeCapitalisation[soil.soilType]}</TableCell>
                            <TableCell>{soilDensityCapitalisation[soil.density]}</TableCell>
                            <TableCell>{soil.soilName || soil.soil}</TableCell>
                            <TableCell>{`${soil.startDepth} m`}</TableCell>
                            <TableCell>{`${soil.endDepth} m`}</TableCell>
                            <TableCell>{`${soil.ySat} kN/m³`}</TableCell>
                            <TableCell>{`${soil.yMoist} kN/m³`}</TableCell>
                            <TableCell>{soil.nValue}</TableCell>
                            <TableCell>{soil.description}</TableCell>
                            <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-200" onClick={(e) => {e.stopPropagation(); setSelectedSoil(soil.id!); setisSoilDeleteDialogOpen(true)}}><Trash2 className="text-red-500"/></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  
                    <div className="mt-2 ml-1">
                      <Button asChild variant="ghost" className="hover:bg-blue-100">
                        <Link href={`/configuration/insert-soil/${profile.id}`} prefetch={false} scroll={false}> <PlusCircle className="text-blue-500"/> Add Soil Layer </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 focus-visible:ring-transparent ml-2"><EllipsisVertical/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-40">
                          <DropdownMenuItem onClick={() => router.push(`/configuration/edit-profile/${profile.id}`, { scroll: false })}><Pencil/>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {/* handleDuplicateProfile(profile.id) */}}><Copy/>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {setSelectedProfile(profile.id!); setIsProfileDeleteDialogOpen(true)}}><Trash2/>Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                )}
              </AccordionContent>
              
            </AccordionItem>
          )
        })}
      </Accordion>
      
      <AlertDialog open={isProfileDeleteDialogOpen} onOpenChange={setIsProfileDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the selected soil profile and remove it from the configuration.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleProfileDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isSoilDeleteDialogOpen} onOpenChange={setisSoilDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the selected soil layer and remove it from the configuration.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSoilDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  ) 
}
