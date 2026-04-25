import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Landmark, Users, GraduationCap, Sparkle } from "lucide-react";
import { useAnalysisQuery } from "@/hooks/useAnalysisQuery";

const StatCard = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
    <Card className="shadow-md m-0.5 py-0.75 px-0">
        <CardContent>
            <p className="text-[11px] min-h-8 uppercase font-bold text-muted-foreground">{label}</p>
            <p className="text-[14px] font-bold tabular-nums">{value || '-'}</p>
        </CardContent>
    </Card>
);

const DemographicSection = ({
    value,
    title,
    icon: Icon,
    iconClassName = "text-muted-foreground",
    children,
}: {
    value: string;
    title: string;
    icon: React.ElementType;
    iconClassName?: string;
    children: React.ReactNode;
}) => (
    <AccordionItem value={value} className="border-b-0 px-4">
        <AccordionTrigger className="hover:no-underline py-3 group transition-all">
            <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${iconClassName}`} />
                <span className="text-sm text-muted-foreground group-data-[state=open]:font-semibold group-data-[state=open]:text-foreground">
                    {title}
                </span>
            </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-2">
            {children}
        </AccordionContent>
    </AccordionItem>
);

export const DemographicsAccordion = () => {
    const { data: analysis } = useAnalysisQuery();
    const demographics = analysis?.demographics;
    const tract_stats = analysis?.tract_stats;

    if (!demographics) return (
        <div className="p-4 text-md text-muted-foreground text-center flex flex-col gap-3">
            <p className="text-lg">No area has been analyzed</p>
            <p>Please Spotentiate</p>
        </div>
    )

    const populationContent = (
        <>
            <StatCard label="Total Population" value={demographics?.population} />
            <div className="grid grid-cols-2 gap-1">
                <StatCard label="Density" value={demographics?.population_density?.toFixed(0)} />
                <StatCard label="Age 15-64 Count" value={demographics?.count_age_15_64} />
            </div>
        </>
    );

    const economicsContent = (
        <>
            <StatCard label="Median Household Income" value={demographics?.median_household_income} />
            <StatCard label="Working Age Percentage" value={demographics?.pct_working_age?.toFixed(1)} />
            <div className="grid grid-cols-2 gap-1">
                <StatCard label="Household Count" value={demographics?.household_count} />
                <StatCard label="Household Size" value={demographics?.avg_household_size?.toFixed(1)} />
            </div>
        </>

    )

    const educationContent = (
        <>
            <StatCard label="Highly Educated Percentage" value={demographics?.pct_highly_educated?.toFixed(1)} />
            <div className="grid grid-cols-2 gap-1">
                <StatCard label="Educated Adults (25+)" value={demographics?.education_base_pop_25_plus} />
                <StatCard label="Post-Secondary" value={demographics?.count_postsecondary_edu_plus} />
            </div>
        </>
    )

    const opportunityContent = (
        <>
            <StatCard label="Score" value={tract_stats?.score?.toFixed(2)} />
            <StatCard label="All Businesses Count" value={tract_stats?.business_in_tract} />
            <div className="grid grid-cols-2 gap-1">
                <StatCard label="Predicted Count" value={Math.round(tract_stats?.predicted_count || 0)} />
                <StatCard label="Actual Count" value={tract_stats?.actual_count} />
            </div>
        </>
    )

    return (
        <Accordion type="multiple" defaultValue={["population"]} className="w-full">
            {/* SECTION: POPULATION */}
            <DemographicSection
                value="population"
                title="Population"
                icon={Users}
                iconClassName="text-blue-500"
                children={populationContent}
            />

            {/* SECTION: ECONOMICS */}
            <DemographicSection
                value="economics"
                title="Economics"
                icon={Landmark}
                iconClassName="text-amber-500"
                children={economicsContent}
            />

            {/* SECTION: EDUCATION */}
            <DemographicSection
                value="education"
                title="Education"
                icon={GraduationCap}
                iconClassName="text-emerald-500"
                children={educationContent}
            />

            {/* SECTION: OPPORTUNITY */}
            <DemographicSection
                value="opportunity"
                title="Opportunity"
                icon={Sparkle}
                iconClassName="text-yellow-400"
                children={opportunityContent}
            />

        </Accordion>
    );
};