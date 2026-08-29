import React, { useState, useEffect, useRef } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────
const SUPA_URL = "https://urfqevstrwsrtysbllah.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnFldnN0cndzcnR5c2JsbGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNTQ5OTQsImV4cCI6MjEwMDkzMDk5NH0.9TPgghMQdHjqwRm51dEVHJ6O115FPBoYBfZHO_siTYI";
const SUPA_H = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` };
const GP = { A1:1,B2:2,B3:3,C4:4,C5:5,C6:6,D7:7,E8:8,F9:9 };
const GR = ["A1","B2","B3","C4","C5","C6","D7","E8","F9"];
const PRICES = { basic:12, premium:18, bundle:25 };
const PLAN_CHECKS = { basic:1, premium:3, bundle:5 }; // checks included per plan
const KNUST_SOC_EXCEPTIONS = ["political science","publishing studies","law"];
const UNI_EXCL_SOC = ["KNUST","UMAT"];

// TRACKS — icons and subs are static; electives are fetched dynamically from Supabase
// Fallback electives used if Supabase fetch fails
const TRACKS = {
  "General Science":{ icon:"🔬", sub:"Biology, Chemistry, Physics, Elective Maths", electives:["Biology","Chemistry","Physics","Elective Mathematics","Geography","Agricultural Science","Information and Communication Technology","Computer Science"] },
  "General Arts":{ icon:"📚", sub:"Literature, Government, History, Economics", electives:["Literature in English","Government","History","Economics","French","Geography","Christian Religious Studies","Islamic Religious Studies","Ghanaian Language","Arabic","Elective Mathematics","Music","Information and Communication Technology"] },
  "Business":{ icon:"💼", sub:"Financial Accounting, Economics, Business Mgt", electives:["Financial Accounting","Business Management","Economics","Elective Mathematics","Cost Accounting","Business Mathematics","Information and Communication Technology","French"] },
  "Home Economics":{ icon:"🏠", sub:"Food & Nutrition, Clothing & Textiles", electives:["Food and Nutrition","Clothing and Textiles","Management in Living","Biology","Chemistry","Economics","Agricultural Science","Information and Communication Technology"] },
  "Visual Arts":{ icon:"🎨", sub:"General Knowledge in Art, Graphic Design", electives:["General Knowledge in Art","Art and Design Foundation","Art and Design Studio","Graphic Design","Picture Making","Sculpture","Ceramics","Textiles","Leatherwork","Design and Communication Technology","Music","Information and Communication Technology","Elective Mathematics"] },
  "Technical":{ icon:"⚙️", sub:"Technical Drawing, Building Construction", electives:["Technical Drawing","Building Construction","Woodwork","Wood Technology","Automobile Technology","Metal Technology","Electrical and Electronic Technology","Applied Technology","Design and Communication Technology","Physics","Chemistry","Elective Mathematics","Information and Communication Technology"] },
  "Agricultural Science":{ icon:"🌱", sub:"Crop Husbandry, Animal Husbandry", electives:["General Agriculture","Agricultural Science","Crop Science","Crop Husbandry","Animal Husbandry","Physics","Chemistry","Biology","Elective Mathematics","Geography","Information and Communication Technology"] },
};

const FAQS = [
  { q:"How is my aggregate calculated?", a:"Your WASSCE aggregate is the sum of your best 6 subjects: English + Core Maths + Integrated Science (or Social Studies where applicable) + your 3 best electives. Lower aggregate = better result. Social Studies counts for all universities except KNUST and UMaT." },
  { q:"Difference between Basic and Premium?", a:"Basic checks one university you choose. Premium checks all 58 accredited universities and shows every programme you qualify for, ranked by eligibility." },
  { q:"Are cut-off points official?", a:"Our cut-offs are sourced from official university publications. They change annually — always verify with the university before applying." },
  { q:"What if I have 2 sittings?", a:"Select 2 Sittings in Step 3. Enter both sitting grades — we automatically use the better grade for your aggregate." },
  { q:"Which universities are included?", a:"All 58 accredited Ghanaian public and private universities including UG, KNUST, UCC, GIMPA, UPSA, all technical universities, nursing and teacher training colleges." },
  { q:"What payment methods are accepted?", a:"MTN MoMo, Vodafone Cash, AirtelTigo Money, Visa, and Mastercard — all through Paystack." },
];

const LEGAL = {
  privacy: {
    title: "Privacy Policy",
    content: [
      { h:"1. Introduction", p:"UniPredict Ghana is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform." },
      { h:"2. Information We Collect", p:"We collect your phone number and email (where provided), academic data (SHS track, WASSCE grades, electives entered voluntarily), payment information processed by Paystack, and usage analytics via Google Analytics." },
      { h:"3. How We Use Your Information", p:"We use your data to deliver eligibility results, process payments, respond to support requests, send admissions updates (where opted in), and improve our platform." },
      { h:"4. Data Sharing", p:"We do not sell your data. We share it only with trusted providers (Paystack, Supabase, Arkesel) to operate the platform. These providers have their own privacy policies." },
      { h:"5. Your Rights", p:"You may request access to, correction of, or deletion of your data. Contact us at UniPredictghana@gmail.com or WhatsApp 0537 889 150." },
      { h:"6. Contact", p:"UniPredictghana@gmail.com · WhatsApp: 0537 889 150" },
    ]
  },
  terms: {
    title: "Terms of Service",
    content: [
      { h:"1. Acceptance", p:"By using UniPredict Ghana you agree to these Terms. If you do not agree, please do not use the platform." },
      { h:"2. About UniPredict Ghana", p:"We are an independent EdTech platform. We are not affiliated with any Ghanaian university, WAEC, or GTEC." },
      { h:"3. Use of the Platform", p:"You agree to provide accurate grades, use the platform for lawful personal use only, and not reverse-engineer our eligibility engine or database." },
      { h:"4. Eligibility Results", p:"Results are for guidance only. A 'Qualified' result does not guarantee admission. Universities may apply additional criteria. Always verify directly with your chosen institution." },
      { h:"5. Payments", p:"All payments are processed by Paystack. By paying you authorise the stated charge. Please review our Refund Policy before purchasing." },
      { h:"6. Governing Law", p:"These Terms are governed by the laws of the Republic of Ghana." },
      { h:"7. Contact", p:"UniPredictghana@gmail.com · WhatsApp: 0537 889 150" },
    ]
  },
  disclaimer: {
    title: "Disclaimer",
    content: [
      { h:"1. General", p:"All information on UniPredict Ghana — eligibility results, cut-off points, programme details, scholarship listings — is for general guidance and reference only." },
      { h:"2. No University Affiliation", p:"UniPredict Ghana is not affiliated with any Ghanaian university, WAEC, GTEC, or any government body." },
      { h:"3. Cut-Off Points", p:"Cut-offs are sourced from public university data and change annually. Always verify the current cut-off with the university's admissions office before applying." },
      { h:"4. Eligibility ≠ Admission", p:"A 'Qualified' result does not guarantee admission. Universities may apply interviews, medicals, subject requirements, and quotas. Always apply through the university's official portal." },
      { h:"5. AI Counsellor", p:"The AI Counsellor provides automated general guidance only. It is not a substitute for professional academic counselling." },
      { h:"6. Contact", p:"If you notice inaccurate data: UniPredictghana@gmail.com · WhatsApp: 0537 889 150" },
    ]
  },
  refund: {
    title: "Refund Policy",
    content: [
      { h:"1. Eligibility", p:"You may request a refund if you were charged but did not receive results due to a platform error, or if you were charged twice — within 48 hours of payment." },
      { h:"2. Non-Refundable", p:"Refunds are not issued if you received results but disliked the outcome, entered incorrect grades, changed your mind after results, or more than 48 hours have passed." },
      { h:"3. How to Request", p:"Contact us within 48 hours with your name, phone number, Paystack reference, and a description of the issue." },
      { h:"4. Processing", p:"Approved refunds are processed within 3–5 business days to your original payment method." },
      { h:"5. Contact", p:"UniPredictghana@gmail.com · WhatsApp: 0537 889 150" },
    ]
  },
};

// ─── AGGREGATE LOGIC ─────────────────────────────────────────
function getBest(cg, k) {
  const g1 = cg[k] || "", g2 = cg[k + "2"] || "";
  if (!g1) return g2; if (!g2) return g1;
  return GP[g1] <= GP[g2] ? g1 : g2;
}
function isSciTrack(track) {
  return ["General Science","Technical","Agricultural Science"].includes(track);
}
/* ── AGGREGATE CALCULATION ENGINE ─────────────────────────────────────────
 * Rules sourced from official university admission notices and aggregate_rules table.
 *
 * SYSTEM A — KNUST (KNUST_COMPRESSED_24):
 *   Core: English + Core Maths + Integrated Science (Social Studies NEVER counted)
 *   Grades: C4=C5=C6=4 (compressed)
 *   Exceptions: Law, Political Science, Publishing Studies → Social Studies replaces Integrated Science
 *
 * SYSTEM B — UG (UG_STANDARD_24):
 *   Science programmes: English + Core Maths + Integrated Science
 *   Non-Science programmes: English + Core Maths + Social Studies (fixed, NOT swappable)
 *   Grades: standard A1=1..C6=6
 *
 * SYSTEM C — UHAS / UMaT / UTAS / Sunyani TU (SCI_ONLY):
 *   Core: English + Core Maths + Integrated Science ALWAYS
 *   Social Studies is NEVER counted regardless of track or programme
 *   Grades: standard
 *
 * SYSTEM D — All other universities (STANDARD_WASSCE_36):
 *   Science/Technical/Agricultural tracks → Integrated Science as 3rd core
 *   Arts/Business/Home Economics/Visual Arts →
 *     if programme is engineering/science type → Integrated Science
 *     otherwise → BEST of (Integrated Science, Social Studies) — whichever is lower score
 *   Grades: standard A1=1..C6=6
 * ─────────────────────────────────────────────────────────────────────── */

// Universities where Integrated Science is ALWAYS 3rd core (Social Studies never counted)
const SCI_ONLY_UNIS = ["KNUST","UMAT","UHAS","UTAS","SUNYANI"];

// Engineering/science/health programme keywords — force Integrated Science as 3rd core
const SCI_PROG_KEYWORDS = [
  "engineering","science","nursing","midwifery","pharmacy","medicine","medical",
  "laboratory","physiotherapy","optometry","biomedical","radiograph","diagnostic",
  "nutrition","dietetics","health","environmental","chemistry","physics","biology",
  "mathematics","statistics","actuarial","computer","information technology",
  "petroleum","mining","geology","geoscience","agriculture","aquaculture",
  "fisheries","forestry","technology","technical","renewable","cyber","data"
];

function getGP(uni) {
  // KNUST compresses C4/C5/C6 all to 4 points
  return uni === "KNUST"
    ? {"A1":1,"B2":2,"B3":3,"C4":4,"C5":4,"C6":4,"D7":7,"E8":8,"F9":9}
    : {"A1":1,"B2":2,"B3":3,"C4":4,"C5":5,"C6":6,"D7":7,"E8":8,"F9":9};
}

function selectThirdCore(uni, prog, track, sc, so, GP2) {
  const pn = (prog?.name || "").toLowerCase();
  const sciTrack = ["General Science","Agricultural Science","Technical"].includes(track);

  // KNUST special exceptions — Social Studies replaces Integrated Science
  if (uni === "KNUST") {
    const isEx = KNUST_SOC_EXCEPTIONS.some(x => pn.includes(x));
    if (isEx) return so ? GP2[so] : null;
    return sc ? GP2[sc] : null; // All other KNUST: always Integrated Science
  }

  // UG — Science programmes use Integrated Science, Non-Science use Social Studies (fixed)
  if (uni === "UG") {
    if (sciTrack) return sc ? GP2[sc] : null;
    return so ? GP2[so] : null; // Arts/Business at UG: Social Studies is fixed 3rd core
  }

  // UHAS, UMaT, UTAS, Sunyani TU — always Integrated Science, Social Studies never counted
  if (SCI_ONLY_UNIS.includes(uni)) {
    return sc ? GP2[sc] : null;
  }

  // All other universities (UCC, UDS, UENR, UEW, UPSA, GIMPA, technical unis etc)
  if (sciTrack) {
    // Science/Technical/Agricultural track → Integrated Science
    return sc ? GP2[sc] : null;
  }

  // Arts/Business/Home Economics/Visual Arts tracks:
  // Check if programme itself is science/engineering type
  const progIsSci = SCI_PROG_KEYWORDS.some(k => pn.includes(k));
  if (progIsSci) {
    return sc ? GP2[sc] : null; // Force Integrated Science for sci/eng programmes
  }

  // Pure Arts/Business programmes → best of Social Studies or Integrated Science
  const scPts = sc ? GP2[sc] : 999;
  const soPts = so ? GP2[so] : 999;
  const best = Math.min(scPts, soPts);
  return best < 999 ? best : null;
}

function calcAggForUni(uni, prog, track, cg, el, eg) {
  const GP2 = getGP(uni);
  const e=getBest(cg,"eng"), m=getBest(cg,"maths"), sc=getBest(cg,"sci"), so=getBest(cg,"soc");

  const pool = [];
  if (e) pool.push(GP2[e]);
  if (m) pool.push(GP2[m]);

  const thirdCore = selectThirdCore(uni, prog, track, sc, so, GP2);
  if (thirdCore !== null) pool.push(thirdCore);

  el.forEach(s => { if (eg[s]) pool.push(GP2[eg[s]]); });

  pool.sort((a, b) => a - b);
  const b6 = pool.slice(0, 6);
  if (b6.length < 6) return null;
  return b6.reduce((s, p) => s + p, 0);
}

function calcAgg(track, cg, el, eg) {
  // General aggregate shown on student profile — uses standard grading, no university context
  const GP2 = {"A1":1,"B2":2,"B3":3,"C4":4,"C5":5,"C6":6,"D7":7,"E8":8,"F9":9};
  const e=getBest(cg,"eng"), m=getBest(cg,"maths"), sc=getBest(cg,"sci"), so=getBest(cg,"soc");
  const sciTrack = ["General Science","Agricultural Science","Technical"].includes(track);

  // FIXED: Build pool with ONLY the correct 3rd core subject — never both sci and soc
  const pool = [];
  if (e) pool.push(GP2[e]);
  if (m) pool.push(GP2[m]);

  if (sciTrack) {
    // Science/Agricultural/Technical: ONLY Integrated Science — Social Studies NEVER counted
    if (sc) pool.push(GP2[sc]);
  } else {
    // Arts/Business/Home Ec/Visual Arts: best of Integrated Science OR Social Studies (one only)
    const scPts = sc ? GP2[sc] : 999;
    const soPts = so ? GP2[so] : 999;
    const best = Math.min(scPts, soPts);
    if (best < 999) pool.push(best);
  }

  // Add elective grades — these are the student's chosen elective subjects only
  el.forEach(s => { if (eg[s]) pool.push(GP2[eg[s]]); });

  pool.sort((a, b) => a - b);
  const b6 = pool.slice(0, 6);
  if (b6.length < 6) return null;
  return b6.reduce((s, p) => s + p, 0);
}
function runAnalysis({ track, cg, el, eg, scope, prefUni, progType, progs, schols }) {
  const agg = calcAgg(track, cg, el, eg);
  const eGr = getBest(cg,"eng"), mGr = getBest(cg,"maths");
  const ef = !eGr || GP[eGr] >= 9, mf = !mGr || GP[mGr] >= 9;
  const ew = eGr && GP[eGr] > 6, mw = mGr && GP[mGr] > 6;
  const isHND = progType === "HND";
  let pool = scope === "one" ? progs.filter(p => p.uni === prefUni) : progs;
  pool = pool.filter(p => {
    const d = (p.degree || "").toUpperCase();
    if (progType === "Degree") return !d.includes("HND") && !d.includes("DIPLOMA") && !d.includes("CERT");
    if (progType === "HND") return d.includes("HND") || d === "";
    if (progType === "Diploma") return d.includes("DIPLOMA") || d.includes("DIP");
    if (progType === "Certificate") return d.includes("CERT");
    return true;
  });
  const q = [], n = [], b = [];
  pool.forEach(p => {
    const tArr = Array.isArray(p.track) ? p.track : (p.track ? [p.track] : []);
    const tOk = !tArr.length || tArr.includes(track);
    const pn = (p.name || "").toLowerCase();
    // KNUST Nursing/Midwifery: General Science only
    if (p.uni === "KNUST" && (pn.includes("nursing") || pn.includes("midwif")) && track !== "General Science") {
      b.push({ p, issues: [`KNUST ${p.name} requires General Science track. Your track (${track}) does not qualify.`], passes: [] });
      return;
    }
    if (!tOk) { b.push({ p, issues: [`Your track (${track}) does not qualify for this programme`], passes: [] }); return; }
    const iss = [], pass = [`Track: ${track} ✓`];
    if (isHND) {
      if (ef) iss.push("English Language F9 — must resit before applying");
      else if (mf) iss.push("Core Mathematics F9 — must resit before applying");
      else { pass.push("English ✓"); pass.push("Mathematics ✓"); }
      if (ef || mf) { b.push({ p, issues: iss, passes: [] }); return; }
    } else {
      if (ef) iss.push("English Language F9 — must resit");
      else if (ew) iss.push(`English Language ${eGr} — degree programmes require min C6`);
      else if (eGr) pass.push("English Language ✓");
      if (mf) iss.push("Core Mathematics F9 — must resit");
      else if (mw) iss.push(`Core Mathematics ${mGr} — degree programmes require min C6`);
      else if (mGr) pass.push("Core Mathematics ✓");
      if (ef || mf) { b.push({ p, issues: iss, passes: [] }); return; }
    }
    const ua = calcAggForUni(p.uni, p, track, cg, el, eg);
    if (!ua) {
      if (iss.length) { b.push({ p, issues: iss, passes: pass }); return; }
      n.push({ p, agg: null, issues: ["Enter all grades to see aggregate"], passes: pass }); return;
    }
    if (iss.length) {
      if (ua <= p.co) n.push({ p, agg: ua, issues: iss, passes: pass });
      else b.push({ p, issues: [...iss, `Aggregate (${ua}) exceeds cut-off (${p.co})`], passes: pass });
      return;
    }
    if (ua <= p.co) q.push({ p, agg: ua, passes: pass });
    else n.push({ p, agg: ua, issues: [`Your aggregate (${ua}) exceeds cut-off (${p.co})`], passes: pass });
  });
  q.sort((a, b) => a.agg - b.agg);
  return { agg, q, n, b };
}

// ─── TINY SHARED COMPONENTS ──────────────────────────────────
const Btn = ({ children, variant = "primary", size = "md", full = false, onClick, disabled = false, style = {} }) => {
  const base = "inline-flex items-center justify-center font-semibold rounded-full select-none outline-none border-0 transition-all duration-100 active:scale-95 active:opacity-80";
  const sizes = { sm:"px-3 py-1.5 text-[11px]", md:"px-4 py-2 text-[11.5px]", lg:"px-5 py-2.5 text-[12px]" };
  const variants = {
    primary: "bg-gradient-to-r from-violet-700 to-pink-500 text-white",
    outline: "bg-white text-violet-700 border-2 border-violet-600",
    ghost: "bg-white text-gray-800 border border-violet-200",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`${base} ${sizes[size]} ${variants[variant]} ${full ? "w-full" : ""} ${disabled ? "opacity-90 pointer-events-none" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
};

const Tag = ({ children }) => (
  <span className="inline-flex bg-violet-100 text-violet-700 rounded-full px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider mb-2">{children}</span>
);

const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white border border-violet-200 rounded-2xl shadow-sm ${onClick ? "cursor-pointer active:scale-98 active:opacity-90 transition-all" : ""} ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "violet" }) => {
  const colors = {
    violet: "bg-violet-100 text-violet-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[color]}`}>{children}</span>;
};

// ─── GRADE PICKER ────────────────────────────────────────────
const GradePicker = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-1">
    {GR.map(g => (
      <button
        key={g}
        onClick={() => onChange(value === g ? "" : g)}
        className={`flex-1 min-w-[32px] py-1.5 rounded-lg text-[11px] font-bold border transition-all active:scale-90 cursor-pointer select-none outline-none
          ${value === g
            ? "bg-gradient-to-r from-violet-700 to-pink-500 text-white border-transparent"
            : "bg-white text-gray-600 border-violet-200 active:border-violet-400"
          }`}
      >
        {g}
      </button>
    ))}
  </div>
);

// ─── NAV ─────────────────────────────────────────────────────
const NAV_LINKS = [
  { id:"checker", label:"Check Eligibility" },
  { id:"universities", label:"Universities" },
  { id:"cutoffs", label:"Cut-Offs" },
  { id:"scholarships", label:"Scholarships" },
  { id:"aiChat", label:"AI Counsellor" },
  { id:"about", label:"About" },
];

function Nav({ page, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ALL_LINKS = [
    ...NAV_LINKS,
    { id:"calculator", label:"📐 Calculate Aggregate" },
    { id:"programs", label:"📚 Programmes" },
    { id:"forms", label:"📝 Admission Forms" },
    { id:"news", label:"📰 News" },
    { id:"pricing", label:"💳 Pricing" },
    { id:"contact", label:"📱 Contact" },
    { id:"faq", label:"❓ FAQ" },
  ];
  const nav = (id) => { setPage(id); setMenuOpen(false); window.scrollTo(0,0); };
  return (
    <>
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-violet-700 to-pink-500 px-4 py-2 flex justify-between items-center gap-2">
        <span className="text-white text-[11px] font-semibold leading-tight">🎓 2025/2026 Admissions Open — UG, KNUST, UCC, GIMPA accepting applications</span>
        <button onClick={() => nav("forms")} className="text-white text-[10px] font-bold underline whitespace-nowrap cursor-pointer active:opacity-90 select-none outline-none border-0 bg-transparent">View All →</button>
      </div>
      {/* Nav bar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-violet-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-12">
          <button onClick={() => nav("home")} className="flex items-center gap-2 cursor-pointer active:opacity-90 select-none outline-none border-0 bg-transparent">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-700 to-pink-500 rounded-lg flex items-center justify-center text-base">🎓</div>
            <span className="font-black text-[15px] text-gray-900">Uni<span className="bg-gradient-to-r from-violet-700 to-pink-500 bg-clip-text text-transparent">Predict</span></span>
          </button>
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => nav(l.id)} className="px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium text-gray-700 hover:text-violet-700 hover:bg-violet-100 cursor-pointer select-none outline-none border-0 bg-transparent transition-all">{l.label}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Btn variant="ghost" size="sm" onClick={() => nav("checker")}>Sign In</Btn>
            <Btn size="sm" onClick={() => nav("checker")}>Get Started →</Btn>
          </div>
          <button onClick={() => setMenuOpen(o => !o)} className="md:hidden text-xl text-gray-800 cursor-pointer active:opacity-85 select-none outline-none border-0 bg-transparent px-1">☰</button>
        </div>
      </nav>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 top-[calc(2.5rem+34px)] z-30 bg-violet-100/98 backdrop-blur overflow-y-auto pb-20">
          {ALL_LINKS.map(l => (
            <button key={l.id} onClick={() => nav(l.id)}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-[13px] font-medium text-gray-800 active:bg-violet-100 active:text-violet-700 border-l-4 border-transparent active:border-violet-600 cursor-pointer select-none outline-none border-0 bg-transparent text-left transition-all">
              {l.label}
            </button>
          ))}
          <div className="mx-4 mt-3 p-4 bg-gradient-to-r from-violet-700 to-pink-500 rounded-2xl">
            <p className="text-white font-bold text-[12px] mb-1">🎓 Check Your Eligibility Now</p>
            <p className="text-white/80 text-[11px] mb-3">Basic · Premium · Bundle</p>
            <Btn full onClick={() => nav("checker")} style={{ background:"#fff", color:"#7C3AED" }}>Start My Check →</Btn>
          </div>
        </div>
      )}
    </>
  );
}

// ─── HOME PAGE ───────────────────────────────────────────────
function HomePage({ setPage, unis, progs }) {
  const ticker = ["UG 2025/2026 Admissions Open","KNUST Cut-Offs Released","Ghana Scholarship Secretariat Open","WASSCE Jan/Feb Results Accepted","UCC Admissions Open - Oct 15","Mastercard Foundation 2025 Open","UPSA Applications Now Open","GIMPA MBA & Law Admissions Open"];
  const tickerAll = [...ticker,...ticker];
  return (
    <div>
      {/* Ticker */}
      <div className="overflow-hidden bg-white border-b border-violet-200 py-2">
        <div className="flex gap-10 animate-[ticker_40s_linear_infinite] w-max">
          {tickerAll.map((t,i) => (
            <span key={i} className="text-[11px] text-gray-700 whitespace-nowrap flex items-center gap-2 before:content-['●'] before:text-violet-300 before:text-[6px]">{t}</span>
          ))}
        </div>
      </div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-100 via-pink-100 to-violet-200 px-4 pt-10 pb-14">
        <div className="absolute inset-0 opacity-90" style={{backgroundImage:"linear-gradient(rgba(124,58,237,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,.07) 1px,transparent 1px)",backgroundSize:"32px 32px"}}/>
        <div className="relative max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-white border border-violet-200 rounded-full px-3 py-1 text-[11px] font-bold text-violet-700 mb-4 shadow-sm">● Ghana's #1 University Admission Platform</div>
          <h1 className="font-black text-[28px] leading-tight text-gray-900 mb-3" style={{fontFamily:"Outfit,Arial,sans-serif",letterSpacing:"-.3px"}}>
            Predict. Match.<br/>
            <span className="bg-gradient-to-r from-violet-700 to-pink-500 bg-clip-text text-transparent">Achieve.</span>
          </h1>
          <p className="text-[12px] text-gray-700 leading-relaxed mb-5 max-w-sm">
            Enter your WASSCE results and instantly discover every university and programme you qualify for across <strong className="text-gray-700">{unis.length || 58} institutions</strong>. Subject-verified. Ranked by best match.
          </p>
          <div className="flex flex-col gap-2 max-w-xs mb-4">
            <Btn full size="lg" onClick={() => setPage("checker")}>🔍 Check My Eligibility →</Btn>
            <Btn full size="lg" variant="outline" onClick={() => setPage("calculator")}>📐 Calculate Aggregate</Btn>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["✓ Real subject checks",`✓ ${progs.length || "1,000"}+ programmes`,"✓ 2026 cut-off data","✓ Free to browse"].map(t => (
              <span key={t} className="text-[10.5px] text-gray-700 bg-white/80 rounded-full px-2.5 py-1 border border-violet-200">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white px-4 py-10">
        <div className="max-w-lg mx-auto text-center">
          <Tag>How It Works</Tag>
          <h2 className="font-black text-[18px] text-gray-900 mb-1" style={{fontFamily:"Outfit,Arial,sans-serif"}}>3 Steps to Know Your Options</h2>
          <p className="text-[11.5px] text-gray-600 mb-6">From results to university matches in under 2 minutes</p>
          <div className="grid grid-cols-3 gap-3">
            {[{n:1,e:"📝",t:"Enter Grades",d:"Select your SHS track and enter WASSCE results."},{n:2,e:"💳",t:"Pay Securely",d:"MTN MoMo, Vodafone, Card."},{n:3,e:"🎯",t:"Get Results",d:"Every programme ranked by eligibility."}].map(s => (
              <div key={s.n} className="bg-violet-100 rounded-xl p-3 text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-700 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-[13px] mx-auto mb-2 shadow">{s.n}</div>
                <div className="text-[20px] mb-1">{s.e}</div>
                <div className="font-bold text-[11.5px] text-gray-800 mb-1">{s.t}</div>
                <div className="text-[10.5px] text-gray-600 leading-snug">{s.d}</div>
              </div>
            ))}
          </div>
          <div className="mt-5"><Btn onClick={() => setPage("checker")}>Start My Free Check →</Btn></div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-violet-100 px-4 py-10">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-5">
            <Tag>Everything You Need</Tag>
            <h2 className="font-black text-[18px] text-gray-900" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Built for Ghanaian Students</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {icon:"🎯",t:"Eligibility Checker",d:"Official WASSCE formula. Programme-specific for all universities.",pg:"checker"},
              {icon:"🤖",t:"AI Counsellor",d:"Personalised advice on programmes and career paths.",pg:"aiChat"},
              {icon:"🎓",t:"Scholarships",d:"GETFUND, Mastercard Foundation, MTN Ghana and more.",pg:"scholarships"},
              {icon:"📊",t:"Cut-Off Points",d:"Official 2025/2026 cut-off aggregates.",pg:"cutoffs"},
              {icon:"🏛️",t:"Universities",d:"Browse all 58 accredited Ghanaian universities.",pg:"universities"},
              {icon:"📝",t:"Admission Forms",d:"Track form openings, deadlines and portal links.",pg:"forms"},
            ].map(f => (
              <Card key={f.t} className="p-3" onClick={() => setPage(f.pg)}>
                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-[18px] mb-2">{f.icon}</div>
                <div className="font-bold text-[11.5px] text-gray-900 mb-1">{f.t}</div>
                <div className="text-[10.5px] text-gray-600 leading-snug">{f.d}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gradient-to-br from-violet-700 to-pink-500 px-4 py-10">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-5">
            <h2 className="font-black text-[18px] text-white mb-1" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Simple, Affordable Pricing</h2>
            <p className="text-white/80 text-[11.5px]">No subscription. Pay only when you need a check.</p>
          </div>
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {[
              {icon:"🏛️",n:"Basic",p:PRICES.basic,sub:"1 Check"},
              {icon:"⭐",n:"Premium",p:PRICES.premium,sub:"3 Checks",pop:true},
              {icon:"🔥",n:"Bundle",p:PRICES.bundle,sub:"5 Checks"},
            ].map(plan => (
              <button key={plan.n} onClick={() => setPage("checker")}
                className={`relative rounded-2xl p-3 text-center cursor-pointer active:scale-95 transition-all select-none outline-none border-0 ${plan.pop ? "bg-white/25 border-2 border-white/80" : "bg-white/15 border border-white/25"}`}>
                {plan.pop && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white text-violet-700 text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">POPULAR</div>}
                <div className="text-[20px] mb-1">{plan.icon}</div>
                <div className="font-black text-[20px] text-white leading-none mb-0.5">GHC{plan.p}</div>
                <div className="text-white/90 font-bold text-[11px]">{plan.n}</div>
                <div className="text-white/65 text-[10px]">{plan.sub}</div>
              </button>
            ))}
          </div>
          <Btn full style={{background:"#fff",color:"#7C3AED",border:"none"}} onClick={() => setPage("checker")}>Check My Eligibility Now</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── CHECKER (6-STEP WIZARD) ──────────────────────────────────
const STEPS = ["SHS Track","Your Profile","Core Subjects","Electives","Review & Pay","Results"];
function CheckerPage({ unis, progs, schols, paystackKey }) {
  const [step, setStep] = useState(1);
  const [track, setTrack] = useState("");
  const [sit, setSit] = useState(1);
  const [cg, setCg] = useState({});
  const [el, setEl] = useState([]);
  const [eg, setEg] = useState({});
  const [scope, setScope] = useState("all");
  const [prefUni, setPrefUni] = useState("");
  const [progType, setProgType] = useState("Degree");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("premium");
  const [payStep, setPayStep] = useState(null);
  const [res, setRes] = useState(null);
  const [tab, setTab] = useState("q");
  const [quota, setQuota] = useState(null); // {remaining, plan} for returning students
  const [checkingQuota, setCheckingQuota] = useState(false);

  const lookupQuota = async (ph) => {
    if (!ph || ph.length < 10) return;
    setCheckingQuota(true);
    const data = await fetch(`${SUPA_URL}/rest/v1/check_quota?phone=eq.${encodeURIComponent(ph)}&select=remaining,plan`,{headers:SUPA_H}).then(r=>r.json()).catch(()=>[]);
    setQuota(data?.[0] || null);
    setCheckingQuota(false);
  };

  const useRemainingCheck = async () => {
    if (!quota || quota.remaining < 1) return;
    // Deduct 1 check
    await fetch(`${SUPA_URL}/rest/v1/check_quota?phone=eq.${encodeURIComponent(phone)}`,{
      method:"PATCH",
      headers:{...SUPA_H,"Content-Type":"application/json"},
      body: JSON.stringify({ remaining:quota.remaining-1, updated_at:new Date().toISOString() })
    }).catch(()=>{});
    // Save student check
    await fetch(`${SUPA_URL}/rest/v1/student_checks`, {
      method:"POST",
      headers:{...SUPA_H,"Content-Type":"application/json","Prefer":"return=representation"},
      body: JSON.stringify({
        phone, email:email||null, plan:quota.plan, track, prog_type:progType, scope,
        pref_uni:prefUni||null, sittings:sit,
        grades_core:{ eng:getBest(cg,"eng"), maths:getBest(cg,"maths"), sci:getBest(cg,"sci"), soc:getBest(cg,"soc") },
        grades_raw:cg, electives:el, elective_grades:eg,
        aggregate:calcAgg(track,cg,el,eg),
        payment_ref:"quota-used", checked_at:new Date().toISOString()
      })
    }).catch(()=>{});
    setQuota(q => ({...q, remaining:q.remaining-1}));
    setRes(runAnalysis({ track, cg, el, eg, scope, prefUni, progType, progs, schols }));
    go(6);
  };

  const go = (n) => { setStep(n); window.scrollTo(0,0); };

  const CORES = [
    {k:"eng",  l:"English Language *"},
    {k:"maths",l:"Core Mathematics *"},
    {k:"sci",  l:"Integrated Science"},
    {k:"soc",  l:"Social Studies"},
  ];

  const doPaystack = () => {
    const amt = PRICES[plan];
    if (typeof window.PaystackPop === "undefined") { alert("Payment could not load. Please refresh."); return; }
    if (!paystackKey) { alert("Payment not configured. Contact UniPredict Ghana: 0537 889 150"); return; }
    window.PaystackPop.setup({
      key: paystackKey,
      email: email || "student@unipredictghana.com",
      amount: amt * 100,
      currency: "GHS",
      ref: "UNI-" + Date.now(),
      metadata: { plan, phone },
      callback: async (response) => {
        setPayStep("done");
        const checksGranted = PLAN_CHECKS[plan] || 1;

        // Save payment record
        await fetch(`${SUPA_URL}/rest/v1/payments`, {
          method:"POST",
          headers:{...SUPA_H,"Content-Type":"application/json","Prefer":"return=representation"},
          body: JSON.stringify({ reference:response.reference, plan, amount:amt*100, currency:"GHS", phone, status:"success", verified_at:new Date().toISOString() })
        }).catch(()=>{});

        // Check if quota record exists for this phone
        const existing = await fetch(`${SUPA_URL}/rest/v1/check_quota?phone=eq.${encodeURIComponent(phone)}&select=id,remaining,plan`,{headers:SUPA_H}).then(r=>r.json()).catch(()=>[]);

        if (existing?.[0]?.id) {
          // Add checks to existing quota
          const newRemaining = (existing[0].remaining || 0) + checksGranted;
          await fetch(`${SUPA_URL}/rest/v1/check_quota?id=eq.${existing[0].id}`,{
            method:"PATCH",
            headers:{...SUPA_H,"Content-Type":"application/json"},
            body: JSON.stringify({ remaining:newRemaining, plan, updated_at:new Date().toISOString() })
          }).catch(()=>{});
        } else {
          // Create new quota record
          await fetch(`${SUPA_URL}/rest/v1/check_quota`,{
            method:"POST",
            headers:{...SUPA_H,"Content-Type":"application/json","Prefer":"return=representation"},
            body: JSON.stringify({ phone, plan, remaining:checksGranted, total_purchased:checksGranted, created_at:new Date().toISOString(), updated_at:new Date().toISOString() })
          }).catch(()=>{});
        }

        // Deduct 1 check and save result
        await fetch(`${SUPA_URL}/rest/v1/check_quota?phone=eq.${encodeURIComponent(phone)}`,{
          method:"PATCH",
          headers:{...SUPA_H,"Content-Type":"application/json"},
          body: JSON.stringify({ remaining: Math.max(0,(existing?.[0]?.remaining||0)+checksGranted-1), updated_at:new Date().toISOString() })
        }).catch(()=>{});

        await fetch(`${SUPA_URL}/rest/v1/student_checks`, {
          method:"POST",
          headers:{...SUPA_H,"Content-Type":"application/json","Prefer":"return=representation"},
          body: JSON.stringify({
            phone, email:email||null, plan, track, prog_type:progType, scope,
            pref_uni:prefUni||null, sittings:sit,
            grades_core:{ eng:getBest(cg,"eng"), maths:getBest(cg,"maths"), sci:getBest(cg,"sci"), soc:getBest(cg,"soc") },
            grades_raw:cg, electives:el, elective_grades:eg,
            aggregate:calcAgg(track,cg,el,eg),
            payment_ref:response.reference, checked_at:new Date().toISOString()
          })
        }).catch(()=>{});

        setTimeout(() => {
          setPayStep(null);
          setRes(runAnalysis({ track, cg, el, eg, scope, prefUni, progType, progs, schols }));
          go(6);
        }, 2000);
      },
      onClose: () => {},
    }).openIframe();
  };

  const electives = TRACKS[track]?.electives || [];
  const elReady = el.length >= 3 && el.every(e => !!eg[e]);
  const resultItems = tab === "s" ? schols : (res?.[tab] || []);
  const amt = PRICES[plan];

  return (
    <div className="max-w-lg mx-auto px-4 py-4">

      {/* Header */}
      <div className="bg-white border border-violet-200 rounded-2xl shadow-sm p-3 mb-3 flex gap-3 items-start">
        <div className="text-[28px] flex-shrink-0">🎓</div>
        <div>
          <h2 className="font-black text-[14px] text-gray-900 mb-0.5" style={{fontFamily:"Outfit,Arial,sans-serif"}}>University Eligibility Checker</h2>
          <p className="text-[10.5px] text-gray-600">Full subject verification · Ranked results · 58 universities</p>
        </div>
      </div>

      {/* Wizard progress bar */}
      <div className="bg-white border border-violet-200 rounded-2xl shadow-sm p-3 mb-3 overflow-x-auto" style={{scrollbarWidth:"none"}}>
        <div className="flex items-center gap-1 w-max">
          {STEPS.map((s,i) => {
            const n=i+1, done=n<step, active=n===step;
            return (
              <div key={n} className="flex items-center gap-1 flex-shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 flex-shrink-0
                  ${done?"bg-white border-violet-600 text-violet-700"
                  :active?"bg-gradient-to-br from-violet-700 to-pink-500 border-transparent text-white"
                  :"bg-white border-violet-200 text-violet-300"}`}>
                  {done?"✓":n}
                </div>
                <span className={`text-[9.5px] font-semibold whitespace-nowrap
                  ${active?"text-violet-700 font-bold":done?"text-violet-500":"text-gray-700"}`}>
                  {s}
                </span>
                {i<5 && <div className={`w-3 h-0.5 flex-shrink-0 ${done?"bg-violet-1000":"bg-violet-100"}`}/>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── STEP 1: Track ─── */}
      {step === 1 && (
        <div>
          <h2 className="font-black text-[14px] text-gray-900 mb-1" style={{fontFamily:"Outfit,Arial,sans-serif"}}>What is your SHS Track?</h2>
          <p className="text-[11px] text-gray-600 mb-4">Your track determines which programmes you qualify for.</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.entries(TRACKS).map(([name,t]) => (
              <button key={name}
                onClick={() => { setTrack(name); setEl([]); setEg({}); }}
                className={`rounded-xl p-3 text-left cursor-pointer active:scale-95 transition-all select-none outline-none border-2
                  ${track===name?"border-violet-600 bg-violet-100 shadow-sm":"border-violet-200 bg-white"}`}>
                <div className="text-[20px] mb-1">{t.icon}</div>
                <div className="font-bold text-[11px] text-gray-900 mb-0.5">{name}</div>
                <div className="text-[10px] text-gray-600 leading-snug">{t.sub}</div>
              </button>
            ))}
          </div>
          <Btn full size="lg" disabled={!track} onClick={() => go(2)}>Continue: Your Profile →</Btn>
        </div>
      )}

      {/* ─── STEP 2: Profile ─── */}
      {step === 2 && (
        <div>
          <h2 className="font-black text-[14px] text-gray-900 mb-1" style={{fontFamily:"Outfit,Arial,sans-serif"}}>What Are You Looking For?</h2>
          <p className="text-[11px] text-gray-600 mb-3">Choose the type of programme you want to pursue.</p>
          <div className="space-y-2 mb-4">
            {[
              ["Degree","Bachelor Degree","BSc, BA, BEd, LLB, MBChB etc."],
              ["HND","HND","Higher National Diploma. D7 acceptable."],
              ["Diploma","Diploma","University diploma programmes."],
              ["Certificate","Certificate","Certificate and short courses."],
            ].map(([id,label,desc]) => (
              <button key={id}
                onClick={() => setProgType(id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left cursor-pointer active:scale-98 transition-all select-none outline-none
                  ${progType===id?"border-violet-600 bg-violet-100":"border-violet-200 bg-white"}`}>
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0
                  ${progType===id?"border-violet-600 bg-violet-600":"border-violet-200"}`}/>
                <div>
                  <div className="font-bold text-[12px] text-gray-900">{label}</div>
                  <div className="text-[10.5px] text-gray-600">{desc}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Phone Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0XX XXX XXXX"
              autoComplete="tel"
              className="w-full px-3 py-2.5 border-2 border-violet-200 rounded-xl text-[12.5px] font-medium text-gray-800 outline-none bg-white"
              style={{WebkitAppearance:"none"}}
            />
          </div>
          <div className="flex gap-2">
            <Btn variant="ghost" size="md" onClick={() => go(1)}>← Back</Btn>
            <Btn full size="lg" disabled={!phone} onClick={() => go(3)}>Continue: Core Subjects →</Btn>
          </div>
        </div>
      )}

      {/* ─── STEP 3: Core Subjects ─── */}
      {step === 3 && (
        <div>
          <h2 className="font-black text-[14px] text-gray-900 mb-1" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Core Subject Grades</h2>
          <p className="text-[11px] text-gray-600 mb-3">If 2 sittings, enter both — we use the best grade automatically.</p>
          <div className="flex gap-2 mb-4">
            {[1,2].map(n => (
              <button key={n}
                onClick={() => setSit(n)}
                className={`flex-1 py-2 rounded-full text-[11px] font-bold cursor-pointer active:scale-95 transition-all select-none outline-none border-2
                  ${sit===n?"bg-gradient-to-r from-violet-700 to-pink-500 text-white border-transparent":"bg-white text-gray-700 border-violet-200"}`}>
                {n} Sitting{n>1?"s":""}
              </button>
            ))}
          </div>
          <div className="space-y-4 mb-4">
            {CORES.map(s => (
              <div key={s.k}>
                <div className="text-[11.5px] font-bold text-gray-800 mb-1.5">{s.l}</div>
                {sit===2 && <div className="text-[10px] text-gray-600 mb-1">Sitting 1 (May/June)</div>}
                <GradePicker value={cg[s.k]||""} onChange={v => setCg(c => ({...c,[s.k]:v}))}/>
                {sit===2 && (
                  <>
                    <div className="text-[10px] text-gray-600 mt-2 mb-1">Sitting 2 (Nov/Dec)</div>
                    <GradePicker value={cg[s.k+"2"]||""} onChange={v => setCg(c => ({...c,[s.k+"2"]:v}))}/>
                    {cg[s.k] && cg[s.k+"2"] && (
                      <div className="text-[10px] text-emerald-600 font-bold mt-1">
                        ✓ Best: {GP[cg[s.k]]<=GP[cg[s.k+"2"]] ? cg[s.k] : cg[s.k+"2"]}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Btn variant="ghost" size="md" onClick={() => go(2)}>← Back</Btn>
            <Btn full size="lg" onClick={() => go(4)}>Continue: Electives →</Btn>
          </div>
        </div>
      )}

      {/* ─── STEP 4: Electives ─── */}
      {step === 4 && (
        <div>
          <h2 className="font-black text-[14px] text-gray-900 mb-1" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Elective Subjects</h2>
          {el.length < 3 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 mb-3 text-[11px] text-amber-800">
              Select at least 3 subjects and set a grade for each. ({el.length} selected)
            </div>
          )}
          <div className="space-y-2 mb-4">
            {electives.map(e => {
              const on = el.includes(e);
              return (
                <div key={e}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer active:scale-98 transition-all select-none
                    ${on?"border-violet-600 bg-violet-100":"border-violet-200 bg-white"}`}
                  onClick={() => {
                    if (on) {
                      setEl(l => l.filter(x => x !== e));
                      setEg(g => { const ng={...g}; delete ng[e]; return ng; });
                    } else {
                      setEl(l => [...l, e]);
                    }
                  }}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-[10px] font-black flex-shrink-0
                    ${on?"bg-gradient-to-br from-violet-700 to-pink-500 border-transparent text-white":"border-violet-200"}`}>
                    {on?"✓":""}
                  </div>
                  <div className="flex-1 text-[12px] font-medium text-gray-800">{e}</div>
                  {on && (
                    <select
                      value={eg[e]||""}
                      onClick={ev => ev.stopPropagation()}
                      onChange={ev => { ev.stopPropagation(); setEg(g => ({...g,[e]:ev.target.value})); }}
                      className="text-[11px] font-bold border-2 border-violet-200 rounded-lg px-2 py-1 bg-white text-gray-700 outline-none w-20 cursor-pointer"
                      style={{WebkitAppearance:"none",appearance:"none"}}>
                      <option value="">Grade</option>
                      {GR.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Btn variant="ghost" size="md" onClick={() => go(3)}>← Back</Btn>
            <Btn full size="lg" disabled={!elReady} onClick={() => go(5)}>Continue: Review →</Btn>
          </div>
        </div>
      )}

      {/* ─── STEP 5: Review & Pay ─── */}
      {step === 5 && (
        <div>
          <h2 className="font-black text-[14px] text-gray-900 mb-3" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Review Your Details</h2>
          <div className="bg-white border border-violet-200 rounded-2xl shadow-sm overflow-hidden mb-3">
            <table className="w-full text-[11px]">
              <tbody>
                {[
                  ["Track", track],
                  ["Electives", el.join(", ")||"—"],
                  ["English", getBest(cg,"eng")||"—"],
                  ["Maths", getBest(cg,"maths")||"—"],
                  ["Science", getBest(cg,"sci")||"—"],
                  ["Social Studies", getBest(cg,"soc")||"—"],
                ].map(([k,v],i) => (
                  <tr key={k} className={i%2===0?"bg-violet-100":""}>
                    <td className="py-1.5 px-3 text-gray-600 font-semibold w-28">{k}</td>
                    <td className="py-1.5 px-3 text-gray-800 font-bold">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white border border-violet-200 rounded-2xl shadow-sm p-3 mb-3">
            <div className="font-bold text-[11.5px] text-gray-800 mb-2">Which university to check?</div>
            <div className="flex gap-2 mb-2">
              {[["all","All Universities"],["one","Specific University"]].map(([id,label]) => (
                <button key={id}
                  onClick={() => setScope(id)}
                  className={`flex-1 py-1.5 rounded-full text-[11px] font-bold cursor-pointer active:scale-95 transition-all select-none outline-none border-2
                    ${scope===id?"bg-gradient-to-r from-violet-700 to-pink-500 text-white border-transparent":"bg-white text-gray-700 border-violet-200"}`}>
                  {label}
                </button>
              ))}
            </div>
            {scope==="one" && (
              <select
                value={prefUni}
                onChange={e => setPrefUni(e.target.value)}
                className="w-full px-3 py-2 border-2 border-violet-200 rounded-xl text-[11.5px] font-medium text-gray-700 outline-none bg-white cursor-pointer"
                style={{WebkitAppearance:"none"}}>
                <option value="">Select university...</option>
                {unis.map(u => <option key={u.code} value={u.code}>{u.name}</option>)}
              </select>
            )}
          </div>
          {/* Returning student quota check */}
          {phone && phone.length >= 10 && quota === null && !checkingQuota && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
              <div className="font-bold text-[11.5px] text-blue-700 mb-1">Already paid before?</div>
              <div className="text-[11px] text-gray-600 mb-2">Enter your phone number above then tap to check your remaining checks.</div>
              <Btn size="sm" onClick={() => lookupQuota(phone)}>Check Remaining Checks</Btn>
            </div>
          )}
          {checkingQuota && <div className="text-[11px] text-violet-600 mb-3 text-center">Checking your quota...</div>}
          {quota && quota.remaining > 0 && (
            <div className="bg-green-50 border-2 border-green-400 rounded-xl p-3 mb-3">
              <div className="font-bold text-[12px] text-green-700 mb-0.5">✅ You have {quota.remaining} check{quota.remaining > 1 ? "s" : ""} remaining!</div>
              <div className="text-[11px] text-gray-600 mb-2">Use one of your remaining checks — no payment needed.</div>
              <Btn variant="success" full onClick={useRemainingCheck}>Use a Check ({quota.remaining} left) →</Btn>
            </div>
          )}
          {quota && quota.remaining === 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-3">
              <div className="font-bold text-[11.5px] text-amber-700 mb-0.5">⚠️ No checks remaining</div>
              <div className="text-[11px] text-gray-600">You've used all your checks. Purchase a new plan below.</div>
            </div>
          )}
          <div className="bg-violet-100 border-2 border-violet-200 rounded-xl p-3 mb-4">
            <div className="font-bold text-[11.5px] text-violet-700 mb-0.5">Payment required to unlock results</div>
            <div className="text-[11px] text-gray-700">Choose a plan and pay securely via Mobile Money or card.</div>
          </div>
          <div className="flex gap-2">
            <Btn variant="ghost" size="md" onClick={() => go(4)}>← Back</Btn>
            <Btn full size="lg" onClick={() => setPayStep("plan")}>Buy a Plan →</Btn>
          </div>
        </div>
      )}

      {/* ─── STEP 6: Results ─── */}
      {step === 6 && res && (
        <div>
          <div className="bg-gradient-to-br from-violet-700 to-pink-500 rounded-2xl p-4 mb-3">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">✓ Done</span>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{track}</span>
                </div>
                <h2 className="text-white font-black text-[15px] mb-0.5" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Your Eligibility Results</h2>
                <div className="text-white/70 text-[10.5px]">{el.join(", ")}</div>
              </div>
              <div className="text-center flex-shrink-0 ml-3">
                <div className="text-white/70 text-[9px] font-bold uppercase tracking-wider mb-0.5">Aggregate</div>
                <div className="font-black text-[44px] text-white leading-none" style={{fontFamily:"Outfit,Arial,sans-serif"}}>{res.agg||"—"}</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[{n:res.q.length,l:"Qualified"},{n:res.n.length,l:"Near Miss"},{n:res.b.length,l:"Blocked"},{n:schols.length,l:"Scholarships"}].map(s => (
                <div key={s.l} className="bg-white/15 rounded-xl p-2 text-center">
                  <div className="font-black text-[18px] text-white leading-none" style={{fontFamily:"Outfit,Arial,sans-serif"}}>{s.n}</div>
                  <div className="text-white/70 text-[9px] mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto mb-3 pb-0.5" style={{scrollbarWidth:"none"}}>
            {[
              {id:"q", label:`✓ Qualified (${res.q.length})`},
              {id:"n", label:`Near Miss (${res.n.length})`},
              {id:"b", label:`Blocked (${res.b.length})`},
              {id:"s", label:"Scholarships"},
            ].map(t => (
              <button key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0 cursor-pointer active:scale-95 transition-all select-none outline-none border-2
                  ${tab===t.id?"bg-gradient-to-r from-violet-700 to-pink-500 text-white border-transparent":"bg-white text-gray-700 border-violet-200"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Result items */}
          <div className="space-y-2 mb-4">
            {tab==="s" ? resultItems.map((s,i) => (
              <div key={i} className="bg-white border border-violet-200 rounded-2xl shadow-sm p-3" style={{borderLeft:"4px solid #10b981"}}>
                <div className="font-bold text-[12px] text-gray-900 mb-0.5">{s.name}</div>
                <div className="text-[11px] text-gray-600 mb-2">{s.org}</div>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{s.amount}</span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">{s.deadline}</span>
                </div>
                <Btn size="sm">Apply Now</Btn>
              </div>
            )) : resultItems.length===0 ? (
              <div className="text-center py-8 text-[12px] text-gray-600">No programmes in this category.</div>
            ) : resultItems.map((item,i) => (
              <div key={i} className="bg-white border border-violet-200 rounded-2xl shadow-sm p-3"
                style={{borderLeft:`4px solid ${tab==="q"?"#10b981":tab==="n"?"#f59e0b":"#fca5a5"}`}}>
                <div className="font-bold text-[12px] text-gray-900 mb-1.5">{item.p.name}</div>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{item.p.uni}</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold">Cut-off: {item.p.co}</span>
                  {item.agg && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.agg<=item.p.co?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-700"}`}>
                      Your agg: {item.agg}
                    </span>
                  )}
                </div>
                {tab==="q" && item.passes?.length>0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-[10.5px] text-emerald-700 mb-1.5">
                    ✓ {item.passes.join(" · ")}
                  </div>
                )}
                {tab!=="q" && item.issues?.length>0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-[10.5px] text-red-700 mb-1.5">
                    {item.issues.join(" · ")}
                  </div>
                )}
                {item.p.career && (
                  <div className="bg-violet-100 rounded-lg p-2 mt-1.5">
                    <div className="text-[9.5px] font-black text-violet-700 uppercase tracking-wider mb-0.5">Career Paths</div>
                    <div className="text-[10.5px] text-gray-700">{item.p.career}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Btn size="sm" onClick={() => downloadResult(res,track,el,eg,cg,schols)}>📥 Download Result</Btn>
            <Btn variant="ghost" size="sm" onClick={() => { setStep(1); setTrack(""); setCg({}); setEl([]); setEg({}); setRes(null); }}>New Check</Btn>
          </div>
        </div>
      )}

      {/* ─── PAYMENT MODAL ─── */}
      {payStep && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
          onClick={() => { if (payStep !== "done") setPayStep(null); }}>
          <div
            className="bg-white w-full max-w-md rounded-t-3xl p-5 pb-8 max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"/>

            {/* Plan selection */}
            {payStep === "plan" && (
              <>
                <h3 className="font-black text-[14px] text-gray-900 mb-3" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Choose Your Plan</h3>
                {[
                  ["basic","🏛️",`Basic — GHC${PRICES.basic}`,"1 university · 1 check",false],
                  ["premium","⭐",`Premium — GHC${PRICES.premium}`,"All 58 universities · 3 checks",true],
                  ["bundle","🔥",`Bundle — GHC${PRICES.bundle}`,"All 58 universities · 5 checks",false],
                ].map(([id,icon,name,desc,pop]) => (
                  <button key={id}
                    onClick={() => setPlan(id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 mb-2 text-left cursor-pointer active:scale-98 transition-all select-none outline-none relative
                      ${plan===id?"border-violet-600 bg-violet-100":"border-violet-200 bg-white"}`}>
                    {pop && <div className="absolute -top-2 right-3 bg-gradient-to-r from-violet-700 to-pink-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">POPULAR</div>}
                    <span className="text-[20px]">{icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-[12px] text-gray-900">{name}</div>
                      <div className="text-[11px] text-gray-600">{desc}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${plan===id?"border-violet-600 bg-violet-600":"border-violet-200"}`}/>
                  </button>
                ))}
                <div style={{marginTop:"8px"}}>
                  <Btn full size="lg" onClick={() => setPayStep("method")}>Continue to Payment →</Btn>
                </div>
              </>
            )}

            {/* Payment details — inputs here, NO nested components */}
            {payStep === "method" && (
              <>
                <h3 className="font-black text-[14px] text-gray-900 mb-1" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Payment Details</h3>
                <p className="text-[11px] text-gray-600 mb-3">Paying <strong>GHC{amt}</strong> for {plan} plan</p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 mb-4 text-[11px] text-emerald-700">
                  ✓ Paystack — MTN MoMo · Vodafone Cash · AirtelTigo · Visa · Mastercard
                </div>
                <div className="mb-3">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0XX XXX XXXX"
                    autoComplete="tel"
                    className="w-full px-3 py-2.5 border-2 border-violet-200 rounded-xl text-[13px] font-medium text-gray-800 outline-none bg-white"
                    style={{WebkitAppearance:"none"}}
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Email (optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="w-full px-3 py-2.5 border-2 border-violet-200 rounded-xl text-[13px] font-medium text-gray-800 outline-none bg-white"
                    style={{WebkitAppearance:"none"}}
                  />
                </div>
                <div className="flex gap-2">
                  <Btn variant="ghost" size="md" onClick={() => setPayStep("plan")}>← Back</Btn>
                  <Btn full size="lg" disabled={!phone} onClick={() => setPayStep("confirm")}>Pay GHC{amt} →</Btn>
                </div>
              </>
            )}

            {/* Confirm */}
            {payStep === "confirm" && (
              <div className="text-center py-4">
                <div className="text-[44px] mb-3">🔒</div>
                <h3 className="font-black text-[14px] text-gray-900 mb-1" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Ready to Pay</h3>
                <p className="text-[11.5px] text-gray-700 mb-1">Plan: <strong>{plan}</strong> — GHC{amt}</p>
                <p className="text-[11px] text-gray-600 mb-5">Paystack secure checkout · MTN MoMo · Vodafone · Card</p>
                <Btn full size="lg" onClick={doPaystack}>Pay with Paystack →</Btn>
                <p className="text-[10px] text-gray-600 mt-2">PCI-DSS Certified</p>
              </div>
            )}

            {/* Done */}
            {payStep === "done" && (
              <div className="text-center py-6">
                <div className="text-[52px] mb-3">✅</div>
                <h3 className="font-black text-[14px] text-emerald-600 mb-1" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Payment Confirmed!</h3>
                <p className="text-[11.5px] text-gray-700">Running eligibility analysis...</p>
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mt-4"/>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}


// ─── DOWNLOAD RESULT ─────────────────────────────────────────
function downloadResult(res, track, el, eg, cg, schols) {
  if (!res) return;
  const w = window.open("","_blank");
  if (!w) { alert("Please allow popups to download your result."); return; }
  const date = new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  const time = new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
  let qHTML="",nHTML="";
  res.q.forEach(item=>{qHTML+=`<div style="background:#fff;border-radius:10px;padding:12px 14px;margin-bottom:7px;border:1px solid #d1fae5;border-left:4px solid #10b981"><div style="font-weight:700;font-size:12.5px;color:#1a1a2e;margin-bottom:5px">${item.p.name}</div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:5px"><span style="background:#ede9fe;color:#5b21b6;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700">${item.p.uni}</span><span style="background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700">Cut-off: ${item.p.co}</span>${item.agg?`<span style="background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700">Your agg: ${item.agg}</span>`:""}</div>${item.p.career?`<div style="font-size:10.5px;color:#6b7280">🎯 ${item.p.career}</div>`:""}</div>`;});
  res.n.forEach(item=>{nHTML+=`<div style="background:#fff;border-radius:10px;padding:12px 14px;margin-bottom:7px;border:1px solid #fef3c7;border-left:4px solid #f59e0b"><div style="font-weight:700;font-size:12.5px;color:#1a1a2e;margin-bottom:5px">${item.p.name}</div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:5px"><span style="background:#ede9fe;color:#5b21b6;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700">${item.p.uni}</span><span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700">Cut-off: ${item.p.co}</span>${item.agg?`<span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700">Agg: ${item.agg}</span>`:""}</div>${item.issues?.length?`<div style="font-size:10.5px;color:#92400e;background:#fffbeb;border-radius:6px;padding:5px 9px">${item.issues.join(" · ")}</div>`:""}</div>`;});
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>UniPredict Ghana — My Eligibility Result</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Outfit:wght@700;800;900&display=swap" rel="stylesheet"/><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,Arial,sans-serif;background:#f5f3ff;color:#1a1a2e;padding:16px;font-size:12px}.wrap{max-width:680px;margin:0 auto}.header{background:linear-gradient(135deg,#7C3AED,#EC4899);border-radius:14px;padding:22px;margin-bottom:14px;color:#fff}.logo{font-family:Outfit,Arial,sans-serif;font-weight:900;font-size:15px;margin-bottom:12px}.header-row{display:flex;justify-content:space-between;align-items:flex-end;gap:10px;flex-wrap:wrap}.h-info h1{font-family:Outfit,Arial,sans-serif;font-weight:900;font-size:18px;margin-bottom:3px}.h-info p{font-size:10.5px;opacity:.8}.agg-box{background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.35);border-radius:12px;padding:10px 16px;text-align:center}.agg-num{font-family:Outfit,Arial,sans-serif;font-weight:900;font-size:40px;line-height:1;color:#fff}.agg-lbl{font-size:9px;font-weight:700;color:rgba(255,255,255,.75);text-transform:uppercase;letter-spacing:1px;margin-top:2px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}.stat{background:#fff;border-radius:10px;padding:11px;text-align:center;border:1px solid rgba(124,58,237,.1)}.stat-num{font-family:Outfit,Arial,sans-serif;font-weight:900;font-size:24px}.q{color:#10b981}.nm{color:#f59e0b}.bl{color:#ef4444}.stat-lbl{font-size:9.5px;font-weight:600;color:#9090b0;text-transform:uppercase;letter-spacing:.4px;margin-top:2px}.profile{background:#fff;border-radius:11px;padding:13px 15px;margin-bottom:12px;border:1px solid rgba(124,58,237,.1)}.profile h2{font-size:9.5px;font-weight:800;color:#7C3AED;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}.profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}.pf{background:#f8f5ff;border-radius:7px;padding:7px 10px}.pf-lbl{font-size:9px;font-weight:700;color:#9090b0;text-transform:uppercase;letter-spacing:.4px;margin-bottom:1px}.pf-val{font-size:12px;font-weight:700;color:#1a1a2e}.section{margin-bottom:14px}.sec-hd{display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #f0effe}.sec-hd h2{font-family:Outfit,Arial,sans-serif;font-weight:900;font-size:13px;color:#1a1a2e}.cnt{padding:2px 9px;border-radius:99px;font-size:10px;font-weight:700;background:#d1fae5;color:#065f46}.cnt-n{background:#fef3c7;color:#92400e}.footer{background:#fff;border-radius:11px;padding:14px 18px;margin-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;border:1px solid rgba(124,58,237,.1)}.brand{font-family:Outfit,Arial,sans-serif;font-weight:900;font-size:13px;background:linear-gradient(135deg,#7C3AED,#EC4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.fi{font-size:10.5px;color:#94a3b8;text-align:right}.pbar{position:fixed;bottom:0;left:0;right:0;background:rgba(255,255,255,.96);backdrop-filter:blur(10px);padding:10px 16px;display:flex;gap:8px;justify-content:center;border-top:1px solid rgba(0,0,0,.07)}.pbtn{background:linear-gradient(135deg,#7C3AED,#EC4899);color:#fff;border:none;padding:10px 24px;border-radius:7px;font-size:13px;font-weight:700;cursor:pointer;font-family:Inter,sans-serif}.cbtn{background:#f1f5f9;color:#475569;border:none;padding:10px 18px;border-radius:7px;font-size:13px;font-weight:700;cursor:pointer;font-family:Inter,sans-serif}@media print{.pbar{display:none}body{background:#fff}}</style></head><body><div class="wrap"><div class="header"><div class="logo">🎓 UniPredict Ghana</div><div class="header-row"><div class="h-info"><h1>My Eligibility Result</h1><p>Generated ${date} at ${time} · PREDICT. MATCH. ACHIEVE.</p></div><div class="agg-box"><div class="agg-num">${res.agg||"—"}</div><div class="agg-lbl">Aggregate</div></div></div></div><div class="stats"><div class="stat"><div class="stat-num q">${res.q.length}</div><div class="stat-lbl">Qualified</div></div><div class="stat"><div class="stat-num nm">${res.n.length}</div><div class="stat-lbl">Near Miss</div></div><div class="stat"><div class="stat-num bl">${res.b.length}</div><div class="stat-lbl">Blocked</div></div></div><div class="profile"><h2>Student Profile</h2><div class="profile-grid"><div class="pf"><div class="pf-lbl">Track</div><div class="pf-val">${track}</div></div><div class="pf"><div class="pf-lbl">English</div><div class="pf-val">${getBest(cg,"eng")||"—"}</div></div><div class="pf"><div class="pf-lbl">Mathematics</div><div class="pf-val">${getBest(cg,"maths")||"—"}</div></div><div class="pf"><div class="pf-lbl">Science</div><div class="pf-val">${getBest(cg,"sci")||"—"}</div></div><div class="pf"><div class="pf-lbl">Social Studies</div><div class="pf-val">${getBest(cg,"soc")||"—"}</div></div><div class="pf"><div class="pf-lbl">Electives</div><div class="pf-val" style="font-size:10.5px">${el.map(e=>`${e}${eg[e]?" ("+eg[e]+")":""}`).join(", ")||"—"}</div></div></div></div>${res.q.length?`<div class="section"><div class="sec-hd"><h2>✓ Programmes You Qualify For</h2><span class="cnt">${res.q.length} programmes</span></div>${qHTML}</div>`:""}${res.n.length?`<div class="section"><div class="sec-hd"><h2>Near Miss — Close to Cut-Off</h2><span class="cnt cnt-n">${res.n.length} programmes</span></div>${nHTML}</div>`:""}<div class="footer"><div><div class="brand">UniPredict Ghana</div><div style="font-size:10px;color:#94a3b8;margin-top:1px">Ghana's #1 University Admission Platform</div></div><div class="fi">UniPredictghana@gmail.com<br>WhatsApp: 0537 889 150</div></div></div><div class="pbar"><button class="pbtn" onclick="window.print()">📥 Save as PDF / Print</button><button class="cbtn" onclick="window.close()">Close</button></div></body></html>`;
  w.document.write(html); w.document.close();
}

// ─── CALCULATOR PAGE ─────────────────────────────────────────
function CalculatorPage({ setPage }) {
  const [track, setTrack] = useState("General Science");
  const [cg, setCg] = useState({});
  const agg = (() => {
    const e=cg.eng, m=cg.maths, sc=cg.sci, so=cg.soc;
    const pts=[];
    if(e) pts.push(GP[e]); if(m) pts.push(GP[m]);
    if(sc) pts.push(GP[sc]); if(so) pts.push(GP[so]);
    (TRACKS[track]?.electives||[]).forEach(el=>{if(cg["el_"+el]) pts.push(GP[cg["el_"+el]]);});
    pts.sort((a,b)=>a-b);
    const b6=pts.slice(0,6);
    if(b6.length<6) return null;
    return b6.reduce((s,p)=>s+p,0);
  })();
  const CORES=[{k:"eng",l:"English Language"},{k:"maths",l:"Core Mathematics"},{k:"sci",l:"Integrated Science"},{k:"soc",l:"Social Studies"}];
  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <Tag>Calculator</Tag>
      <h2 className="font-black text-[16px] text-gray-900 mb-1" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Calculate Your Aggregate</h2>
      <p className="text-[11px] text-gray-600 mb-4">Enter your grades — we calculate your best-6 WASSCE aggregate.</p>
      <Card className="p-3 mb-3">
        <label className="block text-[11px] font-bold text-gray-700 mb-1.5">SHS Track</label>
        <select value={track} onChange={e=>setTrack(e.target.value)} className="w-full px-3 py-2 border-2 border-violet-200 rounded-xl text-[11.5px] font-medium text-gray-700 outline-none bg-white cursor-pointer mb-4" style={{WebkitAppearance:"none"}}>
          {Object.keys(TRACKS).map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        {CORES.map(s=>(
          <div key={s.k} className="mb-3">
            <div className="text-[11px] font-bold text-gray-700 mb-1.5">{s.l}</div>
            <GradePicker value={cg[s.k]||""} onChange={v=>setCg(c=>({...c,[s.k]:v}))}/>
          </div>
        ))}
        <div className="text-[11px] font-bold text-gray-600 mb-2">Elective Subjects</div>
        {(TRACKS[track]?.electives||[]).slice(0,6).map(e=>(
          <div key={e} className="mb-3">
            <div className="text-[11px] font-medium text-gray-600 mb-1.5">{e}</div>
            <GradePicker value={cg["el_"+e]||""} onChange={v=>setCg(c=>({...c,["el_"+e]:v}))}/>
          </div>
        ))}
      </Card>
      {agg && (
        <div className="bg-gradient-to-br from-violet-700 to-pink-500 rounded-2xl p-5 text-center mb-3">
          <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1">Your Aggregate</div>
          <div className="font-black text-[60px] text-white leading-none mb-2" style={{fontFamily:"Outfit,Arial,sans-serif"}}>{agg}</div>
          <div className="text-[11.5px] text-white/85">{agg<=6?"Exceptional — qualifies for any programme":agg<=9?"Excellent — Medicine, Law, Engineering":agg<=12?"Very Good — Computer Science, Nursing, Business":agg<=18?"Good — Most university programmes eligible":"Below typical minimum — consider NOVDEC resit"}</div>
        </div>
      )}
      <Btn full size="lg" onClick={() => setPage("checker")}>Get Full Eligibility Report →</Btn>
    </div>
  );
}

// ─── SIMPLE LIST PAGES ───────────────────────────────────────
function UniversitiesPage({ unis, setPage }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const filtered = unis.filter(u => (u.name+u.loc).toLowerCase().includes(q.toLowerCase()) && (!type||u.type===type));
  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <Tag>Universities</Tag>
      <h2 className="font-black text-[16px] text-gray-900 mb-3" style={{fontFamily:"Outfit,Arial,sans-serif"}}>{unis.length||58} Accredited Universities</h2>
      <div className="flex gap-2 mb-3">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search universities..." className="flex-1 px-3 py-2 border-2 border-violet-200 rounded-xl text-[11.5px] outline-none focus:border-violet-1000 bg-white" style={{WebkitAppearance:"none",minWidth:0}}/>
        <select value={type} onChange={e=>setType(e.target.value)} className="px-2 py-2 border-2 border-violet-200 rounded-xl text-[11px] outline-none bg-white cursor-pointer" style={{WebkitAppearance:"none"}}>
          <option value="">All</option><option>Public</option><option>Private</option><option>Technical</option>
        </select>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {filtered.map(u=>(
          <Card key={u.code} className="p-3 flex gap-3 items-center" onClick={()=>setPage("checker")}>
            <div className="w-10 h-10 bg-gradient-to-br from-violet-700 to-pink-500 rounded-xl flex items-center justify-center text-white font-black text-[10px] flex-shrink-0 leading-tight text-center">{u.code.slice(0,5)}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[12px] text-gray-900 leading-tight">{u.name}</div>
              <div className="text-[10.5px] text-gray-600">{u.loc}</div>
            </div>
            <Badge color="violet">{u.type}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProgrammesPage({ progs }) {
  const [q, setQ] = useState("");
  const [uni, setUni] = useState("");
  const uniList = [...new Set(progs.map(p=>p.uni))].sort();
  const filtered = progs.filter(p=>(!uni||p.uni===uni)&&(p.name+p.uni).toLowerCase().includes(q.toLowerCase())).slice(0,100);
  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <Tag>Programmes</Tag>
      <h2 className="font-black text-[16px] text-gray-900 mb-3" style={{fontFamily:"Outfit,Arial,sans-serif"}}>{progs.length||"1,000"}+ Programmes</h2>
      <div className="flex gap-2 mb-3">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search programmes..." className="flex-1 px-3 py-2 border-2 border-violet-200 rounded-xl text-[11.5px] outline-none focus:border-violet-1000 bg-white" style={{WebkitAppearance:"none",minWidth:0}}/>
        <select value={uni} onChange={e=>setUni(e.target.value)} className="px-2 py-2 border-2 border-violet-200 rounded-xl text-[11px] outline-none bg-white cursor-pointer" style={{WebkitAppearance:"none"}}>
          <option value="">All</option>{uniList.map(u=><option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        {filtered.map((p,i)=>(
          <Card key={i} className="p-3">
            <div className="font-bold text-[12px] text-gray-900 mb-1.5">{p.name}</div>
            <div className="flex gap-1.5 flex-wrap">{p.uni&&<Badge color="violet">{p.uni}</Badge>}<Badge color="gray">Cut-off: {p.co}</Badge></div>
            {p.career&&<div className="text-[10.5px] text-gray-600 mt-1.5">{p.career}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}

function CutoffsPage({ progs }) {
  const [q, setQ] = useState("");
  const [uni, setUni] = useState("");
  const uniList = [...new Set(progs.map(p=>p.uni))].sort();
  const filtered = progs.filter(p=>(!uni||p.uni===uni)&&(p.name+p.uni).toLowerCase().includes(q.toLowerCase())).slice(0,120);
  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <Tag>Cut-Off Points</Tag>
      <h2 className="font-black text-[16px] text-gray-900 mb-1" style={{fontFamily:"Outfit,Arial,sans-serif"}}>2025/2026 Cut-Off Aggregates</h2>
      <p className="text-[11px] text-gray-600 mb-3">Always verify with universities before applying.</p>
      <div className="flex gap-2 mb-3">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." className="flex-1 px-3 py-2 border-2 border-violet-200 rounded-xl text-[11.5px] outline-none bg-white" style={{WebkitAppearance:"none",minWidth:0}}/>
        <select value={uni} onChange={e=>setUni(e.target.value)} className="px-2 py-2 border-2 border-violet-200 rounded-xl text-[11px] outline-none bg-white cursor-pointer" style={{WebkitAppearance:"none"}}>
          <option value="">All</option>{uniList.map(u=><option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead><tr className="bg-violet-100">
            <th className="py-2 px-3 text-left font-bold text-gray-600 text-[9.5px] uppercase tracking-wider border-b-2 border-violet-200">Programme</th>
            <th className="py-2 px-3 text-left font-bold text-gray-600 text-[9.5px] uppercase tracking-wider border-b-2 border-violet-200">University</th>
            <th className="py-2 px-3 text-center font-bold text-gray-600 text-[9.5px] uppercase tracking-wider border-b-2 border-violet-200">Cut-Off</th>
          </tr></thead>
          <tbody>{filtered.map((p,i)=>(
            <tr key={i} className="border-b border-violet-100 bg-white">
              <td className="py-2 px-3 font-semibold text-gray-800">{p.name}</td>
              <td className="py-2 px-3 text-gray-600">{p.uni}</td>
              <td className="py-2 px-3 text-center"><Badge color="violet">{p.co}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function ScholarshipsPage({ schols }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <Tag>Scholarships</Tag>
      <h2 className="font-black text-[16px] text-gray-900 mb-1" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Available Scholarships</h2>
      <p className="text-[11px] text-gray-600 mb-4">Funding opportunities for Ghanaian university students</p>
      <div className="space-y-3">
        {schols.map((s,i)=>(
          <Card key={i} className="p-3 border-l-4 border-l-emerald-400">
            <div className="font-bold text-[12.5px] text-gray-900 mb-0.5">{s.name}</div>
            <div className="text-[11px] text-gray-600 mb-2">{s.org}</div>
            <div className="flex gap-1.5 flex-wrap mb-3"><Badge color="green">{s.amount}</Badge><Badge color="amber">{s.deadline}</Badge></div>
            <div className="flex gap-2"><Btn size="sm">Apply Now</Btn><Btn size="sm" variant="ghost">Set Alert</Btn></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FormsPage({ forms }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <Tag>Admission Forms</Tag>
      <h2 className="font-black text-[16px] text-gray-900 mb-1" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Admission Forms Tracker</h2>
      <p className="text-[11px] text-gray-600 mb-4">Track form opening status and deadlines for all universities</p>
      <div className="space-y-2">
        {forms.map((f,i)=>(
          <Card key={i} className="p-3">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="font-bold text-[12px] text-gray-900">{f.uni}</div>
              <Badge color={f.status==="Open"?"green":"gray"}>{f.status}</Badge>
            </div>
            <div className="flex gap-3 text-[10.5px] text-gray-600 mb-2"><span>📅 {f.deadline}</span><span>💰 {f.fee}</span></div>
            {f.status==="Open"?<Btn size="sm">Apply</Btn>:<Btn size="sm" variant="ghost">Set Alert</Btn>}
          </Card>
        ))}
      </div>
    </div>
  );
}

function NewsPage({ news }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <Tag>News</Tag>
      <h2 className="font-black text-[16px] text-gray-900 mb-4" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Latest Updates</h2>
      <div className="space-y-2">
        {news.map((n,i)=>(
          <Card key={i} className={`p-3 flex gap-3 border-l-4 ${n.hot?"border-l-violet-500":"border-l-violet-100"}`}>
            <div className="text-[20px] flex-shrink-0">📰</div>
            <div>
              <div className="font-bold text-[12px] text-gray-900 mb-0.5 leading-tight">{n.t}</div>
              <div className="text-[10.5px] text-gray-600 flex items-center gap-2">{n.date}{n.hot&&<Badge color="violet">Urgent</Badge>}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── AI CHAT ─────────────────────────────────────────────────
function AIChatPage() {
  const [msgs, setMsgs] = useState([{ r:"ai", t:"Hello! I'm UniPredict AI Counsellor. Ask me anything about WASSCE aggregates, university cut-offs, programme eligibility, scholarships, or application strategy across all Ghanaian universities." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);
  const send = async (txt) => {
    const msg = txt || input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMsgs = [...msgs, {r:"user",t:msg},{r:"ai",t:"..."}];
    setMsgs(newMsgs); setLoading(true);
    try {
      const SYSTEM = "You are UniPredict Ghana\'s AI Counsellor. You help Ghanaian SHS students with WASSCE university admissions. You know about: WASSCE aggregate calculation (best 6 from core+electives, lower=better), all 58 Ghanaian universities, KNUST not counting Social Studies, cut-off points, SHS tracks (General Science, General Arts, Business, Home Economics, Visual Arts, Technical, Agricultural Science), scholarships like GETFUND and Mastercard Foundation, and admission form deadlines. Be friendly, concise and helpful. Always respond in plain English suitable for a student.";
      const history = newMsgs.slice(1,-1).map(m=>({role:m.r==="ai"?"model":"user",parts:[{text:m.t}]}));
      const geminiKey = window._geminiKey || "";
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          system_instruction:{parts:[{text:SYSTEM}]},
          contents:[...history,{role:"user",parts:[{text:msg}]}],
          generationConfig:{maxOutputTokens:512,temperature:0.7}
        })
      });
      const d = await r.json();
      const reply = d?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn\'t get a response. Try again.";
      setMsgs(m=>[...m.slice(0,-1),{r:"ai",t:reply}]);
      // Save to Supabase for admin inbox
      fetch(`${SUPA_URL}/rest/v1/ai_inbox`,{method:"POST",headers:{"Content-Type":"application/json",apikey:SUPA_KEY,Authorization:`Bearer ${SUPA_KEY}`,Prefer:"return=minimal"},body:JSON.stringify({question:msg,answer:reply,status:"replied",created_at:new Date().toISOString()})}).catch(()=>{});
    } catch {
      setMsgs(m=>[...m.slice(0,-1),{r:"ai",t:"I'm having trouble connecting. Please try WhatsApp: 0537 889 150",wa:true}]);
    } finally { setLoading(false); }
  };
  return (
    <div className="max-w-lg mx-auto flex flex-col px-4" style={{height:"calc(100vh - 100px)"}}>
      <div className="py-3">
        <Tag>AI Counsellor</Tag>
        <h2 className="font-black text-[15px] text-gray-900" style={{fontFamily:"Outfit,Arial,sans-serif"}}>UniPredict AI Counsellor</h2>
        <p className="text-[10.5px] text-gray-600">Ask anything about university admissions in Ghana</p>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pb-2">
        {msgs.map((m,i)=>(
          <div key={i} className={`max-w-[86%] px-3 py-2 rounded-2xl text-[12px] leading-relaxed ${m.r==="ai"?"self-start bg-white border border-violet-200 text-gray-800 rounded-tl-sm":"self-end bg-gradient-to-br from-violet-700 to-pink-500 text-white rounded-tr-sm"}`}
            style={{alignSelf:m.r==="ai"?"flex-start":"flex-end",display:"block",marginLeft:m.r==="ai"?0:"auto"}}>
            {m.t}
            {m.wa && <a href="https://wa.me/233537889150" target="_blank" rel="noreferrer" className="block mt-2 bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg text-center">Chat on WhatsApp</a>}
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>
      <div className="flex flex-wrap gap-1.5 py-2">
        {["What is my aggregate?","KNUST cut-offs 2025","Available scholarships","Best science programmes"].map(s=>(
          <button key={s} onClick={()=>send(s)} className="px-2.5 py-1 border border-violet-200 rounded-full text-[10.5px] font-medium text-violet-700 bg-white cursor-pointer active:bg-violet-100 select-none outline-none">{s}</button>
        ))}
      </div>
      <div className="flex gap-2 pb-3 border-t border-violet-200 pt-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about programmes, cut-offs, scholarships..." className="flex-1 px-3 py-2 border-2 border-violet-200 rounded-xl text-[12px] outline-none focus:border-violet-1000 bg-white" style={{WebkitAppearance:"none",minWidth:0}}/>
        <Btn size="md" disabled={loading||!input.trim()} onClick={()=>send()}>Send →</Btn>
      </div>
    </div>
  );
}

// ─── PRICING PAGE ────────────────────────────────────────────
function PricingPage({ setPage }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <div className="text-center mb-5">
        <Tag>Pricing</Tag>
        <h2 className="font-black text-[18px] text-gray-900 mb-1" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Simple, Affordable Pricing</h2>
        <p className="text-[11.5px] text-gray-600">No subscription. No hidden fees. Pay only when you need a check.</p>
      </div>
      <div className="space-y-3 mb-4">
        {[
          {id:"basic",icon:"🏛️",name:"Basic",price:PRICES.basic,sub:"1 University · 1 Check",features:["1 university eligibility check","Full subject verification","Career paths per programme"],pop:false},
          {id:"premium",icon:"⭐",name:"Premium",price:PRICES.premium,sub:"All Universities · 3 Checks",features:["All 58 universities checked","3 full checks","Scholarship matches","Career paths & prospects"],pop:true},
          {id:"bundle",icon:"🔥",name:"Bundle",price:PRICES.bundle,sub:"All Universities · 5 Checks",features:["5 full premium checks","Best value option","Share with friends or family"],pop:false},
        ].map(p=>(
          <Card key={p.id} className={`p-4 relative ${p.pop?"border-2 border-violet-1000 shadow-md":""}`}>
            {p.pop&&<div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-700 to-pink-500 text-white text-[9.5px] font-black px-3 py-0.5 rounded-full whitespace-nowrap">MOST POPULAR</div>}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[24px] mb-1">{p.icon}</div>
                <div className="font-black text-[22px] text-violet-700 leading-none mb-0.5" style={{fontFamily:"Outfit,Arial,sans-serif"}}>GHC{p.price}</div>
                <div className="font-bold text-[13px] text-gray-900">{p.name}</div>
                <div className="text-[11px] text-gray-600">{p.sub}</div>
              </div>
            </div>
            <div className="space-y-1.5 mb-3">
              {p.features.map(f=><div key={f} className="flex items-center gap-2 text-[11.5px] text-gray-600"><span className="text-emerald-500 font-bold">✓</span>{f}</div>)}
            </div>
            <Btn full variant={p.pop?"primary":"outline"} onClick={()=>setPage("checker")}>{p.pop?"Get Started →":"Choose Plan"}</Btn>
          </Card>
        ))}
      </div>
      <Card className="p-3 text-center">
        <div className="font-bold text-[12px] text-gray-800 mb-1">💳 Accepted Payment Methods</div>
        <div className="text-[11px] text-gray-600">📱 MTN MoMo · 📲 Vodafone Cash · 📳 AirtelTigo · 💳 Visa / Mastercard</div>
      </Card>
    </div>
  );
}

// ─── ABOUT PAGE ──────────────────────────────────────────────
function AboutPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <Tag>About</Tag>
      <h2 className="font-black text-[16px] text-gray-900 mb-3" style={{fontFamily:"Outfit,Arial,sans-serif"}}>About UniPredict Ghana</h2>
      <Card className="p-4 mb-3">
        <div className="font-bold text-[13px] text-gray-900 mb-2">Our Mission</div>
        <p className="text-[11.5px] text-gray-700 leading-relaxed mb-2">UniPredict Ghana is Ghana's most comprehensive university admission intelligence platform. We help WASSCE students make informed decisions about their applications through accurate eligibility checks, verified cut-off points, and personalised programme recommendations.</p>
        <p className="text-[11.5px] text-gray-700 leading-relaxed">We cover all 58 accredited Ghanaian universities with over 1,000+ programmes, using the official WASSCE aggregate formula to give precise, programme-specific eligibility results.</p>
      </Card>
      <div className="font-bold text-[13px] text-gray-900 mb-1">Meet the Team</div>
      <p className="text-[11px] text-gray-600 mb-3">Built by young Ghanaians, for Ghanaian students.</p>
      {[
        {name:"Alexander Piasa Asiamah",role:"Founder & CEO · CTO",bio:"Visionary behind UniPredict Ghana. Built the platform from the ground up to make university admissions transparent and accessible for every Ghanaian student.",img:"https://i.imgur.com/6dQfNZr.jpeg",linkedin:"https://www.linkedin.com/in/alexander-piasa-asiamah-557265387"},
        {name:"Gideon Appianing",role:"Co-CTO",bio:"Co-Chief Technology Officer at UniPredict Ghana. Brings deep technical expertise to ensure the platform is robust, fast, and reliable for thousands of students.",img:"https://i.imgur.com/0zoQrig.jpeg",linkedin:"https://www.linkedin.com/in/gideon-appianing"},
      ].map(t=>(
        <Card key={t.name} className="p-3 flex gap-3 mb-3">
          <img src={t.img} alt={t.name} className="w-16 h-16 rounded-full object-cover border-2 border-violet-200 flex-shrink-0" onError={e=>e.target.style.display="none"}/>
          <div className="flex-1">
            <div className="font-black text-[12.5px] text-gray-900 mb-1">{t.name}</div>
            <div className="mb-1.5"><Badge color="violet">{t.role}</Badge></div>
            <p className="text-[11px] text-gray-600 leading-relaxed mb-2">{t.bio}</p>
            <a href={t.linkedin} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:4,background:"#0077b5",color:"#fff",borderRadius:8,padding:"4px 10px",fontSize:10,fontWeight:700,textDecoration:"none"}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
          </div>
        </Card>
      ))}
      <div className="bg-gradient-to-r from-violet-700 to-pink-500 rounded-2xl p-4">
        <div className="font-bold text-[13px] text-white mb-1">🇬🇭 Made in Ghana</div>
        <p className="text-[11.5px] text-white/85 leading-relaxed">Built by Ghanaians for Ghanaian students. We understand the challenges of university admissions in Ghana and are committed to making the process clearer and fairer for every student.</p>
      </div>
    </div>
  );
}

// ─── CONTACT PAGE ────────────────────────────────────────────
function ContactPage() {
  const [name,setName]=useState(""),[msg,setMsg]=useState(""),[sent,setSent]=useState(false);
  const submit=()=>{ if(!name||!msg) return; setSent(true); };
  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <Tag>Contact</Tag>
      <h2 className="font-black text-[16px] text-gray-900 mb-4" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Contact Us</h2>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[{e:"📧",t:"Email",v:"UniPredictghana@gmail.com"},{e:"📱",t:"WhatsApp",v:"0537 889 150"},{e:"🕐",t:"Response",v:"Within 24hrs"}].map(c=>(
          <Card key={c.t} className="p-3 text-center">
            <div className="text-[22px] mb-1.5">{c.e}</div>
            <div className="font-bold text-[10.5px] text-gray-800 mb-0.5">{c.t}</div>
            <div className="text-[10px] text-gray-600 leading-tight">{c.v}</div>
          </Card>
        ))}
      </div>
      {sent ? (
        <Card className="p-4 text-center">
          <div className="text-[36px] mb-2">✅</div>
          <div className="font-bold text-[13px] text-emerald-600 mb-1">Message Sent!</div>
          <p className="text-[11.5px] text-gray-600">We'll respond within 24 hours. You can also WhatsApp us directly on 0537 889 150.</p>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="font-bold text-[13px] text-gray-900 mb-3">Send a Message</div>
          <div className="mb-2.5"><label className="block text-[11px] font-bold text-gray-600 mb-1">Your Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Kofi Mensah" className="w-full px-3 py-2 border-2 border-violet-200 rounded-xl text-[12px] outline-none focus:border-violet-1000 bg-white" style={{WebkitAppearance:"none"}}/></div>
          <div className="mb-3"><label className="block text-[11px] font-bold text-gray-600 mb-1">Message</label><textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="How can we help you?" rows={4} className="w-full px-3 py-2 border-2 border-violet-200 rounded-xl text-[12px] outline-none focus:border-violet-1000 bg-white resize-none" style={{WebkitAppearance:"none"}}/></div>
          <Btn full size="lg" disabled={!name||!msg} onClick={submit}>Send Message →</Btn>
        </Card>
      )}
    </div>
  );
}

// ─── FAQ PAGE ────────────────────────────────────────────────
function FAQPage() {
  const [open,setOpen]=useState(null);
  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <Tag>FAQ</Tag>
      <h2 className="font-black text-[16px] text-gray-900 mb-4" style={{fontFamily:"Outfit,Arial,sans-serif"}}>Frequently Asked Questions</h2>
      <div className="space-y-2">
        {FAQS.map((f,i)=>(
          <Card key={i} className="overflow-hidden">
            <button onClick={()=>setOpen(open===i?null:i)} className="w-full flex items-center justify-between gap-3 p-3 text-left cursor-pointer select-none outline-none bg-transparent border-0">
              <div className="font-bold text-[12px] text-gray-900 leading-snug flex-1">{f.q}</div>
              <div className="text-violet-700 font-bold text-[16px] flex-shrink-0">{open===i?"−":"+"}</div>
            </button>
            {open===i && <div className="px-3 pb-3 text-[11.5px] text-gray-700 leading-relaxed border-t border-violet-100 pt-2">{f.a}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── LEGAL MODAL ─────────────────────────────────────────────
function LegalModal({ doc, onClose }) {
  if (!doc) return null;
  const data = LEGAL[doc];
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center">
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-violet-200 px-4 py-3 flex items-center justify-between z-10">
          <div className="font-black text-[14px] text-gray-900" style={{fontFamily:"Outfit,Arial,sans-serif"}}>{data.title}</div>
          <button onClick={onClose} className="text-gray-600 text-[20px] cursor-pointer active:opacity-85 select-none outline-none border-0 bg-transparent">✕</button>
        </div>
        <div className="px-4 py-5 pb-12 space-y-4">
          <p className="text-[10.5px] text-gray-600">Last updated: August 2025</p>
          {data.content.map((s,i)=>(
            <div key={i}>
              <div className="font-bold text-[12.5px] text-gray-900 mb-1">{s.h}</div>
              <p className="text-[11.5px] text-gray-700 leading-relaxed">{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────
function Footer({ setPage, setLegal }) {
  return (
    <footer className="bg-gray-900 px-4 pt-10 pb-6 mt-4">
      <div className="max-w-lg mx-auto">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3 cursor-pointer" onClick={()=>setPage("home")}>
              <div className="w-6 h-6 bg-gradient-to-br from-violet-700 to-pink-500 rounded-lg flex items-center justify-center text-[14px]">🎓</div>
              <span className="font-black text-[13px] text-white">UniPredict Ghana</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed mb-3">Ghana's university admission intelligence platform. 58+ institutions, 1,000+ programmes.</p>
            <div className="inline-flex items-center gap-1.5 bg-emerald-900/50 border border-emerald-700 rounded-full px-2.5 py-1 text-[10px] font-bold text-emerald-400">● Live 2026</div>
            <div className="text-[11px] text-gray-700 mt-2">🇬🇭 Made in Ghana</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[9.5px] font-extrabold text-gray-600 uppercase tracking-wider mb-2">Resources</div>
              {[["checker","Check Eligibility"],["calculator","Calculator"],["universities","Universities"],["cutoffs","Cut-Offs"],["scholarships","Scholarships"]].map(([id,l])=>(
                <button key={id} onClick={()=>setPage(id)} className="block text-[11px] text-gray-600 py-0.5 cursor-pointer hover:text-white active:opacity-85 select-none outline-none border-0 bg-transparent text-left">{l}</button>
              ))}
            </div>
            <div>
              <div className="text-[9.5px] font-extrabold text-gray-600 uppercase tracking-wider mb-2">Company</div>
              {[["about","About Us"],["contact","Contact"],["faq","FAQ"],["pricing","Pricing"],["news","News"]].map(([id,l])=>(
                <button key={id} onClick={()=>setPage(id)} className="block text-[11px] text-gray-600 py-0.5 cursor-pointer hover:text-white active:opacity-85 select-none outline-none border-0 bg-transparent text-left">{l}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <div className="text-[9.5px] font-extrabold text-gray-600 uppercase tracking-wider mb-2">Legal</div>
          <div className="flex flex-wrap gap-3 mb-4">
            {["privacy","terms","disclaimer","refund"].map(k=>(
              <button key={k} onClick={()=>setLegal(k)} className="text-[11px] text-gray-600 cursor-pointer hover:text-white active:opacity-85 select-none outline-none border-0 bg-transparent capitalize">
                {k==="refund"?"Refund Policy":k==="privacy"?"Privacy Policy":k==="terms"?"Terms of Service":"Disclaimer"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[10.5px] text-gray-700">© 2025 UniPredict Ghana. All rights reserved.</div>
            <div className="flex gap-3">
              {["about","contact"].map(id=>(
                <button key={id} onClick={()=>setPage(id)} className="text-[10.5px] text-gray-700 underline cursor-pointer capitalize select-none outline-none border-0 bg-transparent">{id}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── STICKY BAR ──────────────────────────────────────────────
function StickyBar({ setPage }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/97 backdrop-blur border-t border-violet-200 px-3 py-2 flex gap-2">
      <Btn full size="sm" onClick={()=>setPage("checker")} style={{flex:1,padding:"10px 6px",fontSize:"11px"}}>🔍 Check Eligibility</Btn>
      <Btn variant="ghost" size="sm" onClick={()=>setPage("aiChat")} style={{flex:1,padding:"10px 6px",fontSize:"10.5px"}}>🤖 AI Counsellor</Btn>
      <Btn variant="ghost" size="sm" onClick={()=>setPage("pricing")} style={{flex:1,padding:"10px 6px",fontSize:"10.5px"}}>💳 Pricing</Btn>
    </div>
  );
}

// ─── ROOT APP ────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [unis, setUnis] = useState([]);
  const [progs, setProgs] = useState([]);
  const [schols, setSchols] = useState([]);
  const [forms, setForms] = useState([]);
  const [news, setNews] = useState([]);
  const [paystackKey, setPaystackKey] = useState("");
  const [legal, setLegal] = useState(null);

  const nav = (id) => { setPage(id); window.scrollTo(0,0); };

  useEffect(() => {
    const base = `${SUPA_URL}/rest/v1/`;
    // Load Paystack key
    fetch(`${base}settings?key=in.(payment_keys,gemini_key,appearance)&select=key,value`,{headers:SUPA_H}).then(r=>r.json()).then(d=>{
      d?.forEach(row=>{
        if(row.key==="payment_keys"&&row.value?.paystack) setPaystackKey(row.value.paystack);
        if(row.key==="gemini_key"&&row.value?.key) window._geminiKey=row.value.key;
        if(row.key==="appearance"&&row.value){
          const a=row.value;
          if(a.font_size) document.documentElement.style.fontSize=a.font_size+"%";
          if(a.font_family){
            const lk=document.createElement("link");lk.rel="stylesheet";
            lk.href=`https://fonts.googleapis.com/css2?family=${a.font_family.replace(/ /g,"+")}:wght@400;500;600;700;800;900&display=swap`;
            document.head.appendChild(lk);
            document.documentElement.style.fontFamily=`'${a.font_family}',sans-serif`;
          }
          if(a.heading_font){
            const lk2=document.createElement("link");lk2.rel="stylesheet";
            lk2.href=`https://fonts.googleapis.com/css2?family=${a.heading_font.replace(/ /g,"+")}:wght@700;800;900&display=swap`;
            document.head.appendChild(lk2);
            document.documentElement.style.setProperty("--font-heading",`'${a.heading_font}',sans-serif`);
          }
        }
      });
    }).catch(()=>{});
    // Load universities
    fetch(`${base}universities?active=eq.true&order=name.asc&select=id,code,name,location,type&limit=1000`,{headers:SUPA_H}).then(r=>r.json()).then(d=>{
      if(d?.length) setUnis(d.map(u=>({code:u.code,name:u.name,loc:u.location||"",type:u.type||"Public"})));
    }).catch(()=>{});
    // Load programmes — parallel batches for 2500+
    fetch(`${base}universities?active=eq.true&select=id,code&limit=1000`,{headers:SUPA_H}).then(r=>r.json()).then(uList=>{
      const umap={}; (uList||[]).forEach(u=>{umap[u.id]=u.code;});
      const mapProg = p => ({name:p.name,uni:umap[p.university_id]||"?",co:p.cutoff||36,track:Array.isArray(p.required_track)?p.required_track:(p.required_track?[p.required_track]:[]),career:p.careers||"",degree:p.degree_type||""});
      const progUrl = off => `${base}programmes?active=eq.true&order=name.asc&select=id,name,university_id,cutoff,required_track,careers,degree_type&offset=${off}&limit=1000`;
      fetch(progUrl(0),{headers:SUPA_H}).then(r=>r.json()).then(first=>{
        if(!first?.length) return;
        const allProgs = first.map(mapProg);
        setProgs([...allProgs]);
        if(first.length===1000) {
          Promise.all([fetch(progUrl(1000),{headers:SUPA_H}).then(r=>r.json()),fetch(progUrl(2000),{headers:SUPA_H}).then(r=>r.json()),fetch(progUrl(3000),{headers:SUPA_H}).then(r=>r.json())]).then(batches=>{
            const all = [...allProgs];
            batches.forEach(b=>{ if(b?.length) b.forEach(p=>all.push(mapProg(p))); });
            const seen={}; const deduped=all.filter(p=>{const k=p.name+"|"+p.uni;if(seen[k])return false;seen[k]=true;return true;});
            setProgs(deduped);
          }).catch(()=>{});
        }
      }).catch(()=>{});
    }).catch(()=>{});
    // Load SHS electives dynamically from Supabase and merge into TRACKS
    fetch(`${base}shs_programmes?select=id,name&limit=20`,{headers:SUPA_H}).then(r=>r.json()).then(programmes=>{
      if(!programmes?.length) return;
      // For each programme, fetch its electives
      Promise.all(programmes.map(prog =>
        fetch(`${base}shs_programme_electives?programme_id=eq.${prog.id}&select=subject_id,shs_elective_subjects(name)&limit=100`,{headers:SUPA_H})
          .then(r=>r.json())
          .then(links => ({
            track: prog.name,
            electives: (links||[]).map(l=>l.shs_elective_subjects?.name).filter(Boolean)
          }))
      )).then(results => {
        results.forEach(({track, electives}) => {
          if(TRACKS[track] && electives.length > 0) {
            TRACKS[track].electives = electives;
          }
        });
      }).catch(()=>{});
    }).catch(()=>{});

    // Load scholarships
    fetch(`${base}scholarships?order=name.asc&select=*&limit=500`,{headers:SUPA_H}).then(r=>r.json()).then(d=>{
      if(d?.length) setSchols(d.map(s=>({name:s.name,org:s.organization||"",amount:s.amount||"",deadline:s.deadline||""})));
    }).catch(()=>{});
    // Load news
    fetch(`${base}news?published=eq.true&order=created_at.desc&select=*&limit=20`,{headers:SUPA_H}).then(r=>r.json()).then(d=>{
      if(d?.length) setNews(d.map(n=>({t:n.title,hot:n.urgent||false,date:n.created_at?new Date(n.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short"}):"Recent"})));
    }).catch(()=>{});
    // Load admission forms
    fetch(`${base}admission_forms?order=updated_at.desc&select=*,universities(name)&limit=50`,{headers:SUPA_H}).then(r=>r.json()).then(d=>{
      if(d?.length) setForms(d.map(f=>({uni:f.universities?.name||"?",status:f.status==="open"?"Open":"Coming Soon",deadline:f.deadline||"TBD",fee:f.fee||"TBD"})));
    }).catch(()=>{});
    // Track visitor
    fetch(`${base}visitors`,{method:"POST",headers:{...SUPA_H,"Content-Type":"application/json"},body:JSON.stringify({page:window.location.pathname,referrer:document.referrer||"",ua:navigator.userAgent.slice(0,120)})}).catch(()=>{});
  },[]);

  const showSticky = !["checker","calculator","aiChat"].includes(page);
  const pages = {
    home: <HomePage setPage={nav} unis={unis} progs={progs}/>,
    checker: <CheckerPage unis={unis} progs={progs} schols={schols} paystackKey={paystackKey}/>,
    calculator: <CalculatorPage setPage={nav}/>,
    universities: <UniversitiesPage unis={unis} setPage={nav}/>,
    programs: <ProgrammesPage progs={progs}/>,
    cutoffs: <CutoffsPage progs={progs}/>,
    scholarships: <ScholarshipsPage schols={schols}/>,
    forms: <FormsPage forms={forms}/>,
    news: <NewsPage news={news}/>,
    aiChat: <AIChatPage/>,
    pricing: <PricingPage setPage={nav}/>,
    about: <AboutPage/>,
    contact: <ContactPage/>,
    faq: <FAQPage/>,
  };

  return (
    <div className="min-h-screen bg-violet-100" style={{fontFamily:"Inter,Arial,sans-serif",fontSize:"13px",WebkitTextSizeAdjust:"100%",textSizeAdjust:"100%"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@700;800;900&display=swap');
        *{box-sizing:border-box;-webkit-tap-highlight-color:rgba(0,0,0,0)}
        html,body{overflow-x:hidden;max-width:100vw;margin:0;padding:0}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        input,select,textarea,button{font-family:Inter,Arial,sans-serif;-webkit-appearance:none;appearance:none}
        button{touch-action:manipulation;cursor:pointer;user-select:none;border:none;background:none;padding:0}
        input:focus,select:focus,textarea:focus{outline:none}
        ${showSticky ? "body{padding-bottom:56px}" : ""}
      `}</style>
      <Nav page={page} setPage={nav}/>
      <main>{pages[page] || pages.home}</main>
      <Footer setPage={nav} setLegal={setLegal}/>
      {showSticky && <StickyBar setPage={nav}/>}
      {legal && <LegalModal doc={legal} onClose={()=>setLegal(null)}/>}
    </div>
  );
}
