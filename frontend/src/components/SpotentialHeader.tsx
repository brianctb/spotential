import { ModeToggle } from "./ModeSwitch"
import { useTheme } from "next-themes"
import { SpotentialLogo } from "@/components/SpotentialLogo"
import { useMapStore } from "@/store/mapStore"
import { Button } from "./ui/button"
import { Info } from "lucide-react"

export const SpotentialHeader = () => {
    const { theme, setTheme } = useTheme()
    const { infoDialogOpen, setInfoDialogOpen } = useMapStore()

    return (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
            <header className="flex items-center justify-between w-full h-12 px-4 bg-background/85 rounded-2xl shadow-lg">
                <div className="flex items-center gap-2">
                    <SpotentialLogo />
                    <h1 className="text-lg font-bold text-app-title">Spotential</h1>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setInfoDialogOpen(!infoDialogOpen) }}
                    >
                        <Info className="h-4 w-4" />
                    </Button>
                    <ModeToggle
                        currentTheme={theme === "dark" ? "dark" : "light"}
                        onThemeChange={setTheme}
                        className="scale-125"
                    />
                </div>
            </header>
        </div>
    )
}