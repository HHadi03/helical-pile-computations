"use client"
import { useToast } from "@/app/components/hooks/use-toast"
import { ToastAction } from "@/app/components/ui/toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { TsoilSchema, soilSchema} from "@/app/schemas/soilSchema"
import { updateSoil } from "@/app/(dashboard)/actions/updateSoil"
import { Button } from "@/app/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/app/components/NumberInput"

type EditFormProps = {
  soil: TsoilSchema
}

export function EditForm({ soil }: EditFormProps) {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<TsoilSchema>({
    resolver: zodResolver(soilSchema),
    defaultValues: {...soil}
  })

  const { formState } = form

  async function onSubmit(values: TsoilSchema) {
    try {
      const result = await updateSoil(values)
      if (result.errors) {
        Object.entries(result.errors).forEach(([key, value]) => {
        form.setError(key as keyof TsoilSchema, { message: Array.isArray(value) ? value[0] : String(value) })})
      }
      
      toast({
        duration: 2500,
        variant: result.errors ? "destructive" : "default",
        title: result.errors ? "Soil Update Failed" : "Soil Update Successful",
        description: result.message,
        action: result.errors && <ToastAction altText="Try again">Try again</ToastAction>
      })
      
      if (!result.errors) {
        router.back()
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
                name="Su"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Undrained Soil Shear Strength (Su)</FormLabel>
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

              <FormField
                control={form.control}
                name="Qult"
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
            </>
          ) : (
            <>
              <FormField
                control={form.control}
                name="Angle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Friction Angle (φ)</FormLabel>
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
                name="T"
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

              <FormField
                control={form.control}
                name="Qult"
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
            </>
          )}
        </div>
  
        <div className="pt-2 flex justify-between">
          <Button type="submit" className="w-24" disabled={!formState.isDirty}>Save</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Close</Button>
        </div>

      </form>
    </Form>
  )
}