'use client'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption, } from "@/app/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/app/components/ui/alert-dialog"
import { Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { deleteSoil } from "@/app/(dashboard)/actions/deleteSoil"
import { Toolbar } from "@/app/components/Toolbar"
import type { TsoilSchema } from "@/app/schemas/soilSchema"
import { useToast } from "@/app/components/hooks/use-toast"
import { ToastAction } from "@/app/components/ui/toast"
import { calculateAll } from "../actions/submitCalculations"
import { useFormEdit } from "./FormContext"

const soilTypeNames = {
  'fine': 'Fine Grain',
  'coarse': 'Coarse Grain',
  'manmade': 'Man Made'
}

export default function SoilTable({ soilsData }: { soilsData: TsoilSchema[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const {isAnyFormEdited, hasCriticalChanges,  isTFieldEdited, resetFormStates} = useFormEdit()

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

  const handleEdit = () => {
    if (selectedRow !== null && soilsData[selectedRow].id) {
      router.push(`/configuration/edit-soil/${soilsData[selectedRow].id}`)
    }
  }

  const handleCalculate = async () => {
    try {
      const result = await calculateAll(soilsData, hasCriticalChanges,  isTFieldEdited)
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
      <Toolbar onDelete={() => setIsDeleteDialogOpen(true)} onEdit={handleEdit} onCalculate={handleCalculate}
       canCalculate={isAnyFormEdited && soilsData.length > 0} canDelete={selectedRow !== null} canEdit={selectedRow !== null}
      />
      <div className="pl-1 pt-3">
        <h1 className="text-2xl pl-3">Soil Layer Entries</h1>
        {soilsData.length > 0 ? (
          <Table>
            <TableCaption className="caption-bottom">
              Summary of Soil Types and Properties
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Layer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="whitespace-nowrap">Start Depth</TableHead>
                <TableHead className="whitespace-nowrap">End Depth</TableHead>
                <TableHead>Parameters</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {soilsData.map((soil: TsoilSchema, index: number) => (
                <TableRow key={soil.id} className={`cursor-pointer hover:bg-gray-50 ${selectedRow === index ? 'bg-gray-100' : ''}`}  onClick={() => setSelectedRow(index)}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="whitespace-nowrap">{soilTypeNames[soil.soilType] || soil.soilType}</TableCell>
                  <TableCell className="whitespace-nowrap">{soil.soilName ? soil.soilName : soil.soil}</TableCell>
                  <TableCell>{soil.description}</TableCell>
                  <TableCell>{`${soil.startDepth} m`}</TableCell>
                  <TableCell>{`${soil.endDepth} m`}</TableCell>
                  <TableCell>
                    <Check className="h-5 w-5 text-green-700" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (<p className="pl-3 pt-2 text-gray-500">No soil data available. Please add some entries.</p>)}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {selectedRow !== null ? soilsData[selectedRow].soilName || soilsData[selectedRow].soil : "selected soil"}{" "}
              and remove it from our servers.
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