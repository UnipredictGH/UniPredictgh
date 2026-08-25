import React, { useState, useEffect, useRef } from 'react';

/* ── CONFIG ─────────────────────────────────────────────── */
const SUPA_URL = 'https://urfqevstrwsrtysbllah.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnFldnN0cndzcnR5c2JsbGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNTQ5OTQsImV4cCI6MjEwMDkzMDk5NH0.9TPgghMQdHjqwRm51dEVHJ6O115FPBoYBfZHO_siTYI';
const H = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' };
const TRACKS = ['General Science','General Arts','Business','Home Economics','Visual Arts','Technical','Agricultural Science'];

async function sq(t, p = '') {
  try { const r = await fetch(`${SUPA_URL}/rest/v1/${t}${p}`, { headers: H }); return r.json(); } catch { return []; }
}
async function ins(t, b) {
  try { const r = await fetch(`${SUPA_URL}/rest/v1/${t}`, { method: 'POST', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify(b) }); return r.json(); } catch { return null; }
}
async function upd(t, id, b) {
  try { const r = await fetch(`${SUPA_URL}/rest/v1/${t}?id=eq.${id}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify(b) }); return r.json(); } catch { return null; }
}
async function del(t, id) {
  try { await fetch(`${SUPA_URL}/rest/v1/${t}?id=eq.${id}`, { method: 'DELETE', headers: H }); } catch {}
}
async function upsert(t, key, val) {
  const ex = await sq(t, `?key=eq.${key}&select=id`);
  if (ex?.[0]?.id) return upd(t, ex[0].id, { value: val, updated_at: new Date().toISOString() });
  return ins(t, [{ key, value: val }]);
}

const ago = ts => { if (!ts) return '—'; const d = Math.floor((Date.now() - new Date(ts)) / 1000); if (d < 60) return `${d}s ago`; if (d < 3600) return `${Math.floor(d / 60)}m ago`; if (d < 86400) return `${Math.floor(d / 3600)}h ago`; return `${Math.floor(d / 86400)}d ago`; };
const fmt = n => (n || 0).toLocaleString();
const fmtGhc = p => `GHC ${((p || 0) / 100).toFixed(2)}`;

/* ── SHARED UI ───────────────────────────────────────────── */
function Badge({ children, color = 'gray' }) {
  const colors = { gray: 'bg-gray-100 text-gray-600', green: 'bg-green-100 text-green-700', red: 'bg-red-100 text-red-700', amber: 'bg-amber-100 text-amber-700', violet: 'bg-violet-100 text-violet-700', blue: 'bg-blue-100 text-blue-700' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[color] || colors.gray}`}>{children}</span>;
}

function Btn({ children, onClick, variant = 'primary', sm, lg, full, disabled }) {
  const base = 'inline-flex items-center justify-center gap-1 font-semibold rounded-lg cursor-pointer border-none transition-opacity disabled:opacity-40 disabled:cursor-not-allowed';
  const size = lg ? 'px-5 py-2.5 text-sm' : sm ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-[12px]';
  const v = { primary: 'bg-violet-600 text-white hover:bg-violet-700', danger: 'bg-red-500 text-white hover:bg-red-600', ghost: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50', success: 'bg-emerald-500 text-white hover:bg-emerald-600', amber: 'bg-amber-500 text-white hover:bg-amber-600' };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${size} ${v[variant] || v.primary} ${full ? 'w-full justify-center' : ''}`}>{children}</button>;
}

function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>{children}</div>;
}

function Input({ value, onChange, placeholder, type = 'text' }) {
  return <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white focus:border-violet-400 focus:ring-1 focus:ring-violet-100" />;
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white focus:border-violet-400 resize-y" />;
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white focus:border-violet-400 cursor-pointer">
      {placeholder && <option value="">{placeholder}</option>}
      {(options || []).map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className={`bg-white rounded-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-bold text-[15px]">{title}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-[13px] font-medium shadow-xl z-50 flex items-center gap-2 animate-pulse">✓ {msg}</div>;
}

function StatCard({ icon, label, value, color = 'violet' }) {
  const bg = { violet: 'bg-violet-50 text-violet-600', green: 'bg-green-50 text-green-600', amber: 'bg-amber-50 text-amber-600', blue: 'bg-blue-50 text-blue-600' };
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${bg[color]}`}>{icon}</div>
        <div><div className="text-[11px] text-gray-400 mb-0.5">{label}</div><div className="text-[22px] font-black leading-none">{value}</div></div>
      </div>
    </Card>
  );
}

/* ── NAV ─────────────────────────────────────────────────── */
const NAV = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'students', icon: '👥', label: 'Students' },
  { id: 'results', icon: '🎯', label: 'Student Results' },
  { id: 'payments', icon: '💳', label: 'Payments' },
  { id: 'refunds', icon: '↩️', label: 'Refunds' },
  { id: 'universities', icon: '🏛️', label: 'Universities' },
  { id: 'programmes', icon: '📚', label: 'Programmes' },
  { id: 'cutoffs', icon: '📐', label: 'Cut-Off Manager' },
  { id: 'import', icon: '📥', label: 'Programme Import' },
  { id: 'scholarships', icon: '🎓', label: 'Scholarships' },
  { id: 'forms', icon: '📝', label: 'Admission Forms' },
  { id: 'news', icon: '📰', label: 'News' },
  { id: 'ticker', icon: '📣', label: 'Notifications' },
  { id: 'aiinbox', icon: '🤖', label: 'AI Inbox' },
  { id: 'sms', icon: '💬', label: 'SMS Broadcast' },
  { id: 'analytics', icon: '📈', label: 'Analytics' },
  { id: 'visitors', icon: '👁️', label: 'Visitors' },
  { id: 'audit', icon: '🔍', label: 'Audit Log' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  return (
    <div className={`${collapsed ? 'w-14' : 'w-52'} flex-shrink-0 bg-gray-900 flex flex-col min-h-screen transition-all duration-200 sticky top-0 h-screen overflow-y-auto`}>
      <div className="flex items-center gap-2 p-3 border-b border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-base flex-shrink-0">🎓</div>
        {!collapsed && <div className="text-white font-black text-[13px] leading-tight">UniPredict<br /><span className="text-gray-500 font-normal text-[10px]">Admin Panel</span></div>}
        <button onClick={() => setCollapsed(c => !c)} className="ml-auto text-gray-500 hover:text-gray-300 text-xs">{collapsed ? '→' : '←'}</button>
      </div>
      <nav className="flex-1 py-2">
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} className={`flex items-center gap-2.5 px-3 py-2 w-full text-left border-l-2 transition-all text-[12.5px] font-medium ${page === n.id ? 'bg-violet-600 text-white border-violet-400' : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-800'}`}>
            <span className="text-base flex-shrink-0">{n.icon}</span>
            {!collapsed && <span className="truncate">{n.label}</span>}
          </button>
        ))}
      </nav>
      {!collapsed && <div className="p-3 text-[10px] text-gray-600 border-t border-gray-800">© 2025 UniPredict Ghana</div>}
    </div>
  );
}

/* ── DASHBOARD ───────────────────────────────────────────── */
function Dashboard() {
  const [stats, setStats] = useState({ students: 0, revenue: 0, today: 0, paid: 0 });
  const [tracks, setTracks] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    sq('payments', '?select=amount,plan,created_at&order=created_at.desc&limit=300').then(d => {
      const today = new Date().toDateString();
      setStats(s => ({ ...s, revenue: (d || []).reduce((a, p) => a + (p.amount || 0), 0), today: (d || []).filter(p => new Date(p.created_at).toDateString() === today).length, paid: (d || []).length }));
      setRecent((d || []).slice(0, 6));
    });
    sq('student_checks', '?select=track&limit=500').then(d => {
      const c = {}; (d || []).forEach(r => { if (r.track) c[r.track] = (c[r.track] || 0) + 1; });
      setTracks(Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 5));
      setStats(s => ({ ...s, students: (d || []).length }));
    });
  }, []);

  const maxT = Math.max(...tracks.map(t => t[1]), 1);

  return (
    <div className="p-6">
      <div className="mb-5"><div className="text-xl font-black">Dashboard</div><div className="text-xs text-gray-400">Welcome back, Alexander.</div></div>
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard icon="👥" label="Total Students" value={fmt(stats.students)} color="violet" />
        <StatCard icon="💰" label="Total Revenue" value={fmtGhc(stats.revenue)} color="green" />
        <StatCard icon="🎯" label="Checks Today" value={fmt(stats.today)} color="amber" />
        <StatCard icon="💳" label="Paid Checks" value={fmt(stats.paid)} color="blue" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="font-bold text-[13px] mb-3">Top SHS Tracks</div>
          {tracks.map(([t, n]) => (
            <div key={t} className="flex items-center gap-2 mb-2">
              <div className="text-[12px] w-32 truncate">{t}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${(n / maxT) * 100}%` }} /></div>
              <div className="text-[11px] text-gray-400 w-5 text-right">{n}</div>
            </div>
          ))}
          {!tracks.length && <div className="text-xs text-gray-400">No data yet</div>}
        </Card>
        <Card className="p-4">
          <div className="font-bold text-[13px] mb-3">Recent Payments</div>
          {recent.map((p, i) => (
            <div key={i} className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><Badge color={p.plan === 'premium' ? 'violet' : p.plan === 'bundle' ? 'amber' : 'gray'}>{p.plan}</Badge><span className="text-[11px] text-gray-400">{ago(p.created_at)}</span></div>
              <span className="text-[12px] font-bold">{fmtGhc(p.amount)}</span>
            </div>
          ))}
          {!recent.length && <div className="text-xs text-gray-400">No payments yet</div>}
        </Card>
      </div>
    </div>
  );
}

/* ── STUDENTS ────────────────────────────────────────────── */
function Students() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { sq('student_checks', '?order=checked_at.desc&limit=300').then(d => { setRows(d || []); setLoading(false); }); }, []);

  const filtered = rows.filter(r => (r.phone || '').includes(q) || (r.track || '').toLowerCase().includes(q.toLowerCase()) || (r.plan || '').includes(q));

  const exportCSV = () => {
    const csv = ['Phone,Track,Plan,Aggregate,Date', ...rows.map(r => `${r.phone},${r.track},${r.plan},${r.aggregate},${r.checked_at}`)].join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv); a.download = 'students.csv'; a.click();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><div className="text-xl font-black">Students</div><div className="text-xs text-gray-400">{rows.length} total checks</div></div>
        <Btn onClick={exportCSV} variant="ghost">⬇ Export CSV</Btn>
      </div>
      <Card className="p-2 mb-3"><Input value={q} onChange={setQ} placeholder="Search by phone, track, plan..." /></Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead><tr className="bg-gray-50 border-b border-gray-100">{['Phone','Track','Plan','Aggregate','Electives','Date'].map(h => <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>}
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-semibold">{r.phone || '—'}</td>
                  <td className="px-3 py-2.5 text-gray-500">{r.track || '—'}</td>
                  <td className="px-3 py-2.5"><Badge color={r.plan === 'premium' ? 'violet' : r.plan === 'bundle' ? 'amber' : 'gray'}>{r.plan}</Badge></td>
                  <td className="px-3 py-2.5 font-black text-violet-600">{r.aggregate || '—'}</td>
                  <td className="px-3 py-2.5 text-gray-400 max-w-[140px] truncate">{(r.electives || []).join(', ') || '—'}</td>
                  <td className="px-3 py-2.5 text-gray-400">{ago(r.checked_at)}</td>
                </tr>
              ))}
              {!loading && !filtered.length && <tr><td colSpan={6} className="text-center py-8 text-gray-400">No students found</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── STUDENT RESULTS ─────────────────────────────────────── */
function StudentResults() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => { sq('student_checks', '?order=checked_at.desc&limit=300&select=id,phone,track,plan,aggregate,grades_core,electives,elective_grades,checked_at,payment_ref').then(d => setRows(d || [])); }, []);

  const filtered = rows.filter(r => (r.phone || '').includes(q) || (r.track || '').toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-6">
      <div className="text-xl font-black mb-1">Student Results Viewer</div>
      <div className="text-xs text-gray-400 mb-4">See exactly what every student received</div>
      <Card className="p-2 mb-3"><Input value={q} onChange={setQ} placeholder="Search by phone or track..." /></Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead><tr className="bg-gray-50 border-b border-gray-100">{['Phone','Track','Plan','Aggregate','Date',''].map(h => <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-semibold">{r.phone}</td>
                  <td className="px-3 py-2.5 text-gray-500">{r.track}</td>
                  <td className="px-3 py-2.5"><Badge color={r.plan === 'premium' ? 'violet' : 'gray'}>{r.plan}</Badge></td>
                  <td className="px-3 py-2.5 font-black text-violet-600">{r.aggregate || '—'}</td>
                  <td className="px-3 py-2.5 text-gray-400">{ago(r.checked_at)}</td>
                  <td className="px-3 py-2.5"><Btn sm onClick={() => setSelected(r)}>View</Btn></td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={6} className="text-center py-8 text-gray-400">No students</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      {selected && (
        <Modal title={`Results — ${selected.phone}`} onClose={() => setSelected(null)} wide>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[['Track', selected.track], ['Plan', selected.plan], ['Aggregate', selected.aggregate], ['Ref', (selected.payment_ref || '').slice(0, 16)],
              ['English', selected.grades_core?.eng], ['Maths', selected.grades_core?.maths], ['Science', selected.grades_core?.sci], ['Social Studies', selected.grades_core?.soc]
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-lg p-3">
                <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">{k}</div>
                <div className="font-bold text-[14px]">{v || '—'}</div>
              </div>
            ))}
          </div>
          <div className="bg-violet-50 rounded-xl p-3">
            <div className="text-[10px] text-violet-600 font-bold uppercase mb-2">Electives & Grades</div>
            <div className="flex flex-wrap gap-2">
              {(selected.electives || []).map(e => (
                <span key={e} className="bg-white border border-violet-200 text-violet-700 px-2.5 py-1 rounded-lg text-[12px]">{e} — {selected.elective_grades?.[e] || '?'}</span>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── PAYMENTS ────────────────────────────────────────────── */
function Payments() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => { sq('payments', '?order=created_at.desc&limit=300').then(d => setRows(d || [])); }, []);

  const filtered = rows.filter(r => (r.phone || '').includes(q) || (r.reference || '').includes(q) || (r.plan || '').includes(q));
  const total = rows.reduce((s, r) => s + (r.amount || 0), 0);

  const exportCSV = () => {
    const csv = ['Reference,Phone,Plan,Amount,Status,Date', ...rows.map(r => `${r.reference},${r.phone},${r.plan},${fmtGhc(r.amount)},${r.status},${r.created_at}`)].join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv); a.download = 'payments.csv'; a.click();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><div className="text-xl font-black">Payments</div><div className="text-xs text-gray-400">Total: <strong className="text-green-600">{fmtGhc(total)}</strong></div></div>
        <Btn onClick={exportCSV} variant="ghost">⬇ Export CSV</Btn>
      </div>
      <Card className="p-2 mb-3"><Input value={q} onChange={setQ} placeholder="Search..." /></Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead><tr className="bg-gray-50 border-b border-gray-100">{['Reference','Phone','Plan','Amount','Status','Date'].map(h => <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-mono text-[10px] text-gray-400">{(r.reference || '—').slice(0, 18)}</td>
                  <td className="px-3 py-2.5 font-semibold">{r.phone || '—'}</td>
                  <td className="px-3 py-2.5"><Badge color={r.plan === 'premium' ? 'violet' : r.plan === 'bundle' ? 'amber' : 'gray'}>{r.plan}</Badge></td>
                  <td className="px-3 py-2.5 font-bold">{fmtGhc(r.amount)}</td>
                  <td className="px-3 py-2.5"><Badge color={r.status === 'success' ? 'green' : 'red'}>{r.status}</Badge></td>
                  <td className="px-3 py-2.5 text-gray-400">{ago(r.created_at)}</td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={6} className="text-center py-8 text-gray-400">No payments found</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── REFUNDS ─────────────────────────────────────────────── */
function Refunds({ toast }) {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => { sq('refund_requests', '?order=created_at.desc').then(d => setRows(d || [])); }, []);

  const handle = async (id, status) => {
    await upd('refund_requests', id, { status, admin_note: note, resolved_at: new Date().toISOString() });
    setRows(r => r.map(x => x.id === id ? { ...x, status } : x));
    setModal(null); setNote(''); toast(`Refund ${status}`);
  };

  return (
    <div className="p-6">
      <div className="text-xl font-black mb-4">Refund Manager</div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead><tr className="bg-gray-50 border-b border-gray-100">{['Phone','Reference','Reason','Status','Date',''].map(h => <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-3 py-2.5 font-semibold">{r.phone}</td>
                  <td className="px-3 py-2.5 font-mono text-[10px] text-gray-400">{(r.payment_ref || '').slice(0, 14)}</td>
                  <td className="px-3 py-2.5 max-w-[120px] truncate">{r.reason}</td>
                  <td className="px-3 py-2.5"><Badge color={r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'red' : 'amber'}>{r.status || 'pending'}</Badge></td>
                  <td className="px-3 py-2.5 text-gray-400">{ago(r.created_at)}</td>
                  <td className="px-3 py-2.5">{r.status === 'pending' && <Btn sm onClick={() => setModal(r)}>Review</Btn>}</td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={6} className="text-center py-8 text-gray-400">No refund requests</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      {modal && (
        <Modal title="Review Refund" onClose={() => setModal(null)}>
          <div className="bg-gray-50 rounded-lg p-3 mb-3"><div className="text-[11px] text-gray-400 mb-1">Phone</div><div className="font-bold">{modal.phone}</div></div>
          <div className="bg-gray-50 rounded-lg p-3 mb-3"><div className="text-[11px] text-gray-400 mb-1">Reason</div><div>{modal.reason}</div></div>
          <div className="mb-4"><label className="block text-[12px] font-semibold mb-1">Admin Note</label><Textarea value={note} onChange={setNote} placeholder="Optional note..." rows={2} /></div>
          <div className="flex gap-2">
            <Btn full variant="success" onClick={() => handle(modal.id, 'approved')}>✓ Approve</Btn>
            <Btn full variant="danger" onClick={() => handle(modal.id, 'rejected')}>✕ Reject</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── UNIVERSITIES ────────────────────────────────────────── */
function Universities({ toast }) {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null);
  const blank = { code: '', name: '', location: '', type: 'Public', active: true };
  const [form, setForm] = useState(blank);
  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { sq('universities', '?order=name.asc&limit=200').then(d => setRows(d || [])); }, []);

  const open = (r = null) => { setForm(r ? { code: r.code, name: r.name, location: r.location || '', type: r.type || 'Public', active: r.active !== false } : blank); setModal(r || {}); };
  const save = async () => {
    if (modal?.id) { await upd('universities', modal.id, form); setRows(r => r.map(x => x.id === modal.id ? { ...x, ...form } : x)); }
    else { const d = await ins('universities', [form]); if (d?.[0]) setRows(r => [...r, d[0]]); }
    setModal(null); toast('University saved');
  };
  const toggle = async r => { await upd('universities', r.id, { active: !r.active }); setRows(rows => rows.map(x => x.id === r.id ? { ...x, active: !r.active } : x)); };
  const remove = async r => { if (!confirm(`Delete ${r.name}?`)) return; await del('universities', r.id); setRows(rows => rows.filter(x => x.id !== r.id)); toast('Deleted'); };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><div className="text-xl font-black">Universities</div><div className="text-xs text-gray-400">{rows.length} institutions</div></div>
        <Btn onClick={() => open()}>+ Add University</Btn>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead><tr className="bg-gray-50 border-b border-gray-100">{['Code','Name','Location','Type','Status','Actions'].map(h => <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-mono font-bold text-violet-600">{r.code}</td>
                  <td className="px-3 py-2.5 font-medium">{r.name}</td>
                  <td className="px-3 py-2.5 text-gray-400">{r.location}</td>
                  <td className="px-3 py-2.5"><Badge>{r.type}</Badge></td>
                  <td className="px-3 py-2.5"><Badge color={r.active !== false ? 'green' : 'red'}>{r.active !== false ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <Btn sm variant="ghost" onClick={() => open(r)}>Edit</Btn>
                      <Btn sm variant={r.active !== false ? 'amber' : 'success'} onClick={() => toggle(r)}>{r.active !== false ? 'Off' : 'On'}</Btn>
                      <Btn sm variant="danger" onClick={() => remove(r)}>Del</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {modal !== null && (
        <Modal title={modal?.id ? 'Edit University' : 'Add University'} onClose={() => setModal(null)}>
          <div className="space-y-3 mb-4">
            <div><label className="block text-[12px] font-semibold mb-1">Code</label><Input value={form.code} onChange={v => F('code', v.toUpperCase())} placeholder="UG" /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Full Name</label><Input value={form.name} onChange={v => F('name', v)} placeholder="University of Ghana" /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Location</label><Input value={form.location} onChange={v => F('location', v)} placeholder="Legon, Accra" /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Type</label><Select value={form.type} onChange={v => F('type', v)} options={['Public', 'Private', 'Technical']} /></div>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.active} onChange={e => F('active', e.target.checked)} /> Active</label>
          </div>
          <div className="flex gap-2"><Btn full onClick={save}>Save</Btn><Btn full variant="ghost" onClick={() => setModal(null)}>Cancel</Btn></div>
        </Modal>
      )}
    </div>
  );
}

/* ── PROGRAMMES ──────────────────────────────────────────── */
function Programmes({ toast }) {
  const [rows, setRows] = useState([]);
  const [unis, setUnis] = useState([]);
  const [q, setQ] = useState('');
  const [uF, setUF] = useState('');
  const [modal, setModal] = useState(null);
  const blank = { name: '', university_id: '', cutoff: 24, required_track: [], careers: '', degree_type: 'BSc', active: true };
  const [form, setForm] = useState(blank);
  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    sq('universities', '?order=name.asc&select=id,code,name').then(d => setUnis(d || []));
    sq('programmes', '?order=name.asc&limit=500&select=id,name,cutoff,required_track,careers,degree_type,active,university_id,universities(code)').then(d => setRows(d || []));
  }, []);

  const filtered = rows.filter(r => (r.name || '').toLowerCase().includes(q.toLowerCase()) && (!uF || r.university_id === uF));
  const open = (r = null) => { setForm(r ? { name: r.name, university_id: r.university_id, cutoff: r.cutoff || 24, required_track: Array.isArray(r.required_track) ? r.required_track : [], careers: r.careers || '', degree_type: r.degree_type || 'BSc', active: r.active !== false } : blank); setModal(r || {}); };
  const save = async () => {
    if (modal?.id) { await upd('programmes', modal.id, form); setRows(r => r.map(x => x.id === modal.id ? { ...x, ...form } : x)); }
    else { const d = await ins('programmes', [form]); if (d?.[0]) setRows(r => [...r, d[0]]); }
    setModal(null); toast('Saved');
  };
  const toggle = async r => { await upd('programmes', r.id, { active: !r.active }); setRows(rows => rows.map(x => x.id === r.id ? { ...x, active: !r.active } : x)); };
  const remove = async r => { if (!confirm(`Delete ${r.name}?`)) return; await del('programmes', r.id); setRows(rows => rows.filter(x => x.id !== r.id)); toast('Deleted'); };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><div className="text-xl font-black">Programmes</div><div className="text-xs text-gray-400">{rows.length} programmes</div></div>
        <Btn onClick={() => open()}>+ Add</Btn>
      </div>
      <div className="flex gap-2 mb-3">
        <Card className="flex-1 p-2"><Input value={q} onChange={setQ} placeholder="Search programmes..." /></Card>
        <Card className="w-40 p-2"><Select value={uF} onChange={setUF} options={unis.map(u => ({ value: u.id, label: u.code }))} placeholder="All Unis" /></Card>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead><tr className="bg-gray-50 border-b border-gray-100">{['Programme','Uni','Cut-Off','Type','Status','Actions'].map(h => <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.slice(0, 100).map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium max-w-[180px] truncate">{r.name}</td>
                  <td className="px-3 py-2.5 text-gray-400">{r.universities?.code || '—'}</td>
                  <td className="px-3 py-2.5 font-black text-violet-600">{r.cutoff}</td>
                  <td className="px-3 py-2.5 text-gray-400">{r.degree_type}</td>
                  <td className="px-3 py-2.5"><Badge color={r.active !== false ? 'green' : 'red'}>{r.active !== false ? 'On' : 'Off'}</Badge></td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <Btn sm variant="ghost" onClick={() => open(r)}>Edit</Btn>
                      <Btn sm variant={r.active !== false ? 'amber' : 'success'} onClick={() => toggle(r)}>{r.active !== false ? 'Off' : 'On'}</Btn>
                      <Btn sm variant="danger" onClick={() => remove(r)}>Del</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length > 100 && <tr><td colSpan={6} className="text-center py-3 text-[12px] text-gray-400">Showing 100 of {filtered.length} — use search</td></tr>}
              {!filtered.length && <tr><td colSpan={6} className="text-center py-8 text-gray-400">No programmes found</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      {modal !== null && (
        <Modal title={modal?.id ? 'Edit Programme' : 'Add Programme'} onClose={() => setModal(null)} wide>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="col-span-2"><label className="block text-[12px] font-semibold mb-1">Programme Name</label><Input value={form.name} onChange={v => F('name', v)} placeholder="BSc Computer Science" /></div>
            <div><label className="block text-[12px] font-semibold mb-1">University</label><Select value={form.university_id} onChange={v => F('university_id', v)} options={unis.map(u => ({ value: u.id, label: `${u.code} — ${u.name}` }))} placeholder="Select" /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Cut-Off</label><Input value={form.cutoff} onChange={v => F('cutoff', parseInt(v) || 0)} placeholder="24" type="number" /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Degree Type</label><Input value={form.degree_type} onChange={v => F('degree_type', v)} placeholder="BSc, BA, HND..." /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Career Paths</label><Input value={form.careers} onChange={v => F('careers', v)} placeholder="Software Engineer..." /></div>
            <div className="col-span-2">
              <label className="block text-[12px] font-semibold mb-2">Required Tracks (empty = all)</label>
              <div className="flex flex-wrap gap-2">
                {TRACKS.map(t => (
                  <label key={t} className="flex items-center gap-1.5 text-[12px] cursor-pointer">
                    <input type="checkbox" checked={form.required_track.includes(t)} onChange={e => F('required_track', e.target.checked ? [...form.required_track, t] : form.required_track.filter(x => x !== t))} /> {t}
                  </label>
                ))}
              </div>
            </div>
            <label className="col-span-2 flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.active} onChange={e => F('active', e.target.checked)} /> Active</label>
          </div>
          <div className="flex gap-2"><Btn full onClick={save}>Save</Btn><Btn full variant="ghost" onClick={() => setModal(null)}>Cancel</Btn></div>
        </Modal>
      )}
    </div>
  );
}

/* ── CUT-OFF MANAGER ─────────────────────────────────────── */
function CutoffManager({ toast }) {
  const [rows, setRows] = useState([]);
  const [unis, setUnis] = useState([]);
  const [q, setQ] = useState('');
  const [uF, setUF] = useState('');
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    sq('universities', '?order=name.asc&select=id,code').then(d => setUnis(d || []));
    sq('programmes', '?order=name.asc&limit=3000&select=id,name,cutoff,university_id,universities(code)').then(d => setRows(d || []));
  }, []);

  const filtered = rows.filter(r => (r.name || '').toLowerCase().includes(q.toLowerCase()) && (!uF || r.university_id === uF));

  const saveAll = async () => {
    setSaving(true);
    const keys = Object.keys(edits);
    for (const id of keys) await upd('programmes', id, { cutoff: parseInt(edits[id]) });
    setRows(r => r.map(x => edits[x.id] ? { ...x, cutoff: parseInt(edits[x.id]) } : x));
    setEdits({});
    setSaving(false);
    toast(`${keys.length} cut-offs saved`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><div className="text-xl font-black">Cut-Off Manager</div><div className="text-xs text-gray-400">Bulk-edit cut-offs. Click Save when done.</div></div>
        {Object.keys(edits).length > 0 && <Btn variant="success" onClick={saveAll} disabled={saving}>{saving ? 'Saving...' : `💾 Save ${Object.keys(edits).length} Changes`}</Btn>}
      </div>
      <div className="flex gap-2 mb-3">
        <Card className="flex-1 p-2"><Input value={q} onChange={setQ} placeholder="Search programmes..." /></Card>
        <Card className="w-40 p-2"><Select value={uF} onChange={setUF} options={unis.map(u => ({ value: u.id, label: u.code }))} placeholder="All Unis" /></Card>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase">Programme</th><th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase">University</th><th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase w-24">Cut-Off</th></tr></thead>
            <tbody>
              {filtered.slice(0, 200).map(r => (
                <tr key={r.id} className={`border-b border-gray-50 ${edits[r.id] ? 'bg-amber-50' : 'hover:bg-gray-50'}`}>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2 text-gray-400">{r.universities?.code || '—'}</td>
                  <td className="px-3 py-2">
                    <input type="number" value={edits[r.id] !== undefined ? edits[r.id] : r.cutoff || ''} min={6} max={54}
                      onChange={e => setEdits(ed => ({ ...ed, [r.id]: e.target.value }))}
                      className="w-16 px-2 py-1 border-2 border-violet-200 rounded-lg text-[12px] font-bold text-violet-600 focus:border-violet-500" />
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

/* ── SCHOLARSHIPS ────────────────────────────────────────── */
function Scholarships({ toast }) {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null);
  const blank = { name: '', organization: '', amount: '', deadline: '', status: 'open', description: '' };
  const [form, setForm] = useState(blank);
  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { sq('scholarships', '?order=name.asc').then(d => setRows(d || [])); }, []);

  const open = (r = null) => { setForm(r ? { name: r.name, organization: r.organization || '', amount: r.amount || '', deadline: r.deadline || '', status: r.status || 'open', description: r.description || '' } : blank); setModal(r || {}); };
  const save = async () => {
    if (modal?.id) { await upd('scholarships', modal.id, form); setRows(r => r.map(x => x.id === modal.id ? { ...x, ...form } : x)); }
    else { const d = await ins('scholarships', [form]); if (d?.[0]) setRows(r => [...r, d[0]]); }
    setModal(null); toast('Saved');
  };
  const remove = async r => { if (!confirm('Delete?')) return; await del('scholarships', r.id); setRows(rows => rows.filter(x => x.id !== r.id)); };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4"><div className="text-xl font-black">Scholarships</div><Btn onClick={() => open()}>+ Add</Btn></div>
      <div className="space-y-3">
        {rows.map(r => (
          <Card key={r.id} className="p-4 flex items-start gap-4">
            <div className="flex-1">
              <div className="font-bold text-[14px] mb-1">{r.name}</div>
              <div className="text-[12px] text-gray-400 mb-2">{r.organization}</div>
              <div className="flex gap-2"><Badge color="green">{r.amount}</Badge><Badge color="amber">{r.deadline}</Badge><Badge color={r.status === 'open' ? 'green' : 'gray'}>{r.status}</Badge></div>
            </div>
            <div className="flex gap-2"><Btn sm variant="ghost" onClick={() => open(r)}>Edit</Btn><Btn sm variant="danger" onClick={() => remove(r)}>Del</Btn></div>
          </Card>
        ))}
        {!rows.length && <Card className="p-12 text-center text-gray-400">No scholarships yet</Card>}
      </div>
      {modal !== null && (
        <Modal title={modal?.id ? 'Edit Scholarship' : 'Add Scholarship'} onClose={() => setModal(null)}>
          <div className="space-y-3 mb-4">
            <div><label className="block text-[12px] font-semibold mb-1">Name</label><Input value={form.name} onChange={v => F('name', v)} placeholder="GETFUND Scholarship" /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Organisation</label><Input value={form.organization} onChange={v => F('organization', v)} placeholder="Ghana Education Trust Fund" /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Amount</label><Input value={form.amount} onChange={v => F('amount', v)} placeholder="Full Tuition" /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Deadline</label><Input value={form.deadline} onChange={v => F('deadline', v)} type="date" /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Status</label><Select value={form.status} onChange={v => F('status', v)} options={['open', 'closed', 'coming soon']} /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Description</label><Textarea value={form.description} onChange={v => F('description', v)} placeholder="Brief description..." rows={2} /></div>
          </div>
          <div className="flex gap-2"><Btn full onClick={save}>Save</Btn><Btn full variant="ghost" onClick={() => setModal(null)}>Cancel</Btn></div>
        </Modal>
      )}
    </div>
  );
}

/* ── ADMISSION FORMS ─────────────────────────────────────── */
function AdmissionForms({ toast }) {
  const [rows, setRows] = useState([]);
  const [unis, setUnis] = useState([]);
  const [modal, setModal] = useState(null);
  const blank = { university_id: '', status: 'open', deadline: '', fee: '', portal_url: '' };
  const [form, setForm] = useState(blank);
  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    sq('universities', '?order=name.asc&select=id,code,name').then(d => setUnis(d || []));
    sq('admission_forms', '?order=updated_at.desc&select=*,universities(code,name)').then(d => setRows(d || []));
  }, []);

  const open = (r = null) => { setForm(r ? { university_id: r.university_id, status: r.status || 'open', deadline: r.deadline || '', fee: r.fee || '', portal_url: r.portal_url || '' } : blank); setModal(r || {}); };
  const save = async () => {
    const body = { ...form, updated_at: new Date().toISOString() };
    if (modal?.id) { await upd('admission_forms', modal.id, body); setRows(r => r.map(x => x.id === modal.id ? { ...x, ...body } : x)); }
    else { const d = await ins('admission_forms', [body]); if (d?.[0]) setRows(r => [...r, d[0]]); }
    setModal(null); toast('Saved');
  };
  const remove = async r => { if (!confirm('Delete?')) return; await del('admission_forms', r.id); setRows(rows => rows.filter(x => x.id !== r.id)); };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4"><div className="text-xl font-black">Admission Forms</div><Btn onClick={() => open()}>+ Add</Btn></div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead><tr className="bg-gray-50 border-b border-gray-100">{['University','Status','Deadline','Fee','Actions'].map(h => <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium">{r.universities?.name || '—'}</td>
                  <td className="px-3 py-2.5"><Badge color={r.status === 'open' ? 'green' : 'gray'}>{r.status}</Badge></td>
                  <td className="px-3 py-2.5 text-gray-400">{r.deadline || 'TBD'}</td>
                  <td className="px-3 py-2.5 text-gray-400">{r.fee || 'TBD'}</td>
                  <td className="px-3 py-2.5"><div className="flex gap-1"><Btn sm variant="ghost" onClick={() => open(r)}>Edit</Btn><Btn sm variant="danger" onClick={() => remove(r)}>Del</Btn></div></td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No forms yet</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      {modal !== null && (
        <Modal title={modal?.id ? 'Edit Form' : 'Add Form'} onClose={() => setModal(null)}>
          <div className="space-y-3 mb-4">
            <div><label className="block text-[12px] font-semibold mb-1">University</label><Select value={form.university_id} onChange={v => F('university_id', v)} options={unis.map(u => ({ value: u.id, label: `${u.code} — ${u.name}` }))} placeholder="Select" /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Status</label><Select value={form.status} onChange={v => F('status', v)} options={['open', 'closed', 'coming soon']} /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Deadline</label><Input value={form.deadline} onChange={v => F('deadline', v)} placeholder="Oct 31, 2025" /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Application Fee</label><Input value={form.fee} onChange={v => F('fee', v)} placeholder="GHC 50" /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Portal URL</label><Input value={form.portal_url} onChange={v => F('portal_url', v)} placeholder="https://admissions.ug.edu.gh" /></div>
          </div>
          <div className="flex gap-2"><Btn full onClick={save}>Save</Btn><Btn full variant="ghost" onClick={() => setModal(null)}>Cancel</Btn></div>
        </Modal>
      )}
    </div>
  );
}

/* ── NEWS ────────────────────────────────────────────────── */
function News({ toast }) {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null);
  const blank = { title: '', category: 'general', content: '', urgent: false, published: true };
  const [form, setForm] = useState(blank);
  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { sq('news', '?order=created_at.desc').then(d => setRows(d || [])); }, []);

  const open = (r = null) => { setForm(r ? { title: r.title, category: r.category || 'general', content: r.content || '', urgent: !!r.urgent, published: r.published !== false } : blank); setModal(r || {}); };
  const save = async () => {
    const body = { ...form, updated_at: new Date().toISOString() };
    if (modal?.id) { await upd('news', modal.id, body); setRows(r => r.map(x => x.id === modal.id ? { ...x, ...body } : x)); }
    else { const d = await ins('news', [{ ...body, created_at: new Date().toISOString() }]); if (d?.[0]) setRows(r => [d[0], ...r]); }
    setModal(null); toast('News saved');
  };
  const remove = async r => { if (!confirm('Delete?')) return; await del('news', r.id); setRows(rows => rows.filter(x => x.id !== r.id)); };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4"><div className="text-xl font-black">News</div><Btn onClick={() => open()}>+ Post News</Btn></div>
      <div className="space-y-3">
        {rows.map(r => (
          <Card key={r.id} className="p-4 flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-[14px]">{r.title}</span>
                {r.urgent && <Badge color="red">Urgent</Badge>}
                <Badge color={r.published ? 'green' : 'gray'}>{r.published ? 'Published' : 'Draft'}</Badge>
              </div>
              <div className="text-[12px] text-gray-400">{ago(r.created_at)} · {r.category}</div>
            </div>
            <div className="flex gap-2"><Btn sm variant="ghost" onClick={() => open(r)}>Edit</Btn><Btn sm variant="danger" onClick={() => remove(r)}>Del</Btn></div>
          </Card>
        ))}
        {!rows.length && <Card className="p-12 text-center text-gray-400">No news yet</Card>}
      </div>
      {modal !== null && (
        <Modal title={modal?.id ? 'Edit' : 'Post News'} onClose={() => setModal(null)} wide>
          <div className="space-y-3 mb-4">
            <div><label className="block text-[12px] font-semibold mb-1">Title</label><Input value={form.title} onChange={v => F('title', v)} placeholder="UG 2025/2026 Admissions Open" /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Category</label><Select value={form.category} onChange={v => F('category', v)} options={['general', 'form', 'cutoff', 'scholarship', 'policy']} /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Content</label><Textarea value={form.content} onChange={v => F('content', v)} placeholder="Full news content..." rows={5} /></div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-[12px]"><input type="checkbox" checked={form.urgent} onChange={e => F('urgent', e.target.checked)} /> Urgent</label>
              <label className="flex items-center gap-2 cursor-pointer text-[12px]"><input type="checkbox" checked={form.published} onChange={e => F('published', e.target.checked)} /> Published</label>
            </div>
          </div>
          <div className="flex gap-2"><Btn full onClick={save}>Save</Btn><Btn full variant="ghost" onClick={() => setModal(null)}>Cancel</Btn></div>
        </Modal>
      )}
    </div>
  );
}

/* ── NOTIFICATIONS ───────────────────────────────────────── */
function Notifications({ toast }) {
  const [rows, setRows] = useState([]);
  const [text, setText] = useState('');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => { sq('ticker_items', '?order=created_at.desc&limit=50').then(d => setRows(d || [])); }, []);

  const add = async () => {
    if (!text.trim()) return;
    const d = await ins('ticker_items', [{ text, urgent, active: true, created_at: new Date().toISOString() }]);
    if (d?.[0]) setRows(r => [d[0], ...r]);
    setText(''); setUrgent(false); toast('Added to ticker');
  };
  const toggle = async r => { await upd('ticker_items', r.id, { active: !r.active }); setRows(rows => rows.map(x => x.id === r.id ? { ...x, active: !r.active } : x)); };
  const remove = async r => { await del('ticker_items', r.id); setRows(rows => rows.filter(x => x.id !== r.id)); };

  return (
    <div className="p-6 max-w-2xl">
      <div className="text-xl font-black mb-1">Notifications / Ticker</div>
      <div className="text-xs text-gray-400 mb-4">Push live announcements to the student site ticker.</div>
      <Card className="p-4 mb-4">
        <label className="block text-[12px] font-semibold mb-2">New Announcement</label>
        <Input value={text} onChange={setText} placeholder="e.g. UCC Admissions Open — Deadline Oct 15" />
        <div className="flex items-center justify-between mt-3">
          <label className="flex items-center gap-2 cursor-pointer text-[13px]"><input type="checkbox" checked={urgent} onChange={e => setUrgent(e.target.checked)} /> Mark as urgent</label>
          <Btn onClick={add}>Add to Ticker</Btn>
        </div>
      </Card>
      <div className="space-y-2">
        {rows.map(r => (
          <Card key={r.id} className="p-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="font-medium text-[13px] mb-1">{r.text}</div>
              <div className="flex gap-2"><Badge color={r.active ? 'green' : 'gray'}>{r.active ? 'Live' : 'Hidden'}</Badge>{r.urgent && <Badge color="red">Urgent</Badge>}<span className="text-[10px] text-gray-400">{ago(r.created_at)}</span></div>
            </div>
            <div className="flex gap-2"><Btn sm variant={r.active ? 'amber' : 'success'} onClick={() => toggle(r)}>{r.active ? 'Hide' : 'Show'}</Btn><Btn sm variant="danger" onClick={() => remove(r)}>Del</Btn></div>
          </Card>
        ))}
        {!rows.length && <Card className="p-8 text-center text-gray-400">No ticker items yet</Card>}
      </div>
    </div>
  );
}

/* ── AI INBOX ────────────────────────────────────────────── */
function AIInbox({ toast }) {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');

  useEffect(() => { sq('ai_inbox', '?order=created_at.desc&limit=100').then(d => setRows(d || [])); }, []);

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    await upd('ai_inbox', selected.id, { status: 'replied', admin_reply: reply, replied_at: new Date().toISOString() });
    setRows(r => r.map(x => x.id === selected.id ? { ...x, status: 'replied' } : x));
    setSelected(null); setReply(''); toast('Reply saved');
  };

  const pending = rows.filter(r => r.status === 'pending');
  const replied = rows.filter(r => r.status === 'replied');

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-xl font-black">AI Inbox</div>
        {pending.length > 0 && <Badge color="red">{pending.length} pending</Badge>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Unanswered ({pending.length})</div>
          <div className="space-y-2 mb-4">
            {pending.map(r => (
              <Card key={r.id} className={`p-3 cursor-pointer transition-all ${selected?.id === r.id ? 'border-violet-400 bg-violet-50' : ''}`} onClick={() => { setSelected(r); setReply(''); }}>
                <div className="font-medium text-[13px] mb-1 line-clamp-2">{r.question}</div>
                <div className="text-[10px] text-gray-400">{ago(r.created_at)}</div>
              </Card>
            ))}
            {!pending.length && <Card className="p-4 text-center text-[12px] text-gray-400">All caught up ✓</Card>}
          </div>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Replied ({replied.length})</div>
          <div className="space-y-2">
            {replied.slice(0, 6).map(r => (
              <Card key={r.id} className="p-2.5 opacity-60">
                <div className="text-[12px] truncate">{r.question}</div>
                <div className="text-[10px] text-gray-400">Replied {ago(r.replied_at)}</div>
              </Card>
            ))}
          </div>
        </div>
        {selected && (
          <Card className="p-4 self-start">
            <div className="font-bold mb-2">Question</div>
            <div className="bg-gray-50 rounded-lg p-3 text-[13px] mb-4">{selected.question}</div>
            <div className="font-bold mb-2">Your Reply</div>
            <Textarea value={reply} onChange={setReply} placeholder="Type your reply..." rows={4} />
            <div className="flex gap-2 mt-3">
              <Btn full onClick={sendReply} disabled={!reply.trim()}>Send Reply</Btn>
              <Btn variant="ghost" onClick={() => setSelected(null)}>Cancel</Btn>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ── SMS BROADCAST ───────────────────────────────────────── */
function SMSBroadcast({ toast }) {
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('all');
  const [track, setTrack] = useState('');
  const [plan, setPlan] = useState('');
  const [preview, setPreview] = useState(null);
  const [sending, setSending] = useState(false);

  const getPreview = async () => {
    let q = '?select=phone,track,plan';
    if (filter === 'track' && track) q += `&track=eq.${track}`;
    if (filter === 'plan' && plan) q += `&plan=eq.${plan}`;
    const d = await sq('student_checks', q + '&limit=500');
    setPreview([...new Set((d || []).map(r => r.phone).filter(Boolean))]);
  };

  const send = async () => {
    if (!msg.trim() || !preview?.length) return;
    setSending(true);
    try {
      await fetch(`${SUPA_URL}/functions/v1/sms-broadcast`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPA_KEY}` }, body: JSON.stringify({ message: msg, phones: preview }) });
      await ins('sms_broadcasts', [{ message: msg, recipients: preview.length, status: 'sent', sent_at: new Date().toISOString() }]);
      toast(`SMS sent to ${preview.length} students`);
      setMsg(''); setPreview(null);
    } catch { toast('SMS failed — check Arkesel config'); }
    setSending(false);
  };

  return (
    <div className="p-6 max-w-xl">
      <div className="text-xl font-black mb-1">SMS Broadcast</div>
      <div className="text-xs text-gray-400 mb-4">Send SMS to students via Arkesel.</div>
      <Card className="p-5 space-y-4">
        <div>
          <label className="block text-[12px] font-semibold mb-1">Target Audience</label>
          <Select value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All Students' }, { value: 'track', label: 'By Track' }, { value: 'plan', label: 'By Plan' }]} />
        </div>
        {filter === 'track' && <div><label className="block text-[12px] font-semibold mb-1">Track</label><Select value={track} onChange={setTrack} options={TRACKS} placeholder="Select track" /></div>}
        {filter === 'plan' && <div><label className="block text-[12px] font-semibold mb-1">Plan</label><Select value={plan} onChange={setPlan} options={['basic', 'premium', 'bundle']} placeholder="Select plan" /></div>}
        <div>
          <label className="block text-[12px] font-semibold mb-1">Message ({msg.length}/160)</label>
          <Textarea value={msg} onChange={setMsg} placeholder="Type your SMS message here..." rows={4} />
          {msg.length > 160 && <div className="text-[11px] text-red-500 mt-1">Over 160 chars — {Math.ceil(msg.length / 160)} SMS parts</div>}
        </div>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={getPreview}>Preview Recipients</Btn>
          {preview && <Btn variant="success" onClick={send} disabled={!msg.trim() || sending}>{sending ? 'Sending...' : `Send to ${preview.length} students`}</Btn>}
        </div>
        {preview && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-[12px] font-bold text-green-700 mb-1">{preview.length} recipients found</div>
            <div className="text-[11px] font-mono text-green-600 truncate">{preview.slice(0, 5).join(', ')}{preview.length > 5 ? ` + ${preview.length - 5} more` : ''}</div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ── ANALYTICS ───────────────────────────────────────────── */
function Analytics() {
  const [data, setData] = useState({ byDay: [], byPlan: {}, byTrack: {} });

  useEffect(() => {
    sq('payments', '?select=amount,plan,created_at&order=created_at.asc&limit=1000').then(pays => {
      const byPlan = {}, byDay = {};
      (pays || []).forEach(p => { byPlan[p.plan] = (byPlan[p.plan] || 0) + 1; const day = new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); byDay[day] = (byDay[day] || 0) + 1; });
      sq('student_checks', '?select=track&limit=500').then(checks => {
        const byTrack = {}; (checks || []).forEach(c => { if (c.track) byTrack[c.track] = (byTrack[c.track] || 0) + 1; });
        setData({ byDay: Object.entries(byDay).slice(-14), byPlan, byTrack });
      });
    });
  }, []);

  const maxDay = Math.max(...data.byDay.map(d => d[1]), 1);
  const maxPlan = Math.max(...Object.values(data.byPlan), 1);
  const maxTrack = Math.max(...Object.values(data.byTrack), 1);

  return (
    <div className="p-6">
      <div className="text-xl font-black mb-4">Analytics</div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="font-bold text-[13px] mb-3">Checks Per Day (last 14 days)</div>
          <div className="flex items-end gap-1 h-24">
            {data.byDay.map(([day, count]) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="text-[9px] text-gray-400 font-bold">{count}</div>
                <div className="w-full bg-violet-500 rounded-t" style={{ height: `${Math.max(4, (count / maxDay) * 72)}px` }} />
                <div className="text-[8px] text-gray-400 truncate w-full text-center">{day}</div>
              </div>
            ))}
            {!data.byDay.length && <div className="text-[12px] text-gray-400 m-auto">No data yet</div>}
          </div>
        </Card>
        <Card className="p-4">
          <div className="font-bold text-[13px] mb-3">Revenue by Plan</div>
          <div className="space-y-2.5">
            {Object.entries(data.byPlan).map(([plan, count]) => (
              <div key={plan} className="flex items-center gap-2">
                <Badge color={plan === 'premium' ? 'violet' : plan === 'bundle' ? 'amber' : 'gray'}>{plan}</Badge>
                <div className="flex-1 bg-gray-100 rounded-full h-2"><div className="bg-violet-500 h-2 rounded-full" style={{ width: `${(count / maxPlan) * 100}%` }} /></div>
                <span className="text-[12px] font-bold">{count}</span>
              </div>
            ))}
            {!Object.keys(data.byPlan).length && <div className="text-[12px] text-gray-400">No data yet</div>}
          </div>
        </Card>
        <Card className="p-4 col-span-2">
          <div className="font-bold text-[13px] mb-3">Students by SHS Track</div>
          <div className="space-y-2">
            {Object.entries(data.byTrack).sort((a, b) => b[1] - a[1]).map(([t, c]) => (
              <div key={t} className="flex items-center gap-2">
                <div className="text-[12px] w-40 truncate">{t}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(c / maxTrack) * 100}%` }} /></div>
                <span className="text-[11px] text-gray-400">{c}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── PROGRAMME IMPORT ────────────────────────────────────── */
function ProgrammeImport({ toast }) {
  const [unis, setUnis] = useState([]);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(0);
  const fileRef = useRef();

  useEffect(() => { sq('universities', '?order=name.asc&select=id,code').then(d => setUnis(d || [])); }, []);

  const parseCSV = text => { const lines = text.trim().split('\n'); const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, '')); return lines.slice(1).map(line => { const vals = line.split(',').map(v => v.trim().replace(/"/g, '')); return Object.fromEntries(headers.map((h, i) => [h, vals[i] || ''])); }); };

  const onFile = e => { const file = e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = ev => setPreview(parseCSV(ev.target.result).slice(0, 10)); r.readAsText(file); };

  const doImport = async () => {
    const file = fileRef.current?.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      setImporting(true);
      const rows = parseCSV(ev.target.result);
      const umap = {}; unis.forEach(u => { umap[u.code.toLowerCase()] = u.id; });
      let count = 0;
      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50).map(r => ({ name: r.name || r.programme || '', university_id: umap[(r.uni || r.university || r.code || '').toLowerCase()] || null, cutoff: parseInt(r.cutoff || r['cut-off'] || r['cut_off']) || 24, required_track: r.track ? [r.track] : [], careers: r.careers || r.career || '', degree_type: r.degree || r.type || 'BSc', active: true })).filter(r => r.name && r.university_id);
        if (batch.length) { await ins('programmes', batch); count += batch.length; }
        setDone(count);
      }
      setImporting(false); toast(`Imported ${count} programmes`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="text-xl font-black mb-1">Programme Import</div>
      <div className="text-xs text-gray-400 mb-4">Upload a CSV to bulk-add thousands of programmes at once.</div>
      <Card className="p-5 mb-4">
        <div className="font-bold text-[14px] mb-2">Required CSV columns:</div>
        <div className="bg-gray-50 rounded-lg p-3 font-mono text-[12px] mb-3">name, uni, cutoff, track, degree, careers</div>
        {[['name', 'Programme name (e.g. BSc Computer Science)'], ['uni', 'University code (e.g. KNUST, UG, UCC)'], ['cutoff', 'Cut-off aggregate (e.g. 18)'], ['track', 'Required track or leave empty for all'], ['degree', 'Degree type (BSc, BA, HND...)'], ['careers', 'Career paths description']].map(([k, v]) => (
          <div key={k} className="text-[12px] text-gray-500 mb-1"><strong>{k}</strong> — {v}</div>
        ))}
      </Card>
      <Card className="p-5 mb-4">
        <label className="block text-[12px] font-semibold mb-2">Upload CSV File</label>
        <input ref={fileRef} type="file" accept=".csv" onChange={onFile} className="text-[13px] cursor-pointer" />
        {preview.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <div className="font-semibold text-[12px] mb-2">Preview (first 10 rows):</div>
            <table className="w-full text-[11px] border-collapse">
              <thead><tr>{Object.keys(preview[0]).map(k => <th key={k} className="px-2 py-1 bg-gray-50 text-left text-[10px] font-bold text-gray-400 uppercase border-b">{k}</th>)}</tr></thead>
              <tbody>{preview.map((r, i) => <tr key={i}>{Object.values(r).map((v, j) => <td key={j} className="px-2 py-1 border-b border-gray-50 max-w-[100px] truncate">{v}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
      </Card>
      {importing && <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center mb-4 font-bold text-violet-600">Importing... {done} programmes</div>}
      <Btn lg full onClick={doImport} disabled={importing}>📥 Import CSV</Btn>
    </div>
  );
}

/* ── VISITORS ────────────────────────────────────────────── */
function Visitors() {
  const [rows, setRows] = useState([]);
  useEffect(() => { sq('visitors', '?order=created_at.desc&limit=300').then(d => setRows(d || [])); }, []);
  const byPage = {}; rows.forEach(r => { if (r.page) byPage[r.page] = (byPage[r.page] || 0) + 1; });
  const today = rows.filter(r => new Date(r.created_at).toDateString() === new Date().toDateString()).length;

  return (
    <div className="p-6">
      <div className="text-xl font-black mb-4">Visitor Tracking</div>
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard icon="👁️" label="Total Visits" value={fmt(rows.length)} color="violet" />
        <StatCard icon="📄" label="Unique Pages" value={fmt(Object.keys(byPage).length)} color="blue" />
        <StatCard icon="📱" label="Today" value={fmt(today)} color="amber" />
        <StatCard icon="🔗" label="With Referrer" value={fmt(rows.filter(r => r.referrer).length)} color="green" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="font-bold text-[13px] mb-3">Top Pages</div>
          {Object.entries(byPage).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([page, count]) => (
            <div key={page} className="flex items-center justify-between mb-2">
              <div className="font-mono text-[12px] truncate flex-1">{page || '/'}</div>
              <Badge color="violet">{count}</Badge>
            </div>
          ))}
          {!Object.keys(byPage).length && <div className="text-[12px] text-gray-400">No visits yet</div>}
        </Card>
        <Card className="p-4">
          <div className="font-bold text-[13px] mb-3">Recent Visits</div>
          {rows.slice(0, 12).map((r, i) => (
            <div key={i} className="flex items-center justify-between mb-2">
              <div><div className="font-mono text-[12px]">{r.page || '/'}</div><div className="text-[10px] text-gray-400 truncate max-w-[140px]">{r.referrer || 'Direct'}</div></div>
              <div className="text-[10px] text-gray-400">{ago(r.created_at)}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ── AUDIT LOG ───────────────────────────────────────────── */
function AuditLog() {
  const [rows, setRows] = useState([]);
  useEffect(() => { sq('audit_log', '?order=created_at.desc&limit=200').then(d => setRows(d || [])); }, []);
  return (
    <div className="p-6">
      <div className="text-xl font-black mb-4">Audit Log</div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead><tr className="bg-gray-50 border-b border-gray-100">{['Action', 'Table', 'Record', 'Change', 'Time'].map(h => <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-3 py-2.5"><Badge color={r.action === 'INSERT' ? 'green' : r.action === 'DELETE' ? 'red' : 'amber'}>{r.action}</Badge></td>
                  <td className="px-3 py-2.5 font-mono">{r.table_name}</td>
                  <td className="px-3 py-2.5 font-mono text-[10px] text-gray-400">{(r.record_id || '').slice(0, 8)}...</td>
                  <td className="px-3 py-2.5 font-mono text-[10px] text-gray-400 max-w-[180px] truncate">{JSON.stringify(r.new_value || r.old_value || {})}</td>
                  <td className="px-3 py-2.5 text-gray-400 whitespace-nowrap">{ago(r.created_at)}</td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No audit entries yet. Run supabase_setup.sql to enable triggers.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── SETTINGS ────────────────────────────────────────────── */
function Settings({ toast }) {
  const [tab, setTab] = useState('pricing');
  const [pricing, setPricing] = useState({ price_basic: 12, price_premium: 18, price_bundle: 25 });
  const [paystack, setPaystack] = useState({ test_public: '', test_secret: '', live_public: '', live_secret: '', mode: 'test' });
  const [legal, setLegal] = useState({ privacy: '', terms: '', disclaimer: '', refund: '' });
  const [knust, setKnust] = useState({ excl_soc_unis: ['KNUST', 'UMAT'], soc_exceptions: ['political science', 'publishing studies', 'law'], nursing_track: 'General Science' });
  const [tracks, setTracks] = useState({});
  const [appearance, setAppearance] = useState({ font_family: 'Inter', font_size: 135, heading_font: 'Outfit' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    sq('settings', '?select=key,value').then(d => {
      (d || []).forEach(row => {
        if (row.key === 'pricing') setPricing(v => ({ ...v, ...(row.value || {}) }));
        if (row.key === 'payment_keys') setPaystack(v => ({ ...v, ...(row.value || {}) }));
        if (row.key === 'legal') setLegal(v => ({ ...v, ...(row.value || {}) }));
        if (row.key === 'knust_logic') setKnust(row.value || knust);
        if (row.key === 'tracks') setTracks(row.value || {});
        if (row.key === 'appearance') setAppearance(v => ({ ...v, ...(row.value || {}) }));
      });
    });
  }, []);

  const save = async (key, val) => { setSaving(true); await upsert('settings', key, val); setSaving(false); toast(`${key} saved`); };

  const TABS = [{ id: 'pricing', label: '💰 Pricing' }, { id: 'payment', label: '🔑 Paystack' }, { id: 'legal', label: '📄 Legal Pages' }, { id: 'knust', label: '🎓 KNUST/UMaT' }, { id: 'tracks', label: '📚 Track Electives' }, { id: 'appearance', label: '🎨 Appearance' }];

  return (
    <div className="p-6">
      <div className="text-xl font-black mb-4">Settings</div>
      <div className="flex gap-0 border-b border-gray-200 mb-5 overflow-x-auto">
        {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 text-[12px] font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === t.id ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{t.label}</button>)}
      </div>

      {tab === 'pricing' && (
        <div className="max-w-sm space-y-3">
          <Card className="p-5">
            <div className="font-bold text-[14px] mb-3">Plan Prices (GHC)</div>
            {[['price_basic', 'Basic (1 University)'], ['price_premium', 'Premium (All Universities)'], ['price_bundle', 'Bundle (3 Checks)']].map(([k, l]) => (
              <div key={k} className="mb-3"><label className="block text-[12px] font-semibold mb-1">{l}</label><Input value={pricing[k]} onChange={v => setPricing(p => ({ ...p, [k]: parseInt(v) || 0 }))} type="number" /></div>
            ))}
            <Btn full onClick={() => save('pricing', pricing)} disabled={saving}>💾 Save Prices</Btn>
          </Card>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[12px] text-amber-800"><strong>⚠️ Note:</strong> Also update the PRICES constant in the student app to keep fallbacks in sync.</div>
        </div>
      )}

      {tab === 'payment' && (
        <div className="max-w-lg space-y-4">
          <Card className="p-5">
            <div className="font-bold text-[14px] mb-1">Payment Mode</div>
            <div className="text-[12px] text-gray-500 mb-4">Switch between Test and Live. The active mode's keys are used on the student site.</div>
            <div className="flex gap-3">
              <button onClick={() => setPaystack(p => ({ ...p, mode: 'test' }))} className={`flex-1 py-3 rounded-xl font-bold text-[13px] border-2 transition-all cursor-pointer ${paystack.mode === 'test' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-500 border-gray-200'}`}>
                🧪 Test Mode
              </button>
              <button onClick={() => setPaystack(p => ({ ...p, mode: 'live' }))} className={`flex-1 py-3 rounded-xl font-bold text-[13px] border-2 transition-all cursor-pointer ${paystack.mode === 'live' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200'}`}>
                🚀 Live Mode
              </button>
            </div>
            <div className={`mt-3 text-[12px] font-semibold text-center py-2 rounded-lg ${paystack.mode === 'live' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              {paystack.mode === 'live' ? '🚀 LIVE — Real payments are being processed' : '🧪 TEST — No real money is charged'}
            </div>
          </Card>
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2"><span className="font-bold text-[14px]">🧪 Test Keys</span>{paystack.mode === 'test' && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">ACTIVE</span>}</div>
            <div className="text-[12px] text-gray-500">Paystack Dashboard → switch to Test Mode → Settings → API Keys</div>
            <div><label className="block text-[12px] font-semibold mb-1">Test Public Key</label><Input value={paystack.test_public || ''} onChange={v => setPaystack(p => ({ ...p, test_public: v }))} placeholder="pk_test_xxxxxxxxxxxx" /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Test Secret Key</label><Input value={paystack.test_secret || ''} onChange={v => setPaystack(p => ({ ...p, test_secret: v }))} placeholder="sk_test_xxxxxxxxxxxx" type="password" /></div>
          </Card>
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2"><span className="font-bold text-[14px]">🚀 Live Keys</span>{paystack.mode === 'live' && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">ACTIVE</span>}</div>
            <div className="text-[12px] text-gray-500">Paystack Dashboard → switch to Live Mode → Settings → API Keys</div>
            <div><label className="block text-[12px] font-semibold mb-1">Live Public Key</label><Input value={paystack.live_public || ''} onChange={v => setPaystack(p => ({ ...p, live_public: v }))} placeholder="pk_live_xxxxxxxxxxxx" /></div>
            <div><label className="block text-[12px] font-semibold mb-1">Live Secret Key</label><Input value={paystack.live_secret || ''} onChange={v => setPaystack(p => ({ ...p, live_secret: v }))} placeholder="sk_live_xxxxxxxxxxxx" type="password" /></div>
          </Card>
          <Btn lg full onClick={() => {
            const pub = paystack.mode === 'live' ? paystack.live_public : paystack.test_public;
            const sec = paystack.mode === 'live' ? paystack.live_secret : paystack.test_secret;
            save('payment_keys', { test_public: paystack.test_public, test_secret: paystack.test_secret, live_public: paystack.live_public, live_secret: paystack.live_secret, mode: paystack.mode, paystack: pub, secret: sec });
          }} disabled={saving}>💾 Save & Apply Keys</Btn>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[12px] text-blue-700"><strong>How it works:</strong> Clicking Save applies the active mode's public key to the student site instantly. No code changes needed to switch between test and live.</div>
        </div>
      )}

      {tab === 'legal' && (
        <div className="max-w-2xl space-y-3">
          <div className="text-[12px] text-gray-400 mb-3">Write the full text for each legal page. Overrides the hardcoded fallback in the student app.</div>
          {[['privacy', 'Privacy Policy'], ['terms', 'Terms of Service'], ['disclaimer', 'Disclaimer'], ['refund', 'Refund Policy']].map(([k, l]) => (
            <Card key={k} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[14px]">{l}</span>
                <Btn sm onClick={() => save('legal', { ...legal, [k]: legal[k] })} disabled={saving}>Save</Btn>
              </div>
              <Textarea value={legal[k] || ''} onChange={v => setLegal(l2 => ({ ...l2, [k]: v }))} placeholder={`Enter full ${l} text...`} rows={5} />
            </Card>
          ))}
          <Btn lg full onClick={() => save('legal', legal)} disabled={saving}>💾 Save All Legal Pages</Btn>
        </div>
      )}

      {tab === 'knust' && (
        <div className="max-w-lg space-y-3">
          <Card className="p-4"><div className="font-bold text-[14px] mb-1">Universities Excluding Social Studies</div><div className="text-[12px] text-gray-400 mb-2">Social Studies is never counted for these universities.</div><Input value={(knust.excl_soc_unis || []).join(', ')} onChange={v => setKnust(k => ({ ...k, excl_soc_unis: v.split(',').map(x => x.trim()).filter(Boolean) }))} placeholder="KNUST, UMAT" /></Card>
          <Card className="p-4"><div className="font-bold text-[14px] mb-1">KNUST Social Studies Exception Programmes</div><div className="text-[12px] text-gray-400 mb-2">For these KNUST programmes, Social Studies replaces Integrated Science.</div><Input value={(knust.soc_exceptions || []).join(', ')} onChange={v => setKnust(k => ({ ...k, soc_exceptions: v.split(',').map(x => x.trim().toLowerCase()).filter(Boolean) }))} placeholder="political science, publishing studies, law" /></Card>
          <Card className="p-4"><div className="font-bold text-[14px] mb-1">KNUST Nursing / Midwifery Track</div><div className="text-[12px] text-gray-400 mb-2">Only this track can apply for KNUST Nursing and Midwifery.</div><Input value={knust.nursing_track || 'General Science'} onChange={v => setKnust(k => ({ ...k, nursing_track: v }))} placeholder="General Science" /></Card>
          <Btn lg full onClick={() => save('knust_logic', knust)} disabled={saving}>💾 Save KNUST Logic</Btn>
        </div>
      )}

      {tab === 'tracks' && (
        <div className="max-w-2xl space-y-3">
          <div className="text-[12px] text-gray-400 mb-3">Edit elective subjects per track. Separate with commas.</div>
          {TRACKS.map(t => (
            <Card key={t} className="p-4">
              <div className="font-bold text-[14px] mb-2">{t}</div>
              <Textarea value={((tracks[t] || {}).e || []).join(', ')} onChange={v => setTracks(tr => ({ ...tr, [t]: { ...(tr[t] || {}), e: v.split(',').map(x => x.trim()).filter(Boolean) } }))} placeholder="Subject 1, Subject 2..." rows={2} />
            </Card>
          ))}
          <Btn lg full onClick={() => save('tracks', tracks)} disabled={saving}>💾 Save Track Electives</Btn>
        </div>
      )}

      {tab === 'appearance' && (
        <div className="max-w-lg space-y-4">

          {/* Font Family */}
          <Card className="p-5">
            <div className="font-bold text-[14px] mb-1">Body Font</div>
            <div className="text-[12px] text-gray-500 mb-3">The main font used for all body text on the student site.</div>
            <div className="grid grid-cols-2 gap-2">
              {['Inter','Roboto','Poppins','Nunito','Lato','Montserrat','Open Sans','Raleway'].map(f => (
                <button key={f} onClick={() => setAppearance(a => ({ ...a, font_family: f }))}
                  className={`py-3 px-4 rounded-xl border-2 text-[13px] font-semibold text-left transition-all cursor-pointer ${appearance.font_family === f ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-gray-200 bg-white text-gray-600 hover:border-violet-200'}`}
                  style={{ fontFamily: f }}>
                  {f}
                  {appearance.font_family === f && <span className="float-right text-violet-500">✓</span>}
                </button>
              ))}
            </div>
          </Card>

          {/* Heading Font */}
          <Card className="p-5">
            <div className="font-bold text-[14px] mb-1">Heading Font</div>
            <div className="text-[12px] text-gray-500 mb-3">Used for page titles and section headings.</div>
            <div className="grid grid-cols-2 gap-2">
              {['Outfit','Poppins','Montserrat','Raleway','Playfair Display','Nunito','Inter','Roboto'].map(f => (
                <button key={f} onClick={() => setAppearance(a => ({ ...a, heading_font: f }))}
                  className={`py-3 px-4 rounded-xl border-2 text-[13px] font-semibold text-left transition-all cursor-pointer ${appearance.heading_font === f ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-gray-200 bg-white text-gray-600 hover:border-violet-200'}`}
                  style={{ fontFamily: f }}>
                  {f}
                  {appearance.heading_font === f && <span className="float-right text-violet-500">✓</span>}
                </button>
              ))}
            </div>
          </Card>

          {/* Font Size */}
          <Card className="p-5">
            <div className="font-bold text-[14px] mb-1">Font Size</div>
            <div className="text-[12px] text-gray-500 mb-3">Base font size as percentage. 100% = default, 135% = current.</div>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-[12px] text-gray-500 w-8">80%</span>
              <input type="range" min={80} max={200} step={5} value={appearance.font_size || 135}
                onChange={e => setAppearance(a => ({ ...a, font_size: parseInt(e.target.value) }))}
                className="flex-1 accent-violet-600" />
              <span className="text-[12px] text-gray-500 w-12">200%</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[90, 100, 110, 120, 135, 150, 175, 200].map(s => (
                <button key={s} onClick={() => setAppearance(a => ({ ...a, font_size: s }))}
                  className={`px-3 py-1.5 rounded-lg border text-[12px] font-semibold cursor-pointer transition-all ${appearance.font_size === s ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'}`}>
                  {s}%
                </button>
              ))}
            </div>
            <div className="mt-3 bg-gray-50 rounded-xl p-4">
              <div className="text-[12px] text-gray-400 mb-1">Preview at {appearance.font_size}%:</div>
              <div style={{ fontSize: `${appearance.font_size}%`, fontFamily: appearance.font_family }}>
                <div style={{ fontFamily: appearance.heading_font, fontWeight: 900, fontSize: '1.2em', marginBottom: 4 }}>UniPredict Ghana</div>
                <div>Check your WASSCE eligibility across 58 universities.</div>
              </div>
            </div>
          </Card>

          <Btn lg full onClick={() => save('appearance', appearance)} disabled={saving}>💾 Save Appearance</Btn>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[12px] text-blue-700">
            <strong>How it works:</strong> The student site loads these settings from Supabase on every visit. Changes apply within seconds — no redeployment needed.
          </div>
        </div>
      )}
    </div>
  );
}

/* ── ROOT APP ────────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState('dashboard');
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
    <div className="flex min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 overflow-y-auto min-w-0">
        {pages[page] || pages.dashboard}
      </main>
      {toastMsg && <Toast msg={toastMsg} onClose={() => setToastMsg(null)} />}
    </div>
  );
}
