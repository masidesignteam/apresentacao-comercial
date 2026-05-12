import Image from "next/image";
import ecosystemImage from "../../../Imagens/Masi Negocios Ecosistema.png";
import ecosystemImageTwo from "../../../Imagens/Masi Negocios Ecosistema 2.png";
import { ChamferedPanel } from "@/components/chamfered-panel";
import { IconCloudBrand } from "@/components/magicui/icon-cloud-brand";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { Typography } from "@/components/typography";
import { FoundationFooter } from "./foundation-sections";

const cards = [
  {
    title: "O que é o Design System",
    description:
      "Um repertório compartilhado de decisões visuais, componentes, padrões e regras para construir interfaces e materiais da Masi Negócios com mais clareza e menos retrabalho.",
    image: ecosystemImage,
    imageAlt: "Ecossistema Masi Negócios",
  },
  {
    title: "Como ele ajuda a marca",
    description:
      "Ele mantém consistência entre produtos, apresentações, páginas, conteúdos e experiências comerciais, preservando identidade enquanto acelera a execução.",
    image: ecosystemImageTwo,
    imageAlt: "Marcas do ecossistema Masi Negócios",
  },
];

const heroTitle = "Bem-vindo ao Design System Masi Negócios.";
const heroTitleClassName =
  "max-w-5xl text-center text-[62px] font-extrabold leading-[1.05] tracking-normal text-foreground";

export default function StyleguideHomePage() {
  return (
    <div className="ds-page">
      <section className="w-full">
        <ChamferedPanel
          strokeColor="#FFFFFF"
          strokeWidth={1}
          innerStyle={{
            background: "#ECECEC",
            borderRadius: 10,
            padding: "100px var(--section-padding-x) var(--section-padding-y)",
          }}
        >
          <div className="flex w-full flex-col items-center overflow-hidden">
            <div className="flex w-full max-w-5xl flex-col items-center gap-[60px] text-center">
              <Image
                src="/logos/primary/masi-primary-dark.svg"
                alt="Masi Negócios"
                width={256}
                height={77}
                priority
                className="h-auto w-[256px]"
              />
              <div className="relative z-10 w-full max-w-5xl">
                <h1 className={`${heroTitleClassName} invisible mx-auto`} aria-hidden="true">
                  {heroTitle}
                </h1>
                <TypingAnimation
                  as="h1"
                  duration={2600}
                  className={`${heroTitleClassName} absolute inset-x-0 top-0 mx-auto`}
                >
                  {heroTitle}
                </TypingAnimation>
              </div>
            </div>

            <div className="relative z-0 -mb-6 flex w-full -translate-y-[4%] justify-center overflow-hidden">
              <IconCloudBrand
                variant="brandColorsWithIcons"
                size={840}
                maxBlur={5}
                autoRotateAxis="y"
                className="size-[min(70vw,644px)] max-h-[644px] max-w-[644px]"
              />
            </div>

            <div className="mt-12 grid w-full gap-6 lg:grid-cols-2">
              {cards.map((card) => (
                <div key={card.title} className="ds-card !p-[30px] flex flex-col gap-6">
                  <div>
                    <Typography as="h2" variant="h3" className="mb-3 text-foreground">
                      {card.title}
                    </Typography>
                    <Typography as="p" variant="body" className="text-muted-foreground">
                      {card.description}
                    </Typography>
                  </div>
                  {card.image && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[10px] border border-black/10 bg-[#ECECEC]">
                      <Image
                        src={card.image}
                        alt={card.imageAlt}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  {!card.image && (
                    <div className="aspect-[16/9] w-full rounded-[10px] border border-black/10 bg-[#ECECEC]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </ChamferedPanel>
      </section>

      <FoundationFooter />
    </div>
  );
}
