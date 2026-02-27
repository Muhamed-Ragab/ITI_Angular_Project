# AGENT_REVIEW_PROTOCOL.md

Global review instructions for coding agents. Apply these instructions before making code changes.

## Core rule

Review the plan thoroughly before making any code changes. For every issue or recommendation:

- Explain concrete tradeoffs.
- Give an opinionated recommendation.
- Ask for user input before assuming a direction.

## Engineering preferences

- DRY is important — flag repetition aggressively.
- Well-tested code is non-negotiable; prefer too many tests over too few.
- Aim for "engineered enough" solutions: avoid fragile hacks and avoid premature abstraction.
- Prefer handling more edge cases, not fewer; thoughtfulness over speed.
- Bias toward explicit over clever.

## Required review sections

### 1) Architecture review

Evaluate:
- Overall system design and component boundaries.
- Dependency graph and coupling concerns.
- Data flow patterns and potential bottlenecks.
- Scaling characteristics and single points of failure.
- Security architecture (auth, data access, API boundaries).

### 2) Code quality review

Evaluate:
- Code organization and module structure.
- DRY violations (aggressively).
- Error handling patterns and missing edge cases (call out explicitly).
- Technical debt hotspots.
- Over-engineered or under-engineered areas relative to preferences.

### 3) Test review

Evaluate:
- Test coverage gaps (unit, integration, e2e).
- Test quality and assertion strength.
- Missing edge-case coverage (be thorough).
- Untested failure modes and error paths.

### 4) Performance review

Evaluate:
- N+1 queries and database access patterns.
- Memory-usage concerns.
- Caching opportunities.
- Slow or high-complexity code paths.

## For each issue found

For every bug, smell, design concern, or risk:
- Describe the problem concretely, with file and line references.
- Present 2–3 options, including "do nothing" where reasonable.
- For each option, specify:
  - implementation effort,
  - risk,
  - impact on other code,
  - maintenance burden.
- Provide a recommended option and why, mapped to the preferences above.
- Explicitly ask whether the user agrees or wants a different direction before proceeding.

## Workflow and interaction

- Do not assume priorities for timeline or scale.
- After each section, pause and ask for feedback before moving on.

## Before starting

Ask the user to choose one mode:
1. **BIG CHANGE**: Interactive, one section at a time (Architecture → Code Quality → Tests → Performance), with at most 4 top issues per section.
2. **SMALL CHANGE**: Interactive, one question per review section.

## Output format rules per review stage

- For each stage, output explanation plus pros/cons of each stage question.
- Provide an opinionated recommendation and rationale.
- Number issues (Issue 1, Issue 2, ...).
- Label options by letters (A, B, C, ...).
- In user questions, clearly include issue number + option letter.
- Always list the recommended option first.
