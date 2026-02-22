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

# Create tarball of dist folder
tar_file=${BUILD_DIR}/frontend-${build_id}.tar.gz

echo "🪣 Uploading to artifacts bucket"
s3_uri=$(build-id-to-s3-uri "$build_id")
aws s3 cp "${tar_file}" "$s3_uri"

echo "✅ Build artifacts created and uploaded to S3"
