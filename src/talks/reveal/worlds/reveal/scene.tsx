/**
 * The reveal's stage: six slides on one plane the size of the stage. Every
 * slide's title and story lines, the catalog's home page and one project's
 * page with its rings, the row from form to live page, the three steps of
 * how it was built with its record on GitHub, the three thank-you cards,
 * and the catalog's address with its QR code. Nothing here moves on its
 * own; the steps move it.
 */
"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Agent, ArtefactFrame, Block, Connector, HumanMark, InkRing, Line, PassTick, Person, Plane, SetText, STAGE, Stations, Story, Tab, type Box } from "@/components/deck/kit";
import { picturesOf, storyId } from "../steps";
import { storyOf } from "../../script/find";
import { BUILT, ENTRY, HOME, HOW, OPENING, POST, ROW, ROW_SCALE, STILLS, THANK, bandOf, titleOf } from "./layout";
import "./reveal.css";

/** A part that travels and scales about its top left corner (`--x`, `--y`, `--s`), placed at `at`. */
const Carried = ({ id, at, children }: { id: string; at: Box; children: ReactNode }) => {
  const style: CSSProperties = { position: "absolute", left: at.x, top: at.y, width: at.w, height: at.h, transformOrigin: "0 0" };
  return (
    <div className="dk-move" data-build={id} style={style}>
      {children}
    </div>
  );
};

/** Ink on a still: an SVG the size of its frame, in the frame's own pixels. */
const Ink = ({ at, children }: { at: Box; children: ReactNode }) => (
  <svg className="dk-marks" width={at.w} height={at.h} viewBox={`0 0 ${at.w} ${at.h}`} aria-hidden="true">
    {children}
  </svg>
);

/** Slide 1's title, its line and its credit, every later slide's title, and every later slide's story lines. */
function Titles() {
  const { title, line, credit } = OPENING;
  const later = picturesOf("reveal").slice(1);
  return (
    <>
      <SetText id={title.key} x={title.x} y={title.y} size="title" rule={false} lines={title.lines} />
      <SetText id={line.key} x={line.x} y={line.y} size="medium" lines={line.lines} />
      <Block id={credit.key} at={credit.at} className="dk-block--line dk-block--soft">
        {credit.text}
      </Block>
      {later.map((picture) => {
        const heading = titleOf(picture.id);
        return <SetText key={heading.key} id={heading.key} x={heading.x} y={heading.y} size="title" lines={heading.lines} />;
      })}
      {later
        .filter((picture) => storyOf(picture.id).length)
        .map((picture) => (
          <Story key={picture.id} id={storyId(picture.id)} band={bandOf(picture.id)} lines={storyOf(picture.id)} />
        ))}
    </>
  );
}

/** Slides 1 and 2: the catalog's home page, and one project's page that lifts out of it, with a ring and a tab on each of three places. */
function Catalog() {
  const local = { ...ENTRY.at, x: 0, y: 0 };
  return (
    <>
      <Carried id={HOME.key} at={HOME.at}>
        <ArtefactFrame id={HOME.still} at={{ ...HOME.at, x: 0, y: 0 }} stills={STILLS.home} edge="catalog" />
      </Carried>
      <Carried id={ENTRY.key} at={ENTRY.at}>
        <ArtefactFrame id={ENTRY.still} at={local} stills={STILLS.entry} edge="catalog">
          <Ink at={local}>
            {ENTRY.fields.map((field) => (
              <InkRing key={field.ring.key} id={field.ring.key} at={field.ring.at} rx={12} />
            ))}
          </Ink>
          {ENTRY.fields.map((field) => (
            <Tab key={field.tab.key} id={field.tab.key} at={field.tab.at}>
              {field.text}
            </Tab>
          ))}
        </ArtefactFrame>
      </Carried>
    </>
  );
}

/** The passed tick on the Checks heading's line, and the person over Approval with their mark, set inside the row so they go and scale with it. */
function RowMarks() {
  return (
    <svg className="dk-marks" width={STAGE.w} height={STAGE.h} viewBox={`0 0 ${STAGE.w} ${STAGE.h}`} aria-hidden="true">
      <PassTick id={HOW.tick.key} at={HOW.tick.at} r={HOW.tick.r} />
      <Person id={HOW.person.key} at={HOW.person.at} />
      <HumanMark id={HOW.mark.key} at={HOW.mark.at} />
    </svg>
  );
}

/** Slide 3's row, scaled about its first well's top left corner so it spans the band. */
const rowScale: CSSProperties = { transform: `scale(${ROW_SCALE})`, transformOrigin: `${ROW.box.x}px ${ROW.box.y}px` };

/** Slide 4's marks: each step's outline and figures, the links between the steps, and the record on GitHub with a change at each point, each approved. */
function BuiltMarks() {
  return (
    <>
      {BUILT.steps.map((step) => (
        <rect key={step.key} className={`reveal-step reveal-step--${step.tone} dk-draw`} data-build={step.key} x={step.at.x} y={step.at.y} width={step.at.w} height={step.at.h} rx={12} pathLength={1} />
      ))}
      {BUILT.links.map((link) => (
        <Connector key={link.key} id={link.key} from={link.from} to={link.to} tone="paper" />
      ))}
      {BUILT.people.map((person) => (
        <Person key={person.key} id={person.key} at={person.at} />
      ))}
      {BUILT.agents.map((agent) => (
        <Agent key={agent.key} id={agent.key} at={agent.at} role={agent.role} hue="process" />
      ))}
      <HumanMark id={BUILT.mark.key} at={BUILT.mark.at} />
      <Line id={BUILT.record.key} from={BUILT.record.from} to={BUILT.record.to} tone="paper" />
      {BUILT.commits.map((commit) => (
        <circle key={commit.key} className="reveal-commit" data-build={commit.key} cx={commit.at.x} cy={commit.at.y} r={12} />
      ))}
      {BUILT.commits.map(({ approval, at }) => (
        <g key={approval} className="reveal-history" transform={`translate(${at.x} ${at.y}) scale(0.5) translate(${-at.x} ${-at.y})`}>
          <HumanMark id={approval} at={at} />
        </g>
      ))}
    </>
  );
}

export function Scene() {
  return (
    <Plane
      marks={
        <BuiltMarks />
      }
    >
      <Titles />
      <Catalog />

      <div className="reveal-row" style={rowScale}>
        <Stations layout={ROW} catalog={ROW.stations.length - 1} landed linkTone="paper">
          <RowMarks />
        </Stations>
      </div>

      <Block id={BUILT.logo.key} at={BUILT.logo.at}>
        <Image src={BUILT.logo.src} alt="Austin Public Health" width={BUILT.logo.at.w} height={BUILT.logo.at.h} loading="eager" decoding="sync" unoptimized />
      </Block>
      {BUILT.steps.map(({ label, text }) => (
        <Block key={label.key} id={label.key} at={label.at} className="dk-block--middle">
          {text}
        </Block>
      ))}
      <Block id={BUILT.record.label.key} at={BUILT.record.label.at} className="dk-block--line reveal-strong">
        {BUILT.record.label.text}
      </Block>

      {THANK.map((card) => (
        <Block key={card.key} id={card.key} at={card.at} className="reveal-card">
          <span className="reveal-card__name">{card.name}</span>
          <span className="reveal-card__line">{card.line}</span>
          {card.who && <span className="reveal-card__who">{card.who}</span>}
        </Block>
      ))}

      <Block id={POST.address.key} at={POST.address.at} className="reveal-address">
        {POST.address.lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </Block>
      <Block id={POST.qr.key} at={POST.qr.at} className="reveal-qr">
        <Image src={POST.qr.src} alt="A QR code that opens the catalog" width={POST.qr.at.w} height={POST.qr.at.h} loading="eager" decoding="sync" unoptimized />
      </Block>
    </Plane>
  );
}
