/**
 * The reveal's frame, as the main talk draws it (docs/bchc-brand.md): the
 * department's logo top left, the footer bottom left and the click's number
 * bottom right, all in the stage's 64 px edge. The title slide, on navy,
 * carries only the logo, in its white version.
 */
import Image from "next/image";
import type { FrameProps } from "@/components/deck/engine";
import { withBase } from "@/lib/base-path";
import "./frame.css";

/** The logo's file (1920 by 646) and its height on the stage; its width keeps the file's proportions. */
export const LOGO = { src: withBase("/brand/aph-logo.v1.png"), h: 40, w: Math.round((40 * 1920) / 646) } as const;

/** The logo's white version, for the navy title slide. */
export const LOGO_WHITE = withBase("/brand/aph-logo-white.v1.png");

/** The footer's words: the department, then where the talk is given. */
export const FOOTER = { department: "Austin Public Health", group: "AIxPH 2026, Baltimore" } as const;

export function Frame({ number, ground }: FrameProps) {
  const logo = (src: string) => (
    <Image className="reveal-frame__logo" src={src} alt="Austin Public Health" width={LOGO.w} height={LOGO.h} loading="eager" decoding="sync" unoptimized />
  );
  if (ground) return logo(LOGO_WHITE);
  return (
    <>
      {logo(LOGO.src)}
      <p className="reveal-frame__footer">
        <b>{FOOTER.department}</b> · {FOOTER.group}
      </p>
      <p className="reveal-frame__number">{number}</p>
    </>
  );
}
