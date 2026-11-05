# JurisdictionX

## Run the integrated demo

Start the backend in one terminal:

```bash
cd backend
npm install
STORE=file node src/server.js
```

Start the frontend in another terminal:

```bash
npm install
cp .env.example .env
npm run dev
```

The frontend uses `VITE_API_URL=http://localhost:3000` and sends the backend-required
`x-demo-user` header on every API request. Restart Vite after changing `.env`.

## Demo identities

The identity selector uses the exact demo IDs and backend roles from `backend/src/users.js`:

- `citizen1`, `citizen2` — citizen
- `officer-drainage` (`DEP_DRAIN`), `officer-roads` (`DEP_ROADS`),
  `officer-zone` (`DEP_ZONE`), `officer-sanitation` (`DEP_SANIT`),
  `officer-lighting` (`DEP_LIGHT`) — officer
- `admin` — admin

## Integration notes

- `POST /complaints` creates the complaint and runs the backend analysis pipeline in one request.
  There is no `/analyse` endpoint. The frontend consumes the returned complaint view directly.
- The backend's response fields and status values are retained; the UI renders
  `complaintId`, `analysis`, `recommendations`, `plan`, `tasks`, `timeline`, and the
  uppercase workflow statuses without rewriting backend results.
- API errors are surfaced to the user. The frontend does not silently substitute mock data.
- Complaint details and graph views are fetched from `/complaints/:id` and `/graph/:id`.
- Officer task actions use the backend acknowledge, handover, and resolve routes.
- Admin analytics use the backend's `totals`, `byStatus`, `bottlenecks`, and
  `syntheticHandoversIncluded` response.

The backend workflow, jurisdiction rules, data, and response format are intentionally unchanged.
