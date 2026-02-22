#!/bin/bash

####################################################################################################
# Pushes the artifact version file to the kmnlp-infrastructure rep.
####################################################################################################

set -e -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../common.sh"

# Accept build_id argument
if [[ $# -ne 1 ]]; then
    echo "Error: build_id argument is required"
    echo "Usage: $0 <build_id>"
    exit 1
fi

build_id="$1"


# Path to the artifact version file in the kmnlp-infrastructure project
artifact_version_file=configs/artifact_versions/frontend.yaml

mkdir -p temp
cd temp

git clone "https://gitlab-ci-token:${INFRA_GITLAB_TOKEN:?}@${CI_SERVER_HOST:?}/noaa_km_nlp/kmnlp-infrastructure.git"

cd kmnlp-infrastructure
target_branch=main

git checkout "$target_branch"

s3_uri=$(build-id-to-s3-uri "$build_id")

cat > "$artifact_version_file" <<EOF
# Generated automatically by the front-end build.
# From commit: ${CI_COMMIT_SHA:?}
artifact_s3_uri: ${s3_uri}
EOF

git config user.email "kmnlp-eng@element84.com"
git config user.name "GitLab Auto-Update CD Job"

git add "$artifact_version_file"
git commit -m "Automated update of frontend artifact uri"
git push origin "$target_branch"
