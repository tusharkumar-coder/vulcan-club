"use client";

import { useMemo, useState } from "react";
import { Code2, RotateCcw, Play } from "lucide-react";

const starterCode = {
  html: `<section class="hello-card">
  <p class="eyebrow">VULCAN / PLAYGROUND</p>
  <h1>Hello, builder.</h1>
  <button id="build-button">Make it glow</button>
  <p id="output" aria-live="polite"></p>
</section>`,
  css: `:root { color-scheme: dark; font-family: system-ui, sans-serif; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b1422; color: #eaf5ff; }
.hello-card { width: min(360px, 84vw); padding: 28px; border: 1px solid #28435d; border-radius: 18px; background: linear-gradient(145deg, #15243a, #0d1727); }
.eyebrow { color: #67d9ee; font: 11px monospace; letter-spacing: .12em; }
h1 { margin: 10px 0 22px; font-size: 28px; }
button { padding: 10px 14px; border: 0; border-radius: 8px; background: #67d9ee; color: #07111b; font-weight: 700; cursor: pointer; }
#output { min-height: 24px; color: #a8e6c5; }`,
  javascript: `document.querySelector("#build-button")?.addEventListener("click", () => {
  document.querySelector("#output").textContent = "Nice work — you made this!";
});`,
};

type EditorCode = typeof starterCode;
type EditorTab = keyof EditorCode;

const editorTabs: { id: EditorTab; label: string }[] = [
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "javascript", label: "JavaScript" },
];

function createPreview(code: EditorCode) {
  const safeCss = code.css.replace(/<\/style/gi, "<\\/style");
  const safeJavaScript = code.javascript.replace(/<\/script/gi, "<\\/script");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>${safeCss}</style>
  </head>
  <body>
    ${code.html}
    <script>${safeJavaScript}</script>
  </body>
</html>`;
}

export function LiveCodeEditor() {
  const [activeTab, setActiveTab] = useState<EditorTab>("html");
  const [code, setCode] = useState<EditorCode>(starterCode);
  const [previewCode, setPreviewCode] = useState<EditorCode>(starterCode);
  const [hasRun, setHasRun] = useState(false);
  const preview = useMemo(() => createPreview(previewCode), [previewCode]);

  const runCode = () => {
    setPreviewCode({ ...code });
    setHasRun(true);
  };
  const resetCode = () => {
    setCode(starterCode);
    setPreviewCode(starterCode);
    setActiveTab("html");
    setHasRun(false);
  };

  return (
    <section className="home-feed-card live-editor" aria-labelledby="live-editor-title">
      <div className="home-module-heading">
        <div>
          <div className="eyebrow mono">Build / 01</div>
          <h2 className="home-module-title" id="live-editor-title">
            <Code2 size={20} aria-hidden="true" /> Live Code Editor
          </h2>
        </div>
        <button className="editor-reset" type="button" onClick={resetCode}>
          <RotateCcw size={13} /> Reset
        </button>
      </div>
      <p className="home-module-copy">
        Write HTML, CSS, and JavaScript, then run it in an isolated preview.
      </p>

      <div className="editor-tabs" role="tablist" aria-label="Editor language">
        {editorTabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            aria-controls="editor-tabpanel"
            className="editor-tab"
            id={`editor-tab-${tab.id}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        aria-labelledby={`editor-tab-${activeTab}`}
        className="editor-input-wrap"
        id="editor-tabpanel"
        role="tabpanel"
      >
        <label className="sr-only" htmlFor="live-code-input">
          {activeTab.toUpperCase()} code
        </label>
        <textarea
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="editor-input"
          id="live-code-input"
          onChange={(event) =>
            setCode((current) => ({ ...current, [activeTab]: event.target.value }))
          }
          spellCheck={false}
          value={code[activeTab]}
        />
      </div>
      <div className="editor-actions">
        <button className="button editor-run" type="button" onClick={runCode}>
          <Play size={13} fill="currentColor" /> Run Code
        </button>
        <span className="editor-status" aria-live="polite">
          {hasRun ? "Preview updated" : "Ready to run"}
        </span>
      </div>
      <div className="editor-preview-frame">
        <div className="editor-preview-bar">
          <span>Live preview</span>
          <span className="editor-preview-dots" aria-hidden="true">
            ● ● ●
          </span>
        </div>
        <iframe
          className="editor-preview"
          sandbox="allow-scripts"
          srcDoc={preview}
          title="Live code preview"
        />
      </div>
    </section>
  );
}
