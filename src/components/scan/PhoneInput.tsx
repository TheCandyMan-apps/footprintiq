import { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Phone, Check, AlertCircle, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  validatePhone,
  autoFormatPhoneInput,
  PHONE_EXAMPLES,
} from '@/lib/phone/phoneUtils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidChange?: (isValid: boolean, normalized: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  onValidChange,
  disabled = false,
  className,
}: PhoneInputProps) {
  const [touched, setTouched] = useState(false);

  const validation = useMemo(() => validatePhone(value), [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = autoFormatPhoneInput(e.target.value, value);
      onChange(newValue);
      
      const newValidation = validatePhone(newValue);
      onValidChange?.(newValidation.isValid, newValidation.normalized);
    },
    [value, onChange, onValidChange]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
  }, []);

  const showError = touched && value.length > 0 && !validation.isValid;
  const showSuccess = validation.isValid;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone Number
            </Label>
          </div>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Format help</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs p-3">
                <p className="font-medium mb-2">Phone Format</p>
                <p className="text-xs text-muted-foreground mb-3">
                  E.164 format is preferred. Include the country code for accurate carrier lookups.
                </p>
                <div className="space-y-1.5">
                  {PHONE_EXAMPLES.map((ex) => (
                    <div key={ex.format} className="flex justify-between gap-4 text-xs">
                      <span className="text-muted-foreground">{ex.format}</span>
                      <code className="font-mono bg-muted px-1.5 py-0.5 rounded">{ex.example}</code>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {/* Inline helper text */}
        <p className="text-xs text-muted-foreground">
          E.164 recommended (e.g. <code className="font-mono bg-muted px-1 rounded">+447700900123</code>). 
          UK/US local formats also accepted. We'll normalize automatically.
        </p>
      </div>

      <div className="relative">
        <Input
          id="phone"
          type="tel"
          placeholder="+1 555 123 4567"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          maxLength={20}
          className={cn(
            'bg-secondary border-border pr-10',
            showError && 'border-destructive focus-visible:ring-destructive',
            showSuccess && 'border-green-500/50 focus-visible:ring-green-500'
          )}
        />
        {showSuccess && (
          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
        {showError && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
        )}
      </div>

      {/* Validation feedback */}
      <div className="flex items-center justify-between min-h-[1.25rem]">
        {showError ? (
          <p className="text-xs text-destructive">{validation.error}</p>
        ) : showSuccess ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Normalized:{' '}
              <span className="font-mono text-foreground">{validation.normalized}</span>
            </span>
            {validation.country && (
              <Badge variant="outline" className="text-xs py-0">
                {validation.country}
              </Badge>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
