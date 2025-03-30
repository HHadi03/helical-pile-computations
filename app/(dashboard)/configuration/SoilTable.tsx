'use client'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { TsoilSchema } from "@/schemas/soilSchema"
import { useToast } from "@/components/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { calculateAll } from "./actions/submitCalculations"
import { deleteSoil } from "./actions/deleteSoil"
import { UseFormContext } from "./FormContext"
import { Calculator, PlusCircle, Edit2, Trash2, RectangleVertical, ShieldCheck } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

const soilTypeNames = {
  'fine': 'Fine Grain',
  'coarse': 'Coarse Grain',
  'manmade': 'Man Made'
}

export function SoilTable({ soilsData }: { soilsData: TsoilSchema[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const {isAnyFormEdited, hasCriticalChanges,  isTFieldEdited, resetFormStates} = UseFormContext()

  const handleEdit = () => {
    if (selectedRow !== null && soilsData[selectedRow].id) {
      router.push(`/configuration/edit-soil/${soilsData[selectedRow].id}`)
    }
  }

  const handleDelete = async () => {
    if (selectedRow !== null && soilsData[selectedRow].id) {
      try {
        const result = await deleteSoil(soilsData[selectedRow].id)
        toast({
          duration: 2500,
          variant: result.errors ? "destructive" : "default",
          title: result.errors ? "Soil Deletion Failed" : "Soil Deletion Successful",
          description: result.message,
          action: result.errors && <ToastAction altText="Try again">Try again</ToastAction>
        })
        
        if (!result.errors) {
          setSelectedRow(null)
          setIsDeleteDialogOpen(false)
        }
  
      } catch {
        toast({
          duration: 2500,
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "An unexpected error occurred. Please try again later.",
          action: <ToastAction altText="Try again">Try again</ToastAction>
        })
      }
    }
  }

  const handleCalculate = async () => {
    try {
      const result = await calculateAll(hasCriticalChanges, isTFieldEdited)
      toast({
        duration: 2500,
        variant: result.errors ? "destructive" : "default",
        title: result.errors ? "Calculation Failed" : "Calculation Successful",
        description: result.message,
        action: result.errors && <ToastAction altText="Try again">Try again</ToastAction>
      })
      
      if (!result.errors) {
        resetFormStates() 
      }
  
    } catch {
      toast({
        duration: 2500,
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "An unexpected error occurred. Please try again later.",
        action: <ToastAction altText="Try again">Try again</ToastAction>
      })
    }
  }
  
  return (
    <>
      <div className="flex bg-white pl-1 sticky top-0 z-10 space-x-3">
        <Link href="/configuration/safety-factors" prefetch={true} scroll={false}>
          <Button variant="ghost" className="hover:bg-amber-100">
            <ShieldCheck className="h-5 w-5 text-amber-900"/> Define Parameters
          </Button>
        </Link>
        
        <Link href="/configuration/insert-soil" prefetch={true} scroll={false}>
          <Button variant="ghost" className="hover:bg-blue-100">
            <PlusCircle className="h-5 w-5 text-blue-500"/> Add Soil Layer
          </Button>
        </Link>

        <Link href="/configuration/pile" prefetch={true} scroll={false}>
          <Button variant="ghost" className="hover:bg-purple-100">
            <RectangleVertical className="h-5 w-5 text-purple-500"/> Configure Pile
          </Button>
        </Link>

        {isAnyFormEdited && soilsData.length > 0 && (
          <Button variant="ghost" className="hover:bg-green-100" onClick={handleCalculate}>
            <Calculator className="h-5 w-5 text-green-700" /> Calculate Changes
          </Button>
        )}
      </div>

      <div className="px-3 pt-3">
        <h1 className="pl-1 text-2xl">Soil Layer Entries ({soilsData.length})</h1>
        {soilsData.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-gray-200 shadow-md mt-2">
          <Table className="w-full">
            <TableHeader className="bg-gray-300">
              <TableRow>
                <TableHead className="font-semibold">Layer</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">Start Depth</TableHead>
                <TableHead className="whitespace-nowrap font-semibold">End Depth</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
              </TableRow>
            </TableHeader>
          
            <TableBody>
              {soilsData.map((soil: TsoilSchema, index: number) => (
                <TableRow key={soil.id} className={`cursor-pointer hover:bg-slate-50 ${selectedRow === index ? 'bg-slate-100' : ''}`}  onClick={() => setSelectedRow(index)}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{`${soil.startDepth} m`}</TableCell>
                  <TableCell>{`${soil.endDepth} m`}</TableCell>
                  <TableCell>{soilTypeNames[soil.soilType]}</TableCell>
                  <TableCell>{soil.soilName ? soil.soilName : soil.soil}</TableCell>
                  <TableCell>{soil.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        ) : (<p className="pl-1 pt-2 text-gray-500">No soil data available. Please add some entries.</p>)}

        {soilsData.length > 0 && (
          <div className="sticky bottom-0 z-10 pt-3 pb-2 pr-2 pointer-events-none flex justify-end">
            <div className="border border-gray-300 rounded-sm shadow-sm bg-white pointer-events-auto">
              <Button variant="ghost" className={`hover:bg-zinc-200 border-r border-gray-300 ${selectedRow === null ? 'cursor-not-allowed' : ''}`}
                onClick={handleEdit} disabled={selectedRow === null}>
                <Edit2 className="h-5 w-5 text-zinc-600"/> Edit
              </Button>

              <Button variant="ghost" className={`hover:bg-red-100 ${selectedRow === null || selectedRow !== soilsData.length - 1 ? 'cursor-not-allowed' : ''}`} 
                onClick={() => setIsDeleteDialogOpen(true)} disabled={selectedRow === null || selectedRow !== soilsData.length - 1}>
                <Trash2 className="h-5 w-5 text-red-500"/> Delete
              </Button>
            </div>  
          </div>
        )}
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {selectedRow !== null ? soilsData[selectedRow].soilName || soilsData[selectedRow].soil : "selected soil"}{" "}
              and remove it from the table.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}