import * as React from "react"

import { cn } from "@/lib/utils"

const Select = React.forwardRef<
  HTMLSelectElement,
  React.ComponentPropsWithoutRef<"select">
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
})
Select.displayName = "Select"

const SelectGroup = React.forwardRef<
  HTMLOptGroupElement,
  React.ComponentPropsWithoutRef<"optgroup">
>(({ className, ...props }, ref) => (
  <optgroup ref={ref} className={cn("font-semibold", className)} {...props} />
))
SelectGroup.displayName = "SelectGroup"

const SelectOption = React.forwardRef<
  HTMLOptionElement,
  React.ComponentPropsWithoutRef<"option">
>(({ className, ...props }, ref) => (
  <option ref={ref} className={cn("", className)} {...props} />
))
SelectOption.displayName = "SelectOption"

export { Select, SelectGroup, SelectOption }
