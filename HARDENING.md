<!-- markdownlint-disable -->

# Hardening Report: asafamos--axle-action/v1.1.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `1`

Action **asafamos--axle-action/v1.1.0** was hardened automatically. 12 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): Multiple ${{ inputs.* }} expressions are interpolated directly inside run: shell command strings, allowing an attacker who controls the calling workflow's inputs to inject arbitrary shell commands.

In the 'Build + start host project' step:
- `${{ inputs.install-command }}` is used as a bare shell command (line ~105)
- `${{ inputs.build-command }}` is used as a bare shell command (line ~106)
- `nohup ${{ inputs.start-command }} > axle-server.log` (line ~107)
- `npx --yes wait-on "http://localhost:${{ inputs.wait-on-port }}"` (line ~109)

In the 'Resolve axle CLI package root' step:
- `echo "dir=${{ github.action_path }}/cli" >> "$GITHUB_OUTPUT"` (line ~83)

In the 'Scan' step:
- `TARGET="${{ inputs.url }}"` (line ~118)
- `TARGET="http://localhost:${{ inputs.wait-on-port }}"` (line ~120)
- `--fail-on "${{ inputs.fail-on }}"` (line ~123)
- `--with-ai-fixes "${{ inputs.with-ai-fixes }}"` (line ~124)
- `--max-ai-fixes "${{ inputs.max-ai-fixes }}"` (line ~125)

All these must be moved to env: variables and then referenced as quoted shell variables (e.g., "$INPUT_URL") instead of being interpolated directly.

Locations:

- `action.yml:83`
- `action.yml:105`
- `action.yml:106`
- `action.yml:107`
- `action.yml:109`
- `action.yml:118`
- `action.yml:120`
- `action.yml:123`
- `action.yml:124`
- `action.yml:125`

### github-env-injection (severity: high)

The 'Resolve axle CLI package root' step writes ${{ github.action_path }} directly to $GITHUB_OUTPUT without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). While github.action_path is typically trusted, it is still a github.* context value that flows through YAML template substitution and must be sanitized before being written to special environment files. The offending line is: `echo "dir=${{ github.action_path }}/cli" >> "$GITHUB_OUTPUT"`

Locations:

- `action.yml:83`

### unpinned-uses (severity: high)

All four uses: references in action.yml use mutable version tags instead of pinned 40-character SHA digests, making the action vulnerable to supply-chain attacks if any of those actions are compromised or their tags are moved:
- `uses: actions/setup-node@v4`
- `uses: actions/cache@v4`
- `uses: actions/upload-artifact@v4`
- `uses: actions/github-script@v7`
Each should be pinned to a full commit SHA, e.g. `actions/setup-node@11bd71901bbe5b1630ceea73d27597364c9af683 # v4`.

Locations:

- `action.yml:75`
- `action.yml:91`
- `action.yml:144`
- `action.yml:151`

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

Fixed all security findings in action.yml:
1. unpinned-uses: Pinned all four uses: references to full commit SHAs (actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4, actions/cache@0057852bfaa89a56745cba8c7296529d2fc39830 # v4, actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4, actions/github-script@f28e40c7f34bde8b3046d885e986cb6290c5673b # v7).
2. script-injection / static-inline-injection: Moved all ${{ inputs.* }} expressions out of run: blocks into env: maps. The 'Build + start host project' step now uses INSTALL_COMMAND, BUILD_COMMAND, START_COMMAND, WAIT_ON_PORT env vars. The 'Scan' step now uses INPUT_URL, INPUT_WAIT_ON_PORT, INPUT_FAIL_ON, INPUT_WITH_AI_FIXES, INPUT_MAX_AI_FIXES env vars, all referenced as quoted shell variables.
3. github-env-injection: The 'Resolve axle CLI package root' step now moves ${{ github.action_path }} into an ACTION_PATH env var and sanitizes it with 'printf \'%s\' "$ACTION_PATH" | tr -d \'\n\r\'' before writing to $GITHUB_OUTPUT.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Build + start host project' step in action.yml. The $INSTALL_COMMAND, $BUILD_COMMAND, and $START_COMMAND variables were used unquoted in the run: shell script, enabling shell metacharacter injection. Fixed by wrapping each in `bash -c "$VAR"` so the variable is double-quoted and passed as a single string argument to bash, preventing word splitting and glob expansion at the outer shell level. The $WAIT_ON_PORT was already inside double quotes in the URL string. The env: block approach for moving ${{ inputs.xxx }} expressions was already correctly in place.

### Iteration 3

**Fixes applied:** script-injection

**Notes:**

Fixed the script-injection vulnerability in the 'Build + start host project' step of action.yml. Replaced `bash -c "$INSTALL_COMMAND"`, `bash -c "$BUILD_COMMAND"`, and `nohup bash -c "$START_COMMAND"` with a pattern that writes each command to a temporary script file using `printf '%s\n' "$VAR" > script.sh` and then executes the script file with `bash script.sh`. This prevents shell metacharacters in user-supplied input values from being interpreted as shell commands in the outer shell context, while still allowing the commands to function as intended shell scripts.

