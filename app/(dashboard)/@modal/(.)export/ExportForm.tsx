"use client"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { TselectSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { exportFormSchema, TexportFormSchema } from "@/schemas/exportSchema"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

export function ExportForm({ soilProfiles }: { soilProfiles: TselectSoilProfileSchema[] }) {
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      job_number: "",
      job_location: "",
      pile_number: "",
      additional_information: "",
      soil_profile: "",
      pile_diameter: "",
    }
  })

  const { formState: { isSubmitting } } = form

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.replace('/configuration') 
    }
  }

  async function onSubmit(values: TexportFormSchema) {
    try {
      console.log(values)
      // const result = await (values)

      // if (result.errors) {
      //   toast.error(result.message)
      // }

      // else {
      //   handleClose()
      //   toast.success(result.message)
      // }

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
              name="job_number"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Job Number</FormLabel>
                  <FormControl>
                    <Input  placeholder="Project-AX34" {...field} className="text-sm"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pile_number"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Pile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="HP-003" {...field} className="text-sm"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        
          <FormField
            control={form.control}
            name="job_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Location</FormLabel>
                <FormControl>
                  <Input placeholder="Farnborough, Hampshire" {...field} className="text-sm"/>
                </FormControl>
                <FormMessage />
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
            name="soil_profile"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="soil_profile">Soil Profile</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                  <FormControl>
                    <SelectTrigger className="w-full truncate" id="soil_profile">
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
            name="additional_information"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Information <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                <FormControl>
                  <Textarea {...field}  placeholder="Enter any additional information" className="text-sm resize-none"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-2 flex justify-between">
          <Button type="submit" className="w-32" disabled={isSubmitting}>{isSubmitting ? (<> <Loader2 className="mr-2 size-4 animate-spin"/>Exporting... </>) : ("Export")}</Button>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={handleClose}>Close</Button>
        </div>

      </form>
    </Form>
  )
}