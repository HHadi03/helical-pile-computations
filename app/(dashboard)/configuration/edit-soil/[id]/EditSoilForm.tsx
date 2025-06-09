"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { TsoilSchema, soilSchema} from "@/schemas/soilSchema"
import { updateSoil } from "@/app/(dashboard)/configuration/actions/updateSoil"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/components/NumberInput"
import { useEffect, useState } from "react"
import { UseFormContext } from "../../FormContext"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

export function EditSoilForm({soil}: {soil: TsoilSchema}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState ("parameters")
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="soil">Soil</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="engineered">Engineered</TabsTrigger>
          </TabsList>

          <TabsContent value="soil" className="focus-visible:ring-transparent">
            <div className="space-y-6 border-y-2 py-3">
              <FormField
                control={form.control}
                name="soilName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soil Name <span className="font-semibold">(optional)</span></FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter soil name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description <span className="font-semibold">(optional)</span></FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter description" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color <span className="font-semibold">(optional)</span></FormLabel>
                    <FormControl>
                      <Input type="color" {...field} className="p-1"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2 flex justify-between">
              <Button type="submit" className="w-28" disabled={!isDirty || isSubmitting}>
                {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : ("Save")}
              </Button>
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={router.back}>Close</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="parameters" className="focus-visible:ring-transparent">
            <div className="space-y-6 border-y-2 py-3">
              <div className="flex gap-4 items-start">
                <FormField
                  control={form.control}
                  name="startDepth"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Start Depth (m)</FormLabel>
                      <FormControl>
                        <NumberInput field={field} placeholder="0"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDepth"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>End Depth (m)</FormLabel>
                      <FormControl>
                        <NumberInput field={field} placeholder="0"/>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="yMoist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moist Unit Weight (γMoist)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <NumberInput field={field} placeholder="0"/>
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
                    <FormLabel>Saturated Unit Weight (γSat)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <NumberInput field={field} placeholder="0"/>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">kN/m³</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SPT N-Value</FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2 flex justify-between">
              <Button type="submit" className="w-28" disabled={!isDirty || isSubmitting}>
                {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : ("Save")}
              </Button>
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={router.back}>Close</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="engineered" className="focus-visible:ring-transparent">
            <div className="space-y-6 border-y-2 py-3">
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
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}

// if  n value and t is edited, then t takes precident
// if n value is edited and angle is edited, angle takes precident
// if angle and t is edited, t takes precident again 
// if n vlue and su is edited, su takes precident
// if only n value edited, it uses them numbers.

