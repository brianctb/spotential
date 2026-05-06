"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarHeader
} from "@/components/ui/sidebar";
import { ModeToggle } from "./ModeSwitch";
import { useTheme } from "next-themes";
import { BusinessAnalysisContent } from "./BusinessAnalysisContent";
import { SpotentialLogo } from "@/components/SpotentialLogo";
import { Info } from "lucide-react";
import { Button } from "./ui/button";
import { useMapStore } from "@/store/mapStore";

export const BusinessSidebar = () => {

    const { theme, setTheme } = useTheme()
    const { infoDialogOpen, setInfoDialogOpen } = useMapStore()

    return (
        <Sidebar className="border-r z-3">
            <SidebarHeader className="flex flex-row items-center justify-between p-4 bg-background">
                <div className="flex items-center gap-2">
                    <SpotentialLogo />
                    <h1 className="text-lg font-bold text-app-title">Spotential</h1>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setInfoDialogOpen(!infoDialogOpen) }}
                    >
                        <Info className="h-4 w-4" />
                    </Button>
                    <ModeToggle
                        currentTheme={theme === 'dark' ? 'dark' : 'light'}
                        onThemeChange={setTheme}
                        className="scale-125"
                    />
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-background">
                <BusinessAnalysisContent />
            </SidebarContent>
        </Sidebar>
    );
}