"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  /** Tailwind gradient classes for the artwork panel. */
  gradient: string;
  emoji: string;
}

const HeroCarousel = ({ slides }: { slides: HeroSlide[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();

    const interval = setInterval(() => emblaApi.scrollNext(), 6000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="group/carousel relative overflow-hidden rounded-2xl border">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={cn(
                "relative min-w-0 flex-[0_0_100%] bg-gradient-to-br text-white",
                slide.gradient,
              )}
            >
              <div className="flex flex-col justify-between gap-6 p-8 md:flex-row md:items-center md:p-14">
                <div className="max-w-xl">
                  <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
                    {slide.eyebrow}
                  </p>
                  <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                    {slide.title}
                  </h1>
                  <p className="mt-3 text-white/85 md:text-lg">
                    {slide.subtitle}
                  </p>
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="mt-6"
                  >
                    <Link href={slide.ctaHref}>{slide.ctaLabel}</Link>
                  </Button>
                </div>
                <div
                  aria-hidden
                  className="hidden select-none text-[120px] leading-none drop-shadow-lg md:block"
                >
                  {slide.emoji}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        aria-label="Previous slide"
        onClick={scrollPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white opacity-0 backdrop-blur transition-opacity hover:bg-white/30 group-hover/carousel:opacity-100"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        aria-label="Next slide"
        onClick={scrollNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white opacity-0 backdrop-blur transition-opacity hover:bg-white/30 group-hover/carousel:opacity-100"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === selected ? "w-6 bg-white" : "w-1.5 bg-white/50",
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
