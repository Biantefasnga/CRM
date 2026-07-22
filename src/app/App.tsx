import { useState, useMemo } from "react";
import { DataProvider, useData } from "./lib/dataContext";
import {
  Users, BarChart2, Activity, Search, Bell, Plus, MoreHorizontal,
  Phone, Mail, Building2, X, Target, Clock, ChevronRight,
  ArrowUpRight, ArrowDownRight, Filter, Star, CheckCircle2,
  AlertCircle, XCircle, Circle, Layers, LogOut, Settings,
  ChevronDown, Paperclip, FileText, FlaskConical, Beaker,
  Droplets, Microscope, TestTube, AlertTriangle, ClipboardList,
  Download, Send, Eye, Edit3, Trash2, ChevronUp,
} from "lucide-react";

// ─── Domain Constants ─────────────────────────────────────────────────────────

const TEST_CATEGORIES = [
  "Water Quality / Environmental",
  "Medical & Biological",
  "Materials & Chemical",
  "Microbiology",
  "Other",
] as const;

const STANDARDS_BY_FAMILY: Record<string, string[]> = {
  ISO: ["ISO 17025", "ISO 9001", "ISO 6222", "ISO 7899-2", "ISO 14001"],
  EPA: ["EPA 200.7", "EPA 300.1", "EPA 8270D", "EPA 9060A", "EPA 180.1"],
  USP: ["USP <232>", "USP <233>", "USP <788>", "USP <1231>", "USP <61>"],
  GB: ["GB 5750", "GB 6920", "GB 11914", "GB 8978"],
  EN: ["EN 1484", "EN 27888", "EN ISO 7027", "EN 872"],
};

const PIPELINE_STAGES = [
  "Prospect", "Qualified", "Quotation Sent", "Negotiation", "Closed Won", "Closed Lost",
] as const;

const QUOTATION_STATUSES = ["Draft", "Sent", "Under Review", "Approved", "Rejected", "Expired"] as const;

const SAMPLE_STATUSES = ["Received", "In Progress", "On Track", "At Risk", "Overdue", "Completed"] as const;

// ─── Mock Data ────────────────────────────────────────────────────────────────

const USERS = [
  { id: "u1", name: "Rini Kusuma", role: "Sales", email: "rini@labveri.co.id" },
  { id: "u2", name: "Bagas Wijaya", role: "Sales", email: "bagas@labveri.co.id" },
  { id: "u3", name: "Dr. Sari Putri", role: "Lab Analyst", email: "sari@labveri.co.id" },
  { id: "u4", name: "Ahmad Fauzi", role: "Lab Analyst", email: "ahmad@labveri.co.id" },
];

const CLIENTS = [
  {
    id: "c1", name: "PT Tirta Nusantara", industry: "Water Utility",
    testCategories: ["Water Quality / Environmental"],
    standards: ["ISO 17025", "EPA 300.1", "GB 5750"],
    status: "Active", owner: "u1", dealValue: 285_000_000, lastContact: "2026-07-20",
    contacts: [
      { name: "Dewi Maharani", email: "dewi@tirta.co.id", phone: "+62 21 5500 1122", position: "Lab Manager", primary: true },
      { name: "Hendra Santoso", email: "hendra@tirta.co.id", phone: "+62 21 5500 1123", position: "Procurement", primary: false },
    ],
  },
  {
    id: "c2", name: "RS Medika Sentosa", industry: "Healthcare",
    testCategories: ["Medical & Biological", "Microbiology"],
    standards: ["USP <232>", "USP <788>", "ISO 17025"],
    status: "Active", owner: "u2", dealValue: 412_500_000, lastContact: "2026-07-19",
    contacts: [
      { name: "dr. Fikri Hamdan", email: "fikri@rsmedikasentosa.id", phone: "+62 31 7788 9900", position: "Chief Medical Officer", primary: true },
    ],
  },
  {
    id: "c3", name: "PT Petrokimia Gresik", industry: "Petrochemical",
    testCategories: ["Materials & Chemical", "Water Quality / Environmental"],
    standards: ["ISO 17025", "EPA 200.7", "EPA 8270D"],
    status: "Active", owner: "u1", dealValue: 630_000_000, lastContact: "2026-07-15",
    contacts: [
      { name: "Ir. Wahyu Prasetyo", email: "wahyu@petrogresik.co.id", phone: "+62 31 3982 5500", position: "QA Director", primary: true },
      { name: "Ratna Dewi", email: "ratna@petrogresik.co.id", phone: "+62 31 3982 5501", position: "Env. Compliance", primary: false },
    ],
  },
  {
    id: "c4", name: "BPOM Regional Surabaya", industry: "Regulatory",
    testCategories: ["Medical & Biological", "Microbiology", "Materials & Chemical"],
    standards: ["USP <61>", "USP <1231>", "ISO 17025", "EN 872"],
    status: "Prospect", owner: "u2", dealValue: 175_000_000, lastContact: "2026-07-18",
    contacts: [
      { name: "Apt. Nur Fadilah", email: "nurfadilah@bpom.go.id", phone: "+62 31 5046 3311", position: "Senior Inspector", primary: true },
    ],
  },
  {
    id: "c5", name: "PT Holcim Indonesia", industry: "Construction Materials",
    testCategories: ["Materials & Chemical"],
    standards: ["ISO 17025", "EN 872", "GB 11914"],
    status: "Active", owner: "u1", dealValue: 198_000_000, lastContact: "2026-07-10",
    contacts: [
      { name: "Surya Adiputra", email: "surya@holcim.co.id", phone: "+62 21 8899 2200", position: "QC Manager", primary: true },
    ],
  },
  {
    id: "c6", name: "PT Pertamina EP", industry: "Oil & Gas",
    testCategories: ["Water Quality / Environmental", "Materials & Chemical"],
    standards: ["EPA 200.7", "EPA 9060A", "ISO 17025"],
    status: "At Risk", owner: "u2", dealValue: 520_000_000, lastContact: "2026-06-20",
    contacts: [
      { name: "Fajar Kurniawan", email: "fajar.k@pertamina.com", phone: "+62 21 3815 0011", position: "HSE Coordinator", primary: true },
    ],
  },
  {
    id: "c7", name: "PT Nestle Indonesia", industry: "Food & Beverage",
    testCategories: ["Microbiology", "Water Quality / Environmental"],
    standards: ["USP <61>", "ISO 6222", "ISO 17025"],
    status: "Active", owner: "u1", dealValue: 344_000_000, lastContact: "2026-07-21",
    contacts: [
      { name: "Cindy Halim", email: "c.halim@nestle.co.id", phone: "+62 21 5229 9988", position: "Food Safety Manager", primary: true },
    ],
  },
  {
    id: "c8", name: "Balai Riset Kelautan", industry: "Marine Research",
    testCategories: ["Water Quality / Environmental", "Microbiology"],
    standards: ["ISO 17025", "EPA 180.1", "EPA 300.1"],
    status: "Churned", owner: "u2", dealValue: 0, lastContact: "2026-04-30",
    contacts: [
      { name: "Dr. Laila Amini", email: "laila@brkp.go.id", phone: "+62 251 822 5500", position: "Research Director", primary: true },
    ],
  },
];

const DEALS = [
  { id: "d1", clientId: "c3", client: "PT Petrokimia Gresik", title: "Annual Soil & Water ENV Package", value: 420_000_000, stage: "Negotiation", probability: 75, dueDate: "2026-08-15", owner: "u1", quotationId: "q2" },
  { id: "d2", clientId: "c2", client: "RS Medika Sentosa", title: "Q3 Sterility Testing Contract", value: 180_000_000, stage: "Quotation Sent", probability: 55, dueDate: "2026-08-30", owner: "u2", quotationId: "q3" },
  { id: "d3", clientId: "c4", client: "BPOM Regional Surabaya", title: "Pharmaceutical Raw Material Panel", value: 175_000_000, stage: "Qualified", probability: 40, dueDate: "2026-09-15", owner: "u2", quotationId: null },
  { id: "d4", clientId: "c6", client: "PT Pertamina EP", title: "Produced Water Testing Retainer", value: 520_000_000, stage: "Prospect", probability: 20, dueDate: "2026-10-01", owner: "u2", quotationId: null },
  { id: "d5", clientId: "c1", client: "PT Tirta Nusantara", title: "Drinking Water Full Panel 2026", value: 285_000_000, stage: "Closed Won", probability: 100, dueDate: "2026-07-01", owner: "u1", quotationId: "q1" },
  { id: "d6", clientId: "c5", client: "PT Holcim Indonesia", title: "Cement Composition Materials Suite", value: 198_000_000, stage: "Closed Won", probability: 100, dueDate: "2026-06-15", owner: "u1", quotationId: "q4" },
  { id: "d7", clientId: "c7", client: "PT Nestle Indonesia", title: "Microbiological Safety Panel", value: 344_000_000, stage: "Quotation Sent", probability: 60, dueDate: "2026-08-20", owner: "u1", quotationId: "q5" },
  { id: "d8", clientId: "c8", client: "Balai Riset Kelautan", title: "Marine Water Monitoring", value: 95_000_000, stage: "Closed Lost", probability: 0, dueDate: "2026-05-01", owner: "u2", quotationId: null },
];

const QUOTATIONS = [
  {
    id: "q1", number: "QUO-2026-0041", clientId: "c1", client: "PT Tirta Nusantara",
    status: "Approved", currency: "IDR", subtotal: 259_090_909, taxRate: 11,
    total: 285_000_000, validUntil: "2026-07-31", sentAt: "2026-06-10", approvedAt: "2026-06-20",
    items: [
      { test: "Total Dissolved Solids", category: "Water Quality / Environmental", method: "EPA 180.1", matrix: "Drinking Water", price: 450_000, qty: 24, tat: 3 },
      { test: "Nitrate / Nitrite Panel", category: "Water Quality / Environmental", method: "EPA 300.1", matrix: "Drinking Water", price: 680_000, qty: 24, tat: 5 },
      { test: "Heavy Metals (Pb, Cd, Hg)", category: "Water Quality / Environmental", method: "EPA 200.7", matrix: "Drinking Water", price: 1_450_000, qty: 24, tat: 7 },
    ],
  },
  {
    id: "q2", number: "QUO-2026-0055", clientId: "c3", client: "PT Petrokimia Gresik",
    status: "Under Review", currency: "IDR", subtotal: 378_378_378, taxRate: 11,
    total: 420_000_000, validUntil: "2026-08-31", sentAt: "2026-07-05", approvedAt: null,
    items: [
      { test: "Total Petroleum Hydrocarbons", category: "Materials & Chemical", method: "EPA 8270D", matrix: "Soil", price: 2_100_000, qty: 60, tat: 10 },
      { test: "Wastewater COD", category: "Water Quality / Environmental", method: "EPA 9060A", matrix: "Industrial Effluent", price: 350_000, qty: 48, tat: 2 },
    ],
  },
  {
    id: "q3", number: "QUO-2026-0058", clientId: "c2", client: "RS Medika Sentosa",
    status: "Sent", currency: "IDR", subtotal: 162_162_162, taxRate: 11,
    total: 180_000_000, validUntil: "2026-08-15", sentAt: "2026-07-15", approvedAt: null,
    items: [
      { test: "Sterility Testing (USP)", category: "Medical & Biological", method: "USP <1231>", matrix: "Injectable", price: 3_200_000, qty: 30, tat: 14 },
      { test: "Endotoxin LAL Test", category: "Medical & Biological", method: "USP <85>", matrix: "Injectable", price: 2_100_000, qty: 18, tat: 3 },
    ],
  },
  {
    id: "q4", number: "QUO-2026-0039", clientId: "c5", client: "PT Holcim Indonesia",
    status: "Approved", currency: "IDR", subtotal: 178_378_378, taxRate: 11,
    total: 198_000_000, validUntil: "2026-06-30", sentAt: "2026-05-20", approvedAt: "2026-06-01",
    items: [
      { test: "Cement Chemical Composition", category: "Materials & Chemical", method: "EN 872", matrix: "Portland Cement", price: 1_850_000, qty: 48, tat: 7 },
      { test: "Particle Size Distribution", category: "Materials & Chemical", method: "ISO 13320", matrix: "Clinker", price: 980_000, qty: 36, tat: 3 },
    ],
  },
  {
    id: "q5", number: "QUO-2026-0061", clientId: "c7", client: "PT Nestle Indonesia",
    status: "Sent", currency: "IDR", subtotal: 309_909_909, taxRate: 11,
    total: 344_000_000, validUntil: "2026-09-01", sentAt: "2026-07-18", approvedAt: null,
    items: [
      { test: "Total Plate Count", category: "Microbiology", method: "USP <61>", matrix: "Process Water", price: 520_000, qty: 120, tat: 5 },
      { test: "E. coli / Coliform", category: "Microbiology", method: "ISO 6222", matrix: "Process Water", price: 680_000, qty: 120, tat: 5 },
      { test: "Yeast & Mold", category: "Microbiology", method: "USP <61>", matrix: "Product Sample", price: 750_000, qty: 60, tat: 5 },
    ],
  },
];

const today = new Date("2026-07-22");
const daysDiff = (target: string) => Math.ceil((new Date(target).getTime() - today.getTime()) / 86_400_000);

const SAMPLES = [
  { id: "s1", code: "SMP-2026-0301", clientId: "c1", client: "PT Tirta Nusantara", quotationId: "q1", category: "Water Quality / Environmental", received: "2026-07-10", target: "2026-07-24", actual: null, analyst: "u3", tests: [
    { name: "Total Dissolved Solids", method: "EPA 180.1", targetDays: 3, received: "2026-07-10" },
    { name: "Nitrate / Nitrite Panel", method: "EPA 300.1", targetDays: 5, received: "2026-07-10" },
  ]},
  { id: "s2", code: "SMP-2026-0302", clientId: "c1", client: "PT Tirta Nusantara", quotationId: "q1", category: "Water Quality / Environmental", received: "2026-07-10", target: "2026-07-21", actual: null, analyst: "u4", tests: [
    { name: "Heavy Metals (Pb, Cd, Hg)", method: "EPA 200.7", targetDays: 7, received: "2026-07-10" },
  ]},
  { id: "s3", code: "SMP-2026-0308", clientId: "c3", client: "PT Petrokimia Gresik", quotationId: "q2", category: "Materials & Chemical", received: "2026-07-12", target: "2026-07-28", actual: null, analyst: "u3", tests: [
    { name: "Total Petroleum Hydrocarbons", method: "EPA 8270D", targetDays: 10, received: "2026-07-12" },
    { name: "Wastewater COD", method: "EPA 9060A", targetDays: 2, received: "2026-07-15" },
  ]},
  { id: "s4", code: "SMP-2026-0315", clientId: "c5", client: "PT Holcim Indonesia", quotationId: "q4", category: "Materials & Chemical", received: "2026-07-08", target: "2026-07-22", actual: "2026-07-20", analyst: "u4", tests: [
    { name: "Cement Chemical Composition", method: "EN 872", targetDays: 7, received: "2026-07-08" },
  ]},
  { id: "s5", code: "SMP-2026-0319", clientId: "c7", client: "PT Nestle Indonesia", quotationId: "q5", category: "Microbiology", received: "2026-07-17", target: "2026-07-25", actual: null, analyst: "u3", tests: [
    { name: "Total Plate Count", method: "USP <61>", targetDays: 5, received: "2026-07-17" },
    { name: "E. coli / Coliform", method: "ISO 6222", targetDays: 5, received: "2026-07-17" },
  ]},
  { id: "s6", code: "SMP-2026-0298", clientId: "c2", client: "RS Medika Sentosa", quotationId: "q3", category: "Medical & Biological", received: "2026-07-05", target: "2026-07-19", actual: null, analyst: "u4", tests: [
    { name: "Sterility Testing (USP)", method: "USP <1231>", targetDays: 14, received: "2026-07-05" },
  ]},
];

const ACTIVITIES = [
  { id: 1, type: "Call", actor: "Rini Kusuma", clientId: "c3", client: "PT Petrokimia Gresik", note: "Discussed revised pricing for ENV package. Procurement to review internally.", time: "Today, 10:42 AM" },
  { id: 2, type: "Quotation", actor: "Rini Kusuma", clientId: "c7", client: "PT Nestle Indonesia", note: "QUO-2026-0061 sent — Microbiological Safety Panel, Rp 344 jt.", time: "Today, 9:15 AM" },
  { id: 3, type: "TAT Update", actor: "Dr. Sari Putri", clientId: "c2", client: "RS Medika Sentosa", note: "SMP-2026-0298 sterility test now Overdue — target was Jul 19.", time: "Yesterday, 4:00 PM" },
  { id: 4, type: "Meeting", actor: "Bagas Wijaya", clientId: "c4", client: "BPOM Regional Surabaya", note: "Scope qualification meeting. 3 USP methods confirmed. Quotation to follow.", time: "Yesterday, 2:30 PM" },
  { id: 5, type: "Note", actor: "Bagas Wijaya", clientId: "c6", client: "PT Pertamina EP", note: "Client delayed decision to Q4. Budget cycle issue. Flag as At Risk.", time: "Jul 20, 11:00 AM" },
  { id: 6, type: "TAT Update", actor: "Ahmad Fauzi", clientId: "c1", client: "PT Tirta Nusantara", note: "SMP-2026-0302 heavy metals at risk — only 1 day remaining vs target.", time: "Jul 20, 9:00 AM" },
  { id: 7, type: "Email", actor: "Rini Kusuma", clientId: "c5", client: "PT Holcim Indonesia", note: "Sent Q3 renewal proposal. Last year ARR was Rp 198 jt.", time: "Jul 18, 3:45 PM" },
  { id: 8, type: "Quotation", actor: "Bagas Wijaya", clientId: "c2", client: "RS Medika Sentosa", note: "QUO-2026-0058 approved — sterility testing contract.", time: "Jul 15, 10:00 AM" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtIDR = (n: number) => {
  if (n === 0) return "—";
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} M`;
  if (n >= 1_000_000) return `Rp ${Math.round(n / 1_000_000)} jt`;
  return `Rp ${n.toLocaleString("id-ID")}`;
};

const clientStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Active: { label: "Active", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: <CheckCircle2 size={10} /> },
  Prospect: { label: "Prospect", color: "text-blue-700 bg-blue-50 border-blue-200", icon: <Circle size={10} /> },
  "At Risk": { label: "At Risk", color: "text-amber-700 bg-amber-50 border-amber-200", icon: <AlertCircle size={10} /> },
  Churned: { label: "Churned", color: "text-red-700 bg-red-50 border-red-200", icon: <XCircle size={10} /> },
};

const quotationStatusConfig: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-600",
  Sent: "bg-blue-100 text-blue-700",
  "Under Review": "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
  Expired: "bg-slate-200 text-slate-500",
};

const tatStatusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  Received: { color: "text-slate-600", bg: "bg-slate-100", dot: "bg-slate-400" },
  "In Progress": { color: "text-blue-700", bg: "bg-blue-100", dot: "bg-blue-500" },
  "On Track": { color: "text-emerald-700", bg: "bg-emerald-100", dot: "bg-emerald-500" },
  "At Risk": { color: "text-amber-700", bg: "bg-amber-100", dot: "bg-amber-500" },
  Overdue: { color: "text-red-700", bg: "bg-red-100", dot: "bg-red-500" },
  Completed: { color: "text-slate-500", bg: "bg-slate-100", dot: "bg-slate-400" },
};

const getSampleStatus = (s: typeof SAMPLES[0]): string => {
  if (s.actual) return "Completed";
  const remaining = daysDiff(s.target);
  const total = daysDiff(s.target) - daysDiff(s.received); // won't be accurate but good enough for mock
  if (remaining < 0) return "Overdue";
  if (remaining <= 1) return "At Risk";
  if (remaining <= 3) return "At Risk";
  return "On Track";
};

const categoryIcon: Record<string, React.ReactNode> = {
  "Water Quality / Environmental": <Droplets size={11} />,
  "Medical & Biological": <TestTube size={11} />,
  "Materials & Chemical": <Beaker size={11} />,
  "Microbiology": <Microscope size={11} />,
  "Other": <FlaskConical size={11} />,
};

const categoryColor: Record<string, string> = {
  "Water Quality / Environmental": "bg-cyan-100 text-cyan-700",
  "Medical & Biological": "bg-rose-100 text-rose-700",
  "Materials & Chemical": "bg-violet-100 text-violet-700",
  "Microbiology": "bg-emerald-100 text-emerald-700",
  "Other": "bg-slate-100 text-slate-600",
};

const activityIcon: Record<string, { icon: React.ReactNode; color: string }> = {
  Call: { icon: <Phone size={12} />, color: "bg-blue-100 text-blue-700" },
  Email: { icon: <Mail size={12} />, color: "bg-violet-100 text-violet-700" },
  Meeting: { icon: <Users size={12} />, color: "bg-emerald-100 text-emerald-700" },
  Note: { icon: <Paperclip size={12} />, color: "bg-amber-100 text-amber-700" },
  Quotation: { icon: <FileText size={12} />, color: "bg-orange-100 text-orange-700" },
  "TAT Update": { icon: <Clock size={12} />, color: "bg-red-100 text-red-700" },
};

const stageColor: Record<string, string> = {
  Prospect: "bg-slate-100 text-slate-600",
  Qualified: "bg-blue-100 text-blue-700",
  "Quotation Sent": "bg-indigo-100 text-indigo-700",
  Negotiation: "bg-amber-100 text-amber-700",
  "Closed Won": "bg-emerald-100 text-emerald-700",
  "Closed Lost": "bg-red-100 text-red-700",
};

const avatarColor = (name: string) => {
  const c = ["bg-blue-800 text-blue-100", "bg-emerald-800 text-emerald-100", "bg-rose-800 text-rose-100", "bg-violet-800 text-violet-100", "bg-amber-800 text-amber-100", "bg-cyan-800 text-cyan-100"];
  return c[name.charCodeAt(0) % c.length];
};

const initials = (name: string) => name.split(" ").filter((_, i) => i < 2).map(w => w[0]).join("").toUpperCase();

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV = [
  { id: "overview", label: "Overview", icon: <BarChart2 size={15} /> },
  { id: "clients", label: "Clients", icon: <Users size={15} /> },
  { id: "pipeline", label: "Pipeline", icon: <Layers size={15} /> },
  { id: "quotations", label: "Quotations", icon: <FileText size={15} /> },
  { id: "tat", label: "TAT Tracker", icon: <Clock size={15} /> },
  { id: "activity", label: "Activity", icon: <Activity size={15} /> },
];

function Sidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const tatBreaches = SAMPLES.filter(s => ["At Risk", "Overdue"].includes(getSampleStatus(s))).length;
  const pendingQuotes = QUOTATIONS.filter(q => ["Sent", "Under Review"].includes(q.status)).length;

  return (
    <aside className="w-56 flex-shrink-0 bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-accent rounded-sm flex items-center justify-center flex-shrink-0">
            <FlaskConical size={13} className="text-white" />
          </div>
          <div>
            <p className="text-sidebar-foreground font-bold text-xs tracking-tight leading-tight" style={{ fontFamily: "Archivo, sans-serif" }}>LabVeri CRM</p>
            <p className="text-sidebar-foreground/40 text-[9px] leading-tight">Testing Services</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV.map((item) => {
          const badge = item.id === "tat" ? tatBreaches : item.id === "quotations" ? pendingQuotes : 0;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-xs transition-colors ${
                active === item.id
                  ? "bg-sidebar-accent text-sidebar-foreground font-semibold"
                  : "text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
              }`}
              style={{ fontFamily: "Archivo, sans-serif" }}
            >
              <span className={active === item.id ? "text-accent" : ""}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {badge > 0 && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${item.id === "tat" ? "bg-red-500 text-white" : "bg-blue-500 text-white"}`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-2 pb-3 border-t border-sidebar-border pt-3">
        <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">RK</div>
          <div className="min-w-0">
            <p className="text-sidebar-foreground text-[11px] font-semibold truncate" style={{ fontFamily: "Archivo, sans-serif" }}>Rini Kusuma</p>
            <p className="text-sidebar-foreground/40 text-[9px]">Sales</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-[11px] text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-colors" style={{ fontFamily: "Archivo, sans-serif" }}>
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </aside>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

function TopBar({ title, search, setSearch }: { title: string; search: string; setSearch: (s: string) => void }) {
  return (
    <header className="h-12 border-b border-border flex items-center px-5 gap-3 bg-background flex-shrink-0">
      <h1 className="text-sm font-bold text-foreground" style={{ fontFamily: "Archivo, sans-serif" }}>{title}</h1>
      <div className="flex-1" />
      <div className="relative w-56">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search…"
          className="w-full pl-7 pr-3 py-1.5 text-[11px] bg-input-background rounded-sm border border-border focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          style={{ fontFamily: "Archivo, sans-serif" }}
        />
      </div>
      <button className="relative p-1.5 rounded-sm hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
        <Bell size={14} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent rounded-full" />
      </button>
    </header>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function CategoryBadge({ cat }: { cat: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[9px] font-semibold ${categoryColor[cat] || "bg-slate-100 text-slate-600"}`}>
      {categoryIcon[cat]} {cat.split(" / ")[0]}
    </span>
  );
}

function StandardBadge({ std }: { std: string }) {
  return (
    <span className="inline-flex px-1.5 py-0.5 rounded-sm text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 font-mono">
      {std}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, trend, up, alert }: { label: string; value: string; sub?: string; trend?: string; up?: boolean; alert?: boolean }) {
  return (
    <div className={`bg-card border rounded-sm p-4 flex flex-col gap-2.5 ${alert ? "border-red-300 bg-red-50" : "border-border"}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "Archivo, sans-serif" }}>{label}</p>
      <p className={`text-2xl font-bold leading-none ${alert ? "text-red-700" : "text-foreground"}`} style={{ fontFamily: "Archivo, sans-serif", letterSpacing: "-0.02em" }}>{value}</p>
      {(sub || trend) && (
        <div className="flex items-center gap-1.5">
          {trend && (
            <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${up ? "text-emerald-700" : "text-red-700"}`}>
              {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />} {trend}
            </span>
          )}
          {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
        </div>
      )}
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function Overview() {
  const { users: USERS, clients: CLIENTS, deals: DEALS, quotations: QUOTATIONS, samples: SAMPLES, activities: ACTIVITIES } = useData();
  const activeClients = CLIENTS.filter(c => c.status === "Active").length;
  const openPipeline = DEALS.filter(d => !d.stage.startsWith("Closed")).reduce((a, d) => a + d.value, 0);
  const pending = QUOTATIONS.filter(q => ["Sent", "Under Review"].includes(q.status));
  const pendingVal = pending.reduce((a, q) => a + q.total, 0);
  const breaches = SAMPLES.filter(s => ["At Risk", "Overdue"].includes(getSampleStatus(s)));

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Active Clients" value={`${activeClients}`} trend="+2" up sub="vs last month" />
        <StatCard label="Open Pipeline" value={fmtIDR(openPipeline)} trend="+18%" up sub="vs last quarter" />
        <StatCard label="Pending Quotations" value={`${pending.length}`} sub={fmtIDR(pendingVal)} />
        <StatCard label="TAT Breaches" value={`${breaches.length}`} alert sub="At Risk + Overdue samples" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-card border border-border rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-foreground" style={{ fontFamily: "Archivo, sans-serif" }}>Recent Clients</h2>
            <span className="text-[10px] text-muted-foreground">{CLIENTS.length} total</span>
          </div>
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                {["Client", "Test Category", "Status", "Owner", "Last Contact"].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "Archivo, sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLIENTS.filter(c => c.status !== "Churned").slice(0, 6).map(c => {
                const sc = clientStatusConfig[c.status];
                const owner = USERS.find(u => u.id === c.owner);
                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${avatarColor(c.name)}`}>{initials(c.name)}</div>
                        <div>
                          <p className="text-[11px] font-semibold text-foreground leading-tight" style={{ fontFamily: "Archivo, sans-serif" }}>{c.name}</p>
                          <p className="text-[10px] text-muted-foreground">{c.industry}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">{c.testCategories.slice(0, 1).map(cat => <CategoryBadge key={cat} cat={cat} />)}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${sc.color}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[10px] text-muted-foreground">{owner?.name.split(" ")[0]}</td>
                    <td className="px-4 py-2.5 text-[10px] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{c.lastContact}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-card border border-border rounded-sm flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-foreground" style={{ fontFamily: "Archivo, sans-serif" }}>Activity Feed</h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {ACTIVITIES.slice(0, 6).map(a => {
              const ai = activityIcon[a.type];
              return (
                <div key={a.id} className="px-3 py-2.5 flex gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${ai.color}`}>{ai.icon}</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-foreground truncate" style={{ fontFamily: "Archivo, sans-serif" }}>{a.client}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{a.note}</p>
                    <p className="text-[9px] text-muted-foreground mt-1">{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Clients ──────────────────────────────────────────────────────────────────

type Client = typeof CLIENTS[0];

function ClientsView({ search }: { search: string }) {
  const { users: USERS, clients: CLIENTS, deals: DEALS, quotations: QUOTATIONS, samples: SAMPLES, activities: ACTIVITIES } = useData();
  const [selected, setSelected] = useState<Client | null>(null);
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = useMemo(() => CLIENTS.filter(c => {
    const q = search.toLowerCase();
    const ms = !q || c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.standards.some(s => s.toLowerCase().includes(q));
    const mf = filterStatus === "All" || c.status === filterStatus;
    return ms && mf;
  }), [search, filterStatus]);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="px-5 py-2.5 border-b border-border flex items-center gap-2 bg-background flex-shrink-0">
          {["All", "Active", "Prospect", "At Risk", "Churned"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-sm text-[11px] font-semibold transition-colors ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
              style={{ fontFamily: "Archivo, sans-serif" }}
            >{s}</button>
          ))}
          <div className="flex-1" />
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-accent text-accent-foreground rounded-sm hover:bg-accent/90 transition-colors" style={{ fontFamily: "Archivo, sans-serif" }}>
            <Plus size={11} /> Add Client
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-muted border-b border-border z-10">
              <tr>
                {["Client / Sector", "Test Categories", "Standards", "Status", "Deal Value", "Last Contact", "Owner", ""].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap" style={{ fontFamily: "Archivo, sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-card">
              {filtered.map(c => {
                const sc = clientStatusConfig[c.status];
                const owner = USERS.find(u => u.id === c.owner);
                return (
                  <tr key={c.id} onClick={() => setSelected(selected?.id === c.id ? null : c)}
                    className={`border-b border-border cursor-pointer transition-colors ${selected?.id === c.id ? "bg-secondary" : "hover:bg-muted/40"}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${avatarColor(c.name)}`}>{initials(c.name)}</div>
                        <div>
                          <p className="text-[11px] font-semibold text-foreground" style={{ fontFamily: "Archivo, sans-serif" }}>{c.name}</p>
                          <p className="text-[10px] text-muted-foreground">{c.industry}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">{c.testCategories.map(cat => <CategoryBadge key={cat} cat={cat} />)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">{c.standards.slice(0, 2).map(s => <StandardBadge key={s} std={s} />)}{c.standards.length > 2 && <span className="text-[9px] text-muted-foreground">+{c.standards.length - 2}</span>}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${sc.color}`}>{sc.icon} {sc.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{fmtIDR(c.dealValue)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{c.lastContact}</span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-muted-foreground">{owner?.name.split(" ")[0]}</td>
                    <td className="px-4 py-3">
                      <button className="p-1 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><MoreHorizontal size={13} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="w-80 flex-shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Client Detail</span>
            <button onClick={() => setSelected(null)} className="p-1 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><X size={13} /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="px-4 py-4 border-b border-border">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColor(selected.name)}`}>{initials(selected.name)}</div>
                <div className="min-w-0">
                  <h2 className="text-xs font-bold text-foreground leading-tight" style={{ fontFamily: "Archivo, sans-serif" }}>{selected.name}</h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{selected.industry}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1.5 rounded-full text-[9px] font-semibold border ${clientStatusConfig[selected.status].color}`}>
                    {clientStatusConfig[selected.status].icon} {selected.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Deal Value</p>
                  <p className="text-base font-bold text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{fmtIDR(selected.dealValue)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Last Contact</p>
                  <p className="text-[11px] font-semibold text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{selected.lastContact}</p>
                </div>
              </div>
            </div>

            {/* Contacts */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Contacts</p>
              <div className="space-y-2">
                {selected.contacts.map(ct => (
                  <div key={ct.email} className="flex items-start gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 ${avatarColor(ct.name)}`}>{initials(ct.name)}</div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-foreground" style={{ fontFamily: "Archivo, sans-serif" }}>{ct.name} {ct.primary && <span className="text-[8px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded ml-1">Primary</span>}</p>
                      <p className="text-[9px] text-muted-foreground">{ct.position}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{ct.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test categories & standards */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Test Scope</p>
              <div className="flex flex-wrap gap-1 mb-2">{selected.testCategories.map(c => <CategoryBadge key={c} cat={c} />)}</div>
              <div className="flex flex-wrap gap-1">{selected.standards.map(s => <StandardBadge key={s} std={s} />)}</div>
            </div>

            {/* Deals */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Deals</p>
              <div className="space-y-2">
                {DEALS.filter(d => d.clientId === selected.id).map(d => (
                  <div key={d.id} className="p-2 bg-muted rounded-sm border border-border">
                    <div className="flex justify-between gap-2 mb-1">
                      <p className="text-[10px] font-semibold text-foreground leading-tight" style={{ fontFamily: "Archivo, sans-serif" }}>{d.title}</p>
                      <span className="text-[10px] font-bold text-foreground flex-shrink-0" style={{ fontFamily: "JetBrains Mono, monospace" }}>{fmtIDR(d.value)}</span>
                    </div>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-sm ${stageColor[d.stage]}`}>{d.stage}</span>
                  </div>
                ))}
                {DEALS.filter(d => d.clientId === selected.id).length === 0 && <p className="text-[10px] text-muted-foreground">No deals yet</p>}
              </div>
            </div>

            {/* Activity */}
            <div className="px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Recent Activity</p>
              <div className="space-y-2.5">
                {ACTIVITIES.filter(a => a.clientId === selected.id).map(a => {
                  const ai = activityIcon[a.type];
                  return (
                    <div key={a.id} className="flex gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${ai.color}`}>{ai.icon}</div>
                      <div>
                        <p className="text-[10px] text-foreground leading-snug">{a.note}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-border flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-primary text-primary-foreground rounded-sm text-[10px] font-semibold hover:bg-primary/90 transition-colors" style={{ fontFamily: "Archivo, sans-serif" }}>
              <Mail size={10} /> Email
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-secondary border border-border text-secondary-foreground rounded-sm text-[10px] font-semibold hover:bg-muted transition-colors" style={{ fontFamily: "Archivo, sans-serif" }}>
              <Phone size={10} /> Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

function PipelineView() {
  const { users: USERS, clients: CLIENTS, deals: DEALS, quotations: QUOTATIONS, samples: SAMPLES, activities: ACTIVITIES } = useData();
  const grouped = useMemo(() => PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = DEALS.filter(d => d.stage === stage);
    return acc;
  }, {} as Record<string, typeof DEALS>), []);

  return (
    <div className="flex-1 overflow-x-auto p-5 h-full">
      <div className="flex gap-4 h-full min-w-max">
        {PIPELINE_STAGES.map(stage => {
          const deals = grouped[stage];
          const total = deals.reduce((a, d) => a + d.value, 0);
          return (
            <div key={stage} className="w-60 flex flex-col gap-2.5 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground" style={{ fontFamily: "Archivo, sans-serif" }}>{stage}</h3>
                  <p className="text-[9px] text-muted-foreground mt-0.5" style={{ fontFamily: "JetBrains Mono, monospace" }}>{deals.length} · {fmtIDR(total)}</p>
                </div>
                <button className="p-1 rounded-sm hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><Plus size={12} /></button>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-0.5">
                {deals.map(d => (
                  <div key={d.id} className="bg-card border border-border rounded-sm p-3 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group">
                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                      <p className="text-[10px] font-semibold text-foreground leading-snug" style={{ fontFamily: "Archivo, sans-serif" }}>{d.title}</p>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground flex-shrink-0"><MoreHorizontal size={11} /></button>
                    </div>
                    <p className="text-[9px] text-muted-foreground mb-2.5">{d.client}</p>
                    <p className="text-base font-bold text-foreground mb-2" style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "-0.02em" }}>{fmtIDR(d.value)}</p>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${d.probability}%` }} />
                      </div>
                      <span className="text-[9px] font-semibold text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{d.probability}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground">{USERS.find(u => u.id === d.owner)?.name.split(" ")[0]}</span>
                      <span className="text-[9px] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{d.dueDate}</span>
                    </div>
                    {d.quotationId && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <span className="text-[8px] text-blue-600 font-semibold flex items-center gap-1"><FileText size={9} /> Quotation linked</span>
                      </div>
                    )}
                  </div>
                ))}
                {deals.length === 0 && (
                  <div className="border-2 border-dashed border-border rounded-sm p-4 text-center">
                    <p className="text-[10px] text-muted-foreground">No deals</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Quotations ───────────────────────────────────────────────────────────────

function QuotationsView({ search }: { search: string }) {
  const { users: USERS, clients: CLIENTS, deals: DEALS, quotations: QUOTATIONS, samples: SAMPLES, activities: ACTIVITIES } = useData();
  const [tab, setTab] = useState<"tracker" | "generator">("tracker");
  const [selected, setSelected] = useState<typeof QUOTATIONS[0] | null>(null);

  // Generator state
  const [genClient, setGenClient] = useState("");
  const [genLines, setGenLines] = useState([{ test: "", category: TEST_CATEGORIES[0] as string, method: "", matrix: "", price: 0, qty: 1, tat: 5 }]);
  const taxRate = 11;
  const subtotal = genLines.reduce((a, l) => a + l.price * l.qty, 0);
  const total = Math.round(subtotal * (1 + taxRate / 100));

  const filtered = useMemo(() => QUOTATIONS.filter(q => {
    const s = search.toLowerCase();
    return !s || q.client.toLowerCase().includes(s) || q.number.toLowerCase().includes(s);
  }), [search]);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-2.5 border-b border-border flex items-center gap-3 bg-background flex-shrink-0">
          <div className="flex gap-1">
            {(["tracker", "generator"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1 rounded-sm text-[11px] font-semibold capitalize transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
                style={{ fontFamily: "Archivo, sans-serif" }}
              >{t === "tracker" ? "Quotation Tracker" : "New Quotation"}</button>
            ))}
          </div>
        </div>

        {tab === "tracker" && (
          <div className="flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-muted border-b border-border z-10">
                <tr>
                  {["Quotation #", "Client", "Categories / Standards", "Issued", "Valid Until", "Total", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap" style={{ fontFamily: "Archivo, sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-card">
                {filtered.map(q => (
                  <tr key={q.id} onClick={() => setSelected(selected?.id === q.id ? null : q)}
                    className={`border-b border-border cursor-pointer transition-colors ${selected?.id === q.id ? "bg-secondary" : "hover:bg-muted/40"}`}>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{q.number}</span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-foreground" style={{ fontFamily: "Archivo, sans-serif" }}>{q.client}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {[...new Set(q.items.map(i => i.category))].map(c => <CategoryBadge key={c} cat={c} />)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{q.sentAt?.slice(0, 10) || "—"}</td>
                    <td className="px-4 py-3 text-[10px] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{q.validUntil}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{fmtIDR(q.total)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-sm ${quotationStatusConfig[q.status]}`}>{q.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Download size={11} /></button>
                        <button className="p-1 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Eye size={11} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "generator" && (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="max-w-3xl space-y-4">
              {/* Client */}
              <div className="bg-card border border-border rounded-sm p-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Client</p>
                <select value={genClient} onChange={e => setGenClient(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-input-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  style={{ fontFamily: "Archivo, sans-serif" }}>
                  <option value="">Select client…</option>
                  {CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Line Items */}
              <div className="bg-card border border-border rounded-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Test Line Items</p>
                  <button onClick={() => setGenLines([...genLines, { test: "", category: TEST_CATEGORIES[0], method: "", matrix: "", price: 0, qty: 1, tat: 5 }])}
                    className="flex items-center gap-1 text-[10px] font-semibold text-accent hover:text-accent/80 transition-colors" style={{ fontFamily: "Archivo, sans-serif" }}>
                    <Plus size={11} /> Add Test
                  </button>
                </div>
                <div className="space-y-3">
                  {genLines.map((line, i) => (
                    <div key={i} className="p-3 bg-muted rounded-sm border border-border">
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <input placeholder="Test name" value={line.test} onChange={e => { const l = [...genLines]; l[i].test = e.target.value; setGenLines(l); }}
                          className="px-2 py-1.5 text-[11px] bg-card border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-ring" style={{ fontFamily: "Archivo, sans-serif" }} />
                        <select value={line.category} onChange={e => { const l = [...genLines]; l[i].category = e.target.value; setGenLines(l); }}
                          className="px-2 py-1.5 text-[11px] bg-card border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-ring" style={{ fontFamily: "Archivo, sans-serif" }}>
                          {TEST_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                        <input placeholder="Method (e.g. EPA 200.7)" value={line.method} onChange={e => { const l = [...genLines]; l[i].method = e.target.value; setGenLines(l); }}
                          className="px-2 py-1.5 text-[11px] bg-card border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-ring" style={{ fontFamily: "JetBrains Mono, monospace" }} />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <input placeholder="Sample matrix" value={line.matrix} onChange={e => { const l = [...genLines]; l[i].matrix = e.target.value; setGenLines(l); }}
                          className="px-2 py-1.5 text-[11px] bg-card border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-ring" style={{ fontFamily: "Archivo, sans-serif" }} />
                        <input type="number" placeholder="Unit price (IDR)" value={line.price || ""} onChange={e => { const l = [...genLines]; l[i].price = parseInt(e.target.value) || 0; setGenLines(l); }}
                          className="px-2 py-1.5 text-[11px] bg-card border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-ring" style={{ fontFamily: "JetBrains Mono, monospace" }} />
                        <input type="number" placeholder="Qty" value={line.qty} onChange={e => { const l = [...genLines]; l[i].qty = parseInt(e.target.value) || 1; setGenLines(l); }}
                          className="px-2 py-1.5 text-[11px] bg-card border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-ring" style={{ fontFamily: "JetBrains Mono, monospace" }} />
                        <div className="flex items-center gap-1">
                          <input type="number" placeholder="TAT days" value={line.tat} onChange={e => { const l = [...genLines]; l[i].tat = parseInt(e.target.value) || 1; setGenLines(l); }}
                            className="flex-1 px-2 py-1.5 text-[11px] bg-card border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-ring" style={{ fontFamily: "JetBrains Mono, monospace" }} />
                          {genLines.length > 1 && (
                            <button onClick={() => setGenLines(genLines.filter((_, j) => j !== i))} className="p-1.5 rounded-sm hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors"><Trash2 size={11} /></button>
                          )}
                        </div>
                      </div>
                      {line.price > 0 && (
                        <p className="text-[9px] text-muted-foreground mt-1.5" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                          Line total: {fmtIDR(line.price * line.qty)} · TAT: {line.tat} days
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-card border border-border rounded-sm p-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Summary</p>
                <div className="space-y-1.5 text-[11px]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{fmtIDR(subtotal)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>PPN {taxRate}%</span><span>{fmtIDR(Math.round(subtotal * taxRate / 100))}</span></div>
                  <div className="flex justify-between font-bold text-foreground text-sm pt-1.5 border-t border-border"><span>Total</span><span>{fmtIDR(total)}</span></div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-secondary border border-border text-secondary-foreground rounded-sm text-[11px] font-semibold hover:bg-muted transition-colors" style={{ fontFamily: "Archivo, sans-serif" }}>
                  <FileText size={12} /> Save as Draft
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-accent text-accent-foreground rounded-sm text-[11px] font-semibold hover:bg-accent/90 transition-colors" style={{ fontFamily: "Archivo, sans-serif" }}>
                  <Send size={12} /> Send Quotation
                </button>
                <button className="px-4 py-2 bg-secondary border border-border text-secondary-foreground rounded-sm text-[11px] font-semibold hover:bg-muted transition-colors" style={{ fontFamily: "Archivo, sans-serif" }}>
                  <Download size={12} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quotation Detail */}
      {selected && tab === "tracker" && (
        <div className="w-80 flex-shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Quotation Detail</span>
            <button onClick={() => setSelected(null)} className="p-1 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><X size={13} /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-4 border-b border-border">
              <p className="text-base font-bold text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{selected.number}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{selected.client}</p>
              <span className={`inline-block mt-2 text-[9px] font-semibold px-2 py-0.5 rounded-sm ${quotationStatusConfig[selected.status]}`}>{selected.status}</span>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Total</p>
                  <p className="text-sm font-bold text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{fmtIDR(selected.total)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Valid Until</p>
                  <p className="text-[10px] font-semibold text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{selected.validUntil}</p>
                </div>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Line Items ({selected.items.length})</p>
              <div className="space-y-2.5">
                {selected.items.map((item, i) => (
                  <div key={i} className="p-2.5 bg-muted rounded-sm border border-border">
                    <p className="text-[10px] font-semibold text-foreground" style={{ fontFamily: "Archivo, sans-serif" }}>{item.test}</p>
                    <div className="flex gap-1 mt-1 mb-1.5 flex-wrap">
                      <CategoryBadge cat={item.category} />
                      <StandardBadge std={item.method} />
                    </div>
                    <p className="text-[9px] text-muted-foreground">Matrix: {item.matrix}</p>
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="text-[9px] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{fmtIDR(item.price)} × {item.qty}</span>
                      <span className="text-[10px] font-bold text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{fmtIDR(item.price * item.qty)}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1">TAT: {item.tat} days</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border space-y-1 text-[10px]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{fmtIDR(selected.subtotal)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>PPN {selected.taxRate}%</span><span>{fmtIDR(selected.total - selected.subtotal)}</span></div>
                <div className="flex justify-between font-bold text-foreground text-sm pt-1 border-t border-border"><span>Total</span><span>{fmtIDR(selected.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAT Tracker ─────────────────────────────────────────────────────────────

function TATView({ search }: { search: string }) {
  const { users: USERS, clients: CLIENTS, deals: DEALS, quotations: QUOTATIONS, samples: SAMPLES, activities: ACTIVITIES } = useData();
  const [filterAnalyst, setFilterAnalyst] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [selected, setSelected] = useState<typeof SAMPLES[0] | null>(null);

  const analysts = USERS.filter(u => u.role === "Lab Analyst");

  const filtered = useMemo(() => SAMPLES.filter(s => {
    const q = search.toLowerCase();
    const ms = !q || s.client.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
    const ma = filterAnalyst === "all" || s.analyst === filterAnalyst;
    const mc = filterCat === "all" || s.category === filterCat;
    return ms && ma && mc;
  }), [search, filterAnalyst, filterCat]);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-2.5 border-b border-border flex items-center gap-2 bg-background flex-shrink-0 flex-wrap">
          <select value={filterAnalyst} onChange={e => setFilterAnalyst(e.target.value)}
            className="px-2 py-1 text-[11px] bg-secondary border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-ring" style={{ fontFamily: "Archivo, sans-serif" }}>
            <option value="all">All Analysts</option>
            {analysts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="px-2 py-1 text-[11px] bg-secondary border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-ring" style={{ fontFamily: "Archivo, sans-serif" }}>
            <option value="all">All Categories</option>
            {TEST_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-3 ml-2 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />On Track</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />At Risk</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Overdue</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />Completed</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-muted border-b border-border z-10">
              <tr>
                {["Sample Code", "Client", "Category", "Received", "Target", "Days Left", "Analyst", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap" style={{ fontFamily: "Archivo, sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-card">
              {filtered.map(s => {
                const status = getSampleStatus(s);
                const tc = tatStatusConfig[status];
                const remaining = daysDiff(s.target);
                const analyst = USERS.find(u => u.id === s.analyst);
                return (
                  <tr key={s.id} onClick={() => setSelected(selected?.id === s.id ? null : s)}
                    className={`border-b border-border cursor-pointer transition-colors ${selected?.id === s.id ? "bg-secondary" : "hover:bg-muted/40"}`}>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{s.code}</span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-foreground" style={{ fontFamily: "Archivo, sans-serif" }}>{s.client}</td>
                    <td className="px-4 py-3"><CategoryBadge cat={s.category} /></td>
                    <td className="px-4 py-3 text-[10px] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{s.received}</td>
                    <td className="px-4 py-3 text-[10px] text-muted-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{s.target}</td>
                    <td className="px-4 py-3">
                      {s.actual ? (
                        <span className="text-[10px] text-muted-foreground">Done</span>
                      ) : (
                        <span className={`text-[10px] font-semibold ${remaining < 0 ? "text-red-700" : remaining <= 2 ? "text-amber-700" : "text-emerald-700"}`} style={{ fontFamily: "JetBrains Mono, monospace" }}>
                          {remaining < 0 ? `${Math.abs(remaining)}d over` : `${remaining}d`}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-muted-foreground">{analyst?.name.split(" ").slice(-1)[0]}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-semibold ${tc.bg} ${tc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} /> {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><ChevronRight size={12} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="w-80 flex-shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Sample Detail</span>
            <button onClick={() => setSelected(null)} className="p-1 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><X size={13} /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-4 border-b border-border">
              <p className="text-base font-bold text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{selected.code}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{selected.client}</p>
              <CategoryBadge cat={selected.category} />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Received</p>
                  <p className="text-[10px] font-semibold text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{selected.received}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Target</p>
                  <p className="text-[10px] font-semibold text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{selected.target}</p>
                </div>
                {selected.actual && (
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Completed</p>
                    <p className="text-[10px] font-semibold text-emerald-700" style={{ fontFamily: "JetBrains Mono, monospace" }}>{selected.actual}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Test Items & TAT</p>
              <div className="space-y-2.5">
                {selected.tests.map((t, i) => {
                  const target = new Date(t.received);
                  target.setDate(target.getDate() + t.targetDays);
                  const rem = Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
                  const overdue = rem < 0;
                  const atRisk = rem >= 0 && rem <= 1;
                  return (
                    <div key={i} className="p-2.5 bg-muted rounded-sm border border-border">
                      <p className="text-[10px] font-semibold text-foreground mb-1" style={{ fontFamily: "Archivo, sans-serif" }}>{t.name}</p>
                      <StandardBadge std={t.method} />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] text-muted-foreground">TAT: {t.targetDays} days</span>
                        <span className={`text-[9px] font-semibold ${overdue ? "text-red-700" : atRisk ? "text-amber-700" : "text-emerald-700"}`} style={{ fontFamily: "JetBrains Mono, monospace" }}>
                          {overdue ? `${Math.abs(rem)}d overdue` : atRisk ? `${rem}d left — at risk` : `${rem}d remaining`}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 bg-border rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${overdue ? "bg-red-500" : atRisk ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(100, Math.max(0, ((t.targetDays - Math.max(0, rem)) / t.targetDays) * 100))}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Activity ─────────────────────────────────────────────────────────────────

function ActivityView() {
  const { users: USERS, clients: CLIENTS, deals: DEALS, quotations: QUOTATIONS, samples: SAMPLES, activities: ACTIVITIES } = useData();
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-sm divide-y divide-border">
        {ACTIVITIES.map(a => {
          const ai = activityIcon[a.type];
          return (
            <div key={a.id} className="p-4 flex gap-4 hover:bg-muted/30 transition-colors">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${ai.color}`}>{ai.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-semibold text-foreground" style={{ fontFamily: "Archivo, sans-serif" }}>{a.actor}</span>
                    <span className="text-[11px] text-muted-foreground"> · {a.client}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground flex-shrink-0" style={{ fontFamily: "JetBrains Mono, monospace" }}>{a.time}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{a.note}</p>
                <span className={`inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded-sm text-[9px] font-semibold ${ai.color}`}>
                  {ai.icon} {a.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

const SECTION_TITLES: Record<string, string> = {
  overview: "Overview",
  clients: "Clients",
  pipeline: "Deal Pipeline",
  quotations: "Quotations",
  tat: "TAT Tracker",
  activity: "Activity Feed",
};

export default function App() {
  const [active, setActive] = useState("overview");
  const [search, setSearch] = useState("");

  return (
    <DataProvider>
    <div className="h-screen flex overflow-hidden bg-background" style={{ fontFamily: "Archivo, sans-serif" }}>
      <Sidebar active={active} setActive={(s) => { setActive(s); setSearch(""); }} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar title={SECTION_TITLES[active]} search={search} setSearch={setSearch} />
        <main className="flex-1 overflow-hidden flex flex-col">
          {active === "overview" && <Overview />}
          {active === "clients" && <ClientsView search={search} />}
          {active === "pipeline" && <PipelineView />}
          {active === "quotations" && <QuotationsView search={search} />}
          {active === "tat" && <TATView search={search} />}
          {active === "activity" && <ActivityView />}
        </main>
      </div>
    </div>
    </DataProvider>
  );
}
