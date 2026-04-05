import { useState, useEffect, useRef } from "react";

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

const now = new Date();
const WEEK = getWeekNumber(now);
const YEAR = now.getFullYear();

const INITIAL_STATE = {
  week: WEEK,
  year: YEAR,
  adminPin: "0000",
  appIcon: "\u23F3\u{1F3AE}",
  appIconType: "emoji",
  archive: [],
  users: [
    { id: "1", name: "Eda", avatar: "\u{1F60A}", avatarType: "emoji", pin: "1234", slots: 10, played: [] },
    { id: "2", name: "Vilda", avatar: "\u{1F30D}", avatarType: "emoji", pin: "5678", slots: 8, played: [] },
  ],
};

const AVATARS = [
  "\u{1F60A}","\u{1F60E}","\u{1F913}","\u{1F63A}","\u{1F436}",
  "\u{1F438}","\u{1F98A}","\u{1F43B}","\u{1F30D}","\u2B50",
  "\u{1F3AE}","\u{1F3C0}","\u{1F3B8}","\u{1F680}","\u{1F916}",
  "\u{1F47E}","\u{1F984}","\u{1F432}","\u{1F3AF}","\u{1F3C6}",
];

const APP_ICONS = [
  "\u23F3\u{1F3AE}", "\u{1F3AE}", "\u23F3", "\u{1F579}\uFE0F",
  "\u{1F4F1}", "\u{1F551}", "\u{1F527}", "\u2B50",
];

const F = "'Fredoka', sans-serif";
const N = "'Nunito', sans-serif";

const backBtn = {
  background: "none", border: "none", fontSize: 16,
  color: "#64748b", cursor: "pointer", marginBottom: 12, fontFamily: N,
};
const inp = {
  padding: "10px 14px", borderRadius: 12, border: "2px solid #e2e8f0",
  fontFamily: N, fontSize: 15, width: "100%", boxSizing: "border-box", outline: "none",
};
const lbl = {
  fontSize: 13, fontWeight: 700, color: "#64748b", fontFamily: N, marginBottom: 4, display: "block",
};

/* ---- Avatar renderer ---- */
function Avatar({ src, type, size }) {
  if (type === "image") {
    return (
      <img src={src} alt="" style={{
        width: size, height: size, borderRadius: "50%", objectFit: "cover",
        border: "2px solid #e2e8f0", display: "block", margin: "0 auto",
      }} />
    );
  }
  return <span style={{ fontSize: size * 0.75, lineHeight: 1, display: "block", textAlign: "center" }}>{src}</span>;
}

/* ---- File to base64 helper ---- */
function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

/* ========== PIN PAD ========== */
function PinPad({ label, icon, iconType, hint, correctPin, onOk, onBack }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const press = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next); setErr(false);
    if (next.length === 4) {
      if (next === correctPin) setTimeout(onOk, 150);
      else { setErr(true); setTimeout(() => { setPin(""); setErr(false); }, 800); }
    }
  };
  return (
    <div style={{ textAlign: "center" }}>
      <button onClick={onBack} style={backBtn}>{"\u2190 Zp\u011bt"}</button>
      <div style={{ marginBottom: 8 }}>
        <Avatar src={icon} type={iconType || "emoji"} size={64} />
      </div>
      <div style={{ fontFamily: F, fontSize: 24, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>{label}</div>
      {hint && <div style={{ fontFamily: N, fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>{hint}</div>}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 20, height: 20, borderRadius: "50%",
            background: i < pin.length ? (err ? "#ef4444" : "#22c55e") : "#e2e8f0",
            transition: "all 0.2s",
          }} />
        ))}
      </div>
      {err && <div style={{ color: "#ef4444", fontSize: 14, marginBottom: 12, fontFamily: N }}>{"\u0160patn\u00fd PIN!"}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 60px)", gap: 10, justifyContent: "center" }}>
        {[1,2,3,4,5,6,7,8,9,null,0,null].map((n, i) =>
          n !== null ? (
            <button key={i} onClick={() => press(String(n))} style={{
              width: 60, height: 60, borderRadius: 16,
              border: "2px solid #e2e8f0", background: "white",
              fontSize: 24, fontFamily: F, fontWeight: 600,
              cursor: "pointer", color: "#334155",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            }}>{n}</button>
          ) : <div key={i} />
        )}
      </div>
    </div>
  );
}

/* ========== HOME: USER CARDS ========== */
function UserCard({ user, onSelect }) {
  const rem = user.slots - user.played.length;
  const done = rem <= 0;
  return (
    <button onClick={onSelect} style={{
      background: done
        ? "linear-gradient(135deg, #fef2f2, #fee2e2)"
        : "linear-gradient(135deg, #f0fdf4, #dcfce7)",
      border: done ? "2px solid #fca5a5" : "2px solid #86efac",
      borderRadius: 20, padding: "20px 12px", cursor: "pointer",
      textAlign: "center", minWidth: 0, flex: "1 1 0",
      transition: "all 0.2s ease",
      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    }}>
      <div style={{ marginBottom: 8 }}>
        <Avatar src={user.avatar} type={user.avatarType || "emoji"} size={48} />
      </div>
      <div style={{ fontFamily: F, fontSize: 18, fontWeight: 600, color: "#1e293b" }}>{user.name}</div>
      <div style={{ marginTop: 6, fontSize: 12, fontWeight: 500, color: done ? "#dc2626" : "#16a34a", fontFamily: N }}>
        {done ? "\u{1F6AB} Odehr\u00e1no" : "\u23F3 " + rem * 30 + " min"}
      </div>
    </button>
  );
}

/* ========== PLAYER VIEW ========== */
function PlayerView({ user, allUsers, week, appIcon, appIconType, onToggle, onBack, onHistory }) {
  const myRem = user.slots - user.played.length;
  const myDone = myRem <= 0;

  return (
    <div>
      <button onClick={onBack} style={backBtn}>{"\u2190 Odhl\u00e1sit se"}</button>

      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.85)", borderRadius: 20,
        padding: "14px 18px", boxShadow: "0 4px 15px rgba(0,0,0,0.06)", marginBottom: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {appIconType === "image"
              ? <img src={appIcon} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }} />
              : <span style={{ fontSize: 22 }}>{appIcon}</span>
            }
            <span style={{ fontFamily: F, fontSize: 20, fontWeight: 700, color: "#1e293b" }}>
              {"\u010cas na hran\u00ed"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              background: "#f1f5f9", borderRadius: 10, padding: "4px 12px",
              fontFamily: N, fontSize: 13, fontWeight: 700, color: "#64748b",
            }}>
              {"t\u00fdden: " + week}
            </div>
            <button onClick={onHistory} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: N, fontSize: 13, fontWeight: 700, color: "#3b82f6",
              padding: 0, textDecoration: "underline",
            }}>{"historie"}</button>
          </div>
        </div>
      </div>

      {/* All users side by side — profile + slots in ONE box per user */}
      <div style={{
        display: "flex", gap: 12,
        overflowX: "auto", WebkitOverflowScrolling: "touch",
      }}>
        {allUsers.map(u => {
          const isMe = u.id === user.id;
          const rem = u.slots - u.played.length;
          const done = rem <= 0;
          return (
            <div key={u.id} style={{
              flex: "1 1 0", minWidth: 120,
              background: isMe
                ? "linear-gradient(135deg, #eff6ff, #e0f2fe)"
                : "rgba(255,255,255,0.85)",
              borderRadius: 20, padding: "16px 12px",
              border: isMe ? "2px solid #93c5fd" : "2px solid #f1f5f9",
              boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
              overflow: "hidden",
              position: "relative",
              textAlign: "center",
            }}>
              {isMe && (
                <div style={{
                  position: "absolute", top: 8, right: 8,
                  background: "#3b82f6", color: "white", fontSize: 10,
                  fontFamily: N, fontWeight: 800, padding: "2px 8px", borderRadius: 8,
                }}>TY</div>
              )}

              {/* Profile section */}
              <Avatar src={u.avatar} type={u.avatarType || "emoji"} size={40} />
              <div style={{ fontFamily: F, fontSize: 16, fontWeight: 600, color: "#1e293b", marginTop: 6 }}>
                {u.name}
              </div>
              <div style={{
                fontSize: 12, fontFamily: N, fontWeight: 700, marginTop: 2, marginBottom: 12,
                color: done ? "#dc2626" : "#16a34a",
              }}>
                {done ? "\u{1F6AB} 0 min" : "\u23F3 " + rem * 30 + " min"}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: isMe ? "#bfdbfe" : "#e2e8f0", marginBottom: 12 }} />

              {/* Slot grid */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(2, 28px)",
                gap: 5, justifyContent: "center",
              }}>
                {Array.from({ length: u.slots }, (_, i) => {
                  const played = u.played.includes(i);
                  return (
                    <button key={i}
                      onClick={() => isMe && onToggle(i)}
                      disabled={!isMe}
                      style={{
                        width: 28, height: 28, borderRadius: 7,
                        border: played ? "2px solid #4ade80"
                          : isMe ? "2px dashed #93c5fd" : "2px dashed #d1d5db",
                        background: played
                          ? "linear-gradient(135deg, #22c55e, #4ade80)"
                          : isMe ? "rgba(255,255,255,0.9)" : "rgba(241,245,249,0.8)",
                        cursor: isMe ? "pointer" : "default",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, color: "white",
                        transition: "all 0.15s ease",
                        boxShadow: played ? "0 1px 4px rgba(34,197,94,0.25)" : "none",
                        opacity: !isMe && !played ? 0.5 : 1,
                        padding: 0,
                      }}
                    >
                      {played ? "\u2713" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Help text */}
      <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "#94a3b8", fontFamily: N }}>
        {"Klikni na sv\u016fj slot = 30 minut odehr\u00e1no"}
      </div>

      {myDone && (
        <div style={{
          marginTop: 14, padding: 14, borderRadius: 14,
          background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
          textAlign: "center", fontFamily: N, fontSize: 14, color: "#991b1b", fontWeight: 600,
        }}>
          {"\u{1F3AE} V\u0161echny tv\u00e9 sloty odehr\u00e1ny! Nov\u00e9 v ned\u011bli ve 20:00."}
        </div>
      )}
    </div>
  );
}

/* ========== AVATAR PICKER (emoji + image upload) ========== */
function AvatarPicker({ current, currentType, onSelect }) {
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    onSelect(base64, "image");
  };

  return (
    <div>
      <label style={lbl}>Avatar</label>
      {/* Current preview */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Avatar src={current} type={currentType || "emoji"} size={48} />
        <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: N }}>
          {currentType === "image" ? "Vlastn\u00ed obr\u00e1zek" : "Emoji"}
        </span>
      </div>
      {/* Emoji grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
        {AVATARS.map(a => (
          <button key={a} onClick={() => onSelect(a, "emoji")} style={{
            width: 34, height: 34, borderRadius: 9,
            border: currentType === "emoji" && a === current ? "2px solid #3b82f6" : "2px solid #e2e8f0",
            background: currentType === "emoji" && a === current ? "#eff6ff" : "white",
            fontSize: 18, cursor: "pointer", padding: 0,
          }}>{a}</button>
        ))}
      </div>
      {/* Upload button */}
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp"
        style={{ display: "none" }} onChange={handleFile} />
      <button onClick={() => fileRef.current?.click()} style={{
        padding: "8px 14px", borderRadius: 10,
        border: "2px dashed #cbd5e1", background: "white",
        cursor: "pointer", fontFamily: N, fontSize: 13, fontWeight: 600, color: "#64748b",
        width: "100%",
      }}>
        {"\u{1F4F7} Nahr\u00e1t vlastn\u00ed obr\u00e1zek"}
      </button>
    </div>
  );
}

/* ========== ADMIN PANEL ========== */
function AdminPanel({ state, setState, onBack }) {
  const [editId, setEditId] = useState(null);
  const [addName, setAddName] = useState("");
  const [addPin, setAddPin] = useState("");
  const [addSlots, setAddSlots] = useState(10);
  const [addAvatar, setAddAvatar] = useState("\u{1F60A}");
  const [addAvatarType, setAddAvatarType] = useState("emoji");
  const [showArchive, setShowArchive] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showAppIcon, setShowAppIcon] = useState(false);
  const appIconFileRef = useRef(null);

  const upd = (id, patch) => {
    setState(p => ({ ...p, users: p.users.map(u => u.id === id ? { ...u, ...patch } : u) }));
  };
  const del = (id) => {
    setState(p => ({ ...p, users: p.users.filter(u => u.id !== id) }));
    setEditId(null);
  };
  const add = () => {
    if (!addName.trim()) return;
    setState(p => ({
      ...p,
      users: [...p.users, {
        id: String(Date.now()), name: addName.trim(),
        avatar: addAvatar, avatarType: addAvatarType,
        pin: addPin || "0000", slots: addSlots, played: [],
      }],
    }));
    setAddName(""); setAddPin(""); setAddSlots(10);
    setAddAvatar("\u{1F60A}"); setAddAvatarType("emoji"); setShowAdd(false);
  };

  const handleAppIconFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setState(p => ({ ...p, appIcon: base64, appIconType: "image" }));
  };

  return (
    <div>
      <button onClick={onBack} style={backBtn}>{"\u2190 Zp\u011bt"}</button>
      <h2 style={{ fontFamily: F, fontSize: 24, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>
        {"\u{1F527} Admin Panel"}
      </h2>

      {/* App icon settings */}
      <div style={{
        background: "rgba(255,255,255,0.85)", borderRadius: 16, padding: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 16,
      }}>
        <button onClick={() => setShowAppIcon(!showAppIcon)} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: N, fontSize: 15, fontWeight: 700, color: "#475569",
          display: "flex", alignItems: "center", gap: 8, width: "100%",
          padding: 0,
        }}>
          {state.appIconType === "image"
            ? <img src={state.appIcon} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }} />
            : <span style={{ fontSize: 22 }}>{state.appIcon}</span>
          }
          {"Ikona aplikace " + (showAppIcon ? "\u25B2" : "\u25BC")}
        </button>
        {showAppIcon && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {APP_ICONS.map(ic => (
                <button key={ic} onClick={() => setState(p => ({ ...p, appIcon: ic, appIconType: "emoji" }))} style={{
                  width: 40, height: 40, borderRadius: 10,
                  border: state.appIconType === "emoji" && state.appIcon === ic ? "2px solid #3b82f6" : "2px solid #e2e8f0",
                  background: state.appIconType === "emoji" && state.appIcon === ic ? "#eff6ff" : "white",
                  fontSize: 22, cursor: "pointer", padding: 0,
                }}>{ic}</button>
              ))}
            </div>
            <input ref={appIconFileRef} type="file" accept="image/png,image/jpeg,image/webp"
              style={{ display: "none" }} onChange={handleAppIconFile} />
            <button onClick={() => appIconFileRef.current?.click()} style={{
              padding: "8px 14px", borderRadius: 10,
              border: "2px dashed #cbd5e1", background: "white",
              cursor: "pointer", fontFamily: N, fontSize: 13, fontWeight: 600, color: "#64748b",
              width: "100%",
            }}>
              {"\u{1F4F7} Nahr\u00e1t vlastn\u00ed ikonu"}
            </button>
          </div>
        )}
      </div>

      {/* User list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {state.users.map(u => (
          <div key={u.id} style={{
            background: "rgba(255,255,255,0.85)", borderRadius: 16, padding: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
            {editId === u.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={lbl}>{"Jm\u00e9no"}</label>
                  <input style={inp} value={u.name} onChange={e => upd(u.id, { name: e.target.value })} />
                </div>
                <div>
                  <label style={lbl}>PIN</label>
                  <input style={inp} value={u.pin} maxLength={4}
                    onChange={e => upd(u.id, { pin: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
                </div>
                <div>
                  <label style={lbl}>{"Po\u010det slot\u016f (\u00d7 30 min)"}</label>
                  <input type="number" style={inp} value={u.slots} min={1} max={30}
                    onChange={e => upd(u.id, { slots: Math.max(1, Math.min(30, parseInt(e.target.value) || 1)) })} />
                </div>
                <AvatarPicker current={u.avatar} currentType={u.avatarType}
                  onSelect={(val, type) => upd(u.id, { avatar: val, avatarType: type })} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditId(null)} style={{
                    flex: 1, padding: 10, borderRadius: 12, border: "none",
                    background: "#3b82f6", color: "white", fontFamily: N,
                    fontWeight: 700, cursor: "pointer", fontSize: 14,
                  }}>{"\u2713 Hotovo"}</button>
                  <button onClick={() => del(u.id)} style={{
                    padding: "10px 16px", borderRadius: 12, border: "none",
                    background: "#fee2e2", color: "#dc2626", fontFamily: N,
                    fontWeight: 700, cursor: "pointer", fontSize: 14,
                  }}>{"\u{1F5D1}"}</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar src={u.avatar} type={u.avatarType || "emoji"} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: F, fontSize: 18, fontWeight: 600, color: "#1e293b" }}>{u.name}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: N }}>
                    {"PIN: " + u.pin + " \u00b7 " + u.slots + " slot\u016f \u00b7 Odehr\u00e1no: " + u.played.length}
                  </div>
                </div>
                <button onClick={() => setEditId(u.id)} style={{
                  padding: "8px 14px", borderRadius: 10, border: "2px solid #e2e8f0",
                  background: "white", cursor: "pointer", fontSize: 14,
                  fontFamily: N, fontWeight: 600,
                }}>{"\u270f\ufe0f"}</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add user */}
      {showAdd ? (
        <div style={{
          background: "rgba(255,255,255,0.85)", borderRadius: 16, padding: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 24,
        }}>
          <h3 style={{ fontFamily: F, fontSize: 18, color: "#1e293b", marginBottom: 12 }}>
            {"Nov\u00fd u\u017eivatel"}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={lbl}>{"Jm\u00e9no"}</label>
              <input style={inp} value={addName} onChange={e => setAddName(e.target.value)}
                placeholder={"Jm\u00e9no d\u00edt\u011bte"} />
            </div>
            <div>
              <label style={lbl}>{"PIN (4 \u010d\u00edslice)"}</label>
              <input style={inp} value={addPin} maxLength={4}
                onChange={e => setAddPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="0000" />
            </div>
            <div>
              <label style={lbl}>{"Po\u010det slot\u016f (\u00d7 30 min)"}</label>
              <input type="number" style={inp} value={addSlots} min={1} max={30}
                onChange={e => setAddSlots(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))} />
            </div>
            <AvatarPicker current={addAvatar} currentType={addAvatarType}
              onSelect={(val, type) => { setAddAvatar(val); setAddAvatarType(type); }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={add} style={{
                flex: 1, padding: 12, borderRadius: 12, border: "none",
                background: "#22c55e", color: "white", fontFamily: N,
                fontWeight: 700, cursor: "pointer", fontSize: 15,
              }}>{"+ P\u0159idat"}</button>
              <button onClick={() => setShowAdd(false)} style={{
                padding: "12px 20px", borderRadius: 12, border: "2px solid #e2e8f0",
                background: "white", fontFamily: N, fontWeight: 600,
                cursor: "pointer", fontSize: 14, color: "#64748b",
              }}>{"Zru\u0161it"}</button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} style={{
          width: "100%", padding: 14, borderRadius: 14, border: "2px dashed #cbd5e1",
          background: "transparent", cursor: "pointer", fontFamily: N,
          fontSize: 15, fontWeight: 700, color: "#64748b", marginBottom: 24,
        }}>{"+ P\u0159idat u\u017eivatele"}</button>
      )}

      {/* Archive */}
      <button onClick={() => setShowArchive(!showArchive)} style={{
        width: "100%", padding: 14, borderRadius: 14, border: "none",
        background: "rgba(255,255,255,0.6)", cursor: "pointer", fontFamily: N,
        fontSize: 15, fontWeight: 700, color: "#64748b",
      }}>
        {"\u{1F4E6} Archiv " + (showArchive ? "\u25B2" : "\u25BC")}
      </button>
      {showArchive && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {state.archive.length === 0 ? (
            <div style={{ textAlign: "center", color: "#94a3b8", fontFamily: N, padding: 20 }}>
              {"Zat\u00edm \u017e\u00e1dn\u00e9 z\u00e1znamy"}
            </div>
          ) : state.archive.slice().reverse().map((entry, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.7)", borderRadius: 12, padding: 14,
              fontSize: 14, fontFamily: N,
            }}>
              <div style={{ fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                {"T\u00fdden " + entry.week + " / " + entry.year}
              </div>
              {entry.users.map((u, j) => (
                <div key={j} style={{ color: "#64748b" }}>
                  {u.name + ": " + u.played.length + "/" + u.slots + " slot\u016f (" + u.played.length * 30 + " min)"}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========== HISTORY VIEW ========== */
function HistoryView({ archive, onBack }) {
  return (
    <div>
      <button onClick={onBack} style={backBtn}>{"\u2190 Zp\u011bt"}</button>
      <h2 style={{ fontFamily: F, fontSize: 24, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>
        {"\u{1F4C5} Historie"}
      </h2>
      {archive.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.85)", borderRadius: 16, padding: 30,
          textAlign: "center", color: "#94a3b8", fontFamily: N, fontSize: 15,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          {"Zat\u00edm \u017e\u00e1dn\u00e9 z\u00e1znamy. Historie se zapln\u00ed po prvn\u00edm t\u00fddenn\u00edm resetu."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {archive.slice().reverse().map((entry, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.85)", borderRadius: 16, padding: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              <div style={{
                fontFamily: F, fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 10,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span>{"T\u00fdden " + entry.week}</span>
                <span style={{
                  background: "#f1f5f9", borderRadius: 8, padding: "2px 10px",
                  fontFamily: N, fontSize: 12, fontWeight: 600, color: "#94a3b8",
                }}>{entry.year}</span>
              </div>
              {entry.users.map((u, j) => {
                const pct = u.slots > 0 ? Math.round((u.played.length / u.slots) * 100) : 0;
                return (
                  <div key={j} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 0",
                    borderTop: j > 0 ? "1px solid #f1f5f9" : "none",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: N, fontSize: 14, fontWeight: 700, color: "#334155" }}>
                        {u.name}
                      </div>
                      <div style={{ fontFamily: N, fontSize: 12, color: "#94a3b8" }}>
                        {u.played.length + "/" + u.slots + " slot\u016f \u00b7 " + u.played.length * 30 + " min"}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{
                      width: 80, height: 8, borderRadius: 4,
                      background: "#e2e8f0", overflow: "hidden",
                    }}>
                      <div style={{
                        width: pct + "%", height: "100%", borderRadius: 4,
                        background: pct >= 100
                          ? "linear-gradient(90deg, #ef4444, #f87171)"
                          : "linear-gradient(90deg, #22c55e, #4ade80)",
                      }} />
                    </div>
                    <div style={{ fontFamily: N, fontSize: 11, fontWeight: 700, color: "#94a3b8", minWidth: 32, textAlign: "right" }}>
                      {pct + "%"}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========== MAIN APP ========== */
export default function App() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem("cas-na-hrani");
      return saved ? JSON.parse(saved) : INITIAL_STATE;
    } catch {
      return INITIAL_STATE;
    }
  });
  const [screen, setScreen] = useState("home");
  const [selId, setSelId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem("cas-na-hrani", JSON.stringify(state));
    } catch {}
  }, [state]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const curUser = state.users.find(u => u.id === selId) || null;

  const toggle = (index) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id !== selId) return u;
        const played = u.played.includes(index)
          ? u.played.filter(i => i !== index)
          : [...u.played, index];
        return { ...u, played };
      }),
    }));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #e0f2fe 0%, #f0fdf4 35%, #fefce8 70%, #fce7f3 100%)",
      padding: "20px 16px", fontFamily: N,
    }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Global header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ marginBottom: 4 }}>
            {state.appIconType === "image"
              ? <img src={state.appIcon} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", display: "block", margin: "0 auto" }} />
              : <span style={{ fontSize: 36 }}>{state.appIcon}</span>
            }
          </div>
          <h1 style={{
            fontFamily: F, fontSize: 28, fontWeight: 700,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0,
          }}>{"\u010cas na hran\u00ed"}</h1>
          <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, marginTop: 4 }}>
            {"T\u00fdden " + state.week + " \u00b7 " + state.year}
          </div>
        </div>

        {screen === "home" && (
          <>
            <div style={{
              display: "flex", gap: 12, marginBottom: 24,
              overflowX: "auto", WebkitOverflowScrolling: "touch",
            }}>
              {state.users.map(u => (
                <UserCard key={u.id} user={u} onSelect={() => { setSelId(u.id); setScreen("pin"); }} />
              ))}
            </div>
            <button onClick={() => setScreen("adminPin")} style={{
              width: "100%", padding: 14, borderRadius: 14,
              border: "2px solid #e2e8f0", background: "rgba(255,255,255,0.5)",
              cursor: "pointer", fontFamily: N, fontSize: 14, fontWeight: 700, color: "#94a3b8",
            }}>{"\u{1F527} Nastaven\u00ed (rodi\u010d)"}</button>
          </>
        )}

        {screen === "pin" && curUser && (
          <PinPad label={curUser.name} icon={curUser.avatar} iconType={curUser.avatarType}
            correctPin={curUser.pin}
            onOk={() => setScreen("player")}
            onBack={() => { setSelId(null); setScreen("home"); }} />
        )}

        {screen === "player" && curUser && (
          <PlayerView user={curUser} allUsers={state.users}
            week={state.week} appIcon={state.appIcon} appIconType={state.appIconType}
            onToggle={toggle}
            onBack={() => { setSelId(null); setScreen("home"); }}
            onHistory={() => setScreen("history")} />
        )}

        {screen === "history" && (
          <HistoryView archive={state.archive} onBack={() => setScreen("player")} />
        )}

        {screen === "adminPin" && (
          <PinPad label={"Admin p\u0159\u00edstup"} icon={"\u{1F527}"} iconType="emoji"
            hint={"V\u00fdchoz\u00ed PIN: 0000"} correctPin={state.adminPin}
            onOk={() => setScreen("admin")}
            onBack={() => setScreen("home")} />
        )}

        {screen === "admin" && (
          <AdminPanel state={state} setState={setState} onBack={() => setScreen("home")} />
        )}
      </div>
    </div>
  );
}
