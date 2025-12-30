const STROKE_THICKNESS = 4;
const ICON_SIZE = 128

const ICON_BOX = [
  rect({
      x: 0, y: 0,
      width: ICON_SIZE, height: ICON_SIZE,
      rx: 24, ry: 24,
      fill: "#9F8642" 
  }),
  rect({
      x: STROKE_THICKNESS/2, y: STROKE_THICKNESS/2,
      width: ICON_SIZE-STROKE_THICKNESS, 
      height: ICON_SIZE-STROKE_THICKNESS,
      rx: 24, ry: 24,
      fill: "#151517" 
  })
]

const VEC_SIZE = 80;
const VEC_BOX = ICON_SIZE - VEC_SIZE;


const p = new PathNode({
  fill: "none",
  stroke: "#9F8642",
  strokeWidth: 3,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

const x0 = VEC_BOX / 2;
const y0 = VEC_BOX / 2 + VEC_SIZE;

// ölçüler (tamamen oranlı)
const W   = VEC_SIZE;        // drawer width
const H   = VEC_SIZE * 0.42; // drawer height
const lip = VEC_SIZE * 0.14; // üst/alt dudak (içe girinti)
const hh  = VEC_SIZE * 0.10; // handle height offset
const hw  = VEC_SIZE * 0.32; // handle width

const ICON_VEC = [
  p
    // --- OUTER DRAWER (dikdörtgen) ---
    .M(x0, y0)
    .pH(W)
    .pV(-H)
    .pH(-W)
    .pV(H)

    // --- TOP LIP (üst çizgi, içe girintili) ---
    .M(x0 + lip, y0 - H *2)
    .pH(W - 2 * lip)

    .L(x0+W, y0-H)


    .M(x0+lip, y0 - H *2)

    .L(x0, y0-H)


    // --- HANDLE (ortada küçük trapez/chevron gibi) ---
    // sol eğik
    .M(x0 + W / 2 - hw / 2, y0 - H * 0.55)
    .L(p._x + hw * 0.12, p._y + hh)
    // orta düz
    .pH(hw * 0.76)
    // sağ eğik
    .L(p._x + hw * 0.12, p._y - hh)

    .toNode(),
];

const root = svg({ width: ICON_SIZE, height: ICON_SIZE},
    ICON_BOX,
    ICON_VEC
);

return render(root);

