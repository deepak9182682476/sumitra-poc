#!/bin/bash
# Offline helper for Sumitra.
# 1. Finds matching code in the project (keywords you give, or chosen by the model with "auto").
# 2. Asks the local model for the change as a git diff.
# 3. Shows the diff and applies it ONLY if you type y.
#
# Usage:
#   ./ask-sumitra.sh "keyword1 keyword2" "what you want changed"
#   ./ask-sumitra.sh auto "what you want changed in plain words"
#
# Examples:
#   ./ask-sumitra.sh "border" "change the map border colour from blue to light blue"
#   ./ask-sumitra.sh auto "make the outline around the map light blue"

KEYWORDS="$1"
REQUEST="$2"
PROJECT="$HOME/Documents/Sunderban/bhuj_poc"
MAX_LINES=25
REPLY=/tmp/sumitra_reply.txt
PATCH=/tmp/sumitra_change.patch

if [ -z "$KEYWORDS" ] || [ -z "$REQUEST" ]; then
  echo 'Usage: ./ask-sumitra.sh "keyword1 keyword2" "what to change"  (or use auto instead of keywords)'
  exit 1
fi

cd "$PROJECT" || { echo "Project folder not found: $PROJECT"; exit 1; }

# If "auto", let the local model suggest code words for the request
if [ "$KEYWORDS" = "auto" ]; then
  KEYWORDS=$(ollama run sumitra "List 8 short words that would likely appear in source code for this request. Reply with the words only, separated by spaces, no other text. Request: $REQUEST" 2>/dev/null \
    | tr -cs 'A-Za-z0-9_' '\n' | grep -v '^$' | head -n 8 | paste -sd' ' -)
  if [ -z "$KEYWORDS" ]; then
    echo "The model did not suggest any search words. Try giving keywords yourself."
    exit 1
  fi
  echo "Search words chosen by the model: $KEYWORDS"
fi

# Turn "keyword1 keyword2" into the pattern "keyword1|keyword2"
PATTERN=$(echo "$KEYWORDS" | tr ' ' '\n' | grep -v '^$' | paste -sd'|' -)

# Search the code on this laptop (no internet needed)
MATCHES=$(grep -rniE "$PATTERN" application \
  --include='*.ts' --include='*.html' --include='*.scss' --include='*.css' --include='*.js' \
  --exclude-dir=node_modules --exclude-dir=.git --exclude='*.bak' --exclude='package-lock.json' \
  | cut -c1-160 | head -n "$MAX_LINES")

if [ -z "$MATCHES" ]; then
  echo "No code found for: $KEYWORDS"
  echo "Try different words, or give keywords yourself."
  exit 1
fi

echo "Matching lines:"
echo "$MATCHES"
echo
echo "Asking the local model for the change..."

PROMPT="Matching code lines (file:line:text). Paths start at the project root:
$MATCHES

Request: $REQUEST
Reply with ONLY a unified diff in git format (lines starting with --- and +++, paths like application/ui/src/...).
Change only what the request needs. Do not remove any other code."

ollama run sumitra "$PROMPT" > "$REPLY" 2>/dev/null

# Keep only the diff part (drop any text or code fences around it)
sed -n '/^--- /,$p' "$REPLY" | grep -v '^```' > "$PATCH"

if [ ! -s "$PATCH" ]; then
  echo "The model did not return a diff. Nothing was changed."
  echo "Its reply was:"
  cat "$REPLY"
  exit 1
fi

# Check the diff applies cleanly before showing it
if ! git apply --check "$PATCH" 2>/dev/null; then
  echo "The suggested change does not apply cleanly. Nothing was changed."
  echo "Its reply was:"
  cat "$REPLY"
  exit 1
fi

echo
echo "Proposed change:"
echo "----------------"
cat "$PATCH"
echo "----------------"
read -r -p "Apply this change? (y/N) " ANSWER
if [ "$ANSWER" = "y" ]; then
  git apply "$PATCH" && echo "Applied. To undo, run: git checkout -- <file>"
else
  echo "Not applied."
fi
