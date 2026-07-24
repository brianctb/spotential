"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { Tabs } from "./ui/tabs";
import {
  BusinessTabsList,
  BusinessTabsContent,
  BUSINESS_TYPES_TAB,
} from "./BusinessAnalysisContent";
import { SpotentiateButton } from "./SpotentiateButton";

const snapPoints = [0.1, 0.5, 0.9];

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

          <Tabs
            defaultValue={BUSINESS_TYPES_TAB}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="px-5">
              <BusinessTabsList />
            </div>

            <div
              // leaving this div to scroll for content
              data-vaul-no-drag
              className="flex-1 min-h-0 overflow-y-auto px-3 pb-[calc(6rem+env(safe-area-inset-bottom))] touch-pan-y"
            >
              <div className="px-2">
                <BusinessTabsContent />
              </div>
            </div>
          </Tabs>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
