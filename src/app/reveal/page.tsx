import type { Metadata } from "next";
import { RevealDeck } from "./talk";

export const metadata: Metadata = {
  title: "The Public Health AI and Tech Exchange: AIxPH 2026",
  robots: { index: false, follow: false },
};

export default function RevealPage() {
  return <RevealDeck />;
}
