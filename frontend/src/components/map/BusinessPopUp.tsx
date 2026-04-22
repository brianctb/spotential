import {
    Popover,
    PopoverAnchor,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
} from "@/components/ui/popover";
import { BusinessBase } from "@/types/business";
import { Marker } from "react-map-gl/maplibre";
import { useBusinessMetadata } from "@/hooks/useBusinessMeta";

interface BusinessPopUpProps {
    lat: number;
    lng: number;
    business: BusinessBase
}

const rowClassName = "flex justify-between items-start text-xs gap-4";
const labelClassName = "text-muted-foreground font-medium shrink-0";

const DataRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <div className={rowClassName}>
        <span className={labelClassName}>{label}</span>
        <span className="font-bold text-right wrap-break-word max-w-40">
            {value ?? "-"}
        </span>
    </div>
);
export const BusinessPopUp = ({ lat, lng, business }: BusinessPopUpProps) => {
    const metaData = useBusinessMetadata();
    return (
        // Marker is used solely for positioning the popover; it doesn't render anything itself
        <Marker
            longitude={lng}
            latitude={lat}
            anchor="bottom"
        >
            <Popover open>
                <PopoverAnchor asChild>
                    <div className="w-1 h-1 bg-transparent" />
                </PopoverAnchor>
                <PopoverContent className="w-64 p-4 z-1" side="top" align="center">
                    <PopoverHeader>
                        <PopoverTitle className="text-md font-semibold border-b border-gray-200 pb-2">
                            {business.name}
                        </PopoverTitle>
                    </PopoverHeader>
                    <div className="flex flex-col gap-2">
                        <DataRow label="ID" value={business.osm_id} />
                        <DataRow label="Category" value={metaData.get(business.category)?.label || business.category} />
                        <DataRow label="Business Type" value={metaData.get(business.type)?.label || business.type} />
                        <div className="flex justify-between items-start text-xs gap-4">
                            <span className={labelClassName}>Website</span>
                            {business.website ? (
                                <a
                                    href={business.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-sky-500 hover:text-sky-600 hover:underline truncate max-w-40"
                                >
                                    {business.website.replace(/^https?:\/\/(www\.)?|\/$/g, '')}
                                </a>
                            ) : (
                                <span className="font-bold text-muted-foreground">-</span>
                            )}
                        </div>
                        <DataRow label="Hours" value={business.opening_hours} />
                    </div>
                </PopoverContent>
            </Popover>
        </Marker>
    );
};