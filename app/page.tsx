'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GitPullRequest, 
  Settings as SettingsIcon, 
  Database, 
  RefreshCw, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Building2, 
  Phone, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  dateCaptured: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Closed';
  budget?: string;
}

const DEMO_LEADS: Lead[] = [
  {
    id: 'demo-1',
    name: 'Eleanor Vance',
    email: 'eleanor.vance@example.com',
    phone: '+1 (555) 234-5678',
    interest: 'Buying (Single Family)',
    dateCaptured: '2026-06-12',
    status: 'New',
    budget: '$850,000'
  },
  {
    id: 'demo-2',
    name: 'Marcus Sterling',
    email: 'm.sterling@investments.co',
    phone: '+1 (555) 890-1234',
    interest: 'Selling (Luxury Condo)',
    dateCaptured: '2026-06-11',
    status: 'Contacted',
    budget: '$1,200,000'
  },
  {
    id: 'demo-3',
    name: 'Dr. Harrison Wells',
    email: 'hwells@quantumtech.io',
    phone: '+1 (555) 456-7890',
    interest: 'Buying (Penthouse)',
    dateCaptured: '2026-06-10',
    status: 'Qualified',
    budget: '$2,100,000'
  },
  {
    id: 'demo-4',
    name: 'Sophia Chen',
    email: 'sophia.chen@designstudio.net',
    phone: '+1 (555) 678-9012',
    interest: 'Commercial Lease',
    dateCaptured: '2026-06-08',
    status: 'Closed',
    budget: '$4,500/mo'
  },
  {
    id: 'demo-5',
    name: 'Liam O\'Connor',
    email: 'liam.oconnor@construction.org',
    phone: '+1 (555) 345-6789',
    interest: 'Buying (Townhouse)',
    dateCaptured: '2026-06-05',
    status: 'Contacted',
    budget: '$650,000'
  }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'pipeline' | 'settings'>('overview');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchLeads = async (demo: boolean = isDemoMode) => {
    setLoading(true);
    setError(null);
    if (demo) {
      setTimeout(() => {
        setLeads(DEMO_LEADS);
        setLoading(false);
        setLastRefreshed(new Date().toLocaleTimeString());
      }, 400);
      return;
    }

    setLeads([]);
    try {
      const res = await fetch('/api/leads', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
        setLastRefreshed(new Date().toLocaleTimeString());
      } else {
        setError(data.error || 'Failed to load leads from Notion server.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error connecting to Notion API endpoint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(isDemoMode);
  }, [isDemoMode]);

  const totalLeads = leads.length;
  const newLeadsCount = leads.filter(l => l.status === 'New').length;
  const inProgressCount = leads.filter(l => l.status === 'Contacted' || l.status === 'Qualified').length;
  const closedCount = leads.filter(l => l.status === 'Closed').length;

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.interest.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      const matchesType = typeFilter === 'All' || lead.interest.toLowerCase().includes(typeFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leads, searchQuery, statusFilter, typeFilter]);

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Interest', 'Date Captured', 'Status', 'Budget'];
    const rows = filteredLeads.map(l => [
      `"${l.name}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${l.interest}"`,
      `"${l.dateCaptured}"`,
      `"${l.status}"`,
      `"${l.budget || 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mn-signal-leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">New</span>;
      case 'Contacted':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">Contacted</span>;
      case 'Qualified':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Qualified</span>;
      case 'Closed':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-100 text-zinc-800 border border-zinc-300">Closed</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-100 text-zinc-600">{status}</span>;
    }
  };

  return (
    <div className="flex h-screen bg-[#F3F3F0] text-[#111111] overflow-hidden font-sans">
      
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-black/5 p-6 z-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold text-lg shadow-md">
            MN
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight">MN SIGNAL</h1>
            <p className="text-xs text-[#777777]">Real Estate AI Hub</p>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-[#111111] text-white shadow-sm' : 'text-[#777777] hover:text-[#111111] hover:bg-black/5'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('leads')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'leads' ? 'bg-[#111111] text-white shadow-sm' : 'text-[#777777] hover:text-[#111111] hover:bg-black/5'}`}
          >
            <Users className="w-4 h-4" />
            All Leads
            <span className="ml-auto bg-black/10 text-xs px-2 py-0.5 rounded-full">{totalLeads}</span>
          </button>
          <button 
            onClick={() => setActiveTab('pipeline')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'pipeline' ? 'bg-[#111111] text-white shadow-sm' : 'text-[#777777] hover:text-[#111111] hover:bg-black/5'}`}
          >
            <GitPullRequest className="w-4 h-4" />
            Pipeline
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-[#111111] text-white shadow-sm' : 'text-[#777777] hover:text-[#111111] hover:bg-black/5'}`}
          >
            <SettingsIcon className="w-4 h-4" />
            Settings
          </button>
        </nav>

        <div className="pt-4 border-t border-black/5">
          <div className="p-3 rounded-xl bg-white/60 border border-black/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#777777]">DATA SOURCE</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${isDemoMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {isDemoMode ? 'Demo Mode' : 'Notion Mode'}
              </span>
            </div>
            <p className="text-xs text-[#777777] truncate">
              {isDemoMode ? 'Using fictional mock records' : 'Loading data from Notion'}
            </p>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden flex">
          <div className="w-64 bg-white h-full p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold text-sm">
                    MN
                  </div>
                  <h1 className="font-bold text-sm">MN SIGNAL</h1>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-[#777777]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-2">
                <button 
                  onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${activeTab === 'overview' ? 'bg-[#111111] text-white' : 'text-[#777777]'}`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Overview
                </button>
                <button 
                  onClick={() => { setActiveTab('leads'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${activeTab === 'leads' ? 'bg-[#111111] text-white' : 'text-[#777777]'}`}
                >
                  <Users className="w-4 h-4" /> All Leads
                </button>
                <button 
                  onClick={() => { setActiveTab('pipeline'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${activeTab === 'pipeline' ? 'bg-[#111111] text-white' : 'text-[#777777]'}`}
                >
                  <GitPullRequest className="w-4 h-4" /> Pipeline
                </button>
                <button 
                  onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${activeTab === 'settings' ? 'bg-[#111111] text-white' : 'text-[#777777]'}`}
                >
                  <SettingsIcon className="w-4 h-4" /> Settings
                </button>
              </nav>
            </div>
            <div className="text-xs text-[#777777] text-center pt-4 border-t border-black/5">
              MN Signal Real Estate v1.0
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        <header className="sticky top-0 z-10 glass-panel border-b border-black/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className="md:hidden p-2 rounded-xl glass-button text-[#111111]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#111111] capitalize">
                {activeTab === 'overview' ? 'Overview' : activeTab === 'leads' ? 'All Leads Directory' : activeTab === 'pipeline' ? 'Pipeline Snapshot' : 'Settings & Configuration'}
              </h2>
              <p className="text-xs text-[#777777]">
                {activeTab === 'overview' ? 'Real-time Tally & Notion lead monitoring' : activeTab === 'leads' ? 'Manage, search, and export real estate prospects' : activeTab === 'pipeline' ? 'Track lead progress across sales stages' : 'Configure data source and API integrations'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden lg:inline-block text-xs text-[#777777] bg-white/60 px-3 py-1.5 rounded-full border border-black/5">
              Updated: {lastRefreshed}
            </span>
            <button 
              onClick={() => fetchLeads()} 
              disabled={loading}
              className="glass-button px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 text-[#111111]"
              title="Refresh leads"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button 
              onClick={exportCSV}
              className="glass-button px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 text-[#111111]"
              title="Export filtered leads to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className="p-2 rounded-xl glass-button text-[#111111]"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        {error && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setIsDemoMode(true)} 
              className="text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-900 px-3 py-1.5 rounded-lg transition-colors"
            >
              Switch to Demo Mode
            </button>
          </div>
        )}

        <div className="p-6 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          
          {activeTab === 'overview' && (
            <>
              <div className="relative rounded-3xl bg-[#111111] text-white p-8 md:p-10 overflow-hidden shadow-xl">
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
                <div className="absolute right-32 bottom-[-50px] w-48 h-48 rounded-full bg-zinc-800/50 blur-2xl pointer-events-none"></div>

                <div className="relative z-10 max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-md border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    {isDemoMode ? 'Demo Mode Active (Fictional Data)' : 'Notion Database Connected'}
                  </div>

                  <h3 className="text-2xl md:text-4xl font-bold tracking-tight">
                    Welcome to MN Signal.
                  </h3>
                  
                  <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
                    Your Tally form submissions are automatically synced via Make.com into Notion and displayed here in real-time. Manage your real estate pipeline seamlessly.
                  </p>

                  <div className="pt-2 flex flex-wrap gap-4">
                    <div className="glass-card bg-white/10 border-white/10 px-4 py-3 rounded-2xl">
                      <p className="text-xs text-zinc-400">New This Month</p>
                      <p className="text-xl font-bold text-white">{newLeadsCount}</p>
                    </div>
                    <div className="glass-card bg-white/10 border-white/10 px-4 py-3 rounded-2xl">
                      <p className="text-xs text-zinc-400">Needing Follow-up</p>
                      <p className="text-xl font-bold text-white">{inProgressCount}</p>
                    </div>
                    <div className="glass-card bg-white/10 border-white/10 px-4 py-3 rounded-2xl">
                      <p className="text-xs text-zinc-400">Qualified Leads</p>
                      <p className="text-xl font-bold text-white">{leads.filter(l => l.status === 'Qualified').length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#777777]">Total Leads</p>
                    <h4 className="text-2xl font-bold text-[#111111] mt-1">{totalLeads}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-[#111111]">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#777777]">New Leads</p>
                    <h4 className="text-2xl font-bold text-blue-600 mt-1">{newLeadsCount}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#777777]">In-Progress</p>
                    <h4 className="text-2xl font-bold text-amber-600 mt-1">{inProgressCount}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#777777]">Closed Deals</p>
                    <h4 className="text-2xl font-bold text-emerald-600 mt-1">{closedCount}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-base">Recent Leads</h4>
                    <button 
                      onClick={() => setActiveTab('leads')}
                      className="text-xs font-semibold text-[#777777] hover:text-[#111111] flex items-center gap-1"
                    >
                      View all <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {leads.length === 0 ? (
                    <div className="py-12 text-center text-[#777777] text-sm">
                      No leads found in database.
                    </div>
                  ) : (
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-black/5 text-[11px] font-semibold text-[#777777] uppercase tracking-wider">
                            <th className="pb-3 font-semibold">Lead Name</th>
                            <th className="pb-3 font-semibold">Interest</th>
                            <th className="pb-3 font-semibold">Status</th>
                            <th className="pb-3 font-semibold text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 text-sm">
                          {leads.slice(0, 5).map(lead => (
                            <tr key={lead.id} className="hover:bg-black/[0.02] transition-colors">
                              <td className="py-3 font-medium text-[#111111]">
                                {lead.name}
                                <div className="text-xs text-[#777777] font-normal">{lead.email}</div>
                              </td>
                              <td className="py-3 text-xs text-[#777777]">{lead.interest}</td>
                              <td className="py-3">{getStatusBadge(lead.status)}</td>
                              <td className="py-3 text-xs text-[#777777] text-right">{lead.dateCaptured}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-base mb-4">Pipeline Distribution</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span className="text-[#777777]">New</span>
                          <span>{newLeadsCount} ({totalLeads ? Math.round((newLeadsCount/totalLeads)*100) : 0}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${totalLeads ? (newLeadsCount/totalLeads)*100 : 0}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span className="text-[#777777]">Contacted</span>
                          <span>{leads.filter(l => l.status === 'Contacted').length}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalLeads ? (leads.filter(l => l.status === 'Contacted').length/totalLeads)*100 : 0}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span className="text-[#777777]">Qualified</span>
                          <span>{leads.filter(l => l.status === 'Qualified').length}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalLeads ? (leads.filter(l => l.status === 'Qualified').length/totalLeads)*100 : 0}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span className="text-[#777777]">Closed</span>
                          <span>{closedCount}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden">
                          <div className="h-full bg-zinc-800 rounded-full" style={{ width: `${totalLeads ? (closedCount/totalLeads)*100 : 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-black/5">
                    <button 
                      onClick={() => setActiveTab('pipeline')}
                      className="w-full py-2.5 rounded-xl glass-button text-xs font-semibold text-[#111111]"
                    >
                      Open Full Pipeline Board
                    </button>
                  </div>
                </div>

              </div>
            </>
          )}

          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
                  <input 
                    type="text" 
                    placeholder="Search name, email, phone..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-[#777777]" />
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white/80 border border-black/10 text-xs font-medium text-[#111111] focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/80 border border-black/10 text-xs font-medium text-[#111111] focus:outline-none"
                  >
                    <option value="All">All Property Interests</option>
                    <option value="Buying">Buying</option>
                    <option value="Selling">Selling</option>
                    <option value="Commercial">Commercial</option>
                  </select>

                  {(searchQuery || statusFilter !== 'All' || typeFilter !== 'All') && (
                    <button 
                      onClick={() => { setSearchQuery(''); setStatusFilter('All'); setTypeFilter('All'); }}
                      className="text-xs text-[#777777] hover:text-[#111111] underline px-2"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden">
                {filteredLeads.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-black/5 mx-auto flex items-center justify-center text-[#777777]">
                      <Users className="w-6 h-6" />
                    </div>
                    <h5 className="font-bold text-base">No matching leads found</h5>
                    <p className="text-xs text-[#777777] max-w-sm mx-auto">
                      Try adjusting your search criteria or resetting filters to view all captured real estate inquiries.
                    </p>
                    <button 
                      onClick={() => { setSearchQuery(''); setStatusFilter('All'); setTypeFilter('All'); }}
                      className="px-4 py-2 bg-[#111111] text-white text-xs font-medium rounded-xl"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-black/5 bg-black/[0.02] text-[11px] font-semibold text-[#777777] uppercase tracking-wider">
                          <th className="py-3.5 px-6">Lead Name</th>
                          <th className="py-3.5 px-6">Contact Info</th>
                          <th className="py-3.5 px-6">Property Interest</th>
                          <th className="py-3.5 px-6">Budget</th>
                          <th className="py-3.5 px-6">Date Captured</th>
                          <th className="py-3.5 px-6">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 text-sm">
                        {filteredLeads.map(lead => (
                          <tr key={lead.id} className="hover:bg-black/[0.02] transition-colors">
                            <td className="py-4 px-6 font-semibold text-[#111111]">
                              {lead.name}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1.5 text-xs text-[#111111]">
                                <Mail className="w-3.5 h-3.5 text-[#777777]" /> {lead.email}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-[#777777] mt-0.5">
                                <Phone className="w-3.5 h-3.5" /> {lead.phone}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-xs text-[#777777] font-medium">
                              {lead.interest}
                            </td>
                            <td className="py-4 px-6 text-xs font-semibold text-[#111111]">
                              {lead.budget || 'Not specified'}
                            </td>
                            <td className="py-4 px-6 text-xs text-[#777777]">
                              {lead.dateCaptured}
                            </td>
                            <td className="py-4 px-6">
                              {getStatusBadge(lead.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <div className="glass-card rounded-2xl p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-black/5">
                    <span className="font-bold text-xs uppercase tracking-wider text-blue-600">New Submissions</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">
                      {leads.filter(l => l.status === 'New').length}
                    </span>
                  </div>
                  <div className="space-y-3 flex-1">
                    {leads.filter(l => l.status === 'New').map(lead => (
                      <div key={lead.id} className="p-3 rounded-xl bg-white/80 border border-black/5 shadow-sm space-y-2">
                        <div className="font-semibold text-xs text-[#111111]">{lead.name}</div>
                        <div className="text-[11px] text-[#777777]">{lead.interest}</div>
                        <div className="flex items-center justify-between text-[10px] text-[#777777] pt-1 border-t border-black/5">
                          <span>{lead.dateCaptured}</span>
                          <span className="font-semibold text-[#111111]">{lead.budget || 'No budget'}</span>
                        </div>
                      </div>
                    ))}
                    {leads.filter(l => l.status === 'New').length === 0 && (
                      <p className="text-xs text-[#777777] text-center py-8">No new leads</p>
                    )}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-black/5">
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-600">Contacted</span>
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
                      {leads.filter(l => l.status === 'Contacted').length}
                    </span>
                  </div>
                  <div className="space-y-3 flex-1">
                    {leads.filter(l => l.status === 'Contacted').map(lead => (
                      <div key={lead.id} className="p-3 rounded-xl bg-white/80 border border-black/5 shadow-sm space-y-2">
                        <div className="font-semibold text-xs text-[#111111]">{lead.name}</div>
                        <div className="text-[11px] text-[#777777]">{lead.interest}</div>
                        <div className="flex items-center justify-between text-[10px] text-[#777777] pt-1 border-t border-black/5">
                          <span>{lead.dateCaptured}</span>
                          <span className="font-semibold text-[#111111]">{lead.budget || 'No budget'}</span>
                        </div>
                      </div>
                    ))}
                    {leads.filter(l => l.status === 'Contacted').length === 0 && (
                      <p className="text-xs text-[#777777] text-center py-8">No contacted leads</p>
                    )}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-black/5">
                    <span className="font-bold text-xs uppercase tracking-wider text-emerald-600">Qualified</span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
                      {leads.filter(l => l.status === 'Qualified').length}
                    </span>
                  </div>
                  <div className="space-y-3 flex-1">
                    {leads.filter(l => l.status === 'Qualified').map(lead => (
                      <div key={lead.id} className="p-3 rounded-xl bg-white/80 border border-black/5 shadow-sm space-y-2">
                        <div className="font-semibold text-xs text-[#111111]">{lead.name}</div>
                        <div className="text-[11px] text-[#777777]">{lead.interest}</div>
                        <div className="flex items-center justify-between text-[10px] text-[#777777] pt-1 border-t border-black/5">
                          <span>{lead.dateCaptured}</span>
                          <span className="font-semibold text-[#111111]">{lead.budget || 'No budget'}</span>
                        </div>
                      </div>
                    ))}
                    {leads.filter(l => l.status === 'Qualified').length === 0 && (
                      <p className="text-xs text-[#777777] text-center py-8">No qualified leads</p>
                    )}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-black/5">
                    <span className="font-bold text-xs uppercase tracking-wider text-zinc-700">Closed Deals</span>
                    <span className="bg-zinc-200 text-zinc-800 text-xs px-2 py-0.5 rounded-full font-bold">
                      {closedCount}
                    </span>
                  </div>
                  <div className="space-y-3 flex-1">
                    {leads.filter(l => l.status === 'Closed').map(lead => (
                      <div key={lead.id} className="p-3 rounded-xl bg-white/80 border border-black/5 shadow-sm space-y-2">
                        <div className="font-semibold text-xs text-[#111111]">{lead.name}</div>
                        <div className="text-[11px] text-[#777777]">{lead.interest}</div>
                        <div className="flex items-center justify-between text-[10px] text-[#777777] pt-1 border-t border-black/5">
                          <span>{lead.dateCaptured}</span>
                          <span className="font-semibold text-[#111111]">{lead.budget || 'No budget'}</span>
                        </div>
                      </div>
                    ))}
                    {closedCount === 0 && (
                      <p className="text-xs text-[#777777] text-center py-8">No closed deals yet</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-[#111111]">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">Notion Integration & Data Source</h4>
                    <p className="text-xs text-[#777777]">Manage your live database connection</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-black/5 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 border border-black/5">
                    <div>
                      <p className="font-semibold text-sm">Demo Mode Preview</p>
                      <p className="text-xs text-[#777777]">Use simulated fictional real estate leads for testing UI design</p>
                    </div>
                    <button 
                      onClick={() => setIsDemoMode(!isDemoMode)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isDemoMode ? 'bg-[#111111] text-white shadow-sm' : 'glass-button text-[#111111]'}`}
                    >
                      {isDemoMode ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  {!isDemoMode && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                      <div className="font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        Notion Live Mode Selected
                      </div>
                      <p className="text-emerald-800 leading-relaxed">
                        The server API route (<code className="bg-emerald-100 px-1.5 py-0.5 rounded">/api/leads</code>) uses private Vercel environment variables (<code className="bg-emerald-100 px-1.5 py-0.5 rounded">NOTION_API_KEY</code> and <code className="bg-emerald-100 px-1.5 py-0.5 rounded">NOTION_DATABASE_ID</code>). If loading fails, check the connection and permissions. Secrets are not sent to browser code.
                      </p>
                    </div>
                  )}

                  {isDemoMode && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                      <div className="font-bold">To connect your live Notion database:</div>
                      <ol className="list-decimal list-inside space-y-1 text-amber-800">
                        <li>Create a Notion Integration at <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer" className="underline font-semibold">notion.so/my-integrations</a>.</li>
                        <li>Share your existing Tally leads database with your integration.</li>
                        <li>Add <code className="bg-amber-100 px-1 rounded">NOTION_API_KEY</code>, <code className="bg-amber-100 px-1 rounded">NOTION_DATABASE_ID</code>, <code className="bg-amber-100 px-1 rounded">DASHBOARD_USERNAME</code>, and <code className="bg-amber-100 px-1 rounded">DASHBOARD_PASSWORD</code> in Vercel Project Settings → Environment Variables, then redeploy.</li>
                        <li>Toggle Demo Mode off above to fetch live data!</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-[#111111]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">Workspace Settings</h4>
                    <p className="text-xs text-[#777777]">MN Signal Real Estate Agency Hub</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-black/5 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#777777] uppercase mb-1">Workspace Name</label>
                    <input 
                      type="text" 
                      defaultValue="MN Signal Real Estate AI" 
                      className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-black/10 text-sm font-medium focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#777777] uppercase mb-1">Workflow Pipeline</label>
                    <input 
                      type="text" 
                      disabled 
                      value="Tally Form → Make.com → Notion DB → MN Signal Dashboard" 
                      className="w-full px-4 py-2.5 rounded-xl bg-black/5 border border-black/10 text-sm font-medium text-[#777777] cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
