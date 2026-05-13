/**
 * Exportador fiel para PowerPoint — replica o design system exato dos slides.
 * Uso: npx tsx scripts/export-pptx.ts <slug>
 */

import PptxGenJS from "pptxgenjs";
import { userPresentations } from "../src/data/commercial-presentations/user-presentations";
import type {
  CommercialPresentation,
  CommercialSlide,
} from "../src/data/commercial-presentations/types";
import * as fs from "fs";
import * as path from "path";

// ─── Conversão px→" (base 1600×900 → 13.33"×7.5" LAYOUT_WIDE) ───────────────

const W = 13.33;  // largura do slide em polegadas
const H = 7.5;    // altura do slide em polegadas
const p = (px: number) => +(px * W / 1600).toFixed(5); // px → inches (ref: largura)
const ph = (px: number) => +(px * H / 900).toFixed(5);  // px → inches (ref: altura)
const pt = (px: number) => +(px * 0.75).toFixed(2);      // px → pt (fonte)
const pct = (percent: number, ref: number) => +(percent / 100 * ref).toFixed(5);

// ─── Estrutura LIGHT shell ────────────────────────────────────────────────────
// article: bg=#D4D4D4, p=20px
// section: bg=#ECECEC, rounded-[10px], p=70px

const L = {
  pagePad:  p(20),        // 0.16663
  secBg:    "ECECEC",
  secPad:   p(70),        // 0.58319
  secR:     p(10) * 0.8,  // border-radius ≈ 0.066
  get secX() { return this.pagePad; },
  get secY() { return this.pagePad; },
  get secW() { return W - this.pagePad * 2; },       // 12.99674
  get secH() { return H - this.pagePad * 2; },       // 7.16674
  get conX() { return this.secX + this.secPad; },    // 0.74982
  get conY() { return this.secY + this.secPad; },    // 0.74982
  get conW() { return this.secW - this.secPad * 2; }, // 11.83036
  get conH() { return this.secH - this.secPad * 2; }, // 6.00036
  // Conteúdo utilizável (pb-5% = 5% da largura ref)
  get usableH() { return this.conH - p(80); },       // ~5.333
};

// ─── Estrutura DARK shell ─────────────────────────────────────────────────────
// article: gradient, p=5.4% (ref: width)

const D = {
  pad:  pct(5.4, W),       // 0.71982 (mesma ref que CSS padding %)
  get x() { return this.pad; },
  get y() { return this.pad; },   // CSS padding % usa largura
  get w() { return W - this.pad * 2; },   // 11.89036
  get h() { return H - this.pad * 2; },   // 6.06036
  get usableH() { return this.h - p(80); }, // pb-5% ref largura
};

// ─── Cores ────────────────────────────────────────────────────────────────────

const C = {
  pageBg:     "D4D4D4",
  sectionBg:  "ECECEC",
  cardBg:     "FFFFFF",
  cardShadow: "EEEEEE",
  // text-black/62 composto sobre #ECECEC
  textBody:   "595959",
  // text-black/58 composto sobre #ECECEC (card body)
  textCard:   "636363",
  // text-black/68 sobre #ECECEC
  textMid:    "4C4C4C",
  // text-black/38 (footer light)
  textFaint:  "9B9B9B",
  // Dark shell text
  darkBg1:    "0C1C16",
  darkBg2:    "000000",
  // text-white/72 sobre dark
  darkBody:   "B8B8B8",
  // text-white/42 (footer dark)
  darkFaint:  "6B6B6B",
  // text-white/80 (quote closing)
  darkQuote:  "CCCCCC",
  white:      "FFFFFF",
  black:      "000000",
};

// ─── Logos ────────────────────────────────────────────────────────────────────

const LOGO_DARK_PATH  = path.join(process.cwd(), "public/logos/primary/masi-primary-dark.png");
const LOGO_LIGHT_PATH = path.join(process.cwd(), "public/logos/primary/masi-primary-light.png");
const logoAspect = 256 / 77; // aspect ratio do arquivo de logo

function logoSize(h_px: number) {
  const h = ph(h_px);
  const w = +(h * logoAspect).toFixed(5);
  return { w, h };
}

// ─── Helpers de primitivos ────────────────────────────────────────────────────

/** Fundo da página (#D4D4D4) */
function addPageBg(slide: PptxGenJS.Slide, dark = false) {
  if (!dark) {
    // Cinza de fundo
    slide.addShape("rect" as PptxGenJS.SHAPE_NAME, {
      x: 0, y: 0, w: W, h: H,
      fill: { color: C.pageBg }, line: { color: C.pageBg, width: 0 },
    });
    // Section #ECECEC arredondada
    slide.addShape("roundRect" as PptxGenJS.SHAPE_NAME, {
      x: L.secX, y: L.secY, w: L.secW, h: L.secH,
      fill: { color: C.sectionBg },
      line: { color: C.white, width: 0.75 },
      rectRadius: L.secR,
    });
  } else {
    // Gradiente escuro: linear-gradient(135deg, darkAccent 0%, #0C1C16 68%, #000 100%)
    // pptxgenjs usa ângulo em graus a partir da esquerda (135° CSS = ~315° em pptx)
    slide.addShape("rect" as PptxGenJS.SHAPE_NAME, {
      x: 0, y: 0, w: W, h: H,
      fill: {
        type: "gradient",
        color: "0C1C16",
        gradColor: [
          { color: "0C1C16", position: 0 },
          { color: "000000", position: 100 },
        ],
        gradAngle: 315,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      line: { color: "000000", width: 0 },
    });
  }
}

/** Rodapé: footer | title — absolute bottom */
function addFooter(
  slide: PptxGenJS.Slide,
  presentation: CommercialPresentation,
  s: CommercialSlide,
  dark = false,
) {
  // bottom-[4.6%] left-[5.4%] right-[5.4%]
  const bPad   = pct(5.4, W);  // left/right
  const bBot   = ph(900 * 0.046); // bottom position from top
  const fY     = H - bBot - ph(20); // approx text height
  const fColor = dark ? C.darkFaint : C.textFaint;
  const fH     = ph(20);

  slide.addText(s.footer ?? "", {
    x: bPad, y: fY, w: (W - bPad * 2) / 2, h: fH,
    fontFace: "Arial", fontSize: pt(13), bold: true, color: fColor,
    align: "left", charSpacing: pt(13) * 0.08,
  });
  slide.addText(presentation.title.replace(/\n/g, " "), {
    x: W / 2, y: fY, w: (W - bPad * 2) / 2, h: fH,
    fontFace: "Arial", fontSize: pt(13), bold: true, color: fColor,
    align: "right", charSpacing: pt(13) * 0.08,
  });
}

/** Logo MASI */
function addLogo(
  slide: PptxGenJS.Slide,
  x: number, y: number,
  dark: boolean,
  size: "default" | "large" = "default",
) {
  const s = logoSize(size === "large" ? 29 : 23);
  const logoPath = dark ? LOGO_LIGHT_PATH : LOGO_DARK_PATH;
  if (fs.existsSync(logoPath)) {
    slide.addImage({ path: logoPath, x, y, w: s.w, h: s.h });
  } else {
    slide.addText("MASI", { x, y, w: s.w, h: s.h, fontFace: "Arial", fontSize: 11, bold: true, color: dark ? C.white : C.black });
  }
}

/** Eyebrow: text-[15px] font-bold uppercase tracking-[0.08em] */
function addEyebrow(
  slide: PptxGenJS.Slide,
  text: string,
  x: number, y: number, w: number,
  accent: string,
  dark = false,
) {
  slide.addText(text, {
    x, y, w, h: ph(24),
    fontFace: "Arial",
    fontSize: pt(15),
    bold: true,
    color: dark ? "B8B8B8" : accent.replace("#", ""),
    charSpacing: pt(15) * 0.08,
  });
}

/** Título: font-extrabold (bold em Arial) */
function addTitle(
  slide: PptxGenJS.Slide,
  text: string,
  x: number, y: number, w: number, h: number,
  sizePx: number,
  leadingFactor = 0.9,
  dark = false,
) {
  slide.addText(text.replace(/\n/g, " "), {
    x, y, w, h,
    fontFace: "Arial",
    fontSize: pt(sizePx),
    bold: true,
    color: dark ? C.white : C.black,
    valign: "top",
    lineSpacingMultiple: leadingFactor,
  });
}

/** Body: text-[22px] leading-[1.45] */
function addBody(
  slide: PptxGenJS.Slide,
  text: string,
  x: number, y: number, w: number, h: number,
  dark = false,
) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: "Arial",
    fontSize: pt(22),
    color: dark ? C.darkBody : C.textBody,
    valign: "top",
    lineSpacingMultiple: 1.45,
  });
}

/** Card branco (bg-white rounded-[10px] shadow) */
function addWhiteCard(
  slide: PptxGenJS.Slide,
  x: number, y: number, w: number, h: number,
) {
  slide.addShape("roundRect" as PptxGenJS.SHAPE_NAME, {
    x, y, w, h,
    fill: { color: C.cardBg },
    line: { color: C.cardShadow, width: 0.5 },
    shadow: { type: "outer", blur: 12, offset: 4, angle: 90, color: "00000018", opacity: 0.09 },
    rectRadius: L.secR,
  });
}

// ─── Templates por tipo de slide ─────────────────────────────────────────────

/**
 * COVER — SlideShell (light) + grid [1.05fr / 0.95fr]
 * Título xl (104px), body, bullets
 */
function renderCover(
  slide: PptxGenJS.Slide,
  presentation: CommercialPresentation,
  s: CommercialSlide,
) {
  addPageBg(slide, false);
  addFooter(slide, presentation, s, false);

  const cx = L.conX;
  const cy = L.conY;
  const cw = L.conW;

  // Layout: grid-cols-[1.05fr_0.95fr] gap-[7%]
  const gap     = p(7 * 16);  // 7% of 1600 = 112px
  const leftW   = (1.05 / 2) * (cw - gap);   // 5.718"
  const rightW  = (0.95 / 2) * (cw - gap);   // 5.178"
  const rightX  = cx + leftW + gap;

  // Logo topo esquerdo
  addLogo(slide, cx, cy, false, "default");
  const logoH = ph(23);

  // Eyebrow topo direito
  if (s.eyebrow) {
    addEyebrow(slide, s.eyebrow, rightX, cy, rightW, presentation.accent);
  }

  // Coluna esquerda: justify-end (empurrar para baixo)
  // gap-[4%] entre título, body e bullets
  const innerGap  = p(4 * 16);  // 4% = 64px
  const bulletH   = ph(34);     // approximate bullet row height
  const bodyLines = Math.ceil((s.body?.length ?? 0) / 48) + 1;
  const bodyH     = ph(22 * 1.45 * bodyLines + 10);
  const titleH    = ph(104 * 0.9 * 2); // ~2 lines at xl
  const contentH  = titleH + innerGap + bodyH + innerGap + bulletH;
  const leftStartY = cy + L.usableH - contentH;

  // Título xl: text-[104px] font-extrabold leading-[0.9]
  addTitle(slide, s.title, cx, leftStartY, leftW, titleH, 104, 0.9);

  // Body
  if (s.body) {
    addBody(slide, s.body, cx, leftStartY + titleH + innerGap, leftW, bodyH);
  }

  // Bullets: rounded-full bg-black px-[18px] py-[8px] text-[12px] font-bold uppercase
  if (s.bullets?.length) {
    const bY  = leftStartY + titleH + innerGap + bodyH + innerGap;
    let   bX  = cx;
    const bGap = p(2 * 16); // gap-[2%]
    s.bullets.forEach((b) => {
      const bW = p(18 * 2 + b.length * 7.5);
      slide.addShape("roundRect" as PptxGenJS.SHAPE_NAME, {
        x: bX, y: bY, w: bW, h: bulletH,
        fill: { color: C.black }, line: { color: C.black, width: 0 },
        rectRadius: bulletH / 2,
      });
      slide.addText(b.toUpperCase(), {
        x: bX, y: bY, w: bW, h: bulletH,
        fontFace: "Arial", fontSize: pt(12), bold: true, color: C.white,
        align: "center", valign: "middle", charSpacing: pt(12) * 0.08,
      });
      bX += bW + bGap;
    });
  }

  // Coluna direita: placeholder visual (abstract orbital)
  const visY = cy + logoH + ph(20);
  const visH = L.usableH - logoH - ph(20);
  slide.addShape("roundRect" as PptxGenJS.SHAPE_NAME, {
    x: rightX, y: visY, w: rightW, h: visH,
    fill: { color: "F8F8F8" },
    line: { color: "E0E0E0", width: 1 },
    rectRadius: L.secR,
  });
  // Círculos orbitais decorativos (AbstractVisual orbital)
  const cx2 = rightX + rightW / 2;
  const cy2 = visY + visH / 2;
  const r1  = Math.min(rightW, visH) * 0.31;
  const r2  = r1 * 0.62;
  [[r1, 0.12], [r2, 0.12]].forEach(([r, op]) => {
    slide.addShape("ellipse" as PptxGenJS.SHAPE_NAME, {
      x: cx2 - r, y: cy2 - r * (visH / rightW), w: r * 2, h: r * 2 * (visH / rightW),
      fill: { type: "none" },
      line: { color: "000000", width: 0.5, transparency: Math.round((1 - op) * 100) },
    });
  });
  // Ponto accent
  const dotR = r1 * 0.18;
  slide.addShape("ellipse" as PptxGenJS.SHAPE_NAME, {
    x: cx2 + r1 * 0.3, y: cy2 - r1 * 0.8, w: dotR * 2, h: dotR * 2,
    fill: { color: presentation.accent.replace("#", "") },
    line: { color: presentation.accent.replace("#", ""), width: 0 },
  });
}

/**
 * STATEMENT / PRINCIPLE — Dark shell, centrado verticalmente
 * quote 68px + accent bar + body
 */
function renderStatement(
  slide: PptxGenJS.Slide,
  presentation: CommercialPresentation,
  s: CommercialSlide,
) {
  addPageBg(slide, true);
  addFooter(slide, presentation, s, true);

  const cx = D.x;
  const cw = D.w;

  // Centralizar verticalmente: flex-col justify-center gap-[4%]
  const gap      = p(4 * 16);
  const quoteSize = s.type === "principle" ? 59 : 68;
  const quoteH   = ph(quoteSize * 0.9 * 3); // ~3 linhas
  const barH     = ph(6);
  const bodyH    = ph(22 * 1.45 * 3);
  const totalH   = quoteH + gap + barH + gap + bodyH;
  const startY   = D.y + (D.h - totalH) / 2;

  // Eyebrow
  if (s.eyebrow) {
    addEyebrow(slide, s.eyebrow, cx, startY - ph(30), cw, presentation.accent, true);
  }

  // Quote / title: text-[68px] font-extrabold leading-[0.9]
  const quoteText = s.quote ?? s.title;
  addTitle(slide, quoteText, cx, startY, cw, quoteH, quoteSize, 0.9, true);

  // Accent bar: h-[6px] w-[18%]
  const barW = pct(18, cw);
  slide.addShape("roundRect" as PptxGenJS.SHAPE_NAME, {
    x: cx, y: startY + quoteH + gap, w: barW, h: barH,
    fill: { color: presentation.accent.replace("#", "") },
    line: { color: presentation.accent.replace("#", ""), width: 0 },
    rectRadius: barH / 2,
  });

  // Body
  if (s.body) {
    addBody(slide, s.body, cx, startY + quoteH + gap + barH + gap, cw, bodyH, true);
  }
}

/**
 * TURNING-POINT — Dark shell
 * Eyebrow, título md (53px), body, quote accent
 */
function renderTurningPoint(
  slide: PptxGenJS.Slide,
  presentation: CommercialPresentation,
  s: CommercialSlide,
) {
  addPageBg(slide, true);
  addFooter(slide, presentation, s, true);

  const cx = D.x;
  const cy = D.y;
  const cw = D.w;

  if (s.eyebrow) {
    addEyebrow(slide, s.eyebrow, cx, cy, cw, presentation.accent, true);
  }

  const eyeH   = s.eyebrow ? ph(30) : 0;
  const gap    = p(4 * 16);
  const titleY = cy + eyeH + gap;
  const titleH = ph(53 * 0.96 * 2);

  addTitle(slide, s.title, cx, titleY, cw, titleH, 53, 0.96, true);

  if (s.body) {
    const bodyY = titleY + titleH + gap;
    addBody(slide, s.body, cx, bodyY, cw * 0.75, ph(22 * 1.45 * 3), true);
  }

  if (s.quote) {
    const quoteY = titleY + titleH + gap * 2 + ph(22 * 1.45 * 3) + gap;
    slide.addText(`"${s.quote}"`, {
      x: cx, y: quoteY, w: cw, h: ph(40),
      fontFace: "Arial",
      fontSize: pt(28),
      bold: true,
      color: presentation.accent.replace("#", ""),
    });
  }
}

/**
 * SLIDE CARDS (leaders, benefits, recommendations, action-plan)
 * Light shell, grid-cols-[0.76fr_1.24fr], cards 2×2
 */
function renderCards(
  slide: PptxGenJS.Slide,
  presentation: CommercialPresentation,
  s: CommercialSlide,
) {
  addPageBg(slide, false);
  addFooter(slide, presentation, s, false);

  const cx  = L.conX;
  const cy  = L.conY;
  const cw  = L.conW;
  const gap = p(6 * 16); // gap-[6%]

  // Header grid: [0.76fr 1.24fr]
  const leftW  = (0.76 / 2) * (cw - gap);
  const rightW = (1.24 / 2) * (cw - gap);
  const rightX = cx + leftW + gap;

  // Eyebrow
  if (s.eyebrow) {
    addEyebrow(slide, s.eyebrow, cx, cy, leftW, presentation.accent);
  }
  const eyeH = s.eyebrow ? ph(30) : 0;
  const innerGap = p(6 * 16);

  // Title md: text-[53px] leading-[0.96]
  const titleY = cy + eyeH + innerGap;
  const titleH = ph(53 * 0.96 * 2);
  addTitle(slide, s.title, cx, titleY, leftW, titleH, 53, 0.96);

  // Body
  if (s.body) {
    addBody(slide, s.body, rightX, cy + ph(10), rightW, ph(22 * 1.45 * 4));
  }

  // Cards: grid-cols-2 gap-[3%]
  const cards   = s.cards ?? [];
  const n       = Math.min(cards.length, 4);
  const cardGap = p(3 * 16);
  const cardW   = (rightW - cardGap) / 2;
  const cardH   = ph(22 * 1.45 * 4 + 60); // approximate card height
  const cardsY  = cy + eyeH + innerGap + titleH + innerGap;
  const totalCardH = L.secY + L.secH - cardsY - L.pagePad - ph(30); // remaining height

  const rows = Math.ceil(n / 2);
  const cardRowH = (totalCardH - cardGap * (rows - 1)) / rows;

  cards.slice(0, n).forEach((card, i) => {
    const col  = i % 2;
    const row  = Math.floor(i / 2);
    const cardX = rightX + col * (cardW + cardGap);
    const cy2   = cardsY + row * (cardRowH + cardGap);

    addWhiteCard(slide, cardX, cy2, cardW, cardRowH);

    // Padding: p-[7%] = 7% of card width
    const cp = cardW * 0.07;

    // Number circle: h-[48px] w-[48px] rounded-full
    const circR = p(48);
    slide.addShape("ellipse" as PptxGenJS.SHAPE_NAME, {
      x: cardX + cp, y: cy2 + cp, w: circR, h: ph(48),
      fill: { color: i === 0 ? presentation.accent.replace("#", "") : C.sectionBg },
      line: { color: i === 0 ? presentation.accent.replace("#", "") : C.sectionBg, width: 0 },
    });
    slide.addText(String(i + 1).padStart(2, "0"), {
      x: cardX + cp, y: cy2 + cp, w: circR, h: ph(48),
      fontFace: "Arial", fontSize: pt(15), bold: true,
      color: C.black, align: "center", valign: "middle",
    });

    // Card title: text-[23px] font-bold
    slide.addText(card.title, {
      x: cardX + cp, y: cy2 + cp + ph(48) + ph(14), w: cardW - cp * 2, h: ph(23 * 1.08 * 2),
      fontFace: "Arial", fontSize: pt(23), bold: true, color: C.black, valign: "top",
    });

    // Card desc: text-[15px] text-black/58
    slide.addText(card.description, {
      x: cardX + cp, y: cy2 + cp + ph(48) + ph(14) + ph(23 * 1.08 * 2) + ph(8),
      w: cardW - cp * 2, h: cardRowH - cp * 2 - ph(48) - ph(14) - ph(23 * 1.08 * 2) - ph(8),
      fontFace: "Arial", fontSize: pt(15), color: C.textCard, valign: "top",
      lineSpacingMultiple: 1.35,
    });
  });
}

/**
 * FRAMEWORK / DECISION — Light shell, header [0.82fr 1fr], grade 2×2 de cards
 */
function renderFramework(
  slide: PptxGenJS.Slide,
  presentation: CommercialPresentation,
  s: CommercialSlide,
) {
  addPageBg(slide, false);
  addFooter(slide, presentation, s, false);

  const cx  = L.conX;
  const cy  = L.conY;
  const cw  = L.conW;

  // Header grid: [0.82fr 1fr] gap-[6%]
  const hGap  = p(6 * 16);
  const leftW = (0.82 / 1.82) * (cw - hGap);
  const rightW = (1 / 1.82) * (cw - hGap);
  const rightX = cx + leftW + hGap;

  // Eyebrow
  if (s.eyebrow) {
    addEyebrow(slide, s.eyebrow, cx, cy, leftW, presentation.accent);
  }

  // Title md: text-[53px] mt-[22px]
  const titleY = cy + ph(30) + ph(22);
  const titleH = ph(53 * 0.92 * 2);
  addTitle(slide, s.title, cx, titleY, leftW, titleH, 53, 0.92);

  // Body (coluna direita)
  if (s.body) {
    addBody(slide, s.body, rightX, cy + ph(10), rightW, ph(22 * 1.45 * 4));
  }

  // Cards: grid-cols-2 grid-rows-2 gap-[2.6%]
  const cards  = s.cards ?? [];
  const cGap   = p(2.6 * 16);
  const cardW  = (cw - cGap) / 2;
  const cardsStartY = titleY + titleH + p(4 * 16);
  const remainH = L.secY + L.secH - cardsStartY - L.pagePad - ph(30);
  const cardH   = (remainH - cGap) / 2;

  cards.slice(0, 4).forEach((card, i) => {
    const col  = i % 2;
    const row  = Math.floor(i / 2);
    const cardX = cx + col * (cardW + cGap);
    const cardY = cardsStartY + row * (cardH + cGap);

    addWhiteCard(slide, cardX, cardY, cardW, cardH);

    // p-[5.2%] = 5.2% of card width
    const cp = cardW * 0.052;

    // Número accent: font-mono text-[15px] font-bold
    slide.addText(`0${i + 1}`, {
      x: cardX + cp, y: cardY + cp, w: cardW - cp * 2, h: ph(22),
      fontFace: "Courier New", fontSize: pt(15), bold: true,
      color: presentation.accent.replace("#", ""),
    });

    // Título: text-[28px] font-extrabold leading-[1]
    slide.addText(card.title, {
      x: cardX + cp, y: cardY + cp + ph(28 + 8), w: cardW - cp * 2, h: ph(28 * 1 * 2),
      fontFace: "Arial", fontSize: pt(28), bold: true, color: C.black,
      lineSpacingMultiple: 1.0, valign: "top",
    });

    // Descrição: text-[15px] leading-[1.28] text-black/58
    slide.addText(card.description, {
      x: cardX + cp, y: cardY + cp + ph(28 + 8) + ph(28 * 1 * 2) + ph(16),
      w: cardW - cp * 2,
      h: cardH - cp * 2 - ph(28 + 8) - ph(28 * 2) - ph(16),
      fontFace: "Arial", fontSize: pt(15), color: C.textCard,
      lineSpacingMultiple: 1.28, valign: "top",
    });
  });
}

/**
 * STATS — Light shell, grid [0.82fr 1.18fr], stats como cards horizontais
 */
function renderStats(
  slide: PptxGenJS.Slide,
  presentation: CommercialPresentation,
  s: CommercialSlide,
) {
  const dark = s.type === "risks";
  addPageBg(slide, dark);
  addFooter(slide, presentation, s, dark);

  const cx  = dark ? D.x : L.conX;
  const cy  = dark ? D.y : L.conY;
  const cw  = dark ? D.w : L.conW;

  // Header grid: [0.82fr 1.18fr] gap-[6%]
  const hGap   = p(6 * 16);
  const leftW  = (0.82 / 2) * (cw - hGap);
  const rightW = (1.18 / 2) * (cw - hGap);
  const rightX = cx + leftW + hGap;

  // Eyebrow
  if (s.eyebrow) {
    addEyebrow(slide, s.eyebrow, cx, cy, leftW, presentation.accent, dark);
  }
  const eyeH   = ph(30);
  const innerGap = p(7 * 16);

  // Title md
  const titleY = cy + eyeH + innerGap;
  const titleH = ph(53 * 0.96 * 2);
  addTitle(slide, s.title, cx, titleY, leftW, titleH, 53, 0.96, dark);

  // Body
  if (s.body) {
    addBody(slide, s.body, cx, titleY + titleH + innerGap, leftW, ph(22 * 1.45 * 4), dark);
  }

  // Stat cards: flex-col gap-[3%]
  const stats   = s.stats ?? [];
  const sGap    = p(3 * 16);
  const statsH  = L.secY + L.secH - cy - L.pagePad - ph(30) - (dark ? 0 : 0);
  const cardH   = (statsH - sGap * (stats.length - 1)) / Math.max(stats.length, 1);

  stats.forEach((stat, i) => {
    const sY = cy + i * (cardH + sGap);

    if (!dark) {
      addWhiteCard(slide, rightX, sY, rightW, cardH);
    } else {
      slide.addShape("roundRect" as PptxGenJS.SHAPE_NAME, {
        x: rightX, y: sY, w: rightW, h: cardH,
        fill: { color: "FFFFFF", transparency: 88 },
        line: { color: "FFFFFF", width: 0.5, transparency: 70 },
        rectRadius: L.secR,
      });
    }

    // px-[7%] py-[6%]
    const px = rightW * 0.07;
    const py = rightW * 0.06;

    // Value: font-mono text-[56px] font-bold in accent
    const valW = rightW * 0.38;
    slide.addText(stat.value, {
      x: rightX + px, y: sY + py, w: valW, h: cardH - py * 2,
      fontFace: "Courier New", fontSize: pt(56), bold: true,
      color: presentation.accent.replace("#", ""),
      align: "left", valign: "middle",
    });

    // Label: text-[17px] font-semibold leading-[1.3]
    slide.addText(stat.label, {
      x: rightX + px + valW + px, y: sY + py, w: rightW - px * 3 - valW, h: cardH - py * 2,
      fontFace: "Arial", fontSize: pt(17), bold: true,
      color: dark ? C.darkBody : C.textMid,
      lineSpacingMultiple: 1.3, valign: "middle",
    });
  });

  // Progress bar: h-[10px] w-full bg-black/10 → w-[68%] accent
  const barY = L.secY + L.secH - L.pagePad - ph(30) - ph(15);
  slide.addShape("roundRect" as PptxGenJS.SHAPE_NAME, {
    x: cx, y: barY, w: cw, h: ph(10),
    fill: { color: C.black, transparency: 90 },
    line: { color: C.black, transparency: 90, width: 0 },
    rectRadius: ph(5),
  });
  slide.addShape("roundRect" as PptxGenJS.SHAPE_NAME, {
    x: cx, y: barY, w: cw * 0.68, h: ph(10),
    fill: { color: presentation.accent.replace("#", "") },
    line: { color: presentation.accent.replace("#", ""), width: 0 },
    rectRadius: ph(5),
  });
}

/**
 * SPLIT (context, concept, behavior, opportunity, example)
 * Light shell, grid-cols-[0.92fr_1.08fr], lado direito tem visual/chart/bullets
 */
function renderSplit(
  slide: PptxGenJS.Slide,
  presentation: CommercialPresentation,
  s: CommercialSlide,
) {
  addPageBg(slide, false);
  addFooter(slide, presentation, s, false);

  const cx   = L.conX;
  const cy   = L.conY;
  const cw   = L.conW;
  const ch   = L.usableH;
  const gap  = p(7 * 16); // gap-[7%]

  // grid-cols-[0.92fr_1.08fr]
  const leftW  = (0.92 / 2) * (cw - gap);
  const rightW = (1.08 / 2) * (cw - gap);
  const rightX = cx + leftW + gap;

  // Esquerda: flex-col justify-between (eyebrow topo, title+body baixo)
  if (s.eyebrow) {
    addEyebrow(slide, s.eyebrow, cx, cy, leftW, presentation.accent);
  }

  const titleBodyGap = p(39); // gap-[39px]
  const titleH = ph(53 * 0.96 * 2);
  const bodyH  = ph(22 * 1.45 * 4);
  const leftContentH = titleH + titleBodyGap + bodyH;
  const leftContentY = cy + ch - leftContentH;

  addTitle(slide, s.title, cx, leftContentY, leftW, titleH, 53, 0.96);
  if (s.body) {
    addBody(slide, s.body, cx, leftContentY + titleH + titleBodyGap, leftW, bodyH);
  }

  // Direita: grid-rows-[1fr_auto] gap-[5%]
  const rightGap  = p(5 * 16);
  const bulletsH  = ph(22 * 1.45 * 2 + 10); // bullets row approx
  const bulletRows = s.bullets?.length ? 1 : 0;
  const visualH   = ch - (bulletRows > 0 ? bulletsH + rightGap : 0);

  // Visual area (placeholder se não há imagem/chart)
  slide.addShape("roundRect" as PptxGenJS.SHAPE_NAME, {
    x: rightX, y: cy, w: rightW, h: visualH,
    fill: { color: "F8F8F8" },
    line: { color: "E0E0E0", width: 1 },
    rectRadius: L.secR,
  });

  // Bullets (grid-cols-3 gap-[3%])
  if (s.bullets?.length) {
    const bulletsY = cy + visualH + rightGap;
    const bGap     = p(3 * 16);
    const n        = Math.min(s.bullets.length, 3);
    const bCardW   = (rightW - bGap * (n - 1)) / n;
    const bCardH   = bulletsH;

    s.bullets.slice(0, n).forEach((bullet, i) => {
      const bCardX = rightX + i * (bCardW + bGap);
      addWhiteCard(slide, bCardX, bulletsY, bCardW, bCardH);
      const cp = bCardW * 0.08;

      // Número: font-mono text-[15px] font-bold accent
      slide.addText(`0${i + 1}`, {
        x: bCardX + cp, y: bulletsY + cp, w: bCardW - cp * 2, h: ph(22),
        fontFace: "Courier New", fontSize: pt(15), bold: true,
        color: presentation.accent.replace("#", ""),
      });

      // Texto: text-[16px] font-semibold leading-[1.2]
      slide.addText(bullet, {
        x: bCardX + cp, y: bulletsY + cp + ph(22) + ph(8),
        w: bCardW - cp * 2, h: bCardH - cp * 2 - ph(22) - ph(8),
        fontFace: "Arial", fontSize: pt(16), bold: true, color: C.black,
        lineSpacingMultiple: 1.2, valign: "top",
      });
    });
  }
}

/**
 * CLOSING — Dark shell
 * Topo: logo + eyebrow | Bottom: grid [1fr 0.55fr]
 */
function renderClosing(
  slide: PptxGenJS.Slide,
  presentation: CommercialPresentation,
  s: CommercialSlide,
) {
  addPageBg(slide, true);
  addFooter(slide, presentation, s, true);

  const cx = D.x;
  const cy = D.y;
  const cw = D.w;
  const ch = D.usableH;

  // Topo: logo + eyebrow justify-between
  addLogo(slide, cx, cy, true, "large");
  if (s.eyebrow) {
    addEyebrow(slide, s.eyebrow, cx, cy, cw, presentation.accent, true);
  }

  // Bottom: grid-cols-[1fr_0.55fr] gap-[8%]
  const bGap   = p(8 * 16);
  const leftW  = (1 / 1.55) * (cw - bGap);
  const rightW = (0.55 / 1.55) * (cw - bGap);
  const rightX = cx + leftW + bGap;
  const logoH  = ph(29);
  const botY   = cy + ch - ph(72 * 0.84 * 3) - ph(22 * 1.45 * 3) - p(40);
  const botH   = ch - (botY - cy);

  // Título lg: text-[72px] leading-[0.84]
  const titleH = ph(72 * 0.84 * 3);
  addTitle(slide, s.title, cx, botY, leftW, titleH, 72, 0.84, true);

  // Body
  if (s.body) {
    addBody(slide, s.body, cx, botY + titleH + p(40), leftW, ph(22 * 1.45 * 3), true);
  }

  // Direita: quote + barra accent
  if (s.quote) {
    const barH = ph(8);
    const quoteH = botH - barH - pct(8, botH);
    slide.addText(s.quote, {
      x: rightX, y: botY + (botH - quoteH - barH - pct(8, botH)) / 2,
      w: rightW, h: quoteH,
      fontFace: "Arial", fontSize: pt(28), bold: true,
      color: C.darkQuote, lineSpacingMultiple: 1.08, valign: "bottom",
    });
    // Barra accent no fundo
    slide.addShape("roundRect" as PptxGenJS.SHAPE_NAME, {
      x: rightX, y: botY + botH - barH, w: rightW, h: barH,
      fill: { color: presentation.accent.replace("#", "") },
      line: { color: presentation.accent.replace("#", ""), width: 0 },
      rectRadius: barH / 2,
    });
  }
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────

function renderSlide(
  pptx: PptxGenJS,
  presentation: CommercialPresentation,
  s: CommercialSlide,
) {
  const slide = pptx.addSlide();

  switch (s.type) {
    case "cover":
      renderCover(slide, presentation, s);
      break;
    case "statement":
    case "principle":
      renderStatement(slide, presentation, s);
      break;
    case "turning-point":
      renderTurningPoint(slide, presentation, s);
      break;
    case "framework":
    case "decision":
      renderFramework(slide, presentation, s);
      break;
    case "leaders":
    case "benefits":
    case "recommendations":
    case "action-plan":
      renderCards(slide, presentation, s);
      break;
    case "stats":
    case "risks":
      renderStats(slide, presentation, s);
      break;
    case "context":
    case "concept":
    case "behavior":
    case "opportunity":
    case "example":
      renderSplit(slide, presentation, s);
      break;
    case "closing":
      renderClosing(slide, presentation, s);
      break;
    default:
      renderCards(slide, presentation, s);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Uso: npx tsx scripts/export-pptx.ts <slug>");
    process.exit(1);
  }

  const presentation = userPresentations.find((p) => p.slug === slug);
  if (!presentation) {
    console.error(`Não encontrada: "${slug}"`);
    console.error("Disponíveis:", userPresentations.map((p) => p.slug).join(", "));
    process.exit(1);
  }

  console.log(`\nGerando: ${presentation.title.replace(/\n/g, " ")} (${presentation.slides.length} slides)\n`);

  const pptx    = new PptxGenJS();
  pptx.layout  = "LAYOUT_WIDE";
  pptx.title   = presentation.title.replace(/\n/g, " ");
  pptx.author  = "MASI Negócios";
  pptx.subject = presentation.subtitle;

  presentation.slides.forEach((s, i) => {
    process.stdout.write(`  [${String(i + 1).padStart(2, "0")}] ${s.type.padEnd(18)} ${s.title.replace(/\n/g, " ").slice(0, 40)}\n`);
    renderSlide(pptx, presentation, s);
  });

  const outDir  = path.join(process.cwd(), "exports");
  const outFile = path.join(outDir, `${slug}.pptx`);
  fs.mkdirSync(outDir, { recursive: true });

  await pptx.writeFile({ fileName: outFile });
  console.log(`\n✅  exports/${slug}.pptx\n`);
}

main().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
