import React from 'react';
import { cn } from '../../lib/utils';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm', className)} {...props} />
  )
);
Select.displayName = 'Select';

export const SelectTrigger = Select;
export const SelectValue = Select;
export const SelectContent = Select;
export const SelectItem = React.forwardRef<HTMLOptionElement, React.OptionHTMLAttributes<HTMLOptionElement>>(
  ({ className, ...props }, ref) => <option ref={ref} {...props} />
);
SelectItem.displayName = 'SelectItem';