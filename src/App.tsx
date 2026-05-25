import React, { useState } from "react";
import { 
  Layers, 
  Wrench, 
  Award, 
  Sliders, 
  Terminal, 
  CheckCircle,
  HelpCircle,
  Database,
  ShieldAlert,
  ListFilter,
  Play,
  Cpu,
  CornerDownRight,
  User,
  Info,
  Layout
} from "lucide-react";
import CompilerWorkspace from "./components/CompilerWorkspace";
import SchemaMatrix from "./components/SchemaMatrix";
import RepairPlayground from "./components/RepairPlayground";
import EvaluationSuite from "./components/EvaluationSuite";
import TradeoffAnalytics from "./components/TradeoffAnalytics";
import { 
  INITIAL_INTENT, 
  INITIAL_DESIGN, 
  INITIAL_SPEC, 
  INITIAL_LOGS, 
  INITIAL_REPORT 
} from "./data/initialState";
import { ApplicationSpecification, IntentIR, SystemDesignSpec, CompilerLog, ExecutionReport } from "./types";

type SidebarTabType = "workspace" | "playground" | "eval" | "tradeoffs";

export default function App() {
  const [activeTab, setActiveTab] = useState<SidebarTabType>("workspace");
  const [promptText, setPromptText] = useState("Build a CRM with login, contacts, dashboard, role-based access, subscriptions, payments, and admin analytics.");
  
  // Compiled state holds either pre-loaded default CRM or dynamic custom compilations
  const [compiledIntent, setCompiledIntent] = useState<IntentIR>(INITIAL_INTENT);
  const [compiledDesign, setCompiledDesign] = useState<SystemDesignSpec>(INITIAL_DESIGN);
  const [compiledSpec, setCompiledSpec] = useState<ApplicationSpecification>(INITIAL_SPEC);
  const [compiledLogs, setCompiledLogs] = useState<CompilerLog[]>(INITIAL_LOGS);
  const [executionReport, setExecutionReport] = useState<ExecutionReport>(INITIAL_REPORT);

  const handleCompilationComplete = (data: {
    intentIR: IntentIR;
    systemDesign: SystemDesignSpec;
    appSpec: ApplicationSpecification;
    logs: CompilerLog[];
    executionReport: ExecutionReport;
  }) => {
    setCompiledIntent(data.intentIR);
    setCompiledDesign(data.systemDesign);
    setCompiledSpec(data.appSpec);
    setCompiledLogs(data.logs);
    setExecutionReport(data.executionReport);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-red-500/30 selection:text-white">
      {/* Top Header Navigation bar */}
      <header className="border-b border-slate-850 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-lg shadow-red-950/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-600 via-red-500 to-amber-500 rounded-lg shadow-lg shadow-red-900/30 ring-1 ring-amber-400/30">
            <Cpu className="text-white w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider uppercase bg-gradient-to-r from-red-500 via-amber-450 to-yellow-400 bg-clip-text text-transparent flex items-center gap-2 drop-shadow-sm" id="header-brand-title">
              S.T.A.R.K. SYNTHESIS ENGINE
              <span className="text-[10px] uppercase font-mono font-black tracking-widest px-2 py-0.5 rounded bg-red-950/40 border border-red-500/40 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]">
                F.R.I.D.A.Y. CORE
              </span>
            </h1>
            <p className="text-[11px] text-amber-550/80 font-mono tracking-wide" id="header-subtitle">
              Multi-Stage Autonomous Blueprint compiler // Postgres • REST • React
            </p>
          </div>
        </div>

        {/* HUD Environmental metrics info */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded flex items-center gap-1.5 text-slate-400 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-cyan-400 block animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
            <span>Synthesis Node:</span>
            <strong className="text-slate-200">MARK-85.3 (Active)</strong>
          </div>
          <div className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded text-slate-400 invisible sm:flex items-center gap-1.5">
            <span>Arc Core Power:</span>
            <strong className="text-red-400 animate-pulse">100.0% STABLE</strong>
          </div>
        </div>
      </header>

      {/* Main Layout Screen Content Panel */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Vertical Navigation Menu Drawer */}
        <aside className="md:w-[260px] bg-slate-900 border-r border-slate-850 p-4 space-y-6 shrink-0">
          <div>
            <span className="text-[10px] font-bold text-slate-500 tracking-widest font-mono block uppercase px-3 mb-2.5">
              S.T.A.R.K. Control Rail
            </span>
            <nav className="space-y-1.5" id="nav-sidebar">
              {[
                { id: "workspace", label: "Compiler Workspace", icon: Layers, desc: "NL-to-Schema Multi-Stage" },
                { id: "playground", label: "Validator & Repairs", icon: Wrench, desc: "Surgical conflict patches" },
                { id: "eval", label: "Evaluation Suite", icon: Award, desc: "SaaS & Edge-case matrices" },
                { id: "tradeoffs", label: "Cost vs Quality Plan", icon: Sliders, desc: "Caching & model trade-offs" }
              ].map((nav) => {
                const Icon = nav.icon;
                const isActive = activeTab === nav.id;
                return (
                  <button
                    key={nav.id}
                    onClick={() => setActiveTab(nav.id as SidebarTabType)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-3 group cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-red-950/60 via-red-900/10 to-transparent text-white shadow-sm border-l-2 border-red-500"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/30"
                    }`}
                    id={`sidebar-tab-${nav.id}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? "text-red-400" : "text-slate-500 group-hover:text-amber-400 transition-colors"}`} />
                    <div>
                      <div className="text-xs font-semibold leading-none">{nav.label}</div>
                      <div className={`text-[10px] font-mono mt-1 ${isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-400"}`}>{nav.desc}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:block pt-6 border-t border-slate-850 space-y-4">
            <span className="text-[10px] font-bold text-slate-500 tracking-widest font-mono block uppercase px-3">
              Arc Diagnostics
            </span>
            <div className="space-y-2 px-3 text-xs leading-relaxed text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Tables:</span>
                <span className="text-slate-200 font-bold">{compiledSpec?.databaseSchema?.tables?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>API Ends:</span>
                <span className="text-slate-200 font-bold">{compiledSpec?.apiSchema?.endpoints?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>UI Router:</span>
                <span className="text-slate-200 font-bold">{compiledSpec?.uiSchema?.pages?.length || 0}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Active Viewport */}
        <main className="flex-1 bg-slate-950 p-6 md:p-8 overflow-y-auto space-y-8" id="viewport-active-root">
          {activeTab === "workspace" && (
            <div className="space-y-8 animate-fade-in">
              <CompilerWorkspace 
                onCompilationComplete={handleCompilationComplete}
                activePromptText={promptText}
                setActivePromptText={setPromptText}
              />
              
              {/* Dynamic Structured Specification View blocks */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Stage 1: Structured Intent Analysis HUD */}
                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 font-mono uppercase tracking-wider mb-4 border-b border-slate-800 pb-2.5 flex items-center gap-2">
                      <ListFilter className="w-4 h-4 text-indigo-400" />
                      1. Structured Intent IR
                    </h3>
                    <div className="space-y-4 font-sans text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block uppercase mb-1">Entities parsed</span>
                        <div className="flex flex-wrap gap-1.5">
                          {compiledIntent.entities.map((ent, idx) => (
                            <span key={idx} className="bg-slate-950 text-indigo-300 border border-slate-850 px-2 py-0.5 rounded font-mono text-[10.5px]">
                              {ent}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block uppercase mb-1.5">Capabilities targeted</span>
                        <ul className="space-y-1 text-slate-300 list-disc list-inside">
                          {compiledIntent.features.slice(0, 4).map((f, idx) => (
                            <li key={idx} className="truncate">{f}</li>
                          ))}
                        </ul>
                      </div>
                      {compiledIntent.workflows.length > 0 && (
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block uppercase mb-1.5">Extracted workflow graph</span>
                          <div className="space-y-1.5 pl-2 border-l border-indigo-950">
                            <div className="font-semibold text-slate-200 truncate">{compiledIntent.workflows[0].name}</div>
                            <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-400 mt-1">
                              {compiledIntent.workflows[0].steps.slice(0, 3).map((st, sIdx) => (
                                <React.Fragment key={sIdx}>
                                  <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-850 truncate max-w-[100px]">{st}</span>
                                  {sIdx < 2 && <span>{'→'}</span>}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950 rounded p-3 text-[10px] font-mono text-slate-550 border border-slate-850 mt-4 leading-normal flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Intent matrices are parsed deterministically into strict schemas.</span>
                  </div>
                </div>

                {/* Stage 2: Architectural System design spec */}
                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 font-mono uppercase tracking-wider mb-4 border-b border-slate-800 pb-2.5 flex items-center gap-2">
                      <Layout className="w-4 h-4 text-indigo-400" />
                      2. System Architecture spec
                    </h3>
                    <div className="space-y-4 font-sans text-xs text-slate-350">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block uppercase mb-1">Frontend layout structure</span>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex flex-col gap-1 text-[11px]">
                          <div><strong>Frame Pattern:</strong> {compiledDesign.frontendArchitecture.pattern}</div>
                          <div><strong>State Store:</strong> {compiledDesign.frontendArchitecture.stateManagement}</div>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block uppercase mb-1">Backend target models</span>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex flex-col gap-1 text-[11px]">
                          <div><strong>Stack Framework:</strong> {compiledDesign.backendArchitecture.framework}</div>
                          <div><strong>Data engine:</strong> {compiledDesign.backendArchitecture.database}</div>
                        </div>
                      </div>
                      {compiledDesign.serviceBoundaries.length > 0 && (
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block uppercase mb-1.5">Micro-service bounds</span>
                          <div className="space-y-1 bg-slate-950 p-2 py-1.5 rounded border border-slate-850 text-[11px] font-mono">
                            <div className="text-indigo-300 font-medium">{compiledDesign.serviceBoundaries[0].name}</div>
                            <div className="text-slate-500 text-[10px] truncate">{compiledDesign.serviceBoundaries[0].responsibility}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950 rounded p-3 text-[10px] font-mono text-slate-550 border border-slate-850 mt-4 leading-normal">
                    Fidelity lock: Matrix matches access controls implicitly to routes.
                  </div>
                </div>

                {/* Docker Execution Sandbox report */}
                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 font-mono uppercase tracking-wider mb-4 border-b border-slate-800 pb-2.5 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      Virtual Runtime Container
                    </h3>
                    <div className="space-y-4 font-mono text-xs">
                      <div className="flex justify-between items-center bg-slate-950/60 p-2.5 border border-slate-850 rounded">
                        <span className="text-slate-550 uppercase text-[10px]">Docker Container:</span>
                        <span className="text-emerald-400 font-bold uppercase animate-pulse">Running</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded text-[10.5px] border border-slate-850 max-h-[140px] overflow-y-auto space-y-2 text-slate-400 leading-normal scrollbar-none" id="docker-logs-flex">
                        {executionReport.containerLogs.map((log, index) => (
                          <div key={index} className="truncate">
                            <span className="text-slate-600 mr-2">❯</span>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] font-mono">
                    <span className="text-slate-500">Validation pass rate:</span>
                    <strong className="text-emerald-400">{executionReport.validationPassRate}% Passing</strong>
                  </div>
                </div>
              </div>

              {/* Comprehensive 4Quadrant Schema visual matrix */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Database className="text-indigo-400 w-5 h-5" />
                  <span className="text-md font-semibold text-slate-200">Active Specification Blueprints (Compiled)</span>
                </div>
                <SchemaMatrix appSpec={compiledSpec} />
              </div>
            </div>
          )}

          {activeTab === "playground" && <RepairPlayground />}
          {activeTab === "eval" && <EvaluationSuite />}
          {activeTab === "tradeoffs" && <TradeoffAnalytics />}
        </main>
      </div>

      {/* Humble aesthetic footer */}
      <footer className="border-t border-slate-850 px-6 py-4 bg-slate-900/40 text-center text-xs font-mono text-slate-500">
        AI Software Compiler Runtime // Deterministic multi-stage code translation pass. Secure, certified.
      </footer>
    </div>
  );
}
