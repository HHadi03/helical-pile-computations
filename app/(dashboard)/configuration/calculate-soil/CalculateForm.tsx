"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState, useMemo } from "react"
import { Button } from "@/app/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { submitCalculations, submitAllCalculations } from "../../actions/submitCalculations"
import { useToast } from "@/app/components/hooks/use-toast"
import { ToastAction } from "@/app/components/ui/toast"
import { TsoilSchema, soilSchema } from "@/app/lib/schemas/soilSchema"
import { TcalculateSchema, calculateResultsForFineSoil, calculateResultsForSoils } from "@/app/lib/schemas/calculateSchema"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const fieldLabels: Partial<{ [key in keyof TcalculateSchema]: { label: string, unit: string } }> = {
  Su: { label: "Undrained Soil Shear Strength (Su)", unit: "kPa" },
  Angle: { label: "Internal Friction Angle (φ)", unit: "°" },
  Ko: { label: "Coefficient of Lateral Pressure (Ko)", unit: "Ko" },
  T: { label: "Shear Soil Strength (T)", unit: "kPa" },
  Po: { label: "Effective Overburden Stress (Po)", unit: "kPa" },
  Qult: { label: "Ultimate Bearing Pressure (Qult)", unit: "kPa" }
}

export function CalculateForm({ soils }: { soils: TsoilSchema[] }) {
  const { toast } = useToast()
  const router = useRouter()
  const [selectedSoil, setSelectedSoil] = useState<TsoilSchema | null>(null)
  const [calculatedValues, setCalculatedValues] = useState<Partial<TcalculateSchema>>({})

  const form = useForm<TsoilSchema>({
    resolver: async (values, context, options) => {
      if (values.id === "all") {return { values, errors: {} }}
      return zodResolver(soilSchema)(values, context, options)
    },
    defaultValues: {id: ''}
  })

  const { formState: {isSubmitting} } = form

  const handleSoilSelect = async (value: string) => {
    form.setValue('id', value)
    
    if (value === "all") {
      setSelectedSoil(null)
      setCalculatedValues({})
    }

    const soil = soils.find(s => s.id === value)
    if (soil) {
      setSelectedSoil(soil)
      try {
        const results = soil.soilType === "fine" ? calculateResultsForFineSoil(soil) : await calculateResultsForSoils(soil)
        setCalculatedValues(results)
        const { id, ...restSoil } = soil
        form.reset({ id: value, ...restSoil })
      } catch (error) {
        toast({
          duration: 2500,
          variant: "destructive",
          title: "Calculation Error",
          description: "Failed to predetermine values for soil paramaters.",
          action: <ToastAction altText="Try again">Try again</ToastAction>
        })
      }
    }
  }

  const handleInputChange = async (value: number, fieldName: keyof TcalculateSchema) => {
    if (!selectedSoil) return
    const currentCalculatedValues = { ...calculatedValues }
    const modifiedSoil = {...selectedSoil, nValue: fieldName === 'Su' ? value / 6.2 : ((value - 25) * (calculatedValues.Po || 0)) / 28}
    try {
      const results = selectedSoil.soilType === "fine" ? calculateResultsForFineSoil(modifiedSoil) : await calculateResultsForSoils(modifiedSoil)
      results.Qult = currentCalculatedValues.Qult
      setCalculatedValues(results)
    } catch (error) {
      toast({
        duration: 2500,
        variant: "destructive",
        title: "Calculation Error",
        description: "Failed to update calculations",
        action: <ToastAction altText="Try again">Try again</ToastAction>
      })
    }
  }

  const resultFields = useMemo(() => {
    if (!selectedSoil) return []
    return selectedSoil.soilType === "fine" ? ["Su", "Qult"] : ["Angle", "Ko", "T", "Po", "Qult"]
  }, [selectedSoil])

  async function onSubmit(values: TsoilSchema) {
    if (values.id === "all") {
      try {
        const result = await submitAllCalculations(soils)
        toast({
          duration: 2500,
          variant: result.errors ? "destructive" : "default",
          title: result.errors ? "Calculations Failed" : "Calculations Successful",
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
      return
    }

    if (!selectedSoil || !calculatedValues) {
      toast({
        duration: 2500,
        variant: "destructive",
        title: "Calculation Error",
        description: "Please select a soil layer and ensure all calculations are complete.",
        action: <ToastAction altText="Try again">Try again</ToastAction>
      })
      return
    }
  
    try {
      const result = await submitCalculations(calculatedValues, selectedSoil, calculatedValues.h!)
      
      if (result.errors) {
        Object.entries(result.errors).forEach(([key, value]) => {
          form.setError(key as keyof TsoilSchema, { 
            message: Array.isArray(value) ? value[0] : value as string 
          })
        })
      }
  
      toast({
        duration: 2500,
        variant: result.errors ? "destructive" : "default",
        title: result.errors ? "Calculations Failed" : "Calculations Successful",
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
        <div className="space-y-8 border-y-2 py-3">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={handleSoilSelect} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose soil layer to calculate..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectItem value="all">All Layers</SelectItem>
                    {soils.map((soil, index) => (
                      <SelectItem key={soil.id} value={soil.id || ''}>
                        Layer {index + 1} ({soil.soilName ? soil.soilName : soil.soil})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedSoil && resultFields.map((fieldName) => (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName as keyof TsoilSchema}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fieldLabels[fieldName as keyof TcalculateSchema]?.label}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        disabled={selectedSoil.soilType === "fine" ? fieldName !== "Su" : fieldName !== "Angle"}

                        onChange={(e) => {const value = e.target.value ? parseFloat(e.target.value) : 0
                          if (fieldName === "Su" || fieldName === "Angle") {handleInputChange(value, fieldName as keyof TcalculateSchema)}
                        }}

                        value={calculatedValues[fieldName as keyof TcalculateSchema]?.toString() || ''}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        {fieldLabels[fieldName as keyof TcalculateSchema]?.unit}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="pt-2 flex gap-3">
          <Button type="submit" className="w-24" disabled={!form.getValues('id') || isSubmitting}>
            {isSubmitting ? (<> <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Submitting... </>) : ("Submit")}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}> Close </Button>
        </div>
      </form>
    </Form>
  )
}