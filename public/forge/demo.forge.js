const STROKE_THICKNESS = 4;
const ICON_SIZE = 128

const ICON_BOX = [
  rect({
      x: 0, y: 0,
      width: ICON_SIZE, height: ICON_SIZE,
      rx: 24, ry: 24,
      fill: "#FF0000" 
  }),
  rect({
      x: STROKE_THICKNESS/2, y: STROKE_THICKNESS/2,
      width: ICON_SIZE-STROKE_THICKNESS, 
      height: ICON_SIZE-STROKE_THICKNESS,
      rx: 24, ry: 24,
      fill: "#000000" 
  })
]

const VEC_SIZE = 100;
const VEC_BOX = ICON_SIZE - VEC_SIZE;

const ICON_VEC = [
    path({
//        d: "M0 64 H128 M64 0 V128",
        d: `M${VEC_BOX} ${VEC_SIZE} H${VEC_SIZE}`+
        `M${VEC_SIZE} ${VEC_SIZE} V${(VEC_BOX)/2 * 5}`+
        `M${VEC_BOX} ${VEC_BOX/2*5} H${VEC_BOX+VEC_SIZE/12*2}`+
        `M${VEC_SIZE} ${VEC_BOX/2*5} H${VEC_BOX+VEC_SIZE/12*6}`+
        `M${VEC_BOX+VEC_SIZE/12*6} ${VEC_BOX/2*5} 
         L${VEC_BOX+VEC_SIZE/12*6-5} ${VEC_BOX/2*5 + 15}
            `+
        `M${VEC_BOX} ${VEC_SIZE} V${(VEC_BOX)/2 * 5}`,
        fill: "none",
        stroke: "#fff",
        strokeWidth: 3,
        strokeLinecap: "round"
    })
]

const root = svg({ width: ICON_SIZE, height: ICON_SIZE},
    ICON_BOX,
    ICON_VEC
);

return render(root);

