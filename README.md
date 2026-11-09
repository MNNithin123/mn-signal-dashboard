# MN Signal Real Estate Lead Dashboard

A Next.js dashboard for viewing real-estate leads from Notion. It supports a public fictional demo mode first, with an optional server-side Notion connection that can be enabled later in Vercel settings.

## Dashboard routes

- `/` — original dashboard with its Notion live-mode integration.
- `/crm` — refreshed CRM-style workspace preview with overview metrics, searchable lead directory, lead profile drawer, visual sales pipeline, and an automation blueprint.

The `/crm` page starts in fictional Indian-market demo mode and can be switched to a read-only Notion data source. It includes overview metrics, a searchable lead directory, clickable lead profiles, enquiry messages, a visual sales pipeline, and an automation blueprint. It does not write to Notion or claim that Make.com is connected. The original dashboard remains available at `/`.

## What the original dashboard does

- **Demo mode:** works without credentials and uses fictional records only.
- **Notion mode:** reads leads through a server-side API route. Notion secrets are never included in browser code.
- **Basic access gate for live mode:** once either Notion environment variable is configured, the whole site requires HTTP Basic Authentication using `DASHBOARD_USERNAME` and `DASHBOARD_PASSWORD`.
- **No silent fallback:** if Notion mode is selected and the connection fails, the dashboard shows an error instead of presenting demo records as live data.

The basic password gate is suitable only as a simple single-workspace MVP. It is not a full multi-user authentication system or multi-tenant client-isolation system.

## Local development

1. Install Node.js LTS.
2. Open a terminal in the folder containing `package.json`.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:3000` for the original dashboard or `http://localhost:3000/crm` for the refreshed CRM preview.

Run `npm run typecheck` and `npm run build` to check the project before deployment.

## Connect Notion later

1. Create an internal integration in Notion and keep its secret private.
2. Share the leads database with the integration.
3. Share the correct Notion data source with the integration. Add `NOTION_API_KEY`, `NOTION_DATABASE_ID` (the data source ID queried by the SDK), `DASHBOARD_USERNAME`, and `DASHBOARD_PASSWORD` as server-side environment variables.
4. Test access and field mapping with sample records before using customer data.

Never commit `.env.local`, tokens, passwords, or real customer records. Do not put a Notion token in a `NEXT_PUBLIC_...` variable.
