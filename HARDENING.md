<!-- markdownlint-disable -->

# Hardening Report: asafamos--axle-action/v1.1.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **asafamos--axle-action/v1.1.0** was hardened automatically. 14 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): Multiple `${{ inputs.* }}` expressions are interpolated directly inside `run:` shell command strings in the 'Build + start host project' step. The inputs `install-command`, `build-command`, `start-command`, and `wait-on-port` are substituted verbatim into the shell before execution, allowing an attacker who controls those inputs to inject arbitrary shell commands. For example: `${{ inputs.install-command }}`, `${{ inputs.build-command }}`, `nohup ${{ inputs.start-command }} > axle-server.log 2>&1 &`, and `npx --yes wait-on "http://localhost:${{ inputs.wait-on-port }}" --timeout 90000`. These must be moved to `env:` variables and then double-quoted in the shell.

Locations:

- `action.yml:100`

### script-injection (severity: high)

Sub-rule (a): Multiple `${{ inputs.* }}` expressions are interpolated directly inside the `run:` shell command string in the 'Scan' step. The inputs `url`, `wait-on-port`, `fail-on`, `with-ai-fixes`, and `max-ai-fixes` are substituted verbatim into the shell before execution. Offending lines include: `TARGET="${{ inputs.url }}"`, `TARGET="http://localhost:${{ inputs.wait-on-port }}"`, `--fail-on "${{ inputs.fail-on }}"`, `--with-ai-fixes "${{ inputs.with-ai-fixes }}"`, `--max-ai-fixes "${{ inputs.max-ai-fixes }}"`. These must be moved to `env:` variables and then double-quoted in the shell.

Locations:

- `action.yml:113`

### script-injection (severity: high)

Sub-rule (a): `${{ github.action_path }}` is interpolated directly inside the `run:` shell command string in the 'Resolve axle CLI package root' step: `echo "dir=${{ github.action_path }}/cli" >> "$GITHUB_OUTPUT"`. Although `github.action_path` is GitHub-controlled, any `${{ ... }}` expression inside a `run:` block is a script-injection finding per the check rules. It should be replaced with the `$GITHUB_ACTION_PATH` environment variable.

Locations:

- `action.yml:79`

### github-env-injection (severity: high)

The 'Resolve axle CLI package root' step writes `${{ github.action_path }}` directly to `$GITHUB_OUTPUT` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). The line `echo "dir=${{ github.action_path }}/cli" >> "$GITHUB_OUTPUT"` performs a direct unsanitized write of a GitHub context value to the special environment file, which could allow newline injection into `$GITHUB_OUTPUT`.

Locations:

- `action.yml:79`

### unpinned-uses (severity: high)

All four `uses:` references in action.yml use mutable version tags instead of immutable 40-character SHA digests, making the action vulnerable to supply-chain attacks if any of those upstream actions are compromised or their tags are moved. Failing references: `actions/setup-node@v4`, `actions/cache@v4`, `actions/upload-artifact@v4`, `actions/github-script@v7`. Each should be pinned to a full SHA commit hash (e.g. `actions/setup-node@11bd71901bbe5b1630ceea73d27597364c9af683 # v4`).

Locations:

- `action.yml:74`
- `action.yml:87`
- `action.yml:138`
- `action.yml:146`

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

**Fixes applied:** unpinned-uses, script-injection, static-inline-injection, github-env-injection

**Notes:**

Fixed all findings in hardened/action/action.yml:
1. Pinned all four uses: references to full commit SHAs (setup-node, cache, upload-artifact, github-script).
2. Replaced ${{ github.action_path }} with $GITHUB_ACTION_PATH env var in the 'Resolve axle CLI package root' step, and added printf/tr sanitization before writing to $GITHUB_OUTPUT to fix both script-injection and github-env-injection.
3. Moved all ${{ inputs.install-command }}, ${{ inputs.build-command }}, ${{ inputs.start-command }}, ${{ inputs.wait-on-port }} expressions to an env: block in the 'Build + start host project' step, referencing them as shell env vars.
4. Moved all ${{ inputs.url }}, ${{ inputs.wait-on-port }}, ${{ inputs.fail-on }}, ${{ inputs.with-ai-fixes }}, ${{ inputs.max-ai-fixes }} expressions to an env: block in the 'Scan' step, referencing them as shell env vars.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed the script injection vulnerability in the 'Build + start host project' step of action.yml. The three environment variables sourced from user-controlled inputs (`$INPUT_INSTALL_COMMAND`, `$INPUT_BUILD_COMMAND`, `$INPUT_START_COMMAND`) were previously expanded unquoted, allowing shell metacharacters to achieve arbitrary command execution. All three are now double-quoted: `"$INPUT_INSTALL_COMMAND"`, `"$INPUT_BUILD_COMMAND"`, and `"$INPUT_START_COMMAND"` (lines 108-110).

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Build + start host project' step where INPUT_INSTALL_COMMAND, INPUT_BUILD_COMMAND, and INPUT_START_COMMAND were executed directly as shell commands (e.g. `"$INPUT_INSTALL_COMMAND"`), allowing command injection. Replaced with xargs-based tokenization: each command string is parsed into a bash array using `printf '%s' "$VAR" | xargs printf '%s\0'` with a NUL-delimited read loop, then executed as `"${array[@]}"`. This preserves argument boundaries and quoting while preventing injection of shell metacharacters (`;`, `|`, `&&`, `$()`, backticks, etc.), since xargs does not evaluate them — they are passed as literal argument text. Each tokenization is guarded with `if [ -n "$VAR" ]` to avoid empty-argument issues.

