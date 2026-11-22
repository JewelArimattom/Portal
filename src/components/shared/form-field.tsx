import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  description,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} className="text-sm font-semibold text-slate-900">
          {label}
          {required && <span className="ml-1 text-red-600 font-bold">*</span>}
        </Label>
      </div>

      {children}

      {description && !error && (
        <p className="text-xs text-slate-600 leading-normal">{description}</p>
      )}

      {error && (
        <p className="text-xs font-semibold text-red-600 leading-normal">{error}</p>
      )}
    </div>
  );
}
