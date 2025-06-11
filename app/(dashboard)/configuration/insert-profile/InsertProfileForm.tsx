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
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProfileForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")

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

  useEffect(() => {
    const errorFields = Object.keys(form.formState.errors)

    if (errorFields.length === 0) return
    
    const profileTabFields = ["profileName", "waterDepth"]
    const pileTabFields = ["pileLength", "pileStickOut"]

    const hasProfileErrors = errorFields.some(field => profileTabFields.includes(field))
    const hasPileErrors = errorFields.some(field => pileTabFields.includes(field))

    if (hasProfileErrors) {
      setActiveTab("profile")
    } 
    else if (hasPileErrors) {
      setActiveTab("pile")
    }
  }, [form.formState.errors])

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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
         <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="pile">Pile</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="focus-visible:ring-transparent">
            <div className="space-y-6 border-y-2 py-3">
              <FormField
                control={form.control}
                name="profileName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Name <span className="font-semibold -ml-1">(optional)</span></FormLabel>
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
                    <FormLabel>Water Depth <span className="font-semibold -ml-1">(m)</span></FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2 flex justify-between">
              <Button type="button" className="w-32" onClick={() => {setActiveTab("pile")}}>Next</Button>
              <Button type="button" variant="outline" onClick={router.back}>Close</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="pile" className="focus-visible:ring-transparent">
            <div className="space-y-6 border-y-2 py-3">
              <FormField
                control={form.control}
                name="pileLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pile Length <span className="font-semibold -ml-1">(m)</span></FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
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
                    <FormLabel>Pile Stick Out <span className="font-semibold -ml-1">(m)</span></FormLabel>
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
          </TabsContent>

        </Tabs>
      </form>
    </Form>
  )
}