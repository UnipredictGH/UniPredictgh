import React, { useState, useEffect, useRef } from "react";

/* ── CONFIG ────────────────────────────────────────────────── */
const SUPA_URL = "https://urfqevstrwsrtysbllah.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnFldnN0cndzcnR5c2JsbGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNTQ5OTQsImV4cCI6MjEwMDkzMDk5NH0.9TPgghMQdHjqwRm51dEVHJ6O115FPBoYBfZHO_siTYI";
const H = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json" };
const TRACKS = ["General Science","General Arts","Business","Home Economics","Visual Arts","Technical","Agricultural Science"];
const FONTS = ["Inter","Roboto","Poppins","Nunito","Lato","Montserrat","Open Sans","Raleway"];
const HFONTS = ["Outfit","Poppins","Montserrat","Raleway","Playfair Display","Nunito","Inter","Roboto"];

async function sq(t, p = "") {
  try { const r = await fetch(`${SUPA_URL}/rest/v1/${t}${p}`, { headers: H }); return r.json(); } catch { return []; }
}
async function ins(t, b) {
  try { const r = await fetch(`${SUPA_URL}/rest/v1/${t}`, { method: "POST", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify(b) }); return r.json(); } catch { return null; }
}
async function upd(t, id, b) {
  try { const r = await fetch(`${SUPA_URL}/rest/v1/${t}?id=eq.${id}`, { method: "PATCH", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify(b) }); return r.json(); } catch { return null; }
}
async function del(t, id) {
  try { await fetch(`${SUPA_URL}/rest/v1/${t}?id=eq.${id}`, { method: "DELETE", headers: H }); } catch {}
}
async function upsert(t, key, val) {
  const ex = await sq(t, `?key=eq.${key}&select=id`);
  if (ex?.[0]?.id) return upd(t, ex[0].id, { value: val, updated_at: new Date().toISOString() });
  return ins(t, [{ key, value: val }]);
}

const ago = ts => {
  if (!ts) return "—";
  const d = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};
const fmt = n => (n || 0).toLocaleString();
const fmtGhc = p => `GHC ${((p || 0) / 100).toFixed(2)}`;

/* ── DESIGN TOKENS ──────────────────────────────────────────── */
const C = {
  violet: "#7c3aed", violetLight: "#f5f3ff", violetMid: "#ede9fe",
  green: "#10b981", amber: "#f59e0b", red: "#ef4444",
  gray50: "#f9fafb", gray100: "#f3f4f6", gray200: "#e5e7eb",
  gray400: "#9ca3af", gray600: "#4b5563", gray700: "#374151",
  gray900: "#111827", white: "#ffffff",
};

const inputStyle = {
  width: "100%", padding: "8px 12px", border: `1px solid ${C.gray200}`,
  borderRadius: 8, fontSize: 13, background: C.white, color: C.gray900,
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
};
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: C.gray700, marginBottom: 4 };
const thStyle = {
  padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700,
  color: C.gray400, textTransform: "uppercase", letterSpacing: ".05em",
  background: C.gray50, borderBottom: `1px solid ${C.gray100}`,
};
const tdStyle = { padding: "10px 12px", fontSize: 12, borderBottom: `1px solid ${C.gray50}`, color: C.gray700 };
const cardStyle = { background: C.white, borderRadius: 12, border: `1px solid ${C.gray100}`, boxShadow: "0 1px 3px rgba(0,0,0,.06)" };

/* ── UI PRIMITIVES ──────────────────────────────────────────── */
function Badge({ children, color = "gray" }) {
  const map = {
    gray: { background: C.gray100, color: C.gray600 },
    green: { background: "#dcfce7", color: "#065f46" },
    red: { background: "#fee2e2", color: "#991b1b" },
    amber: { background: "#fef3c7", color: "#92400e" },
    violet: { background: C.violetMid, color: "#6d28d9" },
    blue: { background: "#dbeafe", color: "#1d4ed8" },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 9px",
      borderRadius: 99, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
      ...(map[color] || map.gray)
    }}>{children}</span>
  );
}

function Btn({ children, onClick, variant = "primary", sm, lg, full, disabled }) {
  const variants = {
    primary: { background: C.violet, color: C.white },
    danger: { background: C.red, color: C.white },
    ghost: { background: C.white, color: C.gray700, border: `1px solid ${C.gray200}` },
    success: { background: C.green, color: C.white },
    amber: { background: C.amber, color: C.white },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: 4, fontWeight: 600, borderRadius: 8, border: "none",
        cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit",
        opacity: disabled ? .4 : 1, width: full ? "100%" : undefined,
        padding: lg ? "10px 20px" : sm ? "4px 10px" : "6px 12px",
        fontSize: lg ? 14 : sm ? 11 : 12,
        ...(variants[variant] || variants.primary),
      }}
    >{children}</button>
  );
}

function Card({ children, style = {} }) {
  return <div style={{ ...cardStyle, ...style }}>{children}</div>;
}

function Inp({ value, onChange, placeholder, type = "text" }) {
  return <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />;
}

function Txta({ value, onChange, placeholder, rows = 3 }) {
  return <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...inputStyle, resize: "vertical" }} />;
}

function Sel({ value, onChange, options, placeholder }) {
  return (
    <select value={value || ""} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
      {placeholder && <option value="">{placeholder}</option>}
      {(options || []).map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 16, width: "100%", maxWidth: wide ? 640 : 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.gray100}` }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.gray400 }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "fixed", bottom: 16, right: 16, background: C.gray900, color: C.white, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,.3)", zIndex: 100, display: "flex", alignItems: "center", gap: 8 }}>
      ✓ {msg}
    </div>
  );
}

function StatCard({ icon, label, value, accent = "#ede9fe", iconColor = "#6d28d9" }) {
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: accent, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 11, color: C.gray400, marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{value}</div>
        </div>
      </div>
    </Card>
  );
}

function FG({ label, children }) {
  return <div style={{ marginBottom: 12 }}><label style={labelStyle}>{label}</label>{children}</div>;
}

function TblWrap({ heads, rows, empty = "No data" }) {
  return (
    <Card style={{ overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{heads.map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={heads.length} style={{ ...tdStyle, textAlign: "center", padding: 32, color: C.gray400 }}>{empty}</td></tr>
              : rows}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PgHdr({ title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 900 }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: C.gray400, marginTop: 2 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

/* ── NAV ────────────────────────────────────────────────────── */
const NAV = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "students", icon: "👥", label: "Students" },
  { id: "results", icon: "🎯", label: "Student Results" },
  { id: "payments", icon: "💳", label: "Payments" },
  { id: "refunds", icon: "↩️", label: "Refunds" },
  { id: "universities", icon: "🏛️", label: "Universities" },
  { id: "programmes", icon: "📚", label: "Programmes" },
  { id: "cutoffs", icon: "📐", label: "Cut-Off Manager" },
  { id: "import", icon: "📥", label: "Programme Import" },
  { id: "scholarships", icon: "🎓", label: "Scholarships" },
  { id: "forms", icon: "📝", label: "Admission Forms" },
  { id: "news", icon: "📰", label: "News" },
  { id: "ticker", icon: "📣", label: "Notifications" },
  { id: "aiinbox", icon: "🤖", label: "AI Inbox" },
  { id: "sms", icon: "💬", label: "SMS Broadcast" },
  { id: "analytics", icon: "📈", label: "Analytics" },
  { id: "visitors", icon: "👁️", label: "Visitors" },
  { id: "audit", icon: "🔍", label: "Audit Log" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  return (
    <div style={{ width: collapsed ? 52 : 208, flexShrink: 0, background: C.gray900, display: "flex", flexDirection: "column", minHeight: "100vh", transition: "width .2s", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 12px", borderBottom: "1px solid #1f2937" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🎓</div>
        {!collapsed && <div style={{ color: C.white, fontWeight: 900, fontSize: 13, lineHeight: 1.3 }}>UniPredict<br /><span style={{ color: "#6b7280", fontWeight: 400, fontSize: 10 }}>Admin Panel</span></div>}
        <button onClick={() => setCollapsed(c => !c)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 12 }}>{collapsed ? "→" : "←"}</button>
      </div>
      <nav style={{ flex: 1, paddingTop: 8 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
            background: page === n.id ? C.violet : "transparent",
            color: page === n.id ? C.white : C.gray400,
            border: "none", borderLeft: `2px solid ${page === n.id ? "#a78bfa" : "transparent"}`,
            cursor: "pointer", fontSize: 12.5, fontWeight: 500, width: "100%", textAlign: "left",
            fontFamily: "inherit", transition: "all .15s",
          }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>{n.icon}</span>
            {!collapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.label}</span>}
          </button>
        ))}
      </nav>
      {!collapsed && <div style={{ padding: 12, fontSize: 10, color: "#374151", borderTop: "1px solid #1f2937" }}>© 2025 UniPredict Ghana</div>}
    </div>
  );
}

/* ── DASHBOARD ──────────────────────────────────────────────── */
function Dashboard() {
  const [stats, setStats] = useState({ students: 0, revenue: 0, today: 0, paid: 0 });
  const [tracks, setTracks] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    sq("payments", "?select=amount,plan,created_at&order=created_at.desc&limit=300").then(d => {
      const today = new Date().toDateString();
      setStats(s => ({ ...s, revenue: (d || []).reduce((a, p) => a + (p.amount || 0), 0), today: (d || []).filter(p => new Date(p.created_at).toDateString() === today).length, paid: (d || []).length }));
      setRecent((d || []).slice(0, 6));
    });
    sq("student_checks", "?select=track&limit=500").then(d => {
      const c = {}; (d || []).forEach(r => { if (r.track) c[r.track] = (c[r.track] || 0) + 1; });
      setTracks(Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 5));
      setStats(s => ({ ...s, students: (d || []).length }));
    });
  }, []);

  const maxT = Math.max(...tracks.map(t => t[1]), 1);
  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 900 }}>Dashboard</div>
        <div style={{ fontSize: 12, color: C.gray400 }}>Welcome back, Alexander.</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard icon="👥" label="Total Students" value={fmt(stats.students)} accent="#ede9fe" iconColor="#6d28d9" />
        <StatCard icon="💰" label="Total Revenue" value={fmtGhc(stats.revenue)} accent="#dcfce7" iconColor="#059669" />
        <StatCard icon="🎯" label="Checks Today" value={fmt(stats.today)} accent="#fef3c7" iconColor="#92400e" />
        <StatCard icon="💳" label="Paid Checks" value={fmt(stats.paid)} accent="#dbeafe" iconColor="#1d4ed8" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Top SHS Tracks</div>
          {tracks.map(([t, n]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 12, width: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t}</div>
              <div style={{ flex: 1, background: C.gray100, borderRadius: 99, height: 6 }}>
                <div style={{ width: `${(n / maxT) * 100}%`, background: C.violet, height: 6, borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 11, color: C.gray400, width: 20, textAlign: "right" }}>{n}</div>
            </div>
          ))}
          {!tracks.length && <div style={{ fontSize: 12, color: C.gray400 }}>No data yet</div>}
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Recent Payments</div>
          {recent.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge color={p.plan === "premium" ? "violet" : p.plan === "bundle" ? "amber" : "gray"}>{p.plan}</Badge>
                <span style={{ fontSize: 11, color: C.gray400 }}>{ago(p.created_at)}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{fmtGhc(p.amount)}</span>
            </div>
          ))}
          {!recent.length && <div style={{ fontSize: 12, color: C.gray400 }}>No payments yet</div>}
        </Card>
      </div>
    </div>
  );
}

/* ── STUDENTS ───────────────────────────────────────────────── */
function Students() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { sq("student_checks", "?order=checked_at.desc&limit=300").then(d => { setRows(d || []); setLoading(false); }); }, []);

  const filtered = rows.filter(r => (r.phone || "").includes(q) || (r.track || "").toLowerCase().includes(q.toLowerCase()) || (r.plan || "").includes(q));

  const exportCSV = () => {
    const csv = ["Phone,Track,Plan,Aggregate,Date", ...rows.map(r => `${r.phone},${r.track},${r.plan},${r.aggregate},${r.checked_at}`)].join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv); a.download = "students.csv"; a.click();
  };

  return (
    <div style={{ padding: 24 }}>
      <PgHdr title="Students" sub={`${rows.length} total checks`} action={<Btn onClick={exportCSV} variant="ghost">⬇ Export CSV</Btn>} />
      <Card style={{ padding: 8, marginBottom: 12 }}><Inp value={q} onChange={setQ} placeholder="Search by phone, track, plan…" /></Card>
      <TblWrap
        heads={["Phone","Track","Plan","Aggregate","Electives","Date"]}
        empty={loading ? "Loading…" : "No students found"}
        rows={filtered.map((r, i) => (
          <tr key={i}>
            <td style={{ ...tdStyle, fontWeight: 600 }}>{r.phone || "—"}</td>
            <td style={{ ...tdStyle, color: C.gray600 }}>{r.track || "—"}</td>
            <td style={tdStyle}><Badge color={r.plan === "premium" ? "violet" : r.plan === "bundle" ? "amber" : "gray"}>{r.plan}</Badge></td>
            <td style={{ ...tdStyle, fontWeight: 900, color: C.violet }}>{r.aggregate || "—"}</td>
            <td style={{ ...tdStyle, color: C.gray400, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(r.electives || []).join(", ") || "—"}</td>
            <td style={{ ...tdStyle, color: C.gray400 }}>{ago(r.checked_at)}</td>
          </tr>
        ))}
      />
    </div>
  );
}

/* ── STUDENT RESULTS ────────────────────────────────────────── */
function StudentResults() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);

  useEffect(() => { sq("student_checks", "?order=checked_at.desc&limit=300&select=id,phone,track,plan,aggregate,grades_core,electives,elective_grades,checked_at,payment_ref").then(d => setRows(d || [])); }, []);
  const filtered = rows.filter(r => (r.phone || "").includes(q) || (r.track || "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ padding: 24 }}>
      <PgHdr title="Student Results Viewer" sub="See exactly what every student received" />
      <Card style={{ padding: 8, marginBottom: 12 }}><Inp value={q} onChange={setQ} placeholder="Search by phone or track…" /></Card>
      <TblWrap
        heads={["Phone","Track","Plan","Aggregate","Date",""]}
        empty="No students"
        rows={filtered.map((r, i) => (
          <tr key={i}>
            <td style={{ ...tdStyle, fontWeight: 600 }}>{r.phone}</td>
            <td style={{ ...tdStyle, color: C.gray600 }}>{r.track}</td>
            <td style={tdStyle}><Badge color={r.plan === "premium" ? "violet" : "gray"}>{r.plan}</Badge></td>
            <td style={{ ...tdStyle, fontWeight: 900, color: C.violet }}>{r.aggregate || "—"}</td>
            <td style={{ ...tdStyle, color: C.gray400 }}>{ago(r.checked_at)}</td>
            <td style={tdStyle}><Btn sm onClick={() => setSel(r)}>View</Btn></td>
          </tr>
        ))}
      />
      {sel && (
        <Modal title={`Results — ${sel.phone}`} onClose={() => setSel(null)} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[["Track",sel.track],["Plan",sel.plan],["Aggregate",sel.aggregate],["Ref",(sel.payment_ref||"").slice(0,16)],["English",sel.grades_core?.eng],["Maths",sel.grades_core?.maths],["Science",sel.grades_core?.sci],["Social Studies",sel.grades_core?.soc]].map(([k,v]) => (
              <div key={k} style={{ background: C.gray50, borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 10, color: C.gray400, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{v || "—"}</div>
              </div>
            ))}
          </div>
          <div style={{ background: C.violetLight, borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 10, color: C.violet, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Electives & Grades</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(sel.electives || []).map(e => <span key={e} style={{ background: C.white, border: "1px solid #c4b5fd", color: "#6d28d9", padding: "4px 10px", borderRadius: 8, fontSize: 12 }}>{e} — {sel.elective_grades?.[e] || "?"}</span>)}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── PAYMENTS ───────────────────────────────────────────────── */
function Payments() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => { sq("payments", "?order=created_at.desc&limit=300").then(d => setRows(d || [])); }, []);
  const filtered = rows.filter(r => (r.phone||"").includes(q)||(r.reference||"").includes(q)||(r.plan||"").includes(q));
  const total = rows.reduce((s, r) => s + (r.amount || 0), 0);

  const exportCSV = () => {
    const csv = ["Reference,Phone,Plan,Amount,Status,Date",...rows.map(r=>`${r.reference},${r.phone},${r.plan},${fmtGhc(r.amount)},${r.status},${r.created_at}`)].join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download = "payments.csv"; a.click();
  };

  return (
    <div style={{ padding: 24 }}>
      <PgHdr title="Payments" sub={<span>Total: <strong style={{ color: "#059669" }}>{fmtGhc(total)}</strong></span>} action={<Btn onClick={exportCSV} variant="ghost">⬇ Export CSV</Btn>} />
      <Card style={{ padding: 8, marginBottom: 12 }}><Inp value={q} onChange={setQ} placeholder="Search…" /></Card>
      <TblWrap
        heads={["Reference","Phone","Plan","Amount","Status","Date"]}
        empty="No payments found"
        rows={filtered.map((r,i) => (
          <tr key={i}>
            <td style={{ ...tdStyle, fontFamily:"monospace", fontSize:10, color:C.gray400 }}>{(r.reference||"—").slice(0,18)}</td>
            <td style={{ ...tdStyle, fontWeight:600 }}>{r.phone||"—"}</td>
            <td style={tdStyle}><Badge color={r.plan==="premium"?"violet":r.plan==="bundle"?"amber":"gray"}>{r.plan}</Badge></td>
            <td style={{ ...tdStyle, fontWeight:700 }}>{fmtGhc(r.amount)}</td>
            <td style={tdStyle}><Badge color={r.status==="success"?"green":"red"}>{r.status}</Badge></td>
            <td style={{ ...tdStyle, color:C.gray400 }}>{ago(r.created_at)}</td>
          </tr>
        ))}
      />
    </div>
  );
}

/* ── REFUNDS ────────────────────────────────────────────────── */
function Refunds({ toast }) {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => { sq("refund_requests","?order=created_at.desc").then(d => setRows(d||[])); }, []);

  const handle = async (id, status) => {
    await upd("refund_requests", id, { status, admin_note: note, resolved_at: new Date().toISOString() });
    setRows(r => r.map(x => x.id===id ? {...x,status} : x));
    setModal(null); setNote(""); toast(`Refund ${status}`);
  };

  return (
    <div style={{ padding: 24 }}>
      <PgHdr title="Refund Manager" />
      <TblWrap
        heads={["Phone","Reference","Reason","Status","Date",""]}
        empty="No refund requests"
        rows={rows.map((r,i) => (
          <tr key={i}>
            <td style={{ ...tdStyle, fontWeight:600 }}>{r.phone}</td>
            <td style={{ ...tdStyle, fontFamily:"monospace", fontSize:10, color:C.gray400 }}>{(r.payment_ref||"").slice(0,14)}</td>
            <td style={{ ...tdStyle, maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.reason}</td>
            <td style={tdStyle}><Badge color={r.status==="approved"?"green":r.status==="rejected"?"red":"amber"}>{r.status||"pending"}</Badge></td>
            <td style={{ ...tdStyle, color:C.gray400 }}>{ago(r.created_at)}</td>
            <td style={tdStyle}>{r.status==="pending" && <Btn sm onClick={()=>setModal(r)}>Review</Btn>}</td>
          </tr>
        ))}
      />
      {modal && (
        <Modal title="Review Refund" onClose={()=>setModal(null)}>
          <div style={{ background:C.gray50, borderRadius:8, padding:12, marginBottom:12 }}><div style={{ fontSize:11, color:C.gray400, marginBottom:2 }}>Phone</div><div style={{ fontWeight:700 }}>{modal.phone}</div></div>
          <div style={{ background:C.gray50, borderRadius:8, padding:12, marginBottom:12 }}><div style={{ fontSize:11, color:C.gray400, marginBottom:2 }}>Reason</div><div>{modal.reason}</div></div>
          <FG label="Admin Note"><Txta value={note} onChange={setNote} placeholder="Optional note…" rows={2} /></FG>
          <div style={{ display:"flex", gap:8 }}>
            <Btn full variant="success" onClick={()=>handle(modal.id,"approved")}>✓ Approve</Btn>
            <Btn full variant="danger" onClick={()=>handle(modal.id,"rejected")}>✕ Reject</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── UNIVERSITIES ───────────────────────────────────────────── */
function Universities({ toast }) {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null);
  const blank = { code:"", name:"", location:"", type:"Public", active:true };
  const [form, setForm] = useState(blank);
  const F = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{ sq("universities","?order=name.asc&limit=200").then(d=>setRows(d||[])); },[]);

  const open = (r=null)=>{ setForm(r?{code:r.code,name:r.name,location:r.location||"",type:r.type||"Public",active:r.active!==false}:blank); setModal(r||{}); };
  const save = async()=>{
    if(modal?.id){ await upd("universities",modal.id,form); setRows(r=>r.map(x=>x.id===modal.id?{...x,...form}:x)); }
    else{ const d=await ins("universities",[form]); if(d?.[0]) setRows(r=>[...r,d[0]]); }
    setModal(null); toast("University saved");
  };
  const toggle = async r=>{ await upd("universities",r.id,{active:!r.active}); setRows(rows=>rows.map(x=>x.id===r.id?{...x,active:!r.active}:x)); };
  const remove = async r=>{ if(!confirm(`Delete ${r.name}?`))return; await del("universities",r.id); setRows(rows=>rows.filter(x=>x.id!==r.id)); toast("Deleted"); };

  return (
    <div style={{ padding:24 }}>
      <PgHdr title="Universities" sub={`${rows.length} institutions`} action={<Btn onClick={()=>open()}>+ Add University</Btn>} />
      <TblWrap
        heads={["Code","Name","Location","Type","Status","Actions"]}
        empty="No universities"
        rows={rows.map(r=>(
          <tr key={r.id}>
            <td style={{ ...tdStyle, fontFamily:"monospace", fontWeight:700, color:C.violet }}>{r.code}</td>
            <td style={{ ...tdStyle, fontWeight:500 }}>{r.name}</td>
            <td style={{ ...tdStyle, color:C.gray600 }}>{r.location}</td>
            <td style={tdStyle}><Badge>{r.type}</Badge></td>
            <td style={tdStyle}><Badge color={r.active!==false?"green":"red"}>{r.active!==false?"Active":"Inactive"}</Badge></td>
            <td style={tdStyle}><div style={{ display:"flex", gap:4 }}><Btn sm variant="ghost" onClick={()=>open(r)}>Edit</Btn><Btn sm variant={r.active!==false?"amber":"success"} onClick={()=>toggle(r)}>{r.active!==false?"Off":"On"}</Btn><Btn sm variant="danger" onClick={()=>remove(r)}>Del</Btn></div></td>
          </tr>
        ))}
      />
      {modal!==null && (
        <Modal title={modal?.id?"Edit University":"Add University"} onClose={()=>setModal(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:16 }}>
            <FG label="Code"><Inp value={form.code} onChange={v=>F("code",v.toUpperCase())} placeholder="UG" /></FG>
            <FG label="Full Name"><Inp value={form.name} onChange={v=>F("name",v)} placeholder="University of Ghana" /></FG>
            <FG label="Location"><Inp value={form.location} onChange={v=>F("location",v)} placeholder="Legon, Accra" /></FG>
            <FG label="Type"><Sel value={form.type} onChange={v=>F("type",v)} options={["Public","Private","Technical"]} /></FG>
            <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}><input type="checkbox" checked={form.active} onChange={e=>F("active",e.target.checked)} /> Active</label>
          </div>
          <div style={{ display:"flex", gap:8 }}><Btn full onClick={save}>Save</Btn><Btn full variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn></div>
        </Modal>
      )}
    </div>
  );
}

/* ── PROGRAMMES ─────────────────────────────────────────────── */
function Programmes({ toast }) {
  const [rows, setRows] = useState([]);
  const [unis, setUnis] = useState([]);
  const [q, setQ] = useState("");
  const [uF, setUF] = useState("");
  const [modal, setModal] = useState(null);
  const blank = { name:"", university_id:"", cutoff:24, required_track:[], careers:"", degree_type:"BSc", active:true };
  const [form, setForm] = useState(blank);
  const F = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    sq("universities","?order=name.asc&select=id,code,name").then(d=>setUnis(d||[]));
    sq("programmes","?order=name.asc&limit=500&select=id,name,cutoff,required_track,careers,degree_type,active,university_id,universities(code)").then(d=>setRows(d||[]));
  },[]);

  const filtered = rows.filter(r=>(r.name||"").toLowerCase().includes(q.toLowerCase())&&(!uF||r.university_id===uF));
  const open = (r=null)=>{ setForm(r?{name:r.name,university_id:r.university_id,cutoff:r.cutoff||24,required_track:Array.isArray(r.required_track)?r.required_track:[],careers:r.careers||"",degree_type:r.degree_type||"BSc",active:r.active!==false}:blank); setModal(r||{}); };
  const save = async()=>{
    if(modal?.id){ await upd("programmes",modal.id,form); setRows(r=>r.map(x=>x.id===modal.id?{...x,...form}:x)); }
    else{ const d=await ins("programmes",[form]); if(d?.[0]) setRows(r=>[...r,d[0]]); }
    setModal(null); toast("Saved");
  };
  const toggle = async r=>{ await upd("programmes",r.id,{active:!r.active}); setRows(rows=>rows.map(x=>x.id===r.id?{...x,active:!r.active}:x)); };
  const remove = async r=>{ if(!confirm(`Delete ${r.name}?`))return; await del("programmes",r.id); setRows(rows=>rows.filter(x=>x.id!==r.id)); toast("Deleted"); };

  return (
    <div style={{ padding:24 }}>
      <PgHdr title="Programmes" sub={`${rows.length} programmes`} action={<Btn onClick={()=>open()}>+ Add</Btn>} />
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <Card style={{ flex:1, padding:8 }}><Inp value={q} onChange={setQ} placeholder="Search programmes…" /></Card>
        <Card style={{ width:160, padding:8 }}><Sel value={uF} onChange={setUF} options={unis.map(u=>({value:u.id,label:u.code}))} placeholder="All Unis" /></Card>
      </div>
      <TblWrap
        heads={["Programme","Uni","Cut-Off","Type","Status","Actions"]}
        empty="No programmes found"
        rows={filtered.slice(0,100).map(r=>(
          <tr key={r.id}>
            <td style={{ ...tdStyle, fontWeight:500, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</td>
            <td style={{ ...tdStyle, color:C.gray600 }}>{r.universities?.code||"—"}</td>
            <td style={{ ...tdStyle, fontWeight:900, color:C.violet }}>{r.cutoff}</td>
            <td style={{ ...tdStyle, color:C.gray600 }}>{r.degree_type}</td>
            <td style={tdStyle}><Badge color={r.active!==false?"green":"red"}>{r.active!==false?"On":"Off"}</Badge></td>
            <td style={tdStyle}><div style={{ display:"flex", gap:4 }}><Btn sm variant="ghost" onClick={()=>open(r)}>Edit</Btn><Btn sm variant={r.active!==false?"amber":"success"} onClick={()=>toggle(r)}>{r.active!==false?"Off":"On"}</Btn><Btn sm variant="danger" onClick={()=>remove(r)}>Del</Btn></div></td>
          </tr>
        ))}
      />
      {modal!==null && (
        <Modal title={modal?.id?"Edit Programme":"Add Programme"} onClose={()=>setModal(null)} wide>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            <div style={{ gridColumn:"span 2" }}><FG label="Programme Name"><Inp value={form.name} onChange={v=>F("name",v)} placeholder="BSc Computer Science" /></FG></div>
            <FG label="University"><Sel value={form.university_id} onChange={v=>F("university_id",v)} options={unis.map(u=>({value:u.id,label:`${u.code} — ${u.name}`}))} placeholder="Select" /></FG>
            <FG label="Cut-Off"><Inp value={form.cutoff} onChange={v=>F("cutoff",parseInt(v)||0)} type="number" /></FG>
            <FG label="Degree Type"><Inp value={form.degree_type} onChange={v=>F("degree_type",v)} placeholder="BSc, BA, HND…" /></FG>
            <FG label="Career Paths"><Inp value={form.careers} onChange={v=>F("careers",v)} placeholder="Software Engineer…" /></FG>
            <div style={{ gridColumn:"span 2" }}>
              <label style={labelStyle}>Required Tracks (empty = all)</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:6 }}>
                {TRACKS.map(t=>(
                  <label key={t} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:12 }}>
                    <input type="checkbox" checked={form.required_track.includes(t)} onChange={e=>F("required_track",e.target.checked?[...form.required_track,t]:form.required_track.filter(x=>x!==t))} /> {t}
                  </label>
                ))}
              </div>
            </div>
            <label style={{ gridColumn:"span 2", display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}><input type="checkbox" checked={form.active} onChange={e=>F("active",e.target.checked)} /> Active</label>
          </div>
          <div style={{ display:"flex", gap:8 }}><Btn full onClick={save}>Save</Btn><Btn full variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn></div>
        </Modal>
      )}
    </div>
  );
}

/* ── CUT-OFF MANAGER ────────────────────────────────────────── */
function CutoffManager({ toast }) {
  const [rows, setRows] = useState([]);
  const [unis, setUnis] = useState([]);
  const [q, setQ] = useState("");
  const [uF, setUF] = useState("");
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    sq("universities","?order=name.asc&select=id,code").then(d=>setUnis(d||[]));
    sq("programmes","?order=name.asc&limit=3000&select=id,name,cutoff,university_id,universities(code)").then(d=>setRows(d||[]));
  },[]);

  const filtered = rows.filter(r=>(r.name||"").toLowerCase().includes(q.toLowerCase())&&(!uF||r.university_id===uF));
  const saveAll = async()=>{
    setSaving(true);
    const keys=Object.keys(edits);
    for(const id of keys) await upd("programmes",id,{cutoff:parseInt(edits[id])});
    setRows(r=>r.map(x=>edits[x.id]?{...x,cutoff:parseInt(edits[x.id])}:x));
    setEdits({}); setSaving(false); toast(`${keys.length} cut-offs saved`);
  };

  return (
    <div style={{ padding:24 }}>
      <PgHdr title="Cut-Off Manager" sub="Bulk-edit cut-offs. Click Save when done."
        action={Object.keys(edits).length>0 && <Btn variant="success" onClick={saveAll} disabled={saving}>{saving?"Saving…":`💾 Save ${Object.keys(edits).length} Changes`}</Btn>} />
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <Card style={{ flex:1, padding:8 }}><Inp value={q} onChange={setQ} placeholder="Search programmes…" /></Card>
        <Card style={{ width:160, padding:8 }}><Sel value={uF} onChange={setUF} options={unis.map(u=>({value:u.id,label:u.code}))} placeholder="All Unis" /></Card>
      </div>
      <Card style={{ overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr><th style={thStyle}>Programme</th><th style={thStyle}>University</th><th style={{ ...thStyle, width:100 }}>Cut-Off</th></tr></thead>
            <tbody>
              {filtered.slice(0,200).map(r=>(
                <tr key={r.id} style={{ borderBottom:`1px solid ${C.gray50}`, background:edits[r.id]?"#fffbeb":undefined }}>
                  <td style={tdStyle}>{r.name}</td>
                  <td style={{ ...tdStyle, color:C.gray600 }}>{r.universities?.code||"—"}</td>
                  <td style={tdStyle}>
                    <input type="number" value={edits[r.id]!==undefined?edits[r.id]:r.cutoff||""} min={6} max={54}
                      onChange={e=>setEdits(ed=>({...ed,[r.id]:e.target.value}))}
                      style={{ width:72, padding:"4px 8px", border:"2px solid #c4b5fd", borderRadius:8, fontSize:12, fontWeight:700, color:C.violet, outline:"none" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── SCHOLARSHIPS ───────────────────────────────────────────── */
function Scholarships({ toast }) {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null);
  const blank = { name:"", organization:"", amount:"", deadline:"", status:"open", description:"" };
  const [form, setForm] = useState(blank);
  const F = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{ sq("scholarships","?order=name.asc").then(d=>setRows(d||[])); },[]);
  const open = (r=null)=>{ setForm(r?{name:r.name,organization:r.organization||"",amount:r.amount||"",deadline:r.deadline||"",status:r.status||"open",description:r.description||""}:blank); setModal(r||{}); };
  const save = async()=>{
    if(modal?.id){ await upd("scholarships",modal.id,form); setRows(r=>r.map(x=>x.id===modal.id?{...x,...form}:x)); }
    else{ const d=await ins("scholarships",[form]); if(d?.[0]) setRows(r=>[...r,d[0]]); }
    setModal(null); toast("Saved");
  };
  const remove = async r=>{ if(!confirm("Delete?"))return; await del("scholarships",r.id); setRows(rows=>rows.filter(x=>x.id!==r.id)); };

  return (
    <div style={{ padding:24 }}>
      <PgHdr title="Scholarships" action={<Btn onClick={()=>open()}>+ Add</Btn>} />
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {rows.map(r=>(
          <Card key={r.id} style={{ padding:16, display:"flex", alignItems:"flex-start", gap:16 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{r.name}</div>
              <div style={{ fontSize:12, color:C.gray400, marginBottom:8 }}>{r.organization}</div>
              <div style={{ display:"flex", gap:6 }}><Badge color="green">{r.amount}</Badge><Badge color="amber">{r.deadline}</Badge><Badge color={r.status==="open"?"green":"gray"}>{r.status}</Badge></div>
            </div>
            <div style={{ display:"flex", gap:6 }}><Btn sm variant="ghost" onClick={()=>open(r)}>Edit</Btn><Btn sm variant="danger" onClick={()=>remove(r)}>Del</Btn></div>
          </Card>
        ))}
        {!rows.length && <Card style={{ padding:48, textAlign:"center", color:C.gray400 }}>No scholarships yet</Card>}
      </div>
      {modal!==null && (
        <Modal title={modal?.id?"Edit Scholarship":"Add Scholarship"} onClose={()=>setModal(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:16 }}>
            <FG label="Name"><Inp value={form.name} onChange={v=>F("name",v)} placeholder="GETFUND Scholarship" /></FG>
            <FG label="Organisation"><Inp value={form.organization} onChange={v=>F("organization",v)} placeholder="Ghana Education Trust Fund" /></FG>
            <FG label="Amount"><Inp value={form.amount} onChange={v=>F("amount",v)} placeholder="Full Tuition" /></FG>
            <FG label="Deadline"><Inp value={form.deadline} onChange={v=>F("deadline",v)} type="date" /></FG>
            <FG label="Status"><Sel value={form.status} onChange={v=>F("status",v)} options={["open","closed","coming soon"]} /></FG>
            <FG label="Description"><Txta value={form.description} onChange={v=>F("description",v)} placeholder="Brief description…" rows={2} /></FG>
          </div>
          <div style={{ display:"flex", gap:8 }}><Btn full onClick={save}>Save</Btn><Btn full variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn></div>
        </Modal>
      )}
    </div>
  );
}

/* ── ADMISSION FORMS ────────────────────────────────────────── */
function AdmissionForms({ toast }) {
  const [rows, setRows] = useState([]);
  const [unis, setUnis] = useState([]);
  const [modal, setModal] = useState(null);
  const blank = { university_id:"", status:"open", deadline:"", fee:"", portal_url:"" };
  const [form, setForm] = useState(blank);
  const F = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    sq("universities","?order=name.asc&select=id,code,name").then(d=>setUnis(d||[]));
    sq("admission_forms","?order=updated_at.desc&select=*,universities(code,name)").then(d=>setRows(d||[]));
  },[]);

  const open = (r=null)=>{ setForm(r?{university_id:r.university_id,status:r.status||"open",deadline:r.deadline||"",fee:r.fee||"",portal_url:r.portal_url||""}:blank); setModal(r||{}); };
  const save = async()=>{
    const body={...form,updated_at:new Date().toISOString()};
    if(modal?.id){ await upd("admission_forms",modal.id,body); setRows(r=>r.map(x=>x.id===modal.id?{...x,...body}:x)); }
    else{ const d=await ins("admission_forms",[body]); if(d?.[0]) setRows(r=>[...r,d[0]]); }
    setModal(null); toast("Saved");
  };
  const remove = async r=>{ if(!confirm("Delete?"))return; await del("admission_forms",r.id); setRows(rows=>rows.filter(x=>x.id!==r.id)); };

  return (
    <div style={{ padding:24 }}>
      <PgHdr title="Admission Forms" action={<Btn onClick={()=>open()}>+ Add</Btn>} />
      <TblWrap
        heads={["University","Status","Deadline","Fee","Actions"]}
        empty="No forms yet"
        rows={rows.map(r=>(
          <tr key={r.id}>
            <td style={{ ...tdStyle, fontWeight:500 }}>{r.universities?.name||"—"}</td>
            <td style={tdStyle}><Badge color={r.status==="open"?"green":"gray"}>{r.status}</Badge></td>
            <td style={{ ...tdStyle, color:C.gray600 }}>{r.deadline||"TBD"}</td>
            <td style={{ ...tdStyle, color:C.gray600 }}>{r.fee||"TBD"}</td>
            <td style={tdStyle}><div style={{ display:"flex", gap:4 }}><Btn sm variant="ghost" onClick={()=>open(r)}>Edit</Btn><Btn sm variant="danger" onClick={()=>remove(r)}>Del</Btn></div></td>
          </tr>
        ))}
      />
      {modal!==null && (
        <Modal title={modal?.id?"Edit Form":"Add Form"} onClose={()=>setModal(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:16 }}>
            <FG label="University"><Sel value={form.university_id} onChange={v=>F("university_id",v)} options={unis.map(u=>({value:u.id,label:`${u.code} — ${u.name}`}))} placeholder="Select" /></FG>
            <FG label="Status"><Sel value={form.status} onChange={v=>F("status",v)} options={["open","closed","coming soon"]} /></FG>
            <FG label="Deadline"><Inp value={form.deadline} onChange={v=>F("deadline",v)} placeholder="Oct 31, 2025" /></FG>
            <FG label="Application Fee"><Inp value={form.fee} onChange={v=>F("fee",v)} placeholder="GHC 50" /></FG>
            <FG label="Portal URL"><Inp value={form.portal_url} onChange={v=>F("portal_url",v)} placeholder="https://admissions.ug.edu.gh" /></FG>
          </div>
          <div style={{ display:"flex", gap:8 }}><Btn full onClick={save}>Save</Btn><Btn full variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn></div>
        </Modal>
      )}
    </div>
  );
}

/* ── NEWS ───────────────────────────────────────────────────── */
function News({ toast }) {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null);
  const blank = { title:"", category:"general", content:"", urgent:false, published:true };
  const [form, setForm] = useState(blank);
  const F = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{ sq("news","?order=created_at.desc").then(d=>setRows(d||[])); },[]);
  const open = (r=null)=>{ setForm(r?{title:r.title,category:r.category||"general",content:r.content||"",urgent:!!r.urgent,published:r.published!==false}:blank); setModal(r||{}); };
  const save = async()=>{
    const body={...form,updated_at:new Date().toISOString()};
    if(modal?.id){ await upd("news",modal.id,body); setRows(r=>r.map(x=>x.id===modal.id?{...x,...body}:x)); }
    else{ const d=await ins("news",[{...body,created_at:new Date().toISOString()}]); if(d?.[0]) setRows(r=>[d[0],...r]); }
    setModal(null); toast("News saved");
  };
  const remove = async r=>{ if(!confirm("Delete?"))return; await del("news",r.id); setRows(rows=>rows.filter(x=>x.id!==r.id)); };

  return (
    <div style={{ padding:24 }}>
      <PgHdr title="News" action={<Btn onClick={()=>open()}>+ Post News</Btn>} />
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {rows.map(r=>(
          <Card key={r.id} style={{ padding:16, display:"flex", alignItems:"flex-start", gap:16 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ fontWeight:700, fontSize:14 }}>{r.title}</span>
                {r.urgent && <Badge color="red">Urgent</Badge>}
                <Badge color={r.published?"green":"gray"}>{r.published?"Published":"Draft"}</Badge>
              </div>
              <div style={{ fontSize:12, color:C.gray400 }}>{ago(r.created_at)} · {r.category}</div>
            </div>
            <div style={{ display:"flex", gap:6 }}><Btn sm variant="ghost" onClick={()=>open(r)}>Edit</Btn><Btn sm variant="danger" onClick={()=>remove(r)}>Del</Btn></div>
          </Card>
        ))}
        {!rows.length && <Card style={{ padding:48, textAlign:"center", color:C.gray400 }}>No news yet</Card>}
      </div>
      {modal!==null && (
        <Modal title={modal?.id?"Edit":"Post News"} onClose={()=>setModal(null)} wide>
          <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:16 }}>
            <FG label="Title"><Inp value={form.title} onChange={v=>F("title",v)} placeholder="UG 2025/2026 Admissions Open" /></FG>
            <FG label="Category"><Sel value={form.category} onChange={v=>F("category",v)} options={["general","form","cutoff","scholarship","policy"]} /></FG>
            <FG label="Content"><Txta value={form.content} onChange={v=>F("content",v)} placeholder="Full news content…" rows={5} /></FG>
            <div style={{ display:"flex", gap:16 }}>
              <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:12 }}><input type="checkbox" checked={form.urgent} onChange={e=>F("urgent",e.target.checked)} /> Urgent</label>
              <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:12 }}><input type="checkbox" checked={form.published} onChange={e=>F("published",e.target.checked)} /> Published</label>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}><Btn full onClick={save}>Save</Btn><Btn full variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn></div>
        </Modal>
      )}
    </div>
  );
}

/* ── NOTIFICATIONS ──────────────────────────────────────────── */
function Notifications({ toast }) {
  const [rows, setRows] = useState([]);
  const [text, setText] = useState("");
  const [urgent, setUrgent] = useState(false);

  useEffect(()=>{ sq("ticker_items","?order=created_at.desc&limit=50").then(d=>setRows(d||[])); },[]);
  const add = async()=>{
    if(!text.trim())return;
    const d=await ins("ticker_items",[{text,urgent,active:true,created_at:new Date().toISOString()}]);
    if(d?.[0]) setRows(r=>[d[0],...r]);
    setText(""); setUrgent(false); toast("Added to ticker");
  };
  const toggle = async r=>{ await upd("ticker_items",r.id,{active:!r.active}); setRows(rows=>rows.map(x=>x.id===r.id?{...x,active:!r.active}:x)); };
  const remove = async r=>{ await del("ticker_items",r.id); setRows(rows=>rows.filter(x=>x.id!==r.id)); };

  return (
    <div style={{ padding:24, maxWidth:640 }}>
      <div style={{ fontSize:20, fontWeight:900, marginBottom:4 }}>Notifications / Ticker</div>
      <div style={{ fontSize:12, color:C.gray400, marginBottom:20 }}>Push live announcements to the student site ticker.</div>
      <Card style={{ padding:16, marginBottom:14 }}>
        <label style={labelStyle}>New Announcement</label>
        <Inp value={text} onChange={setText} placeholder="e.g. UCC Admissions Open — Deadline Oct 15" />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:12 }}>
          <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}><input type="checkbox" checked={urgent} onChange={e=>setUrgent(e.target.checked)} /> Mark as urgent</label>
          <Btn onClick={add}>Add to Ticker</Btn>
        </div>
      </Card>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {rows.map(r=>(
          <Card key={r.id} style={{ padding:12, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:500, marginBottom:4 }}>{r.text}</div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <Badge color={r.active?"green":"gray"}>{r.active?"Live":"Hidden"}</Badge>
                {r.urgent && <Badge color="red">Urgent</Badge>}
                <span style={{ fontSize:10, color:C.gray400 }}>{ago(r.created_at)}</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <Btn sm variant={r.active?"amber":"success"} onClick={()=>toggle(r)}>{r.active?"Hide":"Show"}</Btn>
              <Btn sm variant="danger" onClick={()=>remove(r)}>Del</Btn>
            </div>
          </Card>
        ))}
        {!rows.length && <Card style={{ padding:32, textAlign:"center", color:C.gray400 }}>No ticker items yet</Card>}
      </div>
    </div>
  );
}

/* ── AI INBOX ───────────────────────────────────────────────── */
function AIInbox({ toast }) {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");

  useEffect(()=>{ sq("ai_inbox","?order=created_at.desc&limit=100").then(d=>setRows(d||[])); },[]);
  const sendReply = async()=>{
    if(!reply.trim()||!selected)return;
    await upd("ai_inbox",selected.id,{status:"replied",admin_reply:reply,replied_at:new Date().toISOString()});
    setRows(r=>r.map(x=>x.id===selected.id?{...x,status:"replied"}:x));
    setSelected(null); setReply(""); toast("Reply saved");
  };

  const pending=rows.filter(r=>r.status==="pending");
  const replied=rows.filter(r=>r.status==="replied");

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <div style={{ fontSize:20, fontWeight:900 }}>AI Inbox</div>
        {pending.length>0 && <Badge color="red">{pending.length} pending</Badge>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:C.gray400, textTransform:"uppercase", letterSpacing:".05em", marginBottom:8 }}>Unanswered ({pending.length})</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:16 }}>
            {pending.map(r=>(
              <Card key={r.id} style={{ padding:12, cursor:"pointer", border:selected?.id===r.id?`2px solid ${C.violet}`:undefined, background:selected?.id===r.id?C.violetLight:undefined }} onClick={()=>{setSelected(r);setReply("");}}>
                <div style={{ fontWeight:500, fontSize:13, marginBottom:4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{r.question}</div>
                <div style={{ fontSize:10, color:C.gray400 }}>{ago(r.created_at)}</div>
              </Card>
            ))}
            {!pending.length && <Card style={{ padding:16, textAlign:"center", fontSize:12, color:C.gray400 }}>All caught up ✓</Card>}
          </div>
          <div style={{ fontSize:11, fontWeight:700, color:C.gray400, textTransform:"uppercase", letterSpacing:".05em", marginBottom:8 }}>Replied ({replied.length})</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {replied.slice(0,6).map(r=>(
              <Card key={r.id} style={{ padding:10, opacity:.6 }}>
                <div style={{ fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.question}</div>
                <div style={{ fontSize:10, color:C.gray400 }}>Replied {ago(r.replied_at)}</div>
              </Card>
            ))}
          </div>
        </div>
        {selected && (
          <Card style={{ padding:16, alignSelf:"flex-start" }}>
            <div style={{ fontWeight:700, marginBottom:8 }}>Question</div>
            <div style={{ background:C.gray50, borderRadius:8, padding:12, fontSize:13, marginBottom:16 }}>{selected.question}</div>
            <div style={{ fontWeight:700, marginBottom:8 }}>Your Reply</div>
            <Txta value={reply} onChange={setReply} placeholder="Type your reply…" rows={4} />
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <Btn full onClick={sendReply} disabled={!reply.trim()}>Send Reply</Btn>
              <Btn variant="ghost" onClick={()=>setSelected(null)}>Cancel</Btn>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ── SMS BROADCAST ──────────────────────────────────────────── */
function SMSBroadcast({ toast }) {
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("all");
  const [track, setTrack] = useState("");
  const [plan, setPlan] = useState("");
  const [preview, setPreview] = useState(null);
  const [sending, setSending] = useState(false);

  const getPreview = async()=>{
    let q="?select=phone,track,plan";
    if(filter==="track"&&track) q+=`&track=eq.${track}`;
    if(filter==="plan"&&plan) q+=`&plan=eq.${plan}`;
    const d=await sq("student_checks",q+"&limit=500");
    setPreview([...new Set((d||[]).map(r=>r.phone).filter(Boolean))]);
  };

  const send = async()=>{
    if(!msg.trim()||!preview?.length)return;
    setSending(true);
    try{
      await fetch(`${SUPA_URL}/functions/v1/sms-broadcast`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${SUPA_KEY}`},body:JSON.stringify({message:msg,phones:preview})});
      await ins("sms_broadcasts",[{message:msg,recipients:preview.length,status:"sent",sent_at:new Date().toISOString()}]);
      toast(`SMS sent to ${preview.length} students`);
      setMsg(""); setPreview(null);
    }catch{ toast("SMS failed — check Arkesel config"); }
    setSending(false);
  };

  return (
    <div style={{ padding:24, maxWidth:560 }}>
      <div style={{ fontSize:20, fontWeight:900, marginBottom:4 }}>SMS Broadcast</div>
      <div style={{ fontSize:12, color:C.gray400, marginBottom:20 }}>Send SMS to students via Arkesel.</div>
      <Card style={{ padding:20, display:"flex", flexDirection:"column", gap:14 }}>
        <FG label="Target Audience"><Sel value={filter} onChange={setFilter} options={[{value:"all",label:"All Students"},{value:"track",label:"By Track"},{value:"plan",label:"By Plan"}]} /></FG>
        {filter==="track" && <FG label="Track"><Sel value={track} onChange={setTrack} options={TRACKS} placeholder="Select track" /></FG>}
        {filter==="plan" && <FG label="Plan"><Sel value={plan} onChange={setPlan} options={["basic","premium","bundle"]} placeholder="Select plan" /></FG>}
        <div>
          <label style={labelStyle}>Message ({msg.length}/160)</label>
          <Txta value={msg} onChange={setMsg} placeholder="Type your SMS message here…" rows={4} />
          {msg.length>160 && <div style={{ fontSize:11, color:C.red, marginTop:4 }}>Over 160 chars — {Math.ceil(msg.length/160)} SMS parts</div>}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Btn variant="ghost" onClick={getPreview}>Preview Recipients</Btn>
          {preview && <Btn variant="success" onClick={send} disabled={!msg.trim()||sending}>{sending?"Sending…":`Send to ${preview.length} students`}</Btn>}
        </div>
        {preview && (
          <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:8, padding:12 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#15803d", marginBottom:4 }}>{preview.length} recipients found</div>
            <div style={{ fontSize:11, fontFamily:"monospace", color:"#15803d", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{preview.slice(0,5).join(", ")}{preview.length>5?` + ${preview.length-5} more`:""}</div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ── ANALYTICS ──────────────────────────────────────────────── */
function Analytics() {
  const [data, setData] = useState({ byDay:[], byPlan:{}, byTrack:{} });

  useEffect(()=>{
    sq("payments","?select=amount,plan,created_at&order=created_at.asc&limit=1000").then(pays=>{
      const byPlan={},byDay={};
      (pays||[]).forEach(p=>{ byPlan[p.plan]=(byPlan[p.plan]||0)+1; const day=new Date(p.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short"}); byDay[day]=(byDay[day]||0)+1; });
      sq("student_checks","?select=track&limit=500").then(checks=>{
        const byTrack={}; (checks||[]).forEach(c=>{ if(c.track) byTrack[c.track]=(byTrack[c.track]||0)+1; });
        setData({ byDay:Object.entries(byDay).slice(-14), byPlan, byTrack });
      });
    });
  },[]);

  const maxDay=Math.max(...data.byDay.map(d=>d[1]),1);
  const maxPlan=Math.max(...Object.values(data.byPlan),1);
  const maxTrack=Math.max(...Object.values(data.byTrack),1);

  return (
    <div style={{ padding:24 }}>
      <div style={{ fontSize:20, fontWeight:900, marginBottom:20 }}>Analytics</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Card style={{ padding:16 }}>
          <div style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>Checks Per Day (last 14 days)</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:96 }}>
            {data.byDay.map(([day,count])=>(
              <div key={day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                <div style={{ fontSize:9, color:C.gray400, fontWeight:700 }}>{count}</div>
                <div style={{ width:"100%", background:C.violet, borderRadius:"3px 3px 0 0", height:Math.max(4,(count/maxDay)*72) }} />
                <div style={{ fontSize:8, color:C.gray400, overflow:"hidden", width:"100%", textAlign:"center", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{day}</div>
              </div>
            ))}
            {!data.byDay.length && <div style={{ fontSize:12, color:C.gray400, margin:"auto" }}>No data yet</div>}
          </div>
        </Card>
        <Card style={{ padding:16 }}>
          <div style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>Revenue by Plan</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {Object.entries(data.byPlan).map(([plan,count])=>(
              <div key={plan} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Badge color={plan==="premium"?"violet":plan==="bundle"?"amber":"gray"}>{plan}</Badge>
                <div style={{ flex:1, background:C.gray100, borderRadius:99, height:8 }}>
                  <div style={{ width:`${(count/maxPlan)*100}%`, background:C.violet, height:8, borderRadius:99 }} />
                </div>
                <span style={{ fontSize:12, fontWeight:700 }}>{count}</span>
              </div>
            ))}
            {!Object.keys(data.byPlan).length && <div style={{ fontSize:12, color:C.gray400 }}>No data yet</div>}
          </div>
        </Card>
        <Card style={{ padding:16, gridColumn:"span 2" }}>
          <div style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>Students by SHS Track</div>
          {Object.entries(data.byTrack).sort((a,b)=>b[1]-a[1]).map(([t,c])=>(
            <div key={t} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <div style={{ fontSize:12, width:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t}</div>
              <div style={{ flex:1, background:C.gray100, borderRadius:99, height:6 }}>
                <div style={{ width:`${(c/maxTrack)*100}%`, background:C.green, height:6, borderRadius:99 }} />
              </div>
              <span style={{ fontSize:11, color:C.gray400 }}>{c}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ── PROGRAMME IMPORT ───────────────────────────────────────── */
function ProgrammeImport({ toast }) {
  const [unis, setUnis] = useState([]);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(0);
  const fileRef = useRef();

  useEffect(()=>{ sq("universities","?order=name.asc&select=id,code").then(d=>setUnis(d||[])); },[]);
  const parseCSV = text=>{ const lines=text.trim().split("\n"); const headers=lines[0].split(",").map(h=>h.trim().toLowerCase().replace(/"/g,"")); return lines.slice(1).map(line=>{ const vals=line.split(",").map(v=>v.trim().replace(/"/g,"")); return Object.fromEntries(headers.map((h,i)=>[h,vals[i]||""])); }); };
  const onFile = e=>{ const file=e.target.files[0]; if(!file)return; const r=new FileReader(); r.onload=ev=>setPreview(parseCSV(ev.target.result).slice(0,10)); r.readAsText(file); };
  const doImport = async()=>{
    const file=fileRef.current?.files[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=async ev=>{
      setImporting(true);
      const rows=parseCSV(ev.target.result);
      const umap={}; unis.forEach(u=>{ umap[u.code.toLowerCase()]=u.id; });
      let count=0;
      for(let i=0;i<rows.length;i+=50){
        const batch=rows.slice(i,i+50).map(r=>({name:r.name||r.programme||"",university_id:umap[(r.uni||r.university||r.code||"").toLowerCase()]||null,cutoff:parseInt(r.cutoff||r["cut-off"]||r["cut_off"])||24,required_track:r.track?[r.track]:[],careers:r.careers||r.career||"",degree_type:r.degree||r.type||"BSc",active:true})).filter(r=>r.name&&r.university_id);
        if(batch.length){ await ins("programmes",batch); count+=batch.length; }
        setDone(count);
      }
      setImporting(false); toast(`Imported ${count} programmes`);
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding:24, maxWidth:640 }}>
      <div style={{ fontSize:20, fontWeight:900, marginBottom:4 }}>Programme Import</div>
      <div style={{ fontSize:12, color:C.gray400, marginBottom:20 }}>Upload a CSV to bulk-add thousands of programmes at once.</div>
      <Card style={{ padding:20, marginBottom:12 }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:8 }}>Required CSV columns:</div>
        <div style={{ background:C.gray50, borderRadius:8, padding:12, fontFamily:"monospace", fontSize:12, marginBottom:12 }}>name, uni, cutoff, track, degree, careers</div>
        {[["name","Programme name"],["uni","University code (KNUST, UG, UCC…)"],["cutoff","Cut-off aggregate"],["track","Required track or leave empty"],["degree","Degree type (BSc, BA, HND…)"],["careers","Career paths"]].map(([k,v])=>(
          <div key={k} style={{ fontSize:12, color:C.gray600, marginBottom:4 }}><strong>{k}</strong> — {v}</div>
        ))}
      </Card>
      <Card style={{ padding:20, marginBottom:12 }}>
        <label style={labelStyle}>Upload CSV File</label>
        <input ref={fileRef} type="file" accept=".csv" onChange={onFile} style={{ fontSize:13, cursor:"pointer" }} />
        {preview.length>0 && (
          <div style={{ marginTop:16, overflowX:"auto" }}>
            <div style={{ fontWeight:600, fontSize:12, marginBottom:8 }}>Preview (first 10 rows):</div>
            <table style={{ width:"100%", fontSize:11, borderCollapse:"collapse" }}>
              <thead><tr>{Object.keys(preview[0]).map(k=><th key={k} style={thStyle}>{k}</th>)}</tr></thead>
              <tbody>{preview.map((r,i)=><tr key={i}>{Object.values(r).map((v,j)=><td key={j} style={{ ...tdStyle, maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
      </Card>
      {importing && <div style={{ background:C.violetLight, border:"1px solid #c4b5fd", borderRadius:12, padding:16, textAlign:"center", marginBottom:12, fontWeight:700, color:C.violet }}>Importing… {done} programmes</div>}
      <Btn lg full onClick={doImport} disabled={importing}>📥 Import CSV</Btn>
    </div>
  );
}

/* ── VISITORS ───────────────────────────────────────────────── */
function Visitors() {
  const [rows, setRows] = useState([]);
  useEffect(()=>{ sq("visitors","?order=created_at.desc&limit=300").then(d=>setRows(d||[])); },[]);
  const byPage={}; rows.forEach(r=>{ if(r.page) byPage[r.page]=(byPage[r.page]||0)+1; });
  const today=rows.filter(r=>new Date(r.created_at).toDateString()===new Date().toDateString()).length;

  return (
    <div style={{ padding:24 }}>
      <div style={{ fontSize:20, fontWeight:900, marginBottom:20 }}>Visitor Tracking</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        <StatCard icon="👁️" label="Total Visits" value={fmt(rows.length)} accent="#ede9fe" iconColor="#6d28d9" />
        <StatCard icon="📄" label="Unique Pages" value={fmt(Object.keys(byPage).length)} accent="#dbeafe" iconColor="#1d4ed8" />
        <StatCard icon="📱" label="Today" value={fmt(today)} accent="#fef3c7" iconColor="#92400e" />
        <StatCard icon="🔗" label="With Referrer" value={fmt(rows.filter(r=>r.referrer).length)} accent="#dcfce7" iconColor="#059669" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card style={{ padding:16 }}>
          <div style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>Top Pages</div>
          {Object.entries(byPage).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([page,count])=>(
            <div key={page} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ fontFamily:"monospace", fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{page||"/"}</div>
              <Badge color="violet">{count}</Badge>
            </div>
          ))}
          {!Object.keys(byPage).length && <div style={{ fontSize:12, color:C.gray400 }}>No visits yet</div>}
        </Card>
        <Card style={{ padding:16 }}>
          <div style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>Recent Visits</div>
          {rows.slice(0,12).map((r,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <div>
                <div style={{ fontFamily:"monospace", fontSize:12 }}>{r.page||"/"}</div>
                <div style={{ fontSize:10, color:C.gray400, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:160 }}>{r.referrer||"Direct"}</div>
              </div>
              <div style={{ fontSize:10, color:C.gray400 }}>{ago(r.created_at)}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ── AUDIT LOG ──────────────────────────────────────────────── */
function AuditLog() {
  const [rows, setRows] = useState([]);
  useEffect(()=>{ sq("audit_log","?order=created_at.desc&limit=200").then(d=>setRows(d||[])); },[]);
  return (
    <div style={{ padding:24 }}>
      <div style={{ fontSize:20, fontWeight:900, marginBottom:20 }}>Audit Log</div>
      <TblWrap
        heads={["Action","Table","Record","Change","Time"]}
        empty="No audit entries yet. Run supabase_setup.sql to enable triggers."
        rows={rows.map((r,i)=>(
          <tr key={i}>
            <td style={tdStyle}><Badge color={r.action==="INSERT"?"green":r.action==="DELETE"?"red":"amber"}>{r.action}</Badge></td>
            <td style={{ ...tdStyle, fontFamily:"monospace" }}>{r.table_name}</td>
            <td style={{ ...tdStyle, fontFamily:"monospace", fontSize:10, color:C.gray400 }}>{(r.record_id||"").slice(0,8)}…</td>
            <td style={{ ...tdStyle, fontFamily:"monospace", fontSize:10, color:C.gray400, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{JSON.stringify(r.new_value||r.old_value||{})}</td>
            <td style={{ ...tdStyle, color:C.gray400, whiteSpace:"nowrap" }}>{ago(r.created_at)}</td>
          </tr>
        ))}
      />
    </div>
  );
}

/* ── SETTINGS ───────────────────────────────────────────────── */
function Settings({ toast }) {
  const [tab, setTab] = useState("pricing");
  const [pricing, setPricing] = useState({ price_basic:12, price_premium:18, price_bundle:25 });
  const [paystack, setPaystack] = useState({ test_public:"", test_secret:"", live_public:"", live_secret:"", mode:"test" });
  const [legal, setLegal] = useState({ privacy:"", terms:"", disclaimer:"", refund:"" });
  const [knust, setKnust] = useState({ excl_soc_unis:["KNUST","UMAT"], soc_exceptions:["political science","publishing studies","law"], nursing_track:"General Science" });
  const [tracks, setTracks] = useState({});
  const [appearance, setAppearance] = useState({ font_family:"Inter", font_size:135, heading_font:"Outfit" });
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    sq("settings","?select=key,value").then(d=>{
      (d||[]).forEach(row=>{
        if(row.key==="pricing") setPricing(v=>({...v,...(row.value||{})}));
        if(row.key==="payment_keys") setPaystack(v=>({...v,...(row.value||{})}));
        if(row.key==="legal") setLegal(v=>({...v,...(row.value||{})}));
        if(row.key==="knust_logic") setKnust(row.value||knust);
        if(row.key==="tracks") setTracks(row.value||{});
        if(row.key==="appearance") setAppearance(v=>({...v,...(row.value||{})}));
      });
    });
  },[]);

  const save = async(key,val)=>{ setSaving(true); await upsert("settings",key,val); setSaving(false); toast(`${key} saved`); };

  const TABS = [
    { id:"pricing", label:"💰 Pricing" },
    { id:"payment", label:"🔑 Paystack" },
    { id:"legal", label:"📄 Legal Pages" },
    { id:"knust", label:"🎓 KNUST/UMaT" },
    { id:"tracks", label:"📚 Track Electives" },
    { id:"appearance", label:"🎨 Appearance" },
  ];

  return (
    <div style={{ padding:24 }}>
      <div style={{ fontSize:20, fontWeight:900, marginBottom:16 }}>Settings</div>
      <div style={{ display:"flex", borderBottom:`2px solid ${C.gray200}`, marginBottom:24, overflowX:"auto" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"8px 16px", fontSize:12, fontWeight:600, whiteSpace:"nowrap", border:"none", borderBottom:`2px solid ${tab===t.id?C.violet:"transparent"}`, background:"none", color:tab===t.id?C.violet:C.gray400, cursor:"pointer", marginBottom:-2, fontFamily:"inherit" }}>{t.label}</button>
        ))}
      </div>

      {tab==="pricing" && (
        <div style={{ maxWidth:400, display:"flex", flexDirection:"column", gap:12 }}>
          <Card style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Plan Prices (GHC)</div>
            {[["price_basic","Basic (1 University)"],["price_premium","Premium (All Universities)"],["price_bundle","Bundle (3 Checks)"]].map(([k,l])=>(
              <FG key={k} label={l}><Inp value={pricing[k]} onChange={v=>setPricing(p=>({...p,[k]:parseInt(v)||0}))} type="number" /></FG>
            ))}
            <Btn full onClick={()=>save("pricing",pricing)} disabled={saving}>💾 Save Prices</Btn>
          </Card>
          <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:12, padding:12, fontSize:12, color:"#92400e" }}>
            <strong>⚠️ Note:</strong> Also update the PRICES constant in the student app to keep fallbacks in sync.
          </div>
        </div>
      )}

      {tab==="payment" && (
        <div style={{ maxWidth:480, display:"flex", flexDirection:"column", gap:14 }}>
          <Card style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>Payment Mode</div>
            <div style={{ fontSize:12, color:C.gray600, marginBottom:14 }}>Switch between Test and Live. Active mode's keys are sent to the student site.</div>
            <div style={{ display:"flex", gap:10, marginBottom:10 }}>
              <button onClick={()=>setPaystack(p=>({...p,mode:"test"}))} style={{ flex:1, padding:"10px 0", borderRadius:10, fontWeight:700, fontSize:13, border:"2px solid", cursor:"pointer", fontFamily:"inherit", background:paystack.mode==="test"?C.amber:C.white, color:paystack.mode==="test"?C.white:C.gray600, borderColor:paystack.mode==="test"?C.amber:C.gray200 }}>🧪 Test Mode</button>
              <button onClick={()=>setPaystack(p=>({...p,mode:"live"}))} style={{ flex:1, padding:"10px 0", borderRadius:10, fontWeight:700, fontSize:13, border:"2px solid", cursor:"pointer", fontFamily:"inherit", background:paystack.mode==="live"?C.green:C.white, color:paystack.mode==="live"?C.white:C.gray600, borderColor:paystack.mode==="live"?C.green:C.gray200 }}>🚀 Live Mode</button>
            </div>
            <div style={{ fontSize:12, fontWeight:700, textAlign:"center", padding:"8px 12px", borderRadius:8, background:paystack.mode==="live"?"#f0fdf4":"#fffbeb", color:paystack.mode==="live"?"#047857":"#92400e" }}>
              {paystack.mode==="live"?"🚀 LIVE — Real payments are being processed":"🧪 TEST — No real money is charged"}
            </div>
          </Card>
          <Card style={{ padding:20, display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontWeight:700, fontSize:14 }}>🧪 Test Keys</span>
              {paystack.mode==="test" && <span style={{ background:"#fef3c7", color:"#92400e", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>ACTIVE</span>}
            </div>
            <div style={{ fontSize:12, color:C.gray600 }}>Paystack Dashboard → Test Mode → Settings → API Keys</div>
            <FG label="Test Public Key"><Inp value={paystack.test_public||""} onChange={v=>setPaystack(p=>({...p,test_public:v}))} placeholder="pk_test_xxxxxxxxxxxx" /></FG>
            <FG label="Test Secret Key"><Inp value={paystack.test_secret||""} onChange={v=>setPaystack(p=>({...p,test_secret:v}))} placeholder="sk_test_xxxxxxxxxxxx" type="password" /></FG>
          </Card>
          <Card style={{ padding:20, display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontWeight:700, fontSize:14 }}>🚀 Live Keys</span>
              {paystack.mode==="live" && <span style={{ background:"#dcfce7", color:"#047857", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>ACTIVE</span>}
            </div>
            <div style={{ fontSize:12, color:C.gray600 }}>Paystack Dashboard → Live Mode → Settings → API Keys</div>
            <FG label="Live Public Key"><Inp value={paystack.live_public||""} onChange={v=>setPaystack(p=>({...p,live_public:v}))} placeholder="pk_live_xxxxxxxxxxxx" /></FG>
            <FG label="Live Secret Key"><Inp value={paystack.live_secret||""} onChange={v=>setPaystack(p=>({...p,live_secret:v}))} placeholder="sk_live_xxxxxxxxxxxx" type="password" /></FG>
          </Card>
          <Btn lg full onClick={()=>{ const pub=paystack.mode==="live"?paystack.live_public:paystack.test_public; const sec=paystack.mode==="live"?paystack.live_secret:paystack.test_secret; save("payment_keys",{...paystack,paystack:pub,secret:sec}); }} disabled={saving}>💾 Save & Apply Keys</Btn>
          <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:12, padding:12, fontSize:12, color:"#1d4ed8" }}><strong>How it works:</strong> Clicking Save applies the active mode's public key to the student site instantly.</div>
        </div>
      )}

      {tab==="legal" && (
        <div style={{ maxWidth:640, display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ fontSize:12, color:C.gray600 }}>Write the full text for each legal page.</div>
          {[["privacy","Privacy Policy"],["terms","Terms of Service"],["disclaimer","Disclaimer"],["refund","Refund Policy"]].map(([k,l])=>(
            <Card key={k} style={{ padding:16 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontWeight:700, fontSize:14 }}>{l}</span>
                <Btn sm onClick={()=>save("legal",{...legal,[k]:legal[k]})} disabled={saving}>Save</Btn>
              </div>
              <Txta value={legal[k]||""} onChange={v=>setLegal(l2=>({...l2,[k]:v}))} placeholder={`Enter full ${l} text…`} rows={5} />
            </Card>
          ))}
          <Btn lg full onClick={()=>save("legal",legal)} disabled={saving}>💾 Save All Legal Pages</Btn>
        </div>
      )}

      {tab==="knust" && (
        <div style={{ maxWidth:500, display:"flex", flexDirection:"column", gap:12 }}>
          <Card style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>Universities Excluding Social Studies</div>
            <div style={{ fontSize:12, color:C.gray600, marginBottom:10 }}>Social Studies is never counted for these universities.</div>
            <Inp value={(knust.excl_soc_unis||[]).join(", ")} onChange={v=>setKnust(k=>({...k,excl_soc_unis:v.split(",").map(x=>x.trim()).filter(Boolean)}))} placeholder="KNUST, UMAT" />
          </Card>
          <Card style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>KNUST Social Studies Exception Programmes</div>
            <div style={{ fontSize:12, color:C.gray600, marginBottom:10 }}>For these programmes, Social Studies replaces Integrated Science.</div>
            <Inp value={(knust.soc_exceptions||[]).join(", ")} onChange={v=>setKnust(k=>({...k,soc_exceptions:v.split(",").map(x=>x.trim().toLowerCase()).filter(Boolean)}))} placeholder="political science, publishing studies, law" />
          </Card>
          <Card style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>KNUST Nursing / Midwifery Track</div>
            <div style={{ fontSize:12, color:C.gray600, marginBottom:10 }}>Only this track can apply for KNUST Nursing and Midwifery.</div>
            <Inp value={knust.nursing_track||"General Science"} onChange={v=>setKnust(k=>({...k,nursing_track:v}))} placeholder="General Science" />
          </Card>
          <Btn lg full onClick={()=>save("knust_logic",knust)} disabled={saving}>💾 Save KNUST Logic</Btn>
        </div>
      )}

      {tab==="tracks" && (
        <div style={{ maxWidth:640, display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ fontSize:12, color:C.gray600 }}>Edit elective subjects per track. Separate with commas.</div>
          {TRACKS.map(t=>(
            <Card key={t} style={{ padding:16 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:8 }}>{t}</div>
              <Txta value={((tracks[t]||{}).e||[]).join(", ")} onChange={v=>setTracks(tr=>({...tr,[t]:{...(tr[t]||{}),e:v.split(",").map(x=>x.trim()).filter(Boolean)}}))} placeholder="Subject 1, Subject 2…" rows={2} />
            </Card>
          ))}
          <Btn lg full onClick={()=>save("tracks",tracks)} disabled={saving}>💾 Save Track Electives</Btn>
        </div>
      )}

      {tab==="appearance" && (
        <div style={{ maxWidth:520, display:"flex", flexDirection:"column", gap:14 }}>
          <Card style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>Body Font</div>
            <div style={{ fontSize:12, color:C.gray600, marginBottom:10 }}>Main font for all text on the student site.</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {FONTS.map(f=>(
                <button key={f} onClick={()=>setAppearance(a=>({...a,font_family:f}))} style={{ padding:"10px 12px", borderRadius:10, border:`2px solid ${appearance.font_family===f?C.violet:C.gray200}`, background:appearance.font_family===f?C.violetLight:C.white, color:appearance.font_family===f?"#6d28d9":C.gray600, fontFamily:f, fontSize:13, fontWeight:600, cursor:"pointer", textAlign:"left" }}>
                  {f} {appearance.font_family===f && "✓"}
                </button>
              ))}
            </div>
          </Card>
          <Card style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>Heading Font</div>
            <div style={{ fontSize:12, color:C.gray600, marginBottom:10 }}>Used for page titles and section headings.</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {HFONTS.map(f=>(
                <button key={f} onClick={()=>setAppearance(a=>({...a,heading_font:f}))} style={{ padding:"10px 12px", borderRadius:10, border:`2px solid ${appearance.heading_font===f?C.violet:C.gray200}`, background:appearance.heading_font===f?C.violetLight:C.white, color:appearance.heading_font===f?"#6d28d9":C.gray600, fontFamily:f, fontSize:13, fontWeight:600, cursor:"pointer", textAlign:"left" }}>
                  {f} {appearance.heading_font===f && "✓"}
                </button>
              ))}
            </div>
          </Card>
          <Card style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>Font Size — {appearance.font_size}%</div>
            <input type="range" min={80} max={200} step={5} value={appearance.font_size||135} onChange={e=>setAppearance(a=>({...a,font_size:parseInt(e.target.value)}))} style={{ width:"100%", accentColor:C.violet, margin:"10px 0" }} />
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
              {[90,100,110,120,135,150,175,200].map(s=>(
                <button key={s} onClick={()=>setAppearance(a=>({...a,font_size:s}))} style={{ padding:"5px 12px", borderRadius:8, border:`1px solid ${appearance.font_size===s?C.violet:C.gray200}`, background:appearance.font_size===s?C.violet:C.white, color:appearance.font_size===s?C.white:C.gray600, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{s}%</button>
              ))}
            </div>
            <div style={{ background:C.gray50, borderRadius:10, padding:14 }}>
              <div style={{ fontSize:11, color:C.gray400, marginBottom:6 }}>Preview at {appearance.font_size}%:</div>
              <div style={{ fontSize:`${appearance.font_size}%`, fontFamily:appearance.font_family }}>
                <div style={{ fontFamily:appearance.heading_font, fontWeight:900, fontSize:"1.2em", marginBottom:4 }}>UniPredict Ghana</div>
                <div>Check your WASSCE eligibility across 58 universities.</div>
              </div>
            </div>
          </Card>
          <Btn lg full onClick={()=>save("appearance",appearance)} disabled={saving}>💾 Save Appearance</Btn>
          <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:12, padding:12, fontSize:12, color:"#1d4ed8" }}><strong>How it works:</strong> The student site loads these settings from Supabase on every visit. Changes apply within seconds.</div>
        </div>
      )}
    </div>
  );
}

/* ── ROOT APP ───────────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const toast = msg => setToastMsg(msg);

  const pages = {
    dashboard: <Dashboard />,
    students: <Students />,
    results: <StudentResults />,
    payments: <Payments />,
    refunds: <Refunds toast={toast} />,
    universities: <Universities toast={toast} />,
    programmes: <Programmes toast={toast} />,
    cutoffs: <CutoffManager toast={toast} />,
    import: <ProgrammeImport toast={toast} />,
    scholarships: <Scholarships toast={toast} />,
    forms: <AdmissionForms toast={toast} />,
    news: <News toast={toast} />,
    ticker: <Notifications toast={toast} />,
    aiinbox: <AIInbox toast={toast} />,
    sms: <SMSBroadcast toast={toast} />,
    analytics: <Analytics />,
    visitors: <Visitors />,
    audit: <AuditLog />,
    settings: <Settings toast={toast} />,
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:C.gray50, fontFamily:"Inter,-apple-system,sans-serif", fontSize:13, color:C.gray900 }}>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{ flex:1, overflowY:"auto", minWidth:0 }}>
        {pages[page]||pages.dashboard}
      </main>
      {toastMsg && <Toast msg={toastMsg} onClose={()=>setToastMsg(null)} />}
    </div>
  );
}
