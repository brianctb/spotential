"use client";

import { useState } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarHeader
} from "@/components/ui/sidebar";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    {
        key: "fitness",
        label: "Fitness",
        types: [
            { key: "fitness_centre", label: "Gym" },
            { key: "ice_rink", label: "Ice Rink" },
        ],
    },
    {
        key: "food",
        label: "Food & Drink",
        types: [
            { key: "restaurant", label: "Restaurant" },
            { key: "cafe", label: "Cafe" },
            { key: "fast_food", label: "Fast Food" },
            { key: "bar", label: "Bar" },
        ],
    },
    {
        key: "retail",
        label: "Retail",
        types: [
            { key: "supermarket", label: "Supermarket" },
            { key: "convenience", label: "Convenience Store" },
            { key: "bakery", label: "Bakery" },
        ],
    },
    {
        key: "service",
        label: "Services",
        types: [
            { key: "bank", label: "Bank" },
            { key: "clinic", label: "Clinic" },
            { key: "dentist", label: "Dentist" },
        ],
    },
];

export function BusinessSidebar() {
    const [selectedType, setSelectedType] = useState<string>("");

    return (
        <Sidebar className="border-r">
            <SidebarHeader>
                <h1 className="text-lg font-bold">Spotential</h1>
            </SidebarHeader>

            <SidebarContent className="px-5">
                <p className="text-sm text-muted-foreground mb-2">
                    Select a business type
                </p>

                <Accordion type="multiple" className="w-full">
                    {CATEGORIES.map((category) => (
                        // each category is a group
                        <SidebarGroup key={category.key}>
                            <AccordionItem value={category.key}>
                                <AccordionTrigger>
                                    <SidebarGroupLabel>
                                        {category.label}
                                    </SidebarGroupLabel>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <SidebarGroupContent>
                                        <RadioGroup
                                            value={selectedType}
                                            onValueChange={setSelectedType}
                                            className="space-y-1"
                                        >
                                            {category.types.map((type) => (
                                                <div
                                                    key={type.key}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <RadioGroupItem
                                                        value={type.key}
                                                        id={type.key}
                                                    />
                                                    <Label htmlFor={type.key}>
                                                        {type.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </SidebarGroupContent>
                                </AccordionContent>
                            </AccordionItem>
                        </SidebarGroup>
                    ))}
                </Accordion>
                <div className="mt-4 flex justify-center">
                    <Button
                        className="w-40"
                    >
                        Spotentiate
                    </Button>
                </div>
            </SidebarContent>
        </Sidebar>
    );
}