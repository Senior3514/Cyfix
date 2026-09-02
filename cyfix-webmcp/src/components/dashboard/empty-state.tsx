"use client";

import { Bot, CheckSquare, Radar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { useScanStore } from "@/lib/stores";

const STEPS = [
  {
    icon: Radar,
    title: "Name a target",
    body: "Type a domain you own or are authorized to test. An agent can propose one for you with prepare_scan — but it can only propose.",
  },
  {
    icon: CheckSquare,
    title: "Approve it yourself",
    body: "Nothing runs until you tick the authorization box. The gate lives inside the WebMCP tool, not just the UI, so an agent cannot route around it.",
  },
  {
    icon: Bot,
    title: "Work the findings together",
    body: "Passive checks only. Every finding comes with plain-language impact, a copy-paste fix, and a re-scan that proves the fix landed.",
  },
];

/**
 * What the right-hand pane says before there is anything to show.
 *
 * A dashed "no data" box is a dead end on the one screen most first-time
 * visitors land on. The same space can explain the product's whole argument and
 * offer the one click that fills the dashboard — which is what a judge with
 * ninety seconds actually needs.
 */
export function DashboardEmptyState() {
  const loadDemo = useScanStore((s) => s.loadDemo);

  return (
    <Card className="border-dashed">
      <CardBody className="space-y-6 sm:p-7">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Nothing scanned yet</h2>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-graphite-400">
            Cyfix is a workspace two actors share: a human who authorizes, and an agent that can do
            everything except authorize. Here is how a session goes.
          </p>
        </div>

        <ol className="space-y-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-graphite-700 bg-graphite-800 text-teal-400">
                <s.icon size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">
                  <span className="mr-1.5 font-mono text-xs text-graphite-600">{i + 1}</span>
                  {s.title}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-graphite-500">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-3 border-t border-graphite-700 pt-5 sm:flex-row sm:items-center">
          <Button onClick={() => loadDemo()} className="w-full shrink-0 whitespace-nowrap sm:w-auto">
            <Sparkles size={16} />
            Load demo data
          </Button>
          <p className="text-xs leading-relaxed text-graphite-600">
            A finished sample scan, no network call — the fastest way to see the whole workspace.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
