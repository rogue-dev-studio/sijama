#!/usr/bin/env bash
set -euo pipefail

KEY_FILE="${HOME}/.ssh/sijama_deploy_key"

mkdir -p "${HOME}/.ssh"
chmod 700 "${HOME}/.ssh"

if [ -z "${SSH_PRIVATE_KEY:-}" ]; then
  echo "ERROR: SSH_PRIVATE_KEY CI variable is not set."
  exit 1
fi

if [ -f "${SSH_PRIVATE_KEY}" ]; then
  cp "${SSH_PRIVATE_KEY}" "${KEY_FILE}"
else
  printf '%s' "${SSH_PRIVATE_KEY}" | tr -d '\r' > "${KEY_FILE}"
fi

chmod 600 "${KEY_FILE}"

if ! ssh-keygen -y -f "${KEY_FILE}" >/dev/null 2>&1; then
  echo "ERROR: SSH_PRIVATE_KEY is invalid or truncated."
  echo "GitLab → Settings → CI/CD → Variables:"
  echo "  - Type: File (recommended) or Variable with full OpenSSH private key"
  echo "  - Include -----BEGIN ... PRIVATE KEY----- and -----END ... PRIVATE KEY-----"
  echo "  - No passphrase; regenerate with: ssh-keygen -t ed25519 -N '' -f deploy_key"
  exit 1
fi

if [ -n "${SSH_KNOWN_HOSTS:-}" ]; then
  printf '%s\n' "${SSH_KNOWN_HOSTS}" >> "${HOME}/.ssh/known_hosts"
  chmod 644 "${HOME}/.ssh/known_hosts"
fi

eval "$(ssh-agent -s)"
ssh-add "${KEY_FILE}"

export DEPLOY_SSH_KEY="${KEY_FILE}"
