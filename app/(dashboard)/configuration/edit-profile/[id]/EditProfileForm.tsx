"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { TinsertSoilProfileSchema, insertSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { updateProfile } from "../../actions/updateProfile"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/components/NumberInput"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export function EditProfileForm({ profile, profileId }: { profile: TinsertSoilProfileSchema, profileId: string }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")

  const form = useForm({
    resolver: zodResolver(insertSoilProfileSchema),
    defaultValues: { ...profile }
  })

  const { formState: { isDirty, isSubmitting, dirtyFields } } = form

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.replace('/configuration') 
    }
  }

  const onError = (errors: typeof form.formState.errors) => {
    if (errors.profile_name || errors.water_depth) {
      setActiveTab("profile")
    }

    else if (errors.pile_length || errors.pile_stick_out) {
      setActiveTab("pile")
    }
  }

  async function onSubmit(values: TinsertSoilProfileSchema) {
    try {
      const result = await updateProfile(values, profileId, dirtyFields)

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
      <form onSubmit={form.handleSubmit(onSubmit, onError)} noValidate>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
         <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="pile">Pile</TabsTrigger>
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
              <Button type="button" className="w-18" variant="outline" disabled={isSubmitting} onClick={handleClose}>Cancel</Button>
              <Button type="submit" className="w-28" disabled={!isDirty || isSubmitting}>{isSubmitting ? (<><Loader2 className="size-5 animate-spin" />Saving...</>) : ("Save")}</Button>
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
                      <NumberInput field={field} placeholder="0.1"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" className="w-18" variant="outline" disabled={isSubmitting} onClick={handleClose}>Cancel</Button>
              <Button type="submit" className="w-28" disabled={!isDirty || isSubmitting}> {isSubmitting ? (<><Loader2 className="size-5 animate-spin" />Saving...</>) : ("Save")}</Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}
