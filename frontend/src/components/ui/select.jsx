"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef(({ className, size = "default", children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        data-slot="select-trigger"
        data-size={size}
        className={cn(
            "group flex w-full items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3.5 text-left text-sm text-[var(--text-primary)] outline-none transition-all duration-150 select-none cursor-pointer font-normal",
            "data-[placeholder]:text-[var(--text-muted)]",
            "hover:border-[var(--accent)]",
            "focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[rgba(99,102,241,0.15)]",
            "data-[state=open]:border-[var(--accent)] data-[state=open]:ring-2 data-[state=open]:ring-[rgba(99,102,241,0.15)]",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f8fafc]",
            "data-[size=default]:h-[42px]",
            "data-[size=sm]:h-9 data-[size=sm]:text-xs",
            className
        )}
        {...props}
    >
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDownIcon className="size-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            data-slot="select-content"
            position={position}
            className={cn(
                "relative z-[9999] min-w-[8rem] overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-white text-[var(--text-primary)]",
                "shadow-[0_4px_20px_rgba(0,0,0,0.12)]",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                "origin-[--radix-select-content-transform-origin]",
                position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
                className
            )}
            {...props}
        >
            <SelectScrollUpButton />
            <SelectPrimitive.Viewport
                className={cn("p-1", position === "popper" && "min-w-[var(--radix-select-trigger-width)]")}
                style={{ minWidth: "var(--radix-select-trigger-width)" }}
            >
                {children}
            </SelectPrimitive.Viewport>
            <SelectScrollDownButton />
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
    <SelectPrimitive.Label
        ref={ref}
        data-slot="select-label"
        className={cn("px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]", className)}
        {...props}
    />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        data-slot="select-item"
        className={cn(
            "relative flex w-full cursor-pointer items-center rounded-[6px] py-2.5 pr-9 pl-3 text-sm text-[var(--text-primary)] outline-none select-none transition-colors duration-100",
            "hover:bg-[#f1f5f9] focus:bg-[#f1f5f9]",
            "data-[state=checked]:bg-[rgba(99,102,241,0.08)] data-[state=checked]:text-[var(--accent)] data-[state=checked]:font-medium",
            "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
            className
        )}
        {...props}
    >
        <span className="pointer-events-none absolute right-3 flex size-4 items-center justify-center">
            <SelectPrimitive.ItemIndicator>
                <CheckIcon className="size-3.5 text-[var(--accent)]" />
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
        className={cn("mx-2 my-1 h-px bg-[var(--border)]", className)}
        {...props}
    />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
        ref={ref}
        className={cn("flex cursor-default items-center justify-center py-1 text-[var(--text-muted)]", className)}
        {...props}
    >
        <ChevronUpIcon className="size-3.5" />
    </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
        ref={ref}
        className={cn("flex cursor-default items-center justify-center py-1 text-[var(--text-muted)]", className)}
        {...props}
    >
        <ChevronDownIcon className="size-3.5" />
    </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

export {
    Select, SelectContent, SelectGroup, SelectItem, SelectLabel,
    SelectScrollDownButton, SelectScrollUpButton, SelectSeparator,
    SelectTrigger, SelectValue,
}
