#!/bin/bash
set -e -o pipefail

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Accept build_id argument
if [[ $# -ne 1 ]]; then
    echo "Error: build_id argument is required"
    echo "Usage: $0 <build_id>"
    exit 1
fi

build_id="$1"

# Configuration
mkdir -p "${BUILD_DIR:?}"


echo "📦 Running production build with runtime configuration..."
# Disable mocking
export VITE_ENABLE_MSW="false"

# Build with placeholder values (will be replaced at runtime)
export VITE_API_BASE_URL="__RUNTIME_API_URL__"

yarn build

# Create tarball of dist folder
tar_file=${BUILD_DIR}/frontend-${build_id}.tar.gz

echo "🗜️  Compressing build artifacts..."
cd dist
tar -czf "../$tar_file" .
cd ..


echo "✅ Build artifacts created"
