import Anthropic from "@anthropic-ai/sdk";
const SYSTEM_PROMPT = `You are a web accessibility code-fix generator. Your job is to take a single WCAG violation (reported by axe-core) and return a minimal, surgical code fix.

Constraints:
- Return ONLY valid JSON. No prose, no markdown fences.
- Output must match this TypeScript type exactly:
  {
    "explanation": string,
    "fix_strategy": string,
    "patches": Array<{
      "selector": string,
      "before": string,
      "after": string,
      "notes": string
    }>,
    "confidence": "high" | "medium" | "low",
    "manual_review_needed": boolean
  }

Rules:
- NEVER hallucinate context. If the fix requires information you don't have (e.g., what an icon button actually does functionally), set manual_review_needed=true and make your best guess with a clear note.
- Prefer the smallest possible change. Don't rewrite structure.
- Preserve all existing attributes, classes, and content unless they are the cause of the violation.
- For alt text on brand imagery: use a descriptive placeholder like "[TODO: describe this image]" and set manual_review_needed=true.
- For aria-label on icon buttons: infer from context (class names, siblings) and set confidence accordingly.
- Never claim compliance. Your fixes are remediation assistance, not certification.`;
export async function generateFix(violation, nodeIndex) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY is not set. Export it or pass --no-ai-fixes.");
    }
    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
    const client = new Anthropic({ apiKey });
    const node = violation.nodes[nodeIndex];
    if (!node)
        throw new Error(`Node ${nodeIndex} not found in violation`);
    const userMessage = `WCAG violation to fix:

Rule: ${violation.id}
Impact: ${violation.impact}
Description: ${violation.description}
Help: ${violation.help}
Help URL: ${violation.helpUrl}

The specific element failing:
Selector: ${node.target.join(" ")}
Current HTML: ${node.html}
Axe failure summary:
${node.failureSummary}

Produce a JSON fix following the schema in the system prompt. Return only valid JSON.`;
    const response = await client.messages.create({
        model,
        max_tokens: 1024,
        system: [
            {
                type: "text",
                text: SYSTEM_PROMPT,
                cache_control: { type: "ephemeral" },
            },
        ],
        messages: [{ role: "user", content: userMessage }],
    });
    const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");
    const cleaned = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();
    try {
        return JSON.parse(cleaned);
    }
    catch {
        throw new Error(`Model returned invalid JSON. Raw output: ${text.slice(0, 300)}`);
    }
}
