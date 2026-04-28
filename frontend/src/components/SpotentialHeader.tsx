import { ModeToggle } from "./ModeSwitch"
import { useTheme } from "next-themes"
import { SpotentialLogo } from "@/SpotentialLogo"

export const SpotentialHeader = () => {
    const { theme, setTheme } = useTheme()


    return (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
            <header className="flex items-center justify-between w-full h-12 px-4 bg-background/85 rounded-2xl shadow-lg">
                <div className="flex items-center gap-2">
                    <SpotentialLogo />
                    <h1 className="text-lg font-bold text-app-title">Spotential</h1>
                </div>
                <ModeToggle
                    currentTheme={theme === "dark" ? "dark" : "light"}
                    onThemeChange={setTheme}
                    className="scale-125"
                />
            </header>
        </div>
    )
}