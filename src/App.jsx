import { useState, useRef } from "react";

const COLORS = {
  purple: { bg: "#EEEDFE", border: "#AFA9EC", btn: "#7F77DD", text: "#26215C", sub: "#534AB7" },
  teal:   { bg: "#E1F5EE", border: "#5DCAA5", btn: "#1D9E75", text: "#04342C", sub: "#085041" },
  pink:   { bg: "#FBEAF0", border: "#ED93B1", btn: "#D4537E", text: "#4B1528", sub: "#72243E" },
  amber:  { bg: "#FAEEDA", border: "#EF9F27", btn: "#BA7517", text: "#412402", sub: "#633806" },
};

function Card({ color, label, title, sub, children }) {
  const c = COLORS[color];
  return (
    <div style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 20, padding: 22, marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: c.sub, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: c.sub, marginBottom: 16 }}>{sub}</div>
      {children}
    </div>
  );
}

function Btn({ color, onClick, children, outline, disabled }) {
  const c = COLORS[color] || COLORS.purple;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "10px 20px", borderRadius: 999, fontSize: 13, fontWeight: 800,
      border: outline ? `1.5px solid ${c.border}` : "none",
      background: outline ? "#fff" : c.btn,
      color: outline ? c.sub : "#fff",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      marginRight: 8, marginBottom: 6,
    }}>
      {children}
    </button>
  );
}

function Pill({ bg, text, children }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800, background: bg, color: text, marginRight: 6 }}>
      {children}
    </span>
  );
}

function StateBar({ type, children }) {
  const styles = {
    loading: { background: "#FAEEDA", color: "#633806" },
    success: { background: "#E1F5EE", color: "#085041" },
    error:   { background: "#FCEBEB", color: "#791F1F" },
    info:    { background: "#EEEDFE", color: "#534AB7" },
  };
  return (
    <div style={{ ...styles[type], borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
      {children}
    </div>
  );
}

function CopyBlock({ platform, caption, hashtags, color, emoji }) {
  const [copied, setCopied] = useState(false);
  const full = `${caption}\n\n${hashtags}`;

  function copy() {
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const c = COLORS[color];
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${c.border}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{emoji}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: c.text }}>{platform}</span>
        </div>
        <button onClick={copy} style={{
          background: copied ? COLORS.teal.btn : c.btn,
          color: "#fff", border: "none", borderRadius: 999,
          padding: "6px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer",
          transition: "background .2s",
        }}>
          {copied ? "✅ Copied!" : "Copy"}
        </button>
      </div>
      <div style={{ fontSize: 12, color: "#444", lineHeight: 1.7, marginBottom: 8, whiteSpace: "pre-wrap" }}>{caption}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: c.sub }}>{hashtags}</div>
    </div>
  );
}

async function generateWithAI(fileNames) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("NO_KEY");

  const prompt = `You are a social media expert. Generate content for a creator who uploaded: ${fileNames.join(", ")}.

Return ONLY a valid JSON array with exactly 2 objects — one for TikTok, one for Instagram. No markdown, no explanation. Each object must have:
- platform: "TikTok" or "Instagram"
- caption: engaging caption text (1-3 sentences, platform-appropriate tone)
- hashtags: space-separated hashtags string (5-8 hashtags)

TikTok: punchy, hook-first, trend-aware. Instagram: slightly longer, storytelling, aesthetic.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) throw new Error("API_ERROR");
  const data = await response.json();
  const text = data.content.map(b => b.text || "").join("");
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

const FALLBACK = [
  { platform: "TikTok", caption: "POV: you just found the app that makes content for you. No more staring at a blank caption. No more guessing hashtags.", hashtags: "#contentcreator #aitools #tiktokgrowth #4you #creatortips" },
  { platform: "Instagram", caption: "Creating content used to take hours. Now it takes seconds. I let AI do the heavy lifting so I can focus on showing up.", hashtags: "#contentcreation #instagramgrowth #aitools #4youapp #reels" },
];

export default function App() {
  const [files, setFiles] = useState([]);
  const [genState, setGenState] = useState(null);
  const [versions, setVersions] = useState([]);
  const [isDemo, setIsDemo] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef();

  function handleFiles(newFiles) {
    setFiles(prev => [...prev, ...Array.from(newFiles).map(f => f.name)]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  async function goGenerate() {
    if (files.length === 0) return;
    setGenState("loading");
    setIsDemo(false);
    try {
      const result = await generateWithAI(files);
      setVersions(result);
      setGenState("done");
    } catch (err) {
      setVersions(FALLBACK);
      setGenState("done");
      if (err.message === "NO_KEY") setIsDemo(true);
    }
  }

  async function regenerate() {
    setGenState("loading");
    try {
      const result = await generateWithAI(files);
      setVersions(result);
      setGenState("done");
      setIsDemo(false);
    } catch {
      setVersions(FALLBACK);
      setGenState("done");
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px 16px 40px", fontFamily: "'Nunito', sans-serif" }}>

      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, marginBottom: 24, paddingTop: 8 }}>
        {"4you".split("").map((ch, i) => (
          <span key={i} style={{ color: [COLORS.purple.btn, COLORS.teal.btn, COLORS.pink.btn, COLORS.amber.btn][i] }}>{ch}</span>
        ))}
      </div>

      {/* Step 1 — Upload */}
      <Card color="purple" label="Step 1 — Upload" title="Drop your content here" sub="Photos and videos. The more you give, the more we can make.">
        <div
          onClick={() => fileInputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragging ? COLORS.purple.btn : COLORS.purple.border}`,
            borderRadius: 14, padding: 32, textAlign: "center",
            background: dragging ? COLORS.purple.bg : "#fff",
            cursor: "pointer", transition: "all .2s",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>☁️</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.purple.sub }}>
            {dragging ? "Drop it like it's hot" : files.length ? "Tap to add more" : "Tap to upload"}
          </div>
          <div style={{ fontSize: 11, color: COLORS.purple.btn, marginTop: 4 }}>or drag and drop</div>
        </div>
        <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" style={{ display: "none" }}
          onChange={e => handleFiles(e.target.files)} />

        {files.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {files.map((f, i) => (
              <span key={i} style={{ background: "#CECBF6", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "#26215C", display: "flex", alignItems: "center", gap: 6 }}>
                📎 {f}
                <span style={{ cursor: "pointer" }} onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}>✕</span>
              </span>
            ))}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <Btn color="purple" onClick={goGenerate} disabled={files.length === 0}>✨ Generate captions</Btn>
        </div>
      </Card>

      {/* Step 2 — Generated captions */}
      {genState && (
        <Card color="teal" label="Step 2 — Your captions" title="Ready to post" sub="Copy each caption and paste it directly into TikTok or Instagram.">
          {genState === "loading" && <StateBar type="loading">⏳ Writing your captions…</StateBar>}
          {genState === "done" && (
            <>
              {isDemo && <StateBar type="info">💡 Demo mode — add your Anthropic API key for real AI captions.</StateBar>}

              {versions.map((v, i) => (
                <CopyBlock
                  key={i}
                  platform={v.platform}
                  caption={v.caption}
                  hashtags={v.hashtags}
                  color={v.platform === "TikTok" ? "purple" : "pink"}
                  emoji={v.platform === "TikTok" ? "🎵" : "📸"}
                />
              ))}

              <Btn color="teal" outline onClick={regenerate}>🔁 Remix again</Btn>
            </>
          )}
        </Card>
      )}

      {/* Step 3 — Post instructions */}
      {genState === "done" && (
        <Card color="pink" label="Step 3 — Post it" title="Open your app & paste" sub="Direct posting coming soon. For now, copy above and paste in the app.">
          {[
            { emoji: "🎵", name: "TikTok", steps: ["Open TikTok → tap +", "Upload your video/photo", "Paste your caption in the description", "Hit Post"] },
            { emoji: "📸", name: "Instagram", steps: ["Open Instagram → tap +", "Choose Reel or Post", "Paste your caption", "Add hashtags → Share"] },
          ].map(p => (
            <div key={p.name} style={{ background: "#fff", border: `1.5px solid ${COLORS.pink.border}`, borderRadius: 14, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.pink.text, marginBottom: 8 }}>{p.emoji} {p.name}</div>
              {p.steps.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ background: COLORS.pink.border, color: COLORS.pink.text, borderRadius: 999, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: 12, color: COLORS.pink.sub, lineHeight: 1.5 }}>{s}</span>
                </div>
              ))}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
