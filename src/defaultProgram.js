export const DEFAULT_PROGRAM = `import {
  svg, render,
  rect, circle, path, text, g, defs,
  rr, rgba, linearGradient
} from "./forge.js";

export default () => {
  const W = 480, H = 800;

  const bgDefs = defs({},
    linearGradient("g", [
      { offset: "0%", color: "#0f172a" },
      { offset: "100%", color: "#020617" },
    ], { x1: 0, y1: 0, x2: 0, y2: 1 })
  );

  const card = path({
    d: rr(40, 90, W - 80, 220, 26),
    fill: rgba(255,255,255,0.06),
    stroke: rgba(125,211,252,0.35),
    strokeWidth: 1.5,
  });

  const dots = g({ opacity: 0.9 },
    circle({ cx: 95, cy: 250, r: 18, fill: "#7dd3fc", opacity: 0.25 }),
    circle({ cx: 135, cy: 250, r: 18, fill: "#fb7185", opacity: 0.22 }),
    circle({ cx: 175, cy: 250, r: 18, fill: "#86efac", opacity: 0.20 }),
  );

  const root = svg({ width: W, height: H },
    bgDefs,
    rect({ x: 0, y: 0, width: W, height: H, fill: "url(#g)" }),

    card,

    text({
      x: 60, y: 140,
      fill: "#e2e8f0",
      fontFamily: "ui-sans-serif,system-ui",
      fontSize: 28,
      fontWeight: 700
    }, "imageForge"),

    text({
      x: 60, y: 178,
      fill: "#94a3b8",
      fontFamily: "ui-sans-serif,system-ui",
      fontSize: 14
    }, "write JS → render SVG"),

    dots,

    text({
      x: 60, y: H - 60,
      fill: "#64748b",
      fontFamily: "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas",
      fontSize: 12
    }, "Tip: import forge.js | export default () => render(svg(...))")
  );

  return render(root);
};
`;
