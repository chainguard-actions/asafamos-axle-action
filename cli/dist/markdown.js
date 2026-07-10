const IMPACT_EMOJI = {
    critical: "🔴",
    serious: "🟠",
    moderate: "🟡",
    minor: "🔵",
};
export function renderMarkdown(result, fixes, failing, failOn) {
    const total = result.violations.reduce((s, v) => s + v.nodes.length, 0);
    const header = failing
        ? `### ❌ Accessibility check failed (${failOn}+)`
        : total === 0
            ? `### ✅ No accessibility violations detected`
            : `### ⚠️ Accessibility issues below the \`${failOn}\` threshold`;
    const summaryLine = `**${result.violations.length}** rule${result.violations.length === 1 ? "" : "s"} · **${total}** element${total === 1 ? "" : "s"} · ${result.summary.critical} critical · ${result.summary.serious} serious · ${result.summary.moderate} moderate · ${result.summary.minor} minor`;
    const scannedLine = `Scanned \`${result.url}\` at ${result.scannedAt}`;
    if (result.violations.length === 0) {
        return [
            header,
            "",
            scannedLine,
            "",
            `_axe-core automated checks catch roughly 57% of WCAG issues. Manual review still recommended._`,
            "",
            `<sub>Powered by [axle](https://axle.dev) · Remediation assistance, not compliance certification.</sub>`,
        ].join("\n");
    }
    const sections = result.violations.map((v) => renderViolation(v, fixes));
    return [
        header,
        "",
        summaryLine,
        "",
        scannedLine,
        "",
        ...sections,
        "---",
        `<sub>Powered by [axle](https://axle.dev) · Remediation assistance, not compliance certification.</sub>`,
    ].join("\n");
}
function renderViolation(v, fixes) {
    const impact = v.impact ?? "minor";
    const badge = `${IMPACT_EMOJI[impact] ?? "•"} **${impact}**`;
    const nodes = v.nodes.slice(0, 5);
    const overflow = v.nodes.length - nodes.length;
    const nodeBlocks = nodes.map((n, i) => {
        const key = `${v.id}-${i}`;
        const fix = fixes.get(key);
        const selectorLine = `\`${n.target.join(" ")}\``;
        const html = "```html\n" + n.html + "\n```";
        if (!fix)
            return [selectorLine, html].join("\n");
        const confidence = `${fix.confidence.toUpperCase()} confidence${fix.manual_review_needed ? " · ⚠️ manual review needed" : ""}`;
        const patches = fix.patches
            .map((p) => [
            `<details><summary>Suggested fix</summary>`,
            "",
            `**Why:** ${fix.explanation}`,
            ``,
            `**Strategy:** ${fix.fix_strategy}`,
            ``,
            `\`\`\`diff`,
            `- ${p.before}`,
            `+ ${p.after}`,
            `\`\`\``,
            p.notes ? `> ${p.notes}` : "",
            `</details>`,
        ]
            .filter(Boolean)
            .join("\n"))
            .join("\n\n");
        return [selectorLine, html, `_${confidence}_`, patches].join("\n\n");
    });
    const overflowLine = overflow > 0 ? `\n_…and ${overflow} more element(s)_` : "";
    return [
        `#### ${badge} · ${v.help}`,
        ``,
        `Rule: \`${v.id}\` · [WCAG reference](${v.helpUrl})`,
        ``,
        v.description,
        ``,
        ...nodeBlocks,
        overflowLine,
        ``,
    ].join("\n");
}
