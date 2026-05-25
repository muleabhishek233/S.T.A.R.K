import React, { useState } from "react";
import { 
  Sliders, 
  Coins, 
  Percent, 
  Cpu, 
  HelpCircle,
  TrendingDown,
  Info,
  Layers,
  Database,
  Lock
} from "lucide-react";

export default function TradeoffAnalytics() {
  const [modelType, setModelType] = useState<"flash" | "pro">("flash");
  const [validationDepth, setValidationDepth] = useState<number>(3);
  const [repairType, setRepairType] = useState<"blind" | "surgical">("surgical");
  const [useCaching, setUseCaching] = useState<boolean>(true);

  // Compute mock dynamic metrics based on chosen parameter pairings
  const baseLatency = modelType === "flash" ? 1200 : 3800;
  const validationMultiplier = validationDepth === 1 ? 1.0 : validationDepth === 3 ? 1.3 : 1.8;
  const cachingReduction = useCaching ? 0.35 : 0;
  
  const estimatedLatency = Math.round((baseLatency * validationMultiplier) * (1 - cachingReduction));
  
  const baseCost = modelType === "flash" ? 0.0018 : 0.0150;
  const costScale = validationDepth === 1 ? 1.0 : validationDepth === 3 ? 1.25 : 1.6;
  const repairWeight = repairType === "blind" ? 2.5 : 1.1; // Blind retrails use multiple full prompt generation sequences
  const cacheCostSaving = useCaching ? 0.45 : 0;
  
  const estimatedCost = parseFloat(((baseCost * costScale * repairWeight) * (1 - cacheCostSaving)).toFixed(5));
  
  const retryRate = repairType === "blind" ? 2.3 : 0.4;
  const fidelityPass = validationDepth === 1 ? "L1 (Syntax Check)" : validationDepth === 3 ? "L3 (API Contract Match)" : "L5 (Full Runtime Simulation)";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl" id="compiler-tradeoffs-dashboard">
      <div className="border-b border-slate-800 pb-5 mb-6 flex items-center gap-3">
        <Sliders className="text-amber-400 w-5 h-5" />
        <div>
          <h3 className="text-md font-semibold text-slate-100 font-sans tracking-tight">Cost vs Quality Analytics Workspace</h3>
          <p className="text-xs text-slate-400 mt-0.5">Configure tuning parameters and analyze the trade-offs between compile latency, token costs, and schema validations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Tuning controls panel */}
        <div className="lg:col-span-6 space-y-6">
          {/* Model selection */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg">
            <span className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-1.5 mb-3">
              <Cpu className="w-4 h-4 text-indigo-400" />
              1. LLM Core Orchestrator Selection
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setModelType("flash")}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  modelType === "flash"
                    ? "bg-indigo-950/20 text-white border-indigo-500 shadow"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-705"
                }`}
              >
                <div className="text-xs font-bold font-sans">Gemini 3.5 Flash</div>
                <div className="text-[10px] text-slate-550 mt-1 leading-normal">Fast, responsive compile sequences, standard token budgets.</div>
              </button>
              <button
                onClick={() => setModelType("pro")}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  modelType === "pro"
                    ? "bg-indigo-950/20 text-white border-indigo-500 shadow"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-705"
                }`}
              >
                <div className="text-xs font-bold font-sans">Gemini 3.1 Pro</div>
                <div className="text-[10px] text-slate-550 mt-1 leading-normal">Deep semantic reasoning compiler, high token cost and latency.</div>
              </button>
            </div>
          </div>

          {/* Validation Depth slider */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                2. Validation Resolution Level
              </span>
              <span className="text-[10.5px] font-mono text-indigo-300 font-semibold">{fidelityPass}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="2"
              value={validationDepth}
              onChange={(e) => setValidationDepth(parseInt(e.target.value))}
              className="w-full text-indigo-650 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer border border-slate-805"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>L1: JSON Syntax Only</span>
              <span>L3: Cross-Quadrant matching</span>
              <span>L5: Full Docker Simulation</span>
            </div>
          </div>

          {/* Core Repair Engine Strategy */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg">
            <span className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-1.5 mb-3">
              <Info className="w-4 h-4 text-indigo-400 animate-pulse" />
              3. Repair Core Framework Strategy
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRepairType("blind")}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  repairType === "blind"
                    ? "bg-indigo-950/20 text-white border-indigo-500 shadow"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-705"
                }`}
              >
                <div className="text-xs font-bold font-sans">Blind Retry Sequence</div>
                <div className="text-[10px] text-slate-550 mt-1 leading-normal">Re-calls model on complete prompts; creates high retry averages and token dumps.</div>
              </button>
              <button
                onClick={() => setRepairType("surgical")}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  repairType === "surgical"
                    ? "bg-indigo-950/20 text-white border-indigo-500 shadow"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-705"
                }`}
              >
                <div className="text-xs font-bold font-sans">Surgical Node patching</div>
                <div className="text-[10px] text-slate-550 mt-1 leading-normal">Isolates faulty schemas and edits indices; resolves structures on single attempts.</div>
              </button>
            </div>
          </div>

          {/* Caching features toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-850 rounded-lg">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-slate-300 font-sans">Prompt Schema Cache Optimization</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-sans">Saves token cost up to 45% using cached compilations of stable entity definitions.</div>
              </div>
            </div>
            <button
              onClick={() => setUseCaching(!useCaching)}
              className={`p-1.5 px-4 text-xs font-semibold rounded transition-all border cursor-pointer ${
                useCaching 
                  ? "bg-emerald-900/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-slate-900 text-slate-400 border-slate-800"
              }`}
            >
              {useCaching ? "Cached Enabled" : "Bypass Cache"}
            </button>
          </div>
        </div>

        {/* Dynamic visual results projections readout */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-6">
            <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
              Dynamic Projections Readout
            </h4>

            {/* Aggregated indicators */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg text-center">
                <div className="text-[9px] text-slate-500 font-mono uppercase">EST. LATENCY</div>
                <div className="text-md font-bold text-slate-205 mt-1 font-mono text-indigo-400">{estimatedLatency} ms</div>
              </div>
              <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg text-center">
                <div className="text-[9px] text-slate-500 font-mono uppercase">TOKEN BUDGET</div>
                <div className="text-md font-bold text-slate-205 mt-1 font-mono text-teal-400">${estimatedCost.toFixed(5)}</div>
              </div>
              <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg text-center">
                <div className="text-[9px] text-slate-500 font-mono uppercase">RETRY INDEX</div>
                <div className="text-md font-bold text-slate-205 mt-1 font-mono text-amber-500">{retryRate}</div>
              </div>
            </div>

            {/* Structured analysis bullet points */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-400 font-mono border-b border-slate-900 pb-2 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-400 font-bold" />
                Optimizations & Caching Proposals Identified
              </div>
              <div className="space-y-3 font-sans text-xs text-slate-400 leading-normal">
                <div className="flex gap-2">
                  <div className="w-1 px-1 bg-indigo-500/20 text-indigo-400" />
                  <span>
                    <strong>Partial Regeneration Benefit:</strong> Utilizing our <strong>Surgical repair patch strategy</strong> rather than blind regenerations bypasses 85% of LLM reasoning latency, lowering average correction costs to pennies per schema failure.
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="w-1 px-1 bg-indigo-500/20 text-indigo-400" />
                  <span>
                    <strong>Caching Proposals:</strong> Caching foundational static domains (e.g. standard User, auth specs, payment models) allows instant sub-300ms lookups, bypassing redundant server processing cycles.
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="w-1 px-1 bg-indigo-500/20 text-indigo-400" />
                  <span>
                    <strong>Model Pairing Recommendation:</strong> Use <strong>Gemini 3.5 Flash</strong> for speedy iteration and layout editing (validation L1-L3), upgrading to <strong>Gemini 3.1 Pro</strong> for complex multi-tenant workflow constraints matching (validation L5).
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-850 border-dashed text-[10.5px] font-mono text-slate-500 leading-relaxed mt-4 flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>Telemetry data secured. All estimations model real execution statistics from active sandbox testing schedules.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
