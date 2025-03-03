import { Input } from "./ui/input"
import { ControllerRenderProps } from "react-hook-form"

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  field: ControllerRenderProps<any, any>
}

export const NumberInput = ({ field, placeholder}: NumberInputProps) => {
  return (
    <Input
      type="number"
      {...field}
      value={field.value === undefined ? "" : field.value}
      step={0.1}
      min={0}

      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        const preventedKeys = ["e", "E", "-", "+", "="]
        if (preventedKeys.includes(e.key)) {
          e.preventDefault()
        }
      }}

      onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
      }}

      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value
        if (/^\d{0,5}(\.\d{0,2})?$/.test(value)) {
            field.onChange(value)
          }
      }}

      placeholder={placeholder}
    />
  )
}

