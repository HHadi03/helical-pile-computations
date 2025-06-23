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
import { Calculator, Trash2, Copy, Pencil, Layers, Plus, EllipsisVertical, PlusCircle, Ellipsis} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { deleteProfile } from "./actions/deleteProfile"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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

  const handleDuplicateProfile = async (profileId: string) => {
    console.log("MEOW" + profileId)
  }

  const soilsByProfile = Object.groupBy(soilsData, soil => soil.soilProfileId!)
  return (
    <div className="mx-3">
  
      <div className="flex justify-end mb-3">
        <div className="flex flex-row border border-gray-300 shadow-xs rounded-md">
          <Button variant="ghost" className="w-52 border-r border-gray-300 rounded-none hover:bg-green-100" onClick={() => handleCalculate()} disabled={!isAnyFormEdited || soilsData.length === 0 || isCalculating}>
            {isCalculating ? (<> <span className="pr-2 size-5 animate-spin rounded-full border-2 border-solid border-green-700 border-t-transparent"></span>Calculating...</>)
            : (<> <Calculator className="text-green-700"/> Perform Calculations </> )}
          </Button>
          <Button asChild variant="ghost" className="w-48 hover:bg-zinc-200 rounded-none">
            <Link href="/configuration/insert-profile" prefetch={true} scroll={false}><Plus className="text-zinc-600 size-5"/>Add Soil Profile</Link>
          </Button>
        </div>
      </div>
      
      <Accordion type="multiple" className="space-y-6">
        {profilesData.map((profile, index) => {
          const profileSoils = soilsByProfile[profile.id!] || []
          return (
            <AccordionItem key={profile.id} value={profile.id!}>
            
              <div className="relative">
                <AccordionTrigger className="border-2 border-gray-300 pl-2 pr-16 bg-[#f7f7f7] shadow-inner relative">
                  <h2 className="text-xl font-semibold"> {profile.profileName ? profile.profileName : `Soil Profile ${index + 1}`}</h2>
                </AccordionTrigger>

                <div className="h-full absolute top-0 right-0 pt-1.5 border-l-2 border-gray-300">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="focus-visible:ring-transparent hover:bg-gray-200 mx-2"><EllipsisVertical className='size-6 text-muted-foreground'/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 shadow-xl" sideOffset={-2}>
                      <DropdownMenuItem onClick={() => router.push(`/configuration/edit-profile/${profile.id}`, { scroll: false })} className='hover:cursor-pointer'><Pencil className='text-amber-950'/>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateProfile(profile.id!)} className='hover:cursor-pointer'><Copy className='text-zinc-600'/>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {setSelectedProfile(profile.id!); setIsProfileDeleteDialogOpen(true)}} className='hover:cursor-pointer'><Trash2 className='text-red-500'/>Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <AccordionContent className='border-b border-x border-gray-300'>
                {profileSoils.length === 0 ? (
                  <div className="flex flex-col items-center bg-[#f7f7f7] py-5">
                    <Layers className="mb-2 size-8 text-muted-foreground"/>
                    <h3 className="font-medium">No soil layers detected</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Add soil layers to begin analysis</p>
                    <Button asChild variant="outline" className="mt-2 border border-gray-300 hover:bg-blue-100">
                      <Link href={`/configuration/insert-soil/${profile.id}`} prefetch={false} scroll={false}> <PlusCircle className="text-blue-500 size-5"/>Add Soil Layer</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Layer</TableHead>
                        <TableHead>Soil Type</TableHead>
                        <TableHead>Soil Density</TableHead>
                        <TableHead>Soil Name</TableHead>
                        <TableHead>Start Depth</TableHead>
                        <TableHead>End Depth</TableHead>
                        <TableHead>Sat Unit Weight</TableHead>
                        <TableHead>Moist Unit Weight</TableHead>
                        <TableHead>SPT N-value</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profileSoils.map((soil, index) => (
                        <TableRow key={soil.id} className="hover:bg-gray-100">
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
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="focus-visible:ring-transparent hover:bg-gray-200"><Ellipsis className='size-5 text-muted-foreground'/></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 shadow-xl" sideOffset={-2}>
                                <DropdownMenuItem onClick={() => router.push(`/configuration/edit-profile/${profile.id}`, { scroll: false })} className='hover:cursor-pointer'>Soil</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/configuration/edit-profile/${profile.id}`, { scroll: false })} className='hover:cursor-pointer'>Parameters</DropdownMenuItem>
                                <DropdownMenuItem onClick={() =>router.push(`/configuration/edit-profile/${profile.id}`, { scroll: false })} className='hover:cursor-pointer'>Engineered</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}                        
                    </TableBody>
                  </Table>

                    <div>
                    <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="ghost" size="icon" className="hover:bg-gray-200">
                        <Link href={`/configuration/insert-soil/${profile.id}`} prefetch={false} scroll={false}> <Plus className="text-muted-foreground size-6"/></Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className='bg-gray-200 text-black text-sm rounded' colorCode='bg-gray-200 fill-gray-200'>Add Soil Layer</TooltipContent>
                  </Tooltip> 
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

{/* <Tooltip>
  <TooltipTrigger asChild>
    <Button asChild variant="ghost" size="icon" className="hover:bg-gray-200">
      <Link href={`/configuration/insert-soil/${profile.id}`} prefetch={false} scroll={false}> <Plus className="text-muted-foreground size-6"/></Link>
    </Button>
  </TooltipTrigger>
  <TooltipContent className='bg-gray-200 text-black text-sm rounded' colorCode='bg-gray-200 fill-gray-200'>Add Soil Layer</TooltipContent>
</Tooltip>  */}


//todo modify soiltable to potentially add checkbox to delete, add handleduplicate, add scrollarea to table, setup add soil layer button somewhere, plan overview changes.