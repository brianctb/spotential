"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarHeader
} from "@/components/ui/sidebar";

import { ModeToggle } from "./ModeSwitch";
import { useTheme } from "next-themes";
import { BusinessAnalysisContent } from "./BusinessAnalysisContent";

export const BusinessSidebar = () => {

    const { theme, setTheme } = useTheme()

    return (
        <Sidebar className="border-r z-3">
            <SidebarHeader className="flex flex-row items-center justify-between p-4 bg-background">
                <h1 className="text-lg font-bold text-app-title">Spotential</h1>
                <ModeToggle
                    currentTheme={theme === 'dark' ? 'dark' : 'light'}
                    onThemeChange={setTheme}
                    className="scale-125"
                />
            </SidebarHeader>

            <SidebarContent className="bg-background">
                <BusinessAnalysisContent />
            </SidebarContent>
        </Sidebar>
    );
}