"use client";

import { useState } from "react";
import type { CommercialPresentation } from "@/data/commercial-presentations";
import { SlideNavigation } from "./SlideNavigation";
import { SlideThumbnailRail } from "./SlideThumbnailRail";
import { SlideViewport } from "./SlideViewport";

export function PresentationCarousel({
  presentation,
}: {
  presentation: CommercialPresentation;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = presentation.slides[currentIndex] ?? presentation.slides[0];

  function previousSlide() {
    setCurrentIndex((current) =>
      current === 0 ? presentation.slides.length - 1 : current - 1
    );
  }

  function nextSlide() {
    setCurrentIndex((current) =>
      current === presentation.slides.length - 1 ? 0 : current + 1
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SlideViewport presentation={presentation} slide={currentSlide} />
      <SlideNavigation
        currentIndex={currentIndex}
        total={presentation.slides.length}
        onPrevious={previousSlide}
        onNext={nextSlide}
      />
      <SlideThumbnailRail
        presentation={presentation}
        currentIndex={currentIndex}
        onSelect={setCurrentIndex}
      />
    </div>
  );
}
