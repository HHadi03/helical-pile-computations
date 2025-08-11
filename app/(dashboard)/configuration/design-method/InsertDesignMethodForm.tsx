"use client"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { insertDesignMethodSchema, TinsertDesignMethodSchema } from "@/schemas/designMethodSchemas"
import { insertDesignMethod } from "../actions/insertDesignMethod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/components/NumberInput"
import { Loader2 } from "lucide-react"

type SoilProfile = {
  id: string
  profile_name: string
  effective_pile_length: number
}

interface InsertDesignMethodFormProps {
  soilProfiles: SoilProfile[]
}

export function InsertDesignMethodForm({ soilProfiles }: InsertDesignMethodFormProps) {
  const router = useRouter()
  
  const form = useForm({
    resolver: zodResolver(insertDesignMethodSchema),
    defaultValues: {}
  })

  const { formState: { isDirty, isSubmitting } } = form
  const selectedMethod = form.watch("safety_design_method")

  async function onSubmit(values: TinsertDesignMethodSchema) {
    try {
      const result = await insertDesignMethod(values)

      if (result.errors) {
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

          {/* Method 1 - Design by calculation (BS 8004) */}
          {selectedMethod === "method_bs" && (
            <>
              <FormField
                control={form.control}
                name="soil_configuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="soil_configuration">Soil Profile</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                      <FormControl>
                        <SelectTrigger className="w-full" id="soil_configuration">
                          <SelectValue placeholder="Select soil profile"/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {soilProfiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.profile_name || `Profile ${profile.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pile_diameter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="pile_diameter">Pile Diameter</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                      <FormControl>
                        <SelectTrigger className="w-full" id="pile_diameter">
                          <SelectValue placeholder="Select pile diameter"/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="60">60mm</SelectItem>
                        <SelectItem value="100">100mm</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="applied_load"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Applied Load <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="safety_factor_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety Factor</FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Method 2 - Design by calculation (EN 1997-1) */}
          {selectedMethod === "method_en" && (
            <>
              <FormField
                control={form.control}
                name="soil_configuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="soil_configuration">Soil Profile</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                      <FormControl>
                        <SelectTrigger className="w-full" id="soil_configuration">
                          <SelectValue placeholder="Select soil profile"/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {soilProfiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.profile_name || `Profile ${profile.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pile_diameter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="pile_diameter">Pile Diameter</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                      <FormControl>
                        <SelectTrigger className="w-full" id="pile_diameter">
                          <SelectValue placeholder="Select pile diameter"/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="60">60mm</SelectItem>
                        <SelectItem value="100">100mm</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="country">Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                      <FormControl>
                        <SelectTrigger className="w-full" id="country">
                          <SelectValue placeholder="Select country"/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nl">Netherlands</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="pl">Poland</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permanent_actions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permanent Actions <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="variable_actions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variable Actions <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="use_characteristic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Use characteristic value
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="structure_rigid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Structure rigid
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Method 3 - Design by testing */}
          {selectedMethod === "method_test" && (
            <>
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="country">Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                      <FormControl>
                        <SelectTrigger className="w-full" id="country">
                          <SelectValue placeholder="Select country"/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nl">Netherlands</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="pl">Poland</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="number_of_tests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Tests</FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permanent_actions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permanent Actions <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="variable_actions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variable Actions <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_rcal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rck Min Value <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mean_rcal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rck Mean Value <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <div className="pt-2 flex justify-between">
          <Button type="submit" className="w-28" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={router.back}>
            Close
          </Button>
        </div>
      </form>
    </Form>
  )
}