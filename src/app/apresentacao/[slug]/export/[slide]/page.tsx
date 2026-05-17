import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PresentationSlide } from "@/components/commercial-presentations/PresentationSlide";
import { commercialPresentations, userPresentations } from "@/data/commercial-presentations";

type ExportSlidePageProps = {
  params: Promise<{ slug: string; slide: string }>;
};

const allPresentations = [...commercialPresentations, ...userPresentations];

export function generateStaticParams() {
  return allPresentations.flatMap((presentation) =>
    presentation.slides.map((_, index) => ({
      slug: presentation.slug,
      slide: `slide-${index + 1}`,
    }))
  );
}

export async function generateMetadata({
  params,
}: ExportSlidePageProps): Promise<Metadata> {
  const { slug, slide } = await params;
  const presentation = allPresentations.find((item) => item.slug === slug);
  const slideNumber = Number(slide.replace("slide-", ""));
  const currentSlide = presentation?.slides[slideNumber - 1];

  return {
    title: currentSlide && presentation
      ? `${currentSlide.eyebrow} | ${presentation.title.replace(/\n/g, " ")}`
      : "Slide não encontrado | MN Design System",
  };
}

export default async function ExportSlidePage({
  params,
}: ExportSlidePageProps) {
  const { slug, slide } = await params;

  if (!/^slide-\d+$/.test(slide)) {
    notFound();
  }

  const presentation = allPresentations.find((item) => item.slug === slug);
  if (!presentation) {
    notFound();
  }

  const slideNumber = Number(slide.replace("slide-", ""));
  const currentSlide = presentation.slides[slideNumber - 1];
  if (!currentSlide) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#D4D4D4]">
      <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async />
      <div
        id="figma-slide-capture"
        className="h-[900px] w-[1600px] overflow-hidden bg-[#D4D4D4]"
      >
        <PresentationSlide presentation={presentation} slide={currentSlide} />
      </div>
    </main>
  );
}
