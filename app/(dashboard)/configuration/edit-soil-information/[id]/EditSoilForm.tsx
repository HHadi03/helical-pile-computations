"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { TsoilSchema, soilSchema} from "@/schemas/soilSchema"
import { updateSoil } from "@/app/(dashboard)/configuration/actions/updateSoil"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/components/NumberInput"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { soilOptions,soilProperties } from "../../insert-soil/[id]/soilData"

export function EditSoilForm({soil}: {soil: TsoilSchema}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState ("parameters")
 
  const form = useForm<TsoilSchema>({
    resolver: zodResolver(soilSchema),
    defaultValues: {...soil}
  })

  const { formState: { isDirty, isSubmitting } } = form
    const soilType = form.watch("soilType")
  
  useEffect(() => {
    const errorFields = Object.keys(form.formState.errors)

    if (errorFields.length === 0) return
    
    const soilTabFields = ["soilName", "description", "color"]
    const parametersTabFields = ["startDepth", "endDepth", "yMoist", "ySat", "nValue"]
    const engineeredTabFields = ["su", "angle", "t", "qult"]

    const hasSoilErrors = errorFields.some(field => soilTabFields.includes(field))
    const hasParameterErrors = errorFields.some(field => parametersTabFields.includes(field))
    const hasEngineeredErrors = errorFields.some(field => engineeredTabFields.includes(field))

    if (hasSoilErrors) {
      setActiveTab("soil")
    }
    else if (hasParameterErrors) {
      setActiveTab("parameters")
    }
    else if (hasEngineeredErrors) {
      setActiveTab("engineered")
    }
  }, [form.formState.errors])

  async function onSubmit(values: TsoilSchema) {
    try {
      const result = await updateSoil(values)

      if (result.errors) {
        Object.entries(result.errors).forEach(([key, value]) => {form.setError(key as keyof TsoilSchema, { message: Array.isArray(value) ? value[0] : String(value) })})
        toast.error(result.message)
      }

      else {
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
              <div className="flex gap-4 items-start">
                <FormField
                  control={form.control}
                  name="soilType"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Soil Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type"/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="coarse">Coarse Grain</SelectItem>
                          <SelectItem value="fine">Fine Grain</SelectItem>
                          <SelectItem value="manmade">Man Made</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="density"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Soil Density</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select density"/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="loose">Loose</SelectItem>
                          <SelectItem value="dense">Dense</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="soil"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Soil</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select soil"/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {soilType ? (soilOptions[soilType].map((soil) => (<SelectItem key={soil} value={soil}>{soil}</SelectItem>))
                        ) : (<SelectItem value="placeholder" disabled>Please select soil type first</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Brief description of soil composition" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 items-start">
                <FormField
                  control={form.control}
                  name="soilName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Soil Name <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Custom label for soil layer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormLabel>Color <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                      <FormControl>
                        <Input type="color" {...field} className="p-1"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                      <FormLabel>Start Depth <span className="font-semibold -ml-1">(m)</span></FormLabel>
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
                      <FormLabel>End Depth <span className="font-semibold -ml-1">(m)</span></FormLabel>
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
                    <FormLabel>Moist Unit Weight <span className="font-semibold -ml-1">(γMoist)</span></FormLabel>
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
                    <FormLabel>Saturated Unit Weight <span className="font-semibold -ml-1">(γSat)</span></FormLabel>
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
                        <FormLabel>Undrained Shear Soil Strength <span className="font-semibold -ml-1">(Su)</span></FormLabel>
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
                        <FormLabel>Angle of Internal Friction <span className="font-semibold -ml-1">(φ)</span></FormLabel>
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
                        <FormLabel>Shear Soil Strength <span className="font-semibold -ml-1">(T)</span></FormLabel>
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
                      <FormLabel>Ultimate Bearing Pressure <span className="font-semibold -ml-1">(Qult)</span></FormLabel>
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
              <Button type="submit" className="w-28" disabled={!isDirty || isSubmitting}> {isSubmitting ? (<><Loader2 className="mr-2 size-4 animate-spin" />Saving...</>) : ("Save")}</Button>
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={router.back}>Close</Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}
