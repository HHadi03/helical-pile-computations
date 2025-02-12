"use client"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/app/components/hooks/use-toast"
import { ToastAction } from "@/app/components/ui/toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { soilOptions, soilProperties } from "@/app/data/soilData"
import { soilSchema, TsoilSchema } from "@/app/lib/schemas/soilSchema"
import { insertSoil } from "../../actions/insertSoil"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/app/components/ui/hover-card"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/app/components/NumberInput"

export function SoilForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('soil')
  
  const form = useForm<TsoilSchema>({
    resolver: zodResolver(soilSchema),
    defaultValues: {
      soilType: undefined,
      density: undefined,
      soil: undefined,
      startDepth: undefined,
      endDepth: undefined,
      nValue: undefined,
      yMoist: undefined,
      ySat: undefined,
      soilName: "",
      description: "",
      color: ""
    }
  })

  const { formState: {isSubmitting} } = form
  
  const soilType = form.watch("soilType")
  const soil = form.watch("soil")
  const density = form.watch("density")
  const selectedSoil = form.watch("soil")
  const selectedDensity = form.watch("density")
  const showParametersTab = Boolean(soilType && soil && density)

  const handleNext = () => {
    if (soilType && soil && density) {
      setActiveTab('parameters')
    }
  }

  useEffect(() => {
    if (selectedSoil && selectedDensity && soilProperties[selectedSoil]) {
      const values = soilProperties[selectedSoil][selectedDensity]
      form.setValue("yMoist", values.yMoist)
      form.setValue("ySat", values.ySat)
    }
  }, [selectedSoil, selectedDensity, form])

  useEffect(() => {
    form.setValue("soil", "")
  }, [soilType, form])

  async function onSubmit(values: TsoilSchema) {
    try {
      isSubmitting
      const result = await insertSoil(values)
  
      if (result.errors) {
        Object.entries(result.errors).forEach(([key, value]) => {
        form.setError(key as keyof TsoilSchema, { message: Array.isArray(value) ? value[0] : (value as string)})})
      }
  
      toast({
        duration: 2500,
        variant: result.errors ? "destructive" : "default",
        title: result.errors ? "Soil Submission Failed" : "Soil Submission Successful",
        description: result.message,
        action: result.errors && <ToastAction altText="Try again">Try again</ToastAction>
      })
      if (!result.errors){
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="soil">Soil</TabsTrigger>
            {showParametersTab && <TabsTrigger value="parameters">Parameters</TabsTrigger>}
          </TabsList>
      
          <TabsContent value="soil">
            <div className="space-y-8 border-y-2 py-3">
              <FormField
                control={form.control}
                name="soilType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soil Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select soil type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="coarse">Coarse Grain</SelectItem>
                        <SelectItem value="fine">Fine Grain</SelectItem>
                        <SelectItem value="manmade">Man made</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="density"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Density</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select density" />
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

              <FormField
                control={form.control}
                name="soil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soil</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select soil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {soilType && soilOptions[soilType].map((soil) => (
                          <SelectItem key={soil} value={soil}>{soil}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="soilName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Soil Name <span className="font-semibold">(optional)</span></FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter soil name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Description <span className="font-semibold">(optional)</span></FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                  
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormLabel>Color <span className="font-semibold">(optional)</span></FormLabel>
                      <FormControl>
                        <Input type="color" {...field} className="w-full p-1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <Button type="button" className="w-24" onClick={handleNext} disabled={!showParametersTab}>Next</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Close</Button>
            </div>

          </TabsContent>

          {showParametersTab && (<TabsContent value="parameters">
            <div className="space-y-8 border-y-2 py-3">
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="startDepth"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Start Depth (m)</FormLabel>
                      <FormControl>
                        <NumberInput field={field} placeholder="0"/>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDepth"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>End Depth (m)</FormLabel>
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
                name="yMoist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soil Unit Weight (YMoist)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <NumberInput field={field} placeholder="Enter moist unit weight"/>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">kN/m³</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ySat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soil Unit Weight (YSat)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <NumberInput field={field} placeholder="Enter sat unit weight"/>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">kN/m³</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nValue"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>SPT Blow Count (N)</FormLabel>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button type="button" variant="link" className="text-blue-600">I dont have N Number</Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-auto right-0" side="top" align="center">
                          <img src="/NValuePicture.png" alt="N Number Guide Picture" className="max-w-none w-[700px]"/>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                    <FormControl>
                      <NumberInput field={field} placeholder="0"/>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2 flex justify-between">
              <Button type="submit" className="w-24" disabled={isSubmitting}>
                {isSubmitting ? (<> <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Submitting... </>) : ("Submit")}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Close</Button>
            </div>

          </TabsContent>
        )}</Tabs>
      </form>
    </Form>
  )
}