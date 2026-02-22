#!/bin/bash

set -e -o pipefail

if [[ -f .env ]]; then
    set -a
    source .env
    set +a
fi

export BUILD_DIR="build-artifacts"

function build-id-to-s3-uri() {
  build_id=$1
  echo "s3://${ARTIFACT_BUCKET:?}/frontend/frontend-${build_id}.tar.gz"
}
