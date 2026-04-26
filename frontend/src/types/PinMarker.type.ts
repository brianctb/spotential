export interface PinMarkerProps extends PinMarkerSrcProps {
    lng: number;
    lat: number;
    onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
    overlay?: React.ReactNode
}

export interface PinMarkerSrcProps {
    src?: string;
    alt?: string;
    className?: string;
}