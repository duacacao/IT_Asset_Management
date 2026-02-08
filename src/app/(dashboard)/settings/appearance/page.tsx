import { Separator } from "@/components/ui/separator"
import { CustomizerContent } from "@/components/theme-customizer/index"
import { ThemeWrapper } from "@/components/theme-wrapper"

export default function AppearanceSettings() {
  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the appearance of the application. Automatically switch between day and night themes.
        </p>
      </div>
      <Separator />
      <ThemeWrapper className="flex flex-col gap-8 md:flex-row md:gap-12">
        <div className="flex-1 lg:max-w-2xl">
          <div className="space-y-6">
            <CustomizerContent className="w-full" />
          </div>
        </div>
        <div className="hidden md:block flex-1">
          <div className="rounded-lg border bg-muted/20 p-4">
            <div className="space-y-4">
              <div className="h-2 w-1/2 rounded-lg bg-muted" />
              <div className="h-2 w-3/4 rounded-lg bg-muted" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="h-2 w-1/3 rounded-lg bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </ThemeWrapper>
    </div>
  )
}
