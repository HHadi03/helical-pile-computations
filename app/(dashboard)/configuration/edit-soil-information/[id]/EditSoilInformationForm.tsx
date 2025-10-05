"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { TeditSoilInformationSchema, editSoilInformationSchema } from "@/schemas/soilSchemas"
import { updateSoilInformation } from "@/app/(dashboard)/configuration/actions/updateSoilInformation"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from "@/components/ui/input"
import { SketchPicker } from "react-color"
import { soilOptions } from "../../insert-soil/[id]/soilData"

export function EditSoilInformation({ soil, soilId }: { soil: TeditSoilInformationSchema, soilId: string }) {
  const router = useRouter()

  const form = useForm({ 
    resolver: zodResolver(editSoilInformationSchema),
    defaultValues: { ...soil }
  })
  
  const { formState: { isDirty, isSubmitting, dirtyFields } } = form
  const soilType = form.watch("soil_type")

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.replace('/configuration') 
    }
  }

  async function onSubmit(values: TeditSoilInformationSchema) {
    try {
      const result = await updateSoilInformation(values, soilId, dirtyFields)

      if (result.errors) {
        Object.entries(result.errors).forEach(([key, value]) => {form.setError(key as keyof TeditSoilInformationSchema, {message: value[0]})})
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
                    {(soilOptions[soilType].map((soil) => (<SelectItem key={soil} value={soil}>{soil}</SelectItem>)))}
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

          <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
            <FormField
              control={form.control}
              name="soil_name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Soil Name <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Custom label for soil layer" {...field}/>
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
                        <Button id="colour" variant="outline" className="p-2"><div style={{ backgroundColor: field.value }} className="w-full h-full"></div></Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-auto rounded-none" align="end" side="top">
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
          <Button type="button" className="w-18" variant="outline" disabled={isSubmitting} onClick={handleClose}>Cancel</Button>
          <Button type="submit" className="w-28" disabled={!isDirty || isSubmitting}>{isSubmitting ? (<><Loader2 className="size-5 animate-spin" />Saving...</>) : ("Save")}</Button>
        </div>
      </form>
    </Form>
  )
}