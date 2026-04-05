export interface PinMarkerProps extends PinMarkerSrcProps {
    lng: number;
    lat: number;
    onClick?: () => void;
}

export interface PinMarkerSrcProps {
    src?: string;
    alt?: string;
    className?: string;
}