"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarHeader
} from "@/components/ui/sidebar";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from "@/components/ui/tabs";
import { BusinessCategoryAccordion } from "@/components/tabs/BusinessCategoryAccordion";
import { DemographicsAccordion } from "@/components/tabs/DemographicsAccordion";
import { ModeToggle } from "./ModeSwitch";
import { useTheme } from "next-themes";

export const BusinessSidebar = () => {

    const businessTabId = "businessTypes";
    const demographicsTabId = "demographics";
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
                <Tabs defaultValue={businessTabId} className="w-full">
                    <TabsList variant="line" className="w-full flex justify-center">
                        <TabsTrigger value={businessTabId}>Business Types</TabsTrigger>
                        <TabsTrigger value={demographicsTabId}>Demographics</TabsTrigger>
                    </TabsList>

                    <TabsContent value={businessTabId}>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <BusinessCategoryAccordion />
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </TabsContent>

                    <TabsContent value={demographicsTabId}>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <DemographicsAccordion />
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </TabsContent>
                </Tabs>


            </SidebarContent>
        </Sidebar>
    );
}