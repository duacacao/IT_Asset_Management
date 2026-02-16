import { Separator } from '@/components/ui/separator'
import { CustomizerContent } from '@/components/theme-customizer/index'
import { ThemeWrapper } from '@/components/theme-customizer/theme-wrapper'

export default function AppearanceSettings() {
  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-muted-foreground text-sm">
          Customize the appearance of the application. Automatically switch between day and night
          themes.
        </p>
      </div>
      <Separator />
      <ThemeWrapper className="flex flex-col gap-8 md:flex-row md:gap-12">
        <div className="flex-1 lg:max-w-2xl">
          <div className="space-y-6">
            <CustomizerContent className="w-full" />
          </div>
        </div>
        <div className="hidden flex-1 md:block">
          <div className="bg-muted/20 rounded-lg border p-4">
            <div className="space-y-4">
              <div className="bg-muted h-2 w-1/2 rounded-lg" />
              <div className="bg-muted h-2 w-3/4 rounded-lg" />
              <div className="flex items-center gap-2">
                <div className="bg-muted h-8 w-8 rounded-full" />
                <div className="bg-muted h-2 w-1/3 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </ThemeWrapper>
    </div>
  )
}
