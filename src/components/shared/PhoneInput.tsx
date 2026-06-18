import { IMaskInput } from 'react-imask'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface PhoneInputProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
  placeholder?: string
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, placeholder }, ref) => {
    return (
      <IMaskInput
        mask='+{7} (000) 000-00-00'
        value={value}
        onAccept={(val) => onChange?.(val)}
        placeholder={placeholder ?? '+ 7 (999) 000-00-00'}
        inputRef={ref}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          className
        )}
      />
    )
  }
)

PhoneInput.displayName = 'PhoneInput'