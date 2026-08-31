"use client";

import { useEffect } from "react";
import { registerCyfixTools } from "@/lib/webmcp";

/**
 * Registers Cyfix's WebMCP tools on every page, not just the dashboard.
 *
 * This matters for agent-first entry: an agent (or a judge using ChatGPT's
 * in-app browser) that opens the Cyfix landing page must be able to discover
 * `document.modelContext` tools immediately, without first knowing to
 * navigate to /app. `registerCyfixTools` is idempotent, so mounting this in
 * the root layout is safe alongside the dashboard's own call.
 */
export function WebMcpProvider() {
  useEffect(() => {
    registerCyfixTools();
  }, []);

  return null;
}
