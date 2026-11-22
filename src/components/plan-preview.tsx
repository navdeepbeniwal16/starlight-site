"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

// Web port of the app's onboarding "welcome" animation (apps/mobile PlanPreview);
// keep the two in sync. Its colour literals are the app's, kept verbatim rather than
// swapped for site tokens, so both surfaces read as one animation.

// Shared decelerate curve used across the app's motion.
const EASE = "cubic-bezier(0.2, 0, 0, 1)";
// The app's warm "picked" accent — brighter than the site's gold, matched to the source.
const ACCENT = "#e08a2b";
const SHADOW_SOFT =
  "0 1px 2px rgba(42,38,33,0.05), 0 8px 20px -12px rgba(42,38,33,0.22)";

type Point = { x: number; y: number };

type IconName =
  | "today"
  | "tray"
  | "scale"
  | "wand"
  | "puzzle"
  | "checkmark-done"
  | "lock"
  | "arrow-forward";

type TimelineRow = {
  id: string;
  kind: "anchor" | "container";
  gutter: string;
  name: string;
  time: string;
};

const TIMELINE: TimelineRow[] = [
  { id: "walk", kind: "anchor", gutter: "7 am", name: "Morning walk", time: "7:00 – 7:45" },
  { id: "morning", kind: "container", gutter: "9 am", name: "Morning Focus", time: "9 – 12" },
  { id: "lunch", kind: "anchor", gutter: "12 pm", name: "Lunch", time: "12:00 – 1:00" },
  { id: "afternoon", kind: "container", gutter: "2 pm", name: "Afternoon Focus", time: "2 – 4" },
  { id: "family", kind: "anchor", gutter: "6 pm", name: "Family time", time: "6:30 – 8:30" },
];

type TaskDef = { id: string; title: string; dur: string; block: string };
const TASKS: TaskDef[] = [
  { id: "q3", title: "Q3 pitch deck", dur: "1h 30m", block: "morning" },
  { id: "acme", title: "Acme proposal", dur: "30m", block: "morning" },
  { id: "team", title: "Team update", dur: "30m", block: "afternoon" },
];

// Loose to-dos Starlight sets aside — filed away for later once it picks.
const LATER = [
  { id: "fonts", title: "Browse fonts" },
  { id: "notion", title: "Tidy Notion" },
];

// Each pill's rest spot in the backlog pile, in px from the stage's top-left.
const CLUSTER: Record<string, Point> = {
  acme: { x: 44, y: 0 },
  fonts: { x: 158, y: 30 },
  q3: { x: 78, y: 40 },
  notion: { x: 150, y: 74 },
  team: { x: 54, y: 82 },
};

// template → backlog (all alike) → thinking → selecting (pick vs. file away)
// → scheduling (picks fly in) → resolved.
type Phase = "template" | "backlog" | "thinking" | "selecting" | "scheduling" | "resolved";
const COPY: Record<Phase, { icon: IconName; caption: string }> = {
  template: { icon: "today", caption: "Your routine, as a template" },
  backlog: { icon: "tray", caption: "Tasks looking for space" },
  thinking: { icon: "scale", caption: "Weighing what fits" },
  selecting: { icon: "wand", caption: "Picking what matters" },
  scheduling: { icon: "puzzle", caption: "Fitting them around your routine" },
  resolved: { icon: "checkmark-done", caption: "Your day, planned" },
};

const PHASE_ORDER: Phase[] = ["template", "backlog", "thinking", "selecting", "scheduling", "resolved"];

// SPEED scales both the phase cues here and the CSS transit durations below (all via
// pace()), so dwell and motion slow together and stay in proportion.
const SPEED = 1.5;
const pace = (base: number) => Math.round(base * SPEED);

const TEMPLATE_MS = pace(1300);
const BACKLOG_MS = pace(1200);
const THINKING_MS = pace(750);
const SELECTING_MS = pace(1500);
const PLACE_STAGGER = pace(900);
const PLACE_SETTLE = pace(760);
// Intentional pause between the pick and the first flight; without it the two blur
// into one motion.
const PLACE_LEAD_IN = pace(600);
const RESOLVED_MS = pace(3000);
const THINKING_AT = TEMPLATE_MS + BACKLOG_MS;
const SELECTING_AT = THINKING_AT + THINKING_MS;
const SCHED_START = SELECTING_AT + SELECTING_MS;
const RESOLVED_AT = SCHED_START + PLACE_LEAD_IN + (TASKS.length - 1) * PLACE_STAGGER + PLACE_SETTLE;
const LOOP_MS = RESOLVED_AT + RESOLVED_MS;

function Icon({ name, size, color = "currentColor" }: { name: IconName; size: number; color?: string }) {
  const stroke = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "today":
      return (
        <svg {...stroke}>
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M3 9h18M8 2.5v3M16 2.5v3" />
        </svg>
      );
    case "tray":
      return (
        <svg {...stroke}>
          <path d="M4 13l2-8h12l2 8v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
          <path d="M4 13h4l1.5 2.5h5L17 13h3" />
        </svg>
      );
    case "scale":
      return (
        <svg {...stroke}>
          <path d="M12 4v16M7 20h10M5 7l14-2M5 7l-2.5 6a3 3 0 0 0 5 0zM19 5l-2.5 6a3 3 0 0 0 5 0z" />
        </svg>
      );
    case "wand":
      return (
        <svg {...stroke}>
          <path d="M4 20L15 9M18 4v4M20 6h-4M19 11.5v2M20.5 12.5h-3M14 6l1.5 1.5" />
        </svg>
      );
    case "puzzle":
      return (
        <svg {...stroke}>
          <path d="M9 4a2 2 0 1 1 4 0h3a1 1 0 0 1 1 1v3a2 2 0 1 1 0 4v3a1 1 0 0 1-1 1h-3a2 2 0 1 0-4 0H6a1 1 0 0 1-1-1v-3a2 2 0 1 1 0-4V5a1 1 0 0 1 1-1z" />
        </svg>
      );
    case "checkmark-done":
      return (
        <svg {...stroke}>
          <path d="M2 13l4 4 8-9M11 16l1 1 9-10" />
        </svg>
      );
    case "arrow-forward":
      return (
        <svg {...stroke}>
          <path d="M5 12h13M13 6l6 6-6 6" />
        </svg>
      );
    case "lock":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="5" y="11" width="14" height="10" rx="2" fill={color} />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </svg>
      );
  }
}

/**
 * One backlog to-do. `marked` adds its badge — picked (arrow) or, for a `later` one,
 * filed-away (tray); a picked pill flies to its block when `landed`, a deferred one
 * dims in place.
 */
function FlyingPill({
  title,
  dur,
  later,
  marked,
  thinking,
  cluster,
  home,
  visible,
  landed,
  index,
  reducedMotion,
}: {
  title: string;
  dur?: string;
  later?: boolean;
  marked: boolean;
  thinking: boolean;
  cluster: Point;
  home: Point | null;
  visible: boolean;
  landed: boolean;
  index: number;
  reducedMotion: boolean;
}) {
  if (reducedMotion) return null;

  const deferred = !!later && marked;
  const delay = pace(index * 120);

  const style: CSSProperties = { ...styles.flyingPill, pointerEvents: "none" };
  if (landed && home) {
    // Picked pills fly to their row and fade out so the settled row shows through.
    style.translate = `${home.x}px ${home.y}px`;
    style.scale = "1";
    style.opacity = 0;
    style.transition = `translate ${pace(560)}ms ${EASE}, scale ${pace(560)}ms ${EASE}, opacity ${pace(220)}ms ${EASE} ${pace(360)}ms`;
  } else {
    style.translate = `${cluster.x}px ${cluster.y}px`;
    style.opacity = !visible ? 0 : deferred ? 0.85 : 1;
    style.transition = `translate ${pace(400)}ms ${EASE}, opacity ${pace(380)}ms ${EASE} ${delay}ms, scale ${pace(380)}ms ${EASE} ${delay}ms`;
    if (thinking) {
      style.animation = `plan-breathe ${pace(1240)}ms ease-in-out infinite`;
    } else {
      style.scale = visible ? "1" : "0.9";
    }
  }

  return (
    <div style={style}>
      <div style={{ ...styles.pill, ...(deferred ? styles.pillLater : null) }}>
        <span style={{ ...styles.pillTitle, ...(deferred ? styles.pillTitleLater : null) }}>{title}</span>
        {dur && <span style={styles.pillDur}>{dur}</span>}
      </div>
      {marked && (
        <div style={{ ...styles.pillBadge, ...(later ? styles.pillBadgeLater : styles.pillBadgePicked) }}>
          {later ? <Icon name="tray" size={11} color="#8a8276" /> : <Icon name="arrow-forward" size={11} color="#ffffff" />}
        </div>
      )}
    </div>
  );
}

/**
 * One tick in the stepper; its width and colour come from its distance to the active
 * step. The transition is dropped when the active step resets to 0, so the loop
 * restart snaps instead of sweeping backward.
 */
function Step({ index, stepIndex }: { index: number; stepIndex: number }) {
  const active = index === stepIndex;
  const done = index < stepIndex;
  return (
    <div
      style={{
        ...styles.step,
        width: active ? 16 : 5,
        background: done ? "rgba(42,38,33,0.32)" : active ? ACCENT : "rgba(42,38,33,0.14)",
        transition: stepIndex === 0 ? "none" : `width ${pace(420)}ms ${EASE}, background-color ${pace(420)}ms ${EASE}`,
      }}
    />
  );
}

/**
 * A one-off highlight swept across the finished plan. Keyed by cycle so it replays
 * each loop; the delay holds until the deferred pills have faded out.
 */
function ShineSweep({ width, height }: { width: number; height: number }) {
  const BAND = 120;
  const [swept, setSwept] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setSwept(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!width || !height) return null;
  const x = swept ? width + BAND : -BAND;
  return (
    <div
      aria-hidden
      style={{
        ...styles.shine,
        width: BAND,
        height,
        pointerEvents: "none",
        transform: `translateX(${x}px) skewX(-14deg)`,
        transition: swept ? `transform ${pace(1100)}ms ${EASE} ${pace(900)}ms` : "none",
        background:
          "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
      }}
    />
  );
}

export function PlanPreview() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("template");
  const [placed, setPlaced] = useState(0);
  const [cycle, setCycle] = useState(0);

  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [homes, setHomes] = useState<Record<string, Point>>({});
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });

  // Task-row landing positions, in stage coordinates, measured from the DOM.
  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const base = stage.getBoundingClientRect();
    const next: Record<string, Point> = {};
    let any = false;
    for (const t of TASKS) {
      const slot = slotRefs.current[t.id];
      if (!slot) continue;
      const r = slot.getBoundingClientRect();
      next[t.id] = { x: r.left - base.left, y: r.top - base.top };
      any = true;
    }
    if (any) setHomes(next);
    setStageSize({ w: base.width, h: base.height });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Gate the loop to when the card is on screen, pausing and cleanly restarting it as
  // the section scrolls in and out of view.
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    measure();
    if (typeof window === "undefined") return;
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    if (reducedMotion || !active) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(setTimeout(() => { if (!cancelled) fn(); }, ms));
    };
    const run = () => {
      setPhase("template");
      setPlaced(0);
      setCycle((c) => c + 1);
      // Re-measure once the entrance has settled, before any pill flies.
      at(pace(1000), measure);
      at(TEMPLATE_MS, () => setPhase("backlog"));
      at(THINKING_AT, () => setPhase("thinking"));
      at(SELECTING_AT, () => setPhase("selecting"));
      at(SCHED_START, () => setPhase("scheduling"));
      TASKS.forEach((_, i) => at(SCHED_START + PLACE_LEAD_IN + i * PLACE_STAGGER, () => setPlaced(i + 1)));
      at(RESOLVED_AT, () => setPhase("resolved"));
      at(LOOP_MS, run);
    };
    run();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [reducedMotion, active, measure]);

  const settled = reducedMotion || phase === "resolved";
  const placedCount = settled ? TASKS.length : placed;
  const pillsVisible =
    !reducedMotion && (phase === "backlog" || phase === "thinking" || phase === "selecting" || phase === "scheduling");
  const marked = reducedMotion || phase === "selecting" || phase === "scheduling" || phase === "resolved";
  const thinking = phase === "thinking";
  const activePhase: Phase = reducedMotion ? "resolved" : phase;
  const copy = COPY[activePhase];
  const stepIndex = PHASE_ORDER.indexOf(activePhase);

  return (
    <div
      ref={cardRef}
      role="img"
      aria-label="A preview of a planned day: your to-dos settling into focus blocks."
      style={styles.card}
    >
      <div
        aria-hidden
        style={{ ...styles.glow, opacity: pillsVisible ? 1 : 0, transition: `opacity ${pace(500)}ms ${EASE}` }}
      />

      <div style={styles.statusBar}>
        <div style={styles.avatar}>
          <Icon name={copy.icon} size={12} color="#ffffff" />
        </div>
        <span style={styles.statusText}>{copy.caption}</span>
        <div style={styles.stepper}>
          {PHASE_ORDER.map((p, i) => (
            <Step key={p} index={i} stepIndex={stepIndex} />
          ))}
        </div>
      </div>

      <div ref={stageRef} style={styles.stage}>
        <div key={cycle}>
          {TIMELINE.map((row, i) => {
            const rowTasks = TASKS.filter((t) => t.block === row.id);
            return (
              <div
                key={row.id}
                style={{
                  ...styles.timelineRow,
                  ...(reducedMotion
                    ? null
                    : { animation: `plan-fade-in-down ${pace(380)}ms ${EASE} both`, animationDelay: `${pace(i * 70)}ms` }),
                }}
              >
                <span style={styles.gutter}>{row.gutter}</span>
                <div style={{ flex: 1 }}>
                  {row.kind === "anchor" ? (
                    <div style={styles.anchorCard}>
                      <span style={styles.anchorName}>{row.name}</span>
                      <span style={styles.anchorTime}>{row.time}</span>
                      {(placedCount > 0 || settled) && (
                        <span style={styles.keptTag}>
                          <Icon name="lock" size={11} color="#b5996f" />
                        </span>
                      )}
                    </div>
                  ) : (
                    <div style={styles.containerCard}>
                      <div style={styles.containerHeader}>
                        <span style={styles.containerName}>{row.name}</span>
                        <span style={styles.containerTime}>{row.time}</span>
                      </div>
                      {rowTasks.length > 0 && (
                        <div style={styles.taskList}>
                          {rowTasks.map((t) => {
                            const landed = settled || TASKS.indexOf(t) < placedCount;
                            return (
                              <div
                                key={t.id}
                                ref={(r) => { slotRefs.current[t.id] = r; }}
                                style={{ opacity: landed ? 1 : 0, transition: `opacity ${pace(260)}ms ${EASE}` }}
                              >
                                <div style={styles.taskRow}>
                                  <span style={styles.taskTitle}>{t.title}</span>
                                  <span style={styles.taskDur}>{t.dur}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Flying pills live above the timeline so they can travel across blocks. */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {TASKS.map((t, i) => (
            <FlyingPill
              key={t.id}
              title={t.title}
              dur={t.dur}
              marked={marked}
              thinking={thinking}
              cluster={CLUSTER[t.id]}
              home={homes[t.id] ?? null}
              visible={pillsVisible}
              landed={!settled && placed > i}
              index={i}
              reducedMotion={reducedMotion}
            />
          ))}
          {LATER.map((t, i) => (
            <FlyingPill
              key={t.id}
              title={t.title}
              later
              marked={marked}
              thinking={thinking}
              cluster={CLUSTER[t.id]}
              home={null}
              visible={pillsVisible}
              landed={false}
              index={TASKS.length + i}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>

        {phase === "resolved" && stageSize.w > 0 && (
          <ShineSweep key={`shine-${cycle}`} width={stageSize.w} height={stageSize.h} />
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    position: "relative",
    // No fill, so the section's band shows through. overflow:hidden clips the glow and
    // shine to the rounded box; the drop shadow is outset, so it isn't clipped.
    borderRadius: 28,
    padding: "16px 16px 12px",
    overflow: "hidden",
    boxShadow: "0 2px 4px rgba(42,38,33,0.04), 0 18px 40px -18px rgba(42,38,33,0.30)",
  },
  // Oversized on purpose — a soft wash sized to sit behind the whole backlog pile.
  glow: {
    position: "absolute",
    top: -90,
    left: -60,
    right: -60,
    height: 320,
    borderRadius: 180,
    background: "rgba(224,138,43,0.12)",
    filter: "blur(28px)",
    pointerEvents: "none",
  },
  statusBar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: "0 4px 10px",
    marginBottom: 12,
    borderBottom: "1px solid rgba(42,38,33,0.05)",
  },
  statusText: { fontSize: 13, color: "#5c5248", fontWeight: 500, letterSpacing: -0.15 },
  stepper: { display: "flex", flexDirection: "row", alignItems: "center", gap: 4, marginLeft: "auto" },
  step: { height: 5, borderRadius: 3, flexShrink: 0 },
  stage: { position: "relative" },
  timelineRow: { display: "flex", flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  gutter: {
    width: 40,
    flexShrink: 0,
    paddingTop: 13,
    paddingRight: 8,
    fontSize: 10,
    color: "#a69e92",
    letterSpacing: -0.1,
  },
  anchorCard: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#efeae1",
    borderRadius: 12,
    padding: "12px 13px",
  },
  anchorName: { fontSize: 14, fontWeight: 600, color: "#2a2621", letterSpacing: -0.2, marginRight: 8 },
  anchorTime: { fontSize: 12, color: "#9a9389", letterSpacing: -0.1, fontVariantNumeric: "tabular-nums" },
  keptTag: { display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: "auto" },
  containerCard: {
    border: "1.5px dashed rgba(176,120,65,0.35)",
    borderRadius: 12,
    padding: "12px 13px",
  },
  containerHeader: { display: "flex", flexDirection: "row", alignItems: "center" },
  containerName: { fontSize: 14, fontWeight: 600, color: "#2a2621", letterSpacing: -0.2, marginRight: 8 },
  containerTime: { fontSize: 12, color: "#9a9389", fontVariantNumeric: "tabular-nums" },
  taskList: { display: "flex", flexDirection: "column", gap: 6, marginTop: 10 },
  taskRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#ffffff",
    borderRadius: 9,
    padding: "9px 11px",
    boxShadow: SHADOW_SOFT,
  },
  taskTitle: {
    flex: 1,
    fontSize: 13,
    color: "#2a2621",
    letterSpacing: -0.15,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  taskDur: { fontSize: 12, color: "#8a8276", fontVariantNumeric: "tabular-nums" },
  flyingPill: { position: "absolute", top: 0, left: 0 },
  pillBadge: {
    position: "absolute",
    top: -6,
    left: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: SHADOW_SOFT,
  },
  pillBadgePicked: { backgroundColor: ACCENT },
  pillBadgeLater: { backgroundColor: "#e6ded1" },
  pill: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderRadius: 999,
    padding: "8px 13px",
    boxShadow: SHADOW_SOFT,
    whiteSpace: "nowrap",
  },
  pillLater: { backgroundColor: "rgba(245,242,236,0.95)" },
  pillTitle: { fontSize: 12.5, color: "#2a2621", letterSpacing: -0.15 },
  pillTitleLater: { color: "#7a736a" },
  pillDur: { fontSize: 11.5, color: "#8a8276", fontVariantNumeric: "tabular-nums" },
  shine: { position: "absolute", top: 0, left: 0 },
  avatar: {
    width: 22,
    height: 22,
    flexShrink: 0,
    borderRadius: 11,
    backgroundColor: "#2a2621",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
} satisfies Record<string, CSSProperties>;
