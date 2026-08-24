#!/usr/bin/env bash
# Sync .agents/skills/* into IDE/agent skill directories (symlinks).
# Run after adding or renaming a skill: npm run skills:sync
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="$ROOT/.agents/skills"

TARGETS=(
  ".cursor/skills"
  ".claude/skills"
  ".trae/skills"
  ".devin/skills"
  ".github/skills"
)

if [[ ! -d "$SOURCE" ]]; then
  echo "Missing source directory: $SOURCE" >&2
  exit 1
fi

link_skills() {
  local target_rel="$1"
  local target="$ROOT/$target_rel"
  mkdir -p "$target"

  # Remove stale symlinks pointing at old skill names
  shopt -s nullglob
  for entry in "$target"/*; do
    [[ -L "$entry" ]] || continue
    if [[ ! -e "$entry" ]]; then
      rm -f "$entry"
    fi
  done
  shopt -u nullglob

  local count=0
  for skill_dir in "$SOURCE"/*/; do
    [[ -f "${skill_dir}SKILL.md" ]] || continue
    local name
    name="$(basename "$skill_dir")"
    ln -sfn "../../.agents/skills/$name" "$target/$name"
    count=$((count + 1))
  done

  echo "Linked $count skills -> $target_rel"
}

echo "Syncing skills from .agents/skills/"
for target_rel in "${TARGETS[@]}"; do
  link_skills "$target_rel"
done
echo "Done."
