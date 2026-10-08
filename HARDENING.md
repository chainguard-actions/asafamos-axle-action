<!-- markdownlint-disable -->

# Hardening Report: asafamos--axle-action/v1.0.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **asafamos--axle-action/v1.0.0** was hardened automatically. 12 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Multiple `${{ ... }}` expressions are interpolated directly inside `run:` shell command strings (sub-rule a), allowing script injection. In the 'Build + start host project' step, user-controlled inputs are executed verbatim as shell commands: `${{ inputs.install-command }}` (line 101), `${{ inputs.build-command }}` (line 102), `nohup ${{ inputs.start-command }}` (line 103), and `${{ inputs.wait-on-port }}` (line 105). In the 'Scan' step, `TARGET="${{ inputs.url }}"` (line 116), `TARGET="http://localhost:${{ inputs.wait-on-port }}"` (line 118), `--fail-on "${{ inputs.fail-on }}"` (line 122), `--with-ai-fixes "${{ inputs.with-ai-fixes }}"` (line 123), and `--max-ai-fixes "${{ inputs.max-ai-fixes }}"` (line 124) all embed inputs directly into the shell. In the 'Resolve axle CLI package root' step, `${{ github.action_path }}` is interpolated into a run: block (line 76). All these must be moved to `env:` variables and referenced as quoted shell variables.

Locations:

- `action.yml:76`
- `action.yml:101`
- `action.yml:102`
- `action.yml:103`
- `action.yml:105`
- `action.yml:116`
- `action.yml:118`
- `action.yml:122`
- `action.yml:123`
- `action.yml:124`

### github-env-injection (severity: high)

The 'Resolve axle CLI package root' step writes `${{ github.action_path }}` directly to `$GITHUB_OUTPUT` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`): `echo "dir=${{ github.action_path }}/cli" >> "$GITHUB_OUTPUT"`. Although `github.action_path` is typically GitHub-controlled, it is still a `github.*` context value and must be sanitized before being written to a special environment file per the check rules.

Locations:

- `action.yml:76`

### unpinned-uses (severity: high)

Four `uses:` references in action.yml use mutable version tags instead of full 40-character commit SHA digests, making the action vulnerable to supply-chain attacks if those tags are moved: `actions/setup-node@v4` (line 68), `actions/cache@v4` (line 84), `actions/upload-artifact@v4` (line 139), `actions/github-script@v7` (line 148). Each should be pinned to a full SHA, e.g. `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4`.

Locations:

- `action.yml:68`
- `action.yml:84`
- `action.yml:139`
- `action.yml:148`

### static-inline-injection (severity: high)

shell injection: expression "${{ inputs.install-command }}" appears directly in run: block of step "Build + start host project (when url is empty)"; move to env: map

Locations:

- `action.yml:111`

### static-inline-injection (severity: high)

shell injection: expression "${{ inputs.build-command }}" appears directly in run: block of step "Build + start host project (when url is empty)"; move to env: map

Locations:

- `action.yml:112`

### static-inline-injection (severity: high)

shell injection: expression "${{ inputs.start-command }}" appears directly in run: block of step "Build + start host project (when url is empty)"; move to env: map

Locations:

- `action.yml:113`

### static-inline-injection (severity: high)

shell injection: expression "${{ inputs.wait-on-port }}" appears directly in run: block of step "Build + start host project (when url is empty)"; move to env: map

Locations:

- `action.yml:115`

### static-inline-injection (severity: high)

shell injection: expression "${{ inputs.url }}" appears directly in run: block of step "Scan"; move to env: map

Locations:

- `action.yml:125`

### static-inline-injection (severity: high)

shell injection: expression "${{ inputs.wait-on-port }}" appears directly in run: block of step "Scan"; move to env: map

Locations:

- `action.yml:127`

### static-inline-injection (severity: high)

shell injection: expression "${{ inputs.fail-on }}" appears directly in run: block of step "Scan"; move to env: map

Locations:

- `action.yml:132`

### static-inline-injection (severity: high)

shell injection: expression "${{ inputs.with-ai-fixes }}" appears directly in run: block of step "Scan"; move to env: map

Locations:

- `action.yml:133`

### static-inline-injection (severity: high)

shell injection: expression "${{ inputs.max-ai-fixes }}" appears directly in run: block of step "Scan"; move to env: map

Locations:

- `action.yml:134`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, github-env-injection, static-inline-injection

**Notes:**

Fixed all findings in action.yml:

1. **unpinned-uses**: Pinned all 4 `uses:` references to full 40-char commit SHAs: actions/setup-node@49933ea5..., actions/cache@0057852b..., actions/upload-artifact@ea165f8d..., actions/github-script@f28e40c7...

2. **script-injection / static-inline-injection**: Moved all ${{ }} expressions from run: blocks to env: blocks. Command inputs (install-command, build-command, start-command) are written to temp files and executed with `bash -eo pipefail` to preserve errexit semantics. Single-value inputs (url, wait-on-port, fail-on, with-ai-fixes, max-ai-fixes) are referenced as quoted shell variables.

3. **github-env-injection**: The `github.action_path` value is placed in an `ACTION_PATH` env var and sanitized with `printf '%s' "$ACTION_PATH" | tr -d '\n\r'` before being written to $GITHUB_OUTPUT.

