// src/runner.js
// Runs user code as a plain function and injects the forge API as `F`.
// No import/export. No blob/data modules. Very stable.

import * as F from "./forge.js";

function wrapAsFunctionBody(code) {
  // User writes normal JS and must end with: return "<svg...>";
  // We'll execute inside (F) scope.
  return `"use strict";
  const {
    h, render,
    svg, g, defs,
    rect, circle, ellipse, line, path, polyline, polygon, text,
    rr, rgba, centerXY, linearGradient, PathNode,
  } = F;

  ${code}
  `;
}

export async function runProgramAsync(code) {
  const body = wrapAsFunctionBody(code);

  let fn;
  try {
    fn = new Function("F", body);
  } catch (e) {
    // Syntax error in user code
    throw e;
  }

  const out = fn(F);

  if (typeof out !== "string") {
    throw new Error(`Program must return an SVG string. Got: ${typeof out}`);
  }
  if (!out.trim().startsWith("<svg")) {
    throw new Error("Output doesn't look like SVG. Expected string starting with <svg ...>.");
  }
  return out;
}
