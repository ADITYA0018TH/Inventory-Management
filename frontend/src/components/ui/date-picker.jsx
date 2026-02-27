import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format, parseISO } from "date-fns"
import { Calendar as CalendarIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function DatePicker({ value, onChange, placeholder = "Pick a date", className }) {
    // Handle parsing a 'YYYY-MM-DD' string to a JS Date
    const date = value ? (typeof value === 'string' ? parseISO(value) : value) : undefined;

    const handleSelect = (selectedDate) => {
        if (!onChange) return;
        if (selectedDate) {
            // Format the Date object back to a YYYY-MM-DD string as expected by forms
            onChange(format(selectedDate, "yyyy-MM-dd"));
        } else {
            onChange('');
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-[240px] justify-between text-left font-normal border-input",
                        className
                    )}
                    style={{
                        backgroundColor: 'var(--bg-input)',
                        borderColor: 'var(--border)',
                        color: date ? 'var(--text-primary)' : 'var(--text-muted)'
                    }}
                >
                    <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                        {date ? format(date, "PPP") : <span>{placeholder}</span>}
                    </div>
                    <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" style={{ color: 'var(--text-secondary)' }} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[100]" align="start" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', boxShadow: '0 15px 35px rgba(0,0,0,0.2)', borderRadius: '0.625rem' }}>
                <style dangerouslySetInnerHTML={{
                    __html: `
          .rdp { --rdp-color-foreground: var(--text-primary); }
          .rdp-button:not([disabled]) { color: var(--text-primary) !important; }
          .rdp-weekday { color: var(--text-secondary) !important; font-weight: 500; }
          .rdp-day_selected button { background-color: var(--blue, #3b82f6) !important; color: #ffffff !important; }
          .rdp-button:hover:not([disabled]):not(.rdp-day_selected button) { background-color: var(--bg-input) !important; }
        `}} />
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    defaultMonth={date || new Date()}
                    initialFocus
                    className="rounded-md"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
            </PopoverContent>
        </Popover>
    )
}
