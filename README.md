# axle — Accessibility Compliance CI

Scan every PR for WCAG 2.1 / 2.2 AA violations, optionally generate AI code fixes with Claude, and comment inline.

## Quick start

```yaml
# .github/workflows/accessibility.yml
name: Accessibility
on: pull_request

permissions:
  contents: read
  pull-requests: write

jobs:
  axle:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: asafamos/axle-action@v1
        with:
          url: https://preview-${{ github.event.pull_request.number }}.mydomain.dev
          fail-on: serious
          with-ai-fixes: "true"
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

## How it works

1. Spins up a cached headless Chromium via Playwright.
2. Runs axe-core 4.11 against the target URL with the WCAG 2.1 / 2.2 AA rule sets.
3. If `with-ai-fixes` is on and you supplied an `ANTHROPIC_API_KEY`, generates a focused diff per violation using Claude Sonnet.
4. Writes a JSON report, a markdown report, and an artifact you can download from the run.
5. Posts (and updates in place) one comment on the triggering PR with the findings.
6. Exits non-zero when violations meet or exceed `fail-on`, which blocks merge if you require the check.

## Inputs

| Input | Default | Notes |
|------|---------|-------|
| `url` | _(empty)_ | URL to scan. Leave empty to build + start your Node project on `localhost:3000`. |
| `fail-on` | `serious` | `critical` / `serious` / `moderate` / `minor` / `none` |
| `with-ai-fixes` | `"false"` | Requires `anthropic-api-key`. Capped by `max-ai-fixes`. |
| `max-ai-fixes` | `10` | Cost guard. |
| `anthropic-api-key` | | Store in repo secrets. |
| `anthropic-model` | `claude-sonnet-4-6` | |
| `comment-on-pr` | `"true"` | Disable to run silently. |
| `github-token` | `github.token` | Needs `pull-requests: write` to comment. |
| `install-command` / `build-command` / `start-command` / `wait-on-port` | `npm ci` / `npm run build` / `npm start` / `3000` | Used only when `url` is empty. |

## Outputs

- `json-path` — full scan report (JSON).
- `markdown-path` — PR-style markdown report.
- `failing` — `"true"` / `"false"` at the threshold.

## Not a compliance certificate

axle provides remediation assistance, not a compliance certificate. Automated checks (axe-core) catch roughly 57% of WCAG issues. Manual human review is still recommended for full conformance.

## Privacy

This Action contacts Chainguard's licensing server to verify authorization. Connection metadata (IP address, GitHub repository identifier, timestamp, and any metadata encoded in the auth token) is transmitted to Chainguard, Inc. even if authorization is denied in accordance with our [Privacy Notice](https://www.chainguard.dev/legal/privacy-notice)
