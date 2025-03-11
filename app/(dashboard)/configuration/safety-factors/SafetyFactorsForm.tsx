"use client"
import { useToast } from "@/app/components/hooks/use-toast"
import { ToastAction } from "@/app/components/ui/toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { safetySchema, TsafetySchema } from "@/app/schemas/safetyFactorsSchema"
import { updateSafetyFactors } from "../actions/updateSafetyFactors"
import { Button } from "@/app/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/app/components/NumberInput"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"

type SafetyFactorsFormProps = {
  safetyFactors: TsafetySchema 
}

export function SafetyFactorsForm({ safetyFactors }: SafetyFactorsFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  
  const form = useForm<TsafetySchema>({
    resolver: zodResolver(safetySchema),
    defaultValues: {...safetyFactors}
  })

  const { formState: { isDirty, isSubmitting } } = form
 
  async function onSubmit(values: TsafetySchema) {
    try {
      const result = await updateSafetyFactors(values)
      if (result.errors) {
        Object.entries(result.errors).forEach(([key, value]) => {
          form.setError(key as keyof TsafetySchema, { message: Array.isArray(value) ? value[0] : String(value) })
        })
      }
      
      toast({
        duration: 2500,
        variant: result.errors ? "destructive" : "default",
        title: result.errors ? "Safety Factors Update Failed" : "Safety Factors Update Successful",
        description: result.message,
        action: result.errors && <ToastAction altText="Try again">Try again</ToastAction>
      })
      
      if (!result.errors) {
        router.back()
      }
  
    } catch {
      toast({
        duration: 2500,
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
        
        <div className="space-y-8 border-t-2 py-3">
          <FormField
            control={form.control}
            name="permanentActions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permanent Actions (kN)</FormLabel>
                <FormControl>
                  <NumberInput field={field} placeholder="Enter permanent actions"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="variableActions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Variable Actions (kN)</FormLabel>
                <FormControl>
                  <NumberInput field={field} placeholder="Enter variable actions"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Tabs defaultValue="set1" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="set1">Combination 1</TabsTrigger>
            <TabsTrigger value="set2">Combination 2</TabsTrigger>
          </TabsList>
          
          <TabsContent value="set1" className="border-y-2 py-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="gammaG1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety Factor (γG)</FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gammaQ1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety Factor (γQ)</FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gammaS1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety Factor (γS)</FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gammaB1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety Factor (γB)</FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="set2" className="border-y-2 py-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="gammaG2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety Factor (γG)</FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gammaQ2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety Factor (γQ)</FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gammaS2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety Factor (γS)</FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gammaB2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety Factor (γB)</FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>
       
        

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="w-24" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</>) : ("Save" )}
          </Button>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.back()}>Close</Button>
        </div>
      </form>
    </Form>
  )
}