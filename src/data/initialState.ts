import { ApplicationSpecification, IntentIR, SystemDesignSpec, CompilerLog, ExecutionReport } from "../types";

export const INITIAL_INTENT: IntentIR = {
  entities: ["User", "Contact", "Deal", "Payment", "Subscription", "AuditLog"],
  features: [
    "Secure user log-on & user sessions",
    "Customer contact directories with smart fulltext searches & tags",
    "Sales pipelines deal lifecycle grids",
    "Role permissions levels (Admins, SalesAgent, Viewer)",
    "Payment integration via Stripe and subscription paywalls",
    "KPI analytics reports dashboards"
  ],
  workflows: [
    { name: "Convert Lead to Client Contact", steps: ["Verify lead credentials", "Upgrade status", "Initiate active Deal profile"] },
    { name: "Stripe Webhook Delivery Access", steps: ["Receive pay hook", "Decrypt stripe signature", "Acknowledge plan status", "Record logs"] }
  ],
  roles: ["Admin", "SalesAgent", "Viewer"],
  permissions: [
    { role: "Admin", actions: ["manage_users", "access_all_deals", "view_financials", "write_settings"] },
    { role: "SalesAgent", actions: ["own_contacts", "edit_contacts", "create_deals", "update_deals"] },
    { role: "Viewer", actions: ["read_contacts", "read_deals"] }
  ],
  billing: {
    plans: ["Free Trial Tiers", "Solo Agent Pro ($29/mo)", "Enterprise Network ($99/mo)"],
    features: ["All access metrics", "Automated email sequences", "Custom API export channels"]
  },
  integrations: ["Stripe Webhooks", "OAuth Schedulers", "SendGrid templates"],
  assumptions: ["All calculations default to standard EUR/USD configurations", "Database logs are retained for active periods"],
  ambiguities: ["How is deal assigned ownership resolved during Agent transfers?"],
  missingInfo: ["Should contact archives be completely removed on delete requests?"]
};

export const INITIAL_DESIGN: SystemDesignSpec = {
  domainModels: [
    {
      name: "User",
      fields: [
        { name: "id", type: "UUID", isPrimary: true },
        { name: "email", type: "VARCHAR(255)", isUnique: true },
        { name: "role_id", type: "UUID" },
        { name: "joined_at", type: "TIMESTAMP" }
      ],
      relationships: [
        { target: "Contact", type: "one-to-many", field: "assigned_contacts" }
      ]
    },
    {
      name: "Contact",
      fields: [
        { name: "id", type: "UUID", isPrimary: true },
        { name: "first_name", type: "VARCHAR(128)" },
        { name: "last_name", type: "VARCHAR(128)" },
        { name: "email", type: "VARCHAR(255)" },
        { name: "company", type: "VARCHAR(255)", isNullable: true },
        { name: "agent_id", type: "UUID" }
      ],
      relationships: [
        { target: "User", type: "many-to-one", field: "assigned_agent" },
        { target: "Deal", type: "one-to-many", field: "deals" }
      ]
    }
  ],
  serviceBoundaries: [
    { name: "GateService", endpoints: ["POST /api/auth/login"], responsibility: "Session lifecycle locks" },
    { name: "ClientRegistryService", endpoints: ["GET /api/contacts", "POST /api/contacts"], responsibility: "Manage client database contacts details" }
  ],
  frontendArchitecture: { pattern: "Sidebar Navigation Grid", stateManagement: "Zustand Global state hooks", responsiveGrid: true },
  backendArchitecture: { framework: "Express Controller Engine", database: "PostgreSQL Database Stack", validationLib: "Zod Schema Rules" },
  accessControlMatrix: [
    { role: "Admin", entity: "Contact", actions: ["create", "read", "update", "delete"] },
    { role: "SalesAgent", entity: "Contact", actions: ["create", "read", "update"] }
  ],
  workflowGraph: [
    { id: "wf-1", source: "AuthGuard", target: "AppView" }
  ],
  stateManagementRules: [
    { sliceName: "authStore", fields: ["token", "role"], triggerEvents: ["login_fulfilled"] }
  ]
};

export const INITIAL_SPEC: ApplicationSpecification = {
  databaseSchema: {
    tables: [
      {
        name: "users",
        columns: [
          { name: "id", type: "UUID", constraints: ["PRIMARY KEY", "DEFAULT gen_random_uuid()"] },
          { name: "email", type: "VARCHAR(255)", constraints: ["NOT NULL", "UNIQUE"] },
          { name: "role", type: "VARCHAR(64)", constraints: ["NOT NULL", "DEFAULT 'Viewer'"] },
          { name: "joined_at", type: "TIMESTAMP", constraints: ["NOT NULL", "DEFAULT NOW()"] }
        ],
        relations: []
      },
      {
        name: "contacts",
        columns: [
          { name: "id", type: "UUID", constraints: ["PRIMARY KEY", "DEFAULT gen_random_uuid()"] },
          { name: "first_name", type: "VARCHAR(128)", constraints: ["NOT NULL"] },
          { name: "last_name", type: "VARCHAR(128)", constraints: ["NOT NULL"] },
          { name: "email", type: "VARCHAR(255)", constraints: ["NOT NULL"] },
          { name: "company", type: "VARCHAR(255)", constraints: ["NULL"] },
          { name: "agent_id", type: "UUID", constraints: ["NOT NULL"] }
        ],
        relations: [
          { column: "agent_id", referencesTable: "users", referencesColumn: "id" }
        ],
        indexes: ["idx_contacts_email", "idx_contacts_agent_id"]
      },
      {
        name: "deals",
        columns: [
          { name: "id", type: "UUID", constraints: ["PRIMARY KEY", "DEFAULT gen_random_uuid()"] },
          { name: "contact_id", type: "UUID", constraints: ["NOT NULL"] },
          { name: "deal_title", type: "VARCHAR(255)", constraints: ["NOT NULL"] },
          { name: "deal_value", type: "DECIMAL(12,2)", constraints: ["NOT NULL", "DEFAULT 0.0"] },
          { name: "deal_stage", type: "VARCHAR(64)", constraints: ["NOT NULL"] }
        ],
        relations: [
          { column: "contact_id", referencesTable: "contacts", referencesColumn: "id" }
        ]
      }
    ]
  },
  apiSchema: {
    endpoints: [
      {
        path: "/api/auth/login",
        method: "POST",
        requestBodySchema: { email: { type: "string" }, password: { type: "string" } },
        responseContract: { token: "jwt_token_string", user: { email: "string", role: "string" } },
        authRequirements: { rbac: [] },
        errorContracts: [{ statusCode: 401, payload: { error: "Authentication failed" } }]
      },
      {
        path: "/api/contacts",
        method: "GET",
        responseContract: { contacts: [{ id: "string", first_name: "string", last_name: "string", email: "string", company: "string" }] },
        authRequirements: { rbac: ["Admin", "SalesAgent", "Viewer"] },
        errorContracts: [{ statusCode: 403, payload: { error: "Access Denied" } }]
      },
      {
        path: "/api/contacts",
        method: "POST",
        requestBodySchema: { first_name: { type: "string" }, last_name: { type: "string" }, email: { type: "string" }, company: { type: "string" } },
        responseContract: { id: "string", first_name: "string", last_name: "string" },
        authRequirements: { rbac: ["Admin", "SalesAgent"] },
        errorContracts: [{ statusCode: 400, payload: { error: "Validation Mismatch" } }]
      }
    ]
  },
  uiSchema: {
    pages: [
      {
        route: "/login",
        layout: "auth",
        components: [
          { name: "LoginForm", type: "form", bindings: ["/api/auth/login"] }
        ]
      },
      {
        route: "/dashboard",
        layout: "dashboard",
        components: [
          { name: "StatsSummary", type: "card", bindings: ["/api/contacts"] },
          { name: "ContactsTable", type: "table", bindings: ["/api/contacts"] },
          { name: "ContactCreateDialog", type: "form", bindings: ["/api/contacts"] }
        ]
      }
    ]
  },
  authSchema: {
    rolesConfig: [
      {
        role: "Admin",
        permissions: ["create_contact", "read_contact", "update_contact", "delete_contact", "administrate_users"],
        routeGuards: ["/dashboard", "/settings", "/admin"],
        apiGuards: ["/api/contacts", "/api/users"],
        premiumGating: true
      },
      {
        role: "SalesAgent",
        permissions: ["create_contact", "read_contact", "update_contact"],
        routeGuards: ["/dashboard"],
        apiGuards: ["/api/contacts"],
        premiumGating: false
      }
    ]
  }
};

export const INITIAL_LOGS: CompilerLog[] = [
  { id: "log-init-1", timestamp: new Date().toISOString(), stage: "Launcher", type: "info", message: "Compiler core container bootstrapped cleanly." },
  { id: "log-init-2", timestamp: new Date().toISOString(), stage: "Launcher", type: "success", message: "Default CRM specification pre-loaded dynamically into workspace viewport." }
];

export const INITIAL_REPORT: ExecutionReport = {
  runtimeStatus: "success",
  validationPassRate: 100,
  executionErrors: [],
  containerLogs: [
    `[vOS] Host Hypervisor initialized successfully.`,
    `[vOS] Pre-loaded database migration: OK (users, contacts, deals created)`,
    `[vOS] Mounted auth gates & access control matrices: success`,
    `[vOS] Dynamic routes integrated correctly.`
  ]
};
