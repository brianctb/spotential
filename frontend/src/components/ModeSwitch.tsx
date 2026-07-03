"use client"

import { useState, useEffect, ComponentProps } from "react"
import { Sun, Moon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export type Theme = 'light' | 'dark'

interface ModeToggleProps extends ComponentProps<typeof Switch> {
    currentTheme: Theme | undefined
    onThemeChange: (theme: Theme) => void
    sunIconClassName?: string
    moonIconClassName?: string
    thumbClassName?: string
}

export const ModeToggle = ({
    currentTheme,
    onThemeChange,
    className,
    sunIconClassName = "h-2.5 w-2.5",
    moonIconClassName = "h-2.5 w-2.5",
    thumbClassName,
    ...props
}: ModeToggleProps) => {
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch: render null on the server/first client render,
    // then flip to the real switch once mounted. This deliberately relies on
    // an extra client-only render, which is what the lint rule below is
    // warning about — safe to ignore for this specific SSR pattern.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
    }, [])

    if (!mounted) return null

    const isDark = currentTheme === "dark"

    return (
        <Switch
            {...props}
            checked={isDark}
            onCheckedChange={(checked) => onThemeChange(checked ? "dark" : "light")}
            className={cn(
                "after:hidden",
                // Ensure thumb is a flex container for the icon
                "**:data-[slot=switch-thumb]:flex **:data-[slot=switch-thumb]:items-center **:data-[slot=switch-thumb]:justify-center",
                // Apply custom thumb overrides if provided
                thumbClassName && `**:data-[slot=switch-thumb]:${thumbClassName}`,
                className
            )}
        >
            {isDark ? (
                <Moon className={cn("shrink-0", moonIconClassName)} />
            ) : (
                <Sun className={cn("shrink-0", sunIconClassName)} />
            )}
        </Switch>
    )
}