export interface PinMarkerProps extends PinMarkerSrcProps {
    lng: number;
    lat: number;
    onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
}

export interface PinMarkerSrcProps {
    src?: string;
    alt?: string;
    className?: string;
}