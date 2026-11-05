# JurisdictionX backend (2-day, solo-friendly build)

Zero-dependency Node 20+ project. The same `handle()` router runs locally (`src/server.js`) and on AWS behind
API Gateway (`src/lambda.js`). Storage is behind a tiny interface (memory / file / DynamoDB).
All departments, localities and ownership records in `data/graph.json` are **SYNTHETIC** — replace with verified records.

## Run locally (no AWS needed)
```
node scripts/demo.js          # full scripted scenario: submit -> analyse -> approve -> handovers -> escalation -> verify
node scripts/gold-eval.js     # accuracy on data/gold.json (N=14 now; grow to 30-50)
STORE=file node src/server.js # API on :3000 (CORS open). Auth = header  x-demo-user: citizen1 | officer-drainage | officer-roads | officer-zone | officer-sanitation | officer-lighting | admin
STORE=file node scripts/seed-history.js   # ~50 SYNTHETIC historical handovers for the dashboard (flagged synthetic)
```

## API (what the frontend needs)
| Method | Path | Who |
|---|---|---|
| POST | /complaints  `{description, locality?, evidenceKeys?[]}` | citizen/admin |
| GET | /complaints , /complaints/:id | role-filtered |
| POST | /complaints/:id/approve-routing | officer (in plan) / admin |
| POST | /complaints/:id/manual-route `{assignments:[{key,title,department,dependsOn?[]}]}` | admin (NEEDS_TRIAGE only) |
| POST | /complaints/:id/verify `{confirmed:boolean, note?}` | complainant |
| POST | /tasks/:id/acknowledge , /resolve `{evidence}` , /handover `{reason, ownershipEvidence?}` | assigned dept officer |
| POST | /tasks/:id/reassign `{toDepartment}` | admin |
| GET | /graph/:complaintId  -> `{nodes,edges}` | role-filtered |
| GET | /admin/analytics ; POST /admin/run-escalations | admin |

Statuses: SUBMITTED, ANALYZED, PENDING_APPROVAL, NEEDS_TRIAGE, ROUTED, IN_PROGRESS, PENDING_VERIFICATION, RESOLVED, DISPUTED.
Task statuses: BLOCKED, READY, ACKNOWLEDGED, DONE, OWNERSHIP_DISPUTED.

## Safety rules enforced in code (not just prompts)
- Candidates come only from verified asset records in the graph; no record => `NEEDS_TRIAGE` + "Insufficient verified information...".
- Locality must match a known graph location; the model can't invent one.
- Every status change goes through `transition()` (legal moves + audit log).
- Escalation is only a *recommendation* with a configured (not invented) window: `ESCALATION_SECONDS`.

## Deploy to AWS with the CLI  (UNTESTED on a real account — run scripts/smoke-test.sh first)
Works under restricted lab accounts because it creates no IAM roles: it reuses `LabRole`. Replace <ACCOUNT_ID>/<REGION>.
```
bash scripts/smoke-test.sh
bash scripts/create-tables.sh                       # jx-complaints, jx-tasks, jx-handovers, jx-audit
zip -r function.zip src data package.json
aws lambda create-function --function-name jx-api --runtime nodejs22.x --handler src/lambda.handler \
  --role arn:aws:iam::<ACCOUNT_ID>:role/LabRole --zip-file fileb://function.zip --timeout 30 --memory-size 512 \
  --environment "Variables={STORE=dynamo,ESCALATION_SECONDS=90,USE_BEDROCK=0}"
aws apigatewayv2 create-api --name jx-api --protocol-type HTTP \
  --target arn:aws:lambda:<REGION>:<ACCOUNT_ID>:function:jx-api        # note ApiEndpoint + ApiId in the output
aws lambda add-permission --function-name jx-api --statement-id apigw --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:<REGION>:<ACCOUNT_ID>:<API_ID>/*"
curl <ApiEndpoint>/health                           # -> {"ok":true,"store":"dynamo"}
# redeploy after code changes:
aws lambda update-function-code --function-name jx-api --zip-file fileb://function.zip
```
Bedrock (only after you confirm model access in the console): set env `USE_BEDROCK=1`, `BEDROCK_MODEL_ID=<id shown in console>`,
optionally `BEDROCK_REGION`. On any Bedrock error the analyzer falls back to rules and records `analysis.fallbackReason`.

Escalation timer on AWS: create a second function with handler `src/lambda.escalationHandler` and an EventBridge rule
`rate(1 minute)`; if EventBridge is blocked in your lab, press `POST /admin/run-escalations` during the recording.

## Next (not built yet)
Step Functions wrapper (Analyze -> GraphLookup -> Choice -> WaitForApproval...), S3 presigned evidence uploads, Cognito, SNS.
`runPipeline()` steps in src/workflow.js map 1:1 to the intended states.
