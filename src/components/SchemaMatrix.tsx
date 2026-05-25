import React, { useState } from "react";
import { 
  Database, 
  Send, 
  Layout, 
  Shield, 
  Key, 
  Link2, 
  ExternalLink,
  Code2
} from "lucide-react";
import { ApplicationSpecification } from "../types";

interface SchemaMatrixProps {
  appSpec: ApplicationSpecification;
}

type TabType = "database" | "api" | "ui" | "auth";

export default function SchemaMatrix({ appSpec }: SchemaMatrixProps) {
  const [activeTab, setActiveTab] = useState<TabType>("database");

  const renderDatabaseTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-300 font-mono">Relational Datastore Spec (PostgreSQL)</h4>
          <span className="text-[10px] bg-slate-950 text-indigo-400 border border-indigo-400/20 px-2.5 py-1 rounded font-mono">
            Tables count: {appSpec.databaseSchema.tables.length}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="db-tables-flex">
          {appSpec.databaseSchema.tables.map((table) => (
            <div key={table.name} className="bg-slate-950 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-all flex flex-col justify-between" id={`table-card-${table.name}`}>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-slate-200 font-sans tracking-tight">{table.name}</span>
                </div>
                
                {/* Columns */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="grid grid-cols-3 text-slate-500 pb-1 border-b border-slate-850/60 font-semibold uppercase text-[10px]">
                    <span>Column</span>
                    <span>Type</span>
                    <span>Constraints</span>
                  </div>
                  {table.columns.map((c) => (
                    <div key={c.name} className="grid grid-cols-3 py-1 text-slate-300 border-b border-slate-900/40">
                      <span className="font-medium text-slate-200">{c.name}</span>
                      <span className="text-indigo-300">{c.type}</span>
                      <span className="text-slate-400 truncate">{c.constraints?.join(", ") || "---"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relations & Indexes Footer summary */}
              {(table.relations.length > 0 || (table.indexes && table.indexes.length > 0)) && (
                <div className="mt-4 pt-3 border-t border-slate-900 flex flex-col gap-2 text-[11px] font-mono">
                  {table.relations.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-400">
                      <Link2 className="w-3 h-3 text-indigo-400" />
                      <span>Relation: </span>
                      <span className="text-slate-200">{r.column}</span>
                      <span>{'->'}</span>
                      <span className="text-slate-200 font-semibold">{r.referencesTable}({r.referencesColumn})</span>
                    </div>
                  ))}
                  {table.indexes && table.indexes.map((idxName, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-[10px] text-slate-500">
                      <span>Index:</span>
                      <span className="text-slate-400">{idxName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderApiTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-300 font-mono">Express REST Endpoint Contracts</h4>
          <span className="text-[10px] bg-slate-950 text-indigo-400 border border-indigo-400/20 px-2.5 py-1 rounded font-mono">
            Endpoints: {appSpec.apiSchema.endpoints.length}
          </span>
        </div>
        <div className="space-y-4" id="api-endpoints-stack">
          {appSpec.apiSchema.endpoints.map((ep, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-all" id={`api-ep-${idx}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded font-mono tracking-wider ${
                    ep.method === "GET" ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" :
                    ep.method === "POST" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                    ep.method === "PUT" ? "bg-amber-500/15 text-amber-500 border border-amber-500/20" :
                    "bg-rose-500/15 text-rose-500 border border-rose-500/20"
                  }`}>
                    {ep.method}
                  </span>
                  <span className="text-sm font-semibold text-slate-200 font-mono">{ep.path}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono bg-slate-900 border border-slate-850 px-3 py-1 rounded">
                  <Shield className="w-3 h-3 text-indigo-400" />
                  <span>Auth:</span>
                  <span className="text-slate-200 font-semibold">
                    {ep.authRequirements.rbac.length > 0 ? ep.authRequirements.rbac.join(", ") : "Public"}
                  </span>
                </div>
              </div>

              {/* API Contract Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ep.requestBodySchema && (
                  <div className="bg-slate-900/60 rounded p-3.5 border border-slate-850/40">
                    <div className="text-[10px] font-semibold text-slate-500 font-mono uppercase mb-2">Request Payload (JSON)</div>
                    <pre className="text-xs text-indigo-200 font-mono leading-relaxed max-height-[180px] overflow-y-auto">
                      {JSON.stringify(ep.requestBodySchema, null, 2)}
                    </pre>
                  </div>
                )}
                <div className={`bg-slate-900/60 rounded p-3.5 border border-slate-850/40 ${!ep.requestBodySchema ? "md:col-span-2" : ""}`}>
                  <div className="text-[10px] font-semibold text-slate-500 font-mono uppercase mb-2">Response Contract (200 OK)</div>
                  <pre className="text-xs text-emerald-300 font-mono leading-relaxed max-height-[180px] overflow-y-auto">
                    {JSON.stringify(ep.responseContract, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUiTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-300 font-mono">React Screen Router layout Map</h4>
          <span className="text-[10px] bg-slate-950 text-indigo-400 border border-indigo-400/20 px-2.5 py-1 rounded font-mono">
            Pages count: {appSpec.uiSchema.pages.length}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="ui-pages-flex">
          {appSpec.uiSchema.pages.map((page) => (
            <div key={page.route} className="bg-slate-950 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-all" id={`ui-page-${page.route.replace(/\//g, '-')}`}>
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-900">
                <div className="flex items-center gap-2.5">
                  <Layout className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-slate-200 font-sans tracking-tight">{page.route}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 capitalize bg-slate-900 border border-slate-850 px-2 py-0.5 rounded">
                  Shell: {page.layout}
                </span>
              </div>

              {/* Components list */}
              <div className="space-y-3">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">Layout widgets</div>
                {page.components.map((comp, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-850/40 rounded p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{comp.name}</span>
                      <span className="text-[9px] uppercase font-mono bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded">
                        {comp.type}
                      </span>
                    </div>
                    {/* Component bindings */}
                    <div className="flex flex-col gap-1 text-[10px] font-mono text-slate-400 mt-1">
                      {comp.bindings.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-1.5">
                          <ExternalLink className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Data bind: </span>
                          <span className="text-slate-300 font-semibold">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAuthTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-300 font-mono">RBAC Security Matrices & Gating Policies</h4>
          <span className="text-[10px] bg-slate-950 text-indigo-400 border border-indigo-400/20 px-2.5 py-1 rounded font-mono">
            Roles defined: {appSpec.authSchema.rolesConfig.length}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="auth-roles-grid">
          {appSpec.authSchema.rolesConfig.map((item) => (
            <div key={item.role} className="bg-slate-950 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-all flex flex-col justify-between" id={`auth-role-${item.role}`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200 font-sans tracking-tight">{item.role}</span>
                  </div>
                  {item.premiumGating && (
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded font-bold font-mono text-amber-400 bg-amber-500/10 border border-amber-500/25 animate-pulse">
                      premium tier only
                    </span>
                  )}
                </div>

                {/* Permissions lists */}
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-500 font-mono uppercase mb-1.5">Operations permissions</div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.permissions.map((p, idx) => (
                        <span key={idx} className="bg-slate-900 text-slate-300 border border-slate-850 text-[10px] font-mono px-2 py-0.5 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* UI Route checks */}
                  <div>
                    <div className="text-[10px] font-semibold text-slate-500 font-mono uppercase mb-1.5">UI Route guards</div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.routeGuards.map((g, idx) => (
                        <span key={idx} className="bg-indigo-950/20 text-indigo-400 border border-indigo-900/30 text-[10px] font-mono px-2 py-0.5 rounded">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* API guards footer check */}
              <div className="border-t border-slate-900 mt-4 pt-3 text-[10.5px] font-mono text-slate-400 flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                <span>API protection rules: </span>
                <span className="text-slate-300">{item.apiGuards.join(", ") || "---"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl" id="schema-matrix-container">
      {/* Horizontal Tabs selector */}
      <div className="bg-slate-950/60 p-2 flex flex-wrap gap-2 border-b border-slate-850">
        {[
          { key: "database", label: "Relational Database", icon: Database },
          { key: "api", label: "API Endpoints", icon: Send },
          { key: "ui", label: "UI Route Layouts", icon: Layout },
          { key: "auth", label: "RBAC Security Gating", icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-indigo-650 text-white shadow-md border-b-2 border-indigo-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
              }`}
              id={`tab-spec-${tab.key}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-6">
        {activeTab === "database" && renderDatabaseTab()}
        {activeTab === "api" && renderApiTab()}
        {activeTab === "ui" && renderUiTab()}
        {activeTab === "auth" && renderAuthTab()}
      </div>
    </div>
  );
}
