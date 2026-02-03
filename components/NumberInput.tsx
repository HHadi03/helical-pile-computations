import { Input } from "./ui/input"
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form"

type NumberInputProps<T extends FieldValues = FieldValues, K extends Path<T> = Path<T>> = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {field: ControllerRenderProps<T, K>}

export const NumberInput = <T extends FieldValues, K extends Path<T>>({field, placeholder, disabled, ...props}: NumberInputProps<T, K>) => {
  return (
    <Input
      type="number"
      {...field}
      {...props}
      value={field.value === 0 ? "" : field.value}
      step={0.1}
      min={0}
      disabled={disabled}
      onKeyDown={(e) => {if (["e", "E", "-", "+", "="].includes(e.key)) e.preventDefault()}}
      onPaste={(e) => e.preventDefault()}
      onChange={(e) => {const value = e.target.value; if (/^\d{0,5}(\.\d{0,2})?$/.test(value)) {field.onChange(value)}}}
      placeholder={placeholder}
    />
  )
}

export const SafetyNumberInput = <T extends FieldValues, K extends Path<T>>({field, placeholder, disabled, ...props}: NumberInputProps<T, K>) => {
  return (
    <Input
      type="number"
      {...field}
      {...props}
      value={field.value}
      step={0.1}
      min={0}
      disabled={disabled}
      onKeyDown={(e) => {if (["e", "E", "-", "+", "="].includes(e.key)) e.preventDefault()}}
      onPaste={(e) => e.preventDefault()}
      onChange={(e) => {const value = e.target.value; if (/^\d{0,5}(\.\d{0,2})?$/.test(value)) {field.onChange(value)}}}
      placeholder={placeholder}
      className="text-base sm:text-sm"
    />
  )
}

export const FactorsNumberInput = <T extends FieldValues, K extends Path<T>>({field, placeholder, disabled, ...props}: NumberInputProps<T, K>) => {
  return (
    <Input
      type="number"
      {...field}
      {...props}
      value={field.value === 0 ? "" : field.value}
      step={0.001}
      min={0}
      disabled={disabled}
      onKeyDown={(e) => {if (["e", "E", "-", "+", "="].includes(e.key)) e.preventDefault()}}
      onPaste={(e) => e.preventDefault()}
      onChange={(e) => {const value = e.target.value; if (/^\d{0,5}(\.\d{0,3})?$/.test(value)) {field.onChange(value)}}}
      placeholder={placeholder}
    />
  )
}

