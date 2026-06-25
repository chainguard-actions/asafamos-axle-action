import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
function resolveAxeScript() {
    // Resolve axe-core from the published npm package, wherever it's installed.
    const axePath = require.resolve("axe-core/axe.min.js");
    return readFileSync(axePath, "utf-8");
}
export async function scanUrl(url) {
    if (!/^https?:\/\//i.test(url)) {
        throw new Error("URL must start with http:// or https://");
    }
    let browser = null;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            userAgent: "Mozilla/5.0 (axle/0.1; +https://axle.dev/bot)",
            viewport: { width: 1280, height: 800 },
        });
        const page = await context.newPage();
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        const title = await page.title();
        const axeSource = resolveAxeScript();
        await page.addScriptTag({ content: axeSource });
        const axeResults = await page.evaluate(async () => {
            // @ts-expect-error axe is injected at runtime
            return await window.axe.run(document, {
                runOnly: {
                    type: "tag",
                    values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
                },
                resultTypes: ["violations", "incomplete", "passes"],
            });
        });
        const violations = (axeResults.violations || []);
        const summary = {
            critical: violations.filter((v) => v.impact === "critical").length,
            serious: violations.filter((v) => v.impact === "serious").length,
            moderate: violations.filter((v) => v.impact === "moderate").length,
            minor: violations.filter((v) => v.impact === "minor").length,
        };
        return {
            url,
            scannedAt: new Date().toISOString(),
            title,
            violations,
            passes: (axeResults.passes || []).length,
            incomplete: (axeResults.incomplete || []).length,
            summary,
        };
    }
    finally {
        if (browser)
            await browser.close();
    }
}
