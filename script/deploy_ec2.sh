#!/usr/bin/env bash
set -euo pipefail

required_vars=(EC2_HOST KAMAL_REGISTRY_USERNAME KAMAL_REGISTRY_PASSWORD RAILS_MASTER_KEY)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required environment variable: ${var_name}" >&2
    exit 1
  fi
done

export KAMAL_REGISTRY_IMAGE="${KAMAL_REGISTRY_IMAGE:-ghcr.io/${KAMAL_REGISTRY_USERNAME}/stick-skater}"
export KAMAL_REGISTRY_SERVER="${KAMAL_REGISTRY_SERVER:-ghcr.io}"
export EC2_SSH_USER="${EC2_SSH_USER:-ubuntu}"

bin/kamal setup
bin/kamal deploy
