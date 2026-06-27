# 🛠️ Project Skills

This directory contains skills documented for agents working on the project.
Each skill resides in its own subdirectory with a `SKILL.md` file.

The canonical skill registry is located in `.ia/project_manifest.yml` (`skills_registry` section).

## Available Skills

| Skill | Description |
|-------|-------------|
| `fluent-ui-react` | Patterns for React 19 and Fluent UI v9 (FluentProvider, makeStyles, BrandVariants) |
| `modern-linting` | Guide for Oxlint, Biome, and ls-lint as the project's exclusive toolchain |

## Adding a New Skill

1. Create `skills/<skill-name>/SKILL.md` following the format of existing skills.
2. Register the skill in `.ia/project_manifest.yml` → `skills_registry`.
