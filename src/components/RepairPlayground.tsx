import React, { useState } from "react";
import { 
  ShieldAlert, 
  Wrench, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  CornerDownRight, 
  Shuffle, 
  Terminal,
  Activity,
  ThumbsUp
} from "lucide-react";
import { ApplicationSpecification, ValidationError, RepairAction } from "../types";

// Base CRM layout specs to revert or inject defects into
const SAFE_CRM_SPEC: ApplicationSpecification = {
  databaseSchema: {
    tables: [
      {
        name: "contacts",
        columns: [
          { name: "id", type: "UUID", constraints: ["PRIMARY KEY"] },
          { name: "first_name", type: "VARCHAR(128)", constraints: ["NOT NULL"] },
          { name: "last_name", type: "VARCHAR(128)", constraints: ["NOT NULL"] },
          { name: "email", type: "VARCHAR(255)", constraints: ["NOT NULL"] },
          { name: "agent_id", type: "UUID", constraints: ["NOT NULL"] }
        ],
        relations: [{ column: "agent_id", referencesTable: "users", referencesColumn: "id" }]
      },
      {
        name: "deals",
        columns: [
          { name: "id", type: "UUID", constraints: ["PRIMARY KEY"] },
          { name: "contact_id", type: "UUID", constraints: ["NOT NULL"] },
          { name: "deal_title", type: "VARCHAR(255)", constraints: ["NOT NULL"] },
          { name: "deal_value", type: "DECIMAL(12,2)" }
        ],
        relations: [{ column: "contact_id", referencesTable: "contacts", referencesColumn: "id" }]
      }
    ]
  },
  apiSchema: {
    endpoints: [
      {
        path: "/api/contacts",
        method: "POST",
        requestBodySchema: { first_name: { type: "string" }, last_name: { type: "string" }, email: { type: "string" }, user_id: { type: "string" } },
        responseContract: { id: "string" },
        authRequirements: { rbac: ["Admin", "SalesAgent"] },
        errorContracts: [{ statusCode: 400, payload: { error: "Bad Request" } }]
      },
      {
        path: "/api/deals",
        method: "POST",
        requestBodySchema: { contact_id: { type: "string" }, title: { type: "string" } },
        responseContract: { id: "string" },
        authRequirements: { rbac: ["Admin", "SalesAgent"] },
        errorContracts: [{ statusCode: 400, payload: { error: "Validation failure" } }]
      }
    ]
  },
  uiSchema: {
    pages: [
      {
        route: "/dashboard",
        layout: "dashboard",
        components: [
          { name: "ContactsTable", type: "table", bindings: ["/api/contacts"] }
        ]
      }
    ]
  },
  authSchema: {
    rolesConfig: [
      {
        role: "Admin",
        permissions: ["manage"],
        routeGuards: ["/dashboard"],
        apiGuards: ["/api/contacts"],
        premiumGating: true
      },
      {
        role: "SalesAgent",
        permissions: ["write"],
        routeGuards: ["/dashboard"],
        apiGuards: ["/api/contacts"],
        premiumGating: false
      }
    ]
  }
};

export default function RepairPlayground() {
  const [activeSpec, setActiveSpec] = useState<ApplicationSpecification>(JSON.parse(JSON.stringify(SAFE_CRM_SPEC)));
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [repairActions, setRepairActions] = useState<RepairAction[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [defectType, setDefectType] = useState<string>("none");

  const executeManualValidate = (spec: ApplicationSpecification) => {
    // Client-side quick compiler validation
    const errors: ValidationError[] = [];
    const dbTables = new Set(spec.databaseSchema.tables.map(t => t.name));
    const tableColumns: Record<string, Set<string>> = {};
    spec.databaseSchema.tables.forEach(t => {
      tableColumns[t.name] = new Set(t.columns.map(c => c.name));
    });

    const apiRawPaths = new Set(spec.apiSchema.endpoints.map(e => e.path));

    // UI broken references check
    spec.uiSchema.pages.forEach(page => {
      page.components.forEach(comp => {
        comp.bindings.forEach(binding => {
          if (binding.startsWith("/api/") && !apiRawPaths.has(binding)) {
            errors.push({
              id: `play-ui-broken-${binding.replace(/\//g, '-')}`,
              stage: 'cross-consistency',
              type: 'broken_reference',
              message: `UI Layout error: Component '${comp.name}' binds to API endpoint '${binding}' which does not exist in API endpoints contracts.`,
              field: 'bindings',
              reference: binding,
              affectedNodes: [`UI page layout: ${page.route}`]
            });
          }
        });
      });
    });

    // Auth RBAC references check
    const roles = new Set(spec.authSchema.rolesConfig.map(r => r.role));
    spec.apiSchema.endpoints.forEach(endpoint => {
      endpoint.authRequirements.rbac.forEach(role => {
        if (!roles.has(role)) {
          errors.push({
            id: `play-auth-conflict-${role}`,
            stage: 'auth',
            type: 'permission_conflict',
            message: `RBAC mismatch error: API endpoint '${endpoint.method} ${endpoint.path}' requires guard role '${role}', but roles list fails to define this profile.`,
            field: 'rbac',
            reference: role,
            affectedNodes: [`Endpoint: ${endpoint.path}`]
          });
        }
      });
    });

    // API-to-DB Column mismatches check
    spec.apiSchema.endpoints.forEach(endpoint => {
      if (endpoint.path.includes("deals") && endpoint.method === "POST" && endpoint.requestBodySchema?.title) {
        if (dbTables.has("deals") && !tableColumns["deals"].has("title") && tableColumns["deals"].has("deal_title")) {
          errors.push({
            id: `play-db-mismatch-title`,
            stage: 'cross-consistency',
            type: 'type_mismatch',
            message: `Relational column conflict: API body parameter 'title' is trying to bind to table 'deals', but SQL table column is defined as 'deal_title'.`,
            field: 'requestBodySchema',
            reference: 'database.deals.deal_title',
            affectedNodes: ["API Schema", "Relational Datastore deals table"]
          });
        }
      }
      if (endpoint.path.includes("contacts") && endpoint.method === "POST" && endpoint.requestBodySchema?.user_id) {
        if (dbTables.has("contacts") && !tableColumns["contacts"].has("user_id") && tableColumns["contacts"].has("agent_id")) {
          errors.push({
            id: `play-db-mismatch-user_id`,
            stage: 'cross-consistency',
            type: 'type_mismatch',
            message: `Index assignment conflict: API post parameter 'user_id' maps to contacts index, but relational index foreign key is labeled 'agent_id'.`,
            field: 'requestBodySchema',
            reference: 'database.contacts.agent_id',
            affectedNodes: ["API Schema", "Relational Datastore contacts table"]
          });
        }
      }
    });

    return errors;
  };

  const handleInjectDefect = (type: string) => {
    setDefectType(type);
    setRepairActions([]);
    const freshSpec = JSON.parse(JSON.stringify(SAFE_CRM_SPEC)) as ApplicationSpecification;
    let desc = "";

    if (type === "columns_mismatch") {
      // Injects deals API title parameter mismatch + user_id mapping mismatch in contacts
      freshSpec.apiSchema.endpoints[1].requestBodySchema = { contact_id: { type: "string" }, title: { type: "string" } };
      freshSpec.apiSchema.endpoints[0].requestBodySchema = { first_name: { type: "string" }, last_name: { type: "string" }, email: { type: "string" }, user_id: { type: "string" } };
      desc = "Defect Loaded: Mapped API schema properties ('deals.title' and 'contacts.user_id') to non-matching DB indices.";
    } else if (type === "broken_bindings") {
      // Modifies UI page bindings to lookup custom endpoint
      freshSpec.uiSchema.pages[0].components[0].bindings = ["/api/custom_contacts_not_found"];
      desc = "Defect Loaded: Assigned widget Table data binding to nonexistent routing endpoint path (/api/custom_contacts_not_found).";
    } else if (type === "rbac_conflict") {
      // Demands a non-existing SeniorSalesAdmin role in auth gates
      freshSpec.apiSchema.endpoints[0].authRequirements.rbac = ["SeniorSalesAdmin", "Admin"];
      desc = "Defect Loaded: Infused restricted API endpoint access guard with role profile 'SeniorSalesAdmin' which is unmapped in authorization sheets.";
    } else {
      desc = "Clean State Loaded: All components synchronized perfectly on target layouts.";
    }

    const errors = executeManualValidate(freshSpec);
    setActiveSpec(freshSpec);
    setValidationErrors(errors);
    
    setTerminalLogs([
      `[vOS] Loading sandbox schemas configuration...`,
      `[vOS] ${desc}`,
      `[vOS] Running Compiler consistency validation locks...`,
      errors.length > 0 
        ? `[CRITICAL_ERRORS] Validation failed! Identified ${errors.length} cross-schema reference breaking elements.`
        : `[SUCCESS] Validation complete. All schemas sealed 100% green.`
    ]);
  };

  const handleTriggerRepairEngine = async () => {
    if (validationErrors.length === 0) return;

    setIsCompiling(true);
    setTerminalLogs(prev => [
      ...prev,
      `[REPAIR_ENGINE] Allocating targeted workspace cells...`,
      `[REPAIR_ENGINE] Isolatng ${validationErrors.length} affected schema nodes...`
    ]);

    try {
      const response = await fetch("/api/repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          appSpec: activeSpec, 
          errors: validationErrors 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setActiveSpec(data.repairedSpec);
        setValidationErrors(data.validationErrors || []);
        setRepairActions(data.repairActions || []);
        
        setTerminalLogs(prev => [
          ...prev,
          `[REPAIR_ENGINE] Running isolated code surgery patches...`,
          ...data.repairActions.map((act: RepairAction) => `[REPAIR_PATCH] Apply '${act.repairType}': ${act.description}`),
          `[vOS] Executing secondary regression compiler verification lock...`,
          `[SUCCESS] Consistency reconciled. Zero conflicts remaining! Schema sealed green.`
        ]);
      } else {
        throw new Error(data.error || "Repair handler endpoint mismatch.");
      }
    } catch (err: any) {
      setTerminalLogs(prev => [
        ...prev,
        `[CRITICAL_FAILURE] Repair cycle aborted by engine: ${err.message}`
      ]);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl" id="repair-playground-dashboard">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Wrench className="text-emerald-400 w-5 h-5 animate-bounce" />
          <div>
            <h3 className="text-md font-semibold text-slate-100 font-sans tracking-tight">Validation & Targeted Repair Playground</h3>
            <p className="text-xs text-slate-400 leading-normal">Test the reliability engine by injecting deliberate errors and watching it heal only the faulty sections.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "none", label: "Restore Clean CRM", style: "border-slate-800 text-slate-400 hover:text-slate-200" },
            { key: "columns_mismatch", label: "Inject Columns Mismatch", style: "border-rose-900/35 text-rose-300 bg-rose-500/5 hover:bg-rose-500/10" },
            { key: "broken_bindings", label: "Inject Broken Binding", style: "border-rose-900/35 text-rose-300 bg-rose-500/5 hover:bg-rose-500/10" },
            { key: "rbac_conflict", label: "Inject RBAC Role Mismatch", style: "border-rose-905/35 text-rose-300 bg-rose-500/5 hover:bg-rose-500/10" }
          ].map((itm) => (
            <button
              key={itm.key}
              onClick={() => handleInjectDefect(itm.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                defectType === itm.key 
                  ? "bg-indigo-650 text-white border-indigo-500 shadow-md scale-[1.02]" 
                  : itm.style
              }`}
              id={`inject-${itm.key}`}
            >
              <Shuffle className="inline w-3 h-3 mr-1.5 shrink-0" />
              {itm.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Conflict Indicators & Live Validator Status */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-slate-950 rounded-lg p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-900">
              <span className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Live Validation Diagnostics
              </span>
              <span className={`text-[10px] uppercase font-bold font-mono px-2.5 py-1 rounded border ${
                validationErrors.length > 0 
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/25 animate-pulse" 
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
              }`}>
                {validationErrors.length > 0 ? `${validationErrors.length} Conflicts Active` : "Sealed Green"}
              </span>
            </div>

            {validationErrors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <CheckCircle className="w-10 h-10 text-emerald-400 mb-3" />
                <span className="text-xs font-semibold text-slate-300 font-sans">Reliability Engine Checked</span>
                <span className="text-[11px] text-slate-500 mt-1">Select an active schema conflict to trigger validation fail logs.</span>
              </div>
            ) : (
              <div className="space-y-4" id="validation-errors-stack">
                {validationErrors.map((err, idx) => (
                  <div key={idx} className="bg-rose-950/20 border border-rose-900/35 rounded-lg p-4" id={`val-err-ui-${idx}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-200 capitalize font-mono">Stage: {err.stage} ({err.type.replace(/_/g, ' ')})</span>
                    </div>
                    <p className="text-xs text-rose-200 leading-relaxed font-mono pl-6 border-l border-rose-900/40">
                      {err.message}
                    </p>
                    <div className="flex flex-wrap gap-x-4 pl-6 text-[10px] text-rose-400/80 mt-2 font-mono">
                      <span>Affected components: <strong className="text-slate-300 font-medium">{err.affectedNodes?.join(", ") || "N/A"}</strong></span>
                      {err.reference && <span>Target match: <strong className="text-indigo-300 font-medium">{err.reference}</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Trigger Block */}
          {validationErrors.length > 0 && (
            <button
              onClick={handleTriggerRepairEngine}
              disabled={isCompiling}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3.5 px-6 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-540 cursor-pointer border border-emerald-500"
              id="repair-engine-trigger"
            >
              {isCompiling ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Repairing & Aligning affected schemas...</span>
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4 animate-wrench" />
                  <span>Execute Targeted Schema Repair Engine ({validationErrors.length} patch cycles)</span>
                </>
              )}
            </button>
          )}

          {/* Repair Report List */}
          {repairActions.length > 0 && (
            <div className="bg-slate-950 rounded-lg p-5 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 font-mono block mb-3 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-emerald-400 font-semibold" />
                Targeted Surgery repair actions list
              </span>
              <div className="space-y-3 font-sans">
                {repairActions.map((act, index) => (
                  <div key={index} className="bg-emerald-950/20 border border-emerald-900/30 rounded p-3 flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-emerald-300 uppercase font-mono tracking-tight">{act.repairType}</div>
                      <div className="text-xs text-slate-300 leading-normal mt-1">{act.description}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">Node: {act.targetNode} | Schema: {act.targetSchema}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Compiler Console output logs */}
        <div className="lg:col-span-5 flex flex-col bg-slate-950 border border-slate-850 rounded-lg overflow-hidden min-h-[300px]" id="repair-console">
          <div className="bg-slate-900 px-4 py-2 border-b border-gray-850 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-400">VM Container Logs</span>
          </div>
          <div className="p-5 flex-1 overflow-y-auto font-mono text-xs space-y-3 max-h-[460px]">
            {terminalLogs.length === 0 ? (
              <div className="text-slate-650 italic text-center py-16 text-xs">
                Console offline. Select a defect schema mapping above to establish active connection.
              </div>
            ) : (
              terminalLogs.map((log, idx) => {
                let color = "text-slate-300";
                if (log.startsWith("[CRITICAL_ERRORS]")) color = "text-rose-400 font-semibold";
                if (log.startsWith("[SUCCESS]")) color = "text-emerald-400 font-semibold";
                if (log.startsWith("[REPAIR_PATCH]")) color = "text-indigo-300";
                if (log.startsWith("[REPAIR_ENGINE]")) color = "text-yellow-400";
                return (
                  <div key={idx} className={`${color} leading-relaxed flex gap-2`}>
                    <span className="text-slate-650 shrink-0 select-none">❯</span>
                    <span>{log}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
