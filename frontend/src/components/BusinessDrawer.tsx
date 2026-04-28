'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';
import { BusinessAnalysisContent } from "./BusinessAnalysisContent";
import { SpotentiateButton } from './SpotentiateButton';

const snapPoints = [0.15, 0.5, 1];

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
                <Drawer.Content className="bg-background fixed bottom-0 left-0 right-0 flex flex-col rounded-t-[24px] h-[96dvh] z-50">

                    <div className="pt-3 pb-2">
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

                    <div className="flex-1 overflow-y-auto py-2 px-3">
                        <BusinessAnalysisContent />
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}