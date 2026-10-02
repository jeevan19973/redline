"use client";

import { useEffect } from "react";
import { copy } from "./copy";

// The landing page's motion, ported from landing/script.js: plumb lines, the
// descent, linked highlights and marine snow. Everything here is enhancement:
// the server-rendered page is complete and static without it. Under
// prefers-reduced-motion there is no descent and no snow, as in the original.
// Renders nothing; it works on the page's own markup.
export function Descent() {
  useEffect(() => startDescent(), []);
  return null;
}

const SVG_NS = "http://www.w3.org/2000/svg";
// The cited sentences, in document order.
const KEYS = copy.examples.map((flag) => flag.key);
const DEEP = new Set(copy.examples.filter((flag) => flag.severity === "dangerous").map((flag) => flag.key));

// Starts everything and returns the function that stops it again.
function startDescent(): () => void {
  const dive = document.querySelector<HTMLElement>("[data-dive]");
  const page = dive?.closest<HTMLElement>(".landing");
  const svg = dive?.querySelector<SVGSVGElement>(".plumb");
  if (!dive || !page || !svg) return () => {};

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const wideEnough = window.matchMedia("(min-width: 1101px)");
  const timers: number[] = [];
  const cleanups: (() => void)[] = [];
  let stopped = false;

  const listen = <T extends EventTarget>(target: T, type: string, handler: EventListener) => {
    target.addEventListener(type, handler);
    cleanups.push(() => target.removeEventListener(type, handler));
  };
  const later = (fn: () => void, ms: number) => {
    timers.push(window.setTimeout(fn, ms));
  };

  const byKey = (selector: string, key: string) =>
    Array.from(page.querySelectorAll<HTMLElement>(`${selector}[data-key="${key}"]`));

  // ---------- Plumb lines ----------
  // Each line leaves the end of its cited sentence, runs down the lease's
  // right margin, crosses under the waterline in its own lane, drops down a
  // gutter beside its slate, and ties on at the slate's head.

  let paths: Record<string, SVGPathElement> = {};
  let rings: Record<string, SVGCircleElement> = {};

  function drawPlumb() {
    while (svg!.firstChild) svg!.removeChild(svg!.firstChild);
    paths = {};
    rings = {};
    if (!wideEnough.matches) return;

    const box = dive!.getBoundingClientRect();
    const lease = dive!.querySelector(".lease")!.getBoundingClientRect();
    const marginRight = lease.right - box.left - 14;

    svg!.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);

    KEYS.forEach((key, i) => {
      const cite = document.getElementById(`s-${key}`);
      const slate = document.getElementById(`flag-${key}`);
      if (!cite || !slate) return;

      const rects = cite.getClientRects();
      const last = rects[rects.length - 1];
      const s = slate.getBoundingClientRect();
      const head = slate.querySelector(".slate__head")!.getBoundingClientRect();

      const x0 = last.right - box.left + 6;
      const y0 = last.top - box.top + last.height * 0.62;
      const laneX = marginRight - i * 9;
      const jogY = lease.bottom - box.top + 14 + i * 11;
      const gutterX = s.left - box.left - 12 - (i % 2) * 8;
      const tieY = head.top - box.top + head.height / 2;
      const tieX = s.left - box.left;

      const d = ["M", x0, y0, "H", laneX, "V", jogY, "H", gutterX, "V", tieY, "H", tieX].join(" ");

      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", d);
      path.dataset.key = key;
      svg!.appendChild(path);
      paths[key] = path;

      const ring = document.createElementNS(SVG_NS, "circle");
      ring.setAttribute("cx", String(tieX));
      ring.setAttribute("cy", String(tieY));
      ring.setAttribute("r", "3.5");
      ring.dataset.key = key;
      svg!.appendChild(ring);
      rings[key] = ring;
    });
  }

  // ---------- Linked highlights ----------
  // Hovering or focusing a sentence, a readout row or a slate lights all three.

  const linked = (key: string) => [...byKey(".cite", key), ...byKey(".readout__row", key), ...byKey(".slate", key)];

  function light(key: string, on: boolean) {
    linked(key).forEach((el) => el.classList.toggle("is-lit", on));
    paths[key]?.classList.toggle("is-lit", on);
    rings[key]?.classList.toggle("is-lit", on);
    svg!.classList.toggle("has-lit", on);
  }

  KEYS.forEach((key) => {
    linked(key).forEach((el) => {
      listen(el, "pointerenter", () => light(key, true));
      listen(el, "pointerleave", () => light(key, false));
      listen(el, "focusin", () => light(key, true));
      listen(el, "focusout", () => light(key, false));
    });
  });

  // ---------- The descent ----------
  // In document order, each cited sentence underlines, then its slate sinks
  // along its line to its depth. Content is visible before and after; the
  // motion only moves it from just above its resting place.

  const animations: Animation[] = [];

  function descend() {
    if (reduceMotion.matches || !("animate" in Element.prototype)) return;
    page!.classList.add("is-descending");

    KEYS.forEach((key, i) => {
      const start = 350 + i * 520;
      const cite = document.getElementById(`s-${key}`);
      const slate = document.getElementById(`flag-${key}`);
      const deep = DEEP.has(key);

      later(() => cite?.classList.add("is-drawn"), start);

      if (slate) {
        animations.push(
          slate.animate(
            [
              { transform: `translateY(${deep ? -64 : -36}px)`, opacity: 0.25 },
              { transform: "translateY(0)", opacity: 1 },
            ],
            { duration: deep ? 1500 : 1100, delay: start + 380, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" },
          ),
        );
      }

      const path = paths[key];
      if (path && path.getTotalLength) {
        const len = path.getTotalLength();
        animations.push(
          path.animate(
            [
              { strokeDasharray: len, strokeDashoffset: len },
              { strokeDasharray: len, strokeDashoffset: 0 },
            ],
            { duration: 1100, delay: start + 200, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" },
          ),
        );
      }
    });

    later(() => page!.classList.remove("is-descending"), 350 + KEYS.length * 520 + 1600);
  }

  // ---------- Marine snow ----------

  const canvas = dive.querySelector<HTMLCanvasElement>(".snow");
  const ctx = canvas?.getContext ? canvas.getContext("2d") : null;
  type Flake = { x: number; y: number; r: number; v: number; drift: number; a: number };
  type Zone = { l: number; t: number; r: number; b: number };
  let flakes: Flake[] = [];
  let keepOut: Zone[] = [];
  let running = false;
  let visible = true;

  function sizeSnow() {
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(140, Math.round((rect.width * rect.height) / 11000));
    flakes = [];
    for (let i = 0; i < count; i++) {
      flakes.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        r: 0.8 + Math.random() * 1.3,
        v: 0.06 + Math.random() * 0.22,
        drift: Math.random() * Math.PI * 2,
        a: 0.3 + Math.random() * 0.4,
      });
    }
    // Flakes never land on text: sample the copy and slates once per layout.
    keepOut = Array.from(
      dive!.querySelectorAll(
        ".water--reach .band-note, .water--reach .readout, .water--reach .slate, .thermocline__inner > *",
      ),
      (el) => {
        const r = el.getBoundingClientRect();
        return { l: r.left - rect.left - 8, t: r.top - rect.top - 8, r: r.right - rect.left + 8, b: r.bottom - rect.top + 8 };
      },
    );
    paintSnow(rect.width, rect.height, 0);
  }

  function onText(x: number, y: number) {
    return keepOut.some((z) => x > z.l && x < z.r && y > z.t && y < z.b);
  }

  function paintSnow(w: number, h: number, t: number) {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      const fx = f.x + Math.sin(f.drift + t * 0.0004) * 6;
      if (onText(fx, f.y)) continue;
      ctx.globalAlpha = f.a;
      ctx.fillStyle = "#E9EEF3";
      ctx.beginPath();
      ctx.arc(fx, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function tick(t: number) {
    if (!running || stopped || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    for (const f of flakes) {
      f.y += f.v;
      if (f.y > rect.height + 4) {
        f.y = -4;
        f.x = Math.random() * rect.width;
      }
    }
    paintSnow(rect.width, rect.height, t);
    window.requestAnimationFrame(tick);
  }

  function setSnowRunning() {
    const should = !!ctx && visible && !document.hidden && !reduceMotion.matches && !stopped;
    if (should && !running) {
      running = true;
      window.requestAnimationFrame(tick);
    }
    if (!should) running = false;
  }

  if (ctx && canvas && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      setSnowRunning();
    });
    observer.observe(canvas);
    cleanups.push(() => observer.disconnect());
  }
  listen(document, "visibilitychange", setSnowRunning);

  // ---------- Boot ----------

  let resizeTimer: number | undefined;
  function relayout() {
    drawPlumb();
    sizeSnow();
  }

  function boot() {
    if (stopped) return;
    relayout();
    descend();
    setSnowRunning();
    listen(window, "resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(relayout, 120);
    });
    listen(reduceMotion, "change", setSnowRunning);
    listen(wideEnough, "change", drawPlumb);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot);
  } else {
    listen(window, "load", boot);
  }

  return () => {
    stopped = true;
    running = false;
    timers.forEach((id) => window.clearTimeout(id));
    window.clearTimeout(resizeTimer);
    cleanups.forEach((cleanup) => cleanup());
    animations.forEach((animation) => animation.cancel());
    page.classList.remove("is-descending");
    page.querySelectorAll(".is-drawn, .is-lit").forEach((el) => el.classList.remove("is-drawn", "is-lit"));
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.classList.remove("has-lit");
  };
}
