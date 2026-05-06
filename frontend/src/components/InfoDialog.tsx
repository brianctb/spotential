'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LucideIcon, ExternalLink, Bug, Cpu, Database, User, Layers, MousePointer2 } from "lucide-react";
import { SpotentialLogo } from "./SpotentialLogo";

type InfoDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

interface FeatureItemProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

const FeatureItem = ({ icon: Icon, title, description }: FeatureItemProps) => (
    <div className="flex gap-4">
        <Icon className="h-6 w-6 text-muted-foreground shrink-0 mt-0.5" />
        <div className="space-y-1">
            <h4 className="text-base font-bold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground leading-snug">
                {description}
            </p>
        </div>
    </div>
);

export function InfoDialog({ open, onOpenChange }: InfoDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-150 max-h-[70vh] overflow-y-auto border-border/40 shadow-2xl p-8">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-3xl font-bold flex items-center gap-3">
                        <SpotentialLogo />
                        Spotential
                    </DialogTitle>
                    <DialogDescription className="text-xs uppercase tracking-[0.25em] font-black text-primary/90">
                        Location intelligence platform
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8 pt-4">
                    <div className="space-y-3">
                        <p className="text-base leading-relaxed text-foreground/90">
                            The name is a simple equation: <strong>Spot + Potential</strong>.
                        </p>
                        <p className="text-base leading-relaxed text-muted-foreground">
                            This platform was built to help entrepreneurs instantly evaluate the
                            <strong> potential of a spot</strong> by synthesizing geospatial
                            intelligence and machine learning.
                        </p>
                    </div>

                    <Separator className="opacity-50" />

                    {/* How to Use Section */}
                    <div className="bg-primary/5 rounded-xl p-5 space-y-4 border border-primary/10">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
                            <MousePointer2 className="h-4 w-4" />
                            <span>How to Spotentiate</span>
                        </div>
                        <ol className="text-sm space-y-3 text-foreground/90 font-medium">
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">1.</span>
                                Select a <strong>Business Type</strong> from the menu.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">2.</span>
                                Click any <strong>Location</strong> on the map.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">3.</span>
                                Get your 0–100 score and localized metrics.
                            </li>
                        </ol>
                    </div>

                    {/* Features of App */}
                    <div className="grid gap-6">
                        <FeatureItem
                            icon={Database}
                            title="On-Demand Spatial Joins"
                            description="Aggregates demographic and business data at the coordinate level via PostGIS."
                        />
                        <FeatureItem
                            icon={Cpu}
                            title="Opportunity Scoring"
                            description="Custom XGBoost regression model analyzing competition and population density."
                        />
                        <FeatureItem
                            icon={Layers}
                            title="Geospatial Visualization"
                            description="High-performance rendering via MapLibre and optimized vector tiles."
                        />
                    </div>

                    <Separator className="opacity-50" />

                    {/* Developer Info */}
                    <div className="flex items-center justify-between group">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                <User className="h-3 w-3" />
                                <span>Developer</span>
                            </div>
                            <p className="text-base font-bold">Brian Lee</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground text-right max-w-50 leading-tight italic">
                            Exploring high-performance geospatial architectures.
                        </p>
                    </div>

                    {/* Bug Report */}
                    <div className="pt-2">
                        <Button
                            className="w-full h-14 justify-between px-5 bg-primary text-primary-foreground hover:opacity-90 transition-all group rounded-xl shadow-lg shadow-primary/20"
                            asChild
                        >
                            <a
                                href="https://docs.google.com/forms/d/e/1FAIpQLSemPDNe8ShfF__KsUH6BQMf-aoAIRHCW-O85SxbrNxZTAeT9A/viewform?usp=sharing"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className="flex items-center gap-3 text-base font-bold">
                                    <Bug className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                    Report an Issue
                                </span>
                                <ExternalLink className="h-4 w-4 opacity-70" />
                            </a>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}