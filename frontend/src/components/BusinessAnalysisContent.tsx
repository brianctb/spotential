import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from "./ui/tabs"

import { BusinessCategoryAccordion } from "./tabs/BusinessCategoryAccordion";
import { DemographicsAccordion } from "./tabs/DemographicsAccordion";
import { useIsMobile } from "@/hooks/use-mobile";

export const BusinessAnalysisContent = () => {
    const businessTabId = "businessTypes";
    const demographicsTabId = "demographics";

    const isMobile = useIsMobile()

    return (
        <Tabs defaultValue={businessTabId} className="w-full px-2">
            <TabsList variant="line" className="w-full flex justify-center">
                <TabsTrigger value={businessTabId}>Business Types</TabsTrigger>
                <TabsTrigger value={demographicsTabId}>Demographics</TabsTrigger>
            </TabsList>

            <TabsContent value={businessTabId}>
                <BusinessCategoryAccordion showButton={!isMobile} />
            </TabsContent>

            <TabsContent value={demographicsTabId}>
                <DemographicsAccordion />
            </TabsContent>
        </Tabs>
    )

}