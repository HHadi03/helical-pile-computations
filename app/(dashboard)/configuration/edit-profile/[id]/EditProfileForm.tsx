"use client"
import { useToast } from "@/components/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { TsoilProfileSchema, soilProfileSchema } from "@/schemas/soilProfileSchema"
import { updateProfile } from "../../actions/updateProfile"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/components/NumberInput"
import { Input } from "@/components/ui/input"
import { UseFormContext } from "../../FormContext"
import { Loader2, CheckCircle, TriangleAlert } from "lucide-react"

export function EditProfileForm({ profile }: { profile: TsoilProfileSchema }) {
  const { toast } = useToast()
  const router = useRouter()
  const { setHasUnsavedChanges } = UseFormContext()

  const form = useForm<TsoilProfileSchema>({
    resolver: zodResolver(soilProfileSchema),
    defaultValues: { ...profile }
  })

  const { formState: { isDirty, isSubmitting } } = form

  async function onSubmit(values: TsoilProfileSchema) {
    try {
      const result = await updateProfile(values)

      if (result.errors) {
        Object.entries(result.errors).forEach(([key, value]) => {form.setError(key as keyof TsoilProfileSchema, { message: Array.isArray(value) ? value[0] : String(value) })})
      }

      toast({
        duration: 2000,
        variant: result.errors ? "destructive" : "default",
        description: (
          <div className="flex items-center gap-2">
            {result.errors ? (<TriangleAlert className="text-yellow-500 w-5 h-5" />) : (<CheckCircle className="text-green-500 w-5 h-5" />)}
            <span>{result.message}</span>
          </div>
        )
      })

      if (!result.errors) {
        setHasUnsavedChanges(true)
        router.back()
      }

    } catch {
      toast({
        duration: 2000,
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "An unexpected error occurred. Please try again later.",
        action: <ToastAction altText="Try again">Try again</ToastAction>
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-8 border-y-2 py-3">
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
            name="pileLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pile Length (m)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <NumberInput field={field} placeholder="Enter pile length" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">m</span>
                  </div>
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
                  <div className="relative">
                    <NumberInput field={field} placeholder="Enter pile stick out" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">m</span>
                  </div>
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
                  <div className="relative">
                    <NumberInput field={field} placeholder="Enter water depth" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">m</span>
                  </div>
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
      </form>
    </Form>
  )
}
