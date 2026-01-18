"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { TeditSoilParametersSchema, editSoilParametersSchema } from "@/schemas/soilSchemas"
import { updateSoilParameters } from "../../actions/updateSoilParameters"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/components/NumberInput"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useTheme } from 'next-themes'
import lightSPTImage from '@/public/SPTNPicture.png'
import darkSPTImage from '@/public/SPTNPictureDark.png'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from "next/image"

export function EditSoilParameters({ soil, soilId }: { soil: TeditSoilParametersSchema, soilId: string }) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()

  const form = useForm({
    resolver: zodResolver(editSoilParametersSchema),
    defaultValues: { ...soil }
  })
  
  const { formState: { isDirty, isSubmitting, dirtyFields } } = form
  const testType = form.watch("test_type")

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.replace('/configuration') 
    }
  }

  async function onSubmit(values: TeditSoilParametersSchema) {
    try {
      const result = await updateSoilParameters(values, soilId, dirtyFields)

      if (result.errors) {
        Object.entries(result.errors).forEach(([key, value]) => {form.setError(key as keyof TeditSoilParametersSchema, {message: value[0]})})
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
          <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
            <FormField
              control={form.control}
              name="start_depth"
              render={({ field }) => (
                <FormItem className="sm:w-27">
                  <FormLabel>Start Depth <span className="font-semibold -ml-1">(m)</span></FormLabel>
                  <FormControl>
                    <NumberInput field={field} placeholder="0" disabled/>
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
                    <NumberInput field={field} placeholder="0"/>
                  </FormControl>
                  <FormMessage />
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
                  <NumberInput field={field} placeholder="0"/>
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
                  <NumberInput field={field} placeholder="0"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-sm leading-none mb-1.5 ml-1">Soil Test Method</p>
          <div className="border border-input dark:bg-input/30 rounded-sm p-2 space-y-4">
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
                  <FormMessage />
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
                          <Button variant="link" className="hidden sm:block text-blue-500 text-xs absolute -top-0.5 -right-2">I dont have SPT N-Value</Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" side="top" sideOffset={-2} className="w-xl md:w-2xl dark:bg-black rounded-none p-1">
                          <Image src={resolvedTheme === "dark" ? darkSPTImage : lightSPTImage} placeholder="blur" alt="SPT N-Value Guide Picture"/>
                        </PopoverContent>
                      </Popover>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
            )}

            {testType === "cpt" && (
              <>
              <p className="text-sm mb-1.5 sm:text-center italic">Shaft Capacity</p>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                <FormField
                  control={form.control}
                  name="qc"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Cone Tip Resistance <span className="font-semibold -ml-1">(kPa)</span></FormLabel>
                      <FormControl>
                        <NumberInput field={field} placeholder="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="a"
                  render={({ field }) => (
                    <FormItem className="sm:w-40">
                      <FormLabel>Alpha Factor</FormLabel>
                      <FormControl>
                        <NumberInput field={field} placeholder="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <p className="text-sm mb-1.5 sm:text-center italic">Bearing Capacity</p>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                <FormField
                  control={form.control}
                  name="qca"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Cone Tip Resistance<span className="font-semibold -ml-1">(kPa)</span></FormLabel>
                      <FormControl>
                        <NumberInput field={field} placeholder="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kc"
                  render={({ field }) => (
                    <FormItem className="sm:w-40">
                      <FormLabel>Bearing Factor</FormLabel>
                      <FormControl>
                        <NumberInput field={field} placeholder="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" className="w-18" variant="outline" disabled={isSubmitting} onClick={handleClose}>Cancel</Button>
          <Button type="submit" className="w-28" disabled={!isDirty || isSubmitting}>{isSubmitting ? (<><Loader2 className="size-5 animate-spin" />Saving...</>) : ("Save")}</Button>
        </div>
      </form>
    </Form>
  )
}