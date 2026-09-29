<!-- markdownlint-disable -->

# Hardening Report: asafamos--axle-action/v1.1.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **asafamos--axle-action/v1.1.0** was hardened automatically. 12 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All four `uses:` references in action.yml use mutable tag refs instead of pinned 40-character SHA digests, making the action vulnerable to supply-chain attacks if the referenced action tags are moved or compromised. Failing references: `actions/setup-node@v4`, `actions/cache@v4`, `actions/upload-artifact@v4`, `actions/github-script@v7`.

Locations:

- `action.yml:68`
- `action.yml:83`
- `action.yml:120`
- `action.yml:130`

### script-injection (severity: high)

Rule (a): Multiple `${{ inputs.* }}` and `${{ github.* }}` expressions are interpolated directly inside `run:` shell command strings, allowing an attacker-controlled value to inject arbitrary shell commands.

**Step "Resolve axle CLI package root"**: `echo "dir=${{ github.action_path }}/cli" >> "$GITHUB_OUTPUT"` — `${{ github.action_path }}` is interpolated directly into the shell command.

**Step "Build + start host project"**: The entire install, build, and start commands are interpolated directly as shell code:
```
${{ inputs.install-command }}
${{ inputs.build-command }}
nohup ${{ inputs.start-command }} > axle-server.log 2>&1 &
npx --yes wait-on "http://localhost:${{ inputs.wait-on-port }}" --timeout 90000
```
Any of these inputs can contain shell metacharacters or arbitrary commands.

**Step "Scan"**: Multiple inputs are interpolated directly into the shell:
```
TARGET="${{ inputs.url }}"
TARGET="http://localhost:${{ inputs.wait-on-port }}"
--fail-on "${{ inputs.fail-on }}"
--with-ai-fixes "${{ inputs.with-ai-fixes }}"
--max-ai-fixes "${{ inputs.max-ai-fixes }}"
```
All of these allow injection of shell metacharacters before the shell ever parses the string.

Locations:

- `action.yml:76`
- `action.yml:96`
- `action.yml:97`
- `action.yml:98`
- `action.yml:99`
- `action.yml:105`
- `action.yml:107`
- `action.yml:111`
- `action.yml:112`
- `action.yml:113`

### github-env-injection (severity: high)

The "Resolve axle CLI package root" step writes `${{ github.action_path }}` directly to `$GITHUB_OUTPUT` without first sanitizing the value with `printf '%s' ... | tr -d '\n\r'`. Although `github.action_path` is typically controlled by GitHub, it is still a github context value and must be sanitized before being written to a special environment file. The offending line is:
```
echo "dir=${{ github.action_path }}/cli" >> "$GITHUB_OUTPUT"
```
A newline embedded in the value could inject additional key=value pairs into `$GITHUB_OUTPUT`.

Locations:

- `action.yml:76`

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

- `action.yml:131`

### static-inline-injection (severity: high)

shell injection: expression "${{ inputs.with-ai-fixes }}" appears directly in run: block of step "Scan"; move to env: map

Locations:

- `action.yml:132`

### static-inline-injection (severity: high)

shell injection: expression "${{ inputs.max-ai-fixes }}" appears directly in run: block of step "Scan"; move to env: map

Locations:

- `action.yml:133`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, github-env-injection, static-inline-injection

**Notes:**

Fixed all 12 findings in action.yml:

1. **unpinned-uses**: Pinned all 4 action references to full SHA digests with tag comments: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4, actions/cache@0057852bfaa89a56745cba8c7296529d2fc39830 # v4, actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4, actions/github-script@f28e40c7f34bde8b3046d885e986cb6290c5673b # v7.

2. **github-env-injection**: Moved `${{ github.action_path }}` to an `env:` block as `ACTION_PATH`, then sanitized with `printf '%s' "$ACTION_PATH" | tr -d '\n\r'` before writing to `$GITHUB_OUTPUT`.

3. **script-injection / static-inline-injection**: All `${{ inputs.* }}` expressions moved to `env:` blocks. For the 'Build + start host project' step, the command-list inputs (install-command, build-command, start-command) are tokenized using the xargs/while-read-d-null bash array pattern to preserve argument boundaries and prevent injection. The wait-on-port and all Scan step inputs (url, fail-on, with-ai-fixes, max-ai-fixes) are referenced as plain environment variables in the shell scripts.

