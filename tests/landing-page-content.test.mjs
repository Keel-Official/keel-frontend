import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const riskPanel = readFileSync(
  new URL("../components/marketing/risk-evidence-panel.tsx", import.meta.url),
  "utf8",
);

test("landing page tells the quoted-price versus liquidity story", () => {
  for (const phrase of [
    "Price is not liquidity.",
    "What Keel measures",
    "No mystery score. Every flag can be inspected.",
    "A known incident, replayed as evidence.",
    "See the market behind the price.",
  ]) {
    assert.match(page, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(page, /A price is only as credible as the/);
  assert.match(page, /<em>liquidity<\/em> behind it\./);
});

test("landing page preserves read-only and uncertainty language", () => {
  assert.match(page, /Read-only/);
  assert.match(riskPanel, /Not evaluated/);
  assert.match(riskPanel, /Partial data never means clear data/);
  assert.match(page, /never signs or submits/);
});

test("document includes Keel metadata and reduced-motion support", () => {
  assert.match(layout, /Keel \| Liquidity risk intelligence for Stellar/);
  assert.match(layout, /openGraph/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});

test("document does not require a remote font fetch to build", () => {
  assert.doesNotMatch(layout, /next\/font\/google/);
});
