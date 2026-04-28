"use client";

import { SpotentialMap } from "@/components/map/Map";
import { BusinessSidebar } from "@/components/BusinessSideBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { BusinessDrawer } from "@/components/BusinessDrawer";

export default function Home() {
  const isMobile = useIsMobile()

  return (
    <main className="flex h-screen w-full">
      {!isMobile && <BusinessSidebar />}
      <SpotentialMap />
      {isMobile && <BusinessDrawer />}
    </main>
  );
}