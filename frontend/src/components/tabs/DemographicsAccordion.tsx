import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Landmark, Users, GraduationCap, Sparkle, Star } from "lucide-react";
import { useAnalysisQuery } from "@/hooks/useAnalysisQuery";

const StatCard = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
    <Card className="shadow-md m-0.5 py-0.75 px-0">
        <CardContent>
            <p className="text-[11px] uppercase font-bold text-muted-foreground">{label}</p>
            <p className="text-[14px] font-bold tabular-nums">{value || '-'}</p>
        </CardContent>
    </Card>
);

const DemographicSection = ({
    value,
    title,
    icon: Icon,
    children,
    isPrimary = false
}: {
    value: string;
    title: string;
    icon: any;
    children: React.ReactNode;
    isPrimary?: boolean;
}) => (
    <AccordionItem value={value} className="border-b-0 px-4">
        <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${isPrimary ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-semibold ${isPrimary ? 'text-primary' : ''}`}>{title}</span>
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

    if (!demographics) return null;

    const populationContent = (
        <>
            <StatCard label="Total Population" value={demographics?.population} />
            <div className="grid grid-cols-2 gap-1">
                <StatCard label="Density" value={demographics?.population_density?.toFixed(0)} />
                <StatCard label="Age 15-64" value={demographics?.count_age_15_64} />
            </div>
        </>
    );

    const economicsContent = (
        <>
            <StatCard label="Median Household Income" value={demographics?.median_household_income} />
            <StatCard label="Working Age Percentage" value={demographics?.pct_working_age?.toFixed(1)} />
            <div className="grid grid-cols-2 gap-1">
                <StatCard label="Household Count" value={demographics?.household_count} />
                <StatCard label="Household Size" value={demographics?.avg_household_size} />
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
                children={populationContent}
            />

            {/* SECTION: ECONOMICS */}
            <DemographicSection
                value="economics"
                title="Economics"
                icon={Landmark}
                children={economicsContent}
            />

            {/* SECTION: EDUCATION */}
            <DemographicSection
                value="education"
                title="Education"
                icon={GraduationCap}
                children={educationContent}
            />

            {/* SECTION: OPPORTUNITY */}
            <DemographicSection
                value="opportunity"
                title="Opportunity"
                icon={Sparkle}
                children={opportunityContent}
            />

        </Accordion>
    );
};