export interface IntentIR {
  entities: string[];
  features: string[];
  workflows: { name: string; steps: string[] }[];
  roles: string[];
  permissions: { role: string; actions: string[] }[];
  billing: { plans: string[]; features: string[] };
  integrations: string[];
  assumptions: string[];
  ambiguities: string[];
  missingInfo: string[];
}

export interface DomainModel {
  name: string;
  fields: { name: string; type: string; isPrimary?: boolean; isNullable?: boolean; isUnique?: boolean }[];
  relationships: { target: string; type: 'one-to-many' | 'many-to-one' | 'one-to-one' | 'many-to-many'; field: string }[];
}

export interface SystemDesignSpec {
  domainModels: DomainModel[];
  serviceBoundaries: { name: string; endpoints: string[]; responsibility: string }[];
  frontendArchitecture: { pattern: string; stateManagement: string; responsiveGrid: boolean };
  backendArchitecture: { framework: string; database: string; validationLib: string };
  accessControlMatrix: { role: string; entity: string; actions: ('create' | 'read' | 'update' | 'delete')[] }[];
  workflowGraph: { id: string; source: string; target: string; condition?: string }[];
  stateManagementRules: { sliceName: string; fields: string[]; triggerEvents: string[] }[];
}

export interface DbTable {
  name: string;
  columns: { name: string; type: string; constraints?: string[]; isIndexed?: boolean }[];
  relations: { column: string; referencesTable: string; referencesColumn: string }[];
  indexes?: string[];
  migrations?: string[];
}

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requestParams?: Record<string, string>;
  requestBodySchema?: Record<string, any>;
  responseContract: Record<string, any>;
  authRequirements: { rbac: string[]; scope?: string };
  errorContracts: { statusCode: number; payload: Record<string, string> }[];
}

export interface UiPage {
  route: string;
  layout: 'sidebar' | 'dashboard' | 'auth' | 'minimal';
  components: { name: string; type: 'form' | 'table' | 'chart' | 'card' | 'list'; bindings: string[]; permissions?: string[] }[];
  visibilityPermissions?: string[];
  loadingState?: string;
  errorState?: string;
}

export interface AuthRoleRule {
  role: string;
  permissions: string[];
  routeGuards: string[];
  apiGuards: string[];
  premiumGating: boolean;
}

export interface DatabaseSchema {
  tables: DbTable[];
}

export interface ApiSchema {
  endpoints: ApiEndpoint[];
}

export interface UiSchema {
  pages: UiPage[];
}

export interface AuthSchema {
  rolesConfig: AuthRoleRule[];
}

export interface ApplicationSpecification {
  databaseSchema: DatabaseSchema;
  apiSchema: ApiSchema;
  uiSchema: UiSchema;
  authSchema: AuthSchema;
}

export interface ValidationError {
  id: string;
  stage: 'database' | 'api' | 'ui' | 'auth' | 'cross-consistency';
  type: 'type_mismatch' | 'broken_reference' | 'missing_key' | 'invalid_json' | 'permission_conflict' | 'orphan_route' | 'invalid_workflow';
  message: string;
  field?: string;
  reference?: string;
  affectedNodes?: string[];
}

export interface RepairAction {
  targetNode: string;
  targetSchema: 'database' | 'api' | 'ui' | 'auth';
  repairType: string;
  description: string;
  result: 'success' | 'failed';
}

export interface ExecutionReport {
  runtimeStatus: 'success' | 'failed' | 'running';
  validationPassRate: number;
  executionErrors: string[];
  containerLogs: string[];
}

export interface EvalMetric {
  promptName: string;
  category: 'saas' | 'edge';
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  latencyMs?: number;
  retries?: number;
  repairSuccessRate?: number;
  schemaFailureRate?: number;
  runtimeFailureRate?: number;
  tokenCostEstimate?: number;
  outputSpec?: {
    intentIR?: IntentIR;
    systemDesign?: SystemDesignSpec;
    appSpec?: ApplicationSpecification;
  };
}

export interface CompilerLog {
  id: string;
  timestamp: string;
  stage: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}
