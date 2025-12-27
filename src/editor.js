import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { vim } from "@replit/codemirror-vim";

export function createEditor({ parent, initialDoc, onChange }) {
  let vimEnabled = false;

  const baseExtensions = [
    oneDark,
    history(),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    javascript({ jsx: false, typescript: false }),
    EditorView.updateListener.of((v) => {
      if (v.docChanged) onChange(v.state.doc.toString());
    }),
    EditorView.theme({
      "&": { height: "100%" },
      ".cm-scroller": { fontFamily: "var(--mono)" },
    }),
  ];

  let state = EditorState.create({
    doc: initialDoc,
    extensions: baseExtensions,
  });

  const view = new EditorView({ state, parent });

  function setVimEnabled(next) {
    if (next === vimEnabled) return;
    vimEnabled = next;

    const exts = [...baseExtensions, ...(vimEnabled ? [vim()] : [])];
    const newState = EditorState.create({
      doc: view.state.doc.toString(),
      selection: view.state.selection,
      extensions: exts,
    });
    view.setState(newState);
    view.focus();
  }

  return {
    view,
    getValue: () => view.state.doc.toString(),
    setValue: (text) => {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: text },
      });
    },
    setVimEnabled,
    isVimEnabled: () => vimEnabled,
  };
}
