import React, { useState } from "react";
import { 
  Play, 
  Terminal, 
  Database, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Cpu, 
  Layers, 
  ShieldAlert, 
  Settings, 
  Clock, 
  DollarSign, 
  Sparkles,
  FileText
} from "lucide-react";
import { SAAS_PROMPTS, EDGE_PROMPTS, SystemPrompt } from "../data/prompts";
import { CompilerLog, ApplicationSpecification, IntentIR, SystemDesignSpec, ExecutionReport } from "../types";

interface CompilerWorkspaceProps {
  onCompilationComplete: (data: {
    intentIR: IntentIR;
    systemDesign: SystemDesignSpec;
    appSpec: ApplicationSpecification;
    logs: CompilerLog[];
    metrics: {
      latencyMs: number;
      retries: number;
      repairSuccessRate: number;
      tokenCostEstimate: number;
    };
    executionReport: ExecutionReport;
  }) => void;
  activePromptText: string;
  setActivePromptText: (text: string) => void;
}

export default function CompilerWorkspace({ 
  onCompilationComplete, 
  activePromptText, 
  setActivePromptText 
}: CompilerWorkspaceProps) {
  const [isCompiling, setIsCompiling] = useState(false);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [logs, setLogs] = useState<CompilerLog[]>([]);
  const [cost, setCost] = useState<number>(0);
  const [latency, setLatency] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<"saas" | "edge">("saas");
  const [activeModel, setActiveModel] = useState<string>("gemini-3.5-flash");

  const promptsList = selectedCategory === "saas" ? SAAS_PROMPTS : EDGE_PROMPTS;

  const handleSelectTemplate = (p: SystemPrompt) => {
    setActivePromptText(p.promptText);
  };

  const executeCompilation = async () => {
    if (!activePromptText.trim()) return;

    setIsCompiling(true);
    setLogs([]);
    setCurrentStage("Initializing Pipeline");
    
    // Setup streaming UI stages for user sensory connection to the compiler pipeline
    const stages = [
      { name: "Intent Extraction", duration: 700, log: "Parsing natural language; mapping entities and workflows..." },
      { name: "System Design", duration: 900, log: "Synthesizing domain boundaries and access control rules..." },
      { name: "Schema Generation", duration: 1000, log: "Compiling into relational database structures..." },
      { name: "Validation Engine", duration: 600, log: "Evaluating schema constraints and foreign key references..." },
      { name: "Repair Pass", duration: 600, log: "Applying targeted dependency alignments..." },
      { name: "Sandbox Simulation", duration: 1100, log: "Provisioning environment; compiling backend Express routes..." }
    ];

    let fakeLogs: CompilerLog[] = [
      { id: "log-1", timestamp: new Date().toISOString(), stage: "Pipeline", type: "info", message: "AI Software Compiler pipeline initialized." }
    ];
    setLogs([...fakeLogs]);

    // Fast-cycle logs simulation on the frontend while server call executes
    for (const st of stages) {
      setCurrentStage(st.name);
      fakeLogs.push({
        id: `fake-st-${st.name}`,
        timestamp: new Date().toISOString(),
        stage: st.name,
        type: "info",
        message: st.log
      });
      setLogs([...fakeLogs]);
      await new Promise(r => setTimeout(r, st.duration * 0.15)); // Accelerated speed to align with server latency
    }

    try {
      const response = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: activePromptText })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setLogs(data.logs || []);
        setCost(data.metrics.tokenCostEstimate);
        setLatency(data.metrics.latencyMs);
        onCompilationComplete(data);
      } else {
        throw new Error(data.error || "Internal compilation error.");
      }
    } catch (err: any) {
      setLogs(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          timestamp: new Date().toISOString(),
          stage: "Orchestrator",
          type: "error",
          message: `Pipeline halted: ${err.message}`
        }
      ]);
    } finally {
      setIsCompiling(false);
      setCurrentStage(null);
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "success": return "text-emerald-400 font-medium";
      case "warning": return "text-amber-400 font-medium";
      case "error": return "text-rose-400 font-bold";
      default: return "text-slate-300";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="compiler-workspace">
      {/* Requirements Input Area */}
      <div className="lg:col-span-7 flex flex-col gap-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Layers className="text-indigo-400 w-5 h-5" id="workspace-layers-icon" />
            <h2 className="text-lg font-semibold text-slate-100 font-sans tracking-tight">Compiler Workspace</h2>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectedCategory("saas")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                selectedCategory === "saas" 
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="category-saas"
            >
              Requirements Catalog
            </button>
            <button
              onClick={() => setSelectedCategory("edge")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                selectedCategory === "edge" 
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="category-edge"
            >
              Extreme Edge Cases
            </button>
          </div>
        </div>

        {/* Templates Selection Horizontal Scroll */}
        <div>
          <label className="text-xs text-slate-400 block mb-2 font-mono" id="label-requirements-source">
            Requirement Blueprints (select to apply)
          </label>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x" id="blueprints-grid">
            {promptsList.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectTemplate(p)}
                className="snap-start text-left min-w-[200px] w-[200px] bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-3 rounded-lg transition-all shrink-0 cursor-pointer"
                id={`blueprint-${p.id}`}
              >
                <div className="text-xs font-medium text-slate-200 truncate">{p.name}</div>
                <div className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-normal">{p.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Rich Input Panel */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs text-slate-400 font-mono" htmlFor="requirements-compiler-input">
              NL Product Requirements (Input Specification)
            </label>
            <span className="text-[10px] text-indigo-400 font-mono">100% Deterministic Engine</span>
          </div>
          <textarea
            id="requirements-compiler-input"
            value={activePromptText}
            onChange={(e) => setActivePromptText(e.target.value)}
            placeholder="Type your product specification requirements (e.g. 'Build a CRM with logins, payments, and admin dashboards...')"
            className="flex-1 min-h-[180px] bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-200 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
        </div>

        {/* Compiler Dashboard Control Rail */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-500" />
            <div className="text-xs text-slate-400 font-mono">
              Compiler Target: <span className="text-indigo-400">{activeModel}</span>
            </div>
          </div>
          
          <button
            onClick={executeCompilation}
            disabled={isCompiling || !activePromptText.trim()}
            className={`w-full py-3 px-5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isCompiling
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg focus:ring-2 focus:ring-indigo-500/50"
            }`}
            id="compile-pipeline-trigger"
          >
            {isCompiling ? (
              <>
                <svg className="animate-spin h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Compiling Stage: {currentStage}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Compile Specification</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Compiler logs, metrics, pipeline execution trace */}
      <div className="lg:col-span-5 flex flex-col gap-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="text-indigo-400 w-5 h-5 animate-pulse" />
              <h3 className="text-md font-semibold text-slate-200">Execution Trace</h3>
            </div>
            {isCompiling && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            )}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-md">
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-mono">LATENCY</div>
              <div className="text-sm font-semibold text-slate-200 font-mono">
                {latency > 0 ? `${latency} ms` : "---"}
              </div>
            </div>
          </div>
          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-md">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-mono">TOKEN COST</div>
              <div className="text-sm font-semibold text-slate-200 font-mono">
                {cost > 0 ? `$${cost.toFixed(6)}` : "---"}
              </div>
            </div>
          </div>
        </div>

        {/* Compiler logs trace terminal */}
        <div className="flex-1 flex flex-col bg-slate-950 border border-slate-850 rounded-lg overflow-hidden min-h-[220px]">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-850 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-mono text-slate-400">Terminal Trace Diagnostics</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[300px] font-mono text-xs space-y-2.5" id="logs-container">
            {logs.length === 0 ? (
              <div className="text-slate-600 text-center py-12">
                Compiler idle. Input requirements and run compilation to start pipeline logs trace...
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-2.5 leading-normal">
                  <span className="text-slate-600 shrink-0 select-none">
                    [{log.timestamp.slice(14, 19)}]
                  </span>
                  <span className="text-indigo-400 font-semibold uppercase shrink-0">
                    [{log.stage}]
                  </span>
                  <span className={getLogTypeColor(log.type)}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Compilation Status Checklist HUD */}
        <div className="bg-slate-950/40 rounded-lg p-4 border border-slate-800 text-xs">
          <div className="text-slate-400 font-semibold mb-3 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Pipeline Compiler Stages Validation Pass
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-slate-300">
            {[
              { label: "Intent Parsing Model", state: logs.some(l => l.stage === "Intent Extractor" && l.type === "success") },
              { label: "Design Synthesis boundary", state: logs.some(l => l.stage === "System Design Layer" && l.type === "success") },
              { label: "4-Quadrant Schemas lock", state: logs.some(l => l.stage === "Schema Generator" && l.type === "success") },
              { label: "Validation Engine Check", state: logs.some(l => l.stage === "Validation Engine" && l.type === "success") },
              { label: "Targeted Node Repairs", state: logs.some(l => l.stage === "Repair Engine" && l.type === "success") || logs.some(l => l.stage === "Validation Engine" && l.type === "success") },
              { label: "Environment Compiles", state: logs.some(l => l.stage === "Runtime Simulator" && l.type === "success") }
            ].map((check, index) => (
              <div key={index} className="flex items-center gap-2 font-sans">
                {check.state ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border-2 border-slate-800 shrink-0" />
                )}
                <span className={check.state ? "text-slate-200" : "text-slate-500"}>{check.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
