#!/bin/bash
set -e

# Script to generate react-native-tvos patch from source files
# Creates a git repo with the clean package, applies modifications, and uses
# git diff to produce a patch in the format patch-package expects.
#
# Note: patch-package's own generation doesn't work with Yarn 4 (Berry),
# so we produce the patch manually in the correct format.
#
# patch-package expects paths like:
#   diff --git a/node_modules/react-native/path/to/file b/node_modules/react-native/path/to/file
# because it applies patches relative to the project root.

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACKAGE_NAME="react-native-tvos@0.83.2-0"
PATCH_FILE="$PROJECT_ROOT/patches/react-native+0.83.2-0.patch"
PATCH_SOURCE_DIR="$PROJECT_ROOT/patch-sources/${PACKAGE_NAME}"
NODE_MODULES_PREFIX="node_modules/react-native"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "React Native tvOS Patch Generator"
echo "===================================="
echo ""

# Check if patch-sources directory exists
if [ ! -d "$PATCH_SOURCE_DIR" ]; then
    echo -e "${RED}Error: Patch source directory not found: $PATCH_SOURCE_DIR${NC}"
    exit 1
fi

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

echo -e "${YELLOW}Step 1:${NC} Downloading clean package from npm..."

(cd "$TEMP_DIR" && npm pack react-native-tvos@0.83.2-0 --quiet > /dev/null 2>&1)
(cd "$TEMP_DIR" && tar -xzf react-native-tvos-0.83.2-0.tgz)
CLEAN_DIR="$TEMP_DIR/package"

if [ ! -d "$CLEAN_DIR" ]; then
    echo -e "${RED}Error: Failed to extract clean package${NC}"
    exit 1
fi

echo -e "${GREEN}Done${NC}"
echo ""

# Step 2: Set up a temporary structure matching node_modules layout
echo -e "${YELLOW}Step 2:${NC} Setting up temporary git repo..."

WORK_DIR="$TEMP_DIR/work"
mkdir -p "$WORK_DIR/$NODE_MODULES_PREFIX"

# Copy clean package into the node_modules structure
cp -R "$CLEAN_DIR/"* "$WORK_DIR/$NODE_MODULES_PREFIX/"

(cd "$WORK_DIR" && git init -q && git add -A && git commit -q -m "clean" --no-gpg-sign)

echo -e "${GREEN}Done${NC}"
echo ""

# Step 3: Copy modified files over the clean ones
echo -e "${YELLOW}Step 3:${NC} Copying modified files..."

find "$PATCH_SOURCE_DIR" -type f ! -name ".DS_Store" | sort | while read -r modified_file; do
    REL_PATH="${modified_file#$PATCH_SOURCE_DIR/}"
    TARGET_FILE="$WORK_DIR/$NODE_MODULES_PREFIX/$REL_PATH"

    if [ -f "$TARGET_FILE" ]; then
        cp "$modified_file" "$TARGET_FILE"
        echo "  Modified: $REL_PATH"
    else
        echo -e "  ${YELLOW}Warning: Original file not found: $REL_PATH${NC}"
    fi
done

echo -e "${GREEN}Done${NC}"
echo ""

# Step 4: Generate the patch using git diff
echo -e "${YELLOW}Step 4:${NC} Generating patch..."

mkdir -p "$PROJECT_ROOT/patches"
(cd "$WORK_DIR" && git diff --no-color) > "$PATCH_FILE"

# Check if patch file was created and has content
if [ ! -s "$PATCH_FILE" ]; then
    echo -e "${YELLOW}Warning: No differences found. Patch file is empty.${NC}"
    rm -f "$PATCH_FILE"
    exit 0
fi

echo -e "${GREEN}Done${NC}"
echo ""

# Show patch stats
FILES=$(grep -c "^diff --git" "$PATCH_FILE" 2>/dev/null || echo "0")
ADDITIONS=$(grep -c "^+" "$PATCH_FILE" 2>/dev/null || echo "0")
DELETIONS=$(grep -c "^-" "$PATCH_FILE" 2>/dev/null || echo "0")

echo "Patch generated successfully: $PATCH_FILE"
echo ""
echo "Statistics:"
echo "  Files modified: $FILES"
echo "  Lines added:   ~$ADDITIONS"
echo "  Lines removed: ~$DELETIONS"
echo ""
echo "Next steps:"
echo "  1. Review the patch: less $PATCH_FILE"
echo "  2. Apply with:       yarn"
echo "  3. Rebuild native:   yarn prebuild:tv && yarn ios"
