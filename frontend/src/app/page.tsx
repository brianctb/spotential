"use client";

import { SpotentialMap } from "@/components/map/Map";
import { BusinessSidebar } from "@/components/BusinessSideBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { BusinessDrawer } from "@/components/BusinessDrawer";
import { SpotentialHeader } from "@/components/SpotentialHeader";
import { Suspense } from "react";

export default function Home() {
  const isMobile = useIsMobile()

  return (
    <main className="flex flex-col h-screen w-full overflow-hidden bg-transparent">
      <Suspense>
        {isMobile && <SpotentialHeader />}
        {!isMobile && <BusinessSidebar />}
        <SpotentialMap />
        {isMobile && <BusinessDrawer />}
      </Suspense>
    </main>
  );
}