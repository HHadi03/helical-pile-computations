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
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NumberInput } from "@/components/NumberInput"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function ExportForm({ soilProfiles }: { soilProfiles: TconfigSoilProfileSchema[] }) {
  const router = useRouter()
   const [activeTab, setActiveTab] = useState("project")

  const form = useForm({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      job_number: "",
      job_location: "",
      pile_number: "",
      additional_information: "",
      applied_load: "",
      permanent_actions: "",
      variable_actions: "",
      structure_rigid: false,
      use_characteristic: false,
      number_of_tests: "",
      mean_tensile_rcm: "",
      min_tensile_rcm: "",
      mean_compression_rcm: "",
      min_compression_rcm: "",
      global_safety_factor: 1.5,
      uk_safety_factor_compression_yG1: 1.35,
      uk_safety_factor_compression_yQ1: 1.5,
      uk_safety_factor_compression_yT1: 1.0,
      uk_safety_factor_compression_yG2: 1.0,
      uk_safety_factor_compression_yQ2: 1.3,
      uk_safety_factor_compression_yT2: 1.5,
      uk_safety_factor_tension_yG1: 1.0,
      uk_safety_factor_tension_yQ1: 0,
      uk_safety_factor_tension_yT1: 1.25,
      uk_safety_factor_tension_yG2: 1.0,
      uk_safety_factor_tension_yQ2: 0,
      uk_safety_factor_tension_yT2: 1.7,
      pl_safety_factor_compression_yG: 1.35,
      pl_safety_factor_compression_yQ: 1.5,
      pl_safety_factor_compression_yT: 1.1,
      pl_safety_factor_tension_yG: 1.0,
      pl_safety_factor_tension_yQ: 0,
      pl_safety_factor_tension_yT: 1.15,
      nl_safety_factor_compression_yG: 1.0,
      nl_safety_factor_compression_yQ: 1.3,
      nl_safety_factor_compression_yT: 1.15,
      nl_safety_factor_tension_yG: 1.0,
      nl_safety_factor_tension_yQ: 0,
      nl_safety_factor_tension_yT: 1.25,
    }
  })

  const { formState: { isSubmitting } } = form

  const selectedMethod = form.watch("safety_design_method")
  const selectedCountry = form.watch("country")
  const showRigid = form.watch("use_characteristic")

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
        const errorData = await response.json()
        console.log(errorData.message)
      }

      // Get the PDF blob
      const pdfBlob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `helical-piles-computations-export.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // handleClose()
    }

    catch (error) {
      console.error("SOMETHING WENT WRONG WITH PDF EXPORT SUBMIT" + error)
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="project">Project</TabsTrigger>
            <TabsTrigger value="methods">Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="project" className="focus-visible:ring-transparent">
            <div className="space-y-6 border-y-2 py-3">
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
                name="job_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Location <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Farnborough, Hampshire" {...field} className="text-sm"/>
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
                      <Input placeholder="Project-AX34" {...field} className="text-sm"/>
                    </FormControl>
                    <FormMessage />
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
                      <Input placeholder="HP-003" {...field} className="text-sm"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additional_information"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter any additional information" className="text-sm resize-none"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2 flex justify-between">
              <Button type="button" variant="outline" onClick={handleClose}>Close</Button>
              <Button type="button" className="w-32" onClick={() => setActiveTab("methods")}>Next</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="methods" className="focus-visible:ring-transparent">
            <div className="space-y-6 border-y-2 py-3">
              
              <FormField
                control={form.control}
                name="safety_design_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="safety_design_method">Safety Design Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                      <FormControl>
                        <SelectTrigger className="w-full" id="safety_design_method">
                          <SelectValue placeholder="Select safety design method"/>
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
                    name="applied_load"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Applied Load <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0" className="text-sm"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="global_safety_factor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Global Safety Factor</FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0" className="text-sm"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {selectedMethod === "method_en" && (
                <>
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

                  {showRigid && (
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
                  )}
                </>
              )}

              {selectedMethod === "method_test" && (
                <>
                  <FormField
                    control={form.control}
                    name="number_of_tests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number Of Tests</FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0" className="text-sm"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mean_tensile_rcm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mean Tensile Capacity <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0" className="text-sm"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="min_tensile_rcm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Tensile Capacity <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0" className="text-sm"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mean_compression_rcm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mean Compression Capacity <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0" className="text-sm"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="min_compression_rcm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Compression Capacity <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0" className="text-sm"/>
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
                    name="permanent_actions"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Permanent Actions <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0" className="text-sm"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="variable_actions"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Variable Actions <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                        <FormControl>
                          <NumberInput field={field} placeholder="0" className="text-sm"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel htmlFor="country">Country</FormLabel>
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
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="p-2 w-30">Safety Factors</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full" align="end" side="top">
                        
                        {selectedCountry ? (
                          <>
                            {selectedCountry === "uk" && (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <h4 className="text-xs font-semibold">Tension</h4>
                                    <FormField
                                      control={form.control}
                                      name="uk_safety_factor_tension_yG1"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yG1 (Tension)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.35" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="uk_safety_factor_tension_yQ1"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yQ1 (Tension)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.5" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="uk_safety_factor_tension_yT1"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yT1 (Tension)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.0" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name="uk_safety_factor_tension_yG2"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yG2 (Tension)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.0" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="uk_safety_factor_tension_yQ2"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yQ2 (Tension)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.3" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name="uk_safety_factor_tension_yT2"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yT2 (Tension)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.0" className="text-sm" />
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
                                      name="uk_safety_factor_compression_yG1"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yG1 (Compression)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.35" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="uk_safety_factor_compression_yQ1"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yQ1 (Compression)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.5" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="uk_safety_factor_compression_yT1"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yT1 (Compression)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.0" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="uk_safety_factor_compression_yG2"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yG2 (Compression)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.0" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="uk_safety_factor_compression_yQ2"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yQ2 (Compression)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.3" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="uk_safety_factor_compression_yT2"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yT2 (Compression)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.0" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                  </div>
                                </div>
                              </>
                            )}

                            {selectedCountry === "pl" && (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <h4 className="text-xs font-semibold">Tension</h4>
                                    <FormField
                                      control={form.control}
                                      name="pl_safety_factor_tension_yG"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yG (Tension)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.35" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="pl_safety_factor_tension_yQ"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yQ (Tension)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.5" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="pl_safety_factor_tension_yT"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yT (Tension)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.0" className="text-sm" />
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
                                      name="pl_safety_factor_compression_yG"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yG (Compression)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.35" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="pl_safety_factor_compression_yQ"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yQ (Compression)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.5" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="pl_safety_factor_compression_yT"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yT (Compression)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.0" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                  </div>
                                </div>
                              </>
                            )}

                            {selectedCountry === "nl" && (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <h4 className="text-xs font-semibold">Tension</h4>
                                    <FormField
                                      control={form.control}
                                      name="nl_safety_factor_tension_yG"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yG (Tension)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.35" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="nl_safety_factor_tension_yQ"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yQ (Tension)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.5" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="nl_safety_factor_tension_yT"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yT (Tension)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.0" className="text-sm" />
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
                                      name="nl_safety_factor_compression_yG"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yG (Compression)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.35" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="nl_safety_factor_compression_yQ"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yQ (Compression)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.5" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name="nl_safety_factor_compression_yT"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>yT (Compression)</FormLabel>
                                          <FormControl>
                                            <NumberInput field={field} placeholder="1.0" className="text-sm" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                  </div>
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="text-sm">
                            Please select a country first
                          </div>
                        )}

                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}
            </div>
            
            <div className="pt-2 flex justify-between">
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setActiveTab("project")}>Back</Button>
              <Button type="submit" className="w-32" disabled={isSubmitting}> {isSubmitting ? (<> <Loader2 className="mr-2 size-4 animate-spin"/>Exporting... </>) : ("Export")}</Button>
            </div>
          </TabsContent>

        </Tabs>
      </form>
    </Form>
  )
}