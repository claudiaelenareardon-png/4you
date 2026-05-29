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
    <div style={{
      background: c.bg, border: `1.5px solid ${c.border}`,
      borderRadius: 20, padding: 22, marginBottom: 16,
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: c.sub, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: c.sub, marginBottom: 16 }}>{sub}</div>
      {children}
    </div>
  );
}

function Btn({ color, onClick, children, outline }) {
  const c = COLORS[color] || COLORS.purple;
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "10px 20px", borderRadius: 999, fontSize: 13, fontWeight: 800,
      border: outline ? `1.5px solid ${c.border}` : "none",
      background: outline ? "#fff" : c.btn,
      color: outline ? c.sub : "#fff",
      cursor: "pointer", marginRight: 8, marginBottom: 6,
    }}>
      {children}
    </button>
  );
}

function Pill({ bg, text, children }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 999,
      fontSize: 10, fontWeight: 800, background: bg, color: text, marginRight: 6,
    }}>{children}</span>
  );
}

function StateBar({ type, children }) {
  const styles = {
    loading: { background: "#FAEEDA", color: "#633806" },
    success: { background: "#E1F5EE", color: "#085041" },
    error:   { background: "#FCEBEB", color: "#791F1F" },
  };
  return (
    <div style={{
      ...styles[type], borderRadius: 10, padding: "10px 14px",
      fontSize: 13, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 8,
    }}>{children}</div>
  );
}

const GENERATED_VERSIONS = [
  {
    platforms: ["TikTok"],
    title: "Version 1 — Hook style",
    caption: "POV: you just found the app that makes content for you. No more staring at a blank caption. No more guessing hashtags.",
    hashtags: "#contentcreator #aitools #tiktokgrowth #4you #creatortips",
  },
  {
    platforms: ["Instagram"],
    title: "Version 2 — Storytelling",
    caption: "Creating content used to take me hours. Now it takes seconds. Here's what changed — I let AI do the heavy lifting so I can focus on showing up.",
    hashtags: "#contentcreation #instagramgrowth #aitools #4youapp #reels",
  },
  {
    platforms: ["TikTok", "Instagram"],
    title: "Version 3 — Bold & short",
    caption: "Less editing. More posting. Let's go.",
    hashtags: "#lesseditmorep #4you #contentcreator #viral",
  },
];

export default function App() {
  const [files, setFiles] = useState([]);
  const [genState, setGenState] = useState(null); // null | "loading" | "done"
  const [publishVisible, setPublishVisible] = useState(false);
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [igConnected, setIgConnected] = useState(false);
  const [postState, setPostState] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef();

  function handleFiles(newFiles) {
    const added = Array.from(newFiles).map(f => f.name);
    setFiles(prev => [...prev, ...added]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function goGenerate() {
    if (files.length === 0) return;
    setGenState("loading");
    setTimeout(() => setGenState("done"), 2200);
  }

  function regenerate() {
    setGenState("loading");
    setTimeout(() => setGenState("done"), 1600);
  }

  function goPublish() {
    setPublishVisible(true);
    setTimeout(() => document.getElementById("publishCard")?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function postNow() {
    if (!tiktokConnected && !igConnected) {
      setPostState("error");
      return;
    }
    setPostState("loading");
    setTimeout(() => setPostState("success"), 2000);
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px 16px 40px", fontFamily: "'Nunito', sans-serif" }}>

      {/* Logo */}
      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, marginBottom: 24, paddingTop: 8 }}>
        {"4you".split("").map((ch, i) => (
          <span key={i} style={{ color: [COLORS.purple.btn, COLORS.teal.btn, COLORS.pink.btn, COLORS.amber.btn][i] }}>{ch}</span>
        ))}
      </div>

      {/* Upload */}
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
              <span key={i} style={{
                background: "#CECBF6", borderRadius: 999, padding: "4px 12px",
                fontSize: 12, fontWeight: 700, color: "#26215C",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                📎 {f}
                <span style={{ cursor: "pointer", color: COLORS.purple.sub }}
                  onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}>✕</span>
              </span>
            ))}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <Btn color="purple" onClick={goGenerate}>✨ Generate versions</Btn>
        </div>
        {files.length === 0 && genState !== null && (
          <StateBar type="error">Upload at least one file first.</StateBar>
        )}
      </Card>

      {/* Generate */}
      {genState && (
        <Card color="teal" label="Step 2 — Generate" title="Your content, remixed" sub="AI is writing captions, hashtags, and formatting for both platforms.">
          {genState === "loading" && <StateBar type="loading">⏳ Making magic…</StateBar>}
          {genState === "done" && (
            <>
              {GENERATED_VERSIONS.map((v, i) => (
                <div key={i} style={{
                  background: "#fff", borderRadius: 14, padding: 14,
                  marginBottom: 10, border: "1px solid #e8e8e8",
                }}>
                  <div style={{ marginBottom: 6 }}>
                    {v.platforms.map(p => (
                      <Pill key={p} bg={p === "TikTok" ? "#AFA9EC" : "#ED93B1"} text={p === "TikTok" ? "#26215C" : "#4B1528"}>{p}</Pill>
                    ))}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#04342C", marginBottom: 6 }}>{v.title}</div>
                  <div style={{ fontSize: 12, color: "#085041", lineHeight: 1.6, marginBottom: 8 }}>{v.caption}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.teal.btn }}>{v.hashtags}</div>
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <Btn color="teal" onClick={goPublish}>🚀 Pick & publish</Btn>
                <Btn color="teal" outline onClick={regenerate}>🔁 Remix again</Btn>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Publish */}
      {publishVisible && (
        <Card id="publishCard" color="pink" label="Step 3 — Publish" title="Send it live" sub="Post straight to TikTok or Instagram — no downloading, no tab-switching.">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            {[
              { key: "tiktok", label: "TikTok", connected: tiktokConnected, setConnected: setTiktokConnected, color: "purple", emoji: "🎵" },
              { key: "ig", label: "Instagram", connected: igConnected, setConnected: setIgConnected, color: "pink", emoji: "📸" },
            ].map(p => (
              <div key={p.key} style={{
                flex: 1, minWidth: 130, background: p.connected ? COLORS.teal.bg : "#fff",
                border: `1.5px solid ${p.connected ? COLORS.teal.border : COLORS.pink.border}`,
                borderRadius: 14, padding: 14, textAlign: "center",
              }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{p.connected ? "✅" : p.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: p.connected ? COLORS.teal.text : COLORS.pink.text, marginBottom: 8 }}>{p.label}</div>
                {p.connected
                  ? <div style={{ fontSize: 11, color: COLORS.teal.sub, fontWeight: 700 }}>Connected</div>
                  : <Btn color={p.color} onClick={() => p.setConnected(true)}>Connect</Btn>
                }
              </div>
            ))}
          </div>

          {postState === "loading" && <StateBar type="loading">⏳ Posting…</StateBar>}
          {postState === "success" && <StateBar type="success">🎉 You're live! Watch the likes roll in.</StateBar>}
          {postState === "error" && <StateBar type="error">Connect at least one account first.</StateBar>}

          {postState !== "success" && (
            <Btn color="pink" onClick={postNow}>🚀 Post now</Btn>
          )}
        </Card>
      )}
    </div>
  );
}
