'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowUpRight, Bell, Building2, CalendarDays, CheckCircle2,
  ChevronRight, Clock3, Download, LayoutDashboard, Mail, Menu, MoreHorizontal,
  Phone, Plus, RefreshCw, Search, Settings2, Target, TrendingUp, Users, Wallet, X, Zap
} from 'lucide-react';

type Stage = 'New' | 'Contacted' | 'Qualified' | 'Closed';
type Lead = { id: string; name: string; email: string; phone: string; interest: string; budget: string; location: string; source: string; date: string; status: Stage; initials: string };

const sampleLeads: Lead[] = [
  { id: 'MN-001', name: 'Aarav Mehta', email: 'aarav.mehta@example.com', phone: '+91 98765 43210', interest: '3 BHK Apartment', budget: '₹85–95 L', location: 'Hyderabad', source: 'Website', date: '09 Nov 2026', status: 'New', initials: 'AM' },
  { id: 'MN-002', name: 'Diya Reddy', email: 'diya.reddy@example.com', phone: '+91 98765 12340', interest: 'Independent House', budget: '₹1.2–1.5 Cr', location: 'Bengaluru', source: 'Instagram', date: '08 Nov 2026', status: 'Contacted', initials: 'DR' },
  { id: 'MN-003', name: 'Kabir Shah', email: 'kabir.shah@example.com', phone: '+91 99887 76655', interest: 'Commercial Office', budget: '₹2–2.5 Cr', location: 'Hyderabad', source: 'Referral', date: '07 Nov 2026', status: 'Qualified', initials: 'KS' },
  { id: 'MN-004', name: 'Ananya Rao', email: 'ananya.rao@example.com', phone: '+91 91234 56780', interest: '2 BHK Apartment · Sell', budget: '₹72 L', location: 'Vijayawada', source: 'Website', date: '06 Nov 2026', status: 'Closed', initials: 'AR' },
  { id: 'MN-005', name: 'Ishaan Nair', email: 'ishaan.nair@example.com', phone: '+91 90123 45678', interest: 'Villa', budget: '₹1.8–2 Cr', location: 'Chennai', source: 'Google Ads', date: '05 Nov 2026', status: 'Contacted', initials: 'IN' },
  { id: 'MN-006', name: 'Meera Iyer', email: 'meera.iyer@example.com', phone: '+91 93456 78901', interest: '2 BHK Apartment · Rent', budget: '₹30–35 K/mo', location: 'Hyderabad', source: 'Instagram', date: '04 Nov 2026', status: 'New', initials: 'MI' },
];

const stages: Stage[] = ['New', 'Contacted', 'Qualified', 'Closed'];
const stageColor: Record<Stage, string> = {
  New: 'bg-sky-50 text-sky-700 border-sky-100',
  Contacted: 'bg-amber-50 text-amber-700 border-amber-100',
  Qualified: 'bg-violet-50 text-violet-700 border-violet-100',
  Closed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};
const dotColor: Record<Stage, string> = {
  New: 'bg-sky-500', Contacted: 'bg-amber-500', Qualified: 'bg-violet-500', Closed: 'bg-emerald-500',
};

function Pill({ status }: { status: Stage }) {
  return <span className={'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ' + stageColor[status]}><span className={'h-1.5 w-1.5 rounded-full ' + dotColor[status]} />{status}</span>;
}
function Avatar({ lead }: { lead: Lead }) {
  return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[11px] font-bold text-indigo-700">{lead.initials}</div>;
}

export default function CRMPage() {
  const [tab, setTab] = useState<'overview' | 'leads' | 'pipeline' | 'automations'>('overview');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dataSource, setDataSource] = useState<'demo' | 'notion'>('demo');
  const [leads, setLeads] = useState<Lead[]>(sampleLeads);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState('');
  const loadNotionLeads = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await fetch('/api/leads', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not load leads from Notion.');
      }
      const mapped: Lead[] = (data.leads || []).map((lead: any) => {
        const name = String(lead.name || 'Unnamed Lead');
        const statusValue = stages.includes(lead.status) ? lead.status as Stage : 'New';
        const dateValue = lead.dateCaptured ? new Date(lead.dateCaptured + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not recorded';
        return {
          id: String(lead.id),
          name,
          email: String(lead.email || 'No email'),
          phone: String(lead.phone || 'No phone'),
          interest: String(lead.interest || 'General enquiry'),
          budget: String(lead.budget || 'Not specified'),
          location: String(lead.location || 'Not recorded'),
          source: String(lead.source || 'Not recorded'),
          date: dateValue,
          status: statusValue,
          initials: name.split(/\s+/).slice(0, 2).map((part: string) => part[0] || '').join('').toUpperCase() || 'NA',
        };
      });
      setLeads(mapped);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (error) {
      setLeads([]);
      setLoadError(error instanceof Error ? error.message : 'Unexpected error loading Notion records.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (dataSource === 'notion') {
      void loadNotionLeads();
    } else {
      setLeads(sampleLeads);
      setLoadError('');
      setLastRefreshed('');
      setLoading(false);
    }
  }, [dataSource]);
  const counts = useMemo(() => ({
    total: leads.length,
    New: leads.filter(l => l.status === 'New').length,
    Contacted: leads.filter(l => l.status === 'Contacted').length,
    Qualified: leads.filter(l => l.status === 'Qualified').length,
    Closed: leads.filter(l => l.status === 'Closed').length,
  }), [leads]);
  const filtered = leads.filter(l => {
    const q = query.toLowerCase();
    const matches = [l.name, l.email, l.phone, l.interest, l.location, l.source].some(v => v.toLowerCase().includes(q));
    return matches && (status === 'All' || l.status === status);
  });
  const nav = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'leads' as const, label: 'Lead directory', icon: Users },
    { id: 'pipeline' as const, label: 'Sales pipeline', icon: Target },
    { id: 'automations' as const, label: 'Automations', icon: Zap },
  ];
  const exportCsv = () => {
    const lines = [['Name', 'Email', 'Phone', 'Interest', 'Budget', 'Location', 'Source', 'Date', 'Status'], ...filtered.map(l => [l.name, l.email, l.phone, l.interest, l.budget, l.location, l.source, l.date, l.status])];
    const csv = lines.map(row => row.map(value => '"' + value.replace(/"/g, '""') + '"').join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = 'mn-signal-crm-leads.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
    {mobileOpen && <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-slate-950/40 md:hidden" />}
    <aside className={'fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-slate-200 bg-white transition-transform md:translate-x-0 ' + (mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
      <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">MN<span className="text-emerald-400">.</span></div><div><p className="text-sm font-bold tracking-[.13em]">MN SIGNAL</p><p className="mt-0.5 text-[9px] font-semibold tracking-widest text-slate-400">CLIENT OPERATIONS</p></div></div>
      <div className="px-4 pt-6"><p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Workspace</p><div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="rounded-lg bg-white p-2 text-slate-500"><Building2 size={16} /></span><div><p className="text-xs font-semibold">Real Estate CRM</p><p className="text-[10px] text-slate-400">Starter workspace</p></div></div><p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Manage</p><nav className="space-y-1">{nav.map(item => <button key={item.id} onClick={() => { setTab(item.id); setMobileOpen(false); }} className={'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium ' + (tab === item.id ? 'bg-slate-950 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')}><item.icon size={16} />{item.label}{item.id === 'leads' && <span className="ml-auto rounded-md bg-white/15 px-1.5 py-0.5 text-[10px]">{leads.length}</span>}</button>)}</nav></div>
      <div className="mt-auto p-4"><div className={'rounded-xl border p-4 ' + (dataSource === 'demo' ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50')}><p className={'text-[10px] font-bold uppercase tracking-wider ' + (dataSource === 'demo' ? 'text-amber-700' : 'text-emerald-700')}>{dataSource === 'demo' ? 'Demo workspace' : 'Notion data source'}</p><p className={'mt-2 text-[11px] leading-relaxed ' + (dataSource === 'demo' ? 'text-amber-800' : 'text-emerald-800')}>{dataSource === 'demo' ? 'Fictional sample records only.' : 'Read-only records loaded through the secure server API.'}</p></div><div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold">MN</div><div><p className="text-xs font-semibold">MN Signal</p><p className="text-[10px] text-slate-400">Workspace owner</p></div><MoreHorizontal size={16} className="ml-auto text-slate-400" /></div></div>
    </aside>

    <main className="min-h-screen md:pl-[248px]">
      <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-8"><div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-500 md:hidden"><Menu size={18} /></button><div><p className="text-sm font-semibold">{tab === 'overview' ? 'Overview' : tab === 'leads' ? 'Lead directory' : tab === 'pipeline' ? 'Sales pipeline' : 'Automation centre'}</p><p className="mt-1 hidden text-[10px] text-slate-400 sm:block">Your business signal, in one place</p></div></div><div className="flex items-center gap-2"><div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1"><button onClick={() => setDataSource('demo')} className={'rounded-lg px-3 py-2 text-[10px] font-semibold ' + (dataSource === 'demo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500')}>Demo</button><button onClick={() => setDataSource('notion')} className={'rounded-lg px-3 py-2 text-[10px] font-semibold ' + (dataSource === 'notion' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500')}>Notion</button></div><button aria-label="Notifications" className="rounded-xl border border-slate-200 p-2 text-slate-500"><Bell size={16} /></button><button onClick={exportCsv} className="flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-[10px] font-semibold text-white"><Download size={13} /><span className="hidden sm:inline">Export</span></button></div></header>

      <div className="mx-auto max-w-[1440px] space-y-6 p-4 sm:p-8">{dataSource === 'notion' && <div className={'flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-xs ' + (loadError ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800')}><span>{loading ? 'Connecting to Notion…' : loadError ? loadError : 'Connected to Notion · Read-only mode'}</span><div className="flex items-center gap-3"><span className="text-[10px] opacity-70">{lastRefreshed ? 'Updated ' + lastRefreshed : ''}</span><button disabled={loading} onClick={() => void loadNotionLeads()} className="inline-flex items-center gap-1.5 rounded-lg border border-current/20 px-2.5 py-1.5 font-semibold disabled:opacity-50"><RefreshCw size={12} className={loading ? 'animate-spin' : ''} />Refresh</button></div></div>}{loading && <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">Loading leads from your Notion database…</div>}
        {tab === 'overview' && <>
          <section className="relative overflow-hidden rounded-3xl bg-[#101b2d] p-7 text-white shadow-xl sm:p-9"><div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border-[45px] border-white/[.04]" /><div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div className="max-w-xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.08] px-3 py-1.5 text-[9px] font-bold tracking-wider text-emerald-300"><Activity size={12} /> WORKSPACE OVERVIEW</span><h1 className="mt-5 text-3xl font-semibold tracking-tight">Good to see you again.</h1><p className="mt-3 max-w-lg text-xs leading-6 text-slate-300">Keep every enquiry organised, every follow-up visible and every opportunity moving forward.</p><button onClick={() => setTab('leads')} className="mt-6 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-950">Explore leads <ArrowUpRight size={14} /></button></div><div className="grid grid-cols-3 gap-3">{stages.slice(0, 3).map(s => <div key={s} className="min-w-[88px] rounded-2xl border border-white/10 bg-white/[.07] p-4"><p className="text-[10px] text-slate-400">{s}</p><p className="mt-2 text-2xl font-semibold">{counts[s]}</p></div>)}</div></div></section>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: 'Total enquiries', value: counts.total, note: 'All captured prospects', icon: Users, color: 'bg-indigo-50 text-indigo-600' }, { label: 'New enquiries', value: counts.New, note: 'Awaiting first response', icon: Clock3, color: 'bg-sky-50 text-sky-600' }, { label: 'Qualified prospects', value: counts.Qualified, note: 'High-intent opportunities', icon: Target, color: 'bg-violet-50 text-violet-600' }, { label: 'Closed deals', value: counts.Closed, note: 'Marked as closed', icon: Wallet, color: 'bg-emerald-50 text-emerald-600' }].map(card => <div key={card.label} className="rounded-2xl border border-slate-200/80 bg-white p-5"><div className="flex items-start justify-between"><p className="text-xs font-medium text-slate-500">{card.label}</p><span className={'rounded-xl p-2.5 ' + card.color}><card.icon size={18} /></span></div><p className="mt-4 text-3xl font-semibold tracking-tight">{card.value}</p><p className="mt-1 text-[10px] text-slate-400">{card.note}</p></div>)}</section>
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]"><div className="rounded-2xl border border-slate-200/80 bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Pipeline distribution</h2><p className="mt-1 text-[10px] text-slate-400">Lead count by sales stage</p></div><TrendingUp size={18} className="text-slate-400" /></div><div className="mt-7 flex h-3 overflow-hidden rounded-full bg-slate-100">{stages.map(s => <div key={s} className={dotColor[s]} style={{ width: counts.total ? (counts[s] / counts.total * 100) + '%' : '0%' }} />)}</div><div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">{stages.map(s => <div key={s}><div className="flex items-center gap-2"><span className={'h-2 w-2 rounded-full ' + dotColor[s]} /><span className="text-[11px] text-slate-500">{s}</span></div><p className="mt-2 text-xl font-semibold">{counts[s]}</p><p className="mt-1 text-[10px] text-slate-400">{counts.total ? Math.round(counts[s] / counts.total * 100) : 0}% of leads</p></div>)}</div></div><div className="rounded-2xl border border-slate-200/80 bg-white p-6"><h2 className="text-sm font-semibold">Workspace pulse</h2><p className="mt-1 text-[10px] text-slate-400">Current operating snapshot</p><div className="mt-5 space-y-4">{[{ label: 'Awaiting first contact', value: counts.New, icon: Clock3, color: 'text-sky-600 bg-sky-50' }, { label: 'Qualified prospects', value: counts.Qualified, icon: Target, color: 'text-violet-600 bg-violet-50' }, { label: 'Closed opportunities', value: counts.Closed, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' }].map(row => <div key={row.label} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"><div className="flex items-center gap-3"><span className={'rounded-lg p-2 ' + row.color}><row.icon size={15} /></span><span className="text-xs text-slate-600">{row.label}</span></div><span className="text-sm font-semibold">{row.value}</span></div>)}</div></div></section>
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-semibold">Latest enquiries</h2><p className="mt-1 text-[10px] text-slate-400">Recently captured sample prospects</p></div><button onClick={() => setTab('leads')} className="text-[11px] font-semibold text-slate-500">View all <ChevronRight size={13} className="inline" /></button></div><div className="divide-y divide-slate-100">{leads.slice(0, 5).map(lead => <button key={lead.id} onClick={() => setSelected(lead)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-slate-50"><Avatar lead={lead} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{lead.name}</p><p className="mt-1 truncate text-[10px] text-slate-400">{lead.interest}</p></div><span className="hidden text-[11px] font-medium text-slate-600 sm:block">{lead.budget}</span><Pill status={lead.status} /><ChevronRight size={14} className="text-slate-300" /></button>)}</div></section>
        </>}
        {tab === 'leads' && <><div><h1 className="text-xl font-semibold">Lead directory</h1><p className="mt-1 text-xs text-slate-400">Search, filter and inspect your enquiries.</p></div><div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row"><div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, email, phone or location" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-slate-400" /></div><select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-600"><option>All</option>{stages.map(s => <option key={s}>{s}</option>)}</select><span className="self-center text-[10px] text-slate-400">{filtered.length} records</span></div><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400"><tr>{['Contact', 'Interest', 'Budget', 'Source', 'Captured', 'Status', ''].map(h => <th key={h} className="px-4 py-3.5 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.map(lead => <tr key={lead.id} className="hover:bg-slate-50"><td className="px-4 py-4"><button type="button" onClick={() => setSelected(lead)} aria-label={'Open profile for ' + lead.name} className="flex items-center gap-3 text-left"><Avatar lead={lead} /><span><span className="block text-xs font-semibold text-slate-900">{lead.name}</span><span className="mt-1 block text-[10px] text-slate-400">{lead.email}</span><span className="mt-1 block text-[10px] font-semibold text-indigo-600">View profile</span></span></button></td><td className="px-4 py-4 text-xs text-slate-600">{lead.interest}<p className="mt-1 text-[10px] text-slate-400">{lead.location}</p></td><td className="px-4 py-4 text-xs font-semibold">{lead.budget}</td><td className="px-4 py-4 text-xs text-slate-500">{lead.source}</td><td className="px-4 py-4 text-xs text-slate-500">{lead.date}</td><td className="px-4 py-4"><Pill status={lead.status} /></td><td className="px-4 py-4"><ChevronRight size={14} className="text-slate-300" /></td></tr>)}</tbody></table>{filtered.length === 0 && <p className="p-12 text-center text-xs text-slate-400">No matching leads. Try clearing your search.</p>}</div></>}
        {tab === 'pipeline' && <><div><h1 className="text-xl font-semibold">Sales pipeline</h1><p className="mt-1 text-xs text-slate-400">A visual view of prospects at each stage.</p></div><div className="grid grid-cols-1 gap-4 lg:grid-cols-4">{stages.map(stage => <section key={stage} className="min-h-[330px] rounded-2xl border border-slate-200 bg-slate-100/70 p-3"><div className="flex items-center justify-between px-1 pb-3"><div className="flex items-center gap-2"><span className={'h-2 w-2 rounded-full ' + dotColor[stage]} /><h2 className="text-xs font-semibold">{stage}</h2><span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-500">{counts[stage]}</span></div><MoreHorizontal size={16} className="text-slate-400" /></div><div className="space-y-3">{leads.filter(l => l.status === stage).map(lead => <button key={lead.id} onClick={() => setSelected(lead)} className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center gap-2.5"><Avatar lead={lead} /><div><p className="text-xs font-semibold">{lead.name}</p><p className="mt-1 text-[10px] text-slate-400">{lead.location}</p></div></div><p className="mt-3 text-[11px] text-slate-600">{lead.interest}</p><div className="mt-3 flex justify-between border-t border-slate-100 pt-2.5 text-[10px]"><span className="text-slate-400">{lead.date}</span><b>{lead.budget}</b></div></button>)}</div></section>)}</div><p className="text-[10px] text-slate-400">Read-only demo board. Status editing will be enabled after a secure CRM write API is implemented.</p></>}
        {tab === 'automations' && <><div><h1 className="text-xl font-semibold">Automation centre</h1><p className="mt-1 text-xs text-slate-400">The planned lead capture workflow for this workspace.</p></div><section className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-3"><span className="rounded-xl bg-violet-50 p-3 text-violet-600"><Zap size={19} /></span><div><h2 className="text-sm font-semibold">Real estate lead capture</h2><p className="mt-1 text-[10px] text-slate-400">Tally → Make.com → Notion → MN Signal</p></div><span className="ml-auto rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-700">Blueprint only</span></div><div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-4">{[{ title: 'Capture enquiry', desc: 'Prospect submits the lead form.', icon: Plus }, { title: 'Process in Make', desc: 'Validate and route the record.', icon: Zap }, { title: 'Save to Notion', desc: 'Create a record with New status.', icon: Building2 }, { title: 'Review in CRM', desc: 'Team reviews and follows up.', icon: LayoutDashboard }].map((step, i) => <div key={step.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex justify-between text-slate-400"><span className="text-[10px] font-bold">0{i + 1}</span><step.icon size={17} /></div><h3 className="mt-5 text-xs font-semibold">{step.title}</h3><p className="mt-1 text-[10px] leading-relaxed text-slate-400">{step.desc}</p></div>)}</div><p className="mt-5 rounded-xl bg-slate-50 p-3 text-[10px] leading-relaxed text-slate-500">This is a workflow blueprint, not a live Make.com connection. Keep outgoing messages under human approval until the workflow is tested.</p></section></>}
        <footer className="flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-4 text-[10px] text-slate-400"><span>© 2026 MN Signal · CRM workspace</span><span className="flex items-center gap-1.5"><span className={'h-1.5 w-1.5 rounded-full ' + (dataSource === 'demo' ? 'bg-amber-500' : 'bg-emerald-500')} /> {dataSource === 'demo' ? 'Demo data · No external connection' : 'Notion data · Read-only connection'}</span></footer>
      </div>
    </main>
    {selected && <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35" onClick={() => setSelected(null)}><aside onClick={e => e.stopPropagation()} className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lead profile</p><p className="mt-1 text-xs text-slate-500">Contact overview</p></div><button onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button></div><div className="p-6"><div className="flex items-center gap-4"><Avatar lead={selected} /><div><h2 className="text-lg font-semibold">{selected.name}</h2><p className="mt-1 text-xs text-slate-400">{selected.location}</p><div className="mt-2"><Pill status={selected.status} /></div></div></div><div className="mt-7 rounded-xl border border-slate-200 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact details</p><p className="mt-3 flex items-center gap-3 text-xs text-slate-600"><Mail size={14} />{selected.email}</p><p className="mt-3 flex items-center gap-3 text-xs text-slate-600"><Phone size={14} />{selected.phone}</p></div><div className="mt-4 rounded-xl border border-slate-200 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Opportunity details</p><div className="mt-3 space-y-3 text-xs">{[['Interest', selected.interest], ['Budget', selected.budget], ['Source', selected.source], ['Captured', selected.date], ['Record ID', selected.id]].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><span className="text-slate-400">{label}</span><span className="text-right font-medium text-slate-700">{value}</span></div>)}</div></div></div><div className="mt-auto border-t border-slate-100 p-6"><p className="text-[10px] leading-relaxed text-slate-400">{dataSource === 'demo' ? 'Fictional sample profile. No real customer record is being changed.' : 'Read-only profile from your Notion database. Changes are not written back.'}</p><button onClick={() => setSelected(null)} className="mt-4 w-full rounded-xl bg-slate-950 py-3 text-xs font-semibold text-white">Close profile</button></div></aside></div>}
  </div>;
}
