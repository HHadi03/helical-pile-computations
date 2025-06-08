"use client"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { soilProfileSchema, TsoilProfileSchema } from "@/schemas/soilProfileSchema"
import { insertProfile } from "../actions/insertProfile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/components/NumberInput"
import { toast } from "sonner"

export function ProfileForm() {
  const router = useRouter()

  const form = useForm<TsoilProfileSchema>({
    resolver: zodResolver(soilProfileSchema),
    defaultValues: {
      profileName: "",
      pileLength:"" as unknown as number,
      pileStickOut: "" as unknown as number,
      waterDepth:"" as unknown as number,
    }
  })
  
  const { formState: { isSubmitting } } = form

  async function onSubmit(values: TsoilProfileSchema) {
    try {
      const result = await insertProfile(values)

      if (result.errors) {
        Object.entries(result.errors).forEach(([key, value]) => {form.setError(key as keyof TsoilProfileSchema, { message: Array.isArray(value) ? value[0] : (value as string) })})
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
            name="profileName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Name <span className="font-semibold">(optional)</span></FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Enter profile name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="waterDepth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Water Depth (m)</FormLabel>
                <FormControl>
                  <NumberInput field={field} placeholder="0"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="pileLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pile Length (m)</FormLabel>
                <FormControl>
                  <NumberInput field={field} placeholder="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pileStickOut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pile Stick Out (m)</FormLabel>
                <FormControl>
                  <NumberInput field={field} placeholder="0"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-2 flex justify-between">
          <Button type="submit" className="w-32" disabled={isSubmitting}>
            {isSubmitting ? (<> <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Submitting... </>) : ("Submit")}
          </Button>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={router.back}>Close</Button>
        </div>
      </form>
    </Form>
  )
}