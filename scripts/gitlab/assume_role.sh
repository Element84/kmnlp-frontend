#!/bin/bash

##################################################
# Assume AWS role and export related env variables
##################################################

set -e -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$SCRIPT_DIR/../common.sh"

CREDS=$(
  aws sts assume-role \
    --role-arn "${DEPLOY_ROLE_ARN:?}" \
    --role-session-name "git-lab-integration-tests"
)
AWS_ACCESS_KEY_ID=$(echo "$CREDS" | jq -r '.Credentials.AccessKeyId')
AWS_SECRET_ACCESS_KEY=$(echo "$CREDS" | jq -r '.Credentials.SecretAccessKey')
AWS_SESSION_TOKEN=$(echo "$CREDS" | jq -r '.Credentials.SessionToken')
AWS_SESSION_EXPIRATION_TIME=$(echo "$CREDS" | jq -r '.Credentials.Expiration')

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN

echo "Access key id: $AWS_ACCESS_KEY_ID"
echo "Current time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "Session expiration time: $AWS_SESSION_EXPIRATION_TIME"
