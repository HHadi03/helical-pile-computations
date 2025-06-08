"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { TsoilSchema, soilSchema} from "@/schemas/soilSchema"
import { updateSoil } from "@/app/(dashboard)/configuration/actions/updateSoil"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/components/NumberInput"
import { useEffect } from "react"
import { UseFormContext } from "../../FormContext"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function EditSoilForm({soil}: {soil: TsoilSchema}) {
  const router = useRouter()
  const { setHasUnsavedChanges, setCriticalChanges, setTFieldEdited } = UseFormContext()

  const form = useForm<TsoilSchema>({
    resolver: zodResolver(soilSchema),
    defaultValues: {...soil}
  })

  const { formState: { isDirty, isSubmitting } } = form

  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      if (name === 't') {
        setTFieldEdited(true)
      } 
      
      else if (name === 'su' || name === 'qult' || name === 'angle') {
        setCriticalChanges(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, setTFieldEdited, setCriticalChanges])
  
  async function onSubmit(values: TsoilSchema) {
    try {
      const result = await updateSoil(values)

      if (result.errors) {
        Object.entries(result.errors).forEach(([key, value]) => {form.setError(key as keyof TsoilSchema, { message: Array.isArray(value) ? value[0] : String(value) })})
        toast.error(result.message)
      }

      else {
        setHasUnsavedChanges(true)
        router.back()
        toast.success(result.message)
      }

    } catch {
      toast.error("An unexpected error has occurred.", { description: "Please try again later." })
    }
  } 

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-8 border-y-2 py-3">
          <FormField
            control={form.control}
            name="nValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SPT Blow Count (N)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <NumberInput field={field} placeholder="0"/>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">N</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="yMoist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Soil Unit Weight (YMoist)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <NumberInput field={field} placeholder="Enter moist unit weight"/>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">kN/m³</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ySat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Soil Unit Weight (YSat)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <NumberInput field={field} placeholder="Enter sat unit weight"/>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">kN/m³</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {soil.soilType === "fine" ? (
            <>
              <FormField
                control={form.control}
                name="su"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Undrained Shear Soil Strength (Su)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <NumberInput field={field} placeholder="Enter Su"/>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">kPa</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : (
            <>
              <FormField
                control={form.control}
                name="angle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Angle of Internal Friction (φ)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <NumberInput field={field} placeholder="Enter Angle"/>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">°</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="t"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shear Soil Strength (T)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <NumberInput field={field} placeholder="Enter T"/>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">kPa</span>
                      </div>
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
                  <FormLabel>Ultimate Bearing Pressure (Qult)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <NumberInput field={field} placeholder="Enter Qult"/>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">kPa</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
  
        <div className="pt-2 flex justify-between">
        <Button type="submit" className="w-28" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</>) : ("Save")}
        </Button>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={router.back}>Close</Button>
        </div>

      </form>
    </Form>
  )
}

// if  n value and t is edited, then t takes precident
// if n value is edited and angle is edited, angle takes precident
// if angle and t is edited, t takes precident again 
// if n vlue and su is edited, su takes precident
// if only n value edited, it uses them numbers.

