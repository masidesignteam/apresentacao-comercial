import { IconCloud } from "@/components/ui/icon-cloud";

const brandColorSet = [
  "/logos/symbol/masi-symbol-green.png",
  "/logos/brands/academy/symbol/academy-symbol-brand.png",
  "/logos/brands/workshop/symbol/workshop-symbol-brand.png",
  "/logos/brands/experience/symbol/experience-symbol-brand.png",
  "/logos/brands/action/symbol/action-symbol-brand.png",
  "/logos/brands/aceleracao/symbol/aceleracao-symbol-brand.png",
  "/logos/brands/founder/symbol/founder-symbol-brand.png",
  "/logos/brands/advisor/symbol/advisor-symbol-brand.png",
];

const darkSet = [
  "/logos/symbol/masi-symbol-dark.png",
  "/logos/brands/academy/symbol/academy-symbol-dark.png",
  "/logos/brands/workshop/symbol/workshop-symbol-dark.png",
  "/logos/brands/experience/symbol/experience-symbol-dark.png",
  "/logos/brands/action/symbol/action-symbol-dark.png",
  "/logos/brands/aceleracao/symbol/aceleracao-symbol-dark.png",
  "/logos/brands/founder/symbol/founder-symbol-dark.png",
  "/logos/brands/advisor/symbol/advisor-symbol-dark.png",
];

// 8 MN design system icons (black) paired with the brand symbols
const mnIconSet = [
  "/icons/design/logotipo.svg",
  "/icons/design/simbolo.svg",
  "/icons/design/paleta-de-cores.svg",
  "/icons/design/icones.svg",
  "/icons/design/section-e-forma.svg",
  "/icons/design/glass.svg",
  "/icons/design/uso.svg",
  "/icons/gerais/chat.svg",
];

export const brandCloudImages = {
  brandColors: brandColorSet,
  brandColorsWithIcons: brandColorSet.flatMap((item, i) => [item, mnIconSet[i]]),
  dark: darkSet,
  darkWithIcons: darkSet.flatMap((item, i) => [item, mnIconSet[i]]),
};

export function IconCloudBrand({
  variant = "brandColors",
  size,
  className,
  maxBlur,
  autoRotateAxis,
}: {
  variant?: keyof typeof brandCloudImages;
  size?: number;
  className?: string;
  maxBlur?: number;
  autoRotateAxis?: "free" | "x" | "y";
}) {
  return (
    <IconCloud
      images={brandCloudImages[variant]}
      size={size}
      className={className}
      maxBlur={maxBlur}
      autoRotateAxis={autoRotateAxis}
    />
  );
}
