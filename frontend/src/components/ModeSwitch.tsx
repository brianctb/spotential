"use client"

import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Sun, Moon } from "lucide-react";
import { useState, useEffect, ComponentProps } from "react"
import { cn } from "@/lib/utils"

interface ModeToggleProps extends ComponentProps<typeof Switch> {
    currentTheme: string | undefined;
    onThemeChange: (theme: string) => void;
}

export const ModeToggle = ({
    currentTheme,
    onThemeChange,
    className,
    ...props
}: ModeToggleProps) => {
    const [mounted, setMounted] = useState(false)

    // avoid hydration by checking mode after mounting
    useEffect(() => {
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
                "**:data-[slot=switch-thumb]:flex **:data-[slot=switch-thumb]:items-center **:data-[slot=switch-thumb]:justify-center",
                className
            )}
        >
            {currentTheme === "dark" ? (
                <Moon className="h-2.5 w-2.5" />
            ) : (
                <Sun className="h-2.5 w-2.5" />
            )}
        </Switch>
    )
}