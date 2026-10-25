# AI Tool Configuration

Generic, tool-agnostic configuration for AI-assisted development. Works with Claude Code, Cursor, and other AI tools.

## Structure

```
.ai/
├── rules/          # General guidelines (applied by default)
├── skills/         # Specialized tasks (invoked by name)
└── config.yaml     # Tool mappings & metadata
```

## Format

All files use a common YAML frontmatter + markdown body:

```yaml
---
name: rule-or-skill-name
type: rule | skill
description: Short description for discovery
trigger: Pattern when to auto-apply (rules only)
tools: [claude-code, cursor]  # Which tools support this
---

# Content
Detailed instructions or guidelines.
```

## Tool Integration

**Claude Code**: Use `Skill` tool to invoke by name, or reference in memory.

**Cursor**: Maps `.ai/rules/` to IDE rules, `.ai/skills/` to Cursor commands via `rules.yaml`.

**Generic AI**: Read `.ai/` files directly and apply based on `type` and `trigger`.

## Migration from `.cursor/`

Files converted from:
- `.cursor/rules/*.mdc` → `.ai/rules/*.md`
- `.cursor/skills/*/SKILL.md` → `.ai/skills/*.md`
