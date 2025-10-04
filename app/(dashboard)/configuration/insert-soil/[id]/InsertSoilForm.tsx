"use client"
import { Loader2} from "lucide-react"
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { soilOptions, soilProperties } from "./soilData"
import { insertSoilSchema, TinsertSoilSchema } from "@/schemas/soilSchemas"
import { insertSoil } from "../../actions/insertSoil"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/components/NumberInput"
import Image from 'next/image'
import { SketchPicker } from 'react-color'
import { useTheme } from 'next-themes'
import lightSPTImage from '@/public/SPTNPicture.png'
import darkSPTImage from '@/public/SPTNPictureDark.png'

export function InsertSoilForm({ previousEndDepth, profileId }: { previousEndDepth?: number, profileId: string}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("soil")
  const { resolvedTheme } = useTheme()
  
  const form = useForm({
    resolver: zodResolver(insertSoilSchema),
    defaultValues: {
      start_depth: previousEndDepth || "",
      end_depth: "",
      n_value: "",
      y_moist: "",
      y_sat: "",
      soil_name: "",
      description: "",
      colour: "#000000",
      qc: "",
      qs: "",
      ks: 1,
      kc: 0.45,
      a: 1,
      nk: 15,
      nc: 7,
    }
  })
  
  const { formState: { isSubmitting } } = form
  const soilType = form.watch("soil_type")
  const soil = form.watch("soil")
  const density = form.watch("density")
  const showParametersTab = Boolean(soilType && soil && density)
  const testType = form.watch("test_type")

  useEffect(() => {
    const errorFields = Object.keys(form.formState.errors)

    if (errorFields.length === 0) return
    
    const soilTabFields = ["soil_type", "soil", "density", "soil_name", "description", "colour"]
    const parametersTabFields = ["start_depth", "end_depth", "y_moist", "y_sat", "n_value"]

    const hasSoilErrors = errorFields.some(field => soilTabFields.includes(field))
    const hasParameterErrors = errorFields.some(field => parametersTabFields.includes(field))

    if (hasSoilErrors) {
      setActiveTab("soil")
    }
    else if (hasParameterErrors) {
      setActiveTab("parameters")
    }
  }, [form.formState.errors])

  useEffect(() => {
    if (soil && density && soilProperties[soil]) {
      const values = soilProperties[soil][density]
      form.setValue("y_moist", values.yMoist)
      form.setValue("y_sat", values.ySat)
    }
  }, [soil, density, form])

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.replace('/configuration') 
    }
  }

  async function onSubmit(values: TinsertSoilSchema) {
    try {
      const result = await insertSoil(values, profileId)

      if (result.errors) {
        Object.entries(result.errors).forEach(([key, value]) => {form.setError(key as keyof TinsertSoilSchema, {message: Array.isArray(value) ? value[0] : String(value)})})
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="soil">Information</TabsTrigger>
            <TabsTrigger value="parameters" disabled={!showParametersTab}>Parameters</TabsTrigger>
          </TabsList>
      
          <TabsContent value="soil" className="focus-visible:ring-transparent">
            <div className="space-y-6 border-y-2 py-3">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                <FormField
                  control={form.control}
                  name="soil_type"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel htmlFor="soil_type">Soil Type</FormLabel>
                      <Select onValueChange={(value) => {field.onChange(value); form.setValue("soil", "")}} defaultValue={field.value} name={field.name}>
                        <FormControl>
                          <SelectTrigger className="w-full" id="soil_type">
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
                      <FormLabel htmlFor="density">Soil Density</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                        <FormControl>
                          <SelectTrigger className="w-full" id="density">
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
                  <FormItem>
                    <FormLabel htmlFor="soil">Soil</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""} name={field.name}>
                      <FormControl>
                        <SelectTrigger className="w-full" id="soil">
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
                      <Input type="text" placeholder="Brief description of the soils composition" {...field} className="text-sm"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                <FormField
                  control={form.control}
                  name="soil_name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Soil Name <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Custom label for soil layer" {...field} className="text-sm"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                  
                <FormField
                  control={form.control}
                  name="colour"
                  render={({ field }) => (
                    <FormItem className="w-full sm:w-32">
                      <FormLabel htmlFor="colour">Colour <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button id="colour" variant="outline" className="p-2"><span style={{ backgroundColor: field.value}} className="size-full"></span></Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 w-auto rounded-sm" align="end" side="top">
                            <SketchPicker color={field.value} onChangeComplete={(color) => field.onChange(color.hex)} className="text-black" disableAlpha={true}
                            presetColors={['#8B7355', '#A0522D', '#CD853F', '#D2691E', '#654321', '#0F903A', '#DEB887', '#BC9A6A', '#8FBC8F', '#696969', '#2F4F4F', '#708090', '#A9A9A9', '#D3D3D3', '#1C1C1C', '#F5DEB3']}/>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" className="w-18" variant="outline" onClick={handleClose}>Close</Button>
              <Button type="button" className="w-32" onClick={() => showParametersTab && setActiveTab("parameters")} disabled={!showParametersTab}>Next</Button>
            </div>
          </TabsContent>

          <TabsContent value="parameters" className="focus-visible:ring-transparent">
            <div className="space-y-6 border-y-2 py-3">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                <FormField
                  control={form.control}
                  name="start_depth"
                  render={({ field }) => (
                    <FormItem className="sm:w-27">
                      <FormLabel>Start Depth <span className="font-semibold -ml-1">(m)</span></FormLabel>
                      <FormControl>
                        <NumberInput field={field} placeholder="0" disabled className="text-sm font-semibold"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="end_depth"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>End Depth <span className="font-semibold -ml-1">(m)</span></FormLabel>
                      <FormControl>
                        <NumberInput field={field} placeholder="0" className="text-sm"/>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="y_moist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moist Weight <span className="font-semibold -ml-1">(kN/m³)</span></FormLabel>  
                    <FormControl>
                      <NumberInput field={field} placeholder="0" className="text-sm"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="y_sat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saturated Weight <span className="font-semibold -ml-1">(kN/m³)</span></FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0" className="text-sm"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-sm leading-none mb-1.5 ml-1">Soil Test Method</p>
              <div className="border border-input rounded-sm p-2 space-y-4">
                <FormField
                  control={form.control}
                  name="test_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} name={field.name} className="flex flex-col space-x-4 sm:flex-row pt-1 px-2">
                          <FormItem className="flex items-center">
                            <FormControl>
                              <RadioGroupItem value="spt" id="spt"/>
                            </FormControl>
                            <FormLabel htmlFor="spt">Standard Penetration Test</FormLabel>
                          </FormItem>
                          
                          <FormItem className="flex items-center">
                            <FormControl>
                              <RadioGroupItem value="cpt" id="cpt"/>
                            </FormControl>
                            <FormLabel htmlFor="cpt">Cone Penetration Test</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="mt-2"/>
                    </FormItem>
                  )}
                />
              
                {testType === "spt" && (
                  <FormField
                    control={form.control}
                    name="n_value"
                    render={({ field }) => (
                      <FormItem className="relative pt-2">
                        <FormLabel>SPT N-Value</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="link" className="absolute -top-0.5 -right-2 text-blue-500 text-xs">I dont have SPT N-Value</Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" side="top" sideOffset={-2} className="w-sm m:w-lg md:w-xl lg:w-2xl dark:bg-black rounded-none p-1">
                              <Image src={resolvedTheme === "dark" ? darkSPTImage : lightSPTImage} placeholder="blur" alt="SPT N-Value Guide Picture"/>
                            </PopoverContent>
                          </Popover>
                        <FormControl>
                          <NumberInput field={field} placeholder="0" className="text-sm"/>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                )}

                {testType === "cpt" && (
                  <>  
                    {soilType === "fine" ? (
                      <>
                        <FormField
                          control={form.control}
                          name="qc"
                          render={({ field }) => (
                            <FormItem className="pt-2">
                              <FormLabel>Cone Tip Resistance<span className="font-semibold -ml-1">(kPa)</span></FormLabel>
                              <FormControl>
                                <NumberInput field={field} placeholder="0" className="text-sm"/>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-4 items-start">
                          <FormField
                            control={form.control}
                            name="nk"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-xs -mb-1.5">Cone Factor</FormLabel>
                                <FormControl>
                                  <NumberInput field={field} placeholder="15" className="text-sm"/>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="nc"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-xs -mb-1.5">Capacity Factor</FormLabel>
                                <FormControl>
                                  <NumberInput field={field} placeholder="7" className="text-sm"/>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="a"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-xs -mb-1.5">Pore Factor</FormLabel>
                                <FormControl>
                                  <NumberInput field={field} placeholder="1" className="text-sm"/>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <FormField
                          control={form.control}
                          name="qs"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cone Sleeve Resistance<span className="font-semibold -ml-1">(kPa)</span></FormLabel>
                              <FormControl>
                                <NumberInput field={field} placeholder="0" className="text-sm"/>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="qc"
                          render={({ field }) => (
                            <FormItem className="pt-2">
                              <FormLabel>Cone Tip Resistance<span className="font-semibold -ml-1">(kPa)</span></FormLabel>
                              <FormControl>
                                <NumberInput field={field} placeholder="0" className="text-sm"/>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-4 items-start">
                          <FormField
                            control={form.control}
                            name="ks"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-xs -mb-1.5">Cone Factor</FormLabel>
                                <FormControl>
                                  <NumberInput field={field} placeholder="1" className="text-sm"/>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="kc"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-xs -mb-1.5">Capacity Factor</FormLabel>
                                <FormControl>
                                  <NumberInput field={field} placeholder="0.45" className="text-sm"/>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" className="w-18" variant="outline" disabled={isSubmitting} onClick={() => setActiveTab("soil")}>Back</Button>
              <Button type="submit" className="w-32" disabled={isSubmitting}> {isSubmitting ? (<> <Loader2 className="size-5 animate-spin"/> Submitting... </>) : ("Submit")}</Button>
            </div>
          </TabsContent>

        </Tabs>
      </form>
    </Form>
  )
}