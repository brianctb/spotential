"use client";

import { SpotentialMap } from "@/components/map/Map";
import { BusinessSidebar } from "@/components/BusinessSideBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { BusinessDrawer } from "@/components/BusinessDrawer";
import { SpotentialHeader } from "@/components/SpotentialHeader";
import { Suspense } from "react";
import { InfoDialog } from "@/components/InfoDialog";
import { useMapStore } from "@/store/mapStore";

export default function Home() {
  const isMobile = useIsMobile()
  const { infoDialogOpen, setInfoDialogOpen } = useMapStore()

  return (
    <main className="flex flex-col h-screen w-full overflow-hidden bg-transparent">
      <Suspense>
        {isMobile && <SpotentialHeader />}
        {!isMobile && <BusinessSidebar />}
        <SpotentialMap />
        {isMobile && <BusinessDrawer />}
        <InfoDialog
          open={infoDialogOpen}
          onOpenChange={setInfoDialogOpen}
        />
      </Suspense>
    </main>
  );
}