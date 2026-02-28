import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const glassTriggerStyle = {
    background: "var(--glass-elevated)",
    borderColor: "var(--glass-border)",
    boxShadow: "var(--glass-shadow-soft)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
}

const glassContentStyle = {
    background: "var(--glass-elevated)",
    border: "1px solid var(--glass-border)",
    boxShadow: "var(--glass-shadow)",
    borderRadius: "20px",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
}

export function Combobox({ options = [], value, onChange, placeholder = "Select option...", className }) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between rounded-[18px] font-normal text-[var(--text-primary)] transition-all",
                        "hover:border-[color:color-mix(in_srgb,var(--accent)_42%,var(--glass-border))]",
                        "hover:shadow-[var(--glass-shadow-hover)]",
                        className
                    )}
                    style={{
                        ...glassTriggerStyle,
                        color: value ? 'var(--text-primary)' : 'var(--text-muted)',
                        padding: '10px 14px',
                        fontSize: '14px',
                        height: 'auto',
                        minHeight: '42px',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <span className="truncate">
                        {value
                            ? options.find((option) => option.value === value)?.label || placeholder
                            : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" style={{ color: 'var(--text-secondary)' }} />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0 z-[100]"
                align="start"
                style={glassContentStyle}
            >
                <Command className="bg-transparent">
                    <CommandInput placeholder={`Search...`} className="border-none" style={{ color: 'var(--text-primary)', fontSize: '14px' }} />
                    <CommandList className="max-h-60 overflow-y-auto">
                        <CommandEmpty style={{ color: 'var(--text-muted)', padding: '1rem', textAlign: 'center', fontSize: '14px' }}>
                            No option found.
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        onChange(option.value === value ? "" : option.value)
                                        setOpen(false)
                                    }}
                                    className="cursor-pointer rounded-[12px] data-[selected=true]:bg-[color:color-mix(in_srgb,var(--accent)_16%,transparent)]"
                                    style={{
                                        color: 'var(--text-primary)',
                                        fontSize: '14px',
                                        padding: '10px 14px',
                                        boxShadow: 'var(--glass-shadow-soft)'
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "text-blue-500" : ""
                                        )}
                                        style={{ opacity: value === option.value ? 1 : 0 }}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
