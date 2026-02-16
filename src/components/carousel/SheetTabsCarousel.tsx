'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SheetTabsCarouselProps {
  sheets: string[]
  activeSheet: string
  onSelectSheet: (sheet: string) => void
  getDisplayName: (sheet: string) => string
  getCount: (sheet: string) => number
  slidesToShow?: number
}

// Parallax factor - so nho hon = effect nhe hon
const PARALLAX_FACTOR = 0.25

export function SheetTabsCarousel({
  sheets,
  activeSheet,
  onSelectSheet,
  getDisplayName,
  getCount,
  slidesToShow = 5,
}: SheetTabsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    slidesToScroll: 1,
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const parallaxRefs = useRef<(HTMLDivElement | null)[]>([])

  // Update scroll buttons state
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  // Parallax effect on scroll
  const onScroll = useCallback(() => {
    if (!emblaApi) return

    const scrollProgress = emblaApi.scrollProgress()
    setScrollProgress(scrollProgress)

    // Apply parallax to each slide
    emblaApi.scrollSnapList().forEach((snap, index) => {
      const diffToTarget = snap - scrollProgress
      const parallaxValue = diffToTarget * PARALLAX_FACTOR * 100
      const element = parallaxRefs.current[index]
      if (element) {
        element.style.transform = `translateX(${parallaxValue}%)`
      }
    })
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    onScroll()

    emblaApi.on('select', onSelect)
    emblaApi.on('scroll', onScroll)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('reInit', onScroll)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('scroll', onScroll)
      emblaApi.off('reInit', onSelect)
      emblaApi.off('reInit', onScroll)
    }
  }, [emblaApi, onSelect, onScroll])

  // Scroll to active sheet when it changes
  useEffect(() => {
    if (!emblaApi) return
    const index = sheets.indexOf(activeSheet)
    if (index >= 0) {
      emblaApi.scrollTo(index)
    }
  }, [emblaApi, activeSheet, sheets])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  // Neu chi co <= slidesToShow sheets thi khong can carousel
  if (sheets.length <= slidesToShow) {
    return (
      <div className="flex items-center gap-1.5">
        {sheets.map((sheet) => (
          <button
            key={sheet}
            onClick={() => onSelectSheet(sheet)}
            className={cn(
              'h-8 rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-all',
              'border border-transparent',
              activeSheet === sheet
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {getDisplayName(sheet)}
            <span className="ml-1.5 text-xs opacity-60">{getCount(sheet)}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {/* Prev button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-7 w-7 flex-shrink-0 rounded-full transition-opacity',
          !canScrollPrev && 'pointer-events-none opacity-30'
        )}
        onClick={scrollPrev}
        disabled={!canScrollPrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Carousel viewport */}
      <div className="flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex gap-1.5">
          {sheets.map((sheet, index) => (
            <div
              key={sheet}
              className="flex-shrink-0"
              style={{ flex: `0 0 calc(100% / ${slidesToShow})` }}
            >
              <div
                ref={(el) => {
                  parallaxRefs.current[index] = el
                }}
                className="overflow-hidden"
              >
                <button
                  onClick={() => onSelectSheet(sheet)}
                  className={cn(
                    'h-8 w-full rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-all',
                    'border border-transparent',
                    activeSheet === sheet
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {getDisplayName(sheet)}
                  <span className="ml-1.5 text-xs opacity-60">{getCount(sheet)}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-7 w-7 flex-shrink-0 rounded-full transition-opacity',
          !canScrollNext && 'pointer-events-none opacity-30'
        )}
        onClick={scrollNext}
        disabled={!canScrollNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
