"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { updateSoilEngineered } from "../../actions/updateSoilEngineered"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/components/NumberInput"
import { Loader2, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { editSoilEngineeredSchema, TeditSoilEngineeredSchema } from "@/schemas/soilSchemas"
import { recalculateResults } from "../../actions/recalculateResults"
import { useState } from "react"

export function EditSoilEngineered({ soil, soilId }: { soil: TeditSoilEngineeredSchema, soilId: string }) {
  const router = useRouter()
  const [isRecalculating, setIsRecalculating] = useState(false)

  const form = useForm({
    resolver: zodResolver(editSoilEngineeredSchema),
    defaultValues: { ...soil }
  })

  const { formState: { isDirty, isSubmitting, dirtyFields } } = form

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.replace('/configuration') 
    }
  }

  const handleRecalculate = async () => {
    setIsRecalculating(true)
    
    try {
      const result = await recalculateResults(soilId, soil.test_type, soil.soil_type)
      
      if (result.errors || !result.data) {
        throw new Error()
      }
      
      if (result.data.soilType === "fine") {
        form.setValue('su', result.data.su, { shouldDirty: true })
        form.setValue('qult', result.data.qult, { shouldDirty: true })
      } 
      
      else {
        if (result.data.testType === "spt") {
          form.setValue('angle', result.data.angle, { shouldDirty: true })
        }

        form.setValue('t', result.data.t, { shouldDirty: true })
        form.setValue('qult', result.data.qult, { shouldDirty: true })
      }

    } catch {
      toast.error("Failed to recalculate values", { description: "Please try again later." })

    } finally {
      setIsRecalculating(false)
    }
  }
  
  async function onSubmit(values: TeditSoilEngineeredSchema) {
    try {
      const result = await updateSoilEngineered(values, soilId, dirtyFields)

      if (result.errors) {
        toast.error(result.message)
      } 
      
      else {
        handleClose()
        toast.success(result.message)
      }

    } catch {
      toast.error("An unexpected error has occurred.", { description: "Please try again later." })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-6 border-y-2 py-3">
          {soil.soil_type === "fine" && (
            <FormField
              control={form.control}
              name="su"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Undrained Shear Strength <span className="font-semibold -ml-1">(kPa)</span></FormLabel>
                  <FormControl>
                    <NumberInput field={field} placeholder="0" className="text-sm"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {soil.soil_type !== "fine" && (
            <>
              {soil.test_type === "spt" && (
                <FormField
                  control={form.control}
                  name="angle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Angle of Internal Friction <span className="font-semibold -ml-1">(°)</span></FormLabel>
                      <FormControl>
                        <NumberInput field={field} placeholder="0" className="text-sm"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="t"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shear Strength <span className="font-semibold -ml-1">(kPa)</span></FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0" className="text-sm"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          <FormField
            control={form.control}
            name="qult"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bearing Pressure <span className="font-semibold -ml-1">(kPa)</span></FormLabel>
                <FormControl>
                  <NumberInput field={field} placeholder="0" className="text-sm"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="button" variant="outline" className="w-full -mt-1" onClick={handleRecalculate} disabled={isSubmitting || isRecalculating}>
            {isRecalculating ? <><Loader2 className="animate-spin size-5 text-destructive"/>Restore Defaults</> : <><RotateCcw className="size-5 text-destructive"/>Restore Defaults</>}
          </Button>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" className="w-18" variant="outline" disabled={isSubmitting} onClick={handleClose}>Cancel</Button>
          <Button type="submit" className="w-28" disabled={!isDirty || isSubmitting || isRecalculating}>{isSubmitting ? (<><Loader2 className="size-5 animate-spin" />Saving...</>) : ("Save")}</Button>
        </div>
      </form>
    </Form>
  )
}