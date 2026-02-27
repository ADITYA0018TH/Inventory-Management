import React, { useState, useEffect, useRef } from 'react';
import { WheelPicker, WheelPickerWrapper } from '@/components/wheel-picker/wheel-picker';

const hours = Array.from({ length: 12 }, (_, i) => {
    const h = String(i === 0 ? 12 : i).padStart(2, '0');
    return { value: h, label: h };
});
const minutes = Array.from({ length: 60 }, (_, i) => {
    const m = String(i).padStart(2, '0');
    return { value: m, label: m };
});
const meridiems = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' }
];

export function TimePicker({ value, onChange, placeholder = "Select Time" }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    // Parse initial 24h string "HH:MM" -> hour (12h), minute, ampm
    const parseValue = (val) => {
        if (!val) return { h: '12', m: '00', a: 'AM' };
        const parts = val.split(':');
        let h24 = parseInt(parts[0], 10);
        const m = parts[1] || '00';
        const a = h24 >= 12 ? 'PM' : 'AM';
        let h12 = h24 % 12 || 12;
        return { h: String(h12).padStart(2, '0'), m, a };
    };

    const initial = parseValue(value);
    const [hour, setHour] = useState(initial.h);
    const [minute, setMinute] = useState(initial.m);
    const [ampm, setAmpm] = useState(initial.a);

    useEffect(() => {
        if (onChange) {
            let h24 = parseInt(hour, 10);
            if (ampm === 'PM' && h24 !== 12) h24 += 12;
            if (ampm === 'AM' && h24 === 12) h24 = 0;
            const h24Str = String(h24).padStart(2, '0');
            const newValue = `${h24Str}:${minute}`;
            if (value !== newValue) onChange(newValue);
        }
    }, [hour, minute, ampm]);

    useEffect(() => {
        if (value) {
            const parsed = parseValue(value);
            setHour(parsed.h);
            setMinute(parsed.m);
            setAmpm(parsed.a);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer items-center justify-between hover:border-accent"
                onClick={() => setOpen(!open)}
            >
                <span>{value ? `${hour}:${minute} ${ampm}` : placeholder}</span>
                <span className="text-muted-foreground text-xs">▼</span>
            </div>

            {open && (
                <div className="absolute z-50 mt-1 p-3 rounded-lg shadow-2xl flex justify-center w-[280px] left-0" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
                    <WheelPickerWrapper className="w-full gap-2 !bg-transparent !border-0 shadow-none">
                        <WheelPicker
                            options={hours} value={hour} onValueChange={setHour} infinite visibleCount={5} optionItemHeight={40}
                            classNames={{ highlightWrapper: "bg-[var(--bg-input)] rounded-md", optionItem: "font-medium" }}
                        />
                        <WheelPicker
                            options={minutes} value={minute} onValueChange={setMinute} infinite visibleCount={5} optionItemHeight={40}
                            classNames={{ highlightWrapper: "bg-[var(--bg-input)] rounded-md", optionItem: "font-medium" }}
                        />
                        <WheelPicker
                            options={meridiems} value={ampm} onValueChange={setAmpm} visibleCount={5} optionItemHeight={40}
                            classNames={{ highlightWrapper: "bg-[var(--bg-input)] rounded-md", optionItem: "font-medium" }}
                        />
                    </WheelPickerWrapper>
                </div>
            )}
        </div>
    );
}
