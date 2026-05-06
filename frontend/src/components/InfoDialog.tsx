'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type InfoDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function InfoDialog({ open, onOpenChange }: InfoDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>About Spotential</DialogTitle>
                    <DialogDescription>
                        Location intelligence platform for analyzing business opportunities.
                    </DialogDescription>
                </DialogHeader>

                <div className="-mx-4 max-h-[50vh] overflow-y-auto px-4 space-y-4">
                    <p>
                        Spotential helps identify underserved business opportunities by combining
                        geospatial data, demographics, and machine learning.
                    </p>

                    <p>
                        Users can select a location on an interactive map and receive a 0–100 score
                        based on market potential, competition density, and demographic factors.
                    </p>

                    <p>
                        Built with Next.js, FastAPI, PostGIS, and XGBoost.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}