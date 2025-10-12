"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { TconfigSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { exportFormSchema, TexportFormSchema } from "@/schemas/exportSchema"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { NumberInput, SafetyNumberInput } from "@/components/NumberInput"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Fragment, useEffect } from "react"

export function ExportForm({ soilProfiles }: { soilProfiles: TconfigSoilProfileSchema[] }) {
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      job_number: "",
      job_location: "",
      pile_number: "",
      checked_by: "",
      
      show_description: true,
      show_spt: true,
      show_moist: true,
      show_sat: true,
      show_shear_strength: true,
      soil_notes: "",
      
      applied_tension_load: "",
      applied_compression_load: "",
      permanent_tension_load: "",
      variable_tension_load: "",
      permanent_compression_load: "",
      variable_compression_load: "",
      horizontal_load: "",
      horizontal_load_safety_factor: 1,
      structure_rigid: false,
      use_characteristic: false,
      standard_compressive_resistance: "",
      standard_tensile_resistance: "",
      number_of_tests: "",
      mean_tensile_resistance: "",
      min_tensile_resistance: "",
      mean_compressive_resistance: "",
      min_compressive_resistance: "",
      design_notes: "",
      
      global_safety_factor: 1.5,
      uk_safety_factor_tension_yg1: 1.0,
      uk_safety_factor_tension_yq1: 0,
      uk_safety_factor_tension_yt1: 1.25,
      uk_safety_factor_tension_yg2: 1.0,
      uk_safety_factor_tension_yq2: 0,
      uk_safety_factor_tension_yt2: 1.7,
      uk_safety_factor_compression_yg1: 1.35,
      uk_safety_factor_compression_yq1: 1.5,
      uk_safety_factor_compression_yt1: 1.0,
      uk_safety_factor_compression_yg2: 1.0,
      uk_safety_factor_compression_yq2: 1.3,
      uk_safety_factor_compression_yt2: 1.5,
      pl_safety_factor_tension_yg: 1.0,
      pl_safety_factor_tension_yq: 0,
      pl_safety_factor_tension_yt: 1.15,
      pl_safety_factor_compression_yg: 1.35,
      pl_safety_factor_compression_yq: 1.5,
      pl_safety_factor_compression_yt: 1.1,
      nl_safety_factor_tension_yg: 1.0,
      nl_safety_factor_tension_yq: 0,
      nl_safety_factor_tension_yt: 1.25,
      nl_safety_factor_compression_yg: 1.0,
      nl_safety_factor_compression_yq: 1.3,
      nl_safety_factor_compression_yt: 1.15,

      nominal_stress_area: "",
      ultimate_tensile_strength_a480: 800,
      k2: 0.9,
      ultimate_tensile_strength_lm25m: 160,
      thread_engagement_length: 70,
      pitch_diameter: "",
      pile_gross_area: 2678,
      proof_strength: 80,
      partial_safety_factor_1: 1.1,
      partial_safety_factor_2: 1.25,
      pile_notes: "",
    }
  })

  const { formState: { isSubmitting } } = form
  const selectedMethod = form.watch("design_method")
  const selectedCountry = form.watch("country")
  const showCharacteristic = form.watch("use_characteristic")
  const pileDiameter = form.watch("pile_diameter")

  useEffect(() => {
    if (pileDiameter === "60") {
      form.setValue("nominal_stress_area", 84.3)
      form.setValue("pitch_diameter", 10.863)
    }

    else {
      form.setValue("nominal_stress_area", 245)
      form.setValue("pitch_diameter", 18.376)
    }
  }, [form, pileDiameter])

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.replace('/configuration') 
    }
  }

  async function onSubmit(values: TexportFormSchema) {
    try {
      const response = await fetch('/export/api', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(values),
      })
 
      if (!response.ok) {
       const { error } = await response.json()
        alert(error) 
      }

      else {
        const pdfBlob = await response.blob()
        const url = window.URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `helical-piles-computations-report.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        // handleClose()
      }
    }

    catch {
      console.log("Unexpected error occured")
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-6 py-3">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Configure Project Information</h2>
              <p className="text-sm text-muted-foreground mt-1">Enter project and pile details you wish to include in the report</p>
            </div>
            
            <FormField
              control={form.control}
              name="pile_diameter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="pile_diameter">Pile Diameter <span className="font-semibold -ml-1">(mm)</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                    <FormControl>
                      <SelectTrigger className="w-full" id="pile_diameter">
                        <SelectValue placeholder="Select pile diameter"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="60">60 mm</SelectItem>
                      <SelectItem value="100">100 mm</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage/>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="pile_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pile Number <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="HP-003" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="job_location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Location <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Farnborough, Hampshire" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="job_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Number <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Project-AX34" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checked_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Checked By <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Configure Soil Profile</h2>
              <p className="text-sm text-muted-foreground mt-1">Select the soil profile and properties you wish to include in the report</p>
            </div>
            
            <FormField
              control={form.control}
              name="soil_profile_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="soil_profile_id">Soil Profile</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                    <FormControl>
                      <SelectTrigger className="w-full truncate" id="soil_profile_id">
                        <SelectValue placeholder="Select soil profile"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {soilProfiles.map((profile, index) => (<SelectItem key={profile.id} value={profile.id}> {profile.profile_name || `Soil Profile ${index + 1}`} </SelectItem>))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="show_description"
              render={({ field }) => (
                <FormItem className="flex items-center border py-3 px-2 rounded-md">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} name={field.name} id="show_description"/>
                  </FormControl>
                  <FormLabel htmlFor="show_description">Show Soil Description</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="show_spt"
              render={({ field }) => (
                <FormItem className="flex items-center border py-3 px-2 rounded-md">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} name={field.name} id="show_spt"/>
                  </FormControl>
                  <FormLabel htmlFor="show_spt">Show SPT N-Value</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="show_moist"
              render={({ field }) => (
                <FormItem className="flex items-center border py-3 px-2 rounded-md">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} name={field.name} id="show_moist"/>
                  </FormControl>
                  <FormLabel htmlFor="show_moist">Show Moist Unit Weight</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="show_sat"
              render={({ field }) => (
                <FormItem className="flex items-center border py-3 px-2 rounded-md">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} name={field.name} id="show_sat"/>
                  </FormControl>
                  <FormLabel htmlFor="show_sat">Show Saturated Unit Weight</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="show_shear_strength"
              render={({ field }) => (
                <FormItem className="flex items-center border py-3 px-2 rounded-md">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} name={field.name} id="show_shear_strength"/>
                  </FormControl>
                  <FormLabel htmlFor="show_shear_strength">Show Shear Strength</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="soil_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter any additional information" className="resize-none"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Configure Design Method</h2>
              <p className="text-sm text-muted-foreground mt-1">Define the method and parameters you wish to use for soil load testing</p>
            </div>
            
            <FormField
              control={form.control}
              name="design_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="design_method">Design Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                    <FormControl>
                      <SelectTrigger className="w-full" id="design_method">
                        <SelectValue placeholder="Select design method"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="method_bs">Design by calculation (BS 8004)</SelectItem>
                      <SelectItem value="method_en">Design by calculation (EN 1997-1)</SelectItem>
                      <SelectItem value="method_test">Design by testing</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage/>
                </FormItem>
              )}
            />

            {selectedMethod === "method_bs" && (
              <>
                <FormField
                  control={form.control}
                  name="applied_tension_load"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applied Tension Load <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                      <FormControl>
                        <NumberInput field={field} placeholder="0"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applied_compression_load"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applied Compression Load <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                      <FormControl>
                        <NumberInput field={field} placeholder="0"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                  <FormField
                    control={form.control}
                    name="horizontal_load"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Horizontal Load <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horizontal_load_safety_factor"
                    render={({ field }) => (
                      <FormItem className="sm:w-38">
                        <FormLabel>Horizontal Load Factor</FormLabel>
                        <FormControl>
                          <SafetyNumberInput field={field} placeholder="1"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="global_safety_factor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Global Safety Factor</FormLabel>
                      <FormControl>
                        <SafetyNumberInput field={field} placeholder="1.5"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {(selectedMethod === "method_test" || selectedMethod === "method_en") && (
              <>
                <FormField
                  control={form.control}
                  name="permanent_tension_load"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permanent Tension Load <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                      <FormControl>
                        <NumberInput field={field} placeholder="0"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="variable_tension_load"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variable Tension Load <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                      <FormControl>
                        <NumberInput field={field} placeholder="0"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="permanent_compression_load"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permanent Compression Load <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                      <FormControl>
                        <NumberInput field={field} placeholder="0"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="variable_compression_load"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variable Compression Load <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                      <FormControl>
                        <NumberInput field={field} placeholder="0"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                  <FormField
                    control={form.control}
                    name="horizontal_load"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Horizontal Load <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horizontal_load_safety_factor"
                    render={({ field }) => (
                      <FormItem className="sm:w-38">
                        <FormLabel>Horizontal Load Factor</FormLabel>
                        <FormControl>
                          <SafetyNumberInput field={field} placeholder="1"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="use_characteristic"
                  render={({ field }) => (
                    <FormItem className="flex items-center border py-3 px-2 rounded-md">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} name={field.name} id="use_characteristic"/>
                      </FormControl>
                        <FormLabel htmlFor="use_characteristic">Use Characteristic Values</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {selectedMethod === "method_en" && ( 
              showCharacteristic ? (
                <FormField
                  control={form.control}
                  name="structure_rigid"
                  render={({ field }) => (
                    <FormItem className="flex items-center border py-3 px-2 rounded-md">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} name={field.name} id="structure_rigid"/>
                      </FormControl>
                        <FormLabel htmlFor="structure_rigid">Is the Structure Rigid?</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                null
              )
            )}

            {selectedMethod === "method_test" && (
              showCharacteristic ? (
                <Fragment key="characteristic-fields">
                  <FormField
                    control={form.control}
                    name="number_of_tests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number Of Tests</FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mean_tensile_resistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mean Tensile Resistance <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="min_tensile_resistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Tensile Resistance <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mean_compressive_resistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mean Compressive Resistance <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="min_compressive_resistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Compressive Resistance <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Fragment>
              ) : (
                <Fragment key="standard-fields">
                  <FormField
                    control={form.control}
                    name="standard_tensile_resistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tensile Resistance <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="standard_compressive_resistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compressive Resistance <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Fragment>
              )
            )}

            {(selectedMethod === "method_test" || selectedMethod === "method_en") && (
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel htmlFor="country">Design Approach</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name} autoComplete="off">
                        <FormControl>
                          <SelectTrigger className="w-full" id="country" >
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="pl">Poland</SelectItem>
                          <SelectItem value="nl">Netherlands</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid gap-2">
                  <FormLabel>Safety Factors</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">Toggle</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full" align="end" side="top">
                      
                      {selectedCountry === "uk" ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold">Tension</h4>
                            <FormField
                              control={form.control}
                              name="uk_safety_factor_tension_yg1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Permanent Load Factor (γG)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.35"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="uk_safety_factor_tension_yq1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Variable Load Factor (γQ)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.5"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="uk_safety_factor_tension_yt1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Resistance Factor (γT)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.0"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="uk_safety_factor_tension_yg2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Permanent Load Factor (γG)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.0"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="uk_safety_factor_tension_yq2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Variable Load Factor (γQ)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.3"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="uk_safety_factor_tension_yt2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Resistance Factor (γT)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.5"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold">Compression</h4>
                            <FormField
                              control={form.control}
                              name="uk_safety_factor_compression_yg1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Permanent Load Factor (γG)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.0"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="uk_safety_factor_compression_yq1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Variable Load Factor (γQ)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="0"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="uk_safety_factor_compression_yt1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Resistance Factor (γT)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.25"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="uk_safety_factor_compression_yg2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Permanent Load Factor (γG)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.0"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="uk_safety_factor_compression_yq2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Variable Load Factor (γQ)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="0"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="uk_safety_factor_compression_yt2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Resistance Factor (γT)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.7"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                          
                      ) : selectedCountry === "pl" ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold">Tension</h4>
                            <FormField
                              control={form.control}
                              name="pl_safety_factor_tension_yg"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Permanent Load Factor (γG)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.0"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="pl_safety_factor_tension_yq"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Variable Load Factor (γQ)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="0"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="pl_safety_factor_tension_yt"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Resistance Factor (γT)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.15"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold">Compression</h4>
                            <FormField
                              control={form.control}
                              name="pl_safety_factor_compression_yg"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Permanent Load Factor (γG)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.35"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="pl_safety_factor_compression_yq"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Variable Load Factor (γQ)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.5"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="pl_safety_factor_compression_yt"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Resistance Factor (γT)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.1"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      
                      ) : selectedCountry === "nl" ? ( 
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold">Tension</h4>
                            <FormField
                              control={form.control}
                              name="nl_safety_factor_tension_yg"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Permanent Load Factor (γG)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.0"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="nl_safety_factor_tension_yq"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Variable Load Factor (γQ)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="0"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="nl_safety_factor_tension_yt"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Resistance Factor (γT)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.25"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold">Compression</h4>
                            <FormField
                              control={form.control}
                              name="nl_safety_factor_compression_yg"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Permanent Load Factor (γG)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.0"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="nl_safety_factor_compression_yq"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Variable Load Factor (γQ)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.3"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="nl_safety_factor_compression_yt"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Resistance Factor (γT)</FormLabel>
                                  <FormControl>
                                    <SafetyNumberInput field={field} placeholder="1.15"/>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
              
                      ) : (
                        <p className="text-sm">Please select a country first</p>
                      )}

                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          
            <FormField
              control={form.control}
              name="design_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter any additional information" className="resize-none"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Configure Helical Pile Structure</h2>
              <p className="text-sm text-muted-foreground mt-1">Confirm the pile parameters you wish to use for pile load testing</p>
            </div>

            <FormField
              control={form.control}
              name="nominal_stress_area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nominal Stress Area <span className="font-semibold -ml-1">(mm²)</span></FormLabel>
                  <FormControl>
                    <NumberInput field={field} placeholder="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ultimate_tensile_strength_a480"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ultimate Tensile Strength for A4-80 <span className="font-semibold -ml-1">(N/mm²)</span></FormLabel>
                  <FormControl>
                    <NumberInput field={field} placeholder="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="k2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Steel Bolt Coefficient</FormLabel>
                  <FormControl>
                    <NumberInput field={field} placeholder="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ultimate_tensile_strength_lm25m"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ultimate Tensile Strength for LM25-M <span className="font-semibold -ml-1">(N/mm²)</span></FormLabel>
                  <FormControl>
                    <NumberInput field={field} placeholder="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thread_engagement_length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thread Engagement Length <span className="font-semibold -ml-1">(mm)</span></FormLabel>
                  <FormControl>
                    <NumberInput field={field} placeholder="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pitch_diameter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pitch Diameter <span className="font-semibold -ml-1">(mm)</span></FormLabel>
                  <FormControl>
                    <NumberInput field={field} placeholder="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pile_gross_area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Gross Area of the Pile Cross Section <span className="font-semibold -ml-1">(mm²)</span>
                  </FormLabel>
                  <FormControl>
                    <NumberInput field={field} placeholder="0"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="proof_strength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>0.2% Proof Strength <span className="font-semibold -ml-1">(N/mm²)</span></FormLabel>
                  <FormControl>
                    <NumberInput field={field} placeholder="0"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
              <FormField
                control={form.control}
                name="partial_safety_factor_1"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Partial Safety Factor (γ₁)</FormLabel>
                    <FormControl>
                      <SafetyNumberInput field={field} placeholder="1.10"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partial_safety_factor_2"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Partial Safety Factor (γ₂)</FormLabel>
                    <FormControl>
                      <SafetyNumberInput field={field} placeholder="1.25"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="pile_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter any additional information" className="resize-none"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      
        <Button type="submit" className="w-32" disabled={isSubmitting}> {isSubmitting ? (<> <Loader2 className="mr-2 size-4 animate-spin"/>Exporting... </>) : ("Export")}</Button>
      </form>
    </Form>
  )
}