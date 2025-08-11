'use client'
import Link from 'next/link'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog"
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { TconfigSoilSchema } from "@/schemas/soilSchemas"
import { TconfigSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { toast } from "sonner"
import { deleteSoil } from "./actions/deleteSoil"
import { Trash2, Copy, Pencil, Layers, EllipsisVertical, Ellipsis, ArrowDown, RotateCcw, PlusCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { deleteProfile } from "./actions/deleteProfile"
import { duplicateProfile } from './actions/duplicateProfile'
import { deleteAll } from './actions/deleteAll'

const soilTypeCapitalisation = {
  'fine': 'Fine Grain',
  'coarse': 'Coarse Grain',
  'manmade': 'Man Made'
}

const soilDensityCapitalisation = {
  'loose' : 'Loose',
  'dense' : 'Dense'
}

export function ConfigurationComponent({ soilsData, profilesData}: { soilsData: TconfigSoilSchema[], profilesData: TconfigSoilProfileSchema[] }) {
  const router = useRouter()
  const [selectedSoil, setSelectedSoil] = useState<{ id: string; name: string; profileId: string} | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<{ id: string; name: string } | null>(null)
  const [isSoilDeleteDialogOpen, setisSoilDeleteDialogOpen] = useState(false)
  const [isProfileDeleteDialogOpen, setIsProfileDeleteDialogOpen] = useState(false)
  const [isDeleteAlleDialogOpen, setIsDeleteAllDialogOpen] = useState(false)

  const handleSoilDelete = async () => {
    if (selectedSoil !== null) {
      try {
        const result = await deleteSoil(selectedSoil.id, selectedSoil.name, selectedSoil.profileId)
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
        const result = await deleteProfile(selectedProfile.id, selectedProfile.name)
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

  const handleDuplicateProfile = async (profileId: string) => {
    try {
      const result = await duplicateProfile(profileId)
      if (result.errors) {
        toast.error(result.message)
      }

      else {
        toast.success(result.message)
      }

    } catch {
      toast.error("An unexpected error has occurred.", { description: "Please try again later." })
    }
  }

  const handleStartOver = async () => {
    try {
      const result = await deleteAll()
      if (result.errors) {
        toast.error(result.message)
      }

      else {
        toast.success(result.message)
      }
    }

    catch {
      toast.error("An unexpected error has occurred.", { description: "Please try again later." })
    }
  }

  const soilsByProfile = Object.groupBy(soilsData, soil => soil.soil_profile_id)
  return (
    <section className='min-h-full flex flex-col'>

      <div className="mb-3 flex justify-end">
        <Button asChild variant="outline" className="w-42 hover:bg-green-200 dark:hover:bg-green-900/50 shadow-sm" size="lg">
          <Link href="/configuration/insert-profile" scroll={false}><PlusCircle className="size-5 text-green-700"/>Add Soil Profile</Link>
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-6">
        {profilesData.map((profile, index) => {
          const profileSoils = soilsByProfile[profile.id] || []
          return (
            <AccordionItem key={profile.id} value={profile.id}>
            
              <div className="relative">
                <AccordionTrigger className="border-2 pl-2 pr-16 shadow-inner bg-secondary whitespace-nowrap">
                  <h2 className="text-xl font-semibold"> {profile.profile_name ? profile.profile_name : `Soil Profile ${index + 1}`}</h2>
                </AccordionTrigger>

                <div className="absolute top-0 right-0 mt-1.5 border-l-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button title='Profile Menu' variant="ghost" size="icon" className="mx-2 hover:bg-foreground/7 dark:hover:bg-foreground/7"><EllipsisVertical className='size-6 text-muted-foreground'/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-42" sideOffset={-2}>
                      <DropdownMenuLabel className='font-semibold'>{profile.profile_name ? profile.profile_name : `Soil Profile ${index + 1}`}</DropdownMenuLabel>
                      <DropdownMenuSeparator/>
                      <DropdownMenuItem onClick={() => router.push(`/configuration/edit-profile/${profile.id}`, { scroll: false })} className='hover:cursor-pointer'><Pencil className='text-muted-foreground'/>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateProfile(profile.id)} className='hover:cursor-pointer'><Copy className='text-muted-foreground'/>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem variant='destructive' onClick={() => {setSelectedProfile({id: profile.id, name: profile.profile_name || `Soil Profile ${index + 1}`}); setIsProfileDeleteDialogOpen(true)}} className='hover:cursor-pointer'><Trash2/>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <AccordionContent className='border-x border-b'>
                {profileSoils.length === 0 ? (
                  <div className="flex flex-col items-center text-center py-5">
                    <Layers className="mb-2 size-8 text-muted-foreground"/>
                    <h3>No soil layers detected</h3>
                    <p className="mt-1 text-muted-foreground">Add soil layers to begin analysis</p>
                    <Button asChild variant="outline" className="mt-2">
                      <Link href={`/configuration/insert-soil/${profile.id}`} prefetch={false} scroll={false}>Add Soil Layer</Link>
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
                          <TableHead className='hidden 2xl:table-cell'>Description</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profileSoils.map((soil, index) => (
                          <TableRow key={soil.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{soilTypeCapitalisation[soil.soil_type]}</TableCell>
                            <TableCell>{soilDensityCapitalisation[soil.density]}</TableCell>
                            <TableCell>{soil.soil_name || soil.soil}</TableCell>
                            <TableCell>{`${soil.start_depth} m`}</TableCell>
                            <TableCell>{`${soil.end_depth} m`}</TableCell>
                            <TableCell>{`${soil.y_sat} kN/m³`}</TableCell>
                            <TableCell>{`${soil.y_moist} kN/m³`}</TableCell>
                            <TableCell>{soil.n_value}</TableCell>        
                            <TableCell className='hidden 2xl:table-cell'>{soil.description}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button title='Soil Menu' variant="outline" size="sm" className='hover:bg-foreground/7 dark:hover:bg-foreground/15'><Ellipsis className='size-5 text-muted-foreground'/></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuLabel className='text-foreground/70'>Edit Soil...</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => router.push(`/configuration/edit-soil-information/${soil.id}`, { scroll: false })} className='hover:cursor-pointer'>Information</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => router.push(`/configuration/edit-soil-parameters/${soil.id}`, { scroll: false })} className='hover:cursor-pointer'>Parameters</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() =>router.push(`/configuration/edit-soil-engineered/${soil.id}`, { scroll: false })} className='hover:cursor-pointer'>Engineered</DropdownMenuItem>
                                  <DropdownMenuSeparator/>
                                  <DropdownMenuItem variant='destructive' onClick={() => {setSelectedSoil({ id: soil.id, name: soil.soil_name || soil.soil, profileId: profile.id }); setisSoilDeleteDialogOpen(true)}} className='hover:cursor-pointer'><Trash2/>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}                      
                      </TableBody>
                    </Table>
                    
                    <div className='border-t p-2'>
                      <Button asChild variant="outline" className="w-full rounded-lg shadow-sm" size="lg">
                        <Link href={`/configuration/insert-soil/${profile.id}`} prefetch={false} scroll={false}>Add Soil Layer<ArrowDown className="text-muted-foreground size-5"/></Link>
                      </Button>
                    </div>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
      
      {profilesData.length > 1 && 
        <div className='flex justify-center mt-auto py-2'>
          <Button onClick={() => setIsDeleteAllDialogOpen(true)} variant="ghost" className='hover:bg-red-200 dark:hover:bg-red-900/50' size="lg"><RotateCcw className='size-5 text-destructive'/>Start Over</Button>
        </div>
      }

      <AlertDialog open={isProfileDeleteDialogOpen} onOpenChange={(open) => {setIsProfileDeleteDialogOpen(open); if (!open) {setTimeout(() => setSelectedProfile(null), 150)}}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. <span className='font-semibold text-primary/80'>{selectedProfile?.name ?? 'Selected Profile'}</span> will be permanently deleted and removed from the configuration.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleProfileDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isSoilDeleteDialogOpen} onOpenChange={(open) => {setisSoilDeleteDialogOpen(open); if (!open) {setTimeout(() => setSelectedSoil(null), 150)}}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription> This action cannot be undone. <span className='font-semibold text-primary/80'>{selectedSoil?.name ?? 'Selected Soil'}</span> will be permanently deleted and removed from the soil profile.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSoilDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteAlleDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription> This action cannot be undone. All soil profiles will be permanently deleted and removed from the configuration.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartOver}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  ) 
}
