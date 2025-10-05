"use client"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { insertSoilProfileSchema, TinsertSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { insertProfile } from "../actions/insertProfile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/components/NumberInput"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function InsertProfileForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")

  const form = useForm({
    resolver: zodResolver(insertSoilProfileSchema),
    defaultValues: {
      profile_name: "",
      pile_length: "",
      pile_stick_out: "",
      water_depth:"",
    }
  })
  
  const { formState: { isSubmitting } } = form

  const waterDepth = form.watch("water_depth")

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.replace('/configuration') 
    }
  }

  useEffect(() => {
    const errorFields = Object.keys(form.formState.errors)

    if (errorFields.length === 0) return
    
    const profileTabFields = ["profile_name", "water_depth"]
    const pileTabFields = ["pile_length", "pile_stick_out"]

    const hasProfileErrors = errorFields.some(field => profileTabFields.includes(field))
    const hasPileErrors = errorFields.some(field => pileTabFields.includes(field))

    if (hasProfileErrors) {
      setActiveTab("profile")
    } 
    else if (hasPileErrors) {
      setActiveTab("pile")
    }
  }, [form.formState.errors])

  async function onSubmit(values: TinsertSoilProfileSchema) {
    try {
      const result = await insertProfile(values)

      if (result.errors) {
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
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="pile" disabled={!waterDepth}>Pile</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="focus-visible:ring-transparent">
            <div className="space-y-6 border-y-2 py-3">
              <FormField
                control={form.control}
                name="profile_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Name <span className="font-semibold -ml-1">(optional)</span></FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Custom label for soil profile" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="water_depth"
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

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" className="w-18" variant="outline" onClick={handleClose}>Close</Button>
              <Button type="button" className="w-32" onClick={() => waterDepth && setActiveTab("pile")} disabled={!waterDepth}>Next</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="pile" className="focus-visible:ring-transparent">
            <div className="space-y-6 border-y-2 py-3">
              <FormField
                control={form.control}
                name="pile_length"
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
                name="pile_stick_out"
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
            
            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" className="w-18" variant="outline" disabled={isSubmitting} onClick={() => setActiveTab("profile")}>Back</Button>
              <Button type="submit" className="w-32" disabled={isSubmitting}> {isSubmitting ? (<> <Loader2 className="size-5 animate-spin"/> Submitting... </>) : ("Submit")}</Button>
            </div>
          </TabsContent>

        </Tabs>
      </form>
    </Form>
  )
}