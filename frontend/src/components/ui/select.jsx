"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

const glassTriggerStyle = {
  background: "var(--glass-elevated)",
  borderColor: "var(--glass-border)",
  boxShadow: "var(--glass-shadow-soft)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
}

const glassContentStyle = {
  background: "var(--glass-elevated)",
  borderColor: "var(--glass-border)",
  boxShadow: "var(--glass-shadow)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
}

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef(
  ({ className, size = "default", children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "group flex w-full items-center justify-between gap-2 rounded-[18px] border px-4 text-left text-sm outline-none transition-all select-none",
        "text-[var(--text-primary)]",
        "data-[placeholder]:text-[var(--text-muted)]",
        "hover:border-[color:color-mix(in_srgb,var(--accent)_44%,var(--glass-border))]",
        "hover:shadow-[var(--glass-shadow-hover)]",
        "focus-visible:border-[color:var(--accent)] focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--accent)_18%,transparent)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[size=default]:min-h-[42px] data-[size=default]:py-2",
        "data-[size=sm]:min-h-9 data-[size=sm]:py-1.5",
        className
      )}
      style={glassTriggerStyle}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 shrink-0 text-[var(--text-secondary)] opacity-80 transition-transform group-data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
)
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef(
  ({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="select-content"
        position={position}
        className={cn(
          "relative z-[100] max-h-72 min-w-[8rem] overflow-hidden rounded-[20px] border",
          "text-[var(--text-primary)]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "origin-[--radix-select-content-transform-origin]",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1",
          className
        )}
        style={glassContentStyle}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "min-w-[var(--radix-select-trigger-width)]"
          )}
          style={{ minWidth: "var(--radix-select-trigger-width)" }}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
)
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    data-slot="select-label"
    className={cn("px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    data-slot="select-item"
    className={cn(
      "relative flex w-full cursor-pointer items-center rounded-sm py-2 pr-8 pl-3 text-sm outline-none select-none",
      "text-[var(--text-primary)]",
      "focus:bg-[color:color-mix(in_srgb,var(--accent)_14%,transparent)] focus:text-[var(--text-primary)]",
      "data-[state=checked]:bg-[color:color-mix(in_srgb,var(--accent)_16%,transparent)]",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
      className
    )}
    style={{
      borderRadius: "12px",
      boxShadow: "var(--glass-shadow-soft)",
    }}
    {...props}
  >
    <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="size-4 text-[var(--accent)]" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    data-slot="select-separator"
    className={cn("-mx-1 my-1 h-px bg-[color:var(--border)]", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    data-slot="select-scroll-up-button"
    className={cn("flex cursor-default items-center justify-center py-1.5 text-[var(--text-secondary)]", className)}
    {...props}
  >
    <ChevronUpIcon className="size-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    data-slot="select-scroll-down-button"
    className={cn("flex cursor-default items-center justify-center py-1.5 text-[var(--text-secondary)]", className)}
    {...props}
  >
    <ChevronDownIcon className="size-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
