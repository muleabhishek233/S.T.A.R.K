import { EvalMetric } from "../types";

export interface SystemPrompt {
  id: string;
  name: string;
  category: "saas" | "edge";
  description: string;
  promptText: string;
}

export const SAAS_PROMPTS: SystemPrompt[] = [
  {
    id: "crm-suite",
    name: "Enterprise CRM Suite",
    category: "saas",
    description: "CRM with role-based login, client contacts directory, deal pipeline, subscriptions, payments, and admin analytics.",
    promptText: "Build a CRM with login, contacts, dashboard, role-based access, subscriptions, payments, and admin analytics."
  },
  {
    id: "kanban-pms",
    name: "Agile Project Board (Trello-like)",
    category: "saas",
    description: "Interactive Kanban boards, tasks, comment feeds, upload attachments, and team ownership matrix.",
    promptText: "Build a project management board with custom Kanban cards, comments, drag-and-drop state updates, file attachment uploads, and team member roles with deadlined priorities."
  },
  {
    id: "ecom-checkout",
    name: "E-Commerce Market with Inventory Sync",
    category: "saas",
    description: "Product directory with rich search filters, persistent checkout cart, and Stripe payment processor.",
    promptText: "Build an e-commerce platform with a responsive catalog, comprehensive search/filtering, shopping cart, stripe checkout forms, automated inventory synchronization, and seller dashboard profiles."
  },
  {
    id: "lms-subscription",
    name: "SaaS Learning Management System",
    category: "saas",
    description: "Premium course hosting platform with lecture playlists, lesson progress logs, quiz mechanics, and paywalls.",
    promptText: "Build a modular subscription-based LearnSaaS LMS with dynamic video lecture playlists, student quiz modules, instructor management dashboard, coupon promotionals, and Stripe membership paywalls."
  },
  {
    id: "support-desk",
    name: "Customer SLA Ticketing Hub",
    category: "saas",
    description: "Ticketing platform with assignment queues, age reminders, predefined answers, and satisfaction index rating tables.",
    promptText: "Build a support customer desk with ticketing systems, live assignment queues, SLA limit reminders, automated response templates, and automated metric-driven CSAT surveys."
  },
  {
    id: "ai-copie",
    name: "Generative Copywriter Hub",
    category: "saas",
    description: "LLM-powered prompt generator featuring preset layouts, history lists, character context cards, and PDF report exporters.",
    promptText: "Build an AI content generator and templates suite with history logs, user session profiles, token credit billing, PDF formatting exports, and custom persona options."
  },
  {
    id: "finance-tracker",
    name: "Personal Wealth Ledger with Charting",
    category: "saas",
    description: "Monetary flow ledger featuring custom categorization, budgets, statement parsers, and interactive line-charts.",
    promptText: "Build a personal finance tracker with income/expense logging, categorization managers, dynamic charts, text statement upload parser, budget cap alerts, and automated recurring ledger entries."
  },
  {
    id: "re-listings",
    name: "Real Estate Map Directory",
    category: "saas",
    description: "Property listings portal integrated with geocoding searches, scheduler calendars, and live agent cards.",
    promptText: "Build a real estate marketplace with geographical lists, geocoding searches, interactive schedules, meeting calendar forms, and professional agent directory cards."
  },
  {
    id: "telehealth-portal",
    name: "Patient Telehealth Portal",
    category: "saas",
    description: "Appointment dashboards, virtual calendar schedulers, online prescription sheets, and patient history logs.",
    promptText: "Build a secure telehealth system with patient login vaults, virtual doctor scheduler, online prescription forms, medical history logs, and instant patient-doctor chat screens."
  },
  {
    id: "fitness-coach",
    name: "Personal Coach Client Planner",
    category: "saas",
    description: "Personal client workout planner, macronutrient charts, streak trackers, progress uploads, and trainer cards.",
    promptText: "Build a coaching planner with workout schedules, heart-rate chart feeds, photo upload vaults, daily macronutrient charts, calorie burn calculators, and secure chat with trainer lists."
  }
];

export const EDGE_PROMPTS: SystemPrompt[] = [
  {
    id: "vague-audit",
    name: "Vague Security Logger",
    category: "edge",
    description: "Underspecified specifications asking for random logs with no definitions or state logic.",
    promptText: "Do some security logs sometimes. Maybe let people log in, not sure."
  },
  {
    id: "roles-conflict",
    name: "Circular/Conflicting Permissions Matrix",
    category: "edge",
    description: "Contradictory roles where security auditors cannot access files but only admins can, who are nested circular.",
    promptText: "Configure admin accounts to block full security logs access, but let security staff edit active admin rosters if they hold nested admin ranks."
  },
  {
    id: "billing-contradict",
    name: "Contradictory Billing & Paywalls",
    category: "edge",
    description: "Asks for fully free features but forces paid gateway integrations during initial workflows.",
    promptText: "Provide all system tiers completely free forever for all accounts of any scale, but enforce strict card checkout requirements at initial logins."
  },
  {
    id: "circular-workflow",
    name: "Infinite Loop Escalations Graph",
    category: "edge",
    description: "Workflows where states cycle infinitely without exits, requiring a non-existing reviewer.",
    promptText: "Configure support escalations where reviews trigger state checks which recursively execute reviews infinitely unless verified by a supreme supervisor."
  },
  {
    id: "orphan-table",
    name: "Orphaned Datastores Schema",
    category: "edge",
    description: "Isolated table schema requiring lookups on related indices but explicitly forbidding relations.",
    promptText: "Create a separate isolated inventory table with zero direct relations to order data, but calculate user histories based on inventories."
  },
  {
    id: "infinite-guard",
    name: "Recursive Security Route Guard",
    category: "edge",
    description: "Access conditions where entering login triggers a redirect check for active log state.",
    promptText: "To access the login page, you must have an active session logged in. To establish a session, you must load the login page."
  },
  {
    id: "missing-entity",
    name: "Lacking Relational Entity Structures",
    category: "edge",
    description: "Builds a full clinic bed tracker but fails to document any patient or item structures.",
    promptText: "Build a full hospital ICU inventory tracker but do not define what a clinical patient, ICU bed, or medical card is."
  },
  {
    id: "premature-process",
    name: "Out-of-Order Webhook Checkout",
    category: "edge",
    description: "Billing hooks running calculations before keys are authorized, using undefined coupons.",
    promptText: "Execute payment checks prior to Stripe initializing customer tokens, and issue free credits if coupon has value, but do not ask for card inputs."
  },
  {
    id: "bloated-converter",
    name: "Super-Tenant Weight Converter",
    category: "edge",
    description: "Asks for a basic conversion layout but heavily over-specifies extreme enterprise specifications.",
    promptText: "Create a basic weight and metric converter app, but build it with multi-tenant Single Sign-On, payment access tiers, and user audits."
  },
  {
    id: "silent-error",
    name: "200 OK False Error System",
    category: "edge",
    description: "Server API forbids standard status responses, demanding failures return success structures.",
    promptText: "Ensure all server API routing paths always return 200 OK status codes on db offline, but require browser client to show errors."
  }
];

export const INITIAL_EVAL_METRICS: Record<string, EvalMetric> = {};

[...SAAS_PROMPTS, ...EDGE_PROMPTS].forEach((p) => {
  INITIAL_EVAL_METRICS[p.id] = {
    promptName: p.name,
    category: p.category,
    description: p.description,
    status: "idle"
  };
});
