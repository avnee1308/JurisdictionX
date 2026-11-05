#!/usr/bin/env bash
# Creates the 4 DynamoDB tables with the AWS CLI (no IaC, works under restricted lab accounts).
set -euo pipefail
for t in complaints tasks handovers audit; do
  aws dynamodb create-table --table-name "jx-$t" \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST >/dev/null && echo "created jx-$t" || echo "jx-$t: already exists or failed (see error above)"
done
