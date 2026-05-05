'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';
import { BusinessAnalysisContent } from "./BusinessAnalysisContent";
import { SpotentiateButton } from './SpotentiateButton';

const snapPoints = [0.12, 0.5, 0.9];

export const BusinessDrawer = () => {
    const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);

    return (
        <Drawer.Root
            open={true}
            dismissible={false}
            snapPoints={snapPoints}
            activeSnapPoint={snap}
            setActiveSnapPoint={setSnap}
            modal={false}
        >
            <Drawer.Portal>
                <Drawer.Content className="overscroll-contain bg-background fixed bottom-0 left-0 right-0 flex flex-col rounded-t-[24px] h-svh z-50">

                    <div className="pt-3 pb-2">
                        {/* the drag button */}
                        <div className="mx-auto w-12 h-1.5 rounded-full bg-gray-200 mb-2" />
                        <div className="px-6 flex flex-col items-center text-center gap-1">
                            <Drawer.Title className="text-sm text-muted-foreground">
                                Drag up to see more details
                            </Drawer.Title>
                            <div className="w-full max-w-50">
                                <SpotentiateButton />
                            </div>
                        </div>
                    </div>

                    <div
                        // leaving this div to scroll for content
                        data-vaul-no-drag
                        className="flex-1 min-h-0 pt-3 overflow-y-auto px-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] touch-pan-y"
                    >
                        <BusinessAnalysisContent />
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}