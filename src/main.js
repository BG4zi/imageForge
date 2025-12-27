import "./style.css";
import { createEditor } from "./editor.js";
import { runProgramAsync } from "./runner.js";
import { DEFAULT_PROGRAM } from "./defaultProgram.js";

const app = document.querySelector("#app");

app.innerHTML = `
  <div class="topbar">
    <div class="brand">
      <div>imageForge</div>
      <small>JS → SVG forge</small>
    </div>

    <div class="controls">
      <span class="pill" id="statusPill">status: idle</span>
      <button id="vimBtn" class="primary" title="Toggle Vim mode">Vim: OFF</button>
      <button id="exportBtn" title="Download current SVG">Export SVG</button>
      <button id="resetBtn" class="danger" title="Reset editor">Reset</button>
    </div>
  </div>

  <div class="layout">
    <div class="panel" id="editorPanel">
      <div class="panelHeader">
        <div>Editor (JavaScript)</div>
        <div style="font-family: var(--mono)">Ctrl/Cmd+S: render</div>
      </div>
      <div class="panelBody">
        <div id="editor"></div>
      </div>
    </div>

    <div class="panel">
      <div class="panelHeader">
        <div>Preview (SVG)</div>
        <div id="dims" style="font-family: var(--mono)"></div>
      </div>

      <div class="panelBody">
        <div class="previewWrap">
          <div class="preview">
            <div class="previewInner" id="previewInner"></div>
          </div>
          <div class="footer">
            <div id="okText" class="ok"></div>
            <div id="errText" class="error"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

const editorEl = document.querySelector("#editor");
const editorPanel = document.querySelector("#editorPanel");
const previewInner = document.querySelector("#previewInner");
const errText = document.querySelector("#errText");
const okText = document.querySelector("#okText");
const dims = document.querySelector("#dims");
const statusPill = document.querySelector("#statusPill");

const vimBtn = document.querySelector("#vimBtn");
const exportBtn = document.querySelector("#exportBtn");
const resetBtn = document.querySelector("#resetBtn");

const saveKey = "imageForge.program.v1";

let currentSvg = "";

const params = new URLSearchParams(window.location.search);
const fileParam = params.get("file"); // e.g. /forge/demo.forge.js (under public/)
const isFileMode = !!fileParam;

function setStatus(kind, msg) {
  statusPill.textContent = `status: ${msg}`;
  statusPill.style.borderColor =
    kind === "ok"
      ? "rgba(134,239,172,0.45)"
      : kind === "err"
        ? "rgba(251,113,133,0.55)"
        : "var(--border)";
}

function debounce(fn, ms) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function extractSvgSize(svgString) {
  const w = svgString.match(/\bwidth="([^"]+)"/)?.[1];
  const h = svgString.match(/\bheight="([^"]+)"/)?.[1];
  const vb = svgString.match(/\bviewBox="([^"]+)"/)?.[1];
  return { w, h, vb };
}

async function renderNow(code) {
  errText.textContent = "";
  okText.textContent = "";
  dims.textContent = "";

  try {
    setStatus("idle", "rendering…");

    const svg = await runProgramAsync(code);
    currentSvg = svg;

    previewInner.innerHTML = svg;

    const { w, h, vb } = extractSvgSize(svg);
    dims.textContent = [w && `w:${w}`, h && `h:${h}`, vb && `vb:${vb}`]
      .filter(Boolean)
      .join("  ");

    okText.textContent = "render ok";
    setStatus("ok", "ok");

    if (!isFileMode) {
      localStorage.setItem(saveKey, code);
    }
  } catch (e) {
    setStatus("err", "error");
    errText.textContent = String(e?.stack || e?.message || e);
  }
}

const renderDebounced = debounce((code) => {
  renderNow(code);
}, 180);

function setFileModeUI(on) {
  const layout = document.querySelector(".layout");

  if (on) {
    if (editorPanel) editorPanel.style.display = "none";
    if (layout) layout.style.gridTemplateColumns = "1fr";
    vimBtn.style.display = "none";
    resetBtn.style.display = "none";
  } else {
    if (editorPanel) editorPanel.style.display = "";
    if (layout) layout.style.gridTemplateColumns = "";
    vimBtn.style.display = "";
    resetBtn.style.display = "";
  }
}

async function loadFromPublicFile(path) {
  if (!path) throw new Error("Missing file param");
  if (!path.startsWith("/")) path = "/" + path;
  if (path.includes("..")) throw new Error("Invalid file path");

  // cache-bust so updates appear immediately
  const url = new URL(path, window.location.origin);
  url.searchParams.set("t", String(Date.now()));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
  return await res.text();
}

// ---- Start app (two modes) ----

let editor = null;

function wireCommonButtons(getCode) {
  // Export
  exportBtn.addEventListener("click", () => {
    if (!currentSvg) return;

    const blob = new Blob([currentSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "imageForge-output.svg";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  });

  // Ctrl/Cmd+S to render
  window.addEventListener("keydown", (e) => {
    const isSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";
    if (!isSave) return;
    e.preventDefault();
    renderNow(getCode());
  });
}

function startEditorMode(initialDoc) {
  setFileModeUI(false);

  editor = createEditor({
    parent: editorEl,
    initialDoc,
    onChange: (code) => {
      setStatus("idle", "typing…");
      renderDebounced(code);
    },
  });

  // First render
  renderNow(editor.getValue());

  // Vim toggle
  vimBtn.addEventListener("click", () => {
    const next = !editor.isVimEnabled();
    editor.setVimEnabled(next);
    vimBtn.textContent = `Vim: ${next ? "ON" : "OFF"}`;
  });

  // Reset
  resetBtn.addEventListener("click", () => {
    editor.setValue(DEFAULT_PROGRAM);
    renderNow(editor.getValue());
  });

  wireCommonButtons(() => editor.getValue());
}

function startFileMode(initialFileCode) {
  setFileModeUI(true);

  let last = initialFileCode;
  renderNow(last);
  wireCommonButtons(() => last);

  // Live reload polling (because Vite doesn't HMR public/ assets)
  const intervalMs = 400;
  let ticking = false;

  const timer = setInterval(async () => {
    if (document.hidden) return;
    if (ticking) return;
    ticking = true;

    try {
      const txt = await loadFromPublicFile(fileParam);
      if (txt !== last) {
        last = txt;
        setStatus("idle", `reloading ${fileParam}…`);
        await renderNow(last);
      }
    } catch {
      // ignore transient fetch errors during save
    } finally {
      ticking = false;
    }
  }, intervalMs);

  window.addEventListener("beforeunload", () => clearInterval(timer));
}

(async function boot() {
  if (isFileMode) {
    try {
      setStatus("idle", `loading ${fileParam}…`);
      const code = await loadFromPublicFile(fileParam);
      startFileMode(code);
    } catch (e) {
      // fallback: show editor with error
      setStatus("err", "file load error");
      errText.textContent = String(e?.message || e);
      const fallback = localStorage.getItem(saveKey) || DEFAULT_PROGRAM;
      startEditorMode(fallback);
    }
  } else {
    const initialDoc = localStorage.getItem(saveKey) || DEFAULT_PROGRAM;
    startEditorMode(initialDoc);
  }
})();
