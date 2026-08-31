export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type FindingCategory =
  | "transport"
  | "headers"
  | "cookies"
  | "exposure"
  | "disclosure";

export interface Finding {
  id: string;
  category: FindingCategory;
  title: string;
  severity: Severity;
  description: string;
  impact: string;
  evidence?: string;
  passed: boolean;
}

export interface ScanResult {
  id: string;
  domain: string;
  startedAt: string;
  finishedAt: string;
  score: number;
  findings: Finding[];
  isDemo?: boolean;
}

export type AuditActor = "human" | "agent";

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: AuditActor;
  tool: string;
  input: Record<string, unknown>;
  summary: string;
  ok: boolean;
}

export interface ToolResult<T = unknown> {
  ok: boolean;
  message: string;
  data?: T;
}

export interface RemediationSnippet {
  label: string;
  language: string;
  code: string;
}

export interface FindingExplanation {
  explanation: string;
  remediation: string;
  snippets: RemediationSnippet[];
}
