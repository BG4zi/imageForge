// src/forge.js
// Tiny SVG forge DSL: create nodes -> render to string.

const VOID = new Set([]); // SVG mostly not void; we'll always close tags.

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function kebabize(k) {
  // allow strokeWidth -> stroke-width
  return k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

function styleObjToStr(style) {
  if (!style) return "";
  if (typeof style === "string") return style;
  return Object.entries(style)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${kebabize(k)}:${String(v)}`)
    .join(";");
}

function attrsToStr(attrs) {
  if (!attrs) return "";
  let out = "";
  for (const [k0, v0] of Object.entries(attrs)) {
    if (v0 === undefined || v0 === null || v0 === false) continue;
    const k = k0 === "className" ? "class" : kebabize(k0);

    if (k === "style") {
      const s = styleObjToStr(v0);
      if (s) out += ` style="${esc(s)}"`;
      continue;
    }

    if (v0 === true) {
      out += ` ${k}`;
      continue;
    }

    out += ` ${k}="${esc(v0)}"`;
  }
  return out;
}

// Node shape:
// { tag, attrs, children: (string|node)[] }
export function h(tag, attrs, ...children) {
  const flat = [];
  for (const c of children.flat(Infinity)) {
    if (c === undefined || c === null || c === false) continue;
    flat.push(c);
  }
  return { tag, attrs: attrs || null, children: flat };
}

export function render(node) {
  if (typeof node === "string") return node; // assume already escaped if needed
  if (!node || typeof node !== "object") return "";

  const { tag, attrs, children } = node;
  const a = attrsToStr(attrs);
  const inner = (children || [])
    .map((c) => (typeof c === "string" ? esc(c) : render(c)))
    .join("");

  return `<${tag}${a}>${inner}</${tag}>`;
}

/* ---------- SVG primitives ---------- */

export function svg({ width, height, viewBox, ...attrs } = {}, ...children) {
  const a = {
    xmlns: "http://www.w3.org/2000/svg",
    width,
    height,
    viewBox: viewBox || (width && height ? `0 0 ${width} ${height}` : undefined),
    ...attrs,
  };
  return h("svg", a, ...children);
}

export const g = (attrs, ...c) => h("g", attrs, ...c);
export const defs = (attrs, ...c) => h("defs", attrs, ...c);

export const rect = (attrs) => h("rect", attrs);
export const circle = (attrs) => h("circle", attrs);
export const ellipse = (attrs) => h("ellipse", attrs);
export const line = (attrs) => h("line", attrs);
export const path = (attrs) => h("path", attrs);
export const polyline = (attrs) => h("polyline", attrs);
export const polygon = (attrs) => h("polygon", attrs);
export const text = (attrs, ...c) => h("text", attrs, ...c);

/* ---------- Helpers ---------- */

// Simple rounded rect path generator (for fancy cards)
export function rr(x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  return [
    `M ${x + rr} ${y}`,
    `H ${x + w - rr}`,
    `A ${rr} ${rr} 0 0 1 ${x + w} ${y + rr}`,
    `V ${y + h - rr}`,
    `A ${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h}`,
    `H ${x + rr}`,
    `A ${rr} ${rr} 0 0 1 ${x} ${y + h - rr}`,
    `V ${y + rr}`,
    `A ${rr} ${rr} 0 0 1 ${x + rr} ${y}`,
    "Z",
  ].join(" ");
}

// Tiny color helpers
export const rgba = (r, g, b, a) => `rgba(${r},${g},${b},${a})`;

// Layout-ish helpers
export function centerXY(W, H, w, h) {
  return { x: (W - w) / 2, y: (H - h) / 2 };
}

// One-liner builder for <linearGradient>
export function linearGradient(id, stops, attrs = {}) {
  // stops: [{ offset: 0, color:"#fff", opacity:1 }, ...]
  return h(
    "linearGradient",
    { id, ...attrs },
    ...stops.map((s) =>
      h("stop", {
        offset: s.offset,
        "stop-color": s.color,
        "stop-opacity": s.opacity ?? undefined,
      })
    )
  );
}
